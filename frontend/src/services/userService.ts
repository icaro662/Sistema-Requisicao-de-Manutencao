import api from './api';
import type {
    ManagedUserInput,
    Paginated,
    UpdateUserInput,
    User,
} from '../types';

export const userService = {
    list: () => api.get<Paginated<User>>('/usuarios').then(({ data }) => data),
    create: (input: ManagedUserInput) =>
        api.post<User>('/usuarios', input).then(({ data }) => data),
    update: (id: string, input: UpdateUserInput) =>
        api.patch<User>(`/usuarios/${id}`, input).then(({ data }) => data),
    executors: () => api.get<User[]>('/executores').then(({ data }) => data),
    managers: () => api.get<User[]>('/gestores').then(({ data }) => data),
};
