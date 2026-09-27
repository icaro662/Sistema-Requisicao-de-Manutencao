import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse, User } from '../types';

interface AuthState {
  user: User | null;
  sessionEmail: string | null;
  signIn: (session: AuthResponse) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  user: null,
  sessionEmail: null,
  signIn: (session) => {
    localStorage.setItem('accessToken', session.accessToken);
    localStorage.setItem('refreshToken', session.refreshToken);
    set({ sessionEmail: session.user.email, user: session.user });
  },
  signOut: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ sessionEmail: null, user: null });
  },
}), { name: 'maintenance-auth' }));
