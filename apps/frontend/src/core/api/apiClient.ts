import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useUserStore } from '../store/userStore';

export const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const activeUser = useUserStore.getState().activeUser;
    if (activeUser && config.headers) {
        config.headers['X-User-Id'] = activeUser.id;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        if (
            response.data &&
            typeof response.data === 'object' &&
            'status' in response.data &&
            'data' in response.data
        ) {
            if ('meta' in response.data) {
                return {
                    data: response.data.data,
                    meta: response.data.meta,
                };
            }
            return response.data.data;
        }
        return response.data;
    },
    (error: any) => {
        let message = error.response?.data?.message || error.message || 'Something went wrong';

        if (
            error.response?.data?.error?.details &&
            Array.isArray(error.response.data.error.details)
        ) {
            const details = error.response.data.error.details;
            message = details.map((d: any) => `${d.path.join('.')}: ${d.message}`).join(', ');
        }

        return Promise.reject(new Error(message));
    }
);
