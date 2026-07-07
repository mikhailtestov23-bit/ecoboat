import {
  INITIAL_TRASH_COUNT,
  LAKE_RADIUS_X,
  LAKE_RADIUS_Z,
  OBSTACLES,
  PREDATORS,
  SPAWN_POINT,
  TRASH_CATALOG,
  type Point2,
  type TrashItem,
  type TrashType,
} from "../gameConfig";
import { distance2D, isSafeWaterPoint } from "../geometry";
import { getTrashPoints } from "./scoring";

const TRASH_TYPES = Object.keys(TRASH_CATALOG) as TrashType[];

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function randomWaterPoint(random: () => number): Point2 {
  const angle = random() * Math.PI * 2;
  const radius = Math.sqrt(random());

  return {
    x: Math.cos(angle) * radius * (LAKE_RADIUS_X - 5),
    z: Math.sin(angle) * radius * (LAKE_RADIUS_Z - 5),
  };
}

function pickTrashType(random: () => number): TrashType {
  const roll = random();

  if (roll > 0.88) {
    return "canister";
  }

  if (roll > 0.65) {
    return "can";
  }

  if (roll > 0.36) {
    return "bag";
  }

  return "bottle";
}

export function createTrashItems(count = INITIAL_TRASH_COUNT, seed = Date.now()): TrashItem[] {
  const random = seededRandom(seed);
  const items: TrashItem[] = [];
  let attempts = 0;

  while (items.length < count && attempts < count * 80) {
    attempts += 1;
    const point = randomWaterPoint(random);
    const awayFromSpawn = distance2D(point, SPAWN_POINT) > 5;
    const awayFromTrash = items.every((item) => distance2D(point, item) > 2.3);

    if (!awayFromSpawn || !awayFromTrash || !isSafeWaterPoint(point, OBSTACLES, PREDATORS)) {
      continue;
    }

    const type = pickTrashType(random);
    items.push({
      id: `trash-${seed}-${items.length}-${Math.round(random() * 100000)}`,
      type,
      points: getTrashPoints(type),
      rotation: random() * Math.PI * 2,
      ...point,
    });
  }

  return items;
}

export function createReplacementTrash(seed: number, existing: TrashItem[]): TrashItem {
  const [replacement] = createTrashItems(1, seed + existing.length * 997);

  if (replacement) {
    return replacement;
  }

  return {
    id: `trash-fallback-${seed}`,
    type: TRASH_TYPES[seed % TRASH_TYPES.length],
    points: getTrashPoints(TRASH_TYPES[seed % TRASH_TYPES.length]),
    rotation: 0,
    x: 0,
    z: -6,
  };
}
