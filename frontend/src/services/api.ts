import axios from 'axios';
import type { AuthResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(undefined, async (error) => {
  const request = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
  const isRefreshRequest = request?.url?.includes('/auth/refresh');

  if (error.response?.status !== 401 || !request || request._retry || isRefreshRequest) {
    return Promise.reject(error);
  }

  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return Promise.reject(error);

  request._retry = true;
  refreshPromise ??= axios.post<AuthResponse>(
    `${api.defaults.baseURL ?? ''}/auth/refresh`,
    { refreshToken },
  ).then(({ data }) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.accessToken;
  }).finally(() => {
    refreshPromise = null;
  });

  try {
    const accessToken = await refreshPromise;
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return api(request);
  } catch {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return Promise.reject(error);
  }
});

export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message ?? error.response?.data?.error ?? error.message;
    const translations: Record<string, string> = {
      'Invalid credentials': 'Credenciais inválidas.',
      'Email is already registered': 'Este e-mail já está cadastrado.',
      'Invalid or expired refresh token': 'O token de renovação é inválido ou expirou.',
      'Invalid or revoked refresh token': 'O token de renovação é inválido ou foi revogado.',
      'User session is no longer active': 'A sessão do usuário não está mais ativa.',
    };
    return translations[message] ?? message;
  }
  return 'Não foi possível conectar à API de manutenção.';
}

export default api;
