import api from './api';
import type { Category, DashboardSummary, Location, Paginated, Requisition, RequisitionQuery, RequisitionStatus, User } from '../types';

export const maintenanceService = {
  dashboard: () => api.get<DashboardSummary>('/dashboard').then(({ data }) => data),
  requisitions: (params?: RequisitionQuery) => api.get<Paginated<Requisition>>('/requisitions', { params }).then(({ data }) => data),
  requisition: (id: string) => api.get<Requisition>(`/requisitions/${id}`).then(({ data }) => data),
  updateStatus: (id: string, status: RequisitionStatus) => api.patch<Requisition>(`/requisitions/${id}/status`, { status }).then(({ data }) => data),
  users: () => api.get<Paginated<User>>('/users').then(({ data }) => data),
  locations: () => api.get<Location[]>('/locations').then(({ data }) => data),
  categories: () => api.get<Category[]>('/categories').then(({ data }) => data),
  executors: () => api.get<User[]>('/executors').then(({ data }) => data),
};
