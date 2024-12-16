import { create } from 'zustand';
import { Actor, Project } from '../types';

interface ProjectState {
  currentProject: Project | null;
  actors: Actor[];
  setCurrentProject: (project: Project) => void;
  setActors: (actors: Actor[]) => void;
  addActor: (actor: Actor) => void;
  updateActor: (actorId: string, updates: Partial<Actor>) => void;
  loadProject: (projectId: string) => Promise<void>;
  saveActor: (actor: Actor) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  actors: [],

  setCurrentProject: (project) => set({ currentProject: project }),
  setActors: (actors) => set({ actors }),

  addActor: (actor) => set((state) => ({
    actors: [...state.actors, actor]
  })),

  updateActor: (actorId, updates) => set((state) => ({
    actors: state.actors.map((actor) =>
      actor.id === actorId ? { ...actor, ...updates } : actor
    )
  })),

  loadProject: async (projectId) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) throw new Error('Failed to load project');
      const project = await response.json();
      set({ currentProject: project });

      // アクターの読み込み
      const actorsResponse = await fetch(`/api/projects/${projectId}/actors`);
      if (!actorsResponse.ok) throw new Error('Failed to load actors');
      const actors = await actorsResponse.json();
      set({ actors });
    } catch (error) {
      console.error('Error loading project:', error);
    }
  },

  saveActor: async (actor) => {
    try {
      const response = await fetch(`/api/actors/${actor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actor),
      });
      if (!response.ok) throw new Error('Failed to save actor');
    } catch (error) {
      console.error('Error saving actor:', error);
    }
  },
})); 