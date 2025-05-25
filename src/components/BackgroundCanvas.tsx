// BackgroundCanvas.tsx
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface BackgroundCanvasProps {
  showSphere?: boolean;
}

const AnimatedMaterial = () => {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      // 보라색 계열의 hue 범위: 약 260 ~ 300
      const baseHue = 260;
      const hueRange = 40; // 260 ~ 300 사이
      const t = (Math.sin(clock.getElapsedTime() * 1.5) + 1) / 2; // 0~1
      const hue = baseHue + t * hueRange;
      materialRef.current.color.set(`hsl(${hue}, 100%, 70%)`);
    }
  });

  return (
    <MeshWobbleMaterial
      ref={materialRef as any} // fallback casting due to lib type conflict
      factor={1.5}
      speed={3.5}
      transparent
      opacity={0.6}
    />
  );
};

const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ showSphere = false }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#000000',
      zIndex: -1,
      pointerEvents: 'none'
    }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 0, 5]} />

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
