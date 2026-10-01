import { RequisitionStatus } from './status.enum';

const STATUS_LABELS: Record<RequisitionStatus, string> = {
  [RequisitionStatus.OPEN]: 'Aberta',
  [RequisitionStatus.ANALYSIS]: 'Em análise',
  [RequisitionStatus.IN_SERVICE]: 'Em atendimento',
  [RequisitionStatus.AWAITING_MATERIAL]: 'Aguardando material',
  [RequisitionStatus.COMPLETED]: 'Concluída',
  [RequisitionStatus.CANCELLED]: 'Cancelada',
};

export function statusLabel(status?: string | null): string {
  if (!status) return 'sem status';
  return STATUS_LABELS[status as RequisitionStatus] ?? status;
}
