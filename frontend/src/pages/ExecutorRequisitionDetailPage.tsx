import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Camera, ClipboardList, History, UserCheck, Wrench } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { maintenanceService } from '../services/maintenanceService';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/Toast';
import BeforeAfterPhotos from '../components/BeforeAfterPhotos';
import HistoryTimeline from '../components/HistoryTimeline';
import type { RequisitionStatus, RequestMaterial } from '../types';

const statusLabels: Record<RequisitionStatus, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_material: 'Aguardando material',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export default function ExecutorRequisitionDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const { showToast } = useToast();
  const [error, setError] = useState('');
  const [newMaterial, setNewMaterial] = useState({ materialsNeeded: '', reason: '' });

  const requisitionQuery = useQuery({
    queryKey: ['requisition', id],
    queryFn: () => maintenanceService.requisition(id),
  });

  const historyQuery = useQuery({
    queryKey: ['execution-history', id],
    queryFn: () => maintenanceService.executionHistory(id),
  });

  const changeHistoryQuery = useQuery({
    queryKey: ['requisition-history', id],
    queryFn: () => maintenanceService.requisitionHistory(id),
    enabled: Boolean(id),
  });

  const materialsQuery = useQuery({
    queryKey: ['materials', id],
    queryFn: () => maintenanceService.requestMaterials(id),
  });

  const locationsQuery = useQuery({ queryKey: ['locations'], queryFn: maintenanceService.locations });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: maintenanceService.categories });

  const [executionForm, setExecutionForm] = useState({
    executionDescription: '',
    materialsUsed: '',
    observations: '',
    photoUrl: '',
  });

  const invalidateRequisition = () => {
    void queryClient.invalidateQueries({ queryKey: ['requisition', id] });
    void queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    void queryClient.invalidateQueries({ queryKey: ['execution-history', id] });
    void queryClient.invalidateQueries({ queryKey: ['requisition-history', id] });
    void queryClient.invalidateQueries({ queryKey: ['executions'] });
  };

  const assignMutation = useMutation({
    mutationFn: () => maintenanceService.selfAssign(id),
    onSuccess: () => {
      setError('');
      invalidateRequisition();
    },
    onError: (reason) => setError(apiErrorMessage(reason)),
  });

  const executeMutation = useMutation({
    mutationFn: () => maintenanceService.registerExecution(id, executionForm),
    onSuccess: () => {
      setError('');
      invalidateRequisition();
      navigate('/executor');
    },
    onError: (reason) => setError(apiErrorMessage(reason)),
  });

  const photoMutation = useMutation({
    mutationFn: (file: File) => maintenanceService.uploadPhoto(file),
    onSuccess: (data) => {
      setExecutionForm((prev) => ({ ...prev, photoUrl: data.path }));
    },
    onError: (reason) => setError(apiErrorMessage(reason)),
  });

  const createMaterialMutation = useMutation({
    mutationFn: () => maintenanceService.createRequestMaterial(id, newMaterial),
    onSuccess: () => {
      setNewMaterial({ materialsNeeded: '', reason: '' });
      showToast('Material adicionado com sucesso!', 'success');
      void queryClient.invalidateQueries({ queryKey: ['materials', id] });
    },
    onError: (reason) => showToast(apiErrorMessage(reason)),
  });

  const requisition = requisitionQuery.data;
  const history = historyQuery.data ?? [];
  const materials = materialsQuery.data ?? [];
  const changeHistory = changeHistoryQuery.data ?? [];
  const locations = locationsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  if (requisitionQuery.isLoading) {
    return <div className="empty-state"><p>Carregando requisição...</p></div>;
  }

  if (!requisition) {
    return <div className="empty-state">Requisição não encontrada.</div>;
  }

  const locationName = (locationId?: string) =>
    locations.find((location) => location.id === locationId)?.name ?? locationId ?? 'Não informado';
  const categoryName = (categoryId?: string) =>
    categories.find((category) => category.id === categoryId)?.name ?? categoryId ?? 'Não informada';

  const isAssignedToMe = requisition.executorId === currentUser?.id;
  const isAvailable = !requisition.executorId && requisition.status === 'aberta';
  const isCompleted = requisition.status === 'concluida' || requisition.status === 'cancelada';
  const beforePhoto = requisition.photoUrl;
  const afterPhoto = history.find((record) => Boolean(record.photoUrl))?.photoUrl;

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Painel do executor</p>
        <h1>{requisition.number ?? 'Requisição'}</h1>
      </div>
      <Link to="/executor" className="secondary-button"><ArrowLeft size={16} /> Voltar</Link>
    </div>

    {error && <p className="form-error">{error}</p>}

    <div className="detail-stack">
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
          <div>
            <dt>Solicitante</dt>
            <dd>{requisition.requesterEmail ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt>Telefone</dt>
            <dd>{requisition.requesterPhone ?? 'Não informado'}</dd>
          </div>
          <div>
            <dt>Local</dt>
            <dd>{locationName(requisition.locationId)}</dd>
          </div>
          <div>
            <dt>Categoria</dt>
            <dd>{categoryName(requisition.categoryId)}</dd>
          </div>
        </dl>

        <BeforeAfterPhotos beforeUrl={beforePhoto} afterUrl={afterPhoto} />

        {requisition.executionDescription && (
          <div style={{ marginTop: '24px' }}>
            <p className="eyebrow" style={{ marginBottom: '8px' }}>Última execução registrada</p>
            <p style={{ color: 'var(--ink)', fontSize: '14px', lineHeight: 1.6 }}>
              {requisition.executionDescription}
            </p>
            {requisition.materialsUsed && (
              <p style={{ color: 'var(--muted)', fontSize: '13px', marginTop: '8px' }}>
                <strong>Materiais:</strong> {requisition.materialsUsed}
              </p>
            )}
          </div>
        )}

        <div className="detail-subsection">
          <div className="detail-subsection-head">
            <div>
              <p className="eyebrow">Histórico</p>
              <h3>Linha do tempo das alterações</h3>
            </div>
            <History size={18} />
          </div>
          <HistoryTimeline
            entries={changeHistory}
            isLoading={changeHistoryQuery.isLoading}
            emptyMessage="Nenhuma alteração registrada nesta requisição."
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Ação do executor</p>
            <h2>Atendimento</h2>
          </div>
          <Wrench size={20} />
        </div>

        {isAvailable && (
          <div style={{ padding: '0 24px 24px' }}>
            <p className="muted" style={{ marginBottom: '16px' }}>
              Esta solicitação ainda não foi atribuída a ninguém.
            </p>
            <button
              className="primary-button"
              disabled={assignMutation.isPending}
              onClick={() => assignMutation.mutate()}
            >
              <UserCheck size={16} /> Assumir atendimento
            </button>
          </div>
        )}

        {isAssignedToMe && !isCompleted && (
          <form className="admin-form" onSubmit={(e) => { e.preventDefault(); executeMutation.mutate(); }}>
            <label>Descrição da execução
              <textarea
                required
                rows={3}
                value={executionForm.executionDescription}
                onChange={(event) => setExecutionForm({ ...executionForm, executionDescription: event.target.value })}
                placeholder="Ex: Realizada substituição da tomada danificada."
              />
            </label>
            <label>Materiais utilizados
              <textarea
                rows={2}
                value={executionForm.materialsUsed}
                onChange={(event) => setExecutionForm({ ...executionForm, materialsUsed: event.target.value })}
                placeholder="Ex: 01 tomada 20A"
              />
            </label>
            <label>Observações
              <textarea
                rows={2}
                value={executionForm.observations}
                onChange={(event) => setExecutionForm({ ...executionForm, observations: event.target.value })}
                placeholder="Ex: Equipamento testado e funcionando normalmente."
              />
            </label>
            <label>Foto após manutenção
              <div className="photo-upload-area">
                {executionForm.photoUrl ? (
                  <div className="photo-preview">
                    <img src={executionForm.photoUrl} alt="Foto da execução" />
                    <button type="button" className="secondary-button compact" onClick={() => setExecutionForm({ ...executionForm, photoUrl: '' })}>
                      Remover
                    </button>
                  </div>
                ) : (
                  <label className="photo-upload-label">
                    <Camera size={24} />
                    <span>Clique para enviar uma foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) photoMutation.mutate(file);
                      }}
                    />
                  </label>
                )}
              </div>
            </label>
            <button className="primary-button" disabled={executeMutation.isPending}>
              {executeMutation.isPending ? 'Salvando...' : 'Concluir solicitação'}
            </button>
          </form>
        )}

        {isCompleted && (
          <div style={{ padding: '0 24px 24px' }}>
            <p className="muted">Esta solicitação foi concluída.</p>
            {requisition.executionDate && (
              <p style={{ fontSize: '13px', marginTop: '8px' }}>
                <strong>Data:</strong> {new Date(requisition.executionDate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        )}

        {requisition.executorId && (
          <div style={{ padding: '0 24px 24px', borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '16px' }}>
            <p className="eyebrow" style={{ marginBottom: '8px' }}>Materiais</p>
            <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>Adicionar material</h3>
            <form className="admin-form" onSubmit={(e) => {
              e.preventDefault();
              if (!newMaterial.materialsNeeded.trim()) return;
              createMaterialMutation.mutate();
            }}>
              <label>Material necessário
                <textarea
                  required
                  rows={2}
                  value={newMaterial.materialsNeeded}
                  onChange={(event) => setNewMaterial({ ...newMaterial, materialsNeeded: event.target.value })}
                  placeholder="Ex: 01 tomada 20A"
                />
              </label>
              <label>Motivo
                <textarea
                  rows={2}
                  value={newMaterial.reason}
                  onChange={(event) => setNewMaterial({ ...newMaterial, reason: event.target.value })}
                  placeholder="Motivo da necessidade"
                />
              </label>
              <button className="secondary-button" disabled={createMaterialMutation.isPending || !newMaterial.materialsNeeded.trim()}>
                {createMaterialMutation.isPending ? 'Adicionando...' : 'Adicionar material'}
              </button>
            </form>
            {materials.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <p className="eyebrow" style={{ marginBottom: '8px' }}>Materiais da requisição</p>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {materials.map((m: RequestMaterial) => (
                    <li key={m.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                      <strong>{m.materialsNeeded}</strong>
                      {m.reason && <span style={{ color: 'var(--muted)', marginLeft: '8px' }}>{m.reason}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </div>

    {history.length > 0 && (
      <section className="panel" style={{ marginTop: '17px' }}>
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Histórico de execução</p>
            <h2>Registros anteriores</h2>
          </div>
          <ClipboardList size={20} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Executor</th>
                <th>Descrição</th>
                <th>Materiais</th>
              </tr>
            </thead>
            <tbody>
              {history.map((record) => (
                <tr key={record.id}>
                  <td>{new Date(record.serviceDate).toLocaleDateString('pt-BR')}</td>
                  <td>{record.executorName}</td>
                  <td>{record.executionDescription.slice(0, 50)}</td>
                  <td>{record.materialsUsed?.slice(0, 30) ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    )}
  </>;
}
