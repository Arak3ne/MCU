import { supabase } from "./supabase";
import type { Database } from "../types/supabase";
import type { PlayoffMatchInsert } from "./bracket";

type Champion = Database["public"]["Tables"]["champions"]["Row"];

export async function getPlayers() {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("pseudo", { ascending: true });

  return { data: data as Database["public"]["Tables"]["players"]["Row"][] | null, error };
}

export async function getChampions() {
  const { data, error } = await supabase
    .from("champions")
    .select("*, champion_roles(role)")
    .order("name");

  // Fallback for environments where the relation isn't exposed in PostgREST
  if (error) {
    const fallback = await supabase
      .from("champions")
      .select("*")
      .order("name");
    return { data: fallback.data as Champion[] | null, error: fallback.error };
  }

  const normalizedData = (data ?? []).map((champion: any) => {
    const relationRoles = Array.isArray(champion.champion_roles)
      ? champion.champion_roles
          .map((entry: { role?: string | null }) => entry?.role)
          .filter((role: string | null | undefined): role is string => !!role)
      : [];
    const directRoles = Array.isArray(champion.roles) ? champion.roles : [];

    return {
      ...champion,
      roles: relationRoles.length > 0 ? relationRoles : directRoles,
    };
  });

  return { data: normalizedData as Champion[] | null, error: null };
}

export async function toggleChampion(id: string, isAvailable: boolean) {
  const { data, error } = await supabase
    .from("champions")
    .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
    .eq("id", id);

  return { data, error };
}

export async function updateTeamStats(teamId: string, updates: { wins: number; losses: number; points: number }) {
  const { data, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", teamId);
  return { data, error };
}

type TeamRow = Database["public"]["Tables"]["teams"]["Row"];
type PlayoffRow = Database["public"]["Tables"]["playoff_matches"]["Row"];

function mergeTeamsOntoPlayoffRows(rows: PlayoffRow[], teamRows: TeamRow[] | null): any[] {
  const byId = new Map((teamRows ?? []).map((t) => [t.id, t]));
  const fallback = (pid: string | null): TeamRow | null =>
    pid
      ? ({
          id: pid,
          name: "Équipe inconnue",
          wins: 0,
          losses: 0,
          points: 0,
        } as TeamRow)
      : null;

  return rows.map((m) => ({
    ...m,
    team1: m.team1_id ? byId.get(m.team1_id) ?? fallback(m.team1_id) : null,
    team2: m.team2_id ? byId.get(m.team2_id) ?? fallback(m.team2_id) : null,
  }));
}

/** All playoff matches + team rows (two queries; avoids fragile PostgREST embeds). */
export async function fetchPlayoffMatches() {
  const { data: rows, error } = await supabase
    .from("playoff_matches")
    .select("*")
    .order("stage", { ascending: false })
    .order("round", { ascending: true })
    .order("match_order", { ascending: true });

  if (error) return { data: null, error };
  if (!rows?.length) return { data: [] as any[], error: null };

  const idSet = new Set<string>();
  for (const m of rows) {
    if (m.team1_id) idSet.add(m.team1_id);
    if (m.team2_id) idSet.add(m.team2_id);
  }
  const ids = [...idSet];

  if (ids.length === 0) {
    return {
      data: rows.map((m) => ({
        ...m,
        team1: null as TeamRow | null,
        team2: null as TeamRow | null,
      })),
      error: null,
    };
  }

  const { data: teamRows, error: teamsError } = await supabase.from("teams").select("*").in("id", ids);

  if (teamsError) return { data: null, error: teamsError };

  return { data: mergeTeamsOntoPlayoffRows(rows, teamRows), error: null };
}

/** Championship-only (lighter than loading all playoff rows). */
export async function fetchChampionshipMatchesHydrated() {
  const { data: rows, error: matchesError } = await supabase
    .from("playoff_matches")
    .select("*")
    .eq("stage", "championship")
    .order("round", { ascending: true })
    .order("match_order", { ascending: true });

  if (matchesError) return { data: null, error: matchesError };
  if (!rows?.length) return { data: [] as any[], error: null };

  const idSet = new Set<string>();
  for (const m of rows) {
    if (m.team1_id) idSet.add(m.team1_id);
    if (m.team2_id) idSet.add(m.team2_id);
  }
  const ids = [...idSet];

  if (ids.length === 0) {
    return {
      data: rows.map((m) => ({
        ...m,
        team1: null,
        team2: null,
      })),
      error: null,
    };
  }

  const { data: teamRows, error: teamsError } = await supabase.from("teams").select("*").in("id", ids);

  if (teamsError) return { data: null, error: teamsError };

  return { data: mergeTeamsOntoPlayoffRows(rows, teamRows), error: null };
}

export async function generatePlayoffMatches(matches: PlayoffMatchInsert[], stageToClear?: string) {
  // Clear existing
  let query = supabase.from("playoff_matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  
  if (stageToClear) {
    query = query.eq("stage", stageToClear);
  } else if (stageToClear === undefined) {
    // If explicitly calling with no stage string but wanting to clear ALL, it clears all
  }

  const { error: deleteError } = await query;
    
  if (deleteError) return { error: deleteError };

  const { error: insertError } = await supabase
    .from("playoff_matches")
    .insert(matches);
    
  return { error: insertError };
}

export async function updatePlayoffMatch(
  matchId: string, 
  updates: { team1_score: number; team2_score: number; is_completed: boolean },
  winnerId?: string | null,
  winnerToMatchId?: string | null
) {
  const { error: updateError } = await supabase
    .from("playoff_matches")
    .update(updates)
    .eq("id", matchId);
    
  if (updateError) return { error: updateError };
  
  if (updates.is_completed) {
    // Advance winner
    if (winnerToMatchId && winnerId) {
      const { data: nextMatch } = await supabase
        .from("playoff_matches")
        .select("team1_id, team2_id")
        .eq("id", winnerToMatchId)
        .single();
        
      if (nextMatch) {
        if (!nextMatch.team1_id) {
          await supabase.from("playoff_matches").update({ team1_id: winnerId }).eq("id", winnerToMatchId);
        } else if (!nextMatch.team2_id && nextMatch.team1_id !== winnerId) {
          await supabase.from("playoff_matches").update({ team2_id: winnerId }).eq("id", winnerToMatchId);
        }
      }
    }
  }

  return { error: null };
}

