import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import ColorThief from 'colorthief';
import playlists from './data';

function getContrastYIQ(rgbStr: string): string {
  const result = rgbStr.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/);
  if (!result) return '#000000';
  const r = parseInt(result[1], 10);
  const g = parseInt(result[2], 10);
  const b = parseInt(result[3], 10);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#FFFFFF';
}

function createTextTexture(
  text: string,
  options?: {
    width?: number;
    height?: number;
    font?: string;
    rotate?: boolean;
    color?: string;
    bgColor?: string;
  }
) {
  const width = (options?.width || 512) * window.devicePixelRatio;
  const height = (options?.height || 128) * window.devicePixelRatio;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = options?.bgColor || '#000';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = options?.color || '#fff';
  ctx.font = options?.font || `bold ${Math.min(width, height) / 2}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (options?.rotate) {
    ctx.translate(width / 2, height / 2);
    ctx.rotate((3 * Math.PI) / 2);
    ctx.fillText(text, 0, 0);
  } else {
    ctx.fillText(text, width / 2, height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const PlaylistBox: React.FC<{
  playlist: any;
  index: number;
  length: number;
  selected: boolean;
  hovered: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  positionX: number;
}> = ({ playlist, index, length, selected, hovered, onSelect, onHover, positionX }) => {
  const W = 500;
  const H = 14;
  const baseX = positionX;

  const ref = useRef<THREE.Group>(null);
  const [coverTexture, setCoverTexture] = useState<THREE.Texture | null>(null);
  const [themeColor, setThemeColor] = useState('#000');
  const [textColor, setTextColor] = useState('#fff');

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(playlist.coverImageUrl, (texture) => {
      setCoverTexture(texture);

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = playlist.coverImageUrl;
      img.onload = () => {
        const colorThief = new ColorThief();
        const [r, g, b] = colorThief.getColor(img);
        const rgbStr = `rgb(${r},${g},${b})`;
        setThemeColor(rgbStr);
        setTextColor(getContrastYIQ(rgbStr));
      };
    });
  }, [playlist.coverImageUrl]);

  const nameTexture = React.useMemo(
    () =>
      createTextTexture(playlist.name, {
        width: H,
        height: W,
        rotate: true,
        color: textColor,
        bgColor: themeColor,
      }),
    [playlist.name, textColor, themeColor]
  );

  const coverMat = new THREE.MeshStandardMaterial({
    map: coverTexture,
    color: '#fff', // 取消hover变暗，始终白色
  });
  const otherMat = new THREE.MeshStandardMaterial({
    color: '#fff',
  });
  const nameMat = new THREE.MeshStandardMaterial({
    map: nameTexture,
  });

  const materials = [coverMat, coverMat, otherMat, otherMat, nameMat, otherMat];

  // 动画：hover时前抽50，选中时前抽W并旋转90度
  const { position, rotation } = useSpring({
    position: [baseX, 0, selected ? W : hovered ? 50 : 0],
    rotation: selected ? [0, Math.PI / 2, 0] : [0, 0, 0],
    config: { mass: 1, tension: 170, friction: 26 },
  });

  return (
    <a.group
      ref={ref}
      position={position as any}
      rotation={rotation as any}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(playlist.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(playlist.id);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = 'default';
      }}
    >
      <mesh>
        <boxGeometry args={[H, W, W]} />
        {materials.map((mat, i) => (
          <primitive key={i} object={mat} attach={`material-${i}`} />
        ))}
      </mesh>
    </a.group>
  );
};

const CameraController: React.FC<{ cameraZSpring: any }> = ({ cameraZSpring }) => {
  const { camera } = useThree();

  useFrame(() => {
    const z = cameraZSpring.get();
    camera.position.z += (z - camera.position.z) * 0.1;
    camera.updateMatrixWorld();
  });

  return null;
};

const PlaylistCubes: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [positionOffsetX, setPositionOffsetX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const W = 500;
  const GAP = 100;
  const baseCamZ = 900;

  // 拖动相关
  const dragState = useRef<{ down: boolean; lastX: number }>({ down: false, lastX: 0 });

  // 摄像机后移动画只根据选中状态
  const cameraZSpring = useSpring({
    from: { cameraZ: baseCamZ },
    to: { cameraZ: selectedId ? baseCamZ + W : baseCamZ },
    config: { mass: 1, tension: 170, friction: 26 },
  }).cameraZ;

  // 原生添加 wheel 事件监听，防止 passive 导致 preventDefault 报错
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // 水平移动时相反方向滑动可根据需求调整
      setPositionOffsetX((prev) => prev - e.deltaY * 0.5);
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  // 拖动事件
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.down = true;
    dragState.current.lastX = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.down) return;
    const deltaX = e.clientX - dragState.current.lastX;
    dragState.current.lastX = e.clientX;
    setPositionOffsetX((prev) => prev + deltaX);
  };
  const onPointerUp = () => {
    dragState.current.down = false;
  };

  // 点击空白处取消选中
  const handleCanvasClick = () => {
    setSelectedId(null);
  };

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100vh', backgroundColor: '#121212', touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <Canvas camera={{ position: [0, 0, baseCamZ], fov: 60 }} onPointerMissed={handleCanvasClick}>
        <color attach="background" args={['#121212']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 500, 1000]} intensity={1} />
        <CameraController cameraZSpring={cameraZSpring} />
        {playlists.map((p, idx) => {
          const basePosX = (idx - (playlists.length - 1) / 2) * GAP;
          return (
            <PlaylistBox
              key={p.id}
              playlist={p}
              index={idx}
              length={playlists.length}
              selected={selectedId === p.id}
              hovered={hoveredId === p.id}
              onSelect={setSelectedId}
              onHover={setHoveredId}
              positionX={basePosX + positionOffsetX}
            />
          );
        })}
      </Canvas>
    </div>
  );
};

export default PlaylistCubes;
