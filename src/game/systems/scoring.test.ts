import { describe, expect, it } from "vitest";
import { createScoreEntry, sanitizePlayerName, sortScores } from "./scoring";

describe("scoring", () => {
  it("sanitizes player names", () => {
    expect(sanitizePlayerName("  Eco   Captain  ")).toBe("Eco Captain");
    expect(sanitizePlayerName("abcdefghijklmnopqrstuvwxyz").length).toBe(24);
  });

  it("creates a rounded non-negative score entry", () => {
    const entry = createScoreEntry({
      playerName: "Mika",
      score: 42.7,
      trashCollected: 4.2,
    });

    expect(entry.playerName).toBe("Mika");
    expect(entry.score).toBe(43);
    expect(entry.trashCollected).toBe(4);
  });

  it("sorts scores by score and earlier tie time", () => {
    const scores = [
      {
        id: "late",
        playerName: "Late",
        score: 100,
        trashCollected: 5,
        roundSeconds: 120,
        createdAt: "2026-01-01T10:00:01.000Z",
      },
      {
        id: "early",
        playerName: "Early",
        score: 100,
        trashCollected: 5,
        roundSeconds: 120,
        createdAt: "2026-01-01T10:00:00.000Z",
      },
      {
        id: "best",
        playerName: "Best",
        score: 120,
        trashCollected: 6,
        roundSeconds: 120,
        createdAt: "2026-01-01T10:00:02.000Z",
      },
    ];

    expect(sortScores(scores).map((score) => score.id)).toEqual(["best", "early", "late"]);
  });
});
