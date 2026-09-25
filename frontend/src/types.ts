export type RequisitionStatus = 'aberta' | 'em_analise' | 'em_atendimento' | 'aguardando_material' | 'concluida' | 'cancelada';
export type RequisitionPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface ApiMessage { message: string; email?: string; refreshToken?: string }
export interface Paginated<T> { data: T[]; total: number }
export interface User { id: string; name: string; email: string; phone?: string; role?: string; isActive?: boolean }
export interface Location { id: string; name: string; description?: string }
export interface Category { id: string; name: string; description?: string }
export interface Requisition {
  id: string;
  number?: string;
  description?: string;
  status?: RequisitionStatus;
  priority?: RequisitionPriority;
  requesterEmail?: string;
  requesterPhone?: string;
  locationId?: string;
  categoryId?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface DashboardSummary { total: number; byStatus: Record<string, number> }
export interface RequisitionQuery { status?: RequisitionStatus; priority?: RequisitionPriority; search?: string }
export interface LoginInput { email: string; password: string }
export interface RegisterInput { name: string; email: string; password: string; phone?: string; role?: string }
