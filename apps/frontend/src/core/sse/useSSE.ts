import { useEffect, useRef } from 'react';

export function useSSE(url: string, handlers: Record<string, (data: any) => void>) {
    const handlersRef = useRef(handlers);

    useEffect(() => {
        handlersRef.current = handlers;
    });

    useEffect(() => {
        let eventSource: EventSource | null = null;
        let retryTimeout: NodeJS.Timeout;
        let reconnectDelay = 2000;

        const connect = () => {
            eventSource = new EventSource(url);

            eventSource.onopen = () => {
                reconnectDelay = 2000;
            };

            eventSource.onerror = () => {
                eventSource?.close();
                retryTimeout = setTimeout(() => {
                    reconnectDelay = Math.min(reconnectDelay * 2, 30000);
                    connect();
                }, reconnectDelay);
            };

            Object.entries(handlersRef.current).forEach(([event, handler]) => {
                eventSource?.addEventListener(event, (e) => {
                    try {
                        const data = JSON.parse(e.data);
                        handler(data);
                    } catch (err) {
                        console.error('SSE Parse Error:', err);
                    }
                });
            });
        };

        connect();

        return () => {
            eventSource?.close();
            clearTimeout(retryTimeout);
        };
    }, [url]);
}
