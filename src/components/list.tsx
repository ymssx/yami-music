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
  
  // 用于存储上次触发事件的时间和上次的listItem
  const lastHoveredItemRef = useRef<HTMLElement | null>(null);
  const recentTopRef = useRef<number>(0);

  const changeRecentTop = _.debounce((top: number) => {
    recentTopRef.current = top;
  }, 200);

  const handleMouseOver = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const listItem = target.closest('.list-item') as HTMLElement;

    if (listItem && lastHoveredItemRef.current !== listItem) {
      const wrapperRect = listRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
      const rect = listItem.getBoundingClientRect();
      const top = rect.top - wrapperRect.top + (listRef.current?.scrollTop || 0);
      changeRecentTop(top);

      // 设置 boxStyle，控制动画
      setBoxStyle({
        position: 'absolute',
        top: `${top}px`,
        left: `${rect.left - wrapperRect.left + (listRef.current?.scrollLeft || 0)}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        pointerEvents: 'none',
        transition: top - recentTopRef.current > 100 ? 'none' : 'all 0.3s ease', // 如果鼠标移动过快，禁用动画
      });
    }
  };

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
        <div style={boxStyle} className="absolute">
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
