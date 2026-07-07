export type Point2 = {
  x: number;
  z: number;
};

export type TrashType = "bottle" | "bag" | "canister" | "can";

export type TrashItem = Point2 & {
  id: string;
  type: TrashType;
  points: number;
  rotation: number;
};

export type ObstacleType = "rock" | "log" | "island";

export type Obstacle = Point2 & {
  id: string;
  type: ObstacleType;
  radius: number;
  rotation?: number;
  drift?: {
    axis: "x" | "z";
    amplitude: number;
    speed: number;
    phase: number;
  };
};

export type Predator = Point2 & {
  id: string;
  radius: number;
  routeRadius: number;
  speed: number;
  phase: number;
  habitat: {
    radiusX: number;
    radiusZ: number;
    speed: number;
    phase: number;
  };
};

export type Storm = Point2 & {
  id: string;
  radius: number;
  startSecond: number;
  durationSeconds: number;
  phase: number;
};

export type ScoreEntry = {
  id: string;
  playerName: string;
  score: number;
  trashCollected: number;
  roundSeconds: number;
  createdAt: string;
};

export const ROUND_SECONDS = 60;
export const STARTING_LIVES = 3;
export const HIT_INVULNERABILITY_MS = 1500;
export const DAMAGE_FLASH_MS = 2000;
export const PREDATOR_ATTACK_SECONDS = 0.82;
export const STORM_WARNING_SECONDS = 3;
export const LAKE_RADIUS_X = 45;
export const LAKE_RADIUS_Z = 31;
export const BOAT_RADIUS = 1.35;
export const TRASH_PICKUP_RADIUS = 1.55;
export const INITIAL_TRASH_COUNT = 32;
export const SPAWN_POINT: Point2 = { x: 0, z: 20 };

export const TRASH_CATALOG: Record<
  TrashType,
  { label: string; points: number; color: string; accent: string }
> = {
  bottle: {
    label: "Бутылка",
    points: 10,
    color: "#7dd3fc",
    accent: "#0f766e",
  },
  bag: {
    label: "Пакет",
    points: 15,
    color: "#f8fafc",
    accent: "#f97316",
  },
  can: {
    label: "Банка",
    points: 20,
    color: "#facc15",
    accent: "#334155",
  },
  canister: {
    label: "Канистра",
    points: 25,
    color: "#fb7185",
    accent: "#7c2d12",
  },
};

export const OBSTACLES: Obstacle[] = [
  { id: "rock-northwest", type: "rock", x: -18, z: -10, radius: 2.5, rotation: 0.4 },
  { id: "rock-south", type: "rock", x: 5, z: 10, radius: 2.1, rotation: 1.2 },
  { id: "rock-east", type: "rock", x: 27, z: -5, radius: 2.4, rotation: -0.4 },
  { id: "island-west", type: "island", x: -28, z: 7, radius: 4.5, rotation: 0.2 },
  { id: "island-east", type: "island", x: 16, z: -17, radius: 4.1, rotation: -0.25 },
  {
    id: "log-upper",
    type: "log",
    x: -6,
    z: -20,
    radius: 2.6,
    rotation: 1.45,
    drift: { axis: "x", amplitude: 6.5, speed: 0.55, phase: 0.4 },
  },
  {
    id: "log-lower",
    type: "log",
    x: 21,
    z: 15,
    radius: 2.8,
    rotation: -0.9,
    drift: { axis: "z", amplitude: 5, speed: 0.75, phase: 2.2 },
  },
];

export const PREDATORS: Predator[] = [
  {
    id: "pike-cove",
    x: -10,
    z: 2,
    radius: 5.9,
    routeRadius: 2.9,
    speed: 2.05,
    phase: 0.3,
    habitat: { radiusX: 13, radiusZ: 7, speed: 0.39, phase: 0.1 },
  },
  {
    id: "catfish-basin",
    x: 22,
    z: 3,
    radius: 5.4,
    routeRadius: 2.6,
    speed: 1.82,
    phase: 2.1,
    habitat: { radiusX: 10, radiusZ: 10, speed: 0.35, phase: 2.4 },
  },
  {
    id: "deep-fin",
    x: -18,
    z: -16,
    radius: 5,
    routeRadius: 2.4,
    speed: 2.18,
    phase: 4.2,
    habitat: { radiusX: 11, radiusZ: 7, speed: 0.41, phase: 4.1 },
  },
  {
    id: "eel-runner",
    x: 8,
    z: -5,
    radius: 4.7,
    routeRadius: 2.2,
    speed: 2.32,
    phase: 1.35,
    habitat: { radiusX: 13, radiusZ: 8, speed: 0.37, phase: 1.7 },
  },
  {
    id: "shore-stalker",
    x: -4,
    z: 13,
    radius: 4.8,
    routeRadius: 2.2,
    speed: 2.08,
    phase: 5.4,
    habitat: { radiusX: 12, radiusZ: 7, speed: 0.43, phase: 5.2 },
  },
  {
    id: "sevan-hunter",
    x: 16,
    z: 17,
    radius: 4.6,
    routeRadius: 2.1,
    speed: 2.25,
    phase: 3.15,
    habitat: { radiusX: 12, radiusZ: 6, speed: 0.4, phase: 3.4 },
  },
];

export const STORMS: Storm[] = [
  {
    id: "north-squall",
    x: -22,
    z: -18,
    radius: 7.4,
    startSecond: 7,
    durationSeconds: 8,
    phase: 0.2,
  },
  {
    id: "eastern-gust",
    x: 27,
    z: -10,
    radius: 7,
    startSecond: 20,
    durationSeconds: 8,
    phase: 1.7,
  },
  {
    id: "western-surge",
    x: -28,
    z: 11,
    radius: 7.2,
    startSecond: 33,
    durationSeconds: 8,
    phase: 3.3,
  },
  {
    id: "south-rainwall",
    x: 18,
    z: 18,
    radius: 7,
    startSecond: 46,
    durationSeconds: 8,
    phase: 4.8,
  },
];
