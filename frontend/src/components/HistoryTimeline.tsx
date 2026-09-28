import { Clock, RefreshCw } from 'lucide-react';
import type { RequisitionHistoryEntry } from '../types';

const actionLabels: Record<string, string> = {
  criacao: 'Requisição criada',
  edicao: 'Dados atualizados',
  alteracao_status: 'Alteração de status',
  atribuicao_executor: 'Atribuição de executor',
  registro_execucao: 'Registro de execução',
  observacao_adicionada: 'Observação adicionada',
  solicitacao_material: 'Solicitação de material',
  finalizacao: 'Requisição finalizada',
  cancelamento: 'Requisição encerrada',
  criacao_usuario: 'Usuário criado',
  atualizacao_usuario: 'Usuário atualizado',
  redefinicao_senha: 'Senha redefinida',
  criacao_local: 'Local cadastrado',
  atualizacao_local: 'Local atualizado',
  exclusao_local: 'Local excluído',
  criacao_categoria: 'Categoria cadastrada',
  atualizacao_categoria: 'Categoria atualizada',
  exclusao_categoria: 'Categoria excluída',
  falha_operacao: 'Operação falhou',
};

/** Rótulos legíveis das ações auditadas (requisições, usuários e cadastros). */
export const historyActionLabels = actionLabels;

/** Rótulo legível de uma ação; devolve o código quando ainda não mapeado. */
export const historyActionLabel = (action: string): string => actionLabels[action] ?? action;

export function formatHistoryDate(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

type HistoryTimelineProps = {
  entries: RequisitionHistoryEntry[];
  isLoading?: boolean;
  emptyMessage?: string;
};

/**
 * Timeline visual do histórico da requisição: data/hora, descrição da
 * alteração e usuário responsável.
 */
export default function HistoryTimeline({ entries, isLoading, emptyMessage }: HistoryTimelineProps) {
  if (isLoading) {
    return (
      <div className="empty-state" style={{ minHeight: 120 }}>
        <RefreshCw className="spin" size={18} />
        Carregando histórico...
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="empty-state" style={{ minHeight: 120 }}>
        <Clock size={20} />
        <span>{emptyMessage ?? 'Nenhuma alteração registrada até o momento.'}</span>
      </div>
    );
  }

  return (
    <ul className="history-timeline">
      {entries.map((entry) => (
        <li key={entry.id}>
          <span className="timeline-dot" />
          <strong>{actionLabels[entry.action] ?? 'Alteração'}</strong>
          <p>{entry.description}</p>
          <span className="timeline-meta">
            {formatHistoryDate(entry.createdAt)} • <b>{entry.userName || 'Sistema'}</b>
          </span>
        </li>
      ))}
    </ul>
  );
}
