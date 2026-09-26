import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, ClipboardList, UserCheck } from 'lucide-react';
import { apiErrorMessage } from './services/api';
import { maintenanceService } from './services/maintenanceService';
import { useAuthStore } from './store/authStore';
import type { Requisition, RequisitionStatus } from './types';

const statusLabels: Record<RequisitionStatus, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_material: 'Aguardando material',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export default function ExecutorPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [executionForm, setExecutionForm] = useState({ executionDescription: '', materialsUsed: '', observations: '' });
  const [error, setError] = useState('');

  const query = useQuery({
    queryKey: ['requisitions', 'executor'],
    queryFn: () => maintenanceService.requisitions(),
  });

  const assignMutation = useMutation({
    mutationFn: (id: string) => maintenanceService.assignExecutor(id, currentUser?.id ?? ''),
    onSuccess: () => {
      setError('');
      void queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
    onError: (reason) => setError(apiErrorMessage(reason)),
  });

  const executeMutation = useMutation({
    mutationFn: (id: string) => maintenanceService.registerExecution(id, executionForm),
    onSuccess: () => {
      setError('');
      setSelectedId(null);
      setExecutionForm({ executionDescription: '', materialsUsed: '', observations: '' });
      void queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
    onError: (reason) => setError(apiErrorMessage(reason)),
  });

  const requisitions = query.data?.data ?? [];
  const assignedToMe = requisitions.filter((r: Requisition) => r.executorId === currentUser?.id);
  const available = requisitions.filter((r: Requisition) => !r.executorId && r.status === 'aberta');

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Painel do executor</p>
        <h1>Minhas atribuições</h1>
      </div>
    </div>

    {error && <p className="form-error">{error}</p>}

    <div className="content-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Atribuídas a mim</p>
            <h2>Em andamento</h2>
          </div>
          <UserCheck size={20} />
        </div>
        {assignedToMe.length ? (
          <div className="people-list">
            {assignedToMe.map((req: Requisition) => (
              <div className="person-row" key={req.id}>
                <div className="avatar">{req.number?.[0] ?? 'R'}</div>
                <div>
                  <strong>{req.number ?? req.id.slice(0, 8)}</strong>
                  <span>{req.description?.slice(0, 60) ?? 'Sem descrição'}</span>
                </div>
                <span className={`status-badge ${req.status ?? 'aberta'}`}>{statusLabels[req.status ?? 'aberta']}</span>
                {req.status !== 'concluida' && req.status !== 'cancelada' && (
                  <button className="secondary-button compact" onClick={() => setSelectedId(req.id)}>
                    Registrar execução
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ClipboardList size={23} />
            <strong>Nenhuma solicitação atribuída</strong>
            <span>Assuma uma solicitação disponível abaixo.</span>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Disponíveis</p>
            <h2>Aguardando atendimento</h2>
          </div>
        </div>
        {available.length ? (
          <div className="people-list">
            {available.map((req: Requisition) => (
              <div className="person-row" key={req.id}>
                <div className="avatar">{req.number?.[0] ?? 'R'}</div>
                <div>
                  <strong>{req.number ?? req.id.slice(0, 8)}</strong>
                  <span>{req.description?.slice(0, 60) ?? 'Sem descrição'}</span>
                </div>
                <button
                  className="primary-button compact"
                  disabled={assignMutation.isPending}
                  onClick={() => assignMutation.mutate(req.id)}
                >
                  Assumir
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <CheckCircle size={23} />
            <strong>Nenhuma solicitação disponível</strong>
            <span>Todas as solicitações foram atribuídas.</span>
          </div>
        )}
      </section>
    </div>

    {selectedId && (
      <section className="panel" style={{ marginTop: '17px' }}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Registrar execução</p>
            <h2>Concluir solicitação</h2>
          </div>
        </div>
        <form className="admin-form" onSubmit={(e) => { e.preventDefault(); executeMutation.mutate(selectedId); }}>
          <label>Descrição da execução
            <textarea
              required
              rows={3}
              value={executionForm.executionDescription}
              onChange={(event) => setExecutionForm({ ...executionForm, executionDescription: event.target.value })}
              placeholder="Descreva o trabalho realizado..."
            />
          </label>
          <label>Materiais utilizados
            <textarea
              rows={2}
              value={executionForm.materialsUsed}
              onChange={(event) => setExecutionForm({ ...executionForm, materialsUsed: event.target.value })}
              placeholder="Liste os materiais utilizados..."
            />
          </label>
          <label>Observações
            <textarea
              rows={2}
              value={executionForm.observations}
              onChange={(event) => setExecutionForm({ ...executionForm, observations: event.target.value })}
              placeholder="Observações adicionais..."
            />
          </label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button className="primary-button" disabled={executeMutation.isPending}>
              {executeMutation.isPending ? 'Salvando...' : 'Concluir solicitação'}
            </button>
            <button type="button" className="secondary-button" onClick={() => setSelectedId(null)}>
              Cancelar
            </button>
          </div>
        </form>
      </section>
    )}
  </>;
}
