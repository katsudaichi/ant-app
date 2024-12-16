import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Actor } from '../types';
import { useProjectStore } from '../stores/projectStore';

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
  const [cursors, setCursors] = useState<Map<string, { x: number; y: number }>>(new Map());
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const { actors, loadProject, updateActor } = useProjectStore();

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

  const handleActorDrag = async (actor: Actor, newPosition: { x: number; y: number }) => {
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

    // データベースに保存
    await useProjectStore.getState().saveActor({
      ...actor,
      position_x: newPosition.x,
      position_y: newPosition.y
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