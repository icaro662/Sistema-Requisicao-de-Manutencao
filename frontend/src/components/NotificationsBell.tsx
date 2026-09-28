import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Bell, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { maintenanceService } from '../services/maintenanceService';
import { useAuthStore } from '../store/authStore';
import { loadReadIds, persistReadIds } from '../utils/notificationRead';
import { statusLabels } from '../utils/status';
import type { Notification, RequisitionStatus } from '../types';

const statusIcons: Record<RequisitionStatus, React.ReactNode> = {
  aberta: <Clock size={16} />,
  em_analise: <AlertCircle size={16} />,
  em_atendimento: <AlertCircle size={16} />,
  aguardando_material: <Clock size={16} />,
  concluida: <CheckCircle size={16} />,
  cancelada: <AlertCircle size={16} />,
};

function formatNotificationDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function NotificationsBell() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => loadReadIds(currentUser?.id));
  const containerRef = useRef<HTMLDivElement>(null);

  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: maintenanceService.notifications,
    refetchInterval: 60_000,
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((notification) => !readIds.includes(notification.id)).length;

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const markAllAsRead = () => {
    const updated = Array.from(new Set([...readIds, ...notifications.map((item) => item.id)]));
    setReadIds(updated);
    persistReadIds(currentUser?.id, updated);
  };

  const handleToggle = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) markAllAsRead();
  };

  const destinationFor = (notification: Notification) => {
    if (!notification.requisitionId) return null;

    switch (currentUser?.role) {
      case 'solicitante':
        return `/my-requisitions?requisition=${encodeURIComponent(notification.requisitionId)}`;
      case 'executor':
        return `/executor/requisicoes/${notification.requisitionId}`;
      default:
        return `/requisitions/${notification.requisitionId}`;
    }
  };

  const handleSelect = (notification: Notification) => {
    const destination = destinationFor(notification);
    markAllAsRead();
    setOpen(false);
    if (destination) navigate(destination);
  };

  return (
    <div className="notif-bell" ref={containerRef}>
      <button
        type="button"
        className="icon-button"
        onClick={handleToggle}
        aria-label={unreadCount ? `Notificações (${unreadCount} não lidas)` : 'Notificações'}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-head">
            <div>
              <strong>Notificações</strong>
              <span>
                {notifications.length === 1
                  ? '1 recebida'
                  : `${notifications.length} recebidas`}
              </span>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => void query.refetch()}
              aria-label="Atualizar notificações"
              disabled={query.isFetching}
            >
              <RefreshCw size={15} className={query.isFetching ? 'spin' : undefined} />
            </button>
          </div>

          <div className="notif-list">
            {query.isLoading ? (
              <div className="notif-empty">
                <RefreshCw className="spin" size={18} />
                Carregando notificações...
              </div>
            ) : query.isError ? (
              <div className="notif-empty">
                <AlertCircle size={18} />
                <strong>Não foi possível carregar</strong>
                <button type="button" className="text-link" onClick={() => void query.refetch()}>
                  Tentar novamente
                </button>
              </div>
            ) : !notifications.length ? (
              <div className="notif-empty">
                <Bell size={18} />
                <strong>Nenhuma notificação</strong>
                <span>Atualizações das suas solicitações aparecem aqui.</span>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  className="notif-item"
                  key={notification.id}
                  onClick={() => handleSelect(notification)}
                >
                  <span className={`notif-item-icon ${notification.status}`}>
                    {statusIcons[notification.status]}
                  </span>
                  <span className="notif-item-body">
                    <strong>{notification.message}</strong>
                    <span className="notif-meta">
                      <span className="notif-number">
                        {notification.requisitionNumber || notification.requisitionId.slice(0, 8)}
                      </span>
                      <span className={`status-badge ${notification.status}`}>
                        {statusLabels[notification.status]}
                      </span>
                      <span className="notif-date">
                        {formatNotificationDate(notification.createdAt)}
                      </span>
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
