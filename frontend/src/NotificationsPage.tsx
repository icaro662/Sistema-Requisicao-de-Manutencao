import { useQuery } from '@tanstack/react-query';
import { Bell, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { maintenanceService } from './services/maintenanceService';
import type { Notification, RequisitionStatus } from './types';

const statusIcons: Record<RequisitionStatus, React.ReactNode> = {
  aberta: <Clock size={16} />,
  em_analise: <AlertCircle size={16} />,
  em_atendimento: <AlertCircle size={16} />,
  aguardando_material: <Clock size={16} />,
  concluida: <CheckCircle size={16} />,
  cancelada: <AlertCircle size={16} />,
};

export default function NotificationsPage() {
  const query = useQuery({
    queryKey: ['notifications'],
    queryFn: maintenanceService.notifications,
  });

  const notifications = query.data ?? [];

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Notificações</p>
        <h1>Acompanhamento</h1>
      </div>
    </div>

    <section className="panel">
      {notifications.length ? (
        <div className="people-list">
          {notifications.map((notification: Notification) => (
            <div className="person-row" key={notification.id}>
              <div className="metric-icon blue">{statusIcons[notification.status]}</div>
              <div>
                <strong>{notification.requisitionNumber || notification.requisitionId.slice(0, 8)}</strong>
                <span>{notification.message}</span>
              </div>
              <span className={`status-badge ${notification.status}`}>
                {notification.status.replace(/_/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Bell size={23} />
          <strong>Nenhuma notificação</strong>
          <span>Você receberá notificações sobre suas solicitações aqui.</span>
        </div>
      )}
    </section>
  </>;
}
