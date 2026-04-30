import { Response } from 'express';

class SseManager {
    private taskClients: Map<string, Set<Response>> = new Map();
    private globalClients: Set<Response> = new Set();

    subscribe(taskId: string, res: Response): void {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        });
        res.flushHeaders();

        res.write(`data: ${JSON.stringify({ type: 'connected', taskId })}\n\n`);

        if (!this.taskClients.has(taskId)) {
            this.taskClients.set(taskId, new Set());
        }
        this.taskClients.get(taskId)!.add(res);
        this.globalClients.add(res);

        const heartbeat = setInterval(() => {
            if (!res.writableEnded) {
                res.write(': heartbeat\n\n');
            }
        }, 10000);

        res.on('close', () => {
            clearInterval(heartbeat);
            this.taskClients.get(taskId)?.delete(res);
            if (this.taskClients.get(taskId)?.size === 0) {
                this.taskClients.delete(taskId);
            }
            this.globalClients.delete(res);
        });
    }

    subscribeGlobal(res: Response): void {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        });
        res.flushHeaders();

        res.write(`data: ${JSON.stringify({ type: 'connected', scope: 'global' })}\n\n`);

        this.globalClients.add(res);

        const heartbeat = setInterval(() => {
            if (!res.writableEnded) {
                res.write(': heartbeat\n\n');
            }
        }, 10000);

        res.on('close', () => {
            clearInterval(heartbeat);
            this.globalClients.delete(res);
        });
    }

    publish(taskId: string, event: string, data: unknown): void {
        const clients = this.taskClients.get(taskId);
        if (!clients) return;

        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const res of clients) {
            try {
                res.write(payload);
                if ((res as any).flush) {
                    (res as any).flush();
                }
            } catch {
                // Silent fail
            }
        }
    }

    publishGlobal(event: string, data: unknown): void {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const res of this.globalClients) {
            try {
                res.write(payload);
                if ((res as any).flush) {
                    (res as any).flush();
                }
            } catch {
                // Silent fail
            }
        }
    }
}

export const sseManager = new SseManager();
