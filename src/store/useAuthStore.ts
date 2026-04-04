import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'admin' | 'asha' | 'patient' | null;

interface AuthState {
  user: {
    id: string;
    role: Role;
    name: string;
  } | null;
  login: (role: Role, name?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (role, name) => set({ 
        user: { 
          id: `usr_${Math.random().toString(36).substr(2, 9)}`, 
          role, 
          name: name || (role === 'admin' ? 'Super Admin' : role === 'asha' ? 'ASHA Worker A.V.' : 'Patient John Doe')
        } 
      }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'medicare-auth-storage', // saves to localstorage for offline persistence
    }
  )
);
