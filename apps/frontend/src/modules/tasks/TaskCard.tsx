import React from 'react';
import { TaskResponse } from '../../types/dto/task.dto';
import { useNavigate } from 'react-router-dom';

export const TaskCard: React.FC<{ task: TaskResponse }> = ({ task }) => {
    const navigate = useNavigate();

    const getComplexityColor = (c: number) => {
        if (c <= 2) return 'bg-emerald-500';
        if (c <= 3) return 'bg-amber-500';
        return 'bg-red-500';
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'No deadline';
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <div
            onClick={() => navigate(`/tasks/${task.id}`)}
            className="group p-5 glass-card rounded-[24px] hover:border-[hsl(var(--primary))/0.4] hover:-translate-y-1.5 flex flex-col gap-5 relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-5">
                <div
                    className={`h-2 w-2 rounded-full shadow-[0_0_10px_currentColor] ${getComplexityColor(task.complexity)}`}
                ></div>
            </div>

            <div>
                <h4 className="text-[17px] font-black text-white/90 line-clamp-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                    {task.title}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        Due {formatDate(task.deadline)}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-1">
                <div className="flex items-center gap-2.5">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                        Pool
                    </span>
                    <span className="text-xs font-black text-slate-400">{task.bidCount}</span>
                </div>
                {task.lowestBid !== null && (
                    <div className="flex items-center gap-2.5 bg-[hsl(var(--primary))/0.1] px-3 py-1.5 rounded-xl border border-white/5">
                        <span className="text-[9px] font-black text-[hsl(var(--primary))/0.7] uppercase tracking-widest">
                            Best
                        </span>
                        <span className="text-sm font-black text-[hsl(var(--primary))]">
                            {task.lowestBid}h
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
