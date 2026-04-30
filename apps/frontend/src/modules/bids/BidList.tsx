import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { BidService } from '../../services/BidService';
import { useUserStore } from '../../core/store/userStore';

export const BidList: React.FC<{ taskId: string }> = ({ taskId }) => {
    const { activeUser } = useUserStore();

    const { data: bids, isLoading } = useQuery({
        queryKey: ['bids', taskId],
        queryFn: () => BidService.getBids(taskId),
    });

    if (isLoading)
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-20 bg-[hsl(var(--secondary))] rounded-2xl opacity-50"
                    ></div>
                ))}
            </div>
        );

    const sortedBids = [...(bids || [])].sort((a, b) => a.hoursOffered - b.hoursOffered);

    return (
        <div className="space-y-4">
            {sortedBids.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-[hsl(var(--primary))/0.1] rounded-3xl text-center opacity-30 italic font-medium">
                    No bids have been placed yet.
                </div>
            ) : (
                sortedBids.map((bid) => (
                    <div
                        key={bid.id}
                        className={`p-6 rounded-[32px] border transition-all flex items-center justify-between group relative overflow-hidden ${
                            bid.userId === activeUser?.id
                                ? 'bg-[hsl(var(--primary))/0.08] border-[hsl(var(--primary))/0.3] shadow-2xl shadow-[hsl(var(--primary))/0.1]'
                                : 'bg-[hsl(var(--secondary))] border-white/5 hover:border-white/10 shadow-lg'
                        }`}
                    >
                        <div className="flex items-center gap-5 relative z-10 min-w-[140px]">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center font-black text-sm text-white border border-white/10 shadow-inner">
                                {bid.userName.charAt(0)}
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-base text-white/90 flex items-center gap-2 tracking-tight leading-none">
                                    {bid.userName}
                                    {bid.userId === activeUser?.id && (
                                        <span className="text-[9px] bg-[hsl(var(--primary))] text-white px-2 py-0.5 rounded-lg uppercase font-black tracking-tighter">
                                            YOU
                                        </span>
                                    )}
                                </p>
                                <span
                                    className={`text-[9px] font-black uppercase tracking-[0.15em] ${
                                        bid.status === 'won'
                                            ? 'text-emerald-400'
                                            : bid.status === 'outbid'
                                              ? 'text-amber-400'
                                              : bid.status === 'invalid'
                                                ? 'text-red-400'
                                                : 'text-slate-500'
                                    }`}
                                >
                                    {bid.status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>

                        {/* Calculation Middle Section */}
                        <div className="hidden md:flex flex-col items-center justify-center px-8 border-x border-white/5 relative z-10">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
                                Proposal Math
                            </span>
                            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                <span className="text-sm font-black text-white">{Number(bid.hoursOffered).toFixed(1)}h</span>
                                <span className="text-xs font-bold text-slate-600">×</span>
                                <span className="text-sm font-black text-white">${Number(bid.hourlyRate)}/h</span>
                            </div>
                        </div>

                        <div className="text-right relative z-10 flex flex-col items-end">
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">
                                    Total Est.
                                </span>
                                <span className="text-3xl font-black text-[hsl(var(--primary))] tracking-tighter leading-none">
                                    ${(Number(bid.hoursOffered) * Number(bid.hourlyRate)).toFixed(0)}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-600 mt-2 uppercase tracking-tighter md:hidden">
                                {Number(bid.hoursOffered).toFixed(1)}h @ ${Number(bid.hourlyRate)}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
