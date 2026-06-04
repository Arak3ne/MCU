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
  let championsData: any[] | null = null;
  let rolesData: any[] | null = null;

  // Try to fetch with relation first
  const { data, error } = await supabase
    .from("champions")
    .select("*, champion_roles(role)")
    .order("name");

  if (!error && data) {
    championsData = data;
  } else {
    // Fallback: fetch separately
    const [champsRes, rolesRes] = await Promise.all([
      supabase.from("champions").select("*").order("name"),
      supabase.from("champion_roles").select("champion_id, role")
    ]);
    
    if (champsRes.error) {
      return { data: null, error: champsRes.error };
    }
    
    championsData = champsRes.data;
    rolesData = rolesRes.data;
  }

  const normalizedData = (championsData ?? []).map((champion: any) => {
    let relationRoles: string[] = [];
    
    if (Array.isArray(champion.champion_roles)) {
      relationRoles = champion.champion_roles
        .map((entry: { role?: string | null }) => entry?.role)
        .filter((role: string | null | undefined): role is string => !!role);
    } else if (rolesData) {
      relationRoles = rolesData
        .filter((r: any) => r.champion_id === champion.id)
        .map((r: any) => r.role)
        .filter(Boolean);
    }

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

export async function disableChampions(ids: string[]) {
  if (!ids.length) return { data: null, error: null };
  const { data, error } = await supabase
    .from("champions")
    .update({ is_available: false, updated_at: new Date().toISOString() })
    .in("id", ids);

  return { data, error };
}

export async function handleRoundCompletion(stage: string, roundNumber: number) {
  // Get all matches for this round
  const { data: matches, error: fetchError } = await supabase
    .from("playoff_matches")
    .select("draft_picks")
    .eq("stage", stage)
    .eq("round", roundNumber);

  if (fetchError || !matches) return { error: fetchError };

  // Collect all picks from all matches in this round
  const allPicks = new Set<string>();
  for (const match of matches) {
    if (Array.isArray(match.draft_picks)) {
      for (const pick of match.draft_picks) {
        if (pick && !pick.startsWith("__empty_pick__")) {
          allPicks.add(pick);
        }
      }
    }
  }

  const picksArray = Array.from(allPicks);
  if (picksArray.length === 0) return { error: null };

  // Disable all champions picked in this round
  return await disableChampions(picksArray);
}

export async function updateTeamStats(teamId: string, updates: { wins: number; losses: number; points: number }) {
  const { data, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", teamId);
  return { data, error };
}

export async function fetchDraftSetupTeams() {
  const { data: teamRows, error: teamError } = await supabase
    .from("teams")
    .select("id,name")
    .order("name", { ascending: true });

  if (teamError) {
    return { data: null, error: teamError };
  }

  const { data: playerRows, error: playerError } = await supabase
    .from("players")
    .select("id,pseudo,team_id")
    .not("team_id", "is", null)
    .order("pseudo", { ascending: true });

  if (playerError) {
    return { data: null, error: playerError };
  }

  const playersByTeam = new Map<string, { id: string; pseudo: string; team_id: string | null }[]>();
  for (const p of playerRows ?? []) {
    if (!p.team_id) continue;
    const list = playersByTeam.get(p.team_id) ?? [];
    list.push(p);
    playersByTeam.set(p.team_id, list);
  }

  const data = (teamRows ?? []).map((team: any) => {
    const players = playersByTeam.get(team.id) ?? [];
    const defaultCaptain = players[0] ?? null;
    return {
      ...team,
      players,
      defaultCaptain,
    };
  });

  return { data, error: null };
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

