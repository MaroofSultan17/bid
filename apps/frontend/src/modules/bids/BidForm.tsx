import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BidService } from '../../services/BidService';
import { useUserStore } from '../../core/store/userStore';
import { notifySuccess, notifyError } from '../../components/Toast';
import { UserService } from '../../services/UserService';

export const BidForm: React.FC<{ taskId: string; taskCreatorId: string }> = ({
    taskId,
    taskCreatorId,
}) => {
    const [hours, setHours] = useState('');
    const { activeUser, setActiveUser } = useUserStore();
    const qc = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => {
            if (!activeUser) throw new Error('Please select a user profile to place a bid.');
            if (activeUser.id === taskCreatorId)
                throw new Error('Action denied: Task creators cannot bid on their own tasks.');
            return BidService.placeBid(taskId, {
                hours_offered: Number(hours),
                user_id: activeUser.id,
            });
        },
        onSuccess: async () => {
            notifySuccess('Your bid has been successfully submitted.');
            setHours('');
            qc.invalidateQueries({ queryKey: ['bids', taskId] });
            if (activeUser) {
                const updatedUser = await UserService.getWorkload(activeUser.id);
                setActiveUser(updatedUser);
            }
        },
        onError: async (e: any) => {
            const message = e.message.includes('ERR_SELF_BID')
                ? 'Action denied: Task creators cannot bid on their own tasks.'
                : e.message;
            notifyError(message);
            if (activeUser) {
                const updatedUser = await UserService.getWorkload(activeUser.id);
                setActiveUser(updatedUser);
            }
        },
    });

    if (!activeUser || activeUser.id === taskCreatorId) {
        if (activeUser?.id === taskCreatorId) {
            return (
                <div className="p-8 glass rounded-3xl text-center italic text-sm text-slate-400">
                    You are the creator of this task.
                </div>
            );
        }
        return null;
    }

    const isOverCapacity = Number(hours) > activeUser.remainingCapacityHours;

    return (
        <div className="bg-[hsl(var(--accent))] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(var(--primary))] opacity-5 blur-3xl -mr-16 -mt-16"></div>
            
            <div className="flex justify-between items-center relative z-10">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Your Capacity
                </span>
                <span className="text-sm font-black text-white">
                    {activeUser.remainingCapacityHours}h available
                </span>
            </div>

            <div className="space-y-3 relative z-10">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Hours Required
                </label>
                <div className="relative">
                    <input
                        type="number"
                        min={1}
                        className={`w-full bg-white/10 border p-4 rounded-2xl focus:outline-none focus:ring-2 transition-all font-black text-2xl text-white backdrop-blur-sm ${
                            isOverCapacity || Number(hours) < 0
                                ? 'border-red-500/50 focus:ring-red-500'
                                : 'border-white/10 focus:ring-[hsl(var(--primary))]'
                        }`}
                        placeholder="0"
                        value={hours}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (Number(val) < 0) return;
                            setHours(val);
                        }}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-white/10 text-xl pointer-events-none">
                        HOURS
                    </span>
                </div>
                {isOverCapacity && (
                    <p className="text-red-400 text-[10px] font-bold uppercase tracking-tight">
                        Exceeds your remaining capacity!
                    </p>
                )}
            </div>

            <button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !hours || isOverCapacity}
                className="w-full bg-[hsl(var(--primary))] hover:bg-white hover:text-[hsl(var(--primary))] text-white p-4 rounded-2xl font-black transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 uppercase tracking-widest relative z-10"
            >
                {mutation.isPending ? 'Placing Bid...' : 'Submit Bid'}
            </button>
        </div>
    );
};
