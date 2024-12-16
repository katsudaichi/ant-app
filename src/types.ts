export interface Actor {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  projectId: string;
  createdBy: string;
}

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
  createdAt: string;
}

export interface Comment {
  id: string;
  projectId: string;
  userId: string;
  content: string;
  position: {
    x: number;
    y: number;
  };
  createdAt: string;
  updatedAt: string;
} 