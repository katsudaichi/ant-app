import { create } from 'zustand';
import { Actor, Project } from '../types';
import { useAuthStore } from './authStore';

interface ProjectState {
  currentProject: Project | null;
  actors: Actor[];
  setCurrentProject: (project: Project) => void;
  setActors: (actors: Actor[]) => void;
  updateActor: (actorId: string, updates: Partial<Actor>) => void;
  loadProject: (projectId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  actors: [],

  setCurrentProject: (project) => set({ currentProject: project }),
  setActors: (actors) => set({ actors }),

  updateActor: (actorId, updates) => set((state) => ({
    actors: state.actors.map((actor) =>
      actor.id === actorId ? { ...actor, ...updates } : actor
    )
  })),

  loadProject: async (projectId) => {
    try {
      const token = useAuthStore.getState().token;
      if (!token) {
        throw new Error('Authentication required');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // プロジェクト情報の読み込み
      const response = await fetch(`/api/projects/${projectId}`, { headers });
      if (!response.ok) throw new Error('Failed to load project');
      const project = await response.json();
      set({ currentProject: project });

      // アクターの読み込み
      const actorsResponse = await fetch(`/api/projects/${projectId}/actors`, { headers });
      if (!actorsResponse.ok) throw new Error('Failed to load actors');
      const actors = await actorsResponse.json();
      set({ actors });
    } catch (error) {
      console.error('Error loading project:', error);
    }
  }
})); 