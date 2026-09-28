import { useEffect, useState } from 'react';
import { Link, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  ClipboardList,
  LogOut,
  MapPin,
  Menu,
  ScrollText,
  Settings,
  Tag,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import RoleRoute from '../components/RoleRoute';
import NotificationsBell from '../components/NotificationsBell';
import Dashboard from '../pages/Dashboard';
import Requisitions from '../pages/Requisitions';
import RequisitionDetail from '../pages/RequisitionDetailPage';
import MyRequisitions from '../pages/MyRequisitions';
import CreateRequisitionPage from '../pages/CreateRequisitionPage';
import ExecutorPage from '../pages/ExecutorPage';
import ExecutorExecutionsPage from '../pages/ExecutorExecutionsPage';
import ExecutorRequisitionDetailPage from '../pages/ExecutorRequisitionDetailPage';
import ManagerPage from '../pages/ManagerPage';
import ReferencePage from '../pages/ReferencePage';
import AdminUsersPage from '../pages/AdminUsersPage';
import ReportsPage from '../pages/ReportsPage';
import LocationAdminPage from '../pages/LocationAdminPage';
import CategoryAdminPage from '../pages/CategoryAdminPage';
import SystemSettingsPage from '../pages/SystemSettingsPage';
import AuditoriaPage from '../pages/AuditoriaPage';
import NotificacoesPage from '../pages/NotificacoesPage';

const formatTopbarDate = () =>
  new Date().toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export default function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [today, setToday] = useState(formatTopbarDate);

  useEffect(() => {
    const timer = setInterval(() => setToday(formatTopbarDate()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const signOut = useAuthStore((state) => state.signOut);
  const sessionEmail = useAuthStore((state) => state.sessionEmail);
  const currentUser = useAuthStore((state) => state.user);

  const role = currentUser?.role;

  const allNavItems = [
    { to: '/', label: 'Visão geral', icon: BarChart3, roles: ['admin'] },
    { to: '/requisitions', label: 'Requisições', icon: ClipboardList, roles: ['executor', 'gestor', 'admin'] },
    { to: '/my-requisitions', label: 'Minhas solicitações', icon: ClipboardList, roles: ['solicitante'] },
    { to: '/create-requisition', label: 'Nova requisição', icon: ClipboardList, roles: ['solicitante'] },
    { to: '/executor', label: 'Painel do executor', icon: Wrench, roles: ['executor'] },
    { to: '/executor/execucoes', label: 'Histórico de execuções', icon: ClipboardList, roles: ['executor'] },
    { to: '/manager', label: 'Painel do gestor', icon: Users, roles: ['gestor'] },
    { to: '/notificacoes', label: 'Notificações', icon: Bell, roles: ['gestor'] },
    { to: '/reports', label: 'Relatórios', icon: BarChart3, roles: ['gestor', 'admin'] },
    { to: '/locais', label: 'Locais', icon: MapPin, roles: ['admin'] },
    { to: '/categorias', label: 'Categorias', icon: Tag, roles: ['admin'] },
    { to: '/users', label: 'Administração', icon: Users, roles: ['admin'] },
    { to: '/auditoria', label: 'Auditoria', icon: ScrollText, roles: ['admin'] },
    { to: '/configuracoes', label: 'Configurações', icon: Settings, roles: ['admin'] },
  ];

  const navItems = role === 'executor'
    ? allNavItems.filter((item) => item.to === '/executor' || item.to === '/executor/execucoes')
    : allNavItems.filter((item) => role && item.roles.includes(role));

  const { pathname } = useLocation();

  const isNavActive = (to: string): boolean => {
    if (to === '/') return pathname === '/';
    if (to === '/executor') return pathname === '/executor' || pathname.startsWith('/executor/requisicoes');
    if (to === '/executor/execucoes') return pathname.startsWith('/executor/execucoes');
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  const handleSignOut = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await authService.logout(refreshToken).catch(() => undefined);
    }
    signOut();
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand-lockup">
            <span className="brand-mark small">M</span>
            <span>Manutenção</span>
          </div>
          <button
            className="icon-button mobile-only"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar navegação"
          >
            <X size={19} />
          </button>
        </div>
        <p className="nav-label">Área de trabalho</p>
        <nav>
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={isNavActive(to) ? 'active' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">{sessionEmail?.[0]?.toUpperCase()}</div>
          <div className="account">
            <strong>{sessionEmail?.split('@')[0]}</strong>
            <span>{sessionEmail}</span>
          </div>
          <button className="icon-button" onClick={() => void handleSignOut()} aria-label="Sair">
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      {menuOpen && (
        <button className="scrim" onClick={() => setMenuOpen(false)} aria-label="Fechar navegação" />
      )}
      <div className="content">
        <header className="topbar">
          <button
            className="icon-button mobile-only"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir navegação"
          >
            <Menu size={21} />
          </button>
          <div>
            <span className="topbar-kicker">Central de operações</span>
            <strong>{today}</strong>
          </div>
          <NotificationsBell />
        </header>
        <main className="main-content">
          <Routes>
            <Route element={<RoleRoute roles={['admin']} />}>
              <Route path="/" element={<Dashboard />} />
            </Route>
            <Route element={<RoleRoute roles={['admin', 'gestor', 'executor']} />}>
              <Route path="/requisitions" element={<Requisitions />} />
              <Route path="/requisitions/:id" element={<RequisitionDetail />} />
            </Route>
            <Route element={<RoleRoute roles={['solicitante']} />}>
              <Route path="/my-requisitions" element={<MyRequisitions />} />
              <Route path="/create-requisition" element={<CreateRequisitionPage />} />
            </Route>
            <Route element={<RoleRoute roles={['executor', 'admin', 'gestor']} />}>
              <Route path="/executor" element={<ExecutorPage />} />
              <Route path="/executor/requisicoes/:id" element={<ExecutorRequisitionDetailPage />} />
              <Route path="/executor/execucoes" element={<ExecutorExecutionsPage />} />
            </Route>
            <Route element={<RoleRoute roles={['gestor', 'admin']} />}>
              <Route path="/manager" element={<ManagerPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
            <Route element={<RoleRoute roles={['gestor']} />}>
              <Route path="/notificacoes" element={<NotificacoesPage />} />
            </Route>
            <Route path="/locations" element={<ReferencePage type="locations" />} />
            <Route path="/categories" element={<ReferencePage type="categories" />} />
            <Route element={<RoleRoute roles={['admin']} />}>
              <Route path="/locais" element={<LocationAdminPage />} />
              <Route path="/categorias" element={<CategoryAdminPage />} />
              <Route path="/users" element={<AdminUsersPage />} />
              <Route path="/auditoria" element={<AuditoriaPage />} />
              <Route path="/configuracoes" element={<SystemSettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
