import { FormEvent, useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, ArrowUpRight, BarChart3, Bell, ClipboardList, Database, LogOut, MapPin, Menu, RefreshCw, ShieldCheck, Tag, Users, X, Clock, User, Filter, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiErrorMessage } from './services/api';
import { authService } from './services/authService';
import { maintenanceService } from './services/maintenanceService';
import { useAuthStore } from './store/authStore';
import type { RequisitionStatus } from './types';

const statusLabels: Record<RequisitionStatus, string> = {
  aberta: 'Open',
  em_analise: 'Under review',
  em_atendimento: 'In service',
  aguardando_material: 'Waiting material',
  concluida: 'Completed',
  cancelada: 'Cancelled',
};
const statusOptions = Object.keys(statusLabels) as RequisitionStatus[];

const getStatusColor = (status?: string | null) => {
  switch (status) {
    case 'concluida': return '#4ade80';
    case 'aberta': return '#facc15';
    case 'cancelada': return '#f87171';
    case 'em_atendimento': return '#60a5fa';
    case 'em_analise': return '#c084fc';
    case 'aguardando_material': return '#fb923c';
    default: return '#d1d5db';
  }
};

function App() {
  const authenticated = useAuthStore((state) => Boolean(state.sessionEmail));
  return (
    <Routes>
      <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/*" element={<Shell />} />
      </Route>
      <Route path="*" element={<Navigate to={authenticated ? '/' : '/login'} replace />} />
    </Routes>
  );
}

function ProtectedLayout() {
  const authenticated = useAuthStore((state) => Boolean(state.sessionEmail));
  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function LoginPage() {
  const signIn = useAuthStore((state) => state.signIn);
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: () => authService.login(form),
    onSuccess: (result) => {
      signIn(result.email ?? form.email);
      navigate('/');
    },
    onError: (reason) => setError(apiErrorMessage(reason)),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError('');
    mutation.mutate();
  };

  return (
    <main className="login-page">
      <div className="login-aside">
        <div className="brand-mark">M</div>
        <p className="eyebrow">Maintenance operations</p>
        <h1>Keep every request moving.</h1>
        <p className="login-copy">
          One calm workspace for facilities teams to triage, assign, and close the work that keeps your sites running.
        </p>
        <div className="signal-list">
          <span><Activity size={16} /> Live operational overview</span>
          <span><ShieldCheck size={16} /> Role-ready API foundation</span>
        </div>
      </div>
      <form className="login-card" onSubmit={submit}>
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in to Maintaina</h2>
        <p className="muted">Use your maintenance system credentials.</p>
        <label>
          Email
          <input
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="you@company.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Minimum 8 characters"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-button" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Connecting...' : 'Continue'} <ArrowUpRight size={17} />
        </button>
        <p className="api-note">The current backend returns a session-ready response while token issuance is being completed.</p>
      </form>
    </main>
  );
}

function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const signOut = useAuthStore((state) => state.signOut);
  const sessionEmail = useAuthStore((state) => state.sessionEmail);
  
  const navItems = [
    { to: '/', label: 'Overview', icon: BarChart3 },
    { to: '/my-requests', label: 'My requests', icon: User },
    { to: '/requisitions', label: 'All requisitions', icon: ClipboardList },
    { to: '/locations', label: 'Locations', icon: MapPin },
    { to: '/categories', label: 'Categories', icon: Tag },
    { to: '/users', label: 'People', icon: Users },
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand-lockup">
            <span className="brand-mark small">M</span>
            <span>maintaina</span>
          </div>
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
            <X size={19} />
          </button>
        </div>
        <p className="nav-label">Workspace</p>
        <nav>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="avatar">{sessionEmail?.[0]?.toUpperCase()}</div>
          <div className="account">
            <strong>{sessionEmail?.split('@')[0]}</strong>
            <span>{sessionEmail}</span>
          </div>
          <button className="icon-button" onClick={signOut} aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      {menuOpen && <button className="scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <div className="content">
        <header className="topbar">
          <button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
            <Menu size={21} />
          </button>
          <div>
            <span className="topbar-kicker">Facilities control room</span>
            <strong>Tuesday, September 25, 2026</strong>
          </div>
          <div className="connection-pill"><span /> API connected</div>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/my-requests" element={<MyRequisitions />} />
            <Route path="/requisitions" element={<Requisitions />} />
            <Route path="/locations" element={<ReferencePage type="locations" />} />
            <Route path="/categories" element={<ReferencePage type="categories" />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function PageHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {action}
    </div>
  );
}

function Dashboard() {
  const summary = useQuery({ queryKey: ['dashboard'], queryFn: maintenanceService.dashboard });
  const requisitions = useQuery({ queryKey: ['requisitions'], queryFn: () => maintenanceService.requisitions() });
  const data = summary.data;

  return (
    <>
      <PageHeading
        eyebrow="Overview"
        title="Good morning, operator."
        action={
          <button className="secondary-button" onClick={() => { void summary.refetch(); void requisitions.refetch(); }}>
            <RefreshCw size={16} /> Refresh
          </button>
        }
      />
      <div className="hero-strip">
        <div>
          <span className="hero-label">Today at a glance</span>
          <h2>Keep the floor clear for the work that matters.</h2>
          <p>Track incoming maintenance demand and move each request toward resolution.</p>
        </div>
        <div className="hero-icon"><Activity size={31} /></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#eff6ff', border: '1px solid #bfdbfe', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', color: '#1e40af', fontSize: '14px' }}>
        <AlertCircle size={18} />
        <span>Sistema operacional a operar normalmente. Verifique abaixo os pedidos pendentes que necessitam de atenção.</span>
      </div>

      <section className="metric-grid">
        <Metric label="All requests" value={data?.total ?? 0} icon={<ClipboardList />} tone="blue" />
        <Metric label="Open" value={data?.byStatus?.aberta ?? 0} icon={<Activity />} tone="mint" />
        <Metric label="In service" value={data?.byStatus?.em_atendimento ?? 0} icon={<ArrowUpRight />} tone="gold" />
        <Metric label="Completed" value={data?.byStatus?.concluida ?? 0} icon={<ShieldCheck />} tone="rose" />
      </section>
      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Latest activity</p>
              <h2>Recent requisitions</h2>
            </div>
            <NavLink className="text-link" to="/requisitions">View all <ArrowUpRight size={15} /></NavLink>
          </div>
          <RequisitionsTableSection />
        </section>
        <section className="panel status-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Distribution</p>
              <h2>By status</h2>
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

function Metric({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <ArrowUpRight className="metric-arrow" size={16} />
    </div>
  );
}

function MyRequisitions() {
  return (
    <>
      <PageHeading eyebrow="Área do Solicitante" title="Minhas Requisições" />
      <RequisitionsTableSection />
    </>
  );
}

function Requisitions() {
  return (
    <>
      <PageHeading
        eyebrow="Work queue"
        title="Requisitions"
        action={
          <button className="primary-button compact" disabled title="The backend create endpoint is not implemented yet">
            <ClipboardList size={16} /> New request
          </button>
        }
      />
      <RequisitionsTableSection />
    </>
  );
}

// Tabela centralizada com suporte a Filtros, Pesquisa, Paginação e MODAL DE DETALHES
function RequisitionsTableSection() {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null);
  
  const query = useQuery({ 
    queryKey: ['requisitions', search], 
    queryFn: () => maintenanceService.requisitions(search ? { search } : undefined) 
  });

  const rawRows = query.data?.data ?? [];
  const filteredRows = rawRows.filter((row) => {
    const matchesStatus = selectedStatus === 'todos' || row.status === selectedStatus;
    const matchesSearch = search === '' || 
      row.number?.toLowerCase().includes(search.toLowerCase()) || 
      row.description?.toLowerCase().includes(search.toLowerCase()) ||
      row.requesterEmail?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRows = filteredRows.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <div className="toolbar" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="search-field" style={{ flex: 1, maxWidth: '400px' }}>
            <span>⌕</span>
            <input
              value={search}
              onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }}
              placeholder="Pesquisar por número, descrição ou requerente..."
            />
          </div>
          <span className="result-count">{filteredRows.length} total requests</span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', paddingTop: '4px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#4b5563', marginRight: '4px' }}>
            <Filter size={14} /> Filtrar por:
          </span>
          <button 
            onClick={() => setSelectedStatus('todos')}
            style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: selectedStatus === 'todos' ? '#111827' : '#f3f4f6', color: selectedStatus === 'todos' ? '#fff' : '#374151', border: '1px solid #d1d5db', cursor: 'pointer' }}
          >
            Todos
          </button>
          {statusOptions.map((status) => (
            <button 
              key={status}
              onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
              style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: selectedStatus === status ? getStatusColor(status) : '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', cursor: 'pointer' }}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      <section className="panel table-panel">
        {query.isLoading ? (
          <div className="empty-state"><RefreshCw className="spin" size={20} /> Loading requests...</div>
        ) : !filteredRows.length ? (
          <div className="empty-state"><ClipboardList size={23} /><strong>No requisitions found</strong><span>Requests returned by the API will appear here.</span></div>
        ) : (
          <div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((row) => (
                    <tr key={row.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedRequisitionId(row.id)}>
                      <td>
                        <span className="row-link" style={{ color: '#2563eb', fontWeight: 500 }}>
                          {row.number ?? row.id.slice(0, 8)}
                        </span>
                        <small>{row.requesterEmail ?? 'No requester'}</small>
                      </td>
                      <td>{row.description ?? 'Description pending'}</td>
                      <td><span className={`priority ${row.priority ?? 'media'}`}>{row.priority ?? '—'}</span></td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            backgroundColor: getStatusColor(row.status),
                            color: '#111827',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            display: 'inline-block',
                          }}
                        >
                          {statusLabels[row.status ?? 'aberta']}
                        </span>
                      </td>
                      <td>
                        <button className="icon-button" aria-label="Open requisition modal" onClick={(e) => { e.stopPropagation(); setSelectedRequisitionId(row.id); }}>
                          <ArrowUpRight size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #e5e7eb', fontSize: '13px', color: '#4b5563' }}>
              <span>Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredRows.length)} de {filteredRows.length} registos</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: currentPage === 1 ? '#f3f4f6' : '#fff', color: currentPage === 1 ? '#9ca3af' : '#374151', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={16} /> Anterior
                </button>
                <span style={{ fontWeight: 500 }}>Página {currentPage} de {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: currentPage === totalPages ? '#f3f4f6' : '#fff', color: currentPage === totalPages ? '#9ca3af' : '#374151', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Próxima <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* MODAL DE DETALHES DA REQUISIÇÃO */}
      {selectedRequisitionId && (
        <RequisitionModal requisitionId={selectedRequisitionId} onClose={() => setSelectedRequisitionId(null)} />
      )}
    </>
  );
}

// Componente do MODAL de Detalhes
function RequisitionModal({ requisitionId, onClose }: { requisitionId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['requisition', requisitionId], queryFn: () => maintenanceService.requisition(requisitionId) });
  const mutation = useMutation({
    mutationFn: (status: RequisitionStatus) => maintenanceService.updateStatus(requisitionId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['requisition', requisitionId] });
      void queryClient.invalidateQueries({ queryKey: ['requisitions'] });
    },
  });
  const requisition = query.data;

  const mockHistory = [
    { id: 1, action: 'Requisição Aberta', date: '25/09/2026 às 10:30', user: 'solicitante@teste.com' },
    { id: 2, action: 'Status alterado para "Em análise"', date: '26/09/2026 às 09:15', user: 'operador@maintaina.com' }
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '24px', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <span className="eyebrow">Detalhes da Requisição</span>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>{requisition?.number ?? requisitionId}</h2>
          </div>
          <button onClick={onClose} className="icon-button" aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        {query.isLoading ? (
          <div className="empty-state" style={{ padding: '40px' }}><RefreshCw className="spin" size={20} /> A carregar detalhes...</div>
        ) : requisition ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <span
                  className="status-badge"
                  style={{
                    backgroundColor: getStatusColor(requisition.status),
                    color: '#111827',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontWeight: 600,
                    display: 'inline-block',
                  }}
                >
                  {statusLabels[requisition.status ?? 'aberta']}
                </span>
                <span className={`priority ${requisition.priority ?? 'media'}`}>{requisition.priority ?? 'No priority'}</span>
              </div>
              
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: '12px' }}>{requisition.description ?? 'Description pending'}</h3>
              
              <dl className="detail-list" style={{ marginBottom: '20px' }}>
                <div><dt>Requester</dt><dd>{requisition.requesterEmail ?? 'Not provided'}</dd></div>
                <div><dt>Phone</dt><dd>{requisition.requesterPhone ?? 'Not provided'}</dd></div>
                <div><dt>Location</dt><dd>{requisition.locationId ?? 'Not assigned'}</dd></div>
                <div><dt>Category</dt><dd>{requisition.categoryId ?? 'Not assigned'}</dd></div>
              </dl>

              {requisition.photoUrl && (
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Foto do Problema</h4>
                  <img src={requisition.photoUrl} alt="Foto anexada" style={{ maxWidth: '100%', borderRadius: '8px', border: '1px solid #d1d5db' }} />
                </div>
              )}

              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} /> Histórico de Atividade
                </h4>
                <ul style={{ listStyle: 'none', paddingLeft: '8px', margin: 0, borderLeft: '2px solid #e5e7eb' }}>
                  {mockHistory.map((item, index) => (
                    <li key={item.id} style={{ position: 'relative', paddingLeft: '20px', paddingBottom: index !== mockHistory.length - 1 ? '12px' : '0' }}>
                      <span style={{ position: 'absolute', left: '-5px', top: '4px', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#9ca3af' }}></span>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#111827' }}>{item.action}</p>
                      <span style={{ fontSize: '11px', color: '#6b7280' }}>{item.date} • {item.user}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Painel lateral de Workflow dentro do Modal */}
            <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>Alterar Status</h4>
              <div className="status-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    className={status === requisition.status ? 'selected' : ''}
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate(status)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db', background: status === requisition.status ? '#e0f2fe' : '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                  >
                    <span className={`status-dot ${status}`} />
                    <span style={{ fontSize: '13px', fontWeight: 500 }}>{statusLabels[status]}</span>
                  </button>
                ))}
              </div>
              {mutation.isSuccess && <p style={{ marginTop: '12px', color: '#16a34a', fontSize: '12px', fontWeight: 500 }}>✓ Atualizado com sucesso!</p>}
            </div>

          </div>
        ) : (
          <div className="empty-state">Requisição não encontrada.</div>
        )}

      </div>
    </div>
  );
}

function ReferencePage({ type }: { type: 'locations' | 'categories' }) {
  const query = useQuery({ queryKey: [type], queryFn: type === 'locations' ? maintenanceService.locations : maintenanceService.categories });
  const title = type === 'locations' ? 'Locations' : 'Categories';

  return (
    <>
      <PageHeading
        eyebrow="Reference data"
        title={title}
        action={
          <button className="primary-button compact" disabled title={`The backend ${type} create endpoint is not implemented yet`}>
            <Database size={16} /> Add {type === 'locations' ? 'location' : 'category'}
          </button>
        }
      />
      <section className="reference-grid">
        {query.data?.map((item) => (
          <article className="reference-card" key={item.id}>
            <div className="reference-icon">{type === 'locations' ? <MapPin size={18} /> : <Tag size={18} />}</div>
            <div>
              <h2>{item.name}</h2>
              <p>{item.description ?? 'No description provided.'}</p>
            </div>
          </article>
        ))}
      </section>
      {!query.isLoading && !query.data?.length && <div className="empty-state panel">No {title.toLowerCase()} returned by the API.</div>}
    </>
  );
}

function UsersPage() {
  const query = useQuery({ queryKey: ['users'], queryFn: maintenanceService.users });

  return (
    <>
      <PageHeading eyebrow="Directory" title="People" />
      <section className="panel table-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">Connected users</p><h2>Team directory</h2></div>
          <span className="result-count">{query.data?.total ?? 0} people</span>
        </div>
        {query.data?.data.length ? (
          <div className="people-list">
            {query.data.data.map((user) => (
              <div className="person-row" key={user.id}>
                <div className="avatar">{user.name[0]?.toUpperCase()}</div>
                <div><strong>{user.name}</strong><span>{user.email}</span></div>
                <span className="role-chip">{user.role ?? 'member'}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state"><Users size={23} /><strong>No people returned</strong><span>The users endpoint is connected and ready for persisted records.</span></div>
        )}
      </section>
    </>
  );
}

export default App;