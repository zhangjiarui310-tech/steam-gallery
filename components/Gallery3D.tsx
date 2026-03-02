'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Image as DreiImage, Text, Environment, Stars, MeshReflectorMaterial, Grid } from '@react-three/drei';
import { Suspense, useRef, useState, Component, ReactNode, useEffect } from 'react';
import * as THREE from 'three';

interface Game {
  appid: number;
  name: string;
  playtime_forever: number;
}

interface Gallery3DProps {
  games: Game[];
}

class ErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function FirstPersonControls({ corridorLength }: { corridorLength: number }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  const [keys, setKeys] = useState({ w: false, s: false });

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 0, 5);
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 4.9);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') setKeys(k => ({ ...k, w: true }));
      if (e.key.toLowerCase() === 's') setKeys(k => ({ ...k, s: true }));
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') setKeys(k => ({ ...k, w: false }));
      if (e.key.toLowerCase() === 's') setKeys(k => ({ ...k, s: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera]);

  useFrame((state, delta) => {
    const speed = 12 * delta;
    
    if (keys.w || keys.s) {
      const dir = new THREE.Vector3();
      camera.getWorldDirection(dir);
      
      // Move along Z axis based on camera's forward direction
      const zMovement = keys.w ? dir.z * speed : -dir.z * speed;
      
      let newZ = camera.position.z + zMovement;
      
      // Clamp to corridor bounds to prevent clipping
      const minZ = -corridorLength + 8;
      const maxZ = 5;
      newZ = THREE.MathUtils.clamp(newZ, minZ, maxZ);

      const deltaZ = newZ - camera.position.z;
      
      camera.position.z = newZ;
      camera.position.x = 0; // Lock X
      camera.position.y = 0; // Lock Y (eye level)

      if (controlsRef.current) {
        controlsRef.current.target.z += deltaZ;
        controlsRef.current.target.x = 0;
        controlsRef.current.target.y = 0;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enablePan={false}
      enableZoom={false}
      minDistance={0.1}
      maxDistance={0.1}
      rotateSpeed={-0.6} // Invert rotation for natural drag-to-look
    />
  );
}

function GameFrame({ game, position, rotation }: { game: Game; position: [number, number, number]; rotation: [number, number, number] }) {
  const originalUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`;
  const url = `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
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
      {/* Glowing Backing */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[4.4, 2.4, 0.05]} />
        <meshBasicMaterial color={hovered ? "#6366f1" : "#1e1b4b"} />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.2, 0.1]} />
        <meshStandardMaterial color="#09090b" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <ErrorBoundary fallback={<meshBasicMaterial color="#3f3f46" />}>
          <Suspense fallback={<meshBasicMaterial color="#27272a" />}>
            <DreiImage url={url} scale={[4, 2]} transparent opacity={1} />
          </Suspense>
        </ErrorBoundary>
      </mesh>
      
      {hovered && (
        <group position={[0, -1.6, 0.1]}>
          <Text
            fontSize={0.25}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            maxWidth={4}
            textAlign="center"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {game.name}
          </Text>
          <Text
            position={[0, -0.35, 0]}
            fontSize={0.18}
            color="#a5b4fc"
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

function Gallery({ games, corridorLength }: { games: Game[], corridorLength: number }) {
  const topGames = games.slice(0, 30);
  const spacing = 6;
  const zCenter = -corridorLength / 2 + 5;

  return (
    <group position={[0, 0, 0]}>
      {/* Floor with Reflection */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, zCenter]} receiveShadow>
        <planeGeometry args={[12, corridorLength]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={80}
          roughness={0.15}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.8}
          mirror={0.6}
        />
      </mesh>

      {/* Floor Grid for futuristic detail */}
      <Grid position={[0, -1.99, zCenter]} args={[12, corridorLength]} cellColor="#1e1b4b" sectionColor="#3730a3" fadeDistance={40} />

      {/* Left Wall */}
      <mesh position={[-6, 2, zCenter]} receiveShadow>
        <boxGeometry args={[0.2, 8, corridorLength]} />
        <meshStandardMaterial color="#09090b" roughness={0.8} metalness={0.5} />
      </mesh>
      <Grid position={[-5.89, 2, zCenter]} rotation={[0, 0, -Math.PI / 2]} args={[8, corridorLength]} cellColor="#1e1b4b" sectionColor="#3730a3" fadeDistance={40} />

      {/* Right Wall */}
      <mesh position={[6, 2, zCenter]} receiveShadow>
        <boxGeometry args={[0.2, 8, corridorLength]} />
        <meshStandardMaterial color="#09090b" roughness={0.8} metalness={0.5} />
      </mesh>
      <Grid position={[5.89, 2, zCenter]} rotation={[0, 0, Math.PI / 2]} args={[8, corridorLength]} cellColor="#1e1b4b" sectionColor="#3730a3" fadeDistance={40} />

      {/* Ceiling */}
      <mesh position={[0, 6, zCenter]} receiveShadow>
        <boxGeometry args={[12, 0.2, corridorLength]} />
        <meshStandardMaterial color="#050505" roughness={0.9} />
      </mesh>
      
      {/* Ceiling Neon Strip */}
      <mesh position={[0, 5.8, zCenter]}>
        <boxGeometry args={[0.4, 0.1, corridorLength]} />
        <meshBasicMaterial color="#4f46e5" />
      </mesh>

      {/* End Wall */}
      <mesh position={[0, 2, -corridorLength + 5]} receiveShadow>
        <boxGeometry args={[12, 8, 0.2]} />
        <meshStandardMaterial color="#09090b" roughness={0.8} />
      </mesh>

      {/* Games arranged along the corridor */}
      {topGames.map((game, i) => {
        const isLeft = i % 2 === 0;
        const zPos = -Math.floor(i / 2) * spacing - 3;
        const xPos = isLeft ? -5.8 : 5.8;
        const rotationY = isLeft ? Math.PI / 2 : -Math.PI / 2;

        return (
          <GameFrame
            key={game.appid}
            game={game}
            position={[xPos, 0, zPos]}
            rotation={[0, rotationY, 0]}
          />
        );
      })}
    </group>
  );
}

export default function Gallery3D({ games }: Gallery3DProps) {
  if (!games || games.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        No games found. Make sure your game details are set to public.
      </div>
    );
  }

  const topGames = games.slice(0, 30);
  const spacing = 6;
  const corridorLength = Math.max(Math.ceil(topGames.length / 2) * spacing + 15, 30);

  return (
    <div className="w-full h-[calc(100vh-100px)] relative bg-zinc-950">
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white/80 text-sm">
        <p className="font-semibold mb-2 text-white">Controls</p>
        <ul className="list-disc pl-4 text-xs space-y-1">
          <li><span className="font-bold text-indigo-400">W / S</span> to move forward and backward</li>
          <li><span className="font-bold text-indigo-400">Drag</span> to look around</li>
        </ul>
      </div>

      <Canvas shadows camera={{ fov: 60 }}>
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 10, 40]} />
        
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[0, 2, 0]} intensity={2} color="#4f46e5" distance={20} />

        <Suspense fallback={null}>
          <Environment preset="city" />
          <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <Gallery games={games} corridorLength={corridorLength} />
        </Suspense>

        <FirstPersonControls corridorLength={corridorLength} />
      </Canvas>
    </div>
  );
}
