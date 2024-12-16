import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { ProjectCard } from '../components/ProjectCard';
import { NewProjectModal } from '../components/modals/NewProjectModal';
import { EditProjectModal } from '../components/modals/EditProjectModal';
import { useProjectStore } from '../store/projectStore';
import { useMapStore } from '../store/mapStore';
import { Project } from '../types';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjectStore();
  const { clearMapData, setCurrentProject } = useMapStore();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const handleProjectClick = (project: Project) => {
    setCurrentProject(project.id);
    navigate(`/projects/${project.id}`);
  };

  const handleNewProjectSuccess = (projectId: string) => {
    setShowNewProjectModal(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        // TODO: Add API call
        deleteProject(projectId);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
            onClick={handleProjectClick}
          />
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new project.
          </p>
        </div>
      )}

      {/* TODO: Implement NewProjectModal component */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onSuccess={handleNewProjectSuccess}
        />
      )}
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  );
}