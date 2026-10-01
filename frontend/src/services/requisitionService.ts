import api from './api';
import type {
    CancelRequisitionInput,
    CreateRequisitionInput,
    FinalizeRequisitionInput,
    Paginated,
    Requisition,
    RequisitionHistoryEntry,
    RequisitionQuery,
    RequisitionStatus,
} from '../types';

export const requisitionService = {
    list: (params?: RequisitionQuery) =>
        api
            .get<Paginated<Requisition>>('/requisicoes', { params })
            .then(({ data }) => data),
    get: (id: string) =>
        api.get<Requisition>(`/requisicoes/${id}`).then(({ data }) => data),
    create: (input: CreateRequisitionInput) =>
        api.post<Requisition>('/requisicoes', input).then(({ data }) => data),
    updateStatus: (id: string, status: RequisitionStatus) =>
        api
            .patch<Requisition>(`/requisicoes/${id}/status`, { status })
            .then(({ data }) => data),
    assignExecutor: (id: string, executorId: string) =>
        api
            .post<Requisition>(`/requisicoes/${id}/atribuir`, { executorId })
            .then(({ data }) => data),
    selfAssign: (id: string) =>
        api
            .post<Requisition>(`/requisicoes/${id}/assumir`)
            .then(({ data }) => data),
    history: (id: string) =>
        api
            .get<RequisitionHistoryEntry[]>(`/requisicoes/${id}/historico`)
            .then(({ data }) => data),
    finalize: (id: string, input: FinalizeRequisitionInput = {}) =>
        api
            .post<Requisition>(`/requisicoes/${id}/finalizar`, input)
            .then(({ data }) => data),
    cancel: (id: string, input: CancelRequisitionInput = {}) =>
        api
            .post<Requisition>(`/requisicoes/${id}/cancelar`, input)
            .then(({ data }) => data),
};
