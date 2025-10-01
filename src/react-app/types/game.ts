export type ScoringSystem = 'win-on-threshold' | 'lose-on-threshold';

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Game {
  id: string;
  name: string;
  players: Player[];
  winThreshold: number;
  scoringSystem: ScoringSystem;
  winner: string | null;
  rounds: GameRound[];
  createdAt: string;
  updatedAt: string;
}

export interface GameRound {
  roundNumber: number;
  scores: Record<string, number>; // playerId -> score for this round
}

export interface GameSettings {
  playerNames: string[];
  winThreshold: number;
  scoringSystem: ScoringSystem;
  gameName?: string;
}
