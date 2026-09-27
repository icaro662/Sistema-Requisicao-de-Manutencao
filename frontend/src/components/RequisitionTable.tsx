import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Filter,
  RefreshCw,
  ClipboardList,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import { statusLabels, statusOptions, getStatusColor } from '../utils/status';
import type { Requisition } from '../types';
import RequisitionModal from './RequisitionModal';

export default function RequisitionTable() {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedRequisitionId, setSelectedRequisitionId] =
    useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const query = useQuery({
    queryKey: ['requisitions', search],
    queryFn: () =>
      maintenanceService.requisitions(
        search ? { search } : undefined,
      ),
  });

  const rawRows = query.data?.data ?? [];

  const filteredRows = rawRows.filter((row) => {
    const matchesStatus =
      selectedStatus === 'todos' ||
      row.status === selectedStatus;

    const normalizedSearch = search.toLowerCase();

    const matchesSearch =
      search === '' ||
      row.number
        ?.toLowerCase()
        .includes(normalizedSearch) ||
      row.description
        ?.toLowerCase()
        .includes(normalizedSearch) ||
      row.requesterEmail
        ?.toLowerCase()
        .includes(normalizedSearch);

    return matchesStatus && matchesSearch;
  });

  const itemsPerPage = 5;

  const totalPages =
    Math.ceil(filteredRows.length / itemsPerPage) || 1;

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * itemsPerPage;

  const currentRows = filteredRows.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <>
      <div
        className="toolbar"
        style={{
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            className="search-field"
            style={{ flex: 1, maxWidth: '400px' }}
          >
            <span>⌕</span>

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setCurrentPage(1);
              }}
              placeholder="Pesquisar por número, descrição ou requerente..."
            />
          </div>

          <span className="result-count">
            {filteredRows.length}{' '}
            solicitações
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            alignItems: 'center',
            paddingTop: '4px',
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '13px',
              color: '#4b5563',
              marginRight: '4px',
            }}
          >
            <Filter size={14} />
            Filtrar por:
          </span>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus('todos');
              setCurrentPage(1);
            }}
            style={{
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              background:
                selectedStatus === 'todos' ? '#111827' : '#f3f4f6',
              color: selectedStatus === 'todos' ? '#fff' : '#374151',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
            }}
          >
            Todos
          </button>

          {statusOptions.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setSelectedStatus(status);
                setCurrentPage(1);
              }}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                background:
                  selectedStatus === status
                    ? getStatusColor(status)
                    : '#f3f4f6',
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

      <section className="panel table-panel">
        {query.isLoading ? (
          <div className="empty-state">
            <RefreshCw className="spin" size={20} />
            Carregando solicitações...
          </div>
        ) : !filteredRows.length ? (
          <div className="empty-state">
            <ClipboardList size={23} />
            <strong>
              Nenhuma requisição encontrada
            </strong>
            <span>
              As solicitações retornadas pela API
              aparecerão aqui.
            </span>
          </div>
        ) : (
          <div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Referência</th>
                    <th>Descrição</th>
                    <th>Prioridade</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((row) => (
                    <tr
                      key={row.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        setSelectedRequisitionId(row.id)
                      }
                    >
                      <td>
                        <span
                          className="row-link"
                          style={{
                            color: '#2563eb',
                            fontWeight: 500,
                          }}
                        >
                          {row.number ??
                            row.id.slice(0, 8)}
                        </span>

                        <small>
                          {row.requesterEmail ??
                            'Solicitante não informado'}
                        </small>
                      </td>

                      <td>
                        {row.description ??
                          'Descrição pendente'}
                      </td>

                      <td>
                        <span
                          className={`priority ${
                            row.priority ?? 'media'
                          }`}
                        >
                          {row.priority ?? '—'}
                        </span>
                      </td>

                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor:
                              getStatusColor(row.status),
                            color: '#111827',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            display: 'inline-block',
                          }}
                        >
                          {statusLabels[row.status ?? 'aberta']}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="icon-button"
                          aria-label="Abrir detalhes da requisição"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedRequisitionId(row.id);
                          }}
                        >
                          <ArrowUpRight size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderTop: '1px solid #e5e7eb',
                fontSize: '13px',
                color: '#4b5563',
                gap: '12px',
                flexWrap: 'wrap',
              }}
            >
              <span>
                Mostrando{' '}
                {startIndex + 1}{' '}
                a{' '}
                {Math.min(
                  startIndex + itemsPerPage,
                  filteredRows.length,
                )}{' '}
                de{' '}
                {filteredRows.length}{' '}
                registros
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (previous) =>
                        Math.max(previous - 1, 1),
                    )
                  }
                  disabled={safeCurrentPage === 1}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background:
                      safeCurrentPage === 1 ? '#f3f4f6' : '#fff',
                    color:
                      safeCurrentPage === 1 ? '#9ca3af' : '#374151',
                    cursor:
                      safeCurrentPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft size={16} />
                  Anterior
                </button>

                <span
                  style={{ fontWeight: 500 }}
                >
                  Página{' '}
                  {safeCurrentPage}{' '}
                  de{' '}
                  {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (previous) =>
                        Math.min(
                          previous + 1,
                          totalPages,
                        ),
                    )
                  }
                  disabled={safeCurrentPage === totalPages}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    background:
                      safeCurrentPage === totalPages
                        ? '#f3f4f6'
                        : '#fff',
                    color:
                      safeCurrentPage === totalPages
                        ? '#9ca3af'
                        : '#374151',
                    cursor:
                      safeCurrentPage === totalPages
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  Próxima
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {selectedRequisitionId && (
        <RequisitionModal
          requisitionId={selectedRequisitionId}
          onClose={() => setSelectedRequisitionId(null)}
        />
      )}
    </>
  );
}
