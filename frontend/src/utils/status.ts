import type { RequisitionStatus } from '../types';

export const statusLabels: Record<RequisitionStatus, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_material: 'Aguardando material',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export const statusOptions = Object.keys(statusLabels) as RequisitionStatus[];

export function getStatusColor(status?: string | null): string {
  switch (status) {
    case 'concluida':
      return '#4ade80';
    case 'aberta':
      return '#facc15';
    case 'cancelada':
      return '#f87171';
    case 'em_atendimento':
      return '#60a5fa';
    case 'em_analise':
      return '#c084fc';
    case 'aguardando_material':
      return '#fb923c';
    default:
      return '#d1d5db';
  }
}
