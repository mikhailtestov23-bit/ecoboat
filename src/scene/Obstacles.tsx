import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { OBSTACLES, type Obstacle } from "../game/gameConfig";
import { getObstaclePosition } from "../game/geometry";
import { useGameStore } from "../game/gameStore";

function Rock({ obstacle }: { obstacle: Obstacle }) {
  return (
    <group rotation={[0.12, obstacle.rotation ?? 0, -0.08]}>
      <mesh castShadow receiveShadow scale={[obstacle.radius * 0.72, obstacle.radius * 0.45, obstacle.radius * 0.62]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#6b7280" roughness={0.94} />
      </mesh>
      <mesh castShadow position={[0.35, 0.15, -0.2]} scale={[obstacle.radius * 0.32, obstacle.radius * 0.24, obstacle.radius * 0.28]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#475569" roughness={0.95} />
      </mesh>
    </group>
  );
}

function Log({ obstacle }: { obstacle: Obstacle }) {
  return (
    <group rotation={[0, obstacle.rotation ?? 0, Math.PI / 2]}>
      <mesh castShadow receiveShadow scale={[0.78, 0.78, obstacle.radius * 0.82]}>
        <cylinderGeometry args={[0.55, 0.72, 1, 20]} />
        <meshStandardMaterial color="#854d0e" roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0, 0, obstacle.radius * 0.44]} scale={[0.8, 0.8, 0.08]}>
        <cylinderGeometry args={[0.57, 0.57, 1, 20]} />
        <meshStandardMaterial color="#d6a15f" roughness={0.75} />
      </mesh>
    </group>
  );
}

function Island({ obstacle }: { obstacle: Obstacle }) {
  return (
    <group rotation={[0, obstacle.rotation ?? 0, 0]}>
      <mesh castShadow receiveShadow scale={[obstacle.radius * 0.9, 0.44, obstacle.radius * 0.72]}>
        <cylinderGeometry args={[1, 0.82, 0.9, 32]} />
        <meshStandardMaterial color="#b08d57" roughness={0.95} />
      </mesh>
      <mesh castShadow position={[0, 0.48, 0]} scale={[obstacle.radius * 0.74, 0.16, obstacle.radius * 0.58]}>
        <cylinderGeometry args={[1, 1, 1, 32]} />
        <meshStandardMaterial color="#4d7c0f" roughness={0.88} />
      </mesh>
      <mesh castShadow position={[-0.6, 0.88, 0.2]} scale={[0.18, 0.65, 0.18]}>
        <cylinderGeometry args={[1, 0.8, 1, 10]} />
        <meshStandardMaterial color="#7c4a21" roughness={0.82} />
      </mesh>
      <mesh castShadow position={[-0.6, 1.38, 0.2]} rotation={[0.2, 0.2, 0.2]} scale={[0.75, 0.34, 0.75]}>
        <coneGeometry args={[1, 0.7, 7]} />
        <meshStandardMaterial color="#22c55e" roughness={0.72} />
      </mesh>
    </group>
  );
}

function ObstacleModel({ obstacle }: { obstacle: Obstacle }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }

    const position = getObstaclePosition(obstacle, useGameStore.getState().elapsedSeconds);
    group.position.set(position.x, obstacle.type === "log" ? 0.36 : 0.42, position.z);
  });

  return (
    <group ref={groupRef}>
      {obstacle.type === "rock" && <Rock obstacle={obstacle} />}
      {obstacle.type === "log" && <Log obstacle={obstacle} />}
      {obstacle.type === "island" && <Island obstacle={obstacle} />}
    </group>
  );
}

export function Obstacles() {
  return (
    <group>
      {OBSTACLES.map((obstacle) => (
        <ObstacleModel key={obstacle.id} obstacle={obstacle} />
      ))}
    </group>
  );
}
