import { useParams } from 'react-router-dom';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { maintenanceService } from '../services/maintenanceService';
import PageHeading from '../components/PageHeading';
import { statusLabels, statusOptions } from '../utils/status';
import type { RequisitionStatus } from '../types';

export default function RequisitionDetail() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['requisition', id],
    queryFn: () => maintenanceService.requisition(id),
  });

  const mutation = useMutation({
    mutationFn: (status: RequisitionStatus) => maintenanceService.updateStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['requisition', id] });
      void queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });

  const requisition = query.data;

  return (
    <>
      <PageHeading
        eyebrow="Detalhes da requisição"
        title={requisition?.number ?? id}
        action={<a className="secondary-button" href="/requisitions">Voltar para a fila</a>}
      />
      {query.isLoading ? (
        <div className="empty-state">
          <RefreshCw className="spin" size={20} /> Carregando requisição...
        </div>
      ) : requisition ? (
        <div className="detail-grid">
          <section className="panel detail-main">
            <div className="detail-top">
              <span className={`status-badge ${requisition.status ?? 'aberta'}`}>
                {statusLabels[requisition.status ?? 'aberta']}
              </span>
              <span className={`priority ${requisition.priority ?? 'media'}`}>
                {requisition.priority ?? 'Sem prioridade'}
              </span>
            </div>
            <h2>{requisition.description ?? 'Descrição pendente'}</h2>
            <dl className="detail-list">
              <div><dt>Solicitante</dt><dd>{requisition.requesterEmail ?? 'Não informado'}</dd></div>
              <div><dt>Telefone</dt><dd>{requisition.requesterPhone ?? 'Não informado'}</dd></div>
              <div><dt>Local</dt><dd>{requisition.locationId ?? 'Não atribuído'}</dd></div>
              <div><dt>Categoria</dt><dd>{requisition.categoryId ?? 'Não atribuída'}</dd></div>
            </dl>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Fluxo de trabalho</p>
                <h2>Atualizar status</h2>
              </div>
            </div>
            <div className="status-actions">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={status === requisition.status ? 'selected' : ''}
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate(status)}
                >
                  <span className={`status-dot ${status}`} />
                  {statusLabels[status]}
                </button>
              ))}
            </div>
            {mutation.isError && (
              <p className="form-error">{apiErrorMessage(mutation.error)}</p>
            )}
            {mutation.isSuccess && (
              <p className="success-message">Status atualizado com sucesso.</p>
            )}
          </section>
        </div>
      ) : (
        <div className="empty-state">Não foi possível encontrar esta requisição.</div>
      )}
    </>
  );
}
