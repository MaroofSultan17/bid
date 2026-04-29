import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from './task.service';
import { useUserStore } from '../../core/store/userStore';
import { notifySuccess, notifyError } from '../../components/Toast';

export const TaskCreateForm: React.FC = () => {
    const [title, setTitle] = useState('');
    const [complexity, setComplexity] = useState(1);
    const { currentUserId } = useUserStore();
    const qc = useQueryClient();

    const mut = useMutation({
        mutationFn: () =>
            new TaskService().createTask({ title, complexity, created_by: currentUserId! }),
        onSuccess: () => {
            notifySuccess('Task Created successfully');
            setTitle('');
            qc.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (e: any) => notifyError(e.message),
    });

    return (
        <div className="p-4 bg-[hsl(var(--secondary))] mb-6 mt-6 rounded-xl flex gap-4 w-full justify-between items-center">
            <div className="flex gap-4 w-full">
                <input
                    className="p-2 bg-[hsl(var(--background))] border border-[hsl(var(--primary))] flex-1 rounded"
                    placeholder="Task Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <input
                    className="p-2 bg-[hsl(var(--background))] border border-[hsl(var(--primary))] w-24 rounded text-center"
                    type="number"
                    min={1}
                    max={5}
                    value={complexity}
                    onChange={(e) => setComplexity(Number(e.target.value))}
                    title="Complexity (1-5)"
                />
            </div>
            <button
                onClick={() => mut.mutate()}
                disabled={!currentUserId || !title}
                className="bg-[hsl(var(--accent))] px-6 py-2 whitespace-nowrap disabled:opacity-50 font-bold rounded"
            >
                Create Task
            </button>
        </div>
    );
};
