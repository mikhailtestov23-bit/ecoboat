import { Float } from "@react-three/drei";
import { TRASH_CATALOG, type TrashItem } from "../game/gameConfig";

function Bottle({ item }: { item: TrashItem }) {
  const catalog = TRASH_CATALOG[item.type];

  return (
    <group rotation={[Math.PI / 2, 0, item.rotation]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.16, 0.2, 0.72, 16]} />
        <meshStandardMaterial color={catalog.color} roughness={0.32} metalness={0.03} />
      </mesh>
      <mesh castShadow position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.18, 12]} />
        <meshStandardMaterial color={catalog.accent} roughness={0.42} />
      </mesh>
    </group>
  );
}

function Bag({ item }: { item: TrashItem }) {
  const catalog = TRASH_CATALOG[item.type];

  return (
    <group rotation={[0, item.rotation, 0]}>
      <mesh castShadow scale={[0.58, 0.1, 0.42]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={catalog.color} roughness={0.78} />
      </mesh>
      <mesh castShadow position={[0.08, 0.09, -0.05]} scale={[0.2, 0.08, 0.16]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={catalog.accent} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Can({ item }: { item: TrashItem }) {
  const catalog = TRASH_CATALOG[item.type];

  return (
    <group rotation={[Math.PI / 2, 0, item.rotation]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.19, 0.19, 0.46, 20]} />
        <meshStandardMaterial color={catalog.color} roughness={0.38} metalness={0.22} />
      </mesh>
      <mesh castShadow position={[0, 0.25, 0]}>
        <torusGeometry args={[0.12, 0.014, 8, 18]} />
        <meshStandardMaterial color={catalog.accent} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Canister({ item }: { item: TrashItem }) {
  const catalog = TRASH_CATALOG[item.type];

  return (
    <group rotation={[0, item.rotation, 0]}>
      <mesh castShadow scale={[0.42, 0.18, 0.56]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={catalog.color} roughness={0.5} />
      </mesh>
      <mesh castShadow position={[0, 0.2, -0.12]} scale={[0.18, 0.12, 0.12]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={catalog.accent} roughness={0.5} />
      </mesh>
    </group>
  );
}

function TrashModel({ item }: { item: TrashItem }) {
  if (item.type === "bottle") {
    return <Bottle item={item} />;
  }

  if (item.type === "bag") {
    return <Bag item={item} />;
  }

  if (item.type === "canister") {
    return <Canister item={item} />;
  }

  return <Can item={item} />;
}

export function TrashField({ items }: { items: TrashItem[] }) {
  return (
    <group>
      {items.map((item) => (
        <Float key={item.id} speed={1.6} floatIntensity={0.12} rotationIntensity={0.12}>
          <group position={[item.x, 0.32, item.z]}>
            <TrashModel item={item} />
          </group>
        </Float>
      ))}
    </group>
  );
}
