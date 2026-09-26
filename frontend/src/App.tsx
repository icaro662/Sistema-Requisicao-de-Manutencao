import { FormEvent, useState } from 'react';
import { Link, Navigate, NavLink, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, ArrowUpRight, BarChart3, Bell, ClipboardList, Database, LogOut, MapPin, Menu, RefreshCw, ShieldCheck, Tag, Users, X, Wrench, UserPlus } from 'lucide-react';
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
import type { RegisterInput, RequisitionStatus } from './types';
import { validateLoginForm, validateRegisterForm, type FieldError } from './utils/validation';

const statusLabels: Record<RequisitionStatus, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_material: 'Aguardando material',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};
const statusOptions = Object.keys(statusLabels) as RequisitionStatus[];

function App() {
  const authenticated = useAuthStore((state) => Boolean(state.sessionEmail));

  return <Routes>
    <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <LoginPage />} />
    <Route path="/register" element={authenticated ? <Navigate to="/" replace /> : <RegisterPage />} />
    <Route element={<ProtectedLayout />}><Route path="/*" element={<Shell />} /></Route>
    <Route path="*" element={<Navigate to={authenticated ? '/' : '/login'} replace />} />
  </Routes>;
}

function ProtectedLayout() {
  const authenticated = useAuthStore((state) => Boolean(state.sessionEmail));
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AuthAside() {
  return <div className="login-aside">
    <div className="brand-mark">M</div>
    <p className="eyebrow">Operações de manutenção</p>
    <h1>Faça cada solicitação avançar.</h1>
    <p className="login-copy">Um espaço de trabalho para as equipes organizarem, encaminharem e concluírem as atividades que mantêm seus locais funcionando.</p>
    <div className="signal-list">
      <span><Activity size={16} /> Visão operacional em tempo real</span>
    </div>
  </div>;
}

function LoginPage() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [serverError, setServerError] = useState('');
  const mutation = useMutation({
    mutationFn: () => authService.login(form),
    onSuccess: (result) => { signIn(result); navigate('/'); },
    onError: (reason) => setServerError(apiErrorMessage(reason)),
  });

  const validateField = (field: 'email' | 'password', value: string) => {
    const errors = validateLoginForm(field === 'email' ? value : form.email, field === 'password' ? value : form.password);
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (errors[field]) next[field] = errors[field];
      else delete next[field];
      return next;
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const errors = validateLoginForm(form.email, form.password);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setServerError('');
    mutation.mutate();
  };

  return <main className="login-page">
    <AuthAside />
    <form className="login-card" onSubmit={submit} noValidate>
      <p className="eyebrow">Bem-vindo de volta</p>
      <h2>Entrar no sistema</h2>
      <p className="muted">Use suas credenciais de acesso.</p>
      <label>E-mail
        <input
          type="email"
          value={form.email}
          onChange={(event) => { setForm({ ...form, email: event.target.value }); if (fieldErrors.email) validateField('email', event.target.value); }}
          onBlur={() => validateField('email', form.email)}
          placeholder="voce@empresa.com"
          aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
      </label>
      <label>Senha
        <input
          type="password"
          value={form.password}
          onChange={(event) => { setForm({ ...form, password: event.target.value }); if (fieldErrors.password) validateField('password', event.target.value); }}
          onBlur={() => validateField('password', form.password)}
          placeholder="Mínimo de 8 caracteres"
          aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
      </label>
      {serverError && <p className="form-error">{serverError}</p>}
      <button className="primary-button" disabled={mutation.isPending}>{mutation.isPending ? 'Entrando...' : 'Entrar'} <ArrowUpRight size={17} /></button>
      <p className="auth-switch">Ainda não possui uma conta? <Link to="/register">Criar cadastro</Link></p>
    </form>
  </main>;
}

function RegisterPage() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterInput>({ name: '', email: '', password: '', phone: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldError>({});
  const [serverError, setServerError] = useState('');
  const mutation = useMutation({
    mutationFn: () => authService.register(form),
    onSuccess: (result) => { signIn(result); navigate('/'); },
    onError: (reason) => setServerError(apiErrorMessage(reason)),
  });

  const validateField = (field: 'name' | 'email' | 'password' | 'phone', value: string) => {
    const errors = validateRegisterForm(
      field === 'name' ? value : form.name,
      field === 'email' ? value : form.email,
      field === 'password' ? value : form.password,
      field === 'phone' ? value : form.phone ?? '',
    );
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (errors[field]) next[field] = errors[field];
      else delete next[field];
      return next;
    });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const errors = validateRegisterForm(form.name, form.email, form.password, form.phone ?? '');
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setServerError('');
    mutation.mutate();
  };

  return <main className="login-page">
    <AuthAside />
    <form className="login-card" onSubmit={submit} noValidate>
      <p className="eyebrow">Novo acesso</p>
      <h2>Criar cadastro</h2>
      <p className="muted">Preencha seus dados para começar.</p>
      <label>Nome
        <input
          type="text"
          value={form.name}
          onChange={(event) => { setForm({ ...form, name: event.target.value }); if (fieldErrors.name) validateField('name', event.target.value); }}
          onBlur={() => validateField('name', form.name)}
          placeholder="Seu nome completo"
          aria-invalid={Boolean(fieldErrors.name)}
        />
        {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
      </label>
      <label>E-mail
        <input
          type="email"
          value={form.email}
          onChange={(event) => { setForm({ ...form, email: event.target.value }); if (fieldErrors.email) validateField('email', event.target.value); }}
          onBlur={() => validateField('email', form.email)}
          placeholder="voce@empresa.com"
          aria-invalid={Boolean(fieldErrors.email)}
        />
        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
      </label>
      <label>Telefone <span className="optional">(opcional)</span>
        <input
          type="tel"
          value={form.phone}
          onChange={(event) => { setForm({ ...form, phone: event.target.value }); if (fieldErrors.phone) validateField('phone', event.target.value); }}
          onBlur={() => validateField('phone', form.phone ?? '')}
          placeholder="(00) 00000-0000"
          aria-invalid={Boolean(fieldErrors.phone)}
        />
        {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
      </label>
      <label>Senha
        <input
          type="password"
          value={form.password}
          onChange={(event) => { setForm({ ...form, password: event.target.value }); if (fieldErrors.password) validateField('password', event.target.value); }}
          onBlur={() => validateField('password', form.password)}
          placeholder="Mínimo de 8 caracteres"
          aria-invalid={Boolean(fieldErrors.password)}
        />
        {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
      </label>
      {serverError && <p className="form-error">{serverError}</p>}
      <button className="primary-button" disabled={mutation.isPending}>{mutation.isPending ? 'Criando cadastro...' : 'Criar cadastro'} <ArrowUpRight size={17} /></button>
      <p className="auth-switch">Já possui uma conta? <Link to="/login">Entrar</Link></p>
    </form>
  </main>;
}

function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const signOut = useAuthStore((state) => state.signOut);
  const sessionEmail = useAuthStore((state) => state.sessionEmail);
  const currentUser = useAuthStore((state) => state.user);
  const role = currentUser?.role;

  const navItems = [
    { to: '/', label: 'Visão geral', icon: BarChart3, roles: ['executor', 'gestor', 'admin'] },
    { to: '/requisitions', label: 'Requisições', icon: ClipboardList, roles: ['executor', 'gestor', 'admin'] },
    { to: '/my-requisitions', label: 'Minhas solicitações', icon: ClipboardList, roles: ['solicitante'] },
    { to: '/create-requisition', label: 'Nova requisição', icon: ClipboardList, roles: ['solicitante'] },
    { to: '/executor', label: 'Painel do executor', icon: Wrench, roles: ['executor'] },
    { to: '/manager', label: 'Painel do gestor', icon: Users, roles: ['gestor'] },
    { to: '/notifications', label: 'Notificações', icon: Bell, roles: ['solicitante', 'executor', 'gestor', 'admin'] },
    { to: '/locations', label: 'Locais', icon: MapPin, roles: ['executor', 'gestor', 'admin'] },
    { to: '/categories', label: 'Categorias', icon: Tag, roles: ['executor', 'gestor', 'admin'] },
    { to: '/users', label: 'Administração', icon: Users, roles: ['admin'] },
  ].filter((item) => role && item.roles.includes(role));

  const handleSignOut = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) await authService.logout(refreshToken).catch(() => undefined);
    signOut();
  };

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="sidebar-top">
        <div className="brand-lockup"><span className="brand-mark small">M</span><span>Manutenção</span></div>
        <button className="icon-button mobile-only" onClick={() => setMenuOpen(false)} aria-label="Fechar navegação"><X size={19} /></button>
      </div>
      <p className="nav-label">Área de trabalho</p>
      <nav>{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}><Icon size={18} />{label}</NavLink>)}</nav>
      <div className="sidebar-footer">
        <div className="avatar">{sessionEmail?.[0]?.toUpperCase()}</div>
        <div className="account"><strong>{sessionEmail?.split('@')[0]}</strong><span>{sessionEmail}</span></div>
        <button className="icon-button" onClick={() => void handleSignOut()} aria-label="Sair"><LogOut size={17} /></button>
      </div>
    </aside>
    {menuOpen && <button className="scrim" onClick={() => setMenuOpen(false)} aria-label="Fechar navegação" />}
    <div className="content">
      <header className="topbar">
        <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Abrir navegação"><Menu size={21} /></button>
        <div><span className="topbar-kicker">Central de operações</span><strong>26 de setembro de 2026</strong></div>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/requisitions" element={<Requisitions />} />
          <Route path="/requisitions/:id" element={<RequisitionDetail />} />
          <Route path="/my-requisitions" element={<MyRequisitionsPage />} />
          <Route path="/create-requisition" element={<CreateRequisitionPage />} />
          <Route path="/executor" element={<ExecutorPage />} />
          <Route path="/manager" element={<ManagerPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/locations" element={<ReferencePage type="locations" />} />
          <Route path="/categories" element={<ReferencePage type="categories" />} />
          <Route path="/users" element={<AdminUsersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  </div>;
}

function PageHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{action}</div>;
}

function Dashboard() {
  const currentUser = useAuthStore((state) => state.user);
  const isSolicitante = currentUser?.role === 'solicitante';

  if (isSolicitante) return <SolicitanteDashboard />;

  const summary = useQuery({ queryKey: ['dashboard'], queryFn: maintenanceService.dashboard });
  const requisitions = useQuery({ queryKey: ['requisitions'], queryFn: () => maintenanceService.requisitions() });
  const data = summary.data;
  return <>
    <PageHeading eyebrow="Visão geral" title="Bom dia, operador." action={<button className="secondary-button" onClick={() => { void summary.refetch(); void requisitions.refetch(); }}><RefreshCw size={16} /> Atualizar</button>} />
    <div className="hero-strip">
      <div>
        <span className="hero-label">Resumo de hoje</span>
        <h2>Mantenha o foco no trabalho que importa.</h2>
        <p>Acompanhe a demanda de manutenção e conduza cada solicitação até a resolução.</p>
      </div>
      <div className="hero-icon"><Activity size={31} /></div>
    </div>
    <section className="metric-grid">
      <Metric label="Todas as solicitações" value={data?.total ?? 0} icon={<ClipboardList />} tone="blue" />
      <Metric label="Abertas" value={data?.byStatus?.aberta ?? 0} icon={<Activity />} tone="mint" />
      <Metric label="Em atendimento" value={data?.byStatus?.em_atendimento ?? 0} icon={<ArrowUpRight />} tone="gold" />
      <Metric label="Concluídas" value={data?.byStatus?.concluida ?? 0} icon={<ShieldCheck />} tone="rose" />
    </section>
    <div className="content-grid">
      <section className="panel">
        <div className="panel-heading">
          <div><p className="eyebrow">Atividade recente</p><h2>Últimas requisições</h2></div>
          <NavLink className="text-link" to="/requisitions">Ver todas <ArrowUpRight size={15} /></NavLink>
        </div>
        <RequisitionTable rows={requisitions.data?.data ?? []} loading={requisitions.isLoading} />
      </section>
      <section className="panel status-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">Distribuição</p><h2>Por status</h2></div>
        </div>
        {statusOptions.map((status) => <div className="status-row" key={status}><span className={`status-dot ${status}`} /><span>{statusLabels[status]}</span><strong>{data?.byStatus?.[status] ?? 0}</strong></div>)}
      </section>
    </div>
  </>;
}

function SolicitanteDashboard() {
  const query = useQuery({ queryKey: ['requisitions', 'my'], queryFn: () => maintenanceService.requisitions() });
  const requisitions = query.data?.data ?? [];
  const myOpen = requisitions.filter((r) => r.status === 'aberta' || r.status === 'em_analise' || r.status === 'em_atendimento');
  const myCompleted = requisitions.filter((r) => r.status === 'concluida' || r.status === 'cancelada');

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Portal do solicitante</p>
        <h1>Como podemos ajudar?</h1>
      </div>
    </div>

    <div className="requester-grid">
      <section className="panel">
        <div className="panel-heading">
          <div><p className="eyebrow">Em andamento</p><h2>Suas requisições ativas</h2></div>
          <NavLink className="text-link" to="/my-requisitions">Ver todas <ArrowUpRight size={15} /></NavLink>
        </div>
        {myOpen.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Número</th><th>Descrição</th><th>Status</th><th>Prioridade</th></tr></thead>
              <tbody>
                {myOpen.map((req) => (
                  <tr key={req.id}>
                    <td>{req.number ?? req.id.slice(0, 8)}</td>
                    <td>{req.description?.slice(0, 60) ?? '—'}</td>
                    <td><span className={`status-badge ${req.status ?? 'aberta'}`}>{statusLabels[req.status ?? 'aberta']}</span></td>
                    <td><span className={`priority ${req.priority ?? 'media'}`}>{req.priority ?? '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <ClipboardList size={23} />
            <strong>Nenhuma requisição ativa</strong>
            <span>Abra uma nova solicitação para começar.</span>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div><p className="eyebrow">Histórico</p><h2>Concluídas e canceladas</h2></div>
        </div>
        {myCompleted.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Número</th><th>Descrição</th><th>Status</th><th>Data</th></tr></thead>
              <tbody>
                {myCompleted.map((req) => (
                  <tr key={req.id}>
                    <td>{req.number ?? req.id.slice(0, 8)}</td>
                    <td>{req.description?.slice(0, 60) ?? '—'}</td>
                    <td><span className={`status-badge ${req.status ?? 'concluida'}`}>{statusLabels[req.status ?? 'concluida']}</span></td>
                    <td>{req.updatedAt ? new Date(req.updatedAt).toLocaleDateString('pt-BR') : '—'}</td>
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
  </>;
}

function Metric({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong></div><ArrowUpRight className="metric-arrow" size={16} /></div>;
}

function Requisitions() {
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: ['requisitions', search], queryFn: () => maintenanceService.requisitions(search ? { search } : undefined) });
  return <>
    <PageHeading eyebrow="Fila de trabalho" title="Requisições" action={<button className="primary-button compact" disabled title="O endpoint de criação ainda não está disponível"><ClipboardList size={16} /> Nova solicitação</button>} />
    <div className="toolbar">
      <div className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por descrição ou solicitante" /></div>
      <span className="result-count">{query.data?.total ?? 0} solicitações</span>
    </div>
    <section className="panel table-panel"><RequisitionTable rows={query.data?.data ?? []} loading={query.isLoading} /></section>
  </>;
}

function RequisitionTable({ rows, loading }: { rows: Array<import('./types').Requisition>; loading: boolean }) {
  if (loading) return <div className="empty-state"><RefreshCw className="spin" size={20} /> Carregando solicitações...</div>;
  if (!rows.length) return <div className="empty-state"><ClipboardList size={23} /><strong>Nenhuma requisição encontrada</strong><span>As solicitações retornadas pela API aparecerão aqui.</span></div>;
  return <div className="table-wrap"><table><thead><tr><th>Referência</th><th>Descrição</th><th>Prioridade</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><NavLink className="row-link" to={`/requisitions/${row.id}`}>{row.number ?? row.id.slice(0, 8)}</NavLink><small>{row.requesterEmail ?? 'Solicitante não informado'}</small></td><td>{row.description ?? 'Descrição pendente'}</td><td><span className={`priority ${row.priority ?? 'media'}`}>{row.priority ?? '—'}</span></td><td><span className={`status-badge ${row.status ?? 'aberta'}`}>{statusLabels[row.status ?? 'aberta']}</span></td><td><NavLink to={`/requisitions/${row.id}`} className="icon-button" aria-label="Abrir requisição"><ArrowUpRight size={17} /></NavLink></td></tr>)}</tbody></table></div>;
}

function RequisitionDetail() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['requisition', id], queryFn: () => maintenanceService.requisition(id) });
  const mutation = useMutation({
    mutationFn: (status: RequisitionStatus) => maintenanceService.updateStatus(id, status),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['requisition', id] }); void queryClient.invalidateQueries({ queryKey: ['requisitions'] }); },
  });
  const requisition = query.data;
  return <>
    <PageHeading eyebrow="Detalhes da requisição" title={requisition?.number ?? id} action={<NavLink className="secondary-button" to="/requisitions">Voltar para a fila</NavLink>} />
    {query.isLoading ? <div className="empty-state"><RefreshCw className="spin" size={20} /> Carregando requisição...</div> : requisition ? <div className="detail-grid">
      <section className="panel detail-main">
        <div className="detail-top"><span className={`status-badge ${requisition.status ?? 'aberta'}`}>{statusLabels[requisition.status ?? 'aberta']}</span><span className={`priority ${requisition.priority ?? 'media'}`}>{requisition.priority ?? 'Sem prioridade'}</span></div>
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
          <div><p className="eyebrow">Fluxo de trabalho</p><h2>Atualizar status</h2></div>
        </div>
        <div className="status-actions">{statusOptions.map((status) => <button key={status} className={status === requisition.status ? 'selected' : ''} disabled={mutation.isPending} onClick={() => mutation.mutate(status)}><span className={`status-dot ${status}`} />{statusLabels[status]}</button>)}</div>
        {mutation.isError && <p className="form-error">{apiErrorMessage(mutation.error)}</p>}
        {mutation.isSuccess && <p className="success-message">Status atualizado com sucesso.</p>}
      </section>
    </div> : <div className="empty-state">Não foi possível encontrar esta requisição.</div>}
  </>;
}

function ReferencePage({ type }: { type: 'locations' | 'categories' }) {
  const query = useQuery({ queryKey: [type], queryFn: type === 'locations' ? maintenanceService.locations : maintenanceService.categories });
  const title = type === 'locations' ? 'Locais' : 'Categorias';
  return <>
    <PageHeading eyebrow="Dados de referência" title={title} action={<button className="primary-button compact" disabled title={`O endpoint de criação de ${title.toLowerCase()} ainda não está disponível`}><Database size={16} /> Adicionar {type === 'locations' ? 'local' : 'categoria'}</button>} />
    <section className="reference-grid">{query.data?.map((item) => <article className="reference-card" key={item.id}><div className="reference-icon">{type === 'locations' ? <MapPin size={18} /> : <Tag size={18} />}</div><div><h2>{item.name}</h2><p>{item.description ?? 'Nenhuma descrição informada.'}</p></div></article>)}</section>
    {!query.isLoading && !query.data?.length && <div className="empty-state panel">Nenhum registro de {title.toLowerCase()} retornado pela API.</div>}
  </>;
}

export default App;
