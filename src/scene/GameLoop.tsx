import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import {
  BOAT_RADIUS,
  OBSTACLES,
  PREDATOR_ATTACK_SECONDS,
  PREDATORS,
  STORMS,
  TRASH_PICKUP_RADIUS,
} from "../game/gameConfig";
import {
  distance2D,
  getActiveStorms,
  getObstaclePosition,
  getPredatorPosition,
} from "../game/geometry";
import { useGameStore } from "../game/gameStore";

export function GameLoop() {
  const predatorTimersRef = useRef<Record<string, number>>({});

  useFrame((_, delta) => {
    const store = useGameStore.getState();

    store.tickRound(delta);

    const state = useGameStore.getState();

    if (state.phase !== "playing") {
      return;
    }

    const boat = state.boatPosition;

    for (const item of state.trash) {
      if (distance2D(boat, item) <= TRASH_PICKUP_RADIUS) {
        store.collectTrash(item.id);
        break;
      }
    }

    for (const obstacle of OBSTACLES) {
      const obstaclePosition = getObstaclePosition(obstacle, state.elapsedSeconds);

      if (distance2D(boat, obstaclePosition) <= BOAT_RADIUS + obstacle.radius * 0.78) {
        store.loseLife("obstacle", obstaclePosition);
        return;
      }
    }

    for (const storm of getActiveStorms(STORMS, state.elapsedSeconds)) {
      if (distance2D(boat, storm) <= BOAT_RADIUS + storm.radius) {
        store.loseLife("storm", storm);
        return;
      }
    }

    let activePredatorId: string | null = null;

    for (const predator of PREDATORS) {
      const predatorPosition = getPredatorPosition(predator, state.elapsedSeconds);
      const isInside = distance2D(boat, predatorPosition) <= predator.radius;

      if (!isInside) {
        predatorTimersRef.current[predator.id] = 0;
        continue;
      }

      const nextTime = (predatorTimersRef.current[predator.id] ?? 0) + delta;
      predatorTimersRef.current[predator.id] = nextTime;
      activePredatorId = predator.id;

      if (nextTime >= PREDATOR_ATTACK_SECONDS) {
        predatorTimersRef.current[predator.id] = 0;
        store.loseLife("predator", predatorPosition);
        return;
      }
    }

    store.setPredatorWarning(activePredatorId);
  });

  return null;
}
