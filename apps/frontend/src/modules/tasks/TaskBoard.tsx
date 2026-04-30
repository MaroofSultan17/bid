import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '../../services/TaskService';
import { TaskCard } from './TaskCard';
import { useSSE } from '../../core/sse/useSSE';
import { TaskCreateForm } from './TaskCreateForm';
import { TaskStatus, TASK_STATUS_ORDER } from '../../types/dto/task.dto';

export const TaskBoard: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const qc = useQueryClient();

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => TaskService.getTasks(),
    });

    useSSE('/api/events', {
        'dashboard:update': () => {
            qc.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
            </div>
        );
    }

    if (!tasks) return null;

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black tracking-tighter text-white">Task Board</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[hsl(var(--primary))] hover:bg-white hover:text-[hsl(var(--primary))] text-white px-8 py-3 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-3 group active:scale-95"
                >
                    <span className="text-xl group-hover:rotate-90 transition-transform duration-300">
                        +
                    </span>{' '}
                    New Task
                </button>
            </div>

            <div className="grid grid-flow-col auto-cols-[calc((100%-4rem)/3)] gap-8 overflow-x-auto pb-10 items-start snap-x snap-mandatory">
                {TASK_STATUS_ORDER.map((status) => (
                    <div key={status} className="flex flex-col gap-6 w-full snap-start">
                        <div className="flex items-center justify-between px-5">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_15px_rgba(62,62,244,0.8)]"></div>
                                <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                    {status.replace('_', ' ')}
                                </h3>
                            </div>
                            <span className="bg-white/[0.05] px-3 py-1 rounded-xl text-[10px] font-black text-slate-500 border border-white/[0.05]">
                                {tasks[status]?.count || 0}
                            </span>
                        </div>
                        <div className="flex flex-col gap-5 h-[calc(100vh-340px)] overflow-y-auto rounded-[40px] glass p-4 border border-white/[0.05] custom-scrollbar">
                            {tasks[status]?.tasks.map((task) => (
                                <div key={task.id} className="flex-shrink-0">
                                    <TaskCard task={task} />
                                </div>
                            ))}
                            {(tasks[status]?.count || 0) === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/[0.03] rounded-[32px] py-20">
                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-[0.3em]">
                                        Empty
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isCreateModalOpen && <TaskCreateForm onClose={() => setIsCreateModalOpen(false)} />}
        </div>
    );
};
