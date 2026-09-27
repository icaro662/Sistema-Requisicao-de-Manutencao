import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Search } from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import { useAuthStore } from '../store/authStore';
import type { Requisition, RequisitionStatus } from '../types';

const statusLabels: Record<RequisitionStatus, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_material: 'Aguardando material',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export default function MyRequisitionsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [search, setSearch] = useState('');

  const query = useQuery({
    queryKey: ['requisitions', 'my', search],
    queryFn: () => maintenanceService.requisitions(search ? { search } : undefined),
  });

  const requisitions = query.data?.data ?? [];

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Minhas solicitações</p>
        <h1>Acompanhar requisições</h1>
      </div>
    </div>

    <div className="toolbar">
      <div className="search-field">
        <span>⌕</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por descrição ou número..."
        />
      </div>
      <span className="result-count">{query.data?.total ?? 0} solicitações</span>
    </div>

    <section className="panel table-panel">
      {requisitions.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Prioridade</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map((req: Requisition) => (
                <tr key={req.id}>
                  <td>{req.number ?? req.id.slice(0, 8)}</td>
                  <td>{req.description ?? '—'}</td>
                  <td><span className={`status-badge ${req.status ?? 'aberta'}`}>{statusLabels[req.status ?? 'aberta']}</span></td>
                  <td><span className={`priority ${req.priority ?? 'media'}`}>{req.priority ?? '—'}</span></td>
                  <td>{req.createdAt ? new Date(req.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <ClipboardList size={23} />
          <strong>Nenhuma solicitação encontrada</strong>
          <span>Suas requisições criadas aparecerão aqui.</span>
        </div>
      )}
    </section>
  </>;
}
