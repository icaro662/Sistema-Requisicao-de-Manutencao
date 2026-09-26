import api from './api';
import type { ApiMessage, AuthResponse, LoginInput, RegisterInput } from '../types';

export const authService = {
  login: (input: LoginInput) => api.post<AuthResponse>('/auth/login', input).then(({ data }) => data),
  register: (input: RegisterInput) => api.post<AuthResponse>('/auth/register', input).then(({ data }) => data),
  refresh: (refreshToken: string) => api.post<AuthResponse>('/auth/refresh', { refreshToken }).then(({ data }) => data),
  logout: (refreshToken: string) => api.post<ApiMessage>('/auth/logout', { refreshToken }).then(({ data }) => data),
};
