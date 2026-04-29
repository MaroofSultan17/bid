import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BidService } from './bid.service';
import { useUserStore } from '../../core/store/userStore';
import { useJwt } from '../../contexts/JwtContext';
import { notifySuccess, notifyError } from '../../components/Toast';

export const BidForm: React.FC<{ taskId: string }> = ({ taskId }) => {
    const [hours, setHours] = useState('');
    const { currentUserId } = useUserStore();
    const { token } = useJwt();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    const qc = useQueryClient();

    const mut = useMutation({
        mutationFn: () =>
            new BidService(baseUrl, token!).createBid(taskId, {
                user_id: currentUserId!,
                hours_offered: Number(hours),
            }),
        onSuccess: () => {
            notifySuccess('Participation recorded');
            setHours('');
            qc.invalidateQueries({ queryKey: ['bids', taskId] });
        },
        onError: (e: any) => notifyError(e.message),
    });

    if (!currentUserId || !token)
        return <p className="text-red-400 text-xs italic">Authentication required to bid.</p>;

    return (
        <div className="flex gap-3 mt-6 bg-[hsl(var(--background))] p-4 rounded-xl border border-[hsl(var(--primary))]">
            <input
                type="number"
                placeholder="Hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="bg-[hsl(var(--background))] border border-[hsl(var(--primary))] p-2 rounded-lg text-white w-24 text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--accent))]"
            />
            <button
                onClick={() => mut.mutate()}
                disabled={mut.isPending || !hours}
                className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))] hover:text-black transition-all px-4 py-2 rounded-lg font-bold text-sm flex-1 disabled:opacity-50"
            >
                Submit Bid
            </button>
        </div>
    );
};
