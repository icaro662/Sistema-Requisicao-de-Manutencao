export type RequisitionStatus = 'aberta' | 'em_analise' | 'em_atendimento' | 'aguardando_material' | 'concluida' | 'cancelada';
export type RequisitionPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface ApiMessage { message: string }
export interface Paginated<T> { data: T[]; total: number }
export interface User { id: string; name: string; email: string; phone?: string; role?: string; isActive?: boolean }
export type UserRole = 'solicitante' | 'executor' | 'gestor' | 'admin';
export type StaffRole = Exclude<UserRole, 'solicitante'>;
export interface ManagedUserInput { name: string; email: string; password: string; phone?: string; role: StaffRole }
export interface UpdateUserInput { name?: string; phone?: string; role?: UserRole; password?: string }
export interface AuthResponse { message: string; accessToken: string; refreshToken: string; user: User }
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
  requesterWhatsapp?: string;
  photoUrl?: string;
  locationId?: string;
  categoryId?: string;
  executorId?: string;
  executionDescription?: string;
  executionDate?: string;
  materialsUsed?: string;
  observations?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface DashboardSummary { total: number; byStatus: Record<string, number> }
export interface ReportFilters { from?: string; to?: string; locationId?: string; executorId?: string; categoryId?: string; priority?: RequisitionPriority; status?: RequisitionStatus }
export interface ReportResponse { generatedAt: string; total: number; rows: Requisition[]; byStatus: Record<string, number> }
export interface RequisitionQuery { status?: RequisitionStatus; priority?: RequisitionPriority; search?: string }
export interface LoginInput { email: string; password: string }
export interface RegisterInput { name: string; email: string; password: string; phone?: string }
export interface CreateRequisitionInput { locationId: string; categoryId: string; description: string; priority: RequisitionPriority; requesterEmail: string; requesterPhone: string; requesterWhatsapp?: string; photoUrl?: string }
export interface RegisterExecutionInput { executionDescription: string; materialsUsed?: string; observations?: string }
export interface Notification { id: string; message: string; requisitionId: string; requisitionNumber: string; status: RequisitionStatus; createdAt: string; read: boolean }
