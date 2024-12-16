import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { Project } from '../../types';

interface NewProjectModalProps {
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

export function NewProjectModal({ onClose, onSuccess }: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🗺️');
  const [description, setDescription] = useState('');
  const addProject = useProjectStore((state) => state.addProject);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: name.trim(),
      icon,
      description: description.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      actorsCount: 0,
      relationsCount: 0,
      groupsCount: 0,
    };

    addProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="icon" className="block text-sm font-medium text-gray-700">
              Project Icon
            </label>
            <input
              type="text"
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter an emoji"
            />
            <p className="mt-1 text-sm text-gray-500">
              Tip: Use your system's emoji picker or paste an emoji directly
            </p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter project description"
            />
          </div>

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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}