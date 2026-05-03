/** Données minimales playoff pour résoudre le jour Fantasy (jour 1 → jour 2). */

export type PlayoffMatchPhaseRow = {
  stage?: string | null;
  team1_id?: string | null;
  team2_id?: string | null;
  is_completed?: boolean | null;
  team1_score?: number | string | null;
  team2_score?: number | string | null;
};

function stageIsChampionship(stage: string | null | undefined): boolean {
  return typeof stage === 'string' && stage.trim().toLowerCase() === 'championship';
}

/** Terminé : flag explicite, ou scores renseignés avec un vainqueur (tolère un `is_completed` désynchronisé). */
export function playoffRowEffectivelyCompleted(m: PlayoffMatchPhaseRow): boolean {
  if (m.is_completed === true) return true;

  const s1 = m.team1_score;
  const s2 = m.team2_score;
  if (s1 === null || s1 === undefined || s2 === null || s2 === undefined) return false;
  const n1 = Number(s1);
  const n2 = Number(s2);
  if (!Number.isFinite(n1) || !Number.isFinite(n2)) return false;
  return n1 !== n2;
}

/** Slots championship réellement jouables (pas de TBD / BYE dans la base). */
export function getPlayableChampionshipMatches(matches: PlayoffMatchPhaseRow[]): PlayoffMatchPhaseRow[] {
  return matches.filter((m) => {
    if (!stageIsChampionship(m.stage)) return false;
    const t1 = m.team1_id;
    const t2 = m.team2_id;
    if (!t1 || !t2) return false;
    if (t1 === 'BYE' || t2 === 'BYE') return false;
    return true;
  });
}

/**
 * Passage jour 2 : tous les matchs championship jouables sont terminés
 * (flag `is_completed` ou scores avec vainqueur).
 */
export function areAllChampionshipMatchesCompleted(matches: PlayoffMatchPhaseRow[]): boolean {
  const playable = getPlayableChampionshipMatches(matches);
  return playable.length > 0 && playable.every((m) => playoffRowEffectivelyCompleted(m));
}

export function fantasyTournamentDayFromPlayoffs(matches: PlayoffMatchPhaseRow[] | null | undefined): 1 | 2 {
  if (!matches?.length) return 1;
  return areAllChampionshipMatchesCompleted(matches) ? 2 : 1;
}
