import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { TaskService } from '../../services/TaskService';
import { TaskCard } from './TaskCard';
import { useJwt } from '../../contexts/JwtContext';
import { useEnv } from '../../contexts/EnvContext';

export const TaskBoard: React.FC = () => {
    const { token } = useJwt();
    const env = useEnv();
    const baseUrl = env.VITE_API_BASE_URL || '/api';

    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks', token],
        queryFn: () => new TaskService(baseUrl, token!).getTasks(),
        enabled: !!token,
    });

    if (isLoading) return <div className="mt-8 text-center text-slate-400">Loading tasks...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {tasks?.map((t) => (
                <TaskCard key={t.id} task={t} />
            ))}
        </div>
    );
};
