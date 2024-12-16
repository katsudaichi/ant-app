import React, { useRef, useEffect, useState } from 'react';
import { useMapStore } from '../../store/mapStore';
import { ActorNode } from './ActorNode';
import { RelationEdge } from './RelationEdge';
import { CommentNode } from './CommentNode';
import { StarNode } from './StarNode';
import { UserCursor } from './UserCursor';
import { EditCommentModal } from '../modals/EditCommentModal';
import { getSizeInPixels } from '../../utils/nodeUtils';

interface MapCanvasProps {
  scale: number;
  position: { x: number; y: number };
  onEditActor: (actor: Actor) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onScaleChange: (scale: number) => void;
}


export function MapCanvas({ scale, position, onEditActor, onPositionChange, onScaleChange }: MapCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const actors = useMapStore((state) => state.actors);
  const relations = useMapStore((state) => state.relations);
  const comments = useMapStore((state) => state.comments);
  const stars = useMapStore((state) => state.stars);
  const activeTool = useMapStore((state) => state.activeTool);
  const userCursors = useMapStore((state) => state.userCursors);
  const addComment = useMapStore((state) => state.addComment);
  const addStar = useMapStore((state) => state.addStar);
  const groups = useMapStore((state) => state.groups);
  const setViewportPosition = useMapStore((state) => state.setViewportPosition);
  const [editingComment, setEditingComment] = useState<{
    comment?: Comment;
    position: { x: number; y: number };
  } | null>(null);
  const setScale = useMapStore((state) => state.setScale);

  const handleClick = (e: React.MouseEvent) => {
    // Ignore if clicking on an actor, relation, comment, or star
    if ((e.target as HTMLElement).closest('[data-actor-id], [data-relation-id], [data-comment-id], [data-star-id]')) {
      return;
    }

    if (activeTool === 'comment') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate position in canvas coordinates
      const x = (e.clientX - rect.left) / scale - position.x / scale;
      const y = (e.clientY - rect.top) / scale - position.y / scale;

      setEditingComment({ position: { x, y } });
    } else if (activeTool === 'star') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate position in canvas coordinates, adjusting for star center
      const x = (e.clientX - rect.left - 12) / scale - position.x / scale;
      const y = (e.clientY - rect.top - 12) / scale - position.y / scale;

      addStar({
        id: crypto.randomUUID(),
        position: { x, y },
        createdAt: new Date(),
      });
    }
  };

  // Calculate group boundaries
  const groupBoundaries = React.useMemo(() => {
    const boundaries = new Map();
    
    groups.forEach(group => {
      const groupActors = actors.filter(actor => actor.groups.includes(group.id));
      if (groupActors.length === 0) return;

      const positions = groupActors.map(actor => {
        const size = getSizeInPixels(actor.size);
        return {
          left: actor.position.x - size * 0.1,
          right: actor.position.x + size * 1.1,
          top: actor.position.y - size * 0.1,
          bottom: actor.position.y + size * 1.1
        };
      });

      boundaries.set(group.id, {
        left: Math.min(...positions.map(p => p.left)) - 20,
        right: Math.max(...positions.map(p => p.right)) + 20,
        top: Math.min(...positions.map(p => p.top)) - 20,
        bottom: Math.max(...positions.map(p => p.bottom)) + 20,
        color: group.color,
        name: group.name
      });
    });

    return boundaries;
  }, [groups, actors]);

  const handleWheel = (e: WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Calculate cursor position relative to the transformed content
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const contentX = mouseX - position.x;
      const contentY = mouseY - position.y;

      const delta = e.deltaY * -0.02;
      const newScale = Math.min(Math.max(scale + delta, 0.3), 1.7);
      const scaleDiff = newScale - scale;

      // Adjust position to keep the point under cursor fixed
      const newX = position.x - (contentX * scaleDiff) / scale;
      const newY = position.y - (contentY * scaleDiff) / scale;

      const boundedX = Math.min(Math.max(newX, -10000), 0);
      const boundedY = Math.min(Math.max(newY, -10000), 0);

      onScaleChange(newScale);
      setScale(newScale);
      onPositionChange({ x: boundedX, y: boundedY });
      setViewportPosition({ x: boundedX, y: boundedY });
    } else {
      const newX = position.x - e.deltaX;
      const newY = position.y - e.deltaY;

      const boundedX = Math.min(Math.max(newX, -10000), 0);
      const boundedY = Math.min(Math.max(newY, -10000), 0);

      onPositionChange({
        x: boundedX,
        y: boundedY,
      });
      setViewportPosition({ x: boundedX, y: boundedY });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [scale, position]);

  const handleSaveComment = (text: string) => {
    if (editingComment) {
      if (editingComment.comment) {
        updateComment({
          ...editingComment.comment,
          text
        });
      } else {
        addComment({
          id: crypto.randomUUID(),
          text,
          position: editingComment.position,
          createdAt: new Date(),
        });
      }
      setEditingComment(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // TODO: Emit cursor position to other users
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    // This would be handled by your real-time collaboration service
    console.log('Cursor position:', { x, y });
  };

  return (
    <>
    <div
      ref={canvasRef}
      className={`w-full h-full bg-white overflow-hidden cursor-${activeTool}`}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{
        backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
        backgroundSize: `${20 * scale}px ${20 * scale}px`,
        backgroundPosition: `${position.x}px ${position.y}px`
      }}
    >
      <div
        className="w-[10000px] h-[10000px] relative"
        style={{
          transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
          transformOrigin: '0 0',
        }}>
        {/* Render group backgrounds first */}
        {Array.from(groupBoundaries.entries()).map(([groupId, bounds]) => (
          <div
            key={groupId}
            className="absolute rounded-lg"
            style={{
              left: bounds.left,
              top: bounds.top,
              width: bounds.right - bounds.left,
              height: bounds.bottom - bounds.top,
              backgroundColor: bounds.color,
              opacity: 0.1,
            }}
          >
            <div
              className="absolute -top-6 left-4 text-sm font-bold text-opacity-100"
              style={{ color: bounds.color }}
            >
              {bounds.name}
            </div>
          </div>
        ))}
        {/* Render relations first so they appear behind actors */}
        {relations.map((relation) => (
          <RelationEdge
            key={relation.id}
            relation={relation}
            actors={actors}
            scale={scale}            
          />
        ))}
        {actors.map((actor) => (
          <ActorNode key={actor.id} actor={actor} scale={scale} onEdit={onEditActor} />
        ))}
        {comments.map((comment) => (
          <CommentNode key={comment.id} comment={comment} />
        ))}
        {stars.map((star) => (
          <StarNode key={star.id} star={star} />
        ))}
        {userCursors.map((cursor) => (
          <UserCursor key={cursor.userId} cursor={cursor} />
        ))}
      </div>
    </div>
    {editingComment && (
      <EditCommentModal
        comment={editingComment.comment}
        position={editingComment.position}
        onSave={handleSaveComment}
        onClose={() => setEditingComment(null)}
      />
    )}
    </>
  );
}