import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Actor } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface Props {
  projectId: string;
}

interface CursorPosition {
  userId: string;
  position: { x: number; y: number };
}

export default function Canvas({ projectId }: Props) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [actors, setActors] = useState<Actor[]>([]);
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number }>>(new Map());
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.emit('join-project', projectId);

    newSocket.on('cursor-update', (data: CursorPosition) => {
      setCursors(prev => new Map(prev).set(data.userId, data.position));
    });

    newSocket.on('actor-updated', (data: { actorId: string; position: { x: number; y: number } }) => {
      setActors(prev =>
        prev.map(actor =>
          actor.id === data.actorId
            ? { ...actor, position: data.position }
            : actor
        )
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [projectId]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !socket) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    socket.emit('cursor-move', {
      projectId,
      position
    });
  };

  const handleActorDrag = (actorId: string, position: { x: number; y: number }) => {
    if (!socket) return;

    socket.emit('actor-update', {
      projectId,
      actorId,
      position
    });
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-screen bg-gray-100"
      onMouseMove={handleMouseMove}
    >
      {/* アクターの表示 */}
      {actors.map(actor => (
        <div
          key={actor.id}
          className="absolute cursor-move bg-blue-500 rounded-full w-8 h-8"
          style={{
            left: actor.position.x,
            top: actor.position.y,
            transform: 'translate(-50%, -50%)'
          }}
          draggable
          onDragEnd={(e) => {
            const rect = canvasRef.current?.getBoundingClientRect();
            if (!rect) return;
            handleActorDrag(actor.id, {
              x: e.clientX - rect.left,
              y: e.clientY - rect.top
            });
          }}
        />
      ))}

      {/* カーソルの表示 */}
      {Array.from(cursors.entries()).map(([userId, position]) => (
        <div
          key={userId}
          className="absolute w-4 h-4 border-2 border-red-500 rounded-full"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
    </div>
  );
} 