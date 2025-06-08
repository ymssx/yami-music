import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import ColorThief from 'colorthief';
import playlists from './data';
import Ablum from './album';
import './style.less';

const W = 500;
const H = 8;

function getForwardOffsetFromRotation(
  rotation: [number, number, number], // 旋转角度，单位为弧度
  distance: number
): THREE.Vector3 {
  const [rotX, rotY, rotZ] = rotation;

  // 物体局部的前方向，假设是Z正方向
  const localForward = new THREE.Vector3(0, 0, 1);

  // 创建旋转矩阵，注意Three.js旋转顺序默认是XYZ
  const rotationMatrix = new THREE.Matrix4();

  // 依次绕X、Y、Z轴旋转
  rotationMatrix.makeRotationX(rotX);
  rotationMatrix.multiply(new THREE.Matrix4().makeRotationY(rotY));
  rotationMatrix.multiply(new THREE.Matrix4().makeRotationZ(rotZ));

  // 计算世界方向向量
  const worldDirection = localForward.applyMatrix4(rotationMatrix);

  // 乘以距离得到偏移量
  const offset = worldDirection.multiplyScalar(distance);

  return offset;
}

const movement = getForwardOffsetFromRotation([0, -Math.PI / 4, 0], 50);

function isDarkMode(rgbStr: string) {
  const result = rgbStr.match(/rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/);
  if (!result) return false;
  const r = parseInt(result[1], 10);
  const g = parseInt(result[2], 10);
  const b = parseInt(result[3], 10);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 128;
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
  ctx.font = options?.font || `bold ${Math.min(width, height) * 0.9}px sans-serif`;
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
  onSelect: (item: any) => void;
  onHover: (id: string | null) => void;
  positionX: number;
  baseRotate: number;
  disabled: boolean;
  onLoaded: (config: { color: string; darkMode: boolean }) => void;
  onColorChange: (color: string) => void;
  onDarkModeChange: (darkMode: boolean) => void;
}> = ({ playlist, selected, hovered, onSelect, onHover, positionX, baseRotate, disabled, onLoaded, onColorChange, onDarkModeChange }) => {
  const baseX = positionX;

  const ref = useRef<THREE.Group>(null);
  const [coverTexture, setCoverTexture] = useState<THREE.Texture | null>(null);
  const [themeColor, setThemeColor] = useState('#fff');
  const [darkMode, setDarkMode] = useState(false);
  const textColor = darkMode? '#fff' : '#000';
  const loaded = useRef(false);

  const { size, camera } = useThree();
  const [fixedLeftTarget, setFixedLeftTarget] = useState<number[] | null>(null);

  useEffect(() => {
    if (selected && fixedLeftTarget === null) {
      const aspect = size.width / size.height;
      const distance = camera.position.z;
      const vFOV = ((camera as { fov: number }).fov * Math.PI) / 180;
      const height = 2 * Math.tan(vFOV / 2) * distance;
      const width = height * aspect;
  
      const computed = [-width / 4, 0, W * 2];
      setFixedLeftTarget(computed);
    }
  }, [selected]);

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
        setDarkMode(isDarkMode(rgbStr));
        loaded.current = true;
        onLoaded({
          color: rgbStr,
          darkMode: isDarkMode(rgbStr),
        });
      };
      img.onerror = () => {
        console.error('Error loading image');
        loaded.current = true;
        onLoaded({
          color: '#fff',
          darkMode: false,
        });
      };
      setTimeout(() => {
        if (!loaded.current) {
          loaded.current = true;
          onLoaded({
            color: '#fff',
            darkMode: false,
          });
        }
      }, 3000);
    });
  }, [playlist.coverImageUrl]);

  useEffect(() => {
    if (selected) {
      onColorChange?.(themeColor);
      onDarkModeChange?.(darkMode);
    }
  }, [
    themeColor,
    selected,
    darkMode,
  ]);

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
  });
  const otherMat = new THREE.MeshStandardMaterial({ color: themeColor });
  const nameMat = new THREE.MeshStandardMaterial({ map: nameTexture });
  const materials = [coverMat, coverMat, otherMat, otherMat, nameMat, otherMat];

  const finalPosition = selected
    ? fixedLeftTarget
    : hovered
    ? [baseX + movement.x, movement.y, movement.z]
    : [baseX, 0, 0];
  
  const { position, rotation } = useSpring({
    position: finalPosition,
    rotation: selected ? [0, -Math.PI / 2, 0] : [0, baseRotate, 0],
    config: { mass: 1, tension: 170, friction: 26 },
  });

  return (
    <a.group
      ref={ref}
      position={position as any}
      rotation={rotation as any}
      onClick={(e) => {
        e.stopPropagation();
        if (disabled) {
          return;
        }
        onSelect(playlist);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (disabled) {
          return;
        }
        onHover(playlist.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (disabled) {
          return;
        }
        onHover(null);
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

const PlaylistCubes= ({ playlists = [] }: { playlists: any[] }) => {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [positionOffsetX, setPositionOffsetX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [bgColor, setBgColor] = useState('#121212');
  const [darkMode, setDarkMode] = useState(true);
  const loadIndex = useRef<number[]>([]);
  const [loadIndexMap, setLoadIndexMap] = useState<Record<string, number>>({});

  const W = 500;
  const GAP = W / 5;
  const baseCamZ = 900;

  const dragState = useRef<{ down: boolean; lastX: number }>({ down: false, lastX: 0 });

  const cameraZSpring = useSpring({
    from: { cameraZ: baseCamZ },
    to: { cameraZ: selectedItem ? baseCamZ + W * 2 : baseCamZ },
    config: { mass: 1, tension: 170, friction: 26 },
  }).cameraZ;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      // e.preventDefault();
      if (selectedItem) {
        return;
      }
      setPositionOffsetX((prev) => Math.max(-playlists.length * GAP, Math.min(0, prev - e.deltaY * 0.5)));
    };

    container.addEventListener('wheel', onWheel, { passive: true });
    return () => container.removeEventListener('wheel', onWheel);
  }, [!!selectedItem, playlists.length]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragState.current.down = true;
    dragState.current.lastX = e.clientX;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current.down) return;
    const deltaX = e.clientX - dragState.current.lastX;
    dragState.current.lastX = e.clientX;
    if (selectedItem) {
      return;
    }
    setPositionOffsetX((prev) => Math.max(-playlists.length * GAP, Math.min(0, prev + deltaX)));
  };
  const onPointerUp = () => {
    dragState.current.down = false;
  };

  const handleCanvasClick = () => {
    setSelectedItem(null);
  };

  useEffect(() => {
    (window.document.querySelector('#root') as HTMLDivElement).style.background = bgColor;
  }, [bgColor]);

  let itemCouldLoad = true;
  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
      className={`ablum-list ${darkMode ? 'darkmode' : 'lightmode'}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* {!selectedId && <div className='simple-desc-wrapper transition-all'><SimpleDesc {...catelory} className='simple-desc-content' /></div>} */}

      <Canvas camera={{ position: [0, 0, baseCamZ], fov: 60, far: W * 3 }} onPointerMissed={handleCanvasClick}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[0, 500, 1000]} intensity={1} />
        <CameraController cameraZSpring={cameraZSpring} />
        {playlists.map((p, idx) => {
          itemCouldLoad = itemCouldLoad && loadIndexMap[idx] !== undefined;
          const basePosX = (itemCouldLoad ? idx : 100) * GAP - W * 0.3;
          // const baseRotate = - Math.max(0, 4 - (loadIndexMap[p.id] ?? 9)) * Math.PI / 64;
          return (
            <PlaylistBox
              key={p.id}
              playlist={p}
              index={idx}
              length={playlists.length}
              disabled={!!selectedItem}
              selected={selectedItem?.id === p.id}
              hovered={hoveredId === p.id}
              onSelect={setSelectedItem}
              onHover={setHoveredId}
              positionX={basePosX + positionOffsetX}
              baseRotate={-Math.PI / 6}
              onLoaded={({ color, darkMode }) => {
                loadIndex.current.push(idx);
                loadIndexMap[idx] = loadIndex.current.length - 1;
                setLoadIndexMap({ ...loadIndexMap });
                if (loadIndex.current.length === 1) {
                  setBgColor(color);
                  setDarkMode(darkMode);
                }
              }}
              onColorChange={setBgColor}
              onDarkModeChange={setDarkMode}
            />
          );
        })}
      </Canvas>

      {selectedItem && <Ablum {...selectedItem} />}
    </div>
  );
};

export default PlaylistCubes;
