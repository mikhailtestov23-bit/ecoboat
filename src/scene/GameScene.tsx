import { Boat } from "./Boat";
import { CameraRig } from "./CameraRig";
import { GameLoop } from "./GameLoop";
import { Lake } from "./Lake";
import { Lighting } from "./Lighting";
import { Obstacles } from "./Obstacles";
import { Predators } from "./Predators";
import { Storms } from "./Storms";
import { TrashField } from "./Trash";
import { useGameStore } from "../game/gameStore";

export function GameScene() {
  const trash = useGameStore((state) => state.trash);

  return (
    <>
      <Lighting />
      <Lake />
      <TrashField items={trash} />
      <Obstacles />
      <Predators />
      <Storms />
      <Boat />
      <GameLoop />
      <CameraRig />
    </>
  );
}
