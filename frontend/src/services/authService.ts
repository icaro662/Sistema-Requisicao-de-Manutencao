import api from './api';
import type { ApiMessage, LoginInput, RegisterInput } from '../types';

export const authService = {
  login: (input: LoginInput) => api.post<ApiMessage>('/auth/login', input).then(({ data }) => data),
  register: (input: RegisterInput) => api.post<ApiMessage>('/auth/register', input).then(({ data }) => data),
  logout: () => api.post<ApiMessage>('/auth/logout').then(({ data }) => data),
};
