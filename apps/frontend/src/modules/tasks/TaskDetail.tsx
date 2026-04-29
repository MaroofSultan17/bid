import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '../../services/TaskService';
import { BidForm } from '../bids/BidForm';
import { BidList } from '../bids/BidList';
import { useUserStore } from '../../core/store/userStore';
import { useJwt } from '../../contexts/JwtContext';
import { useEnv } from '../../contexts/EnvContext';
import { notifySuccess, notifyError } from '../../components/Toast';

export const TaskDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUserId } = useUserStore();
    const { token } = useJwt();
    const env = useEnv();
    const baseUrl = env.VITE_API_BASE_URL || '/api';
    const qc = useQueryClient();

    const { data: task, isLoading } = useQuery({
        queryKey: ['task', id, token],
        queryFn: () => new TaskService(baseUrl, token!).getTask(id!),
        enabled: !!id && !!token,
    });

    const advanceStat = useMutation({
        mutationFn: (s: string) =>
            new TaskService(baseUrl, token!).advanceStatus(id!, {
                status: s,
                updated_by: currentUserId!,
            }),
        onSuccess: () => {
            notifySuccess('Status progressed');
            qc.invalidateQueries({ queryKey: ['task', id] });
        },
        onError: (e: any) => notifyError(e.message),
    });

    const assignTask = useMutation({
        mutationFn: () => new TaskService(baseUrl, token!).assignTask(id!),
        onSuccess: () => {
            notifySuccess('Task intelligently assigned');
            qc.invalidateQueries({ queryKey: ['task', id] });
        },
        onError: (e: any) => notifyError(e.message),
    });

    if (isLoading || !task)
        return <div className="p-10 text-center text-slate-400">Fetching task details...</div>;

    return (
        <div className="max-w-3xl mx-auto p-8 bg-[hsl(var(--secondary))] border border-[hsl(var(--primary))] rounded-2xl shadow-2xl mt-8">
            <button
                onClick={() => navigate('/')}
                className="mb-6 text-xs bg-slate-800 hover:bg-slate-700 transition-colors px-4 py-2 rounded-lg text-slate-300"
            >
                ← Back to Board
            </button>
            <h2 className="text-3xl font-bold text-white mb-2">{task.title}</h2>
            <p className="mb-8 text-sm text-slate-400 font-mono tracking-tight uppercase">
                Complexity: {task.complexity} | State:{' '}
                <span className="text-[hsl(var(--accent))]">{task.status}</span>
            </p>

            <div className="flex gap-4 mb-8 border-b border-[hsl(var(--primary))] pb-8">
                {task.status === 'open' && (
                    <button
                        onClick={() => advanceStat.mutate('bidding_closed')}
                        className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all px-6 py-2 rounded-xl font-bold text-sm"
                    >
                        Close Bidding
                    </button>
                )}
                {task.status === 'bidding_closed' && (
                    <button
                        onClick={() => assignTask.mutate()}
                        className="bg-[hsl(var(--accent))] hover:scale-105 transition-all px-6 py-2 rounded-xl font-bold text-sm text-black"
                    >
                        Assign Best Bid
                    </button>
                )}
                {task.status === 'assigned' && (
                    <button
                        onClick={() => advanceStat.mutate('in_progress')}
                        className="bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 transition-all px-6 py-2 rounded-xl font-bold text-sm"
                    >
                        Start Verification
                    </button>
                )}
            </div>

            <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-widest text-xs opacity-50">
                    Participation Pool
                </h3>
                {task.status === 'open' && <BidForm taskId={task.id} />}
                <BidList taskId={task.id} />
            </div>
        </div>
    );
};
