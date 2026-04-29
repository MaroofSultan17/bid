import { useEffect } from 'react';
import { useFlash } from '../contexts/FlashContext';
import { FlashReducerActions } from '../reducers/flashReducer';
import { FlashMessageInterface } from '../types/flash';

const typeStyles: Record<FlashMessageInterface['type'], string> = {
    success: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/15 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    info: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
};

const typeIcons: Record<FlashMessageInterface['type'], string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
};

export default function FlashMessages() {
    const { messages, dispatch } = useFlash();

    useEffect(() => {
        if (messages.length === 0) return;

        const timers = messages.map((msg) =>
            setTimeout(() => {
                dispatch({ type: FlashReducerActions.REMOVE, message: msg });
            }, 5000)
        );

        return () => {
            timers.forEach(clearTimeout);
        };
    }, [messages, dispatch]);

    if (messages.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
            {messages.map((msg, i) => (
                <div
                    key={`${msg.timestamp}-${i}`}
                    className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-2 shadow-lg backdrop-blur-sm animate-[slideIn_0.3s_ease-out] ${typeStyles[msg.type]}`}
                >
                    <span className="text-base font-bold">{typeIcons[msg.type]}</span>
                    <span className="flex-1">{msg.message}</span>
                    <button
                        className="opacity-50 hover:opacity-100 transition-opacity text-xs ml-2"
                        onClick={() =>
                            dispatch({ type: FlashReducerActions.REMOVE, message: msg })
                        }
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}
