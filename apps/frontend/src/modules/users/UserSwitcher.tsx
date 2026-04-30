import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserService } from '../../services/UserService';
import { useUserStore } from '../../core/store/userStore';

export const UserSwitcher: React.FC = () => {
    const { activeUser, setActiveUser, setUsers, users } = useUserStore();

    const { isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const data = await UserService.getUsers();
            if (!Array.isArray(data)) return [];

            setUsers(data);

            const currentActive = useUserStore.getState().activeUser;
            if (currentActive) {
                const updated = data.find((u) => u.id === currentActive.id);
                if (updated) setActiveUser(updated);
            } else if (data.length > 0) {
                setActiveUser(data[0]);
            }

            return data;
        },
    });

    if (isLoading)
        return (
            <div className="animate-pulse w-32 h-10 bg-[hsl(var(--secondary))] rounded-lg"></div>
        );

    return (
        <div className="flex items-center gap-5 glass-card p-2 pr-2 pl-6 rounded-2xl">
            <div className="text-right hidden sm:block leading-none">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">
                    Simulated As
                </p>
                {activeUser && (
                    <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">
                        <span className="text-[hsl(var(--primary))]">{activeUser.currentWorkloadHours}</span>
                        <span className="opacity-30 mx-1">/</span>
                        {activeUser.maxCapacityHours}h
                    </p>
                )}
            </div>
            <select
                className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/50 focus:border-[hsl(var(--primary))] transition-all cursor-pointer outline-none shadow-inner"
                value={activeUser?.id || ''}
                onChange={(e) => {
                    const u = users.find((u) => u.id === e.target.value);
                    if (u) setActiveUser(u);
                }}
            >
                <option value="" disabled className="bg-[#0B0B1E] text-slate-400">
                    Switch User
                </option>
                {Array.isArray(users) &&
                    users.map((u) => (
                        <option key={u.id} value={u.id} className="bg-[#0B0B1E] text-white">
                            {u.name}
                        </option>
                    ))}
            </select>
        </div>
    );
};
