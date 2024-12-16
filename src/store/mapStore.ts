import { create } from 'zustand';
import { Actor, Group } from '../types';

interface ProjectData {
  actors: Actor[];
  groups: Group[];
  relations: Relation[];
  comments: Comment[];
  stars: Star[];
  viewportPosition: { x: number; y: number };
  scale: number;
}

interface MapState {
  currentProjectId: string | null;
  projectsData: Record<string, ProjectData>;
  actors: Actor[];
  groups: Group[];
  relations: Relation[];
  viewportPosition: { x: number; y: number };
  scale: number;
  comments: Comment[];
  stars: Star[];
  selectedActorId: string | null;
  selectedGroupId: string | null;
  activeTool: 'arrow' | 'comment' | 'star';
  userCursors: UserCursor[];
  updateUserCursor: (cursor: UserCursor) => void;
  removeUserCursor: (userId: string) => void;
  setActiveTab: (tab: 'actors' | 'relations' | 'comments' | 'members') => void;
  addRelation: (relation: Relation) => void;
  updateRelation: (relation: Relation) => void;
  deleteRelation: (relationId: string) => void;
  addActor: (actor: Actor) => void;
  updateActor: (actor: Actor) => void;
  deleteActor: (actorId: string) => void;
  addGroup: (group: Group) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (groupId: string) => void;
  addComment: (comment: Comment) => void;
  updateComment: (comment: Comment) => void;
  deleteComment: (commentId: string) => void;
  addStar: (star: Star) => void;
  updateStar: (star: Star) => void;
  deleteStar: (starId: string) => void;
  setActiveTool: (tool: 'arrow' | 'comment' | 'star') => void;
  selectActor: (actorId: string | null) => void;
  selectGroup: (groupId: string | null) => void;
  setViewportPosition: (position: { x: number; y: number }) => void;
  setScale: (scale: number) => void;
  setActors: (actors: Actor[]) => void;
  setGroups: (groups: Group[]) => void;
  setRelations: (relations: Relation[]) => void;
  clearMapData: () => void;
  setCurrentProject: (projectId: string) => void;
}

const DEFAULT_PROJECT_DATA: ProjectData = {
  actors: [],
  groups: [],
  relations: [],
  comments: [],
  stars: [],
  viewportPosition: { x: -5000, y: -5000 },
  scale: 1,
};

export const useMapStore = create<MapState>((set) => ({
  currentProjectId: null,
  projectsData: {},
  actors: [],
  groups: [],
  relations: [],
  viewportPosition: { x: -5000, y: -5000 }, // Initial center position
  scale: 1,
  comments: [],
  stars: [],
  selectedActorId: null,
  selectedGroupId: null,
  activeTool: 'arrow',
  userCursors: [],
  updateUserCursor: (cursor) => set((state) => ({
    userCursors: [
      ...state.userCursors.filter(c => c.userId !== cursor.userId),
      cursor
    ]
  })),
  removeUserCursor: (userId) => set((state) => ({
    userCursors: state.userCursors.filter(c => c.userId !== userId)
  })),
  setActiveTab: (tab) => set((state) => ({ activeTab: tab })),
  addRelation: (relation) => set((state) => {
    if (!state.currentProjectId) return state;
    const projectData = state.projectsData[state.currentProjectId] || { ...DEFAULT_PROJECT_DATA };
    return {
      relations: [...state.relations, {
        ...relation,
        color: '#6B7280',
        width: 2,
        startStyle: 'none',
        endStyle: 'none'
      }],
      projectsData: {
        ...state.projectsData,
        [state.currentProjectId]: {
          ...projectData,
          relations: [...projectData.relations, relation]
        }
      }
    };
  }),
  updateRelation: (relation) => set((state) => {
    if (!state.currentProjectId) return state;
    const projectData = state.projectsData[state.currentProjectId];
    if (!projectData) return state;
    return {
      relations: state.relations.map((r) => r.id === relation.id ? relation : r),
      projectsData: {
        ...state.projectsData,
        [state.currentProjectId]: {
          ...projectData,
          relations: projectData.relations.map((r) => r.id === relation.id ? relation : r)
        }
      }
    };
  }),
  deleteRelation: (relationId) => set((state) => ({
    relations: state.relations.filter((r) => r.id !== relationId)
  })),
  addActor: (actor) => set((state) => ({ 
    actors: [...state.actors, actor] 
  })),
  reorderActors: (actors) => set({ actors }),
  updateActor: (actor) => set((state) => ({
    actors: state.actors.map((a) => a.id === actor.id ? actor : a)
  })),
  deleteActor: (actorId) => set((state) => ({
    actors: state.actors.filter((a) => a.id !== actorId)
  })),
  addGroup: (group) => set((state) => ({ 
    groups: [...state.groups, group] 
  })),
  updateGroup: (group) => set((state) => ({
    groups: state.groups.map((g) => g.id === group.id ? group : g)
  })),
  deleteGroup: (groupId) => set((state) => ({
    groups: state.groups.filter((g) => g.id !== groupId)
  })),
  addComment: (comment) => set((state) => ({
    comments: [...state.comments, comment]
  })),
  updateComment: (comment) => set((state) => ({
    comments: state.comments.map((c) => c.id === comment.id ? comment : c)
  })),
  deleteComment: (commentId) => set((state) => ({
    comments: state.comments.filter((c) => c.id !== commentId)
  })),
  addStar: (star) => set((state) => ({
    stars: [...state.stars, star]
  })),
  updateStar: (star) => set((state) => ({
    stars: state.stars.map((s) => s.id === star.id ? star : s)
  })),
  deleteStar: (starId) => set((state) => ({
    stars: state.stars.filter((s) => s.id !== starId)
  })),
  setActiveTool: (tool) => set({ activeTool: tool }),
  selectActor: (actorId) => set({ selectedActorId: actorId }),
  selectGroup: (groupId) => set({ selectedGroupId: groupId }),
  setViewportPosition: (position) => set({ viewportPosition: position }),
  setScale: (scale) => set({ scale }),
  setActors: (actors) => set({ actors }),
  setGroups: (groups) => set({ groups }),
  setRelations: (relations) => set({ relations }),
  clearMapData: () => set((state) => ({
    ...state,
    ...DEFAULT_PROJECT_DATA,
    currentProjectId: null,
  })),
  setCurrentProject: (projectId) => set((state) => {
    const projectData = state.projectsData[projectId] || { ...DEFAULT_PROJECT_DATA };
    return {
      ...state,
      currentProjectId: projectId,
      ...projectData,
    };
  }),
}));