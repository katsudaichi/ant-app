import React, { forwardRef } from 'react';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { Comment } from '../../types';
import { format } from 'date-fns';

interface CommentListItemProps {
  comment: Comment;
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  onDelete: () => void;
  onSave: (text: string) => void;
}

export const CommentListItem = forwardRef<HTMLDivElement, CommentListItemProps>(({
  comment,
  isEditing,
  onEditingChange,
  onDelete,
  onSave
}, ref) => {
  const [text, setText] = React.useState(comment.text);

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim());
  };

  return (
    <div ref={ref} className="bg-white rounded-lg shadow-sm border border-gray-200">
      {!isEditing ? (
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span className="text-sm text-gray-900">{comment.text}</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEditingChange(true)}
              className="p-1 text-gray-400 hover:text-indigo-600"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Created: {format(comment.createdAt, 'MMM d, yyyy HH:mm')}
        </p>
      </div>
      ) : (
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Enter comment text"
            />
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
});