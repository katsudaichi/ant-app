import { create } from 'zustand';
import { Project } from '../types';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  setProjects: (projects: Project[]) => void;
  selectProject: (project: Project) => void;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  selectedProject: null,
  setProjects: (projects) => set({ projects }),
  selectProject: (project) => set({ selectedProject: project }),
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  updateProject: (project) => set((state) => ({
    projects: state.projects.map((p) => 
      p.id === project.id ? project : p
    )
  })),
  deleteProject: (projectId) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== projectId)
  })),
}));