export function getEdgeMarker(type: 'arrow' | 'circle', position: 'start' | 'end', color: string) {
  const id = `${type}-${position}`;
  
  if (type === 'arrow') {
    return `
      <marker
        id="${id}"
        viewBox="0 0 10 10"
        refX="${position === 'start' ? 2 : 8}"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="${position === 'start' ? 'auto-start-reverse' : 'auto'}"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${color}" />
      </marker>
    `;
  }
  
  return '';
}

export function calculateEdgePoints(
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  sourceRadius: number,
  targetRadius: number
) {
  // Calculate vector between centers
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Prevent division by zero
  if (distance === 0) {
    return {
      startX: sourceX,
      startY: sourceY,
      endX: targetX,
      endY: targetY,
      centerX: sourceX,
      centerY: sourceY
    };
  }
  
  const unitX = dx / distance;
  const unitY = dy / distance;

  // Calculate start and end points with consistent offset
  const startX = sourceX + (sourceRadius + 5) * unitX;
  const startY = sourceY + (sourceRadius + 5) * unitY;
  const endX = targetX - (targetRadius + 5) * unitX;
  const endY = targetY - (targetRadius + 5) * unitY;

  // Calculate center point for the label
  const centerX = (startX + endX) / 2;
  const centerY = (startY + endY) / 2 - 10; // Offset text above the line

  return { startX, startY, endX, endY, centerX, centerY };
}