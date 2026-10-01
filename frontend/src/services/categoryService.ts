import api from './api';
import type { Category } from '../types';

type CategoryInput = { name: string; description?: string };
type CategoryUpdate = { name?: string; description?: string };

export const categoryService = {
    list: () => api.get<Category[]>('/categorias').then(({ data }) => data),
    create: (input: CategoryInput) =>
        api.post<Category>('/categorias', input).then(({ data }) => data),
    update: (id: string, input: CategoryUpdate) =>
        api
            .patch<Category>(`/categorias/${id}`, input)
            .then(({ data }) => data),
    remove: (id: string) =>
        api
            .delete<{ id: string; removed: boolean }>(`/categorias/${id}`)
            .then(({ data }) => data),
};
