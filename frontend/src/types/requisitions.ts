export type RequisitionStatus =
    | 'aberta'
    | 'em_analise'
    | 'em_atendimento'
    | 'aguardando_material'
    | 'concluida'
    | 'cancelada';
    
export type RequisitionPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface Location {
    id: string;
    name: string;
    description?: string;
}
export interface Category {
    id: string;
    name: string;
    description?: string;
}
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
export interface CreateRequisitionInput {
    locationId: string;
    categoryId: string;
    description: string;
    priority: RequisitionPriority;
    requesterEmail: string;
    requesterPhone: string;
    requesterWhatsapp?: string;
    photoUrl?: string;
    gestorId?: string;
}
export interface FinalizeRequisitionInput {
    executionDescription?: string;
    materialsUsed?: string;
    observations?: string;
}
export interface CancelRequisitionInput {
    motivo?: string;
}
export interface RequestMaterial {
    id: string;
    requisitionId: string;
    materialsNeeded: string;
    reason: string | null;
    createdAt: string;
    updatedAt: string;
}
