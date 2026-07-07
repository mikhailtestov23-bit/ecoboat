import type { ScoreEntry } from "../game/gameConfig";
import { loadLocalScores, saveLocalScore } from "./localLeaderboard";
import {
  fetchRemoteScores,
  isSupabaseConfigured,
  submitRemoteScore,
} from "./supabaseLeaderboard";

export async function loadScores(): Promise<ScoreEntry[]> {
  if (isSupabaseConfigured()) {
    try {
      return await fetchRemoteScores();
    } catch {
      return loadLocalScores();
    }
  }

  return loadLocalScores();
}

export async function saveScore(entry: ScoreEntry): Promise<ScoreEntry[]> {
  if (isSupabaseConfigured()) {
    try {
      await submitRemoteScore(entry);
      return await fetchRemoteScores();
    } catch {
      return saveLocalScore(entry);
    }
  }

  return saveLocalScore(entry);
}
