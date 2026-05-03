import type { SupabaseClient } from "@supabase/supabase-js";

type TeamLite = { id: string; name: string };

export function resolveBlueRedNames(params: {
  team1: TeamLite | null;
  team2: TeamLite | null;
  draft_blue_team_id?: string | null;
}): { blueName: string; redName: string } {
  const t1 = params.team1;
  const t2 = params.team2;
  const fallback1 = t1?.name ?? "Équipe 1";
  const fallback2 = t2?.name ?? "Équipe 2";
  if (!t1 || !t2) {
    return { blueName: fallback1, redName: fallback2 };
  }
  if (params.draft_blue_team_id === t2.id) {
    return { blueName: t2.name, redName: t1.name };
  }
  return { blueName: t1.name, redName: t2.name };
}

/** First successful update wins; otherwise returns current row (another client claimed first). */
export async function claimOrRefreshDraftBlueTeam(
  supabase: SupabaseClient,
  matchId: string,
  preferredBlueTeamId: string,
): Promise<{ draft_blue_team_id: string | null; draft_url: string | null; claimed: boolean }> {
  const { data: updated, error } = await supabase
    .from("playoff_matches")
    .update({ draft_blue_team_id: preferredBlueTeamId })
    .eq("id", matchId)
    .is("draft_url", null)
    .is("draft_blue_team_id", null)
    .select("draft_blue_team_id")
    .maybeSingle();

  if (error) throw error;

  if (updated?.draft_blue_team_id) {
    return {
      draft_blue_team_id: updated.draft_blue_team_id,
      draft_url: null,
      claimed: true,
    };
  }

  const { data: row, error: readErr } = await supabase
    .from("playoff_matches")
    .select("draft_blue_team_id, draft_url")
    .eq("id", matchId)
    .single();

  if (readErr) throw readErr;

  return {
    draft_blue_team_id: row?.draft_blue_team_id ?? null,
    draft_url: row?.draft_url ?? null,
    claimed: false,
  };
}
