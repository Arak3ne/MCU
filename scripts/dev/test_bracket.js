function generateId() {
  return crypto.randomUUID();
}

function generateChampionship(teamIds) {
  if (teamIds.length < 2) {
    throw new Error("Championship requires at least 2 teams.");
  }

  const matches = [];
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
    const first = teams.shift();
    const last = teams.pop();
    teams.unshift(first, last);
  }

  return matches;
}

const matches = generateChampionship(['1', '2', '3', '4', '5', '6']);
console.log(matches.length);
