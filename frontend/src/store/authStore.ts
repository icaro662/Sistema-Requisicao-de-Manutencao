import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  sessionEmail: string | null;
  signIn: (email: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  user: null,
  sessionEmail: null,
  signIn: (email) => set({ sessionEmail: email, user: { id: 'session', name: email.split('@')[0], email } }),
  signOut: () => set({ sessionEmail: null, user: null }),
}), { name: 'maintenance-auth' }));
