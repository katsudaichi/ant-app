import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Star as StarType } from '../../types';
import { useMapStore } from '../../store/mapStore';

interface StarNodeProps {
  star: StarType;
}

export function StarNode({ star }: StarNodeProps) {
  const deleteStar = useMapStore((state) => state.deleteStar);
  const updateStar = useMapStore((state) => state.updateStar);
  const scale = useMapStore((state) => state.scale);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const parent = document.querySelector('.w-\\[10000px\\]');
    if (!parent) return;
    
    const parentRect = parent.getBoundingClientRect();
    const x = (e.clientX - parentRect.left - startPos.x) / scale;
    const y = (e.clientY - parentRect.top - startPos.y) / scale;
    
    updateStar({
      ...star,
      position: {
        x,
        y
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className="absolute group cursor-move z-10"
      data-star-id={star.id}
      style={{ left: star.position.x, top: star.position.y }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      <div className={`
        relative
        transform transition-transform duration-200
        ${isHovered ? 'scale-125' : ''}
      `}>
        <Star className="w-12 h-12 text-yellow-400 fill-yellow-400" />
        <button
          onClick={() => deleteStar(star.id)}
          className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 bg-white hover:bg-gray-100 rounded-full shadow-sm"
        >
          <X className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    </div>
  );
}