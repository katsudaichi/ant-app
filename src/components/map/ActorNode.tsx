import React, { useRef, useState, useEffect } from 'react';
import { Actor } from '../../types';
import { useMapStore } from '../../store/mapStore';
import { calculateNodeSize, getSizeInPixels } from '../../utils/nodeUtils';

interface ActorNodeProps {
  actor: Actor;
  scale: number;
  onEdit: (actor: Actor) => void;
}

export function ActorNode({ actor, scale, onEdit }: ActorNodeProps) {
  const updateActor = useMapStore((state) => state.updateActor);
  const addRelation = useMapStore((state) => state.addRelation);
  const relations = useMapStore((state) => state.relations);
  const actors = useMapStore((state) => state.actors);
  const groups = useMapStore((state) => state.groups);
  const [isRelationSource, setIsRelationSource] = useState(false);
  const [isRelationTarget, setIsRelationTarget] = useState(false);
  const isDragging = useRef(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const cursorLineInterval = useRef<number | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const isCreatingRelation = useRef(false);
  const cursorLineRef = useRef<SVGLineElement>(null);
  const sourcePositionRef = useRef({ x: 0, y: 0 });

  // Update source position continuously while creating relation
  const updateSourcePosition = React.useCallback(() => {
    if (isCreatingRelation.current && nodeRef.current) {
      const rect = nodeRef.current.getBoundingClientRect();
      const size = getSizeInPixels(actor.size);
      // Calculate the actual center position considering the viewport transformations
      sourcePositionRef.current = {
        x: rect.left + (rect.width / 2),
        y: rect.top + (rect.height / 2)
      };
    }
  }, [actor.size, scale]);

  // Add notification state to the parent component
  const [showNotification, setShowNotification] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // Prevent text selection
    isDragging.current = true;
    startPos.current = {
      x: e.clientX - actor.position.x * scale,
      y: e.clientY - actor.position.y * scale
    };
    
    // Add event listeners to document for smoother dragging
    document.addEventListener('mousemove', handleMouseMoveDocument);
    document.addEventListener('mouseup', handleMouseUpDocument);
  };

  const handleMouseMoveDocument = (e: MouseEvent) => {
    if (!isDragging.current) return;
    e.stopPropagation();
    e.preventDefault();

    const newX = (e.clientX - startPos.current.x) / scale;
    const newY = (e.clientY - startPos.current.y) / scale;

    updateActor({
      ...actor,
      position: { x: newX, y: newY }
    });
  };

  const handleMouseUpDocument = () => {
    isDragging.current = false;
    document.removeEventListener('mousemove', handleMouseMoveDocument);
    document.removeEventListener('mouseup', handleMouseUpDocument);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('openSidebar'));
    window.dispatchEvent(new CustomEvent('editActor', { detail: actor.id }));
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isCreatingRelation.current) return;
    
    if (isCreatingRelation.current) return;
    
    isCreatingRelation.current = true;
    setIsRelationSource(true);
    setShowNotification(true);
    
    // Create cursor following line
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.pointerEvents = 'none';
    svg.style.zIndex = '50';
    svg.style.filter = 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))';
    svg.style.position = 'fixed';
    svg.style.pointerEvents = 'none';

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', actor.color);
    line.setAttribute('stroke-width', '2');
    line.setAttribute('stroke-dasharray', '4');
    line.setAttribute('class', 'animate-dash');
    cursorLineRef.current = line;
    
    svg.appendChild(line);
    document.body.appendChild(svg);

    // Start continuous position updates
    updateSourcePosition();
    // Update position on scroll and resize events
    const handleViewportChange = () => {
      updateSourcePosition();
      if (cursorLineRef.current) {
        const rect = cursorLineRef.current.getBoundingClientRect();
        updateCursorLine(rect.right, rect.bottom);
      }
    };

    window.addEventListener('scroll', handleViewportChange);
    window.addEventListener('resize', handleViewportChange);
    cursorLineInterval.current = window.setInterval(updateSourcePosition, 16);
    updateCursorLine(e.clientX, e.clientY);

    // Add mousemove listener for cursor following
    const handleMouseMove = (e: MouseEvent) => {
      updateCursorLine(e.clientX, e.clientY);
    };
    document.addEventListener('mousemove', handleMouseMove);
    
    const handleRelationCreation = (e: MouseEvent) => {
      const element = document.elementFromPoint(e.clientX, e.clientY);
      const targetNode = element?.closest('[data-actor-id]');
      
      isCreatingRelation.current = false;
      setIsRelationSource(false);
      setShowNotification(false);
      document.removeEventListener('mousemove', handleMouseMove);
      if (cursorLineInterval.current) {
        clearInterval(cursorLineInterval.current);
        cursorLineInterval.current = null;
        window.removeEventListener('scroll', handleViewportChange);
        window.removeEventListener('resize', handleViewportChange);
      }
      svg.remove();
      document.removeEventListener('click', handleRelationCreation);
      
      if (targetNode) {
        const targetId = targetNode.getAttribute('data-actor-id');
        if (targetId && targetId !== actor.id) {
          // Check if relation already exists between these actors
          const relationExists = relations.some(relation => 
            (relation.sourceId === actor.id && relation.targetId === targetId) ||
            (relation.sourceId === targetId && relation.targetId === actor.id)
          );
          
          if (relationExists) {
            alert('A relation already exists between these actors');
            return;
          }
          
          // Trigger target animation
          const targetActor = actors.find(a => a.id === targetId);
          if (targetActor) {
            const targetElement = document.querySelector(`[data-actor-id="${targetId}"]`);
            targetElement?.classList.add('animate-relation-complete');
            setTimeout(() => {
              targetElement?.classList.remove('animate-relation-complete');
            }, 500);
          }

          addRelation({
            id: crypto.randomUUID(),
            sourceId: actor.id,
            targetId,
            color: '#6B7280',
            width: 2,
            startStyle: 'none',
            endStyle: 'none'
          });
        }
      }
    };
    
    document.addEventListener('click', handleRelationCreation, { once: true });
  };

  const updateCursorLine = (cursorX: number, cursorY: number) => {
    if (cursorLineRef.current) {
      cursorLineRef.current.setAttribute('x1', sourcePositionRef.current.x.toString());
      cursorLineRef.current.setAttribute('y1', sourcePositionRef.current.y.toString());
      cursorLineRef.current.setAttribute('x2', cursorX.toString());
      cursorLineRef.current.setAttribute('y2', cursorY.toString());
    }
  };

  const sizeClass = calculateNodeSize(actor.size);

  // Cleanup event listeners on unmount
  React.useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMoveDocument);
      document.removeEventListener('mouseup', handleMouseUpDocument);
      if (cursorLineInterval.current) {
        clearInterval(cursorLineInterval.current);
      }
    };
  }, [updateSourcePosition]);

  // Add notification to the root element
  React.useEffect(() => {
    if (showNotification) {
      const notificationContainer = document.createElement('div');
      notificationContainer.className = 'fixed top-6 left-1/2 transform -translate-x-1/2 z-50';
      
      const notification = document.createElement('div');
      notification.className = 'bg-white/90 backdrop-blur-sm text-indigo-700 px-6 py-3 rounded-lg shadow-lg border border-indigo-100';
      
      const content = document.createElement('div');
      content.className = 'flex items-center space-x-2';
      
      const dot = document.createElement('div');
      dot.className = 'w-2 h-2 rounded-full bg-indigo-500 animate-pulse';
      
      const text = document.createElement('span');
      text.className = 'font-medium';
      text.textContent = 'Please select another actor';
      
      content.appendChild(dot);
      content.appendChild(text);
      notification.appendChild(content);
      notificationContainer.appendChild(notification);
      document.body.appendChild(notificationContainer);
      
      return () => {
        document.body.removeChild(notificationContainer);
      };
    }
  }, [showNotification]);

  return (
    <div
      ref={nodeRef}
      data-actor-id={actor.id}
      className={`absolute group select-none ${isRelationSource ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'}`}
      style={{ left: actor.position.x, top: actor.position.y }}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      onDoubleClick={handleDoubleClick}
    >
      <div className="relative">
        {/* Actor name and emoji */}
        <div className="absolute w-40 -top-6 left-1/2 -translate-x-1/2 text-center text-gray-600 text-sm whitespace-nowrap z-10 pointer-events-none">
          {actor.name}
        </div>
        {/* Actor circle */}
        <div 
          className={`${sizeClass} rounded-full transition-all duration-200 ${
            isRelationSource ? 'ring-2 ring-indigo-500 ring-offset-2 transform scale-105' : ''
          }`}
          style={{ 
            backgroundColor: actor.color,
            cursor: isRelationSource ? 'crosshair' : 'grab'
          }}
        >
          {actor.emoji && (
            <div className="absolute inset-0 flex items-center justify-center text-2xl pointer-events-none">
              {actor.emoji}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}