import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "../game/gameStore";

const desiredPosition = new THREE.Vector3();
const target = new THREE.Vector3();

export function CameraRig() {
  useFrame(({ camera }, delta) => {
    const boatPosition = useGameStore.getState().boatPosition;
    desiredPosition.set(boatPosition.x, 29, boatPosition.z + 35);
    target.set(boatPosition.x, 0.1, boatPosition.z - 3);

    camera.position.lerp(desiredPosition, 1 - Math.exp(-3.5 * delta));
    camera.lookAt(target);
  });

  return null;
}
