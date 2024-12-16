import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Project } from '../types';
import { format } from 'date-fns';
import { getEmojiColors } from '../utils/emojiUtils';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onClick: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete, onClick }: ProjectCardProps) {
  return (
    <div 
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] border border-gray-100 relative overflow-hidden"
      onClick={() => onClick(project)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getEmojiColors(project.icon).bg} flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-sm`}>
            <span className={`text-2xl ${getEmojiColors(project.icon).text}`}>{project.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">{project.name}</h3>
            {project.description && (
              <p className="text-gray-600 text-sm line-clamp-2 mt-1">{project.description}</p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-end mt-6">
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-medium transition-all duration-300 group-hover:bg-green-100 group-hover:text-green-800">
            {project.actorsCount} actors
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 font-medium transition-all duration-300 group-hover:bg-purple-100 group-hover:text-purple-800">
            {project.relationsCount} relations
          </div>
          <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium transition-all duration-300 group-hover:bg-blue-100 group-hover:text-blue-800">
            {project.groupsCount} groups
          </div>
        </div>
        <div className="flex flex-col items-end text-xs text-gray-500 transition-all duration-300 group-hover:text-gray-700">
          <span>Created: {format(project.createdAt, 'MMM d, yyyy')}</span>
          <span>Updated: {format(project.updatedAt, 'MMM d, yyyy')}</span>
        </div>
      </div>
    </div>
  );
}