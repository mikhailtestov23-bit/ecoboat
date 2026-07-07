import { useMemo } from "react";
import * as THREE from "three";
import { LAKE_RADIUS_X, LAKE_RADIUS_Z } from "../game/gameConfig";

function WaterSurface() {
  return (
    <mesh receiveShadow position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[LAKE_RADIUS_X, LAKE_RADIUS_Z, 1]}>
      <circleGeometry args={[1, 160]} />
      <meshStandardMaterial
        color="#2dd4bf"
        emissive="#0f766e"
        emissiveIntensity={0.16}
        metalness={0.05}
        roughness={0.35}
        transparent
        opacity={0.78}
      />
    </mesh>
  );
}

function WaterRings() {
  const rings = useMemo(
    () => [
      { scale: [16, 10.2, 1], position: [-9, 0.08, -5], rotation: 0.25 },
      { scale: [11, 7.2, 1], position: [13, 0.085, 8], rotation: -0.45 },
      { scale: [8.5, 5.6, 1], position: [1, 0.09, -13], rotation: 0.9 },
      { scale: [13, 8.4, 1], position: [-17, 0.095, 11], rotation: -0.2 },
    ],
    [],
  );

  return (
    <>
      {rings.map((ring, index) => (
        <mesh
          key={`water-ring-${index}`}
          position={ring.position as [number, number, number]}
          rotation={[-Math.PI / 2, 0, ring.rotation]}
          scale={ring.scale as [number, number, number]}
        >
          <ringGeometry args={[0.94, 1, 96]} />
          <meshBasicMaterial color="#cffafe" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

function Shoreline() {
  return (
    <>
      <mesh receiveShadow position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[116, 86]} />
        <meshStandardMaterial color="#5f8f46" roughness={0.92} />
      </mesh>

      <mesh receiveShadow position={[0, -0.028, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[LAKE_RADIUS_X + 7, LAKE_RADIUS_Z + 7, 1]}>
        <ringGeometry args={[0.76, 1, 192]} />
        <meshStandardMaterial color="#a3b763" roughness={0.9} />
      </mesh>

      <mesh receiveShadow position={[0, -0.016, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[LAKE_RADIUS_X + 1.2, LAKE_RADIUS_Z + 1.2, 1]}>
        <ringGeometry args={[0.96, 1, 192]} />
        <meshStandardMaterial color="#d7b56d" roughness={0.86} />
      </mesh>
    </>
  );
}

export function Lake() {
  return (
    <group>
      <Shoreline />
      <WaterSurface />
      <WaterRings />
    </group>
  );
}
