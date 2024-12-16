import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Comment } from '../../types';

interface EditCommentModalProps {
  comment?: Comment;
  position?: { x: number; y: number };
  onSave: (text: string) => void;
  onClose: () => void;
}

export function EditCommentModal({ comment, position, onSave, onClose }: EditCommentModalProps) {
  const [text, setText] = useState(comment?.text || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave(text.trim());
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {comment ? 'Edit Comment' : 'Add Comment'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700">
                Comment Text
              </label>
              <textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your comment..."
                autoFocus
              />
            </div>

            {position && (
              <div className="text-sm text-gray-500">
                Position: ({Math.round(position.x)}, {Math.round(position.y)})
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                {comment ? 'Update' : 'Add'} Comment
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}