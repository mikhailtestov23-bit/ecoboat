import { CuboidCollider, RigidBody, type RapierRigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { BOAT_RADIUS, DAMAGE_FLASH_MS, SPAWN_POINT } from "../game/gameConfig";
import { clampToLake } from "../game/geometry";
import { useGameStore } from "../game/gameStore";
import {
  getDirectionFromButtons,
  getKeyboardDirection,
  useInputStore,
  useKeyboardInput,
} from "../game/systems/input";

const BOAT_Y = 0.55;
const FORWARD_SPEED = 10.8;
const REVERSE_SPEED = 4.8;
const GAS_RESPONSE = 8.5;
const BRAKE_RESPONSE = 17;
const REVERSE_RESPONSE = 6.5;
const COAST_RESPONSE = 3.4;
const TURN_RATE = 2.45;
const PAUSE_DRAG = 14;
const HIT_KNOCKBACK_SPEED = 8.6;
const HIT_DRAG = 5.2;
const DAMAGE_BLINK_INTERVAL_MS = 140;

function clampInput(value: number): number {
  return Math.max(-1, Math.min(1, value));
}

function moveToward(current: number, target: number, response: number, delta: number): number {
  return current + (target - current) * (1 - Math.exp(-response * delta));
}

function EcoBoatModel() {
  return (
    <group>
      <mesh castShadow position={[0, 0.12, 0]} scale={[1.45, 0.42, 2.65]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#0f766e" roughness={0.62} metalness={0.08} />
      </mesh>

      <mesh castShadow position={[0, 0.22, -1.52]} rotation={[Math.PI / 2, 0, 0]} scale={[1.42, 0.52, 0.56]}>
        <coneGeometry args={[0.52, 0.9, 4]} />
        <meshStandardMaterial color="#115e59" roughness={0.58} />
      </mesh>

      <mesh castShadow position={[0, 0.62, 0.28]} scale={[0.78, 0.58, 0.76]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#ecfdf5" roughness={0.55} />
      </mesh>

      <mesh castShadow position={[0, 0.96, 0.08]} rotation={[-0.18, 0, 0]} scale={[1.02, 0.08, 0.72]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#1e293b" emissive="#22c55e" emissiveIntensity={0.12} roughness={0.28} />
      </mesh>

      <mesh castShadow position={[-1.28, 0.16, -0.85]} rotation={[0, 0, 0.18]} scale={[0.15, 0.12, 1.25]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#facc15" roughness={0.5} />
      </mesh>

      <mesh castShadow position={[1.28, 0.16, -0.85]} rotation={[0, 0, -0.18]} scale={[0.15, 0.12, 1.25]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#facc15" roughness={0.5} />
      </mesh>

      <mesh castShadow position={[0, 0.1, 1.62]} scale={[1.65, 0.08, 0.35]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.42} metalness={0.18} />
      </mesh>
    </group>
  );
}

function DamageFlashOverlay() {
  const overlayRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const overlay = overlayRef.current;
    const material = materialRef.current;

    if (!overlay || !material) {
      return;
    }

    const { lastHitAt } = useGameStore.getState();
    const elapsedMs = performance.now() - lastHitAt;
    const isFlashing =
      lastHitAt >= 0 &&
      elapsedMs >= 0 &&
      elapsedMs <= DAMAGE_FLASH_MS &&
      Math.floor(elapsedMs / DAMAGE_BLINK_INTERVAL_MS) % 2 === 0;

    overlay.visible = isFlashing;
    material.opacity = isFlashing ? 0.48 - (elapsedMs / DAMAGE_FLASH_MS) * 0.18 : 0;
  });

  return (
    <group ref={overlayRef} visible={false}>
      <mesh position={[0, 0.13, 0]} scale={[1.58, 0.5, 2.84]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial ref={materialRef} color="#ef4444" transparent opacity={0.48} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.64, 0.28]} scale={[0.9, 0.7, 0.9]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.38} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.24, -1.58]} rotation={[Math.PI / 2, 0, 0]} scale={[1.5, 0.62, 0.62]}>
        <coneGeometry args={[0.52, 0.9, 4]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.42} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Boat() {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const speedRef = useRef(0);
  const nudgeVelocityRef = useRef(new THREE.Vector2(0, 0));
  const yawRef = useRef(0);
  const hitNudgeTokenRef = useRef(useGameStore.getState().hitNudge?.token ?? 0);
  const resetTokenRef = useRef(useGameStore.getState().resetBoatToken);
  const pressedRef = useKeyboardInput();

  useEffect(() => {
    useGameStore.getState().setBoatPosition(SPAWN_POINT);
  }, []);

  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const body = rigidBodyRef.current;

    if (!body) {
      return;
    }

    if (resetTokenRef.current !== state.resetBoatToken) {
      resetTokenRef.current = state.resetBoatToken;
      hitNudgeTokenRef.current = state.hitNudge?.token ?? 0;
      speedRef.current = 0;
      nudgeVelocityRef.current.set(0, 0);
      yawRef.current = 0;
      body.setNextKinematicTranslation({ x: SPAWN_POINT.x, y: BOAT_Y, z: SPAWN_POINT.z });
      body.setNextKinematicRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yawRef.current, 0)));
      useGameStore.getState().setBoatPosition(SPAWN_POINT);
      return;
    }

    if (state.phase !== "playing") {
      speedRef.current = moveToward(speedRef.current, 0, PAUSE_DRAG, delta);
      nudgeVelocityRef.current.multiplyScalar(Math.exp(-PAUSE_DRAG * delta));
      return;
    }

    if (state.hitNudge && hitNudgeTokenRef.current !== state.hitNudge.token) {
      hitNudgeTokenRef.current = state.hitNudge.token;
      speedRef.current *= 0.18;
      nudgeVelocityRef.current.set(state.hitNudge.x, state.hitNudge.z).multiplyScalar(HIT_KNOCKBACK_SPEED);
    }

    const keyboardDirection = getKeyboardDirection(pressedRef.current);
    const virtualDirection = getDirectionFromButtons(useInputStore.getState().virtualButtons);
    const turnInput = clampInput(-(keyboardDirection.x + virtualDirection.x));
    const throttleInput = clampInput(-(keyboardDirection.z + virtualDirection.z));

    if (Math.abs(turnInput) > 0.001) {
      const speedRatio = Math.min(1, Math.abs(speedRef.current) / FORWARD_SPEED);
      yawRef.current += turnInput * TURN_RATE * (0.62 + speedRatio * 0.42) * delta;
    }

    if (throttleInput > 0.001) {
      speedRef.current = moveToward(speedRef.current, FORWARD_SPEED * throttleInput, GAS_RESPONSE, delta);
    } else if (throttleInput < -0.001) {
      const targetReverseSpeed = -REVERSE_SPEED * Math.abs(throttleInput);
      const response = speedRef.current > 0.2 ? BRAKE_RESPONSE : REVERSE_RESPONSE;
      speedRef.current = moveToward(speedRef.current, targetReverseSpeed, response, delta);
    } else {
      speedRef.current = moveToward(speedRef.current, 0, COAST_RESPONSE, delta);
    }

    nudgeVelocityRef.current.multiplyScalar(Math.exp(-HIT_DRAG * delta));

    const headingVelocity = new THREE.Vector2(
      -Math.sin(yawRef.current) * speedRef.current,
      -Math.cos(yawRef.current) * speedRef.current,
    );
    const velocity = headingVelocity.add(nudgeVelocityRef.current);
    const current = body.translation();
    const unclampedNext = {
      x: current.x + velocity.x * delta,
      z: current.z + velocity.y * delta,
    };
    const next = clampToLake(
      unclampedNext,
      BOAT_RADIUS + 1.2,
    );

    if (next.x !== unclampedNext.x || next.z !== unclampedNext.z) {
      speedRef.current *= 0.18;
      nudgeVelocityRef.current.multiplyScalar(0.12);
    }

    body.setNextKinematicTranslation({ x: next.x, y: BOAT_Y, z: next.z });
    body.setNextKinematicRotation(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yawRef.current, 0)));
    useGameStore.getState().setBoatPosition(next);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="kinematicPosition"
      colliders={false}
      position={[SPAWN_POINT.x, BOAT_Y, SPAWN_POINT.z]}
      enabledRotations={[false, true, false]}
    >
      <EcoBoatModel />
      <DamageFlashOverlay />
      <CuboidCollider args={[1.18, 0.45, 2.15]} position={[0, 0.18, 0]} />
    </RigidBody>
  );
}
