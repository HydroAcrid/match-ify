import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import Hearts from './Hearts';

const HeartsCanvas = () => {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5] }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={null}>
          <Hearts />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  );
};

export default HeartsCanvas;
