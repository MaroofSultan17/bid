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
            className="group p-5 bg-gradient-to-br from-[hsl(var(--secondary))] to-[hsl(var(--secondary))/0.5] border border-white/5 rounded-3xl hover:border-[hsl(var(--primary))/0.5] transition-all cursor-pointer shadow-xl hover:shadow-[hsl(var(--primary))/0.1] flex flex-col gap-4 relative overflow-hidden backdrop-blur-md"
        >
            <div className="absolute top-0 right-0 p-3">
                <div
                    className={`h-2 w-2 rounded-full ${getComplexityColor(task.complexity)} shadow-[0_0_8px] shadow-current`}
                ></div>
            </div>

            <div>
                <h4 className="text-sm font-black text-white line-clamp-2 group-hover:text-[hsl(var(--primary))] transition-colors">
                    {task.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">
                    {formatDate(task.deadline)}
                </p>
            </div>

            <div className="flex items-center justify-between border-t border-[hsl(var(--primary))/0.05] pt-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                        Bids
                    </span>
                    <span className="text-sm font-bold text-white">{task.bidCount}</span>
                </div>
                {task.lowestBid !== null && (
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                            Low
                        </span>
                        <span className="text-sm font-black text-[hsl(var(--accent))]">
                            {task.lowestBid}h
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
