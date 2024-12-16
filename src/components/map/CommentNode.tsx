import React, { useState } from 'react';
import { MessageSquare, X, Pencil } from 'lucide-react';
import { Comment } from '../../types';
import { useMapStore } from '../../store/mapStore';

interface CommentNodeProps {
  comment: Comment;
}

export function CommentNode({ comment }: CommentNodeProps) {
  const deleteComment = useMapStore((state) => state.deleteComment);
  const updateComment = useMapStore((state) => state.updateComment);
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
    
    updateComment({
      ...comment,
      position: {
        x,
        y
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleEdit = () => {
    window.dispatchEvent(new CustomEvent('openSidebar'));
    window.dispatchEvent(new CustomEvent('editComment', { detail: comment.id }));
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
      data-comment-id={comment.id}
      style={{ left: comment.position.x, top: comment.position.y }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={handleMouseDown}
    >
      <div className="relative">
        <div className={`
          flex items-center space-x-2 bg-white rounded-lg shadow-lg p-3
          transform transition-transform duration-200
          ${isHovered ? 'scale-105' : ''}
        `}>
          <MessageSquare className="w-5 h-5 text-indigo-600" />
          <div className="relative group/tooltip text-sm">
            <span className="inline-block truncate max-w-[5ch]">
              {comment.text.slice(0, 5)}
            </span>
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/tooltip:block z-20">
              <div className="bg-gray-900 text-white text-xs rounded py-2 px-3 whitespace-pre-wrap" style={{ width: '10ch', wordBreak: 'break-all' }}>
                {comment.text.match(/.{1,10}/g)?.join('\n') || comment.text}
              </div>
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Pencil className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => deleteComment(comment.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}