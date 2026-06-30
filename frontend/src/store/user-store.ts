import { create } from 'zustand';

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  isVerified: boolean;
  skills: string[];
  careerGoal?: string;
  currentStreak: number;
  xpPoints: number;
}

interface UserState {
  user: IUserProfile | null;
  loading: boolean;
  isLoggedIn: boolean;
  setUser: (user: IUserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  isLoggedIn: false,
  setUser: (user) => set({ user, isLoggedIn: !!user, loading: false }),
  setLoading: (loading) => set({ loading }),
  logout: () => set({ user: null, isLoggedIn: false, loading: false }),
}));
