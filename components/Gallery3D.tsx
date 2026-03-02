'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Image as DreiImage, Text, Environment, PointerLockControls, Stars } from '@react-three/drei';
import { Suspense, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

interface Game {
  appid: number;
  name: string;
  playtime_forever: number;
}

interface Gallery3DProps {
  games: Game[];
}

function GameFrame({ game, position, rotation }: { game: Game; position: [number, number, number]; rotation: [number, number, number] }) {
  const url = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`;
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        hovered ? position[1] + 0.2 : position[1],
        0.1
      );
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.2, 0.1]} />
        <meshStandardMaterial color={hovered ? "#4f46e5" : "#27272a"} roughness={0.5} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <DreiImage url={url} scale={[4, 2]} transparent opacity={1} />
      </mesh>
      
      {hovered && (
        <group position={[0, -1.5, 0.1]}>
          <Text
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={4}
            textAlign="center"
          >
            {game.name}
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={0.15}
            color="#a1a1aa"
            anchorX="center"
            anchorY="middle"
          >
            {(game.playtime_forever / 60).toFixed(1)} hrs
          </Text>
        </group>
      )}
    </group>
  );
}

function Gallery({ games }: { games: Game[] }) {
  const topGames = games.slice(0, 20);
  const radius = 10;
  const angleStep = (Math.PI * 2) / topGames.length;

  return (
    <group position={[0, 0, 0]}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#09090b" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Center Pedestal */}
      <mesh position={[0, -1.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2, 2.5, 1, 32]} />
        <meshStandardMaterial color="#18181b" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Games arranged in a circle */}
      {topGames.map((game, i) => {
        const angle = i * angleStep;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const rotationY = -angle + Math.PI / 2;

        return (
          <GameFrame
            key={game.appid}
            game={game}
            position={[x, 0, z]}
            rotation={[0, rotationY, 0]}
          />
        );
      })}
    </group>
  );
}

export default function Gallery3D({ games }: Gallery3DProps) {
  const [usePointerLock, setUsePointerLock] = useState(false);

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        No games found. Make sure your game details are set to public.
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-100px)] relative bg-zinc-950">
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white/80 text-sm">
        <p className="font-semibold mb-2 text-white">Controls</p>
        <div className="flex items-center gap-2 mb-2">
          <button 
            onClick={() => setUsePointerLock(!usePointerLock)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${usePointerLock ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
          >
            {usePointerLock ? 'Exit First Person' : 'Enter First Person'}
          </button>
        </div>
        {usePointerLock ? (
          <ul className="list-disc pl-4 text-xs space-y-1">
            <li>Click canvas to lock pointer</li>
            <li>WASD to move</li>
            <li>Mouse to look</li>
            <li>ESC to unlock</li>
          </ul>
        ) : (
          <ul className="list-disc pl-4 text-xs space-y-1">
            <li>Left click + drag to rotate</li>
            <li>Right click + drag to pan</li>
            <li>Scroll to zoom</li>
          </ul>
        )}
      </div>

      <Canvas shadows camera={{ position: [0, 0, 5], fov: 60 }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 10, 30]} />
        
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[0, 2, 0]} intensity={2} color="#4f46e5" distance={15} />

        <Suspense fallback={null}>
          <Environment preset="city" />
          <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Gallery games={games} />
        </Suspense>

        {usePointerLock ? (
          <PointerLockControls />
        ) : (
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={2}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2 + 0.1}
          />
        )}
      </Canvas>
    </div>
  );
}
