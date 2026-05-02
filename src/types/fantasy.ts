export type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | string;

export interface FantasyPlayer {
  id: string;
  pseudo: string;
  rank: Tier;
  roles: string[];
  price: number;
  fantasyEnabled: boolean;
}

export interface FantasyTeam {
  id: string;
  userId: string;
  name: string;
  tournamentDay: 1 | 2;
  playerIds: string[]; // Array of player IDs, must be length 5
  captainId: string; // ID of the captain player (x1.5 score)
  isLocked: boolean;
  totalPoints?: number; // Calculated field
  transfersMade: number;
  penaltyPoints: number;
  carriedOverBudget: number;
  createdAt: string;
  updatedAt: string;
}

export interface FantasyPlayerScore {
  id: string;
  playerId: string;
  tournamentDay: 1 | 2;
  score: number;
  isValidated: boolean;
  createdAt: string;
}

export interface FantasyLeaderboardEntry {
  userId: string;
  teamId: string;
  teamName: string;
  tournamentDay: 1 | 2;
  totalPoints: number;
  creatorPseudo?: string;
  picks?: {
    playerId: string;
    isCaptain: boolean;
    score: number;
    pseudo: string;
  }[];
}
