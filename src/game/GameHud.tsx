import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Heart,
  Pause,
  Play,
  RotateCcw,
  Timer,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import type { ReactNode } from "react";
import { STARTING_LIVES } from "./gameConfig";
import { useGameStore } from "./gameStore";
import { useInputStore, type InputButton } from "./systems/input";
import { IconButton } from "../ui/IconButton";

function formatTime(seconds: number): string {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function LifeMeter({ lives }: { lives: number }) {
  return (
    <div className="life-meter" aria-label={`Жизни: ${lives}`}>
      {Array.from({ length: STARTING_LIVES }).map((_, index) => (
        <Heart
          key={index}
          size={18}
          aria-hidden="true"
          fill={index < lives ? "#fb7185" : "transparent"}
          color={index < lives ? "#fb7185" : "#94a3b8"}
          strokeWidth={2.4}
        />
      ))}
    </div>
  );
}

function DirectionButton({
  label,
  button,
  children,
}: {
  label: string;
  button: InputButton;
  children: ReactNode;
}) {
  const setVirtualButton = useInputStore((state) => state.setVirtualButton);

  return (
    <IconButton
      label={label}
      className="dpad-button"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        setVirtualButton(button, true);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        setVirtualButton(button, false);
      }}
      onPointerCancel={() => setVirtualButton(button, false)}
      onPointerLeave={() => setVirtualButton(button, false)}
    >
      {children}
    </IconButton>
  );
}

export function GameHud() {
  const phase = useGameStore((state) => state.phase);
  const score = useGameStore((state) => state.score);
  const lives = useGameStore((state) => state.lives);
  const timeLeft = useGameStore((state) => state.timeLeft);
  const trashCollected = useGameStore((state) => state.trashCollected);
  const pauseGame = useGameStore((state) => state.pauseGame);
  const resumeGame = useGameStore((state) => state.resumeGame);
  const restartGame = useGameStore((state) => state.restartGame);
  const openLeaderboard = useGameStore((state) => state.openLeaderboard);
  const audioEnabled = useGameStore((state) => state.audioEnabled);
  const toggleAudio = useGameStore((state) => state.toggleAudio);

  return (
    <>
      <div className="hud">
        <div className="hud-cluster">
          <div className="metric">
            <span className="metric-label">Очки</span>
            <strong>{score}</strong>
          </div>
          <div className="metric">
            <span className="metric-label">Мусор</span>
            <strong>{trashCollected}</strong>
          </div>
        </div>

        <div className="hud-cluster center">
          <div className="metric time">
            <Timer size={18} aria-hidden="true" />
            <strong>{formatTime(timeLeft)}</strong>
          </div>
          <LifeMeter lives={lives} />
        </div>

        <div className="hud-actions">
          {phase === "paused" ? (
            <IconButton label="Продолжить" onClick={resumeGame}>
              <Play size={20} aria-hidden="true" />
            </IconButton>
          ) : (
            <IconButton label="Пауза" onClick={pauseGame} disabled={phase !== "playing"}>
              <Pause size={20} aria-hidden="true" />
            </IconButton>
          )}
          <IconButton label="Заново" onClick={restartGame}>
            <RotateCcw size={20} aria-hidden="true" />
          </IconButton>
          <IconButton label="Лидеры" onClick={openLeaderboard}>
            <Trophy size={20} aria-hidden="true" />
          </IconButton>
          <IconButton label={audioEnabled ? "Выключить звук" : "Включить звук"} onClick={toggleAudio}>
            {audioEnabled ? (
              <Volume2 size={20} aria-hidden="true" />
            ) : (
              <VolumeX size={20} aria-hidden="true" />
            )}
          </IconButton>
        </div>
      </div>

      <div className="mobile-controls" aria-label="Управление кораблем">
        <div />
        <DirectionButton label="Вперед" button="up">
          <ChevronUp size={24} aria-hidden="true" />
        </DirectionButton>
        <div />
        <DirectionButton label="Влево" button="left">
          <ChevronLeft size={24} aria-hidden="true" />
        </DirectionButton>
        <DirectionButton label="Назад" button="down">
          <ChevronDown size={24} aria-hidden="true" />
        </DirectionButton>
        <DirectionButton label="Вправо" button="right">
          <ChevronRight size={24} aria-hidden="true" />
        </DirectionButton>
      </div>
    </>
  );
}
