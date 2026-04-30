import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskService } from '../../services/TaskService';
import { BidForm } from '../bids/BidForm';
import { BidList } from '../bids/BidList';
import { useSSE } from '../../core/sse/useSSE';
import { notifySuccess, notifyError } from '../../components/Toast';
import { TaskStatus } from '../../types/dto/task.dto';
import { useUserStore } from '../../core/store/userStore';

export const TaskDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { activeUser } = useUserStore();
    const qc = useQueryClient();

    const { data: task, isLoading } = useQuery({
        queryKey: ['tasks', id],
        queryFn: () => TaskService.getTask(id!),
        enabled: !!id,
    });

    const sseUrl = id ? `/api/tasks/${id}/events` : null;

    useSSE(sseUrl, {
        'bid:new': () => {
            qc.invalidateQueries({ queryKey: ['bids', id] });
            qc.invalidateQueries({ queryKey: ['tasks', id] });
            notifySuccess('New bid placed!');
        },
        'task:assigned': (data) => {
            qc.invalidateQueries({ queryKey: ['tasks', id] });
            qc.invalidateQueries({ queryKey: ['bids', id] });
            notifySuccess(`Task assigned to ${data.assignedUserName}`);
        },
    });

    const advanceStatus = useMutation({
        mutationFn: (status: TaskStatus) => {
            if (!activeUser) throw new Error('Please select a user first');
            return TaskService.advanceStatus(id!, { status, updated_by: activeUser.id });
        },
        onSuccess: () => {
            notifySuccess('Status advanced');
            qc.invalidateQueries({ queryKey: ['tasks', id] });
            qc.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (e: any) => notifyError(e.message),
    });

    const assignTask = useMutation({
        mutationFn: () => TaskService.assignTask(id!),
        onSuccess: () => {
            notifySuccess('Task assigned intelligently');
            qc.invalidateQueries({ queryKey: ['tasks', id] });
        },
        onError: (e: any) => notifyError(e.message),
    });

    if (isLoading || !task)
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-300">
            <button
                onClick={() => navigate('/')}
                className="text-xs font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity flex items-center gap-2"
            >
                ← Back to Board
            </button>

            <div className="bg-[hsl(var(--secondary))] border border-[hsl(var(--primary))/0.1] rounded-3xl p-8 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8">
                    <span className="bg-[hsl(var(--primary))] text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                        {task.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="max-w-2xl">
                    <h1 className="text-4xl font-black tracking-tight text-white mb-4 uppercase">
                        {task.title}
                    </h1>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
                        {task.description || 'No description provided.'}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-[hsl(var(--primary))/0.05]">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                Complexity
                            </span>
                            <span className="text-xl font-bold text-white">
                                {task.complexity}/5
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                Deadline
                            </span>
                            <span className="text-xl font-bold text-white">
                                {task.deadline
                                    ? new Date(task.deadline).toLocaleDateString()
                                    : 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                Bids
                            </span>
                            <span className="text-xl font-bold text-white">{task.bidCount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                Lowest
                            </span>
                            <span className="text-xl font-black text-[hsl(var(--accent))]">
                                {task.lowestBid ? `${task.lowestBid}h` : '--'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                    {task.status === 'draft' && (
                        <button
                            onClick={() => advanceStatus.mutate('open')}
                            className="bg-[hsl(var(--primary))] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[hsl(var(--primary))/0.2]"
                        >
                            Publish Task
                        </button>
                    )}
                    {task.status === 'open' && (
                        <button
                            onClick={() => advanceStatus.mutate('bidding_closed')}
                            className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            Close Bidding
                        </button>
                    )}
                    {task.status === 'bidding_closed' && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => assignTask.mutate()}
                                className="bg-[hsl(var(--accent))] text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[hsl(var(--accent))/0.2]"
                            >
                                Assign Best Bidder
                            </button>
                            <button
                                onClick={() => advanceStatus.mutate('open')}
                                className="bg-transparent text-white border border-white/20 hover:bg-white/5 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                Re-Open Bidding
                            </button>
                        </div>
                    )}
                    {task.status === 'assigned' && (
                        <button
                            onClick={() => advanceStatus.mutate('in_progress')}
                            className="bg-[hsl(var(--primary))] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[hsl(var(--primary))/0.2]"
                        >
                            Start Task
                        </button>
                    )}
                    {task.status === 'in_progress' && (
                        <button
                            onClick={() => advanceStatus.mutate('review')}
                            className="bg-amber-500 text-black px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-amber-500/20"
                        >
                            Submit for Review
                        </button>
                    )}
                    {task.status === 'review' && (
                        <button
                            onClick={() => advanceStatus.mutate('done')}
                            className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20"
                        >
                            Complete Task
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">
                        Participation Pool
                    </h3>
                    <BidList taskId={task.id} />
                </div>
                <div>
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-6">
                        Place Your Bid
                    </h3>
                    {task.status === 'open' ? (
                        <BidForm taskId={task.id} taskCreatorId={task.createdBy} />
                    ) : (
                        <div className="p-8 bg-[hsl(var(--secondary))] border border-[hsl(var(--primary))/0.1] rounded-3xl text-center opacity-50 italic text-sm">
                            Bidding is currently closed for this task.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
