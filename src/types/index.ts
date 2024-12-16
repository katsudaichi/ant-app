export interface ProjectMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  online: boolean;
}

export interface ProjectInvitation {
  id: string;
  projectId: string;
  email: string;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'rejected';
  expiresAt: Date;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  description?: string;
  ownerId: string;
  members: ProjectMember[];
  invitations: ProjectInvitation[];
  createdAt: Date;
  updatedAt: Date;
  actorsCount: number;
  relationsCount: number;
  groupsCount: number;
}

export interface Actor {
  id: string;
  name: string;
  emoji?: string;
  description?: string;
  position: { x: number; y: number };
  color: string;
  size: '1' | '2' | '3' | '4' | '5';
  groups: string[];
}

export interface Relation {
  id: string;
  sourceId: string;
  targetId: string;
  name?: string;
  description?: string;
  color: string;
  width: number;
  startStyle: 'none' | 'arrow' | 'circle';
  endStyle: 'none' | 'arrow' | 'circle';
}

export interface Comment {
  id: string;
  text: string;
  position: { x: number; y: number };
  createdAt: Date;
}

export interface Star {
  id: string;
  position: { x: number; y: number };
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  color: string;
  emoji?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface UserCursor {
  userId: string;
  userName: string;
  position: { x: number; y: number };
  color: string;
}