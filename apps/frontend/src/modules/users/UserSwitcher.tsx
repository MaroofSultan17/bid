import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserService } from './user.service';
import { useUserStore } from '../../core/store/userStore';
import { useJwt } from '../../contexts/JwtContext';

export const UserSwitcher: React.FC = () => {
    const { currentUserId, setCurrentUser } = useUserStore();
    const { token: jwtToken } = useJwt();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

    const { data: users } = useQuery({
        queryKey: ['users', jwtToken],
        queryFn: () => new UserService(baseUrl, jwtToken || '').getUsers(),
    });

    return (
        <div className="p-4 bg-[hsl(var(--secondary))] rounded-xl mb-6 flex gap-4 items-center border border-[hsl(var(--primary))]">
            <label className="font-bold text-[hsl(var(--primary))] uppercase text-xs">
                Simulated Identity:
            </label>
            <select
                className="bg-[hsl(var(--background))] border border-[hsl(var(--primary))] p-2 rounded text-sm text-white focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]"
                value={currentUserId || ''}
                onChange={(e) => {
                    const u = users?.users.find((u: any) => u.id === e.target.value);
                    if (u) setCurrentUser(u.id, jwtToken || '');
                }}
            >
                <option value="">-- Choose User --</option>
                {users?.users?.map((u: any) => (
                    <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                    </option>
                ))}
            </select>
        </div>
    );
};
