import type { Database } from "../types/supabase";

export type PlayoffMatch = Database["public"]["Tables"]["playoff_matches"]["Row"];
export type PlayoffMatchInsert = Database["public"]["Tables"]["playoff_matches"]["Insert"];

function generateId(): string {
  // Simple UUID generator for browser/node
  return crypto.randomUUID();
}

/**
 * Generates a double elimination bracket for N teams (padded to nearest power of 2)
 */
export function generateDoubleEliminationBracket(teamIds: string[]): PlayoffMatchInsert[] {
  const matches: PlayoffMatchInsert[] = [];
  
  // Find next power of 2
  let power = 1;
  while (power < teamIds.length) {
    power *= 2;
  }
  const k = Math.log2(power);
  
  // Pad with nulls for byes (we will handle auto-advancing later or in admin UI)
  const paddedTeams = [...teamIds];
  while (paddedTeams.length < power) {
    paddedTeams.push(null as any);
  }

  // We need to keep track of matches to link them
  // Upper bracket rounds: 1 to k
  const upperMatches: PlayoffMatchInsert[][] = [];
  for (let r = 1; r <= k; r++) {
    const numMatches = power / Math.pow(2, r);
    const roundMatches: PlayoffMatchInsert[] = [];
    for (let i = 0; i < numMatches; i++) {
      roundMatches.push({
        id: generateId(),
        bracket: 'upper',
        round: r,
        match_order: i + 1,
        team1_id: null,
        team2_id: null,
      });
    }
    upperMatches.push(roundMatches);
  }

  // Seed Round 1
  for (let i = 0; i < upperMatches[0].length; i++) {
    // Basic seeding: 0 vs power-1, etc.
    // For simplicity, just pair them consecutively from paddedTeams for now, 
    // but ideally we'd do standard 1v8, 2v7.
    // Let's just use the padded array consecutively since admin can order them beforehand.
    upperMatches[0][i].team1_id = paddedTeams[i * 2] || null;
    upperMatches[0][i].team2_id = paddedTeams[i * 2 + 1] || null;
  }

  // Link Upper Bracket
  for (let r = 0; r < k - 1; r++) { // 0-indexed round
    for (let i = 0; i < upperMatches[r].length; i++) {
      const nextMatchIndex = Math.floor(i / 2);
      upperMatches[r][i].winner_to_match_id = upperMatches[r + 1][nextMatchIndex].id;
    }
  }

  // Lower Bracket rounds
  const lowerMatches: PlayoffMatchInsert[][] = [];
  let lowerRoundsCount = 2 * k - 2; // For k=3 (8 teams), lower has 4 rounds
  if (k === 1) lowerRoundsCount = 0;

  for (let r = 1; r <= lowerRoundsCount; r++) {
    const isEvenRound = r % 2 === 0;
    const numMatches = isEvenRound
      ? upperMatches[0].length / Math.pow(2, r / 2)
      : upperMatches[0].length / Math.pow(2, Math.floor(r / 2) + 1);
      
    const roundMatches: PlayoffMatchInsert[] = [];
    for (let i = 0; i < numMatches; i++) {
      roundMatches.push({
        id: generateId(),
        bracket: 'lower',
        round: r,
        match_order: i + 1,
        team1_id: null,
        team2_id: null,
      });
    }
    lowerMatches.push(roundMatches);
  }

  // Link Upper Losers to Lower Bracket
  // UR1 losers go to LR1
  if (k > 1) {
    for (let i = 0; i < upperMatches[0].length; i++) {
      const lrMatchIndex = Math.floor(i / 2);
      upperMatches[0][i].loser_to_match_id = lowerMatches[0][lrMatchIndex].id;
    }
    
    // UR(x) losers go to LR(2x-2) for x > 1
    // e.g. UR2 losers go to LR2 (round index 1)
    // UR3 losers go to LR4 (round index 3)
    for (let r = 1; r < k; r++) { // 0-indexed UR -> r=1 is UR2
      const lowerRoundIndex = 2 * r - 1; // For r=1, lr=1 (LR2). For r=2, lr=3 (LR4)
      for (let i = 0; i < upperMatches[r].length; i++) {
        // Cross them so we avoid rematches if possible (simple reverse map for now)
        const lrMatchIndex = upperMatches[r].length - 1 - i; 
        upperMatches[r][i].loser_to_match_id = lowerMatches[lowerRoundIndex][lrMatchIndex].id;
      }
    }
  }

  // Link Lower Bracket internal progression
  for (let r = 0; r < lowerRoundsCount - 1; r++) { // 0-indexed LR
    const isEvenRound = (r + 1) % 2 === 0;
    for (let i = 0; i < lowerMatches[r].length; i++) {
      const nextMatchIndex = isEvenRound ? Math.floor(i / 2) : i; // If moving to odd round, they combine. If to even, they face an upper loser
      lowerMatches[r][i].winner_to_match_id = lowerMatches[r + 1][nextMatchIndex].id;
    }
  }

  // Grand Finals
  const grandFinalsMatch: PlayoffMatchInsert = {
    id: generateId(),
    bracket: 'grand_finals',
    round: 1,
    match_order: 1,
    team1_id: null,
    team2_id: null,
  };

  if (k > 0) {
    const upperFinal = upperMatches[k - 1][0];
    upperFinal.winner_to_match_id = grandFinalsMatch.id;
    
    if (lowerRoundsCount > 0) {
      const lowerFinal = lowerMatches[lowerRoundsCount - 1][0];
      lowerFinal.winner_to_match_id = grandFinalsMatch.id;
    } else {
      // If only 2 teams, loser of upper final is eliminated, winner to GF.
      // But GF is usually upper final winner vs lower final winner.
      // If only 2 teams, UR1 is GF effectively, but our model makes UR1 then GF.
      upperFinal.loser_to_match_id = grandFinalsMatch.id;
    }
  }

  // Flatten and return all
  for (const r of upperMatches) matches.push(...r);
  for (const r of lowerMatches) matches.push(...r);
  if (k > 0) matches.push(grandFinalsMatch);

  return matches;
}
