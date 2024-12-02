// Hearts.jsx
import React, { useState, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader, SpriteMaterial, Sprite } from 'three';
import * as random from 'maath/random/dist/maath-random.esm';
import heartTextureUrl from '../assets/Heart.png';

const Hearts = (props) => {
  const groupRef = useRef();
  const [positions] = useState(() =>
    random.inSphere(new Float32Array(600), { radius: 4.5 }) // Reduced radius from 1.2 to 0.6
  );

  const heartTexture = useLoader(TextureLoader, heartTextureUrl);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x -= delta / 20;
      groupRef.current.rotation.y -= delta / 25;
    }
  });

  const hearts = [];
  for (let i = 0; i < positions.length; i += 3) {
    hearts.push({
      position: [positions[i], positions[i + 1], positions[i + 2]],
    });
  }

  return (
    <group ref={groupRef}>
      {hearts.map((item, index) => {
        const spriteMaterial = new SpriteMaterial({
          map: heartTexture,
          transparent: true,
        });
        return (
          <primitive
            key={index}
            object={new Sprite(spriteMaterial)}
            position={item.position}
            scale={[0.4, 0.4, 0.4]} // Adjusted scale
            {...props}
          />
        );
      })}
    </group>
  );
};

export default Hearts;
