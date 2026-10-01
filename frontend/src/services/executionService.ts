import api from './api';
import type {
    ExecutionRecord,
    RegisterExecutionInput,
    Requisition,
} from '../types';

export const executionService = {
    register: (id: string, input: RegisterExecutionInput) =>
        api
            .post<ExecutionRecord>(`/execucoes/requisicao/${id}`, input)
            .then(({ data }) => data),
    addObservation: (id: string, observation: string) =>
        api
            .post<Requisition>(`/execucoes/requisicao/${id}/observacao`, {
                observacao: observation,
            })
            .then(({ data }) => data),
    history: (id: string) =>
        api
            .get<ExecutionRecord[]>(`/execucoes/requisicao/${id}`)
            .then(({ data }) => data),
    list: () =>
        api.get<ExecutionRecord[]>('/execucoes').then(({ data }) => data),
};
