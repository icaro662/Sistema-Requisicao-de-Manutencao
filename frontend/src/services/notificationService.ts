import api from './api';
import type { Communication, Notification } from '../types';

export const notificationService = {
    list: () =>
        api.get<Notification[]>('/notificacoes').then(({ data }) => data),
    notifyManager: (id: string, input: { mensagem?: string } = {}) =>
        api
            .post<Notification>(`/requisicoes/${id}/notificar-gestor`, input)
            .then(({ data }) => data),
    communications: () =>
        api.get<Communication[]>('/comunicacoes').then(({ data }) => data),
};
