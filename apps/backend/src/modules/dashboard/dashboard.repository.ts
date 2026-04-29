import { Knex } from 'knex';
import { DashboardStats } from './dashboard.types';

export class DashboardRepository {
    constructor(private db: Knex) {}

    async getStats(): Promise<DashboardStats> {
        const res = await this.db.raw(`
      WITH
        by_status AS (
          SELECT status::TEXT AS status, COUNT(*)::int AS count
          FROM tasks GROUP BY status
        ),
        avg_bid AS (
          SELECT t.complexity,
                 ROUND(AVG(b.hours_offered)::numeric, 2) AS avg_hours
          FROM   bids b
          JOIN   tasks t ON t.id = b.task_id
          GROUP  BY t.complexity
          ORDER  BY t.complexity
        ),
        top_users AS (
          SELECT u.id AS user_id, u.name AS user_name,
                 COUNT(t.id)::int AS tasks_completed
          FROM   users u
          JOIN   tasks t ON t.assigned_to = u.id AND t.status = 'done'
          GROUP  BY u.id, u.name
          ORDER  BY tasks_completed DESC
          LIMIT  3
        ),
        expired_no_bids AS (
          SELECT t.id, t.title, t.deadline::TEXT
          FROM   tasks t
          WHERE  t.deadline < NOW()
            AND  t.status NOT IN ('assigned','in_progress','review','done')
            AND  NOT EXISTS (SELECT 1 FROM bids b WHERE b.task_id = t.id)
        )
      SELECT
        (SELECT json_agg(by_status)      FROM by_status)      AS tasks_by_status,
        (SELECT json_agg(avg_bid)        FROM avg_bid)         AS avg_bid_by_complexity,
        (SELECT json_agg(top_users)      FROM top_users)       AS top_users,
        (SELECT json_agg(expired_no_bids) FROM expired_no_bids) AS expired_no_bids
    `);

        const row = res.rows[0];

        const tasksByStatus: Record<string, number> = {};
        if (row.tasks_by_status) {
            row.tasks_by_status.forEach((item: any) => {
                tasksByStatus[item.status] = parseInt(item.count, 10);
            });
        }

        return {
            tasksByStatus,
            avgBidByComplexity:
                row.avg_bid_by_complexity?.map((item: any) => ({
                    complexity: item.complexity,
                    avgHours: parseFloat(item.avg_hours),
                })) || [],
            topUsers:
                row.top_users?.map((item: any) => ({
                    userId: item.user_id,
                    userName: item.user_name,
                    tasksCompleted: parseInt(item.tasks_completed, 10),
                })) || [],
            expiredTasksNoBids:
                row.expired_no_bids?.map((item: any) => ({
                    id: item.id,
                    title: item.title,
                    deadline: item.deadline,
                })) || [],
        };
    }
}
