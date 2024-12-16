import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useMapStore } from '../../store/mapStore';

interface ZoomControlProps {
  scale: number;
  onScaleChange: (scale: number) => void;
}

export function ZoomControl({ scale, onScaleChange }: ZoomControlProps) {
  const position = useMapStore((state) => state.viewportPosition);
  const setViewportPosition = useMapStore((state) => state.setViewportPosition);

  const handleZoom = (newScale: number) => {
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate viewport center in world coordinates
    const viewportCenterX = -position.x + viewportWidth / 2;
    const viewportCenterY = -position.y + viewportHeight / 2;

    // Calculate scale change
    const scaleDiff = newScale - scale;

    // Calculate new position to maintain viewport center
    const newX = -(viewportCenterX * (newScale / scale)) + viewportWidth / 2;
    const newY = -(viewportCenterY * (newScale / scale)) + viewportHeight / 2;

    // Update scale and position
    onScaleChange(newScale);
    setViewportPosition({
      x: Math.min(Math.max(newX, -10000), 0),
      y: Math.min(Math.max(newY, -10000), 0)
    });
  };

  return (
    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
      <button
        onClick={() => handleZoom(Math.max(0.3, scale - 0.1))}
        className="p-1 hover:bg-gray-100 rounded-full"
      >
        <Minus className="w-4 h-4" />
      </button>
      
      <div className="flex items-center space-x-2">
        <input
          type="range"
          min="30"
          max="170"
          value={scale * 100}
          onChange={(e) => handleZoom(Number(e.target.value) / 100)}
          className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <button
          onClick={() => handleZoom(1)}
          className="text-sm font-medium text-gray-700 hover:text-indigo-600 min-w-[4rem]"
        >
          {Math.round(scale * 100)}%
        </button>
      </div>

      <button
        onClick={() => handleZoom(Math.min(1.7, scale + 0.1))}
        className="p-1 hover:bg-gray-100 rounded-full"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}