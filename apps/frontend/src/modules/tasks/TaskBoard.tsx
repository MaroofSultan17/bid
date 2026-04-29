import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TaskService } from '../../services/TaskService';
import { TaskCard } from './TaskCard';
import { TaskCreateForm } from './TaskCreateForm';
import { TaskStatus, TASK_STATUS_ORDER } from '../../types/dto/task.dto';

export const TaskBoard: React.FC = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: () => TaskService.getTasks(),
        refetchInterval: 15000,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
            </div>
        );
    }

    const tasksByStatus = (status: TaskStatus) => {
        if (!Array.isArray(tasks)) return [];
        return tasks.filter((t) => t.status === status);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-black tracking-tight">TASK BOARD</h1>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))] hover:text-black text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-[hsl(var(--primary))/0.2] flex items-center gap-2"
                >
                    <span className="text-xl">+</span> New Task
                </button>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-8 items-start snap-x scroll-smooth">
                {TASK_STATUS_ORDER.map((status) => (
                    <div key={status} className="flex flex-col gap-5 min-w-[280px] snap-start">
                        <div className="flex items-center justify-between px-3">
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))] shadow-[0_0_8px] shadow-[hsl(var(--primary))]"></div>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                    {status.replace('_', ' ')}
                                </h3>
                            </div>
                            <span className="bg-[hsl(var(--secondary))] border border-white/5 text-[hsl(var(--primary))] px-2.5 py-0.5 rounded-lg text-[10px] font-black">
                                {tasksByStatus(status).length}
                            </span>
                        </div>
                        <div className="flex flex-col gap-4 min-h-[100px] rounded-3xl bg-white/[0.02] p-2 border border-white/[0.02]">
                            {tasksByStatus(status).map((task) => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                            {tasksByStatus(status).length === 0 && (
                                <div className="h-20 flex items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-20">
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
