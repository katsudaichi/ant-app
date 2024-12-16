import React, { useState } from 'react';
import { Pencil, Trash2, ArrowRight } from 'lucide-react';
import { Actor, Relation } from '../../types';
import { useMapStore } from '../../store/mapStore';

interface RelationListItemProps {
  relation: Relation;
  actors: Actor[];
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
}

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#F43F5E', '#64748B'
];

const LINE_WIDTHS = [1, 2, 3, 4, 5];

export function RelationListItem({ relation, actors, isEditing, onEditingChange }: RelationListItemProps) {
  const [name, setName] = useState(relation.name || '');
  const [description, setDescription] = useState(relation.description || '');
  const [color, setColor] = useState(relation.color);
  const [width, setWidth] = useState(relation.width);

  const updateRelation = useMapStore((state) => state.updateRelation);
  const deleteRelation = useMapStore((state) => state.deleteRelation);

  const sourceActor = actors.find(a => a.id === relation.sourceId);
  const targetActor = actors.find(a => a.id === relation.targetId);

  const handleSave = () => {
    updateRelation({
      ...relation,
      name: name.trim(),
      description: description.trim(),
      color,
      width
    });
    onEditingChange(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this relation?')) {
      deleteRelation(relation.id);
    }
  };

  if (!sourceActor || !targetActor) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {!isEditing ? (
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">{sourceActor.name}</span>
                <div className="w-4 h-[2px]" style={{ backgroundColor: relation.color }} />
                <span className="ml-2">{targetActor.name}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEditingChange(true)}
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
          {relation.name && (
            <p className="text-sm font-medium text-gray-900">{relation.name}</p>
          )}
          {relation.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{relation.description}</p>
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
              placeholder="Relation name"
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
              placeholder="Relation description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-500 mb-1">Color</div>
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
                <div className="text-xs text-gray-500 mb-1">Width</div>
                <div className="flex space-x-1">
                  {LINE_WIDTHS.map((w) => (
                    <button
                      key={w}
                      type="button"
                      className={`
                        flex-1 px-2 py-1 text-xs font-medium rounded
                        ${width === w 
                          ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-700'
                          : 'bg-white text-gray-700 ring-1 ring-gray-300'
                        }
                      `}
                      onClick={() => setWidth(w)}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
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