import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '../../services/TaskService';
import { notifySuccess, notifyError } from '../../components/Toast';
import { useUserStore } from '../../core/store/userStore';

export const TaskCreateForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [complexity, setComplexity] = useState(1);
    const [deadline, setDeadline] = useState('');
    const { activeUser } = useUserStore();
    const qc = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => {
            if (!activeUser) throw new Error('Please select a user first');
            return TaskService.createTask({
                title,
                description: description || undefined,
                complexity,
                deadline: deadline ? new Date(deadline).toISOString() : undefined,
                created_by: activeUser.id,
            });
        },
        onSuccess: () => {
            notifySuccess('Task created successfully');
            qc.invalidateQueries({ queryKey: ['tasks'] });
            onClose();
        },
        onError: (e: any) => notifyError(e.message),
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-[hsl(var(--secondary))] border border-[hsl(var(--primary))/0.3] w-full max-w-lg rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black tracking-tight">CREATE TASK</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-500 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50">
                            Title
                        </label>
                        <input
                            className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--primary))/0.2] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all font-bold"
                            placeholder="What needs to be done?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50">
                            Description
                        </label>
                        <textarea
                            className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--primary))/0.2] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all font-medium h-32"
                            placeholder="Add more details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50">
                                Complexity (1-5)
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={5}
                                className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--primary))/0.2] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all font-bold"
                                value={complexity}
                                onChange={(e) => setComplexity(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest opacity-50">
                                Deadline
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full bg-[hsl(var(--background))] border border-[hsl(var(--primary))/0.2] p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] transition-all font-bold"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (!title || title.length < 3) {
                                notifyError('Title must be at least 3 characters');
                                return;
                            }
                            mutation.mutate();
                        }}
                        disabled={mutation.isPending || !title}
                        className="w-full bg-[hsl(var(--primary))] hover:bg-[hsl(var(--accent))] hover:text-black text-white p-4 rounded-2xl font-black transition-all shadow-xl shadow-[hsl(var(--primary))/0.2] disabled:opacity-50 mt-4 uppercase tracking-widest"
                    >
                        {mutation.isPending ? 'Creating...' : 'Launch Task'}
                    </button>
                </div>
            </div>
        </div>
    );
};
