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
    .select("*")
    .order("name");

  return { data: data as Champion[] | null, error };
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

export async function fetchPlayoffMatches() {
  const { data, error } = await supabase
    .from("playoff_matches")
    .select(`
      *,
      team1:teams!team1_id(*),
      team2:teams!team2_id(*)
    `)
    .order("bracket", { ascending: false })
    .order("round", { ascending: true })
    .order("match_order", { ascending: true });
    
  return { data, error };
}

export async function generatePlayoffMatches(matches: PlayoffMatchInsert[]) {
  // Clear existing
  const { error: deleteError } = await supabase
    .from("playoff_matches")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000"); // Deletes all matches safely
    
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
  loserId?: string | null,
  winnerToMatchId?: string | null,
  loserToMatchId?: string | null
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
    
    // Advance loser
    if (loserToMatchId && loserId) {
      const { data: nextMatch } = await supabase
        .from("playoff_matches")
        .select("team1_id, team2_id")
        .eq("id", loserToMatchId)
        .single();
        
      if (nextMatch) {
        if (!nextMatch.team1_id) {
          await supabase.from("playoff_matches").update({ team1_id: loserId }).eq("id", loserToMatchId);
        } else if (!nextMatch.team2_id && nextMatch.team1_id !== loserId) {
          await supabase.from("playoff_matches").update({ team2_id: loserId }).eq("id", loserToMatchId);
        }
      }
    }
  }

  return { error: null };
}

