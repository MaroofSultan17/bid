import React, { createContext, Dispatch, useContext, useReducer } from 'react';
import { FlashMessageInterface } from '../types/flash';
import flashReducer, { FlashReducerActionInterface } from '../reducers/flashReducer';

interface FlashContextInterface {
    messages: FlashMessageInterface[];
    dispatch: Dispatch<FlashReducerActionInterface>;
}

// Provide a safe default to avoid crashes during very early renders (e.g., initial app startup)
const defaultFlashContext: FlashContextInterface = {
    messages: [],
    // no-op dispatch until the real provider mounts
    dispatch: (() => undefined) as unknown as Dispatch<FlashReducerActionInterface>,
};

const FlashContext = createContext<FlashContextInterface>(defaultFlashContext);

export function FlashProvider({ children }: { children: React.ReactNode }) {
    const [messages, dispatch] = useReducer(flashReducer, []);

    const contextValue = {
        messages,
        dispatch,
    };

    return <FlashContext.Provider value={contextValue}>{children}</FlashContext.Provider>;
}

export function useFlash() {
    const context = useContext(FlashContext);
    if (!context) {
        throw new Error(
            'useFlash must be used within a FlashProvider. Wrap a parent component in <FlashProvider> to fix this error.'
        );
    }
    return context;
}
