import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  RefreshCw,
  AlertCircle,
  Activity,
  ShieldCheck,
  ArrowUpRight,
  ClipboardList,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { maintenanceService } from '../services/maintenanceService';
import PageHeading from '../components/PageHeading';
import Metric from '../components/Metric';
import { statusLabels, statusOptions, getStatusColor } from '../utils/status';
import RequisitionTable from '../components/RequisitionTable';
import type { Requisition, RequisitionStatus } from '../types';

export default function Dashboard() {
  const currentUser = useAuthStore((state) => state.user);
  const role = currentUser?.role;
  const navigate = useNavigate();

  // Redirect based on role — / is admin-only
  useEffect(() => {
    if (!role) return;
    if (role === 'executor') { navigate('/executor'); }
    else if (role === 'gestor') { navigate('/manager'); }
    else if (role === 'solicitante') { navigate('/my-requisitions'); }
  }, [role, navigate]);

  // Only admin reaches this point
  const summary = useQuery({ queryKey: ['dashboard'], queryFn: () => maintenanceService.dashboard() });
  const requisitions = useQuery({ queryKey: ['requisitions'], queryFn: () => maintenanceService.requisitions() });
  const data = summary.data;

  return (
    <>
      <PageHeading
        eyebrow="Visão geral"
        title="Bom dia, operador."
        action={
          <button className="secondary-button" onClick={() => { void summary.refetch(); void requisitions.refetch(); }}>
            <RefreshCw size={16} /> Atualizar
          </button>
        }
      />
      <section className="metric-grid">
        <Metric label="Todas as solicitações" value={data?.total ?? 0} icon={<ClipboardList />} tone="blue" />
        <Metric label="Abertas" value={data?.byStatus?.aberta ?? 0} icon={<Activity />} tone="mint" />
        <Metric label="Em atendimento" value={data?.byStatus?.em_atendimento ?? 0} icon={<ArrowUpRight />} tone="gold" />
        <Metric label="Concluídas" value={data?.byStatus?.concluida ?? 0} icon={<ShieldCheck />} tone="rose" />
      </section>
      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Atividade recente</p>
              <h2>Últimas requisições</h2>
            </div>
            <NavLink className="text-link" to="/requisitions">Ver todas <ArrowUpRight size={15} /></NavLink>
          </div>
          <RequisitionTable />
        </section>
        <section className="panel status-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Distribuição</p>
              <h2>Por status</h2>
            </div>
          </div>
          {statusOptions.map((status) => (
            <div className="status-row" key={status}>
              <span className={`status-dot ${status}`} />
              <span>{statusLabels[status]}</span>
              <strong>{data?.byStatus?.[status] ?? 0}</strong>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

function SolicitanteDashboard() {
  const query = useQuery({ queryKey: ['requisitions', 'my'], queryFn: () => maintenanceService.requisitions() });
  const requisitions = query.data?.data ?? [];

  const myOpen = requisitions.filter((request: Requisition) => request.status === 'aberta' || request.status === 'em_analise' || request.status === 'em_atendimento');
  const myCompleted = requisitions.filter((request: Requisition) => request.status === 'concluida' || request.status === 'cancelada');

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Portal do solicitante</p>
          <h1>Como podemos ajudar?</h1>
        </div>
      </div>
      <div className="requester-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Em andamento</p>
              <h2>Suas requisições ativas</h2>
            </div>
            <NavLink className="text-link" to="/my-requisitions">Ver todas <ArrowUpRight size={15} /></NavLink>
          </div>
          {myOpen.length ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Número</th><th>Descrição</th><th>Status</th><th>Prioridade</th></tr></thead>
                <tbody>
                  {myOpen.map((request: Requisition) => (
                    <tr key={request.id}>
                      <td>{request.number ?? request.id.slice(0, 8)}</td>
                      <td>{request.description?.slice(0, 60) ?? '—'}</td>
                      <td><span className={`status-badge ${request.status ?? 'aberta'}`}>{statusLabels[request.status ?? 'aberta']}</span></td>
                      <td><span className={`priority ${request.priority ?? 'media'}`}>{request.priority ?? '—'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <ClipboardList size={23} />
              <strong>Nenhuma requisição ativa</strong>
              <span>As solicitações abertas pelos solicitantes aparecerão aqui.</span>
            </div>
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Histórico</p>
              <h2>Concluídas e canceladas</h2>
            </div>
          </div>
          {myCompleted.length ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Número</th><th>Descrição</th><th>Status</th><th>Data</th></tr></thead>
                <tbody>
                  {myCompleted.map((request: Requisition) => (
                    <tr key={request.id}>
                      <td>{request.number ?? request.id.slice(0, 8)}</td>
                      <td>{request.description?.slice(0, 60) ?? '—'}</td>
                      <td><span className={`status-badge ${request.status ?? 'concluida'}`}>{statusLabels[request.status ?? 'concluida']}</span></td>
                      <td>{request.updatedAt ? new Date(request.updatedAt).toLocaleDateString('pt-BR') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <ShieldCheck size={23} />
              <strong>Sem histórico</strong>
              <span>Requisições concluídas aparecerão aqui.</span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
