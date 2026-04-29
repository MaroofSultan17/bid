import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from './dashboard.service';
import { useJwt } from '../../contexts/JwtContext';

export const Dashboard: React.FC = () => {
    const { token } = useJwt();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

    const { data, isLoading } = useQuery({
        queryKey: ['dashboardStats', token],
        queryFn: () => new DashboardService(baseUrl, token!).getStats(),
        enabled: !!token,
    });

    if (isLoading) return <div className="text-slate-400">Loading metrics...</div>;
    if (!data) return null;

    return (
        <div className="p-4 grid gap-4 grid-cols-2">
            <div className="bg-[hsl(var(--secondary))] p-4 rounded-xl border border-[hsl(var(--primary))] shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-[hsl(var(--primary))] uppercase tracking-tight">
                    Platform Metrics
                </h2>
                <pre className="text-xs text-slate-300 overflow-auto max-h-40">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        </div>
    );
};
