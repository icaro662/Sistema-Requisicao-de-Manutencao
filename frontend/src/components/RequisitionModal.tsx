import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { X, RefreshCw, Clock, ArrowUpRight } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { maintenanceService } from '../services/maintenanceService';
import { statusLabels, statusOptions, getStatusColor } from '../utils/status';
import type { RequisitionStatus } from '../types';

export default function RequisitionModal({
  requisitionId,
  onClose,
}: {
  requisitionId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['requisition', requisitionId],
    queryFn: () => maintenanceService.requisition(requisitionId),
  });

  const mutation = useMutation({
    mutationFn: (status: RequisitionStatus) =>
      maintenanceService.updateStatus(requisitionId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['requisition', requisitionId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['requisitions'],
      });
    },
  });

  const requisition = query.data;

  const mockHistory = [
    {
      id: 1,
      action: 'Requisição Aberta',
      date: '25/09/2026 às 10:30',
      user: 'solicitante@gmail.com',
    },
    {
      id: 2,
      action: 'Status alterado para "Em análise"',
      date: '26/09/2026 às 09:15',
      user: 'operador@gmail.com',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '750px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding: '24px',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '16px',
            marginBottom: '20px',
          }}
        >
          <div>
            <span className="eyebrow">
              Detalhes da Requisição
            </span>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              {requisition?.number ?? requisitionId}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="icon-button"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {query.isLoading ? (
          <div
            className="empty-state"
            style={{ padding: '40px' }}
          >
            <RefreshCw className="spin" size={20} />
            Carregando detalhes...
          </div>
        ) : requisition ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 280px',
              gap: '20px',
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '16px',
                }}
              >
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(
                      requisition.status,
                    ),
                    color: '#111827',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    display: 'inline-block',
                  }}
                >
                  {statusLabels[
                    requisition.status ?? 'aberta'
                  ]}
                </span>
                <span
                  className={`priority ${
                    requisition.priority ?? 'media'
                  }`}
                >
                  {requisition.priority ??
                    'Sem prioridade'}
                </span>
              </div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#1f2937',
                  marginBottom: '12px',
                }}
              >
                {requisition.description ??
                  'Descrição pendente'}
              </h3>
              <dl
                className="detail-list"
                style={{ marginBottom: '20px' }}
              >
                <div>
                  <dt>Solicitante</dt>
                  <dd>
                    {requisition.requesterEmail ??
                      'Não informado'}
                  </dd>
                </div>
                <div>
                  <dt>Telefone</dt>
                  <dd>
                    {requisition.requesterPhone ??
                      'Não informado'}
                  </dd>
                </div>
                <div>
                  <dt>Local</dt>
                  <dd>
                    {requisition.locationId ??
                      'Não atribuído'}
                  </dd>
                </div>
                <div>
                  <dt>Categoria</dt>
                  <dd>
                    {requisition.categoryId ??
                      'Não atribuída'}
                  </dd>
                </div>
              </dl>
              {requisition.photoUrl && (
                <div style={{ marginBottom: '20px' }}>
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151',
                      marginBottom: '8px',
                    }}
                  >
                    Foto do problema
                  </h4>
                  <img
                    src={requisition.photoUrl}
                    alt="Foto anexada"
                    style={{
                      maxWidth: '100%',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                    }}
                  />
                </div>
              )}
              <div>
                <h4
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Clock size={16} />
                  Histórico de atividade
                </h4>
                <ul
                  style={{
                    listStyle: 'none',
                    paddingLeft: '8px',
                    margin: 0,
                    borderLeft: '2px solid #e5e7eb',
                  }}
                >
                  {mockHistory.map(
                    (item, index) => (
                      <li
                        key={item.id}
                        style={{
                          position: 'relative',
                          paddingLeft: '20px',
                          paddingBottom:
                            index !==
                            mockHistory.length - 1
                              ? '12px'
                              : '0',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            left: '-5px',
                            top: '4px',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#9ca3af',
                          }}
                        />
                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            fontWeight: 500,
                            color: '#111827',
                          }}
                        >
                          {item.action}
                        </p>
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#6b7280',
                          }}
                        >
                          {item.date} • {item.user}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>
            <div
              style={{
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            >
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '12px',
                }}
              >
                Alterar status
              </h4>
              <div
                className="status-actions"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={
                      status === requisition.status
                        ? 'selected'
                        : ''
                    }
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate(status)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #d1d5db',
                      background:
                        status === requisition.status
                          ? '#e0f2fe'
                          : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <span
                      className={`status-dot ${status}`}
                    />
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                      }}
                    >
                      {statusLabels[status]}
                    </span>
                  </button>
                ))}
              </div>
              {mutation.isError && (
                <p
                  className="form-error"
                  style={{ marginTop: '12px' }}
                >
                  {apiErrorMessage(mutation.error)}
                </p>
              )}
              {mutation.isSuccess && (
                <p
                  style={{
                    marginTop: '12px',
                    color: '#16a34a',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                >
                  ✓ Atualizado com sucesso!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            Requisição não encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
