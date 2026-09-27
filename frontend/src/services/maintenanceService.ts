import api from './api';
import type { Category, CreateRequisitionInput, DashboardSummary, Location, ManagedUserInput, Notification, Paginated, RegisterExecutionInput, ReportFilters, ReportResponse, Requisition, RequisitionQuery, RequisitionStatus, UpdateUserInput, User } from '../types';

interface UploadPhotoResponse { filename: string; path: string; mimetype: string; size: number }

export const maintenanceService = {
  dashboard: () => api.get<DashboardSummary>('/painel').then(({ data }) => data),
  report: (params?: ReportFilters) => api.get<ReportResponse>('/relatorios', { params }).then(({ data }) => data),
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
  registerExecution: (id: string, input: RegisterExecutionInput) => api.post<Requisition>(`/requisicoes/${id}/execucao`, input).then(({ data }) => data),
  users: () => api.get<Paginated<User>>('/usuarios').then(({ data }) => data),
  createUser: (input: ManagedUserInput) => api.post<User>('/usuarios', input).then(({ data }) => data),
  updateUser: (id: string, input: UpdateUserInput) => api.patch<User>(`/usuarios/${id}`, input).then(({ data }) => data),
  locations: () => api.get<Location[]>('/locais').then(({ data }) => data),
  createLocation: (input: { name: string; description?: string }) => api.post<Location>('/locais', input).then(({ data }) => data),
  updateLocation: (id: string, input: { name?: string; description?: string }) => api.patch<Location>(`/locais/${id}`, input).then(({ data }) => data),
  categories: () => api.get<Category[]>('/categorias').then(({ data }) => data),
  createCategory: (input: { name: string; description?: string }) => api.post<Category>('/categorias', input).then(({ data }) => data),
  updateCategory: (id: string, input: { name?: string; description?: string }) => api.patch<Category>(`/categorias/${id}`, input).then(({ data }) => data),
  executors: () => api.get<User[]>('/executores').then(({ data }) => data),
  notifications: () => api.get<Notification[]>('/notificacoes').then(({ data }) => data),
};
