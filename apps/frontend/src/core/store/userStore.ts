import { create } from 'zustand';

interface UserStore {
    currentUserId: string | null;
    token: string | null;
    setCurrentUser: (id: string, token: string) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
    currentUserId: null,
    token: null,
    setCurrentUser: (id, token) => set({ currentUserId: id, token }),
    clearUser: () => set({ currentUserId: null, token: null }),
}));
