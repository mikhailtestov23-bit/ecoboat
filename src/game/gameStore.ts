import { create } from "zustand";
import {
  DAMAGE_FLASH_MS,
  HIT_INVULNERABILITY_MS,
  ROUND_SECONDS,
  SPAWN_POINT,
  STARTING_LIVES,
  type Point2,
  type ScoreEntry,
  type TrashItem,
} from "./gameConfig";
import { createScoreEntry, sanitizePlayerName } from "./systems/scoring";
import { createReplacementTrash, createTrashItems } from "./systems/spawning";
import { audioEngine } from "../audio/audioEngine";
import { loadScores, saveScore } from "../leaderboard/submitScore";

export type GamePhase = "ready" | "playing" | "paused" | "gameOver" | "leaderboard";
export type DamageSource = "obstacle" | "predator" | "storm";

type GameState = {
  phase: GamePhase;
  score: number;
  lives: number;
  timeLeft: number;
  elapsedSeconds: number;
  trashCollected: number;
  trash: TrashItem[];
  boatPosition: Point2;
  resetBoatToken: number;
  hitNudge: (Point2 & { token: number }) | null;
  lastHitAt: number;
  warningPredatorId: string | null;
  leaderboard: ScoreEntry[];
  isSubmittingScore: boolean;
  submissionError: string | null;
  audioEnabled: boolean;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  toggleAudio: () => void;
  openLeaderboard: () => void;
  closeLeaderboard: () => void;
  tickRound: (deltaSeconds: number) => void;
  collectTrash: (trashId: string) => void;
  loseLife: (source: DamageSource, hazardPosition?: Point2) => void;
  setBoatPosition: (position: Point2) => void;
  setPredatorWarning: (predatorId: string | null) => void;
  submitScore: (playerName: string) => Promise<void>;
  loadLeaderboard: () => Promise<void>;
};

const now = () => (typeof performance === "undefined" ? Date.now() : performance.now());

function createInitialTrash(): TrashItem[] {
  return createTrashItems(undefined, Date.now());
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "ready",
  score: 0,
  lives: STARTING_LIVES,
  timeLeft: ROUND_SECONDS,
  elapsedSeconds: 0,
  trashCollected: 0,
  trash: createInitialTrash(),
  boatPosition: SPAWN_POINT,
  resetBoatToken: 0,
  hitNudge: null,
  lastHitAt: -DAMAGE_FLASH_MS,
  warningPredatorId: null,
  leaderboard: [],
  isSubmittingScore: false,
  submissionError: null,
  audioEnabled: audioEngine.isEnabled(),

  startGame: () => {
    set((state) => ({
      phase: "playing",
      score: 0,
      lives: STARTING_LIVES,
      timeLeft: ROUND_SECONDS,
      elapsedSeconds: 0,
      trashCollected: 0,
      trash: createInitialTrash(),
      boatPosition: SPAWN_POINT,
      resetBoatToken: state.resetBoatToken + 1,
      hitNudge: null,
      lastHitAt: -DAMAGE_FLASH_MS,
      warningPredatorId: null,
      submissionError: null,
    }));
    void audioEngine.playStart();
    void audioEngine.startMusic();
  },

  pauseGame: () => {
    if (get().phase === "playing") {
      set({ phase: "paused" });
      audioEngine.stopMusic();
    }
  },

  resumeGame: () => {
    if (get().phase === "paused") {
      set({ phase: "playing" });
      void audioEngine.startMusic();
    }
  },

  restartGame: () => {
    get().startGame();
  },

  toggleAudio: () => {
    const nextAudioEnabled = !get().audioEnabled;
    audioEngine.setEnabled(nextAudioEnabled);
    set({ audioEnabled: nextAudioEnabled });

    if (nextAudioEnabled && get().phase === "playing") {
      void audioEngine.playToggle();
      void audioEngine.startMusic();
    }
  },

  openLeaderboard: () => {
    set({ phase: "leaderboard" });
    audioEngine.stopMusic();
    void get().loadLeaderboard();
  },

  closeLeaderboard: () => {
    const phase = get().lives <= 0 || get().timeLeft <= 0 ? "gameOver" : "ready";
    set({ phase });
  },

  tickRound: (deltaSeconds) => {
    const state = get();

    if (state.phase !== "playing") {
      return;
    }

    const nextTime = Math.max(0, state.timeLeft - deltaSeconds);

    const isRoundOver = nextTime <= 0;

    set({
      timeLeft: nextTime,
      elapsedSeconds: state.elapsedSeconds + deltaSeconds,
      phase: isRoundOver ? "gameOver" : "playing",
      warningPredatorId: isRoundOver ? null : state.warningPredatorId,
    });

    if (isRoundOver) {
      void audioEngine.playGameOver();
    }
  },

  collectTrash: (trashId) => {
    const state = get();

    if (state.phase !== "playing") {
      return;
    }

    const collected = state.trash.find((item) => item.id === trashId);

    if (!collected) {
      return;
    }

    const remaining = state.trash.filter((item) => item.id !== trashId);
    const replacement = createReplacementTrash(Date.now() + state.score, remaining);

    set({
      score: state.score + collected.points,
      trashCollected: state.trashCollected + 1,
      trash: [...remaining, replacement],
    });
    void audioEngine.playTrashPickup(collected.points);
  },

  loseLife: (_source, hazardPosition) => {
    const state = get();
    const currentTime = now();

    if (state.phase !== "playing" || currentTime - state.lastHitAt < HIT_INVULNERABILITY_MS) {
      return;
    }

    const nextLives = Math.max(0, state.lives - 1);
    const fallbackDirection = { x: state.boatPosition.x - SPAWN_POINT.x, z: state.boatPosition.z - SPAWN_POINT.z };
    const awayFromHazard = hazardPosition
      ? {
          x: state.boatPosition.x - hazardPosition.x,
          z: state.boatPosition.z - hazardPosition.z,
        }
      : fallbackDirection;
    const length = Math.hypot(awayFromHazard.x, awayFromHazard.z) || 1;

    set({
      lives: nextLives,
      phase: nextLives <= 0 ? "gameOver" : "playing",
      hitNudge:
        nextLives <= 0
          ? null
          : {
              token: state.hitNudge?.token ? state.hitNudge.token + 1 : 1,
              x: awayFromHazard.x / length,
              z: awayFromHazard.z / length,
            },
      lastHitAt: currentTime,
      warningPredatorId: null,
    });
    void audioEngine.playDamage();

    if (nextLives <= 0) {
      void audioEngine.playGameOver();
    }
  },

  setBoatPosition: (position) => {
    set({ boatPosition: position });
  },

  setPredatorWarning: (predatorId) => {
    if (get().warningPredatorId !== predatorId) {
      set({ warningPredatorId: predatorId });
    }
  },

  submitScore: async (playerName) => {
    const cleanName = sanitizePlayerName(playerName);

    if (!cleanName) {
      set({ submissionError: "Введите имя игрока" });
      return;
    }

    const state = get();
    const entry = createScoreEntry({
      playerName: cleanName,
      score: state.score,
      trashCollected: state.trashCollected,
    });

    set({ isSubmittingScore: true, submissionError: null });

    try {
      const leaderboard = await saveScore(entry);
      set({
        leaderboard,
        isSubmittingScore: false,
        phase: "leaderboard",
      });
    } catch {
      set({
        isSubmittingScore: false,
        submissionError: "Не удалось сохранить результат",
      });
    }
  },

  loadLeaderboard: async () => {
    const leaderboard = await loadScores();
    set({ leaderboard });
  },
}));
