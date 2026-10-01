import api from './api';
import type { RequestMaterial } from '../types';

export const materialService = {
    listForRequisition: (id: string) =>
        api
            .get<RequestMaterial[]>(`/materiais/requisicao/${id}`)
            .then(({ data }) => data),
    create: (id: string, input: { materialsNeeded: string; reason: string }) =>
        api
            .post<RequestMaterial>(`/materiais/requisicao/${id}`, input)
            .then(({ data }) => data),
};
