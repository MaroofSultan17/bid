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
            return TaskService.advanceStatus(id!, { status, updated_by: activeUser.id });
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

            <div className="glass rounded-[40px] p-10 shadow-2xl overflow-hidden relative border border-white/60">
                <div className="absolute top-0 right-0 p-10">
                    <span className="bg-[hsl(var(--primary))] text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">
                        {task.status.replace('_', ' ')}
                    </span>
                </div>

                <div className="max-w-2xl relative z-10">
                    <h1 className="text-4xl font-black tracking-tight text-[hsl(var(--foreground))] mb-6">
                        {task.title}
                    </h1>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
                        {task.description || 'No description provided.'}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-8 border-y border-slate-100/50">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                Complexity
                            </span>
                            <span className="text-xl font-black text-[hsl(var(--primary))]">
                                {task.complexity}/5
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                Deadline
                            </span>
                            <span className="text-xl font-black text-[hsl(var(--primary))]">
                                {task.deadline
                                    ? new Date(task.deadline).toLocaleDateString()
                                    : 'N/A'}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                Bids
                            </span>
                            <span className="text-xl font-black text-[hsl(var(--primary))]">
                                {task.bidCount}
                            </span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                Best Rate
                            </span>
                            <span className="text-xl font-black text-[hsl(var(--primary))]">
                                {task.lowestBid ? `${task.lowestBid}h` : '--'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-10 relative z-10">
                    {task.status === 'draft' && (
                        <button
                            onClick={() => advanceStatus.mutate('open')}
                            className="bg-[hsl(var(--primary))] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[hsl(var(--secondary))] transition-all shadow-xl shadow-blue-500/20"
                        >
                            Publish Task
                        </button>
                    )}
                    {task.status === 'open' && activeUser?.id === task.createdBy && (
                        <button
                            onClick={() => advanceStatus.mutate('bidding_closed')}
                            className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                        >
                            Close Bidding
                        </button>
                    )}
                    {task.status === 'bidding_closed' && (
                        <div className="flex gap-4">
                            <button
                                onClick={() => assignTask.mutate()}
                                disabled={isDeadlinePassed(task.deadline)}
                                className="bg-[hsl(var(--accent))] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Assign Best Bidder
                            </button>
                            {isDeadlinePassed(task.deadline) && (
                                <span className="text-red-400 text-xs font-bold self-center uppercase tracking-widest">
                                    Deadline Passed
                                </span>
                            )}
                        </div>
                    )}
                    {task.status === 'assigned' && activeUser?.id === task.assignedTo && (
                        <button
                            onClick={() => advanceStatus.mutate('in_progress')}
                            className="bg-[hsl(var(--primary))] text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[hsl(var(--secondary))] transition-all shadow-xl shadow-blue-500/20"
                        >
                            Start Task
                        </button>
                    )}
                    {task.status === 'in_progress' && activeUser?.id === task.assignedTo && (
                        <button
                            onClick={() => advanceStatus.mutate('review')}
                            className="bg-amber-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl shadow-amber-500/20"
                        >
                            Submit for Review
                        </button>
                    )}
                    {task.status === 'review' && activeUser?.id === task.createdBy && (
                        <button
                            onClick={() => advanceStatus.mutate('done')}
                            className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
                        >
                            Accept & Complete Task
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-2 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                        Participation Pool
                    </h3>
                    <BidList taskId={task.id} />
                </div>
                <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-2 flex items-center gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] animate-pulse"></span>
                        Place Your Bid
                    </h3>
                    {task.status === 'open' && !isDeadlinePassed(task.deadline) ? (
                        <BidForm taskId={task.id} taskCreatorId={task.createdBy} />
                    ) : (
                        <div className="p-12 glass rounded-[32px] text-center text-slate-300 italic text-xs uppercase tracking-[0.2em] border-2 border-dashed border-white/40">
                            {task.status !== 'open' ? 'Bidding Closed' : 'Deadline Passed'}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
