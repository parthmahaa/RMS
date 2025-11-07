import { create } from 'zustand'
import api from '../utils/api'

interface AuthState {
  userId: number | null;
  token: string | null;
  isAuthenticated: boolean;
  email: string | null;
  isLoading: boolean;
  companyId?: number;
  roles: string[];
  login: (email: string, userId: number, roles: string[], token: string) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  token: null,
  isAuthenticated: false,
  email: null,
  isLoading: true,
  roles: [],

  login: (email: string, userId: number, roles: string[], token: string) => {
    localStorage.setItem('token', token);
    set({
      userId,
      token,
      isLoading: false,
      roles,
      email,
      isAuthenticated: true
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      userId: null, 
      token: null,
      isLoading: false,
      roles: [],
      email: null,
      isAuthenticated: false
    });
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('token');  
    if (!token) {
      set({
        userId: null,
        token: null,
        isLoading: false,
        roles: [],
        email: null,
        isAuthenticated: false
      });
      return;
    }

    try {
      const response = await api.get('/auth/verify');
      const userData = response.data.data;
      const { token, email, id, roles } = userData;
      set({
        userId: id,
        token: token,
        isLoading: false,
        roles: roles,
        email: email,
        isAuthenticated: true
      });
    } catch (err: any) {
      console.error("Authentication failed:", err?.response?.message || err);
      localStorage.removeItem('token');
      set({
        userId: null,
        token: null,
        isLoading: false,
        roles: [],
        email: null,
        isAuthenticated: false
      });
    }
  }
}));

export default useAuthStore;