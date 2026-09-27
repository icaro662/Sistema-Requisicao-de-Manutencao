import { FormEvent, useState, type ReactNode } from 'react';
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Database,
  Filter,
  LogOut,
  MapPin,
  Menu,
  RefreshCw,
  ShieldCheck,
  Tag,
  Users,
  Wrench,
  X,
} from 'lucide-react';

import { apiErrorMessage } from './services/api';
import { authService } from './services/authService';
import { maintenanceService } from './services/maintenanceService';
import { useAuthStore } from './store/authStore';

import AdminUsersPage from './AdminUsersPage';
import CreateRequisitionPage from './CreateRequisitionPage';
import MyRequisitionsPage from './MyRequisitionsPage';
import ExecutorPage from './ExecutorPage';
import ManagerPage from './ManagerPage';
import NotificationsPage from './NotificationsPage';
import ReportsPage from './ReportsPage';

import type {
  RegisterInput,
  Requisition,
  RequisitionStatus,
} from './types';

import {
  validateLoginForm,
  validateRegisterForm,
  type FieldError,
} from './utils/validation';

const statusLabels: Record<RequisitionStatus, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_material: 'Aguardando material',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const statusOptions = Object.keys(statusLabels) as RequisitionStatus[];

const getStatusColor = (status?: string | null) => {
  switch (status) {
    case 'concluida':
      return '#4ade80';
    case 'aberta':
      return '#facc15';
    case 'cancelada':
      return '#f87171';
    case 'em_atendimento':
      return '#60a5fa';
    case 'em_analise':
      return '#c084fc';
    case 'aguardando_material':
      return '#fb923c';
    default:
      return '#d1d5db';
  }
};

function App() {
  const authenticated = useAuthStore(
    (state) => Boolean(state.sessionEmail),
  );

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authenticated ? (
            <Navigate to="/" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/register"
        element={
          authenticated ? (
            <Navigate to="/" replace />
          ) : (
            <RegisterPage />
          )
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route path="/*" element={<Shell />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate
            to={authenticated ? '/' : '/login'}
            replace
          />
        }
      />
    </Routes>
  );
}

function ProtectedLayout() {
  const authenticated = useAuthStore(
    (state) => Boolean(state.sessionEmail),
  );

  return authenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}

function AuthAside() {
  return (
    <div className="login-aside">
      <div className="brand-mark">M</div>

      <p className="eyebrow">
        Operações de manutenção
      </p>

      <h1>
        Faça cada solicitação avançar.
      </h1>

      <p className="login-copy">
        Um espaço de trabalho para as equipes organizarem,
        encaminharem e concluírem as atividades que mantêm
        seus locais funcionando.
      </p>

      <div className="signal-list">
        <span>
          <Activity size={16} />
          Visão operacional em tempo real
        </span>

        <span>
          <ShieldCheck size={16} />
          Acesso baseado em perfil
        </span>
      </div>
    </div>
  );
}

function LoginPage() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] =
    useState<FieldError>({});

  const [serverError, setServerError] = useState('');

  const mutation = useMutation({
    mutationFn: () => authService.login(form),

    onSuccess: (result) => {
      signIn(result);
      navigate('/');
    },

    onError: (reason) => {
      setServerError(apiErrorMessage(reason));
    },
  });

  const validateField = (
    field: 'email' | 'password',
    value: string,
  ) => {
    const errors = validateLoginForm(
      field === 'email' ? value : form.email,
      field === 'password' ? value : form.password,
    );

    setFieldErrors((previous) => {
      const next = { ...previous };

      if (errors[field]) {
        next[field] = errors[field];
      } else {
        delete next[field];
      }

      return next;
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const errors = validateLoginForm(
      form.email,
      form.password,
    );

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setServerError('');
    mutation.mutate();
  };

  return (
    <main className="login-page">
      <AuthAside />

      <form
        className="login-card"
        onSubmit={submit}
        noValidate
      >
        <p className="eyebrow">
          Bem-vindo de volta
        </p>

        <h2>Entrar no sistema</h2>

        <p className="muted">
          Use suas credenciais de acesso.
        </p>

        <label>
          E-mail

          <input
            type="email"
            value={form.email}
            onChange={(event) => {
              const value = event.target.value;

              setForm({
                ...form,
                email: value,
              });

              if (fieldErrors.email) {
                validateField('email', value);
              }
            }}
            onBlur={() =>
              validateField('email', form.email)
            }
            placeholder="voce@empresa.com"
            aria-invalid={Boolean(fieldErrors.email)}
          />

          {fieldErrors.email && (
            <span className="field-error">
              {fieldErrors.email}
            </span>
          )}
        </label>

        <label>
          Senha

          <input
            type="password"
            value={form.password}
            onChange={(event) => {
              const value = event.target.value;

              setForm({
                ...form,
                password: value,
              });

              if (fieldErrors.password) {
                validateField('password', value);
              }
            }}
            onBlur={() =>
              validateField('password', form.password)
            }
            placeholder="Mínimo de 8 caracteres"
            aria-invalid={Boolean(fieldErrors.password)}
          />

          {fieldErrors.password && (
            <span className="field-error">
              {fieldErrors.password}
            </span>
          )}
        </label>

        {serverError && (
          <p className="form-error">
            {serverError}
          </p>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? 'Entrando...'
            : 'Entrar'}

          <ArrowUpRight size={17} />
        </button>

        <p className="auth-switch">
          Ainda não possui uma conta?{' '}
          <Link to="/register">
            Criar cadastro
          </Link>
        </p>
      </form>
    </main>
  );
}

function RegisterPage() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();

  const [form, setForm] =
    useState<RegisterInput>({
      name: '',
      email: '',
      password: '',
      phone: '',
    });

  const [fieldErrors, setFieldErrors] =
    useState<FieldError>({});

  const [serverError, setServerError] =
    useState('');

  const mutation = useMutation({
    mutationFn: () => authService.register(form),

    onSuccess: (result) => {
      signIn(result);
      navigate('/');
    },

    onError: (reason) => {
      setServerError(apiErrorMessage(reason));
    },
  });

  const validateField = (
    field:
      | 'name'
      | 'email'
      | 'password'
      | 'phone',
    value: string,
  ) => {
    const errors = validateRegisterForm(
      field === 'name'
        ? value
        : form.name,

      field === 'email'
        ? value
        : form.email,

      field === 'password'
        ? value
        : form.password,

      field === 'phone'
        ? value
        : form.phone ?? '',
    );

    setFieldErrors((previous) => {
      const next = { ...previous };

      if (errors[field]) {
        next[field] = errors[field];
      } else {
        delete next[field];
      }

      return next;
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();

    const errors = validateRegisterForm(
      form.name,
      form.email,
      form.password,
      form.phone ?? '',
    );

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setServerError('');
    mutation.mutate();
  };

  return (
    <main className="login-page">
      <AuthAside />

      <form
        className="login-card"
        onSubmit={submit}
        noValidate
      >
        <p className="eyebrow">
          Novo acesso
        </p>

        <h2>Criar cadastro</h2>

        <p className="muted">
          Preencha seus dados para começar.
        </p>

        <label>
          Nome

          <input
            type="text"
            value={form.name}
            onChange={(event) => {
              const value = event.target.value;

              setForm({
                ...form,
                name: value,
              });

              if (fieldErrors.name) {
                validateField('name', value);
              }
            }}
            onBlur={() =>
              validateField('name', form.name)
            }
            placeholder="Seu nome completo"
            aria-invalid={Boolean(fieldErrors.name)}
          />

          {fieldErrors.name && (
            <span className="field-error">
              {fieldErrors.name}
            </span>
          )}
        </label>

        <label>
          E-mail

          <input
            type="email"
            value={form.email}
            onChange={(event) => {
              const value = event.target.value;

              setForm({
                ...form,
                email: value,
              });

              if (fieldErrors.email) {
                validateField('email', value);
              }
            }}
            onBlur={() =>
              validateField('email', form.email)
            }
            placeholder="voce@empresa.com"
            aria-invalid={Boolean(fieldErrors.email)}
          />

          {fieldErrors.email && (
            <span className="field-error">
              {fieldErrors.email}
            </span>
          )}
        </label>

        <label>
          Telefone{' '}
          <span className="optional">
            (opcional)
          </span>

          <input
            type="tel"
            value={form.phone ?? ''}
            onChange={(event) => {
              const value = event.target.value;

              setForm({
                ...form,
                phone: value,
              });

              if (fieldErrors.phone) {
                validateField('phone', value);
              }
            }}
            onBlur={() =>
              validateField(
                'phone',
                form.phone ?? '',
              )
            }
            placeholder="(00) 00000-0000"
            aria-invalid={Boolean(fieldErrors.phone)}
          />

          {fieldErrors.phone && (
            <span className="field-error">
              {fieldErrors.phone}
            </span>
          )}
        </label>

        <label>
          Senha

          <input
            type="password"
            value={form.password}
            onChange={(event) => {
              const value = event.target.value;

              setForm({
                ...form,
                password: value,
              });

              if (fieldErrors.password) {
                validateField('password', value);
              }
            }}
            onBlur={() =>
              validateField(
                'password',
                form.password,
              )
            }
            placeholder="Mínimo de 8 caracteres"
            aria-invalid={Boolean(
              fieldErrors.password,
            )}
          />

          {fieldErrors.password && (
            <span className="field-error">
              {fieldErrors.password}
            </span>
          )}
        </label>

        {serverError && (
          <p className="form-error">
            {serverError}
          </p>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={mutation.isPending}
        >
          {mutation.isPending
            ? 'Criando cadastro...'
            : 'Criar cadastro'}

          <ArrowUpRight size={17} />
        </button>

        <p className="auth-switch">
          Já possui uma conta?{' '}
          <Link to="/login">
            Entrar
          </Link>
        </p>
      </form>
    </main>
  );
}

function Shell() {
  const [menuOpen, setMenuOpen] =
    useState(false);

  const signOut = useAuthStore(
    (state) => state.signOut,
  );

  const sessionEmail = useAuthStore(
    (state) => state.sessionEmail,
  );

  const currentUser = useAuthStore(
    (state) => state.user,
  );

  const role = currentUser?.role;

  const navItems = [
    {
      to: '/',
      label: 'Visão geral',
      icon: BarChart3,
      roles: ['executor', 'gestor', 'admin'],
    },
    {
      to: '/requisitions',
      label: 'Requisições',
      icon: ClipboardList,
      roles: ['executor', 'gestor', 'admin'],
    },
    {
      to: '/my-requisitions',
      label: 'Minhas solicitações',
      icon: ClipboardList,
      roles: ['solicitante'],
    },
    {
      to: '/create-requisition',
      label: 'Nova requisição',
      icon: ClipboardList,
      roles: ['solicitante'],
    },
    {
      to: '/executor',
      label: 'Painel do executor',
      icon: Wrench,
      roles: ['executor'],
    },
    {
      to: '/manager',
      label: 'Painel do gestor',
      icon: Users,
      roles: ['gestor', 'admin'],
    },
    {
      to: '/reports',
      label: 'Relatórios',
      icon: BarChart3,
      roles: ['gestor', 'admin'],
    },
    {
      to: '/notifications',
      label: 'Notificações',
      icon: Bell,
      roles: [
        'solicitante',
        'executor',
        'gestor',
        'admin',
      ],
    },
    {
      to: '/locations',
      label: 'Locais',
      icon: MapPin,
      roles: ['executor', 'gestor', 'admin'],
    },
    {
      to: '/categories',
      label: 'Categorias',
      icon: Tag,
      roles: ['executor', 'gestor', 'admin'],
    },
    {
      to: '/users',
      label: 'Administração',
      icon: Users,
      roles: ['admin'],
    },
  ].filter(
    (item) =>
      role &&
      item.roles.includes(role),
  );

  const handleSignOut = async () => {
    const refreshToken =
      localStorage.getItem(
        'refreshToken',
      );

    if (refreshToken) {
      await authService
        .logout(refreshToken)
        .catch(() => undefined);
    }

    signOut();
  };

  return (
    <div className="app-shell">
      <aside
        className={`sidebar ${
          menuOpen ? 'open' : ''
        }`}
      >
        <div className="sidebar-top">
          <div className="brand-lockup">
            <span className="brand-mark small">
              M
            </span>

            <span>Manutenção</span>
          </div>

          <button
            className="icon-button mobile-only"
            onClick={() =>
              setMenuOpen(false)
            }
            aria-label="Fechar navegação"
          >
            <X size={19} />
          </button>
        </div>

        <p className="nav-label">
          Área de trabalho
        </p>

        <nav>
          {navItems.map(
            ({
              to,
              label,
              icon: Icon,
            }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">
            {sessionEmail?.[0]?.toUpperCase()}
          </div>

          <div className="account">
            <strong>
              {sessionEmail?.split('@')[0]}
            </strong>

            <span>
              {sessionEmail}
            </span>
          </div>

          <button
            className="icon-button"
            onClick={() =>
              void handleSignOut()
            }
            aria-label="Sair"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="scrim"
          onClick={() =>
            setMenuOpen(false)
          }
          aria-label="Fechar navegação"
        />
      )}

      <div className="content">
        <header className="topbar">
          <button
            className="icon-button mobile-only"
            onClick={() =>
              setMenuOpen(true)
            }
            aria-label="Abrir navegação"
          >
            <Menu size={21} />
          </button>

          <div>
            <span className="topbar-kicker">
              Central de operações
            </span>

            <strong>
              26 de setembro de 2026
            </strong>
          </div>
        </header>

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/requisitions"
              element={<Requisitions />}
            />

            <Route
              path="/requisitions/:id"
              element={<RequisitionDetail />}
            />

            <Route
              path="/my-requisitions"
              element={
                <MyRequisitionsPage />
              }
            />

            <Route
              path="/create-requisition"
              element={
                <CreateRequisitionPage />
              }
            />

            <Route
              path="/executor"
              element={<ExecutorPage />}
            />

            <Route
              path="/manager"
              element={
                role === 'gestor' || role === 'admin'
                  ? <ManagerPage />
                  : <Navigate to="/" replace />
              }
            />

            <Route
              path="/reports"
              element={
                role === 'gestor' || role === 'admin'
                  ? <ReportsPage />
                  : <Navigate to="/" replace />
              }
            />

            <Route
              path="/notifications"
              element={
                <NotificationsPage />
              }
            />

            <Route
              path="/locations"
              element={
                <ReferencePage
                  type="locations"
                />
              }
            />

            <Route
              path="/categories"
              element={
                <ReferencePage
                  type="categories"
                />
              }
            />

            <Route
              path="/users"
              element={<AdminUsersPage />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">
          {eyebrow}
        </p>

        <h1>{title}</h1>
      </div>

      {action}
    </div>
  );
}

function Dashboard() {
  const currentUser = useAuthStore(
    (state) => state.user,
  );

  const isSolicitante =
    currentUser?.role === 'solicitante';

  if (isSolicitante) {
    return <SolicitanteDashboard />;
  }

  const summary = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => maintenanceService.dashboard(),
  });

  const requisitions = useQuery({
    queryKey: ['requisitions'],
    queryFn: () =>
      maintenanceService.requisitions(),
  });

  const data = summary.data;

  return (
    <>
      <PageHeading
        eyebrow="Visão geral"
        title="Bom dia, operador."
        action={
          <button
            className="secondary-button"
            onClick={() => {
              void summary.refetch();
              void requisitions.refetch();
            }}
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        }
      />

      <div className="hero-strip">
        <div>
          <span className="hero-label">
            Resumo de hoje
          </span>

          <h2>
            Mantenha o foco no trabalho
            que importa.
          </h2>

          <p>
            Acompanhe a demanda de manutenção
            e conduza cada solicitação até a
            resolução.
          </p>
        </div>

        <div className="hero-icon">
          <Activity size={31} />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          color: '#1e40af',
          fontSize: '14px',
        }}
      >
        <AlertCircle size={18} />

        <span>
          Sistema operacional a operar
          normalmente. Verifique abaixo os
          pedidos pendentes que necessitam de
          atenção.
        </span>
      </div>

      <section className="metric-grid">
        <Metric
          label="Abertas"
          value={
            data?.byStatus?.aberta ?? 0
          }
          icon={<ClipboardList />}
          tone="blue"
        />

        <Metric
          label="Em atendimento"
          value={
            data?.byStatus
              ?.em_atendimento ?? 0
          }
          icon={<ArrowUpRight />}
          tone="gold"
        />

        <Metric
          label="Aguardando material"
          value={
            data?.byStatus
              ?.aguardando_material ?? 0
          }
          icon={<Clock />}
          tone="mint"
        />

        <Metric
          label="Concluídas"
          value={
            data?.byStatus
              ?.concluida ?? 0
          }
          icon={<ShieldCheck />}
          tone="rose"
        />
      </section>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                Atividade recente
              </p>

              <h2>
                Últimas requisições
              </h2>
            </div>

            <NavLink
              className="text-link"
              to="/requisitions"
            >
              Ver todas
              <ArrowUpRight size={15} />
            </NavLink>
          </div>

          <RequisitionsTableSection />
        </section>

        <section className="panel status-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                Distribuição
              </p>

              <h2>
                Por status
              </h2>
            </div>
          </div>

          {statusOptions.map(
            (status) => (
              <div
                className="status-row"
                key={status}
              >
                <span
                  className={`status-dot ${status}`}
                />

                <span>
                  {statusLabels[status]}
                </span>

                <strong>
                  {data?.byStatus?.[
                    status
                  ] ?? 0}
                </strong>
              </div>
            ),
          )}
        </section>
      </div>
    </>
  );
}

function SolicitanteDashboard() {
  const query = useQuery({
    queryKey: [
      'requisitions',
      'my',
    ],
    queryFn: () =>
      maintenanceService.requisitions(),
  });

  const requisitions =
    query.data?.data ?? [];

  const myOpen =
    requisitions.filter(
      (request) =>
        request.status === 'aberta' ||
        request.status ===
          'em_analise' ||
        request.status ===
          'em_atendimento',
    );

  const myCompleted =
    requisitions.filter(
      (request) =>
        request.status ===
          'concluida' ||
        request.status ===
          'cancelada',
    );

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Portal do solicitante
          </p>

          <h1>
            Como podemos ajudar?
          </h1>
        </div>
      </div>

      <div className="requester-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                Em andamento
              </p>

              <h2>
                Suas requisições ativas
              </h2>
            </div>

            <NavLink
              className="text-link"
              to="/my-requisitions"
            >
              Ver todas
              <ArrowUpRight size={15} />
            </NavLink>
          </div>

          {myOpen.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>Prioridade</th>
                  </tr>
                </thead>

                <tbody>
                  {myOpen.map(
                    (request) => (
                      <tr
                        key={request.id}
                      >
                        <td>
                          {request.number ??
                            request.id.slice(
                              0,
                              8,
                            )}
                        </td>

                        <td>
                          {request.description?.slice(
                            0,
                            60,
                          ) ?? '—'}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              request.status ??
                              'aberta'
                            }`}
                          >
                            {
                              statusLabels[
                                request.status ??
                                  'aberta'
                              ]
                            }
                          </span>
                        </td>

                        <td>
                          <span
                            className={`priority ${
                              request.priority ??
                              'media'
                            }`}
                          >
                            {request.priority ??
                              '—'}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <ClipboardList size={23} />

              <strong>
                Nenhuma requisição ativa
              </strong>

              <span>
                Abra uma nova solicitação
                para começar.
              </span>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">
                Histórico
              </p>

              <h2>
                Concluídas e canceladas
              </h2>
            </div>
          </div>

          {myCompleted.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Descrição</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>

                <tbody>
                  {myCompleted.map(
                    (request) => (
                      <tr
                        key={request.id}
                      >
                        <td>
                          {request.number ??
                            request.id.slice(
                              0,
                              8,
                            )}
                        </td>

                        <td>
                          {request.description?.slice(
                            0,
                            60,
                          ) ?? '—'}
                        </td>

                        <td>
                          <span
                            className={`status-badge ${
                              request.status ??
                              'concluida'
                            }`}
                          >
                            {
                              statusLabels[
                                request.status ??
                                  'concluida'
                              ]
                            }
                          </span>
                        </td>

                        <td>
                          {request.updatedAt
                            ? new Date(
                                request.updatedAt,
                              ).toLocaleDateString(
                                'pt-BR',
                              )
                            : '—'}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <ShieldCheck size={23} />

              <strong>
                Sem histórico
              </strong>

              <span>
                Requisições concluídas
                aparecerão aqui.
              </span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function Metric({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <div className="metric-card">
      <div
        className={`metric-icon ${tone}`}
      >
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>

      <ArrowUpRight
        className="metric-arrow"
        size={16}
      />
    </div>
  );
}

function MyRequisitions() {
  return (
    <>
      <PageHeading
        eyebrow="Área do Solicitante"
        title="Minhas Requisições"
      />

      <RequisitionsTableSection />
    </>
  );
}

function Requisitions() {
  return (
    <>
      <PageHeading
        eyebrow="Fila de trabalho"
        title="Requisições"
        action={
          <button
            className="primary-button compact"
            disabled
            title="O endpoint de criação ainda não está disponível"
          >
            <ClipboardList size={16} />
            Nova solicitação
          </button>
        }
      />

      <RequisitionsTableSection />
    </>
  );
}

/**
 * Tabela principal da Sprint 3.
 *
 * Mantidos:
 * - pesquisa;
 * - filtro por status;
 * - paginação;
 * - abertura do modal;
 * - atualização de status;
 * - consulta à API.
 */
function RequisitionsTableSection() {
  const [search, setSearch] =
    useState('');

  const [selectedStatus, setSelectedStatus] =
    useState<string>('todos');

  const [
    selectedRequisitionId,
    setSelectedRequisitionId,
  ] = useState<string | null>(null);

  const [currentPage, setCurrentPage] =
    useState(1);

  const query = useQuery({
    queryKey: [
      'requisitions',
      search,
    ],

    queryFn: () =>
      maintenanceService.requisitions(
        search
          ? { search }
          : undefined,
      ),
  });

  const rawRows =
    query.data?.data ?? [];

  const filteredRows =
    rawRows.filter((row) => {
      const matchesStatus =
        selectedStatus === 'todos' ||
        row.status === selectedStatus;

      const normalizedSearch =
        search.toLowerCase();

      const matchesSearch =
        search === '' ||
        row.number
          ?.toLowerCase()
          .includes(
            normalizedSearch,
          ) ||
        row.description
          ?.toLowerCase()
          .includes(
            normalizedSearch,
          ) ||
        row.requesterEmail
          ?.toLowerCase()
          .includes(
            normalizedSearch,
          );

      return (
        matchesStatus &&
        matchesSearch
      );
    });

  const itemsPerPage = 5;

  const totalPages =
    Math.ceil(
      filteredRows.length /
        itemsPerPage,
    ) || 1;

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages,
    );

  const startIndex =
    (safeCurrentPage - 1) *
    itemsPerPage;

  const currentRows =
    filteredRows.slice(
      startIndex,
      startIndex +
        itemsPerPage,
    );

  return (
    <>
      <div
        className="toolbar"
        style={{
          flexDirection:
            'column',
          alignItems:
            'stretch',
          gap: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
            gap: '12px',
          }}
        >
          <div
            className="search-field"
            style={{
              flex: 1,
              maxWidth:
                '400px',
            }}
          >
            <span>⌕</span>

            <input
              value={search}
              onChange={(
                event,
              ) => {
                setSearch(
                  event.target.value,
                );

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
            flexWrap:
              'wrap',
            alignItems:
              'center',
            paddingTop:
              '4px',
          }}
        >
          <span
            style={{
              display:
                'flex',
              alignItems:
                'center',
              gap: '4px',
              fontSize:
                '13px',
              color:
                '#4b5563',
              marginRight:
                '4px',
            }}
          >
            <Filter size={14} />
            Filtrar por:
          </span>

          <button
            type="button"
            onClick={() => {
              setSelectedStatus(
                'todos',
              );
              setCurrentPage(1);
            }}
            style={{
              padding:
                '4px 12px',
              borderRadius:
                '6px',
              fontSize:
                '12px',
              fontWeight:
                500,
              background:
                selectedStatus ===
                'todos'
                  ? '#111827'
                  : '#f3f4f6',
              color:
                selectedStatus ===
                'todos'
                  ? '#fff'
                  : '#374151',
              border:
                '1px solid #d1d5db',
              cursor:
                'pointer',
            }}
          >
            Todos
          </button>

          {statusOptions.map(
            (status) => (
              <button
                key={status}
                type="button"
                onClick={() => {
                  setSelectedStatus(
                    status,
                  );

                  setCurrentPage(1);
                }}
                style={{
                  padding:
                    '4px 12px',
                  borderRadius:
                    '6px',
                  fontSize:
                    '12px',
                  fontWeight:
                    500,
                  background:
                    selectedStatus ===
                    status
                      ? getStatusColor(
                          status,
                        )
                      : '#f3f4f6',
                  color:
                    '#111827',
                  border:
                    '1px solid #d1d5db',
                  cursor:
                    'pointer',
                }}
              >
                {
                  statusLabels[
                    status
                  ]
                }
              </button>
            ),
          )}
        </div>
      </div>

      <section className="panel table-panel">
        {query.isLoading ? (
          <div className="empty-state">
            <RefreshCw
              className="spin"
              size={20}
            />

            Carregando
            solicitações...
          </div>
        ) : !filteredRows.length ? (
          <div className="empty-state">
            <ClipboardList
              size={23}
            />

            <strong>
              Nenhuma requisição
              encontrada
            </strong>

            <span>
              As solicitações
              retornadas pela API
              aparecerão aqui.
            </span>
          </div>
        ) : (
          <div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>
                      Referência
                    </th>

                    <th>
                      Descrição
                    </th>

                    <th>
                      Prioridade
                    </th>

                    <th>
                      Status
                    </th>

                    <th />
                  </tr>
                </thead>

                <tbody>
                  {currentRows.map(
                    (row) => (
                      <tr
                        key={row.id}
                        style={{
                          cursor:
                            'pointer',
                        }}
                        onClick={() =>
                          setSelectedRequisitionId(
                            row.id,
                          )
                        }
                      >
                        <td>
                          <span
                            className="row-link"
                            style={{
                              color:
                                '#2563eb',
                              fontWeight:
                                500,
                            }}
                          >
                            {row.number ??
                              row.id.slice(
                                0,
                                8,
                              )}
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
                              row.priority ??
                              'media'
                            }`}
                          >
                            {row.priority ??
                              '—'}
                          </span>
                        </td>

                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor:
                                getStatusColor(
                                  row.status,
                                ),
                              color:
                                '#111827',
                              padding:
                                '4px 10px',
                              borderRadius:
                                '6px',
                              fontWeight:
                                600,
                              display:
                                'inline-block',
                            }}
                          >
                            {
                              statusLabels[
                                row.status ??
                                  'aberta'
                              ]
                            }
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="icon-button"
                            aria-label="Abrir detalhes da requisição"
                            onClick={(
                              event,
                            ) => {
                              event.stopPropagation();

                              setSelectedRequisitionId(
                                row.id,
                              );
                            }}
                          >
                            <ArrowUpRight
                              size={17}
                            />
                          </button>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                display:
                  'flex',
                justifyContent:
                  'space-between',
                alignItems:
                  'center',
                padding:
                  '16px 20px',
                borderTop:
                  '1px solid #e5e7eb',
                fontSize:
                  '13px',
                color:
                  '#4b5563',
                gap: '12px',
                flexWrap:
                  'wrap',
              }}
            >
              <span>
                Mostrando{' '}
                {startIndex + 1}{' '}
                a{' '}
                {Math.min(
                  startIndex +
                    itemsPerPage,
                  filteredRows.length,
                )}{' '}
                de{' '}
                {
                  filteredRows.length
                }{' '}
                registros
              </span>

              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap: '8px',
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (previous) =>
                        Math.max(
                          previous -
                            1,
                          1,
                        ),
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    1
                  }
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    gap: '4px',
                    padding:
                      '6px 12px',
                    borderRadius:
                      '6px',
                    border:
                      '1px solid #d1d5db',
                    background:
                      safeCurrentPage ===
                      1
                        ? '#f3f4f6'
                        : '#fff',
                    color:
                      safeCurrentPage ===
                      1
                        ? '#9ca3af'
                        : '#374151',
                    cursor:
                      safeCurrentPage ===
                      1
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  <ChevronLeft
                    size={16}
                  />
                  Anterior
                </button>

                <span
                  style={{
                    fontWeight:
                      500,
                  }}
                >
                  Página{' '}
                  {
                    safeCurrentPage
                  }{' '}
                  de{' '}
                  {totalPages}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage(
                      (previous) =>
                        Math.min(
                          previous +
                            1,
                          totalPages,
                        ),
                    )
                  }
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'center',
                    gap: '4px',
                    padding:
                      '6px 12px',
                    borderRadius:
                      '6px',
                    border:
                      '1px solid #d1d5db',
                    background:
                      safeCurrentPage ===
                      totalPages
                        ? '#f3f4f6'
                        : '#fff',
                    color:
                      safeCurrentPage ===
                      totalPages
                        ? '#9ca3af'
                        : '#374151',
                    cursor:
                      safeCurrentPage ===
                      totalPages
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  Próxima
                  <ChevronRight
                    size={16}
                  />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {selectedRequisitionId && (
        <RequisitionModal
          requisitionId={
            selectedRequisitionId
          }
          onClose={() =>
            setSelectedRequisitionId(
              null,
            )
          }
        />
      )}
    </>
  );
}

function RequisitionModal({
  requisitionId,
  onClose,
}: {
  requisitionId: string;
  onClose: () => void;
}) {
  const queryClient =
    useQueryClient();

  const query = useQuery({
    queryKey: [
      'requisition',
      requisitionId,
    ],
    queryFn: () =>
      maintenanceService.requisition(
        requisitionId,
      ),
  });

  const mutation = useMutation({
    mutationFn: (
      status: RequisitionStatus,
    ) =>
      maintenanceService.updateStatus(
        requisitionId,
        status,
      ),

    onSuccess: () => {
      void queryClient.invalidateQueries(
        {
          queryKey: [
            'requisition',
            requisitionId,
          ],
        },
      );

      void queryClient.invalidateQueries(
        {
          queryKey: [
            'requisitions',
          ],
        },
      );
    },
  });

  const requisition =
    query.data;

  const mockHistory = [
    {
      id: 1,
      action:
        'Requisição Aberta',
      date:
        '25/09/2026 às 10:30',
      user:
        'solicitante@teste.com',
    },
    {
      id: 2,
      action:
        'Status alterado para "Em análise"',
      date:
        '26/09/2026 às 09:15',
      user:
        'operador@maintaina.com',
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor:
          'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems:
          'center',
        justifyContent:
          'center',
        zIndex: 1000,
        padding: '16px',
      }}
    >
      <div
        style={{
          backgroundColor:
            '#fff',
          borderRadius:
            '12px',
          width: '100%',
          maxWidth:
            '750px',
          maxHeight:
            '90vh',
          overflowY:
            'auto',
          boxShadow:
            '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          padding:
            '24px',
          position:
            'relative',
        }}
      >
        <div
          style={{
            display:
              'flex',
            justifyContent:
              'space-between',
            alignItems:
              'center',
            borderBottom:
              '1px solid #e5e7eb',
            paddingBottom:
              '16px',
            marginBottom:
              '20px',
          }}
        >
          <div>
            <span className="eyebrow">
              Detalhes da
              Requisição
            </span>

            <h2
              style={{
                fontSize:
                  '20px',
                fontWeight:
                  600,
                color:
                  '#111827',
              }}
            >
              {requisition?.number ??
                requisitionId}
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
            style={{
              padding:
                '40px',
            }}
          >
            <RefreshCw
              className="spin"
              size={20}
            />

            Carregando
            detalhes...
          </div>
        ) : requisition ? (
          <div
            style={{
              display:
                'grid',
              gridTemplateColumns:
                '1fr 280px',
              gap: '20px',
            }}
          >
            <div>
              <div
                style={{
                  display:
                    'flex',
                  gap: '12px',
                  marginBottom:
                    '16px',
                }}
              >
                <span
                  className="status-badge"
                  style={{
                    backgroundColor:
                      getStatusColor(
                        requisition.status,
                      ),
                    color:
                      '#111827',
                    padding:
                      '4px 10px',
                    borderRadius:
                      '6px',
                    fontWeight:
                      600,
                    display:
                      'inline-block',
                  }}
                >
                  {
                    statusLabels[
                      requisition.status ??
                        'aberta'
                    ]
                  }
                </span>

                <span
                  className={`priority ${
                    requisition.priority ??
                    'media'
                  }`}
                >
                  {requisition.priority ??
                    'Sem prioridade'}
                </span>
              </div>

              <h3
                style={{
                  fontSize:
                    '16px',
                  fontWeight:
                    600,
                  color:
                    '#1f2937',
                  marginBottom:
                    '12px',
                }}
              >
                {requisition.description ??
                  'Descrição pendente'}
              </h3>

              <dl
                className="detail-list"
                style={{
                  marginBottom:
                    '20px',
                }}
              >
                <div>
                  <dt>
                    Solicitante
                  </dt>

                  <dd>
                    {requisition.requesterEmail ??
                      'Não informado'}
                  </dd>
                </div>

                <div>
                  <dt>
                    Telefone
                  </dt>

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
                  <dt>
                    Categoria
                  </dt>

                  <dd>
                    {requisition.categoryId ??
                      'Não atribuída'}
                  </dd>
                </div>
              </dl>

              {requisition.photoUrl && (
                <div
                  style={{
                    marginBottom:
                      '20px',
                  }}
                >
                  <h4
                    style={{
                      fontSize:
                        '14px',
                      fontWeight:
                        600,
                      color:
                        '#374151',
                      marginBottom:
                        '8px',
                    }}
                  >
                    Foto do problema
                  </h4>

                  <img
                    src={
                      requisition.photoUrl
                    }
                    alt="Foto anexada"
                    style={{
                      maxWidth:
                        '100%',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #d1d5db',
                    }}
                  />
                </div>
              )}

              <div>
                <h4
                  style={{
                    fontSize:
                      '14px',
                    fontWeight:
                      600,
                    color:
                      '#374151',
                    marginBottom:
                      '12px',
                    display:
                      'flex',
                    alignItems:
                      'center',
                    gap: '6px',
                  }}
                >
                  <Clock
                    size={16}
                  />

                  Histórico de
                  atividade
                </h4>

                <ul
                  style={{
                    listStyle:
                      'none',
                    paddingLeft:
                      '8px',
                    margin: 0,
                    borderLeft:
                      '2px solid #e5e7eb',
                  }}
                >
                  {mockHistory.map(
                    (
                      item,
                      index,
                    ) => (
                      <li
                        key={
                          item.id
                        }
                        style={{
                          position:
                            'relative',
                          paddingLeft:
                            '20px',
                          paddingBottom:
                            index !==
                            mockHistory.length -
                              1
                              ? '12px'
                              : '0',
                        }}
                      >
                        <span
                          style={{
                            position:
                              'absolute',
                            left:
                              '-5px',
                            top:
                              '4px',
                            width:
                              '8px',
                            height:
                              '8px',
                            borderRadius:
                              '50%',
                            backgroundColor:
                              '#9ca3af',
                          }}
                        />

                        <p
                          style={{
                            margin:
                              0,
                            fontSize:
                              '13px',
                            fontWeight:
                              500,
                            color:
                              '#111827',
                          }}
                        >
                          {
                            item.action
                          }
                        </p>

                        <span
                          style={{
                            fontSize:
                              '11px',
                            color:
                              '#6b7280',
                          }}
                        >
                          {item.date} •{' '}
                          {item.user}
                        </span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </div>

            <div
              style={{
                backgroundColor:
                  '#f9fafb',
                padding:
                  '16px',
                borderRadius:
                  '8px',
                border:
                  '1px solid #e5e7eb',
              }}
            >
              <h4
                style={{
                  fontSize:
                    '14px',
                  fontWeight:
                    600,
                  color:
                    '#374151',
                  marginBottom:
                    '12px',
                }}
              >
                Alterar status
              </h4>

              <div
                className="status-actions"
                style={{
                  display:
                    'flex',
                  flexDirection:
                    'column',
                  gap: '8px',
                }}
              >
                {statusOptions.map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      className={
                        status ===
                        requisition.status
                          ? 'selected'
                          : ''
                      }
                      disabled={
                        mutation.isPending
                      }
                      onClick={() =>
                        mutation.mutate(
                          status,
                        )
                      }
                      style={{
                        display:
                          'flex',
                        alignItems:
                          'center',
                        gap: '8px',
                        padding:
                          '8px 12px',
                        borderRadius:
                          '6px',
                        border:
                          '1px solid #d1d5db',
                        background:
                          status ===
                          requisition.status
                            ? '#e0f2fe'
                            : '#fff',
                        cursor:
                          'pointer',
                        textAlign:
                          'left',
                        width:
                          '100%',
                      }}
                    >
                      <span
                        className={`status-dot ${status}`}
                      />

                      <span
                        style={{
                          fontSize:
                            '13px',
                          fontWeight:
                            500,
                        }}
                      >
                        {
                          statusLabels[
                            status
                          ]
                        }
                      </span>
                    </button>
                  ),
                )}
              </div>

              {mutation.isError && (
                <p
                  className="form-error"
                  style={{
                    marginTop:
                      '12px',
                  }}
                >
                  {apiErrorMessage(
                    mutation.error,
                  )}
                </p>
              )}

              {mutation.isSuccess && (
                <p
                  style={{
                    marginTop:
                      '12px',
                    color:
                      '#16a34a',
                    fontSize:
                      '12px',
                    fontWeight:
                      500,
                  }}
                >
                  ✓ Atualizado com
                  sucesso!
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            Requisição não
            encontrada.
          </div>
        )}
      </div>
    </div>
  );
}

function RequisitionTable({
  rows,
  loading,
}: {
  rows: Requisition[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="empty-state">
        <RefreshCw
          className="spin"
          size={20}
        />

        Carregando
        solicitações...
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="empty-state">
        <ClipboardList size={23} />

        <strong>
          Nenhuma requisição
          encontrada
        </strong>

        <span>
          As solicitações
          retornadas pela API
          aparecerão aqui.
        </span>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>
              Referência
            </th>

            <th>
              Descrição
            </th>

            <th>
              Prioridade
            </th>

            <th>
              Status
            </th>

            <th />
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <NavLink
                  className="row-link"
                  to={`/requisitions/${row.id}`}
                >
                  {row.number ??
                    row.id.slice(
                      0,
                      8,
                    )}
                </NavLink>

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
                    row.priority ??
                    'media'
                  }`}
                >
                  {row.priority ??
                    '—'}
                </span>
              </td>

              <td>
                <span
                  className={`status-badge ${
                    row.status ??
                    'aberta'
                  }`}
                >
                  {
                    statusLabels[
                      row.status ??
                        'aberta'
                    ]
                  }
                </span>
              </td>

              <td>
                <NavLink
                  to={`/requisitions/${row.id}`}
                  className="icon-button"
                  aria-label="Abrir requisição"
                >
                  <ArrowUpRight
                    size={17}
                  />
                </NavLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RequisitionDetail() {
  const { id = '' } =
    useParams();

  const queryClient =
    useQueryClient();

  const query = useQuery({
    queryKey: [
      'requisition',
      id,
    ],
    queryFn: () =>
      maintenanceService.requisition(
        id,
      ),
  });

  const mutation = useMutation({
    mutationFn: (
      status: RequisitionStatus,
    ) =>
      maintenanceService.updateStatus(
        id,
        status,
      ),

    onSuccess: () => {
      void queryClient.invalidateQueries(
        {
          queryKey: [
            'requisition',
            id,
          ],
        },
      );

      void queryClient.invalidateQueries(
        {
          queryKey: [
            'requisitions',
          ],
        },
      );
    },
  });

  const requisition =
    query.data;

  return (
    <>
      <PageHeading
        eyebrow="Detalhes da requisição"
        title={
          requisition?.number ??
          id
        }
        action={
          <NavLink
            className="secondary-button"
            to="/requisitions"
          >
            Voltar para a fila
          </NavLink>
        }
      />

      {query.isLoading ? (
        <div className="empty-state">
          <RefreshCw
            className="spin"
            size={20}
          />

          Carregando
          requisição...
        </div>
      ) : requisition ? (
        <div className="detail-grid">
          <section className="panel detail-main">
            <div className="detail-top">
              <span
                className={`status-badge ${
                  requisition.status ??
                  'aberta'
                }`}
              >
                {
                  statusLabels[
                    requisition.status ??
                      'aberta'
                  ]
                }
              </span>

              <span
                className={`priority ${
                  requisition.priority ??
                  'media'
                }`}
              >
                {requisition.priority ??
                  'Sem prioridade'}
              </span>
            </div>

            <h2>
              {requisition.description ??
                'Descrição pendente'}
            </h2>

            <dl className="detail-list">
              <div>
                <dt>
                  Solicitante
                </dt>

                <dd>
                  {requisition.requesterEmail ??
                    'Não informado'}
                </dd>
              </div>

              <div>
                <dt>
                  Telefone
                </dt>

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
                <dt>
                  Categoria
                </dt>

                <dd>
                  {requisition.categoryId ??
                    'Não atribuída'}
                </dd>
              </div>
            </dl>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">
                  Fluxo de trabalho
                </p>

                <h2>
                  Atualizar status
                </h2>
              </div>
            </div>

            <div className="status-actions">
              {statusOptions.map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    className={
                      status ===
                      requisition.status
                        ? 'selected'
                        : ''
                    }
                    disabled={
                      mutation.isPending
                    }
                    onClick={() =>
                      mutation.mutate(
                        status,
                      )
                    }
                  >
                    <span
                      className={`status-dot ${status}`}
                    />

                    {
                      statusLabels[
                        status
                      ]
                    }
                  </button>
                ),
              )}
            </div>

            {mutation.isError && (
              <p className="form-error">
                {apiErrorMessage(
                  mutation.error,
                )}
              </p>
            )}

            {mutation.isSuccess && (
              <p className="success-message">
                Status atualizado com
                sucesso.
              </p>
            )}
          </section>
        </div>
      ) : (
        <div className="empty-state">
          Não foi possível
          encontrar esta
          requisição.
        </div>
      )}
    </>
  );
}

function ReferencePage({
  type,
}: {
  type:
    | 'locations'
    | 'categories';
}) {
  const query = useQuery({
    queryKey: [type],

    queryFn:
      type === 'locations'
        ? maintenanceService.locations
        : maintenanceService.categories,
  });

  const title =
    type === 'locations'
      ? 'Locais'
      : 'Categorias';

  return (
    <>
      <PageHeading
        eyebrow="Dados de referência"
        title={title}
        action={
          <button
            className="primary-button compact"
            disabled
            title={`O endpoint de criação de ${title.toLowerCase()} ainda não está disponível`}
          >
            <Database size={16} />

            Adicionar{' '}
            {type ===
            'locations'
              ? 'local'
              : 'categoria'}
          </button>
        }
      />

      <section className="reference-grid">
        {query.data?.map(
          (item) => (
            <article
              className="reference-card"
              key={item.id}
            >
              <div className="reference-icon">
                {type ===
                'locations' ? (
                  <MapPin
                    size={18}
                  />
                ) : (
                  <Tag
                    size={18}
                  />
                )}
              </div>

              <div>
                <h2>
                  {item.name}
                </h2>

                <p>
                  {item.description ??
                    'Nenhuma descrição informada.'}
                </p>
              </div>
            </article>
          ),
        )}
      </section>

      {!query.isLoading &&
        !query.data?.length && (
          <div className="empty-state panel">
            Nenhum registro de{' '}
            {title.toLowerCase()}{' '}
            retornado pela API.
          </div>
        )}
    </>
  );
}

function UsersPage() {
  const query = useQuery({
    queryKey: ['users'],
    queryFn:
      maintenanceService.users,
  });

  return (
    <>
      <PageHeading
        eyebrow="Diretório"
        title="Pessoas"
      />

      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">
              Usuários conectados
            </p>

            <h2>
              Diretório da equipe
            </h2>
          </div>

          <span className="result-count">
            {query.data?.total ??
              0}{' '}
            pessoas
          </span>
        </div>

        {query.data?.data.length ? (
          <div className="people-list">
            {query.data.data.map(
              (user) => (
                <div
                  className="person-row"
                  key={user.id}
                >
                  <div className="avatar">
                    {user.name[0]?.toUpperCase()}
                  </div>

                  <div>
                    <strong>
                      {user.name}
                    </strong>

                    <span>
                      {user.email}
                    </span>
                  </div>

                  <span className="role-chip">
                    {user.role ??
                      'member'}
                  </span>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="empty-state">
            <Users size={23} />

            <strong>
              Nenhuma pessoa
              encontrada
            </strong>

            <span>
              O endpoint de usuários
              está conectado e pronto
              para registros persistidos.
            </span>
          </div>
        )}
      </section>
    </>
  );
}

export default App;