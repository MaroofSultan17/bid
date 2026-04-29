import { Request, Response } from 'express';

class SseManager {
    private clients: Map<string, Response> = new Map();

    addClient(clientId: string, res: Response) {
        this.clients.set(clientId, res);
    }

    removeClient(clientId: string) {
        this.clients.delete(clientId);
    }

    broadcast(event: string, data: any) {
        for (const [_, res] of this.clients.entries()) {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
    }

    sendToUser(userId: string, event: string, data: any) {
        const res = this.clients.get(userId);
        if (res) {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        }
    }
}

export const sseManager = new SseManager();
