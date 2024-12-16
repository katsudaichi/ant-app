import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  token: string | null;
  user: { id: string; email: string; name: string } | null;
  logout: () => void;
  setToken: (token: string) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize from localStorage if available
  const storedToken = localStorage.getItem('token');
  const initialUser = storedToken ? jwtDecode(storedToken) : null;

  return {
    token: storedToken || null,
    user: initialUser,
    setToken: (token: string) => {
      const user = jwtDecode(token);
      set({ token, user });
      localStorage.setItem('token', token);
    },
    logout: () => {
      set({ token: null, user: null });
      localStorage.removeItem('token');
    },
    isAuthenticated: () => {
      const { token } = get();
      return !!token;
    }
  };
});