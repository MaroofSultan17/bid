import { useEffect, useRef } from 'react';

export function useSSE(url: string | null, handlers: Record<string, (data: any) => void>) {
    const handlersRef = useRef(handlers);

    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        if (!url) return;

        let eventSource: EventSource | null = null;
        let retryTimeout: NodeJS.Timeout | number;
        let reconnectDelay = 2000;

        const connect = () => {
            eventSource = new EventSource(url);

            eventSource.onerror = () => {
                eventSource?.close();
                retryTimeout = setTimeout(() => {
                    reconnectDelay = Math.min(reconnectDelay * 2, 30000);
                    connect();
                }, reconnectDelay);
            };

            Object.keys(handlersRef.current).forEach((event) => {
                eventSource?.addEventListener(event, (e: any) => {
                    try {
                        const data = JSON.parse(e.data);
                        handlersRef.current[event]?.(data);
                    } catch (err) {
                        // Silent fail
                    }
                });
            });
        };

        connect();

        return () => {
            eventSource?.close();
            if (retryTimeout) clearTimeout(retryTimeout as any);
        };
    }, [url]);
}
