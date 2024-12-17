export interface Actor {
  id: string;
  project_id: string;
  name: string;
  position_x: number;
  position_y: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ProjectMember {
  project_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
}

export interface Comment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  position_x: number;
  position_y: number;
  created_at: string;
  updated_at: string;
} 