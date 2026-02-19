import axios from 'axios';
import type { AuthResponse, ReviewResult, ReviewHistory, Stats, User } from './types';

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000, // 60 second timeout
});

// Attach token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('cr_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('cr_token');
            localStorage.removeItem('cr_user');
            window.location.reload();
        }
        return Promise.reject(err);
    }
);

export const authApi = {
    login: (email: string, password: string) =>
        api.post<AuthResponse>('/auth/login', { email, password }).then(r => r.data),
    register: (username: string, email: string, password: string) =>
        api.post<AuthResponse>('/auth/register', { username, email, password }).then(r => r.data),
    me: () => api.get<User>('/auth/me').then(r => r.data),
};

export const reviewApi = {
    submit: (code: string, language: string) =>
        api.post<ReviewResult>('/review', { code, language }).then(r => r.data),
    list: (limit = 20) =>
        api.get<ReviewHistory[]>(`/reviews?limit=${limit}`).then(r => r.data),
    get: (id: number) =>
        api.get<ReviewResult & { original_code: string; language: string }>(`/reviews/${id}`).then(r => r.data),
    delete: (id: number) =>
        api.delete(`/reviews/${id}`).then(r => r.data),
    stats: () =>
        api.get<Stats>('/stats').then(r => r.data),
};
