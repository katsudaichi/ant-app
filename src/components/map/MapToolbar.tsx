import React from 'react';
import { MessageSquare, Star, Edit2 } from 'lucide-react';
import { useMapStore } from '../../store/mapStore';

export function MapToolbar() {
  const activeTool = useMapStore((state) => state.activeTool);
  const setActiveTool = useMapStore((state) => state.setActiveTool);

  const tools = [
    { id: 'arrow', icon: Edit2, label: 'Edit' },
    { id: 'comment', icon: MessageSquare, label: 'Comments' },
    { id: 'star', icon: Star, label: 'Stars' },
  ] as const;

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
      {tools.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => setActiveTool(id)}
          className={`
            p-2 rounded-lg relative group
            ${activeTool === id 
              ? 'bg-indigo-100 text-indigo-600' 
              : 'text-gray-600 hover:bg-gray-100'
            }
          `}
          title={label}
        >
          <Icon className="w-5 h-5" />
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 hidden group-hover:block z-10">
            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              {label}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}