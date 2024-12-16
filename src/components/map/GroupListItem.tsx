import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Actor, Group } from '../../types';
import { useMapStore } from '../../store/mapStore';

interface GroupListItemProps {
  group: Group;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#64748B'
];

export function GroupListItem({ group }: GroupListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [emoji, setEmoji] = useState(group.emoji || '');
  const [color, setColor] = useState(group.color);
  const [selectedActors, setSelectedActors] = useState<string[]>([]);

  const updateGroup = useMapStore((state) => state.updateGroup);
  const deleteGroup = useMapStore((state) => state.deleteGroup);
  const actors = useMapStore((state) => state.actors);
  const updateActor = useMapStore((state) => state.updateActor);

  // Initialize selected actors when editing starts
  React.useEffect(() => {
    if (isEditing) {
      const groupActors = actors.filter(actor => actor.groups.includes(group.id));
      setSelectedActors(groupActors.map(actor => actor.id));
    }
  }, [isEditing, actors, group.id]);

  const handleSave = () => {
    // Update group
    updateGroup({
      ...group,
      name: name.trim(),
      emoji: emoji.trim(),
      color
    });

    // Update actors' group memberships
    actors.forEach(actor => {
      const isCurrentlySelected = selectedActors.includes(actor.id);
      const isCurrentlyInGroup = actor.groups.includes(group.id);
      
      if (isCurrentlySelected !== isCurrentlyInGroup) {
        const newGroups = isCurrentlySelected
          ? [...actor.groups, group.id]
          : actor.groups.filter(g => g !== group.id);
        
        updateActor({
          ...actor,
          groups: newGroups
        });
      }
    });

    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      // Remove the group from all actors
      actors.forEach(actor => {
        if (actor.groups.includes(group.id)) {
          updateActor({
            ...actor,
            groups: actor.groups.filter(g => g !== group.id)
          });
        }
      });
      // Remove the group from all actors first
      actors.forEach(actor => {
        if (actor.groups.includes(group.id)) {
          updateActor({
            ...actor,
            groups: actor.groups.filter(g => g !== group.id)
          });
        }
      });
      // Then delete the group
      deleteGroup(group.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {!isEditing ? (
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: group.color }}
            />
            <span className="text-sm">{group.emoji} {group.name}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-indigo-600"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="Group name"
            />
          </div>
          <div>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              placeholder="Emoji (optional)"
            />
          </div>
          <div>
            <div className="grid grid-cols-6 gap-1">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  className={`
                    w-6 h-6 rounded-full
                    ${color === presetColor ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}
                  `}
                  style={{ backgroundColor: presetColor }}
                  onClick={() => setColor(presetColor)}
                />
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actors
            </label>
            <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2">
              {actors.map((actor) => (
                <label
                  key={actor.id}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedActors.includes(actor.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedActors([...selectedActors, actor.id]);
                      } else {
                        setSelectedActors(selectedActors.filter(id => id !== actor.id));
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: actor.color }}
                    />
                    <span>{actor.emoji} {actor.name}</span>
                  </div>
                </label>
              ))}
              {actors.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">
                  No actors available
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-xs font-medium text-gray-700 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}