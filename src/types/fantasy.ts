export type Tier = 'S' | 'A' | 'B' | 'C' | 'D' | string;

export interface FantasyPlayer {
  id: string;
  pseudo: string;
  rank: Tier;
  roles: string[];
  /** Prix actif affiché / mercato (jour 1 = fantasy_cost, jour 2 = fantasy_cost_day2 ou équivalent). */
  price: number;
  /** Coût réel jour 1 en base (snap budget restant & init journée 2). */
  fantasyPriceDay1: number;
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
  /** Snapshot lock jour 1 : absent si colonne DB null (≠ 0). */
  carriedOverBudget?: number;
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
