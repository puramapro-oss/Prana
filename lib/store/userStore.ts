import { create } from 'zustand';
import type { Profile } from '@/lib/supabase/types';

/* ------------------------------------------------------------------ */
/*  User / auth state                                                  */
/* ------------------------------------------------------------------ */

interface UserState {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setUser: (user: Profile) => void;
  clearUser: () => void;
  updateProfile: (fields: Partial<Profile>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: true, isLoading: false }),

  clearUser: () =>
    set({ user: null, isAuthenticated: false, isLoading: false }),

  updateProfile: (fields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...fields } : null,
    })),
}));
