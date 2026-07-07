import { useMemo } from "react";
import * as THREE from "three";
import { LAKE_RADIUS_Z } from "../game/gameConfig";

const MOUNTAIN_HEIGHT_SCALE = 0.24;

type RidgePoint = {
  x: number;
  height: number;
};

type RidgeLayerProps = {
  color: string;
  points: RidgePoint[];
  z: number;
  y?: number;
  opacity?: number;
};

type SnowCapProps = {
  x: number;
  z: number;
  peak: number;
  width: number;
  height: number;
  color?: string;
};

function createRidgeShape(points: RidgePoint[]) {
  const shape = new THREE.Shape();
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  shape.moveTo(firstPoint.x, 0);

  for (const point of points) {
    shape.lineTo(point.x, point.height);
  }

  shape.lineTo(lastPoint.x, 0);
  shape.lineTo(firstPoint.x, 0);
  shape.closePath();

  return shape;
}

function RidgeLayer({ color, points, z, y = 0, opacity = 1 }: RidgeLayerProps) {
  const shape = useMemo(() => createRidgeShape(points), [points]);

  return (
    <mesh position={[0, y, z]} scale={[1, MOUNTAIN_HEIGHT_SCALE, 1]} receiveShadow>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial
        color={color}
        roughness={0.95}
        metalness={0}
        side={THREE.DoubleSide}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

function SnowCap({ x, z, peak, width, height, color = "#f8fafc" }: SnowCapProps) {
  const shape = useMemo(() => {
    const cap = new THREE.Shape();
    cap.moveTo(x - width * 0.5, peak - height);
    cap.lineTo(x, peak);
    cap.lineTo(x + width * 0.5, peak - height);
    cap.lineTo(x + width * 0.18, peak - height * 0.68);
    cap.lineTo(x, peak - height * 0.88);
    cap.lineTo(x - width * 0.18, peak - height * 0.68);
    cap.closePath();
    return cap;
  }, [height, peak, width, x]);

  return (
    <mesh position={[0, 0.04, z]} scale={[1, MOUNTAIN_HEIGHT_SCALE, 1]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color={color} roughness={0.72} metalness={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Foothills() {
  return (
    <mesh position={[0, 0.01, -LAKE_RADIUS_Z - 10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[128, 18, 1, 1]} />
      <meshStandardMaterial color="#4f7f45" roughness={0.96} />
    </mesh>
  );
}

export function MountainBackdrop() {
  const farRidge = useMemo(
    () => [
      { x: -86, height: 0 },
      { x: -74, height: 11 },
      { x: -62, height: 18 },
      { x: -48, height: 13 },
      { x: -34, height: 25 },
      { x: -19, height: 15 },
      { x: -4, height: 28 },
      { x: 13, height: 17 },
      { x: 29, height: 23 },
      { x: 43, height: 14 },
      { x: 58, height: 21 },
      { x: 72, height: 12 },
      { x: 86, height: 0 },
    ],
    [],
  );
  const middleRidge = useMemo(
    () => [
      { x: -78, height: 0 },
      { x: -67, height: 15 },
      { x: -53, height: 24 },
      { x: -39, height: 14 },
      { x: -24, height: 31 },
      { x: -9, height: 18 },
      { x: 7, height: 26 },
      { x: 21, height: 16 },
      { x: 36, height: 29 },
      { x: 51, height: 15 },
      { x: 65, height: 21 },
      { x: 78, height: 0 },
    ],
    [],
  );
  const nearRidge = useMemo(
    () => [
      { x: -68, height: 0 },
      { x: -57, height: 10 },
      { x: -43, height: 18 },
      { x: -31, height: 12 },
      { x: -17, height: 21 },
      { x: -2, height: 13 },
      { x: 12, height: 20 },
      { x: 26, height: 12 },
      { x: 40, height: 19 },
      { x: 54, height: 11 },
      { x: 68, height: 0 },
    ],
    [],
  );

  return (
    <group>
      <Foothills />
      <RidgeLayer color="#86a8a3" opacity={0.9} points={farRidge} z={-LAKE_RADIUS_Z - 28} y={0.1} />
      <RidgeLayer color="#587f76" points={middleRidge} z={-LAKE_RADIUS_Z - 21} y={0.06} />
      <SnowCap x={-24} z={-LAKE_RADIUS_Z - 20.9} peak={31} width={12} height={5.2} />
      <SnowCap x={7} z={-LAKE_RADIUS_Z - 20.9} peak={26} width={9} height={4.2} color="#eef7fb" />
      <SnowCap x={36} z={-LAKE_RADIUS_Z - 20.9} peak={29} width={10} height={4.8} />
      <RidgeLayer color="#416b4a" points={nearRidge} z={-LAKE_RADIUS_Z - 13} />
    </group>
  );
}
