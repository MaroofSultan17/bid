import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { JwtPayload } from '../types/jwt';

interface JwtContextType {
    token?: string;
    refreshToken?: string;
    payload?: JwtPayload;
    isTokenValid: () => boolean;
    logout: () => void;
    login: (token: string, refreshToken: string, refreshExpiration: number) => void;
}

const JwtContext = createContext<JwtContextType | undefined>(undefined);

export function JwtProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | undefined>(Cookies.get('token'));
    const [refreshToken, setRefreshToken] = useState<string | undefined>(
        Cookies.get('refresh_token')
    );
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);

    const refreshUrl = `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`;

    const logout = useCallback(() => {
        if (timeoutId) clearTimeout(timeoutId);
        Cookies.remove('token');
        Cookies.remove('refresh_token');
        setToken(undefined);
        setRefreshToken(undefined);
        window.location.href = '/login';
    }, [timeoutId]);

    const login = useCallback(
        (token: string, refreshToken: string, refreshExpiration: number) => {
            Cookies.set('token', token);
            Cookies.set('refresh_token', refreshToken, {
                expires: new Date(refreshExpiration * 1000),
            });
            setToken(token);
            setRefreshToken(refreshToken);
        },
        []
    );

    const isTokenValid = () => {
        if (!token) return false;
        const payload = getPayload(token);
        if (!payload || !payload.exp) return false;
        return payload.exp * 1000 > Date.now();
    };

    useEffect(() => {
        const processJwt = (forceRefresh?: boolean) => {
            const jwt = Cookies.get('token');
            const rJwt = Cookies.get('refresh_token');

            if (jwt) {
                const payload = getPayload(jwt);
                if (payload && payload.exp) {
                    if (rJwt) {
                        const timeLeft = payload.exp * 1000 - Date.now();
                        const refreshThreshold = Math.floor(timeLeft / 2);

                        if (refreshThreshold <= 0 || forceRefresh) {
                            fetch(refreshUrl, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ refresh_token: rJwt }),
                            })
                                .then((r) => {
                                    if (r.ok) return r.json();
                                    throw new Error('Refresh failed');
                                })
                                .then((res) => {
                                    const data = res.data;
                                    login(
                                        data.token,
                                        data.refresh_token,
                                        data.refresh_token_expiration
                                    );
                                })
                                .catch(() => {
                                    logout();
                                });
                        } else {
                            if (timeoutId) clearTimeout(timeoutId);
                            setTimeoutId(setTimeout(() => processJwt(true), refreshThreshold));
                        }
                    } else {
                        logout();
                    }
                } else {
                    logout();
                }
            } else if (rJwt) {
                processJwt(true);
            }
        };

        processJwt();
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [token]);

    const payload = token ? getPayload(token) : undefined;

    return (
        <JwtContext.Provider value={{ token, refreshToken, payload, isTokenValid, logout, login }}>
            {children}
        </JwtContext.Provider>
    );
}

export function getPayload(token?: string): JwtPayload | undefined {
    try {
        if (!token) return undefined;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

export function useJwt() {
    const context = useContext(JwtContext);
    if (!context)
        throw new Error(
            'useJwt must be used within a JwtProvider. Wrap a parent component in <JwtProvider> to fix this error.'
        );
    return context;
}
