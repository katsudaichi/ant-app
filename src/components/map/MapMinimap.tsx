import React from 'react';
import { useMapStore } from '../../store/mapStore';
import { getSizeInPixels } from '../../utils/nodeUtils';

interface MapMinimapProps {
  scale: number;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
}

export function MapMinimap({ scale, position, onPositionChange }: MapMinimapProps) {
  const actors = useMapStore((state) => state.actors);
  const minimapSize = 150;
  // Calculate viewport size at scale 1
  const viewportSize = {
    width: window.innerWidth / scale,
    height: window.innerHeight / scale,
  };

  // Convert viewport size to minimap scale
  const minimapViewportSize = {
    width: (viewportSize.width / 10000) * minimapSize,
    height: (viewportSize.height / 10000) * minimapSize,
  };

  // Calculate viewport position considering scale
  const viewportPosition = {
    x: (-position.x / scale / 10000) * minimapSize,
    y: (-position.y / scale / 10000) * minimapSize,
  };

  const handleMinimapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert minimap coordinates to scaled canvas coordinates
    onPositionChange({
      x: -(x / minimapSize) * 10000 * scale, 
      y: -(y / minimapSize) * 10000 * scale,
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-lg p-2"
      style={{ width: minimapSize + 16, height: minimapSize + 16 }}
    >
      <div
        className="relative bg-gray-100 cursor-pointer"
        style={{ width: minimapSize, height: minimapSize }}
        onClick={handleMinimapClick}
      >
        {/* Render actors */}
        {actors.map((actor) => {
          const size = getSizeInPixels(actor.size) / 50; // Scale down the size for minimap
          const x = (actor.position.x / 10000) * minimapSize;
          const y = (actor.position.y / 10000) * minimapSize;
          return (
            <div
              key={actor.id}
              className="absolute rounded-full"
              style={{ left: x, top: y, width: size, height: size, backgroundColor: actor.color }}
            />
          );
        })}
        <div
          className="absolute bg-indigo-200 opacity-50 pointer-events-none"
          style={{
            width: minimapViewportSize.width,
            height: minimapViewportSize.height,
            transform: `translate(${viewportPosition.x}px, ${viewportPosition.y}px)`,
            transformOrigin: 'top left'
          }}
        />
      </div>
    </div>
  );
}