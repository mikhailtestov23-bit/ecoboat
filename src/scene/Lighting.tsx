export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight
        castShadow
        intensity={2.2}
        position={[15, 26, 10]}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={32}
        shadow-camera-bottom={-32}
      />
      <hemisphereLight args={["#dff6f2", "#4d7c0f", 1.2]} />
    </>
  );
}
