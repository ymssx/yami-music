import _ from 'lodash';
import React, { useState, useRef } from 'react';

interface HoverListProps {
  list: React.ReactNode[];
  className?: string;
  highlightBox: React.ReactNode; // 外部传入的高亮框ReactNode
}

const HoverList: React.FC<HoverListProps> = ({ list, className, highlightBox }) => {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [boxStyle, setBoxStyle] = useState<React.CSSProperties>({});


  const handleMouseOver = _.debounce((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const listItem = target.closest('.list-item');

    if (listItem) {
      const wrapperRect = listRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
      const rect = listItem.getBoundingClientRect();

      const top = rect.top - wrapperRect.top + (listRef.current?.scrollTop || 0);

      setBoxStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${rect.left - wrapperRect.left + (listRef.current?.scrollLeft || 0)}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        pointerEvents: 'none', // 防止框的遮挡影响交互
        transition: Math.abs(top - parseFloat(String(boxStyle.top || '0'))) > 300 ? 'all 0s ease' : 'all 0.3s ease', // 动画效果
      });

    }
  }, 10);

  const handleMouseLeave = () => {
    setBoxStyle({
      position: 'absolute',
      opacity: 0,
    });
  }; 

  return (
    <div
      className={className}
      style={{ position: 'relative' }}
      ref={listRef}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      {highlightBox && (
        <div style={boxStyle} className='absolute'>
          {highlightBox} {/* 外部传入的框 */}
        </div>
      )}
      {list.map((child, index) => (
        <div key={index} className="list-item">
          {child}
        </div>
      ))}
    </div>
  );
};

export default HoverList;
