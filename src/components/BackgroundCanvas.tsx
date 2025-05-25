// BackgroundCanvas.tsx
import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";

interface BackgroundCanvasProps {
  showSphere?: boolean;
}

const AnimatedMaterial = () => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      const baseHue = 260;
      const hueRange = 40;
      const t = (Math.sin(clock.getElapsedTime() * 1.5) + 1) / 2;
      const hue = baseHue + t * hueRange;
      materialRef.current.color.set(`hsl(${hue}, 100%, 70%)`);
    }
  });

  return (
    <MeshWobbleMaterial
      ref={materialRef as any}
      factor={1.5}
      speed={3.5}
      transparent
      opacity={0.6}
    />
  );
};

// 안전한 이벤트 연결용 (선택 사항)
const CanvasEventHandler = () => {
  const { gl } = useThree();

  React.useEffect(() => {
    const canvas = gl.domElement;

    const handleContextLoss = () => {
      console.warn("🧨 WebGL context lost!");
    };

    canvas.addEventListener("webglcontextlost", handleContextLoss);

    return () => {
      canvas.removeEventListener("webglcontextlost", handleContextLoss);
    };
  }, [gl]);

  return null;
};

const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ showSphere = false }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "#000000",
        zIndex: -1, // 배경 역할
      }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 0, 5]} />
        <CanvasEventHandler /> {/* optional for WebGL context debug */}

        {showSphere && (
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[2.2, 128, 128]} />
            <AnimatedMaterial />
          </mesh>
        )}
      </Canvas>
    </div>
  );
};

export default BackgroundCanvas;
