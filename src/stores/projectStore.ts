import { create } from 'zustand';
import { Actor, Project } from '../types';

interface ProjectState {
  currentProject: Project | null;
  actors: Actor[];
  setCurrentProject: (project: Project) => void;
  setActors: (actors: Actor[]) => void;
  addActor: (actor: Partial<Actor>) => Promise<void>;
  updateActor: (actorId: string, updates: Partial<Actor>) => void;
  loadProject: (projectId: string) => Promise<void>;
  saveActor: (actor: Actor) => Promise<void>;
  createActor: (projectId: string, userId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  actors: [],

  setCurrentProject: (project) => set({ currentProject: project }),
  setActors: (actors) => set({ actors }),

  addActor: async (actor) => {
    try {
      const response = await fetch(`/api/projects/${actor.project_id}/actors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(actor),
      });
      if (!response.ok) throw new Error('Failed to create actor');
      const newActor = await response.json();
      set((state) => ({
        actors: [...state.actors, newActor]
      }));
    } catch (error) {
      console.error('Error creating actor:', error);
    }
  },

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

  createActor: async (projectId, userId) => {
    const newActor = {
      project_id: projectId,
      name: `Actor ${get().actors.length + 1}`,
      position_x: Math.random() * 500,
      position_y: Math.random() * 500,
      created_by: userId
    };

    await get().addActor(newActor);
  }
})); 