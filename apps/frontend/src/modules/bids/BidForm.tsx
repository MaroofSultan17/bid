import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BidService } from '../../services/BidService';
import { useUserStore } from '../../core/store/userStore';
import { notifySuccess, notifyError } from '../../components/Toast';
import { UserService } from '../../services/UserService';

export const BidForm: React.FC<{ taskId: string }> = ({ taskId }) => {
    const [hours, setHours] = useState('');
    const { activeUser, setActiveUser } = useUserStore();
    const qc = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => BidService.placeBid(taskId, { hours_offered: Number(hours) }),
        onSuccess: async () => {
            notifySuccess('Bid placed successfully');
            setHours('');
            qc.invalidateQueries({ queryKey: ['bids', taskId] });
            // Refresh user workload
            if (activeUser) {
                const updatedUser = await UserService.getWorkload(activeUser.id);
                setActiveUser(updatedUser);
            }
        },
        onError: async (e: any) => {
            notifyError(e.message);
            // If capacity error, refresh user info
            if (activeUser) {
                const updatedUser = await UserService.getWorkload(activeUser.id);
                setActiveUser(updatedUser);
            }
        },
    });

    if (!activeUser) return null;

    const isOverCapacity = Number(hours) > activeUser.remainingCapacityHours;

    return (
        <div className="bg-[hsl(var(--secondary))] border border-[hsl(var(--primary))/0.1] rounded-3xl p-8 shadow-xl space-y-6">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                    Your Capacity
                </span>
                <span className="text-sm font-black text-[hsl(var(--accent))]">
                    {activeUser.remainingCapacityHours}h available
                </span>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">
                    Hours Required
                </label>
                <div className="relative">
                    <input
                        type="number"
                        className={`w-full bg-[hsl(var(--background))] border p-4 rounded-2xl focus:outline-none focus:ring-2 transition-all font-black text-2xl ${
                            isOverCapacity
                                ? 'border-red-500/50 focus:ring-red-500'
                                : 'border-[hsl(var(--primary))/0.2] focus:ring-[hsl(var(--primary))]'
                        }`}
                        placeholder="0"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black opacity-20 text-xl">
                        HOURS
                    </span>
                </div>
                {isOverCapacity && (
                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-tight">
                        Exceeds your remaining capacity!
                    </p>
                )}
            </div>

            <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !hours || isOverCapacity}
                className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))] hover:text-black text-white p-4 rounded-2xl font-black transition-all shadow-xl shadow-[hsl(var(--primary))/0.2] disabled:opacity-50 uppercase tracking-widest"
            >
                {mutation.isPending ? 'Placing Bid...' : 'Submit Bid'}
            </button>
        </div>
    );
};
