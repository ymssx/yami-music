import React, { useRef } from 'react';
import { Animation } from '@/components/core/animation';

function calculateMaxDistance(w: number, h: number, x: number, y: number) {
  // 计算点到四个角的距离
  const topLeft = Math.sqrt(x * x + y * y);
  const topRight = Math.sqrt((w - x) * (w - x) + y * y);
  const bottomLeft = Math.sqrt(x * x + (h - y) * (h - y));
  const bottomRight = Math.sqrt((w - x) * (w - x) + (h - y) * (h - y));

  // 找出最长距离
  return Math.max(topLeft, topRight, bottomLeft, bottomRight);
}

interface Props {
  children: React.ReactNode;
  classNames?: string;
}

export default function Wrapper({
  children,
  classNames,
} : Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const fullAnimation = useRef<Promise<void> | null>(null);
  const TRANSITION = 400;

  const clearAnimation = () => {
    if (bubbleRef.current) {
      wrapperRef?.current?.removeChild(bubbleRef.current);
    }
    fullAnimation.current = null;
  };

  const handleClickStart = async (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    clearAnimation();
  
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    
    const w = rect.width;
    const h = rect.height;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (wrapperRef.current) {
      const bubble = document.createElement('div');
      const animate = new Animation(bubble);
      await animate.set({
        opacity: '1',
        top: `${y}px`,
        left:`${x}px`,
        width: '10px',
        height: '10px',
        transform: 'translate(-50%, -50%)',
        'pointer-events': 'none',
        position: 'absolute',
        'border-radius': '100%',
        background: 'rgba(0,0,0,0.1)',
      }, 0);

      wrapperRef.current.appendChild(bubble);
      bubbleRef.current = bubble;

      const diameter = calculateMaxDistance(w, h, x, y);
      fullAnimation.current = animate.set({
        width: `${2 * diameter}px`,
        height: `${2 * diameter}px`,
      }, TRANSITION)
        .then(() => {
          return animate.set({
            opacity: '0',
          }, TRANSITION);
        })
        .finally(() => {
          fullAnimation.current = null;
        });
    }
  };

  const handleClickEnd = () => {
    const removeBubble = async () => {
      if (bubbleRef.current) {
        wrapperRef.current?.removeChild(bubbleRef.current);
        bubbleRef.current = null;
      }
    };
    if (fullAnimation.current instanceof Promise) {
      fullAnimation.current.then(() => removeBubble());
    } else {
      removeBubble();
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`inline-block overflow-hidden relative ${classNames}`}
      // onClick={handleClick}
      onMouseDown={handleClickStart}
      onMouseUp={handleClickEnd}
    >
      {children}
    </div>
  );
}