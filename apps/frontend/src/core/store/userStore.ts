import { create } from 'zustand';
import { UserResponse } from '../../types/dto/user.dto';

interface UserStore {
    activeUser: UserResponse | null;
    users: UserResponse[];
    setActiveUser: (user: UserResponse | null) => void;
    setUsers: (users: UserResponse[]) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    activeUser: null,
    users: [],
    setActiveUser: (user) => set({ activeUser: user }),
    setUsers: (users) => set({ users }),
}));
