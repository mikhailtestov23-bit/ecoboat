import { Trophy } from "lucide-react";
import type { ScoreEntry } from "../game/gameConfig";

export function Leaderboard({ scores }: { scores: ScoreEntry[] }) {
  if (scores.length === 0) {
    return (
      <div className="empty-state">
        <Trophy size={32} aria-hidden="true" />
        <p>Результатов пока нет</p>
      </div>
    );
  }

  return (
    <ol className="leaderboard-list">
      {scores.map((score, index) => (
        <li key={score.id} className="leaderboard-row">
          <span className="rank">{index + 1}</span>
          <span className="leader-name">{score.playerName}</span>
          <span className="leader-score">{score.score}</span>
        </li>
      ))}
    </ol>
  );
}
