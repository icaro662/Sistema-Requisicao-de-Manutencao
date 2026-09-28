import api from './api';
import type { AuditFilters, AuditPage, CancelRequisitionInput, Category, CreateRequisitionInput, DashboardFilters, DashboardSummary, FinalizeRequisitionInput, Location, ManagedUserInput, Notification, Paginated, RegisterExecutionInput, RequestMaterial, ExecutionRecord, RequisitionHistoryEntry, ReportFilters, ReportResponse, Requisition, RequisitionQuery, RequisitionStatus, UpdateUserInput, User } from '../types';

interface UploadPhotoResponse { filename: string; path: string; mimetype: string; size: number }

export const maintenanceService = {
  dashboard: (params?: DashboardFilters) => api.get<DashboardSummary>('/painel', { params }).then(({ data }) => data),
  report: (params?: ReportFilters) => api.get<ReportResponse>('/relatorios', { params }).then(({ data }) => data),
  exportReport: (format: 'pdf' | 'excel', params?: ReportFilters) => api.get(`/relatorios/export-${format}`, { params, responseType: 'blob' }).then(({ data }) => data as Blob),
  requisitions: (params?: RequisitionQuery) => api.get<Paginated<Requisition>>('/requisicoes', { params }).then(({ data }) => data),
  requisition: (id: string) => api.get<Requisition>(`/requisicoes/${id}`).then(({ data }) => data),
  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<UploadPhotoResponse>('/arquivos/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(({ data }) => data);
  },
  removePhoto: (filename: string) => api.delete<{ filename: string; removed: boolean }>(`/arquivos/${encodeURIComponent(filename)}`).then(({ data }) => data),
  createRequisition: (input: CreateRequisitionInput) => api.post<Requisition>('/requisicoes', input).then(({ data }) => data),
  updateStatus: (id: string, status: RequisitionStatus) => api.patch<Requisition>(`/requisicoes/${id}/status`, { status }).then(({ data }) => data),
  assignExecutor: (id: string, executorId: string) => api.post<Requisition>(`/requisicoes/${id}/atribuir`, { executorId }).then(({ data }) => data),
  selfAssign: (id: string) => api.post<Requisition>(`/requisicoes/${id}/assumir`).then(({ data }) => data),
  registerExecution: (id: string, input: RegisterExecutionInput) => api.post<ExecutionRecord>(`/execucoes/requisicao/${id}`, input).then(({ data }) => data),
  addObservation: (id: string, observation: string) => api.post<Requisition>(`/execucoes/requisicao/${id}/observacao`, { observacao: observation }).then(({ data }) => data),
  executionHistory: (id: string) => api.get<ExecutionRecord[]>(`/execucoes/requisicao/${id}`).then(({ data }) => data),
  requisitionHistory: (id: string) => api.get<RequisitionHistoryEntry[]>(`/requisicoes/${id}/historico`).then(({ data }) => data),
  auditoria: (params?: AuditFilters) => api.get<AuditPage>('/auditoria', { params }).then(({ data }) => data),
  finalizeRequisition: (id: string, input: FinalizeRequisitionInput = {}) => api.post<Requisition>(`/requisicoes/${id}/finalizar`, input).then(({ data }) => data),
  cancelRequisition: (id: string, input: CancelRequisitionInput = {}) => api.post<Requisition>(`/requisicoes/${id}/cancelar`, input).then(({ data }) => data),
  users: () => api.get<Paginated<User>>('/usuarios').then(({ data }) => data),
  createUser: (input: ManagedUserInput) => api.post<User>('/usuarios', input).then(({ data }) => data),
  updateUser: (id: string, input: UpdateUserInput) => api.patch<User>(`/usuarios/${id}`, input).then(({ data }) => data),
  locations: () => api.get<Location[]>('/locais').then(({ data }) => data),
  createLocation: (input: { name: string; description?: string }) => api.post<Location>('/locais', input).then(({ data }) => data),
  updateLocation: (id: string, input: { name?: string; description?: string }) => api.patch<Location>(`/locais/${id}`, input).then(({ data }) => data),
  deleteLocation: (id: string) => api.delete<{ id: string; removed: boolean }>(`/locais/${id}`).then(({ data }) => data),
  categories: () => api.get<Category[]>('/categorias').then(({ data }) => data),
  createCategory: (input: { name: string; description?: string }) => api.post<Category>('/categorias', input).then(({ data }) => data),
  updateCategory: (id: string, input: { name?: string; description?: string }) => api.patch<Category>(`/categorias/${id}`, input).then(({ data }) => data),
  deleteCategory: (id: string) => api.delete<{ id: string; removed: boolean }>(`/categorias/${id}`).then(({ data }) => data),
  executors: () => api.get<User[]>('/executores').then(({ data }) => data),
  notifications: () => api.get<Notification[]>('/notificacoes').then(({ data }) => data),
  requestMaterials: (id: string) => api.get<RequestMaterial[]>(`/materiais/requisicao/${id}`).then(({ data }) => data),
  createRequestMaterial: (id: string, input: { materialsNeeded: string; reason: string }) => api.post<RequestMaterial>(`/materiais/requisicao/${id}`, input).then(({ data }) => data),
  executions: () => api.get<ExecutionRecord[]>('/execucoes').then(({ data }) => data),
};
