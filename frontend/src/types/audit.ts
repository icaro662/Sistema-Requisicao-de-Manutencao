import type { RequisitionStatus } from './requisitions';

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
export type AuditEntityValue =
    | 'requisicao'
    | 'usuario'
    | 'local'
    | 'categoria'
    | 'sistema';

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

export interface AuditFilters {
    usuario?: string;
    acao?: HistoryAction;
    entidade?: AuditEntityValue;
    resultado?: AuditResult;
    de?: string;
    ate?: string;
    requisicaoId?: string;
    page?: number;
    limit?: number;
}

export interface AuditPage {
    data: RequisitionHistoryEntry[];
    total: number;
    page: number;
    limit: number;
}
