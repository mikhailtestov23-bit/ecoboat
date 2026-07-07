import type { ScoreEntry } from "../game/gameConfig";
import { topScores } from "../game/systems/scoring";

const STORAGE_KEY = "ecoboat.scores";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function loadLocalScores(): ScoreEntry[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as ScoreEntry[];
    return topScores(parsed, 10);
  } catch {
    return [];
  }
}

export function saveLocalScore(entry: ScoreEntry): ScoreEntry[] {
  const nextScores = topScores([...loadLocalScores(), entry], 10);

  if (canUseStorage()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextScores));
  }

  return nextScores;
}
