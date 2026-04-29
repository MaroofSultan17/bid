export interface DashboardStats {
    tasksByStatus: Record<string, number>;
    avgBidByComplexity: Array<{ complexity: number; avgHours: number }>;
    topUsers: Array<{ userId: string; userName: string; tasksCompleted: number }>;
    expiredTasksNoBids: Array<{ id: string; title: string; deadline: string }>;
}
