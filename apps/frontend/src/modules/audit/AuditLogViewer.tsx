import React, { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { AuditLogService } from '../../services/AuditLogService';

export const AuditLogViewer: React.FC = () => {
    const [page, setPage] = useState(1);
    const limit = 20;

    const { data: paginatedData, isLoading } = useQuery({
        queryKey: ['audit-logs', page],
        queryFn: () => AuditLogService.getLogs(page, limit),
        placeholderData: keepPreviousData,
    });

    if (isLoading && !paginatedData)
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
            </div>
        );

    const logs = paginatedData?.data || [];
    const meta = paginatedData?.meta;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white">
                        System Audit
                    </h1>
                    <p className="text-slate-500 text-sm font-medium mt-2">
                        Real-time tracking of task transitions and bidding activities.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    {meta && (
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Total: {meta.total} records
                        </span>
                    )}
                </div>
            </div>

            <div className="glass rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Time
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Entity
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Action
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Change
                                </th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    Performer
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {logs.map((log) => (
                                <tr
                                    key={log.id}
                                    className="hover:bg-white/[0.01] transition-colors group"
                                >
                                    <td className="px-8 py-6 whitespace-nowrap">
                                        <span className="text-[11px] font-bold text-slate-500">
                                            {new Date(log.changedAt).toLocaleTimeString()}
                                        </span>
                                        <br />
                                        <span className="text-[9px] text-slate-600">
                                            {new Date(log.changedAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="bg-white/5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-300 border border-white/5">
                                            {log.entityType}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-black text-white uppercase tracking-wider">
                                            {log.fieldChanged.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            {log.oldValue && (
                                                <span className="text-[10px] text-red-400/70 line-through opacity-50">
                                                    {String(log.oldValue)}
                                                </span>
                                            )}
                                            <span className="text-xs text-slate-400">→</span>
                                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">
                                                {String(log.newValue)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-7 w-7 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[10px] font-black text-white shadow-lg shadow-blue-500/20">
                                                {log.userName?.charAt(0) || '?'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white">
                                                    {log.userName || 'System'}
                                                </span>
                                                <span className="text-[9px] text-slate-500">
                                                    {log.userEmail}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-8 py-20 text-center text-slate-500 italic text-sm"
                                    >
                                        No audit records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {meta && meta.totalPages > 1 && (
                    <div className="bg-white/[0.02] border-t border-white/5 px-8 py-5 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            Page {meta.page} of {meta.totalPages}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                                disabled={page === meta.totalPages}
                                className="px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-lg shadow-blue-500/20"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
