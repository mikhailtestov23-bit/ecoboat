import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { STORM_WARNING_SECONDS, STORMS, type Storm } from "../game/gameConfig";
import { isStormActive, isStormWarning } from "../game/geometry";
import { useGameStore } from "../game/gameStore";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function StormZone({ storm }: { storm: Storm }) {
  const groupRef = useRef<THREE.Group>(null);
  const rainGroupRef = useRef<THREE.Group>(null);
  const diskMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringMaterialRef = useRef<THREE.MeshBasicMaterial>(null);
  const rainDrops = useMemo(
    () =>
      Array.from({ length: 34 }).map((_, index) => {
        const angle = (index * 2.399 + storm.phase) % (Math.PI * 2);
        const radius = Math.sqrt(((index * 37) % 100) / 100) * storm.radius * 0.92;

        return {
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius,
          y: 1.3 + ((index * 17) % 100) / 42,
          tilt: ((index % 7) - 3) * 0.06,
        };
      }),
    [storm],
  );

  useFrame(() => {
    const group = groupRef.current;
    const rainGroup = rainGroupRef.current;
    const diskMaterial = diskMaterialRef.current;
    const ringMaterial = ringMaterialRef.current;
    const elapsedSeconds = useGameStore.getState().elapsedSeconds;
    const isWarning = isStormWarning(storm, elapsedSeconds, STORM_WARNING_SECONDS);
    const isActive = isStormActive(storm, elapsedSeconds);

    if (!group || !rainGroup || !diskMaterial || !ringMaterial) {
      return;
    }

    group.visible = isWarning || isActive;

    if (!group.visible) {
      return;
    }

    const warningProgress = clamp01(
      (elapsedSeconds - (storm.startSecond - STORM_WARNING_SECONDS)) / STORM_WARNING_SECONDS,
    );
    const warningOpacity = 0.08 + warningProgress * 0.14;
    const activeOpacity = 0.28;

    group.rotation.y = elapsedSeconds * 0.16 + storm.phase;
    rainGroup.visible = isActive;
    diskMaterial.opacity = isActive ? activeOpacity : warningOpacity;
    ringMaterial.opacity = isActive ? 0.4 : 0.2 + warningProgress * 0.16;
    rainGroup.position.y = Math.sin(elapsedSeconds * 12 + storm.phase) * 0.08;
  });

  return (
    <group ref={groupRef} position={[storm.x, 0.12, storm.z]} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[storm.radius, storm.radius, 1]}>
        <circleGeometry args={[1, 72]} />
        <meshBasicMaterial
          ref={diskMaterialRef}
          color="#1e3a8a"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[storm.radius * 1.04, storm.radius * 1.04, 1]}>
        <ringGeometry args={[0.8, 1, 96]} />
        <meshBasicMaterial
          ref={ringMaterialRef}
          color="#bae6fd"
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={rainGroupRef} visible={false}>
        {rainDrops.map((drop, index) => (
          <mesh
            key={`${storm.id}-rain-${index}`}
            position={[drop.x, drop.y, drop.z]}
            rotation={[drop.tilt, 0, drop.tilt + 0.45]}
          >
            <cylinderGeometry args={[0.025, 0.025, 1.7, 6]} />
            <meshBasicMaterial color="#dbeafe" transparent opacity={0.52} depthWrite={false} />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 2.7, 0]} scale={[storm.radius * 0.32, 0.12, storm.radius * 0.24]}>
        <sphereGeometry args={[1, 18, 8]} />
        <meshBasicMaterial color="#1f2937" transparent opacity={0.38} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Storms() {
  return (
    <group>
      {STORMS.map((storm) => (
        <StormZone key={storm.id} storm={storm} />
      ))}
    </group>
  );
}
