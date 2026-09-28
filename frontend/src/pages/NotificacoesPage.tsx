import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Bell, CheckCircle, Clock, Mail, RefreshCw } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { maintenanceService } from '../services/maintenanceService';
import { useAuthStore } from '../store/authStore';
import { loadReadIds, persistReadIds } from '../utils/notificationRead';
import { statusLabels } from '../utils/status';
import type { Communication, CommunicationChannel, CommunicationOutcome, Notification, RequisitionStatus } from '../types';

const statusIcons: Record<RequisitionStatus, React.ReactNode> = {
  aberta: <Clock size={16} />,
  em_analise: <AlertCircle size={16} />,
  em_atendimento: <AlertCircle size={16} />,
  aguardando_material: <Clock size={16} />,
  concluida: <CheckCircle size={16} />,
  cancelada: <AlertCircle size={16} />,
};

const channelLabels: Record<CommunicationChannel, string> = {
  aplicacao: 'Aplicação',
  email: 'E-mail',
};

const outcomeLabels: Record<CommunicationOutcome, string> = {
  enviado: 'Enviado',
  falha: 'Falha',
  desativado: 'Desativado',
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificacoesPage() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [readIds, setReadIds] = useState<string[]>(() => loadReadIds(currentUser?.id));

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: maintenanceService.notifications,
    refetchInterval: 60_000,
  });
  const communicationsQuery = useQuery({
    queryKey: ['communications'],
    queryFn: maintenanceService.communications,
  });

  const notifications = notificationsQuery.data ?? [];
  const communications = communicationsQuery.data ?? [];
  const unreadCount = notifications.filter((notification) => !readIds.includes(notification.id)).length;

  const rememberRead = (ids: string[]) => {
    setReadIds(ids);
    persistReadIds(currentUser?.id, ids);
  };

  const markAllAsRead = () => {
    rememberRead(Array.from(new Set([...readIds, ...notifications.map((item) => item.id)])));
  };

  const handleSelect = (notification: Notification) => {
    if (!readIds.includes(notification.id)) {
      rememberRead([...readIds, notification.id]);
    }
    if (notification.requisitionId) navigate(`/requisitions/${notification.requisitionId}`);
  };

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Gestão</p>
        <h1>Notificações</h1>
      </div>
      <Bell size={22} />
    </div>

    <div className="notif-page-grid">
      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Caixa de entrada</p>
            <h2>Notificações recebidas</h2>
          </div>
          <div className="notif-page-actions">
            {unreadCount > 0 && <span className="notif-page-unread">{unreadCount} não lida{unreadCount > 1 ? 's' : ''}</span>}
            <button
              type="button"
              className="secondary-button compact"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Marcar todas como lidas
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => void notificationsQuery.refetch()}
              aria-label="Atualizar notificações"
              disabled={notificationsQuery.isFetching}
            >
              <RefreshCw size={15} className={notificationsQuery.isFetching ? 'spin' : undefined} />
            </button>
          </div>
        </div>

        <div className="notif-page-list">
          {notificationsQuery.isLoading ? (
            <div className="empty-state"><RefreshCw className="spin" size={18} /> Carregando notificações...</div>
          ) : notificationsQuery.isError ? (
            <div className="empty-state">
              <AlertCircle size={18} />
              <strong>Não foi possível carregar</strong>
              <span>{apiErrorMessage(notificationsQuery.error)}</span>
            </div>
          ) : !notifications.length ? (
            <div className="empty-state">
              <Bell size={18} />
              <strong>Nenhuma notificação</strong>
              <span>As notificações das requisições que você gerencia aparecem aqui.</span>
            </div>
          ) : notifications.map((notification) => {
            const status = notification.status ?? 'aberta';
            const isRead = readIds.includes(notification.id);

            return (
              <button
                type="button"
                key={notification.id}
                className={`notif-item notif-page-item ${isRead ? '' : 'unread'}`}
                onClick={() => handleSelect(notification)}
              >
                <span className={`notif-item-icon ${status}`}>{statusIcons[status]}</span>
                <span className="notif-item-body">
                  <strong>{notification.message}</strong>
                  <span className="notif-meta">
                    <span className="notif-number">
                      {notification.requisitionNumber || notification.requisitionId.slice(0, 8) || 'Sistema'}
                    </span>
                    <span className={`status-badge ${status}`}>{statusLabels[status]}</span>
                    <span className="notif-date">{formatDate(notification.createdAt)}</span>
                    {!isRead && <span className="notif-dot" aria-label="Não lida" />}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Comunicações</p>
            <h2>Histórico de comunicações enviadas</h2>
          </div>
          <Mail size={20} />
        </div>

        <div className="table-wrap">
          <table className="comunicacoes-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Canal</th>
                <th>Destinatário</th>
                <th>Assunto</th>
                <th>Resultado</th>
                <th>Requisição</th>
              </tr>
            </thead>
            <tbody>
              {communicationsQuery.isLoading ? (
                <tr><td colSpan={6}>Carregando comunicações...</td></tr>
              ) : communicationsQuery.isError ? (
                <tr><td colSpan={6}>{apiErrorMessage(communicationsQuery.error)}</td></tr>
              ) : !communications.length ? (
                <tr><td colSpan={6}>Nenhuma comunicação enviada até o momento.</td></tr>
              ) : communications.map((communication: Communication) => (
                <tr key={communication.id}>
                  <td>{formatDate(communication.createdAt)}</td>
                  <td>
                    <span className={`channel-chip ${communication.channel}`}>
                      {channelLabels[communication.channel]}
                    </span>
                  </td>
                  <td>
                    {communication.recipientName}
                    {communication.recipientEmail && <small>{communication.recipientEmail}</small>}
                  </td>
                  <td>
                    {communication.subject}
                    {communication.detail && <small>{communication.detail}</small>}
                  </td>
                  <td>
                    <span className={`outcome-chip ${communication.outcome}`}>
                      {outcomeLabels[communication.outcome]}
                    </span>
                  </td>
                  <td>{communication.requisitionNumber ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </>;
}
