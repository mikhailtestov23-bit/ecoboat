import { useEffect, useState } from "react";
import { Anchor, Play, RotateCcw, Trophy } from "lucide-react";
import { GameCanvas } from "../game/GameCanvas";
import { GameHud } from "../game/GameHud";
import { ROUND_SECONDS, STARTING_LIVES } from "../game/gameConfig";
import { useGameStore } from "../game/gameStore";
import { Leaderboard } from "../leaderboard/Leaderboard";

function ReadyOverlay() {
  const startGame = useGameStore((state) => state.startGame);
  const openLeaderboard = useGameStore((state) => state.openLeaderboard);

  return (
    <div className="modal-backdrop">
      <section className="modal-panel intro-panel" aria-labelledby="intro-title">
        <div className="brand-lockup">
          <span className="brand-mark">
            <Anchor size={30} aria-hidden="true" />
          </span>
          <div>
            <h1 id="intro-title">Ecoboat</h1>
            <p>Экологический рейд по озеру</p>
          </div>
        </div>

        <div className="round-facts">
          <span>{ROUND_SECONDS} секунд</span>
          <span>{STARTING_LIVES} жизни</span>
          <span>Максимум очков</span>
        </div>

        <div className="modal-actions">
          <button className="primary-button" onClick={startGame}>
            <Play size={18} aria-hidden="true" />
            Начать раунд
          </button>
          <button className="secondary-button" onClick={openLeaderboard}>
            <Trophy size={18} aria-hidden="true" />
            Лидеры
          </button>
        </div>
      </section>
    </div>
  );
}

function PauseOverlay() {
  const resumeGame = useGameStore((state) => state.resumeGame);
  const restartGame = useGameStore((state) => state.restartGame);

  return (
    <div className="modal-backdrop compact">
      <section className="modal-panel" aria-labelledby="pause-title">
        <h2 id="pause-title">Пауза</h2>
        <div className="modal-actions">
          <button className="primary-button" onClick={resumeGame}>
            <Play size={18} aria-hidden="true" />
            Продолжить
          </button>
          <button className="secondary-button" onClick={restartGame}>
            <RotateCcw size={18} aria-hidden="true" />
            Заново
          </button>
        </div>
      </section>
    </div>
  );
}

function GameOverOverlay() {
  const [name, setName] = useState("");
  const score = useGameStore((state) => state.score);
  const trashCollected = useGameStore((state) => state.trashCollected);
  const restartGame = useGameStore((state) => state.restartGame);
  const submitScore = useGameStore((state) => state.submitScore);
  const isSubmitting = useGameStore((state) => state.isSubmittingScore);
  const error = useGameStore((state) => state.submissionError);

  return (
    <div className="modal-backdrop">
      <section className="modal-panel result-panel" aria-labelledby="result-title">
        <h2 id="result-title">Раунд завершен</h2>
        <p className="result-message">Спасибо, что помогли очистить озеро Севан от отходов</p>
        <div className="result-grid">
          <div>
            <span>Очки</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span>Мусор</span>
            <strong>{trashCollected}</strong>
          </div>
        </div>

        <form
          className="score-form"
          onSubmit={(event) => {
            event.preventDefault();
            void submitScore(name);
          }}
        >
          <label htmlFor="player-name">Имя игрока</label>
          <input
            id="player-name"
            maxLength={24}
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="off"
          />
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button className="primary-button" type="submit" disabled={isSubmitting}>
              <Trophy size={18} aria-hidden="true" />
              {isSubmitting ? "Сохраняем" : "Сохранить"}
            </button>
            <button className="secondary-button" type="button" onClick={restartGame}>
              <RotateCcw size={18} aria-hidden="true" />
              Заново
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function LeaderboardOverlay() {
  const leaderboard = useGameStore((state) => state.leaderboard);
  const closeLeaderboard = useGameStore((state) => state.closeLeaderboard);
  const restartGame = useGameStore((state) => state.restartGame);

  return (
    <div className="modal-backdrop">
      <section className="modal-panel leaderboard-panel" aria-labelledby="leaderboard-title">
        <h2 id="leaderboard-title">Лидеры</h2>
        <Leaderboard scores={leaderboard} />
        <div className="modal-actions">
          <button className="primary-button" onClick={restartGame}>
            <Play size={18} aria-hidden="true" />
            Новый раунд
          </button>
          <button className="secondary-button" onClick={closeLeaderboard}>
            Закрыть
          </button>
        </div>
      </section>
    </div>
  );
}

export function App() {
  const phase = useGameStore((state) => state.phase);
  const loadLeaderboard = useGameStore((state) => state.loadLeaderboard);

  useEffect(() => {
    void loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <main className="app-shell">
      <GameCanvas />
      <GameHud />
      {phase === "ready" && <ReadyOverlay />}
      {phase === "paused" && <PauseOverlay />}
      {phase === "gameOver" && <GameOverOverlay />}
      {phase === "leaderboard" && <LeaderboardOverlay />}
    </main>
  );
}
