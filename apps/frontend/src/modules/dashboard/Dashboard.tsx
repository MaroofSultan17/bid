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

    const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#3b82f6', '#1e293b'];

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="justify-between items-end hidden md:flex">
                <h1 className="text-4xl font-black tracking-tighter text-white">Platform Dashboard</h1>

                {queueStats && (
                    <div className="flex gap-4">
                        <div className="glass px-6 py-3 rounded-2xl flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Queue</span>
                                <span className="text-sm font-black text-white">Notifications</span>
                            </div>
                            <div className="flex items-center gap-6 border-l border-white/10 pl-6">
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Wait</span>
                                    <span className={`text-sm font-black ${queueStats.stats.waiting > 0 ? 'text-amber-500' : 'text-slate-300'}`}>{queueStats.stats.waiting}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Active</span>
                                    <span className={`text-sm font-black ${queueStats.stats.active > 0 ? 'text-[hsl(var(--primary))]' : 'text-slate-300'}`}>{queueStats.stats.active}</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Fail</span>
                                    <span className={`text-sm font-black ${queueStats.stats.failed > 0 ? 'text-red-400' : 'text-slate-300'}`}>{queueStats.stats.failed}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass rounded-[32px] p-8">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-2">
                        Tasks Distribution
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statusData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                                        background: 'rgba(11, 11, 30, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        color: '#fff',
                                        fontWeight: 800
                                    }} 
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={32}>
                                    {statusData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass rounded-[32px] p-8">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-2">
                        Avg Bid Hours vs Complexity
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={complexityData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} 
                                />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: '1px solid rgba(255,255,255,0.1)', 
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                                        background: 'rgba(11, 11, 30, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        color: '#fff',
                                        fontWeight: 800
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 4, 4]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass rounded-[32px] p-8">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 px-2">
                        Top Contributors
                    </h3>
                    <div className="space-y-6">
                        {data.topUsers.map((user, idx) => (
                            <div key={user.userId} className="flex items-center gap-6">
                                <span className="text-xl font-black text-white/10 w-6">{idx + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-black text-white">{user.userName}</span>
                                        <span className="text-[10px] font-black text-[hsl(var(--primary))] uppercase tracking-widest">{user.tasksCompleted} Tasks</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[hsl(var(--primary))] rounded-full shadow-[0_0_10px_rgba(62,62,244,0.5)]" 
                                            style={{ width: `${Math.max(10, (user.tasksCompleted / Math.max(...data.topUsers.map((u) => u.tasksCompleted))) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass rounded-[32px] p-8">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-red-400 mb-8 px-2 flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></span>
                        Critical
                    </h3>
                    <div className="space-y-4">
                        {data.expiredTasksNoBids.length === 0 ? (
                            <div className="text-center py-12 text-[10px] font-black uppercase tracking-widest text-slate-600">
                                No Critical Tasks
                            </div>
                        ) : (
                            data.expiredTasksNoBids.map(task => (
                                <div key={task.id} className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex flex-col gap-2">
                                    <span className="font-black text-white line-clamp-1">{task.title}</span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-red-400">
                                        Expired {new Date(task.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
