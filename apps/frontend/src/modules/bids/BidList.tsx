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
                        className={`p-5 rounded-2xl border transition-all flex items-center justify-between group ${
                            bid.userId === activeUser?.id
                                ? 'bg-[hsl(var(--primary))/0.1] border-[hsl(var(--primary))] shadow-lg shadow-[hsl(var(--primary))/0.05]'
                                : 'bg-[hsl(var(--secondary))] border-[hsl(var(--primary))/0.05] hover:border-[hsl(var(--primary))/0.2]'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-[hsl(var(--background))] flex items-center justify-center font-black text-xs border border-[hsl(var(--primary))/0.1]">
                                {bid.userName.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-white flex items-center gap-2">
                                    {bid.userName}
                                    {bid.userId === activeUser?.id && (
                                        <span className="text-[8px] bg-[hsl(var(--primary))] px-1.5 py-0.5 rounded uppercase font-black">
                                            You
                                        </span>
                                    )}
                                </p>
                                <p
                                    className={`text-[10px] font-black uppercase tracking-widest ${
                                        bid.status === 'won'
                                            ? 'text-emerald-500'
                                            : bid.status === 'outbid'
                                              ? 'text-amber-500'
                                              : bid.status === 'invalid'
                                                ? 'text-red-500'
                                                : 'opacity-40'
                                    }`}
                                >
                                    {bid.status}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-2xl font-black text-[hsl(var(--primary))] group-hover:text-white transition-colors">
                                {Number(bid.hoursOffered).toFixed(2)}h
                            </p>
                            <p className="text-[10px] opacity-30 font-medium">
                                {new Date(bid.placedAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
