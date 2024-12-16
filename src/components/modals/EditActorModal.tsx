import React, { useState } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import { Actor } from '../../types';
import { useMapStore } from '../../store/mapStore';

interface EditActorModalProps {
  actor: Actor;
  onClose: () => void;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4',  // First row
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#64748B'   // Second row
];

export function EditActorModal({ actor, onClose }: EditActorModalProps) {
  const [name, setName] = useState(actor.name);
  const [emoji, setEmoji] = useState(actor.emoji || '');
  const [description, setDescription] = useState(actor.description || '');
  const [color, setColor] = useState(actor.color);
  const [customColor, setCustomColor] = useState(actor.color);
  const [selectedGroups, setSelectedGroups] = useState(actor.groups);
  const [size, setSize] = useState(actor.size);

  const groups = useMapStore((state) => state.groups);
  const sizes = [
    { value: 'XS', label: 'XS' },
    { value: 'S', label: 'S' },
    { value: 'M', label: 'M' },
    { value: 'L', label: 'L' },
    { value: 'XL', label: 'XL' }
  ];
  
  const updateActor = useMapStore((state) => state.updateActor);
  const deleteActor = useMapStore((state) => state.deleteActor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateActor({
      ...actor,
      name: name.trim(),
      emoji: emoji.trim(),
      description: description.trim(),
      size,
      groups: selectedGroups,
      color: color === 'custom' ? customColor : color,
    });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this actor?')) {
      deleteActor(actor.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b rounded-t-2xl">
          <h2 className="text-xl font-semibold text-gray-900">Edit Actor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Actor Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter actor name"
              />
            </div>

            <div>
              <label htmlFor="emoji" className="block text-sm font-medium text-gray-700">
                Emoji
              </label>
              <input
                type="text"
                id="emoji"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter an emoji"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter actor description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.slice(0, 6).map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className={`
                      w-8 h-8 rounded-full
                      ${color === presetColor ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}
                    `}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => setColor(presetColor)}
                  />
                ))}
                {PRESET_COLORS.slice(6).map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className={`
                      w-8 h-8 rounded-full
                      ${color === presetColor ? 'ring-2 ring-offset-2 ring-indigo-500' : ''}
                    `}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => setColor(presetColor)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <div className="grid grid-cols-5 gap-2">
                {sizes.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`
                      px-3 py-2 text-sm font-medium rounded-md
                      ${size === value 
                        ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-700'
                        : 'bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50'
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Groups
            </label>
            <div className="space-y-2">
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
        </form>
        
        <div className="flex justify-end items-center p-6 border-t bg-gray-50 space-x-3 rounded-b-2xl">
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Update
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Actor
            </button>
        </div>
      </div>
    </div>
  );
}