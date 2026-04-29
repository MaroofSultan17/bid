import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BidService } from './bid.service';
import { useJwt } from '../../contexts/JwtContext';

export const BidList: React.FC<{ taskId: string }> = ({ taskId }) => {
    const { token } = useJwt();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

    const { data: bids } = useQuery({
        queryKey: ['bids', taskId, token],
        queryFn: () => new BidService(baseUrl, token!).getBidsForTask(taskId),
        enabled: !!taskId && !!token,
    });

    return (
        <div className="flex flex-col gap-3 mt-6">
            {bids?.map((b) => (
                <div
                    key={b.id}
                    className="p-4 bg-[hsl(var(--background))] border border-[hsl(var(--primary))] rounded-xl flex justify-between items-center group hover:border-[hsl(var(--accent))] transition-all"
                >
                    <div>
                        <p className="text-sm font-bold text-white group-hover:text-[hsl(var(--accent))] transition-colors">
                            {b.userName}
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-widest">
                            {b.status}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-black text-[hsl(var(--primary))]">
                            {b.hoursOffered}h
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
