import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Suspense } from "react";
import { GameScene } from "../scene/GameScene";

export function GameCanvas() {
  return (
    <div className="canvas-wrap">
      <Canvas
        camera={{ position: [0, 29, 42], fov: 46, near: 0.1, far: 190 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        shadows
      >
        <color attach="background" args={["#dff6f2"]} />
        <fog attach="fog" args={["#dff6f2", 72, 164]} />
        <Suspense fallback={null}>
          <Physics gravity={[0, 0, 0]} colliders={false}>
            <GameScene />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
