import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Actor } from '../types';
import { useProjectStore } from '../stores/projectStore';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

interface Props {
  projectId: string;
  userId: string;
}

interface CursorPosition {
  userId: string;
  position: { x: number; y: number };
}

export default function Canvas({ projectId, userId }: Props) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number }>>(new Map());
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const { actors, loadProject, updateActor, setActors } = useProjectStore();

  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    // プロジェクトデータの読み込み
    loadProject(projectId);

    newSocket.emit('join-project', projectId);

    newSocket.on('cursor-update', (data: CursorPosition) => {
      setCursors(prev => new Map(prev).set(data.userId, data.position));
    });

    newSocket.on('actor-updated', (data: { actorId: string; position: { x: number; y: number } }) => {
      updateActor(data.actorId, { position_x: data.position.x, position_y: data.position.y });
    });

    newSocket.on('actor-created', (newActor: Actor) => {
      setActors([...actors, newActor]);
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

  const handleActorDrag = (actor: Actor, newPosition: { x: number; y: number }) => {
    if (!socket) return;

    // ローカルの状態を更新
    updateActor(actor.id, {
      position_x: newPosition.x,
      position_y: newPosition.y
    });

    // サーバーに更新を送信
    socket.emit('actor-update', {
      projectId,
      actorId: actor.id,
      position: newPosition
    });
  };

  const handleAddActor = () => {
    if (!socket) return;

    const newActor = {
      projectId,
      name: `Actor ${actors.length + 1}`,
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500
      },
      createdBy: userId
    };

    socket.emit('actor-create', newActor);
  };

  return (
    <div className="relative w-full h-screen">
      {/* ツールバー */}
      <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-md">
        <button
          onClick={handleAddActor}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          アクターを追加
        </button>
      </div>

      {/* キャンバス */}
      <div
        ref={canvasRef}
        className="w-full h-full bg-gray-100"
        onMouseMove={handleMouseMove}
      >
        {/* アクターの表示 */}
        {actors.map(actor => (
          <div
            key={actor.id}
            className="absolute cursor-move bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white text-xs"
            style={{
              left: actor.position_x,
              top: actor.position_y,
              transform: 'translate(-50%, -50%)'
            }}
            draggable
            onDragEnd={(e) => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return;
              handleActorDrag(actor, {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              });
            }}
          >
            {actor.name}
          </div>
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
    </div>
  );
} 