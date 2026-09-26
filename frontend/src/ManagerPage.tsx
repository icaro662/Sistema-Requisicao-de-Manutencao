import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, ClipboardList, Users } from 'lucide-react';
import { apiErrorMessage } from './services/api';
import { maintenanceService } from './services/maintenanceService';
import type { Requisition, RequisitionStatus, User } from './types';

const statusLabels: Record<RequisitionStatus, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_material: 'Aguardando material',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export default function ManagerPage() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const requisitionsQuery = useQuery({
    queryKey: ['requisitions', 'manager'],
    queryFn: () => maintenanceService.requisitions(),
  });

  const executorsQuery = useQuery({
    queryKey: ['executors'],
    queryFn: maintenanceService.executors,
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, executorId }: { id: string; executorId: string }) =>
      maintenanceService.assignExecutor(id, executorId),
    onSuccess: () => {
      setError('');
      setSelectedId(null);
      void queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
    onError: (reason) => setError(apiErrorMessage(reason)),
  });

  const requisitions = requisitionsQuery.data?.data ?? [];
  const executors = executorsQuery.data ?? [];
  const unassigned = requisitions.filter((r: Requisition) => !r.executorId && r.status === 'aberta');
  const inProgress = requisitions.filter((r: Requisition) => r.executorId && r.status !== 'concluida' && r.status !== 'cancelada');
  const completed = requisitions.filter((r: Requisition) => r.status === 'concluida' || r.status === 'cancelada');

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Painel do gestor</p>
        <h1>Gerenciar solicitações</h1>
      </div>
    </div>

    {error && <p className="form-error">{error}</p>}

    <div className="metric-grid">
      <div className="metric-card">
        <div className="metric-icon blue"><ClipboardList size={19} /></div>
        <div>
          <span>Aguardando atribuição</span>
          <strong>{unassigned.length}</strong>
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-icon gold"><Users size={19} /></div>
        <div>
          <span>Em andamento</span>
          <strong>{inProgress.length}</strong>
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-icon mint"><BarChart3 size={19} /></div>
        <div>
          <span>Concluídas</span>
          <strong>{completed.length}</strong>
        </div>
      </div>
    </div>

    <div className="content-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Sem executor</p>
            <h2>Distribuir solicitações</h2>
          </div>
        </div>
        {unassigned.length ? (
          <div className="people-list">
            {unassigned.map((req: Requisition) => (
              <div className="person-row" key={req.id}>
                <div className="avatar">{req.number?.[0] ?? 'R'}</div>
                <div>
                  <strong>{req.number ?? req.id.slice(0, 8)}</strong>
                  <span>{req.description?.slice(0, 60) ?? 'Sem descrição'}</span>
                </div>
                <button className="primary-button compact" onClick={() => setSelectedId(req.id)}>
                  Atribuir
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ClipboardList size={23} />
            <strong>Tudo distribuído</strong>
            <span>Nenhuma solicitação aguardando atribuição.</span>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Em andamento</p>
            <h2>Acompanhamento</h2>
          </div>
        </div>
        {inProgress.length ? (
          <div className="people-list">
            {inProgress.map((req: Requisition) => (
              <div className="person-row" key={req.id}>
                <div className="avatar">{req.number?.[0] ?? 'R'}</div>
                <div>
                  <strong>{req.number ?? req.id.slice(0, 8)}</strong>
                  <span>{req.description?.slice(0, 60) ?? 'Sem descrição'}</span>
                </div>
                <span className={`status-badge ${req.status ?? 'aberta'}`}>{statusLabels[req.status ?? 'aberta']}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <BarChart3 size={23} />
            <strong>Nada em andamento</strong>
            <span>As solicitações em atendimento aparecerão aqui.</span>
          </div>
        )}
      </section>
    </div>

    {selectedId && (
      <section className="panel" style={{ marginTop: '17px' }}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Atribuir executor</p>
            <h2>Selecionar responsável</h2>
          </div>
        </div>
        <div className="people-list">
          {executors.map((executor: User) => (
            <div className="person-row" key={executor.id}>
              <div className="avatar">{executor.name[0]?.toUpperCase()}</div>
              <div>
                <strong>{executor.name}</strong>
                <span>{executor.email}</span>
              </div>
              <button
                className="primary-button compact"
                disabled={assignMutation.isPending}
                onClick={() => assignMutation.mutate({ id: selectedId, executorId: executor.id })}
              >
                Atribuir
              </button>
            </div>
          ))}
        </div>
        <div style={{ padding: '0 24px 24px' }}>
          <button className="secondary-button" onClick={() => setSelectedId(null)}>
            Cancelar
          </button>
        </div>
      </section>
    )}
  </>;
}
