import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string) => Promise<void>;
  register: (email: string, name: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  
  setUser: (user) => set({ user }),

  login: async (email) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const user = await response.json();
      set({ user });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (email, name) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const user = await response.json();
      set({ user });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
})); 