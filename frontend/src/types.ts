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
  gestorId?: string;
  executionDescription?: string;
  executionDate?: string;
  materialsUsed?: string;
  observations?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface DashboardFilters { from?: string; to?: string; locationId?: string; executorId?: string; categoryId?: string; priority?: RequisitionPriority; status?: RequisitionStatus }
export interface DashboardSummary { total: number; byStatus: Record<string, number> }
export interface ReportFilters { from?: string; to?: string; locationId?: string; executorId?: string; categoryId?: string; priority?: RequisitionPriority; status?: RequisitionStatus }
export interface ReportResponse { generatedAt: string; total: number; rows: Requisition[]; byStatus: Record<string, number>; byPeriod: Record<string, number> }
export interface RequisitionQuery {
  from?: string;
  to?: string;
  locationId?: string;
  executorId?: string;
  categoryId?: string;
  priority?: RequisitionPriority;
  status?: RequisitionStatus;
  search?: string;
}
export interface LoginInput { email: string; password: string }
export interface RegisterInput { name: string; email: string; password: string; phone?: string }
export interface CreateRequisitionInput { locationId: string; categoryId: string; description: string; priority: RequisitionPriority; requesterEmail: string; requesterPhone: string; requesterWhatsapp?: string; photoUrl?: string; gestorId?: string }
export interface RegisterExecutionInput { executionDescription: string; materialsUsed?: string; observations?: string }
export interface Notification { id: string; message: string; requisitionId: string; requisitionNumber: string; status: RequisitionStatus; createdAt: string; read: boolean }
export type CommunicationChannel = 'aplicacao' | 'email';
export type CommunicationOutcome = 'enviado' | 'falha' | 'desativado';
export interface Communication {
  id: string;
  requisitionId?: string | null;
  requisitionNumber?: string | null;
  recipientId?: string | null;
  recipientName: string;
  recipientEmail?: string | null;
  channel: CommunicationChannel;
  subject: string;
  body: string;
  outcome: CommunicationOutcome;
  detail?: string | null;
  createdAt: string;
}
export interface ExecutionRecord {
  id: string;
  requisitionId: string;
  requisition?: { id: string; number: string; description?: string; locationId?: string; categoryId?: string; priority?: RequisitionPriority; photoUrl?: string };
  executorId: string;
  executorName: string;
  executionDescription: string;
  serviceDate: string;
  materialsUsed?: string;
  observations?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}
export interface RegisterExecutionInput { executionDescription: string; materialsUsed?: string; observations?: string; photoUrl?: string }
export type HistoryAction =
  | 'criacao'
  | 'edicao'
  | 'alteracao_status'
  | 'atribuicao_executor'
  | 'registro_execucao'
  | 'observacao_adicionada'
  | 'solicitacao_material'
  | 'finalizacao'
  | 'cancelamento'
  | 'criacao_usuario'
  | 'atualizacao_usuario'
  | 'redefinicao_senha'
  | 'criacao_local'
  | 'atualizacao_local'
  | 'exclusao_local'
  | 'criacao_categoria'
  | 'atualizacao_categoria'
  | 'exclusao_categoria'
  | 'falha_operacao';

/** Objeto auditado pela operação. */
export type AuditEntityValue = 'requisicao' | 'usuario' | 'local' | 'categoria' | 'sistema';

/** Resultado da operação auditada. */
export type AuditResult = 'sucesso' | 'falha';

export interface RequisitionHistoryEntry {
  id: string;
  requisitionId: string | null;
  entityType: AuditEntityValue;
  entityId: string | null;
  userId: string | null;
  userName: string;
  action: HistoryAction;
  description: string;
  previousStatus: RequisitionStatus | null;
  newStatus: RequisitionStatus | null;
  referenceId: string | null;
  resultado: AuditResult;
  resultadoDetalhe: string | null;
  createdAt: string;
  updatedAt?: string;
}

/** Filtros do log de auditoria (usuário, data, ação, entidade e resultado). */
export interface AuditFilters {
  usuario?: string;
  acao?: HistoryAction;
  entidade?: AuditEntityValue;
  resultado?: AuditResult;
  de?: string;
  ate?: string;
  requisicaoId?: string;
  page?: number;
  /** Entradas por página (padrão da tela: 10). */
  limit?: number;
}

export interface AuditPage { data: RequisitionHistoryEntry[]; total: number; page: number; limit: number }
export interface FinalizeRequisitionInput { executionDescription?: string; materialsUsed?: string; observations?: string }
export interface CancelRequisitionInput { motivo?: string }
export interface RequestMaterial {
  id: string;
  requisitionId: string;
  materialsNeeded: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}
