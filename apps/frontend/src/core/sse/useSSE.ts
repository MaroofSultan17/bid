import { useEffect } from 'react';

export function useSSE(event: string, callback: (data: any) => void) {
    useEffect(() => {
        const eventSource = new EventSource('/api/sse');

        eventSource.addEventListener(event, (e: any) => {
            if (e.data) {
                callback(JSON.parse(e.data));
            }
        });

        return () => {
            eventSource.close();
        };
    }, [event, callback]);
}
