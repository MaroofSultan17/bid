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

    const isDeadlinePassed = (deadline: string | null) => {
        // eslint-disable-next-line react-hooks/purity
        return deadline ? new Date(deadline).getTime() < Date.now() : false;
    };

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
            notifySuccess('A new bid has been placed on this task.');
        },
        'task:assigned': (data) => {
            qc.invalidateQueries({ queryKey: ['tasks', id] });
            qc.invalidateQueries({ queryKey: ['bids', id] });
            notifySuccess(`Task successfully assigned to ${data.assignedUserName}.`);
        },
    });

    const advanceStatus = useMutation({
        mutationFn: (status: TaskStatus) => {
            if (!activeUser)
                throw new Error('Please select a user profile to perform this action.');
            return TaskService.advanceStatus(id!, { status, updatedBy: activeUser.id });
        },
        onSuccess: (_res, status) => {
            const label = status.replace('_', ' ');
            notifySuccess(`Task status successfully updated to ${label}.`);
            qc.invalidateQueries({ queryKey: ['tasks', id] });
            qc.invalidateQueries({ queryKey: ['tasks'] });
        },
        onError: (e: any) => notifyError(e.message),
    });

    const assignTask = useMutation({
        mutationFn: () => {
            if (!activeUser)
                throw new Error('Please select a user profile to perform this action.');
            return TaskService.assignTask(id!, activeUser.id);
        },
        onSuccess: () => {
            notifySuccess('Task has been intelligently assigned to the best eligible bidder.');
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
        <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-2 duration-300">
            <button
                onClick={() => navigate('/')}
                className="text-[11px] font-black text-slate-400 hover:text-[hsl(var(--primary))] transition-all flex items-center gap-3 uppercase tracking-[0.2em] group"
            >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to
                Board
            </button>

            <div className="glass rounded-[48px] p-12 shadow-2xl overflow-hidden relative border border-white/5 bg-[#0D0D1F]/50">
                {/* Background Accent */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[hsl(var(--primary))] opacity-[0.03] blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>

                <div className="absolute top-0 right-0 p-12">
                    <span className="bg-[hsl(var(--primary))] text-white px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/40 border border-white/10">
                        {task.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="max-w-2xl relative z-10">
                    <h1 className="text-5xl font-black tracking-tighter text-white mb-8">
                        {task.title}
                    </h1>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed mb-12 max-w-xl">
                        {task.description || 'No description provided.'}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 py-10 border-y border-white/5">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                Complexity
                            </span>
                            <span className="text-2xl font-black text-white tracking-tight">
                                {task.complexity}<span className="text-slate-600 text-sm ml-1">/5</span>
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                Deadline
                            </span>
                            <span className="text-2xl font-black text-white tracking-tight">
                                {task.deadline
                                    ? new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })
                                    : 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                Bids
                            </span>
                            <span className="text-2xl font-black text-white tracking-tight">{task.bidCount}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--primary))] opacity-80">
                                Fastest Delivery
                            </span>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black text-white tracking-tighter leading-none">
                                    {task.lowestBid ? `${task.lowestBid}h` : '--'}
                                </span>
                                {task.lowestBid && task.lowestBidderRate && (
                                    <span className="text-[11px] font-black text-[hsl(var(--primary))] uppercase tracking-tighter mt-1 bg-[hsl(var(--primary))/0.1] self-start px-2 py-0.5 rounded-md">
                                        ${(task.lowestBid * task.lowestBidderRate).toFixed(0)} Total
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-12 relative z-10">
                    {task.status === 'draft' && (
                        <button
                            onClick={() => advanceStatus.mutate('open')}
                            className="bg-[hsl(var(--primary))] text-white px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-white hover:text-[hsl(var(--primary))] transition-all shadow-2xl shadow-blue-500/20 active:scale-95"
                        >
                            Publish Task
                        </button>
                    )}
                    {task.status === 'open' && activeUser?.id === task.createdBy && (
                        <button
                            onClick={() => advanceStatus.mutate('bidding_closed')}
                            className="bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                        >
                            Close Bidding
                        </button>
                    )}
                    {task.status === 'bidding_closed' && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => assignTask.mutate()}
                                disabled={isDeadlinePassed(task.deadline)}
                                className="bg-[hsl(var(--accent))] text-white px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-2xl shadow-blue-900/40 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                            >
                                Assign Best Bidder
                            </button>
                            {isDeadlinePassed(task.deadline) && (
                                <span className="text-red-400 text-[10px] font-black self-center uppercase tracking-widest bg-red-400/10 px-4 py-2 rounded-xl border border-red-400/20">
                                    Deadline Passed
                                </span>
                            )}
                        </div>
                    )}
                    {task.status === 'assigned' && activeUser?.id === task.assignedTo && (
                        <button
                            onClick={() => advanceStatus.mutate('in_progress')}
                            className="bg-[hsl(var(--primary))] text-white px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-blue-500/20"
                        >
                            Start Task
                        </button>
                    )}
                    {task.status === 'in_progress' && activeUser?.id === task.assignedTo && (
                        <button
                            onClick={() => advanceStatus.mutate('review')}
                            className="bg-amber-500 text-white px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/20"
                        >
                            Submit for Review
                        </button>
                    )}
                    {task.status === 'review' && activeUser?.id === task.createdBy && (
                        <button
                            onClick={() => advanceStatus.mutate('done')}
                            className="bg-emerald-600 text-white px-10 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/20"
                        >
                            Accept & Complete Task
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10 px-4 flex items-center gap-4">
                        <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                        Participation Pool
                    </h3>
                    <BidList taskId={task.id} />
                </div>
                <div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-500 mb-10 px-4 flex items-center gap-4">
                        <span className="w-2 h-2 rounded-full bg-[hsl(var(--primary))] animate-pulse"></span>
                        Place Your Bid
                    </h3>
                    {task.status === 'open' && !isDeadlinePassed(task.deadline) ? (
                        <BidForm taskId={task.id} taskCreatorId={task.createdBy} />
                    ) : (
                        <div className="p-16 glass rounded-[40px] text-center text-slate-500 italic text-[11px] font-black uppercase tracking-[0.3em] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center">🔒</div>
                            {task.status !== 'open' ? 'Bidding Closed' : 'Deadline Passed'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
