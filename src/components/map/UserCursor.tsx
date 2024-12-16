import React from 'react';
import { UserCursor as UserCursorType } from '../../types';

interface UserCursorProps {
  cursor: UserCursorType;
}

export function UserCursor({ cursor }: UserCursorProps) {
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: cursor.position.x,
        top: cursor.position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Cursor */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{ transform: 'rotate(-45deg)' }}
      >
        <path
          d="M12 1L23 12L12 23L1 12L12 1Z"
          fill={cursor.color}
          fillOpacity="0.2"
          stroke={cursor.color}
          strokeWidth="2"
        />
      </svg>
      
      {/* User name label */}
      <div
        className="absolute left-6 top-0 px-2 py-1 rounded text-xs font-medium whitespace-nowrap"
        style={{
          backgroundColor: cursor.color,
          color: 'white',
          transform: 'translateY(-50%)'
        }}
      >
        {cursor.userName}
      </div>
    </div>
  );
}