import React from 'react';
import { Pencil, Trash2, GripVertical, Target } from 'lucide-react';
import { Actor } from '../../types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMapStore } from '../../store/mapStore';

interface ActorListItemProps {
  actor: Actor;
  onDelete: (actorId: string) => void;
  onFocus: () => void;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#64748B'
];

const SIZES = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' }
];

export function ActorListItem({ actor, onDelete, onFocus, isEditing, onEditingChange }: ActorListItemProps) {
  const [name, setName] = React.useState(actor.name);
  const [emoji, setEmoji] = React.useState(actor.emoji || '');
  const [description, setDescription] = React.useState(actor.description || '');
  const [color, setColor] = React.useState(actor.color);
  const [size, setSize] = React.useState(actor.size);
  const [selectedGroups, setSelectedGroups] = React.useState(actor.groups);

  const groups = useMapStore((state) => state.groups);
  const updateActor = useMapStore((state) => state.updateActor);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: actor.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this actor?')) {
      onDelete(actor.id);
    }
  };

  const handleSave = () => {
    updateActor({
      ...actor,
      name: name.trim(),
      emoji: emoji.trim(),
      description: description.trim(),
      color,
      size,
      groups: selectedGroups,
    });
    onEditingChange(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border border-gray-200 touch-none"
      {...attributes}
    >
      {!isEditing ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div 
                className="cursor-move text-gray-400 hover:text-gray-600"
                {...listeners}
              >
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="flex items-center space-x-2">
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: actor.color }}
                >
                  {actor.emoji && (
                    <div className="flex items-center justify-center h-full text-sm">
                      {actor.emoji}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-gray-900">{actor.name}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFocus();
                }}
                className="p-1 text-gray-400 hover:text-indigo-600"
                title="Focus on actor"
              >
                <Target className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEditingChange(true)}
                className="p-1 text-gray-400 hover:text-indigo-600"
                title="Edit actor"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600"
                title="Delete actor"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          {actor.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{actor.description}</p>
          )}
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Actor name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emoji
            </label>
            <input
              type="text"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Enter an emoji"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Actor description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <div className="grid grid-cols-5 gap-1">
                {SIZES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`
                      px-2 py-1 text-xs font-medium rounded
                      ${size === value 
                        ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-700'
                        : 'bg-white text-gray-700 ring-1 ring-gray-300'
                      }
                    `}
                    onClick={() => setSize(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Groups
            </label>
            <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2">
              {groups.map((group) => (
                <label
                  key={group.id}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGroups([...selectedGroups, group.id]);
                      } else {
                        setSelectedGroups(selectedGroups.filter(id => id !== group.id));
                      }
                    }}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                    <span>{group.emoji} {group.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => onEditingChange(false)}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}