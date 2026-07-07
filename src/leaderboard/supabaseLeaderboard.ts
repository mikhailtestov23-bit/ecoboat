import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ScoreEntry } from "../game/gameConfig";

type ScoreRow = {
  id: string;
  player_name: string;
  score: number;
  trash_collected: number;
  round_seconds: number;
  created_at: string;
};

let client: SupabaseClient | null = null;

function getSupabaseConfig(): { url: string; key: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

function getClient(): SupabaseClient | null {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  client ??= createClient(config.url, config.key);
  return client;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseConfig());
}

function toEntry(row: ScoreRow): ScoreEntry {
  return {
    id: row.id,
    playerName: row.player_name,
    score: row.score,
    trashCollected: row.trash_collected,
    roundSeconds: row.round_seconds,
    createdAt: row.created_at,
  };
}

export async function fetchRemoteScores(): Promise<ScoreEntry[]> {
  const supabase = getClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("scores")
    .select("id, player_name, score, trash_collected, round_seconds, created_at")
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => toEntry(row as ScoreRow));
}

export async function submitRemoteScore(entry: ScoreEntry): Promise<void> {
  const supabase = getClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("scores").insert({
    id: entry.id,
    player_name: entry.playerName,
    score: entry.score,
    trash_collected: entry.trashCollected,
    round_seconds: entry.roundSeconds,
    created_at: entry.createdAt,
  });

  if (error) {
    throw error;
  }
}
