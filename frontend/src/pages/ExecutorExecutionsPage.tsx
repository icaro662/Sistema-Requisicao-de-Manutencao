import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Filter } from 'lucide-react';
import PageHeading from '../components/PageHeading';
import BeforeAfterPhotos from '../components/BeforeAfterPhotos';
import { useAuthStore } from '../store/authStore';
import { maintenanceService } from '../services/maintenanceService';
import { statusLabels } from '../utils/status';
import type { ExecutionRecord, RequisitionPriority } from '../types';

const priorityLabels: Record<RequisitionPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

const priorityOptions = Object.keys(priorityLabels) as RequisitionPriority[];

export default function ExecutorExecutionsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('todos');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedPriority, setSelectedPriority] = useState('todos');

  const query = useQuery({
    queryKey: ['executions'],
    queryFn: () => maintenanceService.executions(),
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

  const records = query.data ?? [];
  const myRecords = records.filter((r: ExecutionRecord) => r.executorId === currentUser?.id);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredRecords = myRecords.filter((record: ExecutionRecord) => {
    const requisition = record.requisition;

    const matchesSearch =
      normalizedSearch === '' ||
      requisition?.number?.toLowerCase().includes(normalizedSearch) ||
      requisition?.description?.toLowerCase().includes(normalizedSearch) ||
      record.executionDescription?.toLowerCase().includes(normalizedSearch);

    const matchesLocation =
      selectedLocation === 'todos' || requisition?.locationId === selectedLocation;

    const matchesCategory =
      selectedCategory === 'todos' || requisition?.categoryId === selectedCategory;

    const matchesPriority =
      selectedPriority === 'todos' || requisition?.priority === selectedPriority;

    return Boolean(matchesSearch) && matchesLocation && matchesCategory && matchesPriority;
  });

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

  return (
    <>
      <PageHeading eyebrow="Histórico" title="Execuções passadas" />

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
          <span className="result-count">{filteredRecords.length} execuções</span>
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
      </div>

      {filteredRecords.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Requisição</th>
                <th>Descrição</th>
                <th>Local</th>
                <th>Categoria</th>
                <th>Materiais</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredRecords.flatMap((record: ExecutionRecord) => {
                const rows = [
                  <tr key={record.id} style={{ cursor: 'pointer' }} onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}>
                    <td>{new Date(record.serviceDate).toLocaleDateString('pt-BR')}</td>
                    <td>{record.requisition?.number ?? '—'}</td>
                    <td>{record.executionDescription?.slice(0, 50) ?? '—'}</td>
                    <td>{locationName(record.requisition?.locationId)}</td>
                    <td>{categoryName(record.requisition?.categoryId)}</td>
                    <td>{record.materialsUsed?.slice(0, 30) ?? '—'}</td>
                    <td><span className="status-badge concluida">{statusLabels.concluida}</span></td>
                    <td><ChevronDown size={17} style={{ transform: expandedId === record.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} /></td>
                  </tr>,
                ];
                if (expandedId === record.id) {
                  rows.push(
                    <tr key={`detail-${record.id}`}>
                      <td colSpan={8} style={{ background: '#f8f9fa', padding: 0 }}>
                        <div style={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0' }}>
                          <dl className="detail-list">
                            <div><dt>Requisição</dt><dd>{record.requisition?.number ?? '—'}</dd></div>
                            <div><dt>Descrição da requisição</dt><dd>{record.requisition?.description ?? '—'}</dd></div>
                            <div><dt>Local</dt><dd>{locationName(record.requisition?.locationId)}</dd></div>
                            <div><dt>Categoria</dt><dd>{categoryName(record.requisition?.categoryId)}</dd></div>
                            <div><dt>Prioridade</dt><dd>{priorityLabels[record.requisition?.priority ?? 'media']}</dd></div>
                            <div><dt>Data da execução</dt><dd>{new Date(record.serviceDate).toLocaleDateString('pt-BR')}</dd></div>
                          </dl>
                          {record.executionDescription && (
                            <p style={{ marginTop: '8px', fontSize: '14px', lineHeight: 1.6 }}>{record.executionDescription}</p>
                          )}
                          {record.materialsUsed && (
                            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '8px' }}><strong>Materiais:</strong> {record.materialsUsed}</p>
                          )}
                          {record.observations && (
                            <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '8px' }}><strong>Observações:</strong> {record.observations}</p>
                          )}
                          <BeforeAfterPhotos beforeUrl={record.requisition?.photoUrl} afterUrl={record.photoUrl} />
                        </div>
                      </td>
                    </tr>
                  );
                }
                return rows;
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>{myRecords.length ? 'Nenhuma execução encontrada com os filtros aplicados.' : 'Nenhuma execução registrada.'}</p>
        </div>
      )}
    </>
  );
}
