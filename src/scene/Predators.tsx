import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { PREDATORS, type Predator } from "../game/gameConfig";
import { getPredatorPosition } from "../game/geometry";
import { useGameStore } from "../game/gameStore";

function PredatorZone({ predator }: { predator: Predator }) {
  const zoneRef = useRef<THREE.Mesh>(null);
  const finRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const isWarning = state.warningPredatorId === predator.id;
    const zone = zoneRef.current;
    const fin = finRef.current;
    const center = getPredatorPosition(predator, state.elapsedSeconds);

    if (zone) {
      const pulse = isWarning ? 1 + Math.sin(state.elapsedSeconds * 10) * 0.08 : 1;
      zone.position.set(center.x, 0.12, center.z);
      zone.scale.set(predator.radius * pulse, predator.radius * pulse, 1);
      const material = zone.material as THREE.MeshBasicMaterial;
      material.opacity = isWarning ? 0.28 : 0.11;
    }

    if (fin) {
      const angle = state.elapsedSeconds * predator.speed + predator.phase;
      const x = center.x + Math.cos(angle) * predator.routeRadius;
      const z = center.z + Math.sin(angle) * predator.routeRadius;
      fin.position.lerp(new THREE.Vector3(x, 0.26, z), 1 - Math.exp(-8 * delta));
      fin.rotation.y = -angle + Math.PI * 0.5;
    }
  });

  return (
    <group>
      <mesh ref={zoneRef} position={[predator.x, 0.12, predator.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 96]} />
        <meshBasicMaterial color="#fb7185" transparent opacity={0.11} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      <group ref={finRef} position={[predator.x, 0.26, predator.z]}>
        <mesh castShadow rotation={[0.18, 0, 0]} scale={[0.52, 0.8, 0.22]}>
          <coneGeometry args={[0.65, 1.15, 3]} />
          <meshStandardMaterial color="#172554" roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.22, 0]} scale={[1.5, 0.05, 0.8]}>
          <sphereGeometry args={[1, 16, 8]} />
          <meshBasicMaterial color="#164e63" transparent opacity={0.2} />
        </mesh>
      </group>
    </group>
  );
}

export function Predators() {
  return (
    <group>
      {PREDATORS.map((predator) => (
        <PredatorZone key={predator.id} predator={predator} />
      ))}
    </group>
  );
}
