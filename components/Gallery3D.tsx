'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Image as DreiImage, Text, Environment, Stars, MeshReflectorMaterial, Grid } from '@react-three/drei';
import { Suspense, useRef, useState, Component, ReactNode, useEffect } from 'react';
import * as THREE from 'three';
import { getPreferredLocale } from '../lib/i18n';

interface Game {
  appid: number;
  name: string;
  playtime_forever: number;
}

interface Gallery3DProps {
  games: Game[];
  profile?: any;
  steamId: string;
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
  const [keys, setKeys] = useState({ w: false, s: false, a: false, d: false, shift: false });
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  
  // 使用 ref 来存储旋转状态，避免 React 状态更新的异步问题
  const xRotationRef = useRef(0);
  const yRotationRef = useRef(0);

  useEffect(() => {
    // Set initial camera position
    camera.position.set(0, 0, 4);

    // Lock mouse to the center of the screen
    const canvas = gl.domElement;
    canvas.requestPointerLock = canvas.requestPointerLock || (canvas as any).mozRequestPointerLock;
    document.exitPointerLock = document.exitPointerLock || (document as any).mozExitPointerLock;

    // Request pointer lock when canvas is clicked
    const handleCanvasClick = () => {
      if (!document.pointerLockElement) {
        canvas.requestPointerLock();
      }
    };

    // Handle pointer lock changes
    const handlePointerLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === canvas);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') setKeys(k => ({ ...k, w: true }));
      if (e.key.toLowerCase() === 's') setKeys(k => ({ ...k, s: true }));
      if (e.key.toLowerCase() === 'a') setKeys(k => ({ ...k, a: true }));
      if (e.key.toLowerCase() === 'd') setKeys(k => ({ ...k, d: true }));
      if (e.key === 'Shift') setKeys(k => ({ ...k, shift: true }));
      if (e.key === 'Escape') {
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') setKeys(k => ({ ...k, w: false }));
      if (e.key.toLowerCase() === 's') setKeys(k => ({ ...k, s: false }));
      if (e.key.toLowerCase() === 'a') setKeys(k => ({ ...k, a: false }));
      if (e.key.toLowerCase() === 'd') setKeys(k => ({ ...k, d: false }));
      if (e.key === 'Shift') setKeys(k => ({ ...k, shift: false }));
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        // 鼠标灵敏度
        const sensitivity = 0.1;
        
        // 更新旋转状态 - 确保鼠标移动方向与视角转动方向一致
        // 向右移动鼠标 → 视角向右转
        // 向上移动鼠标 → 视角向上转
        // 向下移动鼠标 → 视角向下转
        yRotationRef.current -= e.movementX * sensitivity * 0.01;
        xRotationRef.current += e.movementY * sensitivity * 0.01;
        
        // 限制上下旋转角度在±90度之间
        xRotationRef.current = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, xRotationRef.current));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleCanvasClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleCanvasClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [camera, gl]);

  useFrame((state, delta) => {
    // Calculate speed based on whether shift is pressed (run)
    const baseSpeed = 12;
    const runMultiplier = keys.shift ? 2 : 1;
    const speed = baseSpeed * runMultiplier * delta;
    
    // 应用旋转 - 使用四元数确保鼠标移动方向与视角转动方向一致
    // 无论相机当前朝向如何，鼠标移动的方向始终与视角转动方向一致
    
    // 计算四元数旋转
    const yQuaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      yRotationRef.current
    );
    
    const xQuaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      -xRotationRef.current // 负号确保鼠标向上移动时视角向上转
    );
    
    // 组合四元数
    camera.quaternion.copy(yQuaternion).multiply(xQuaternion);
    
    // 处理移动 - 基于相机的局部坐标系
    if (keys.w || keys.s || keys.a || keys.d) {
      // 计算移动方向向量
      let movement = new THREE.Vector3(0, 0, 0);
      
      // 前向/后向移动
      if (keys.w) movement.z -= speed;
      if (keys.s) movement.z += speed;
      
      // 左右平移
      if (keys.a) movement.x -= speed;
      if (keys.d) movement.x += speed;
      
      // 应用相机的旋转到移动向量
      // 这样移动方向会跟随相机视角
      movement.applyQuaternion(camera.quaternion);
      
      // 锁定Y轴移动，保持固定高度
      movement.y = 0;
      
      // 更新相机位置
      camera.position.add(movement);
      
      // 限制在走廊边界内
      const minZ = -corridorLength + 9;
      const maxZ = 5.5;
      const minX = -5.5;
      const maxX = 5.5;
      
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, minZ, maxZ);
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, minX, maxX);
      camera.position.y = 0; // 保持固定高度
    }
  });

  return null; // Remove OrbitControls
}

interface Achievement {
  name: string;
  description: string;
  achieved: boolean;
  unlocktime: number;
  icon: string;
}

function GameFrame({ game, position, rotation, opacity = 1, steamId }: { game: Game; position: [number, number, number]; rotation: [number, number, number]; opacity?: number; steamId: string }) {
  const originalUrl = `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${game.appid}/header.jpg`;
  const url = `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        hovered ? position[1] + 0.2 : position[1],
        0.1
      );
    }
  });

  const handleClick = async () => {
    if (showAchievements) {
      // 如果已经显示成就，切换回游戏封面
      setShowAchievements(false);
      setScrollOffset(0); // 重置滚动偏移
    } else {
      // 加载成就数据
      setLoading(true);
      try {
        const locale = getPreferredLocale();
        const response = await fetch(`/api/steam/achievements?steamId=${steamId}&appId=${game.appid}&language=${locale}`);
        if (response.ok) {
          const data = await response.json();
          setAchievements(data.achievements || []);
          setShowAchievements(true);
          setScrollOffset(0); // 重置滚动偏移
        }
      } catch (error) {
        console.error('Failed to load achievements:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleWheel = (e: WheelEvent) => {
    if (showAchievements && achievements.length > 3) {
      // 计算最大滚动偏移
      const maxOffset = Math.max(0, achievements.length - 3);
      // 调整滚动偏移 - 滚轮下滚时成就下移
      const newOffset = Math.max(0, Math.min(maxOffset, scrollOffset + Math.sign(e.deltaY)));
      setScrollOffset(newOffset);
    }
  };

  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation} 
      onPointerOver={() => setHovered(true)} 
      onPointerOut={() => setHovered(false)} 
      onPointerDown={handleClick}
      onWheel={handleWheel}
    >
      {/* Glowing Backing */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[4.4, 2.4, 0.05]} />
        <meshBasicMaterial color={hovered ? "#6366f1" : "#1e1b4b"} transparent opacity={opacity} />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4.2, 2.2, 0.1]} />
        <meshStandardMaterial color="#09090b" roughness={0.2} metalness={0.8} transparent opacity={opacity} />
      </mesh>
      
      {showAchievements ? (
        <mesh position={[0, 0, 0.06]}>
          <boxGeometry args={[4, 2, 0.01]} />
          <meshBasicMaterial color="#1e1b4b" transparent opacity={opacity} />
          {achievements.length > 0 ? (
            <group position={[0, 0, 0.07]}>
              {achievements.slice(scrollOffset, scrollOffset + 3).map((achievement, index) => (
                <Text
                  key={index}
                  position={[0, 0.6 - index * 0.4, 0]}
                  fontSize={0.15}
                  color={achievement.achieved ? "#ffffff" : "#6b7280"}
                  anchorX="center"
                  anchorY="middle"
                  maxWidth={3.5}
                  textAlign="center"
                >
                  {achievement.name}
                </Text>
              ))}
              {achievements.length > 3 && (
                <>
                  <Text
                    position={[0, -0.6, 0]}
                    fontSize={0.12}
                    color="#a5b4fc"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {scrollOffset + 3} / {achievements.length}
                  </Text>
                  {/* 滚动提示 */}
                  <Text
                    position={[0, -0.75, 0]}
                    fontSize={0.1}
                    color="#6b7280"
                    anchorX="center"
                    anchorY="middle"
                  >
                    Scroll to view more
                  </Text>
                </>
              )}
            </group>
          ) : loading ? (
            <Text
              position={[0, 0, 0]}
              fontSize={0.2}
              color="#a5b4fc"
              anchorX="center"
              anchorY="middle"
            >
              Loading achievements...
            </Text>
          ) : (
            <Text
              position={[0, 0, 0]}
              fontSize={0.2}
              color="#a5b4fc"
              anchorX="center"
              anchorY="middle"
            >
              No achievements found
            </Text>
          )}
        </mesh>
      ) : (
        <mesh position={[0, 0, 0.06]}>
          <ErrorBoundary fallback={<meshBasicMaterial color="#3f3f46" />}>
            <Suspense fallback={<meshBasicMaterial color="#27272a" />}>
              <DreiImage url={url} scale={[4, 2]} transparent opacity={opacity} />
            </Suspense>
          </ErrorBoundary>
        </mesh>
      )}
      
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

function Gallery({ games, corridorLength, profile, steamId }: { games: Game[], corridorLength: number, profile?: any, steamId: string }) {
  const topGames = games.slice(0, 30);
  const spacing = 6;
  const zCenter = -corridorLength / 2 + 6;
  const [animationProgress, setAnimationProgress] = useState(0);
  
  const avatarUrl = profile?.avatarfull ? `/api/image-proxy?url=${encodeURIComponent(profile.avatarfull)}` : '';

  // Animation effect: Blue lights lighting up from start to end
  useEffect(() => {
    const duration = 3000; // 3 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, []);

  // Create lighting points along the corridor
  const lightPoints = [];
  const lightCount = 20;
  for (let i = 0; i < lightCount; i++) {
    const zPos = 6 - (corridorLength - 12) * (i / (lightCount - 1));
    const progress = i / (lightCount - 1);
    const intensity = animationProgress > progress ? 1 : 0;
    lightPoints.push({ zPos, intensity });
  }

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
        <meshBasicMaterial color="#4f46e5" opacity={animationProgress} transparent />
      </mesh>

      {/* Animated Blue Lights */}
      {lightPoints.map((point, index) => (
        <pointLight
          key={index}
          position={[0, 5.7, point.zPos]}
          intensity={point.intensity * 3}
          color="#4f46e5"
          distance={8}
          decay={2}
        />
      ))}

      {/* Start Wall (Behind Camera) */}
      <mesh position={[0, 2, 6]} receiveShadow>
        <boxGeometry args={[12, 8, 0.2]} />
        <meshStandardMaterial color="#09090b" roughness={0.8} />
      </mesh>

      {/* User Profile on Start Wall */}
      {avatarUrl && (
        <group position={[0, 2.5, 5.89]} rotation={[0, Math.PI, 0]}>
          <mesh castShadow receiveShadow>
            <planeGeometry args={[2.2, 2.2]} />
            <meshStandardMaterial color="#1e1b4b" />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <ErrorBoundary fallback={<meshBasicMaterial color="#3f3f46" />}>
              <Suspense fallback={<meshBasicMaterial color="#27272a" />}>
                <DreiImage url={avatarUrl} scale={[2, 2]} transparent opacity={1} />
              </Suspense>
            </ErrorBoundary>
          </mesh>
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.4}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {profile?.personaname || 'Steam User'}
          </Text>
        </group>
      )}

      {/* End Wall */}
      <mesh position={[0, 2, -corridorLength + 6]} receiveShadow>
        <boxGeometry args={[12, 8, 0.2]} />
        <meshStandardMaterial color="#09090b" roughness={0.8} />
      </mesh>

      {/* Games arranged along the corridor */}
      {topGames.map((game, i) => {
        const isLeft = i % 2 === 0;
        const zPos = -Math.floor(i / 2) * spacing - 3;
        const xPos = isLeft ? -5.8 : 5.8;
        const rotationY = isLeft ? Math.PI / 2 : -Math.PI / 2;
        
        // Calculate animation delay for each game frame
        const gameProgress = Math.max(0, (animationProgress - (Math.abs(zPos) / (corridorLength - 12))) * 2);
        // After animation completes, all images should be fully opaque
        const opacity = animationProgress < 1 ? Math.min(gameProgress, 1) : 1;

        return (
          <group key={game.appid} position={[xPos, 0, zPos]} rotation={[0, rotationY, 0]}>
            <GameFrame
              game={game}
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              opacity={opacity}
              steamId={steamId}
            />
          </group>
        );
      })}
    </group>
  );
}

export default function Gallery3D({ games, profile, steamId }: Gallery3DProps) {
  const [dictionary, setDictionary] = useState<any>({
    common: {
      controls: 'Controls',
      moveForwardBackward: 'W / S to move forward and backward',
      strafeLeftRight: 'A / D to strafe left and right',
      run: 'Shift to run',
      lockMouse: 'Click to lock mouse and look around',
      unlockMouse: 'Escape to unlock mouse',
      noGamesFound: 'No games found. Make sure your game details are set to public.'
    }
  });

  useEffect(() => {
    const loadDictionary = async () => {
      const locale = getPreferredLocale();
      const dict = await import(`../app/locales/${locale}.json`);
      setDictionary(dict.default);
    };
    loadDictionary();
  }, []);

  if (!games || games.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        {dictionary.common.noGamesFound}
      </div>
    );
  }

  const topGames = games.slice(0, 30);
  const spacing = 6;
  const corridorLength = Math.max(Math.ceil(topGames.length / 2) * spacing + 15, 30);

  return (
    <div className="w-full h-[calc(100vh-100px)] relative bg-zinc-950">
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white/80 text-sm">
        <p className="font-semibold mb-2 text-white">{dictionary.common.controls}</p>
        <ul className="list-disc pl-4 text-xs space-y-1">
          <li><span className="font-bold text-indigo-400">W / S</span> {dictionary.common.moveForwardBackward}</li>
          <li><span className="font-bold text-indigo-400">A / D</span> {dictionary.common.strafeLeftRight}</li>
          <li><span className="font-bold text-indigo-400">Shift</span> {dictionary.common.run}</li>
          <li><span className="font-bold text-indigo-400">Click</span> {dictionary.common.lockMouse}</li>
          <li><span className="font-bold text-indigo-400">Escape</span> {dictionary.common.unlockMouse}</li>
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
          <Gallery games={games} corridorLength={corridorLength} profile={profile} steamId={steamId} />
        </Suspense>

        <FirstPersonControls corridorLength={corridorLength} />
      </Canvas>
      
      {/* 画面中央的准星 - 屏幕空间 */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50"></div>
      </div>
    </div>
  );
}
