import { ROUND_SECONDS, TRASH_CATALOG, type ScoreEntry, type TrashType } from "../gameConfig";

export function getTrashPoints(type: TrashType): number {
  return TRASH_CATALOG[type].points;
}

export function sanitizePlayerName(name: string): string {
  return name.trim().replace(/\s+/g, " ").slice(0, 24);
}

export function createScoreEntry(params: {
  playerName: string;
  score: number;
  trashCollected: number;
}): ScoreEntry {
  return {
    id: crypto.randomUUID(),
    playerName: sanitizePlayerName(params.playerName),
    score: Math.max(0, Math.round(params.score)),
    trashCollected: Math.max(0, Math.round(params.trashCollected)),
    roundSeconds: ROUND_SECONDS,
    createdAt: new Date().toISOString(),
  };
}

export function sortScores(scores: ScoreEntry[]): ScoreEntry[] {
  return [...scores].sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export function topScores(scores: ScoreEntry[], limit = 10): ScoreEntry[] {
  return sortScores(scores).slice(0, limit);
}
