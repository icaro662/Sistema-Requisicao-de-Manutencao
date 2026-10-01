import api from './api';
import type { Location } from '../types';

type LocationInput = { name: string; description?: string };
type LocationUpdate = { name?: string; description?: string };

export const locationService = {
    list: () => api.get<Location[]>('/locais').then(({ data }) => data),
    create: (input: LocationInput) =>
        api.post<Location>('/locais', input).then(({ data }) => data),
    update: (id: string, input: LocationUpdate) =>
        api.patch<Location>(`/locais/${id}`, input).then(({ data }) => data),
    remove: (id: string) =>
        api
            .delete<{ id: string; removed: boolean }>(`/locais/${id}`)
            .then(({ data }) => data),
};
