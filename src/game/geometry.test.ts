import { describe, expect, it } from "vitest";
import { LAKE_RADIUS_X, OBSTACLES, PREDATORS, STORM_WARNING_SECONDS, STORMS } from "./gameConfig";
import {
  clampToLake,
  distance2D,
  getPredatorPosition,
  isInsideLake,
  isSafeWaterPoint,
  isStormActive,
  isStormWarning,
} from "./geometry";

describe("lake geometry", () => {
  it("keeps center points inside the lake", () => {
    expect(isInsideLake({ x: 0, z: 0 })).toBe(true);
    expect(isInsideLake({ x: LAKE_RADIUS_X + 10, z: 0 })).toBe(false);
  });

  it("clamps a point to the playable water area", () => {
    const point = clampToLake({ x: 80, z: 0 }, 2);
    expect(isInsideLake(point, 2)).toBe(true);
    expect(point.x).toBeLessThan(LAKE_RADIUS_X);
  });

  it("rejects unsafe spawn points near obstacles", () => {
    const obstacle = OBSTACLES[0];
    expect(isSafeWaterPoint(obstacle, OBSTACLES, PREDATORS)).toBe(false);
    expect(distance2D({ x: 0, z: 0 }, { x: 3, z: 4 })).toBe(5);
  });

  it("moves predator habitat centers while keeping them inside the lake", () => {
    const predator = PREDATORS[0];
    const start = getPredatorPosition(predator, 0);
    const later = getPredatorPosition(predator, 15);

    expect(distance2D(start, later)).toBeGreaterThan(1);
    expect(isInsideLake(start, predator.radius + 2)).toBe(true);
    expect(isInsideLake(later, predator.radius + 2)).toBe(true);
  });

  it("warns before storms but only damages after the storm starts", () => {
    const storm = STORMS[0];
    const warningTime = storm.startSecond - STORM_WARNING_SECONDS + 0.5;

    expect(isStormWarning(storm, warningTime, STORM_WARNING_SECONDS)).toBe(true);
    expect(isStormActive(storm, warningTime)).toBe(false);
    expect(isStormActive(storm, storm.startSecond)).toBe(true);
  });
});
