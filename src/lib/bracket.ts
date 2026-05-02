import type { Database } from "../types/supabase";

export type PlayoffMatch = Database["public"]["Tables"]["playoff_matches"]["Row"];
export type PlayoffMatchInsert = Database["public"]["Tables"]["playoff_matches"]["Insert"];

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generates round-robin matches for N teams
 */
export function generateChampionship(teamIds: string[]): PlayoffMatchInsert[] {
  if (teamIds.length < 2) {
    throw new Error("Championship requires at least 2 teams.");
  }

  const matches: PlayoffMatchInsert[] = [];
  const teams = [...teamIds];
  
  // Add a dummy team if odd number of teams to handle byes
  if (teams.length % 2 !== 0) {
    teams.push('BYE');
  }

  const numRounds = teams.length - 1;
  const halfSize = teams.length / 2;

  for (let round = 0; round < numRounds; round++) {
    let matchOrder = 1;
    for (let i = 0; i < halfSize; i++) {
      const team1 = teams[i];
      const team2 = teams[teams.length - 1 - i];

      if (team1 !== 'BYE' && team2 !== 'BYE') {
        matches.push({
          id: generateId(),
          stage: 'championship',
          round: round + 1,
          match_order: matchOrder++,
          team1_id: team1,
          team2_id: team2,
        });
      }
    }
    
    // Rotate array: keep the first team fixed, rotate the rest clockwise
    const first = teams.shift()!;
    const last = teams.pop()!;
    teams.unshift(first, last);
  }

  return matches;
}

/**
 * Generates matches for a group of 3 teams
 */
export function generateGroupMatches(teamIds: string[], groupName: 'group_a' | 'group_b'): PlayoffMatchInsert[] {
  if (teamIds.length !== 3) {
    throw new Error(`Group ${groupName} requires exactly 3 teams.`);
  }

  const matches: PlayoffMatchInsert[] = [];

  // Round Robin for 3 teams
  // Match 1: 0 vs 1
  // Match 2: 0 vs 2
  // Match 3: 1 vs 2

  matches.push({
    id: generateId(),
    stage: groupName,
    round: 1,
    match_order: 1,
    team1_id: teamIds[0] || null,
    team2_id: teamIds[1] || null,
  });

  matches.push({
    id: generateId(),
    stage: groupName,
    round: 2,
    match_order: 1,
    team1_id: teamIds[0] || null,
    team2_id: teamIds[2] || null,
  });

  matches.push({
    id: generateId(),
    stage: groupName,
    round: 3,
    match_order: 1,
    team1_id: teamIds[1] || null,
    team2_id: teamIds[2] || null,
  });

  return matches;
}

/**
 * Generates a single elimination bracket for 4 teams (Semi-finals -> Final)
 * Expected order of teamIds: [1st Group A, 2nd Group B, 1st Group B, 2nd Group A]
 */
export function generateSingleEliminationBracket(teamIds: string[]): PlayoffMatchInsert[] {
  if (teamIds.length !== 4) {
    throw new Error("Single elimination for this format requires exactly 4 teams.");
  }

  const matches: PlayoffMatchInsert[] = [];

  // Semi-Final 1
  const sf1: PlayoffMatchInsert = {
    id: generateId(),
    stage: 'knockout',
    round: 1,
    match_order: 1,
    team1_id: teamIds[0] || null, // 1st Group A
    team2_id: teamIds[3] || null, // 2nd Group B
  };

  // Semi-Final 2
  const sf2: PlayoffMatchInsert = {
    id: generateId(),
    stage: 'knockout',
    round: 1,
    match_order: 2,
    team1_id: teamIds[2] || null, // 1st Group B
    team2_id: teamIds[1] || null, // 2nd Group A
  };

  // Final (BO3)
  const finalMatch: PlayoffMatchInsert = {
    id: generateId(),
    stage: 'knockout',
    round: 2,
    match_order: 1,
    team1_id: null,
    team2_id: null,
  };

  // Link Semi-Finals to Final
  sf1.winner_to_match_id = finalMatch.id;
  sf2.winner_to_match_id = finalMatch.id;

  matches.push(sf1, sf2, finalMatch);

  return matches;
}
