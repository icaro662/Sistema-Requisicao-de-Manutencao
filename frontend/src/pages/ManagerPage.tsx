import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BarChart3, ClipboardList, Filter, Users } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { maintenanceService } from '../services/maintenanceService';
import { useToast } from '../components/Toast';
import type { Category, DashboardFilters, Location, Requisition, RequisitionPriority, RequisitionStatus, User } from '../types';

const statusLabels: Record<RequisitionStatus, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_material: 'Aguardando material',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const priorityOptions: Array<{ value: RequisitionPriority; label: string }> = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

export default function ManagerPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ from: '', to: '', locationId: '', executorId: '', categoryId: '', priority: '', status: '' });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const panelFilters = toDashboardFilters(appliedFilters);

  const requisitionsQuery = useQuery({
    queryKey: ['requisitions', 'manager', appliedFilters],
    queryFn: () => maintenanceService.requisitions(panelFilters),
  });

  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'manager', appliedFilters],
    queryFn: () => maintenanceService.dashboard(panelFilters),
  });

  const locationsQuery = useQuery({ queryKey: ['locations'], queryFn: maintenanceService.locations });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: maintenanceService.categories });

  const executorsQuery = useQuery({
    queryKey: ['executors'],
    queryFn: maintenanceService.executors,
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, executorId }: { id: string; executorId: string }) =>
      maintenanceService.assignExecutor(id, executorId),
    onSuccess: () => {
      showToast('Executor atribuído com sucesso!', 'success');
      setSelectedId(null);
      void queryClient.invalidateQueries({ queryKey: ['requisitions'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    onError: (reason) => showToast(apiErrorMessage(reason)),
  });

  const requisitions = requisitionsQuery.data?.data ?? [];
  const executors = executorsQuery.data ?? [];
  const unassigned = requisitions.filter((r: Requisition) => !r.executorId && r.status === 'aberta');
  const inProgress = requisitions.filter((r: Requisition) => r.executorId && r.status !== 'concluida' && r.status !== 'cancelada');
  const metrics = dashboardQuery.data?.byStatus ?? {};

  const submitFilters = (event: React.FormEvent) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const empty = { from: '', to: '', locationId: '', executorId: '', categoryId: '', priority: '', status: '' };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Painel do gestor</p>
        <h1>Gerenciar solicitações</h1>
      </div>
    </div>

    <form className="toolbar report-toolbar" onSubmit={submitFilters}>
      <div className="report-fields">
        <label className="report-field">
          <span>Data inicial</span>
          <input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} />
        </label>
        <label className="report-field">
          <span>Data final</span>
          <input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} />
        </label>
        <label className="report-field">
          <span>Local</span>
          <select value={filters.locationId} onChange={(event) => setFilters({ ...filters, locationId: event.target.value })}><option value="">Todos</option>{locationsQuery.data?.map((item: Location) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        </label>
        <label className="report-field">
          <span>Executor</span>
          <select value={filters.executorId} onChange={(event) => setFilters({ ...filters, executorId: event.target.value })}><option value="">Todos</option>{executorsQuery.data?.map((item: User) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        </label>
        <label className="report-field">
          <span>Categoria</span>
          <select value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}><option value="">Todas</option>{categoriesQuery.data?.map((item: Category) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        </label>
        <label className="report-field">
          <span>Prioridade</span>
          <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })}><option value="">Todas</option>{priorityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
        </label>
        <label className="report-field">
          <span>Status</span>
          <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">Todos</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
        </label>
      </div>

      <div className="report-filter-actions">
        <button className="primary-button compact" type="submit"><Filter size={15} /> Aplicar filtros</button>
        <button className="secondary-button compact" type="button" onClick={clearFilters}>Limpar</button>
      </div>
    </form>

    <div className="metric-grid">
      <div className="metric-card">
        <div className="metric-icon blue"><ClipboardList size={19} /></div>
        <div>
          <span>Abertas</span>
          <strong>{metrics.aberta ?? 0}</strong>
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-icon gold"><Users size={19} /></div>
        <div>
          <span>Em atendimento</span>
          <strong>{metrics.em_atendimento ?? 0}</strong>
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-icon mint"><BarChart3 size={19} /></div>
        <div>
          <span>Aguardando material</span>
          <strong>{metrics.aguardando_material ?? 0}</strong>
        </div>
      </div>
      <div className="metric-card"><div className="metric-icon rose"><BarChart3 size={19} /></div><div><span>Concluídas</span><strong>{metrics.concluida ?? 0}</strong></div></div>
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

type ManagerFilterState = { from: string; to: string; locationId: string; executorId: string; categoryId: string; priority: string; status: string };

function toDashboardFilters(filters: ManagerFilterState): DashboardFilters {
  return {
    from: filters.from ? `${filters.from}T00:00:00.000Z` : undefined,
    to: filters.to ? `${filters.to}T23:59:59.999Z` : undefined,
    locationId: filters.locationId || undefined,
    executorId: filters.executorId || undefined,
    categoryId: filters.categoryId || undefined,
    priority: filters.priority as RequisitionPriority || undefined,
    status: filters.status as RequisitionStatus || undefined,
  };
}
