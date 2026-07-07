import {
  LAKE_RADIUS_X,
  LAKE_RADIUS_Z,
  type Obstacle,
  type Point2,
  type Predator,
  type Storm,
} from "./gameConfig";

export function distance2D(a: Point2, b: Point2): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function isInsideLake(point: Point2, margin = 0): boolean {
  const radiusX = Math.max(1, LAKE_RADIUS_X - margin);
  const radiusZ = Math.max(1, LAKE_RADIUS_Z - margin);
  return point.x ** 2 / radiusX ** 2 + point.z ** 2 / radiusZ ** 2 <= 1;
}

export function clampToLake(point: Point2, margin = 0): Point2 {
  if (isInsideLake(point, margin)) {
    return point;
  }

  const radiusX = Math.max(1, LAKE_RADIUS_X - margin);
  const radiusZ = Math.max(1, LAKE_RADIUS_Z - margin);
  const angle = Math.atan2(point.z / radiusZ, point.x / radiusX);

  return {
    x: Math.cos(angle) * radiusX,
    z: Math.sin(angle) * radiusZ,
  };
}

export function getObstaclePosition(obstacle: Obstacle, elapsedSeconds: number): Point2 {
  if (!obstacle.drift) {
    return { x: obstacle.x, z: obstacle.z };
  }

  const offset =
    Math.sin(elapsedSeconds * obstacle.drift.speed + obstacle.drift.phase) *
    obstacle.drift.amplitude;

  return {
    x: obstacle.x + (obstacle.drift.axis === "x" ? offset : 0),
    z: obstacle.z + (obstacle.drift.axis === "z" ? offset : 0),
  };
}

export function getPredatorPosition(predator: Predator, elapsedSeconds: number): Point2 {
  const habitatAngle = elapsedSeconds * predator.habitat.speed + predator.habitat.phase;
  const point = {
    x: predator.x + Math.cos(habitatAngle) * predator.habitat.radiusX,
    z: predator.z + Math.sin(habitatAngle * 0.86) * predator.habitat.radiusZ,
  };

  return clampToLake(point, predator.radius + 2);
}

export function isStormActive(storm: Storm, elapsedSeconds: number): boolean {
  return (
    elapsedSeconds >= storm.startSecond &&
    elapsedSeconds <= storm.startSecond + storm.durationSeconds
  );
}

export function isStormWarning(storm: Storm, elapsedSeconds: number, warningSeconds: number): boolean {
  return elapsedSeconds >= storm.startSecond - warningSeconds && elapsedSeconds < storm.startSecond;
}

export function getActiveStorms(storms: Storm[], elapsedSeconds: number): Storm[] {
  return storms.filter((storm) => isStormActive(storm, elapsedSeconds));
}

export function isSafeWaterPoint(
  point: Point2,
  obstacles: Obstacle[],
  predators: Predator[],
  elapsedSeconds = 0,
): boolean {
  if (!isInsideLake(point, 3.2)) {
    return false;
  }

  const obstacleClearance = obstacles.every((obstacle) => {
    const obstaclePoint = getObstaclePosition(obstacle, elapsedSeconds);
    return distance2D(point, obstaclePoint) > obstacle.radius + 3;
  });

  const predatorClearance = predators.every((predator) => {
    const predatorPoint = getPredatorPosition(predator, elapsedSeconds);
    return distance2D(point, predatorPoint) > predator.radius + 1.5;
  });

  return obstacleClearance && predatorClearance;
}

export function lerpAngle(from: number, to: number, amount: number): number {
  const shortest = ((((to - from) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  return from + shortest * amount;
}
