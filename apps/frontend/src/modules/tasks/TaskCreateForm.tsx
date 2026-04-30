import React, { useState } from 'react';
import ReactDOM from 'react-dom';
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

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div
                className="glass w-full max-w-xl rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-300 border border-white/10 relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--primary))] opacity-[0.03] blur-3xl rounded-full -mr-20 -mt-20"></div>
                
                <div className="flex justify-between items-center mb-10 relative z-10">
                    <h2 className="text-2xl font-black tracking-tighter text-white">Create New Task</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Title
                        </label>
                        <input
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/50 focus:border-[hsl(var(--primary))] transition-all font-bold text-white text-base placeholder:text-slate-600"
                            placeholder="What needs to be done?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            Description
                        </label>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/50 focus:border-[hsl(var(--primary))] transition-all font-bold h-32 text-white text-base placeholder:text-slate-600 resize-none custom-scrollbar"
                            placeholder="Add more details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Complexity (1-5)
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={5}
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/50 focus:border-[hsl(var(--primary))] transition-all font-bold text-white text-base"
                                value={complexity}
                                onChange={(e) => setComplexity(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                Deadline
                            </label>
                            <input
                                type="date"
                                className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/50 focus:border-[hsl(var(--primary))] transition-all font-bold text-white text-base [color-scheme:dark] appearance-none"
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
                        className="w-full bg-[hsl(var(--primary))] hover:bg-white hover:text-[hsl(var(--primary))] text-white p-4 rounded-2xl font-black transition-all shadow-2xl shadow-[hsl(var(--primary))]/20 disabled:opacity-50 mt-8 text-sm uppercase tracking-[0.2em]"
                    >
                        {mutation.isPending ? 'Creating...' : 'Create Task'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};
