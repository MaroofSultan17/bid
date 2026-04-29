import { createContext, ReactNode, useContext } from 'react';
import { EnvVariables } from '../services/env';

export const EnvContext = createContext<EnvVariables>({});

export function EnvProvider({ children, env }: { children: ReactNode; env: EnvVariables }) {
    if (import.meta.env.DEV) {
        console.debug('EnvProvider ENV: ', JSON.stringify(env));
    }

    return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>;
}

export function useEnv() {
    const context = useContext(EnvContext);
    if (!context) {
        throw new Error(
            'useEnv must be used within an EnvProvider. Wrap a parent component in <EnvProvider> to fix this error.'
        );
    }
    return context;
}
