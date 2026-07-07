import { describe, expect, it } from "vitest";
import {
  DAMAGE_FLASH_MS,
  PREDATOR_ATTACK_SECONDS,
  PREDATORS,
  ROUND_SECONDS,
  STORM_WARNING_SECONDS,
  STORMS,
} from "./gameConfig";

describe("game balance", () => {
  it("uses a short 60 second round", () => {
    expect(ROUND_SECONDS).toBe(60);
  });

  it("keeps predator pressure high", () => {
    expect(PREDATORS.length).toBeGreaterThanOrEqual(6);
    expect(PREDATOR_ATTACK_SECONDS).toBeLessThanOrEqual(0.82);
    expect(PREDATORS.every((predator) => predator.speed >= 1.8)).toBe(true);
    expect(PREDATORS.every((predator) => predator.habitat.speed >= 0.35)).toBe(true);
  });

  it("shows damage feedback long enough to notice", () => {
    expect(DAMAGE_FLASH_MS).toBeGreaterThanOrEqual(2000);
  });

  it("spawns four storm events with a three second warning", () => {
    expect(STORMS).toHaveLength(4);
    expect(STORM_WARNING_SECONDS).toBe(3);
    expect(STORMS.every((storm) => storm.startSecond + storm.durationSeconds <= ROUND_SECONDS)).toBe(true);
    expect(new Set(STORMS.map((storm) => `${storm.x}:${storm.z}`)).size).toBe(4);
  });
});
