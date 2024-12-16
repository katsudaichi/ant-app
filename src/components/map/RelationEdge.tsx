import React from 'react';
import { Actor, Relation } from '../../types';
import { getEdgeMarker } from '../../utils/relationUtils';
import { calculateEdgePoints } from '../../utils/relationUtils';
import { getSizeInPixels } from '../../utils/nodeUtils';

interface RelationEdgeProps {
  relation: Relation;
  actors: Actor[];
  scale: number;  
}

export function RelationEdge({ relation, actors, scale }: RelationEdgeProps) {
  const sourceActor = actors.find(a => a.id === relation.sourceId);
  const targetActor = actors.find(a => a.id === relation.targetId);

  if (!sourceActor || !targetActor) return null;

  const sourceRadius = getSizeInPixels(sourceActor.size) / 2;
  const targetRadius = getSizeInPixels(targetActor.size) / 2;

  const { startX, startY, endX, endY, centerX, centerY } = calculateEdgePoints(
    sourceActor.position.x + sourceRadius,
    sourceActor.position.y + sourceRadius,
    targetActor.position.x + targetRadius,
    targetActor.position.y + targetRadius,
    sourceRadius,
    targetRadius
  );

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('openSidebar'));
    window.dispatchEvent(new CustomEvent('editRelation', { detail: relation.id }));
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('openSidebar'));
    window.dispatchEvent(new CustomEvent('editRelation', { detail: relation.id }));
  };

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        <filter id={`text-bg-${relation.id}`}>
          <feFlood floodColor="white" result="bg" />
          <feComposite in="bg" in2="SourceGraphic" operator="over" />
        </filter>
      </defs>
      <defs dangerouslySetInnerHTML={{
        __html: `
          ${getEdgeMarker('arrow', 'start', relation.color)}
          ${getEdgeMarker('arrow', 'end', relation.color)}
        `
      }} />
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={relation.color}
        strokeWidth={40}
        markerStart={relation.startStyle !== 'none' ? `url(#${relation.startStyle}-start)` : undefined}
        markerEnd={relation.endStyle !== 'none' ? `url(#${relation.endStyle}-end)` : undefined}
        className="cursor-pointer hover:stroke-opacity-80"
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        style={{ 
          pointerEvents: 'all',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          strokeOpacity: 0, // Make the hit area invisible
          stroke: 'transparent' // Make the hit area transparent
        }}
      >
        <title>Click to edit relation</title>
      </line>
      {relation.name && (
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pointer-events-none select-none font-medium"
          fill={relation.color}
          fontSize={12}
        >
          {relation.name}
        </text>
      )}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke={relation.color}
        strokeWidth={relation.width}
        markerStart={relation.startStyle !== 'none' ? `url(#${relation.startStyle}-start)` : undefined}
        markerEnd={relation.endStyle !== 'none' ? `url(#${relation.endStyle}-end)` : undefined}
        style={{ pointerEvents: 'none' }}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}