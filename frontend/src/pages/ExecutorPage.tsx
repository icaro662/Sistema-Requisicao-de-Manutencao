import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Filter, Wrench } from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import { useAuthStore } from '../store/authStore';
import { statusLabels, statusOptions, getStatusColor } from '../utils/status';
import type { Requisition, RequisitionPriority } from '../types';

const priorityLabels: Record<RequisitionPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

const priorityOptions = Object.keys(priorityLabels) as RequisitionPriority[];

const activeStatuses = statusOptions.filter(
  (status) => status !== 'concluida' && status !== 'cancelada',
);

export default function ExecutorPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedLocation, setSelectedLocation] = useState<string>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedPriority, setSelectedPriority] = useState<string>('todos');

  const query = useQuery({
    queryKey: ['requisitions', 'executor'],
    queryFn: () => maintenanceService.requisitions(),
  });

  const locationsQuery = useQuery({
    queryKey: ['locations'],
    queryFn: maintenanceService.locations,
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: maintenanceService.categories,
  });

  const locations = locationsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const locationName = (id?: string) =>
    locations.find((location) => location.id === id)?.name ?? '—';
  const categoryName = (id?: string) =>
    categories.find((category) => category.id === id)?.name ?? '—';

  const requisitions = query.data?.data ?? [];

  const matchesFilters = (row: Requisition): boolean => {
    const normalizedSearch = search.trim().toLowerCase();

    const matchesSearch =
      normalizedSearch === '' ||
      row.number?.toLowerCase().includes(normalizedSearch) ||
      row.description?.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      selectedStatus === 'todos' || row.status === selectedStatus;

    const matchesLocation =
      selectedLocation === 'todos' || row.locationId === selectedLocation;

    const matchesCategory =
      selectedCategory === 'todos' || row.categoryId === selectedCategory;

    const matchesPriority =
      selectedPriority === 'todos' || row.priority === selectedPriority;

    return Boolean(matchesSearch) && matchesStatus && matchesLocation && matchesCategory && matchesPriority;
  };

  const assignedToMe = requisitions.filter(
    (row: Requisition) =>
      row.executorId === currentUser?.id &&
      row.status !== 'concluida' &&
      row.status !== 'cancelada' &&
      matchesFilters(row),
  );

  const available = requisitions.filter(
    (row: Requisition) => !row.executorId && row.status === 'aberta' && matchesFilters(row),
  );

  const selectStyle = {
    padding: '7px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500 as const,
    background: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
    cursor: 'pointer',
  };

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Painel do executor</p>
        <h1>Minhas atribuições</h1>
      </div>
    </div>

    <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div className="search-field" style={{ flex: 1, maxWidth: '400px' }}>
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pesquisar por número ou descrição..."
          />
        </div>
        <span className="result-count">{assignedToMe.length} solicitações</span>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#4b5563', marginRight: '4px' }}>
          <Filter size={14} />
          Filtrar por:
        </span>

        <select value={selectedLocation} onChange={(event) => setSelectedLocation(event.target.value)} style={selectStyle}>
          <option value="todos">Todos os locais</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>{location.name}</option>
          ))}
        </select>

        <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} style={selectStyle}>
          <option value="todos">Todas as categorias</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>

        <select value={selectedPriority} onChange={(event) => setSelectedPriority(event.target.value)} style={selectStyle}>
          <option value="todos">Todas as prioridades</option>
          {priorityOptions.map((priority) => (
            <option key={priority} value={priority}>{priorityLabels[priority]}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setSelectedStatus('todos')}
          style={{
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            background: selectedStatus === 'todos' ? '#111827' : '#f3f4f6',
            color: selectedStatus === 'todos' ? '#fff' : '#374151',
            border: '1px solid #d1d5db',
            cursor: 'pointer',
          }}
        >
          Todos
        </button>

        {activeStatuses.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setSelectedStatus(status)}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              background: selectedStatus === status ? getStatusColor(status) : '#f3f4f6',
              color: '#111827',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
            }}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>
    </div>

    <div className="content-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Atribuídas a mim</p>
            <h2>Em andamento</h2>
          </div>
          <Wrench size={20} />
        </div>

        {assignedToMe.length ? (
          <div className="people-list">
            {assignedToMe.map((req: Requisition) => (
              <div className="person-row" key={req.id}>
                <div className="avatar">{req.number?.[0] ?? 'R'}</div>
                <div>
                  <strong>{req.number ?? req.id.slice(0, 8)}</strong>
                  <span>{req.description?.slice(0, 60) ?? 'Sem descrição'}</span>
                  <span>{locationName(req.locationId)} · {categoryName(req.categoryId)}</span>
                </div>
                <span className={`priority ${req.priority ?? 'media'}`}>{priorityLabels[req.priority ?? 'media']}</span>
                <span className={`status-badge ${req.status ?? 'aberta'}`}>{statusLabels[req.status ?? 'aberta']}</span>
                <Link to={`/executor/requisicoes/${req.id}`} className="secondary-button compact">
                  Ver detalhes
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ClipboardList size={23} />
            <strong>Nenhuma solicitação atribuída</strong>
            <span>Assuma uma solicitação.</span>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Fila de atendimento</p>
            <h2>Disponíveis para assumir</h2>
          </div>
          <ClipboardList size={20} />
        </div>

        {available.length ? (
          <div className="people-list">
            {available.map((req: Requisition) => (
              <div className="person-row" key={req.id}>
                <div className="avatar">{req.number?.[0] ?? 'R'}</div>
                <div>
                  <strong>{req.number ?? req.id.slice(0, 8)}</strong>
                  <span>{req.description?.slice(0, 60) ?? 'Sem descrição'}</span>
                  <span>{locationName(req.locationId)} · {categoryName(req.categoryId)}</span>
                </div>
                <span className={`priority ${req.priority ?? 'media'}`}>{priorityLabels[req.priority ?? 'media']}</span>
                <span className={`status-badge ${req.status ?? 'aberta'}`}>{statusLabels[req.status ?? 'aberta']}</span>
                <Link to={`/executor/requisicoes/${req.id}`} className="secondary-button compact">
                  Ver detalhes
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ClipboardList size={23} />
            <strong>Nenhuma solicitação disponível</strong>
            <span>Novas solicitações aparecerão aqui.</span>
          </div>
        )}
      </section>
    </div>
  </>;
}
