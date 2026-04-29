export const allowedEnvKeys = ['VITE_API_BASE_URL'] as const;

export type EnvKey = (typeof allowedEnvKeys)[number];
export type EnvVariables = { [K in EnvKey]?: string | undefined };

export function getAllEnv(): EnvVariables {
    return {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    };
}

export function getApiBaseUrl(): string {
    return import.meta.env.VITE_API_BASE_URL || '/api';
}
