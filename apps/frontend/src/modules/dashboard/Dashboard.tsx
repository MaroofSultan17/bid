import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardService } from '../../services/DashboardService';
import { useSSE } from '../../core/sse/useSSE';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

export const Dashboard: React.FC = () => {
    const qc = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard'],
        queryFn: () => DashboardService.getStats(),
    });

    useSSE('/api/events', {
        'dashboard:update': () => {
            qc.invalidateQueries({ queryKey: ['dashboard'] });
        },
        'queue:update': () => {
            qc.invalidateQueries({ queryKey: ['admin', 'queues'] });
        },
    });

    const { data: queueStats } = useQuery({
        queryKey: ['admin', 'queues'],
        queryFn: async () => {
            const res = await fetch('/api/admin/queues');
            return res.json();
        },
    });

    if (isLoading)
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
            </div>
        );

    if (!data) return null;

    const statusData = Object.entries(data.tasksByStatus).map(([name, value]) => ({ name, value }));
    const complexityData = data.avgBidByComplexity.map((item) => ({
        name: `Lvl ${item.complexity}`,
        hours: Number(item.avgHours).toFixed(1),
    }));

    const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <h1 className="text-4xl font-black tracking-tight">PLATFORM DASHBOARD</h1>

                {queueStats && (
                    <div className="flex gap-4 bg-[hsl(var(--secondary))] border border-[hsl(var(--primary))/0.1] px-4 py-2 rounded-2xl shadow-sm">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase opacity-40">
                                Queue
                            </span>
                            <span className="text-[10px] font-bold text-white uppercase tracking-tighter">
                                Notifications
                            </span>
                        </div>
                        <div className="w-px h-6 bg-white/5 self-center"></div>
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black uppercase opacity-40">
                                    Wait
                                </span>
                                <span
                                    className={`text-xs font-black ${queueStats.stats.waiting > 0 ? 'text-amber-500' : 'text-white'}`}
                                >
                                    {queueStats.stats.waiting}
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black uppercase opacity-40">
                                    Active
                                </span>
                                <span
                                    className={`text-xs font-black ${queueStats.stats.active > 0 ? 'text-[hsl(var(--primary))]' : 'text-white'}`}
                                >
                                    {queueStats.stats.active}
                                </span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black uppercase opacity-40">
                                    Fail
                                </span>
                                <span
                                    className={`text-xs font-black ${queueStats.stats.failed > 0 ? 'text-red-500' : 'text-white'}`}
                                >
                                    {queueStats.stats.failed}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[hsl(var(--secondary))] border border-[hsl(var(--primary))/0.1] rounded-3xl p-8 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-8">
                        Tasks Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="hsl(var(--primary))/0.1"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    stroke="hsl(var(--foreground))/0.5"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="hsl(var(--foreground))/0.5"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'hsl(var(--secondary))',
                                        border: '1px solid hsl(var(--primary))/0.2',
                                        borderRadius: '12px',
                                    }}
                                    cursor={{ fill: 'hsl(var(--primary))/0.05' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {statusData.map((_entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[hsl(var(--secondary))] border border-[hsl(var(--primary))/0.1] rounded-3xl p-8 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-8">
                        Avg Bid Hours vs Complexity
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={complexityData}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="hsl(var(--primary))/0.1"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="name"
                                    stroke="hsl(var(--foreground))/0.5"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="hsl(var(--foreground))/0.5"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'hsl(var(--secondary))',
                                        border: '1px solid hsl(var(--primary))/0.2',
                                        borderRadius: '12px',
                                    }}
                                    cursor={{ fill: 'hsl(var(--primary))/0.05' }}
                                />
                                <Bar
                                    dataKey="hours"
                                    fill="hsl(var(--accent))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[hsl(var(--secondary))] border border-[hsl(var(--primary))/0.1] rounded-3xl p-8 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-8">
                        Top 3 Contributors
                    </h3>
                    <div className="space-y-6">
                        {data.topUsers.map((user, idx) => (
                            <div key={user.userId} className="flex items-center gap-6">
                                <span className="text-3xl font-black opacity-10">{idx + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-2">
                                        <p className="font-bold text-white">{user.userName}</p>
                                        <p className="text-sm font-black text-[hsl(var(--primary))]">
                                            {user.tasksCompleted} Tasks
                                        </p>
                                    </div>
                                    <div className="w-full bg-[hsl(var(--background))] h-2 rounded-full overflow-hidden">
                                        <div
                                            className="bg-[hsl(var(--primary))] h-full rounded-full transition-all duration-1000"
                                            style={{
                                                width: `${(user.tasksCompleted / Math.max(...data.topUsers.map((u) => u.tasksCompleted))) * 100}%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {data.topUsers.length === 0 && (
                            <p className="text-center opacity-30 italic">No tasks completed yet.</p>
                        )}
                    </div>
                </div>

                <div className="bg-[hsl(var(--secondary))] border border-[hsl(var(--primary))/0.1] rounded-3xl p-8 shadow-xl">
                    <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-8 text-red-500">
                        Critical: Past Deadline (No Bids)
                    </h3>
                    <div className="space-y-4">
                        {data.expiredTasksNoBids.map((task) => (
                            <div
                                key={task.id}
                                className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl"
                            >
                                <p className="font-bold text-sm text-white mb-1">{task.title}</p>
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-tighter">
                                    Expired: {new Date(task.deadline).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                        {data.expiredTasksNoBids.length === 0 && (
                            <p className="text-center opacity-30 italic text-sm">
                                No critical expired tasks.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
