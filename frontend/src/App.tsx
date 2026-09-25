import { FormEvent, useState } from 'react';
import { Navigate, NavLink, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, ArrowUpRight, BarChart3, ClipboardList, Database, LogOut, MapPin, Menu, RefreshCw, ShieldCheck, Tag, Users, X } from 'lucide-react';
import { apiErrorMessage } from './services/api';
import { authService } from './services/authService';
import { maintenanceService } from './services/maintenanceService';
import { useAuthStore } from './store/authStore';
import type { RequisitionStatus } from './types';

const statusLabels: Record<RequisitionStatus, string> = {
  aberta: 'Open', em_analise: 'Under review', em_atendimento: 'In service', aguardando_material: 'Waiting material', concluida: 'Completed', cancelada: 'Cancelled',
};
const statusOptions = Object.keys(statusLabels) as RequisitionStatus[];

function App() {
  const authenticated = useAuthStore((state) => Boolean(state.sessionEmail));
  return <Routes><Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <LoginPage />} /><Route element={<ProtectedLayout />}><Route path="/*" element={<Shell />} /></Route><Route path="*" element={<Navigate to={authenticated ? '/' : '/login'} replace />} /></Routes>;
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
  const mutation = useMutation({ mutationFn: () => authService.login(form), onSuccess: (result) => { signIn(result.email ?? form.email); navigate('/'); }, onError: (reason) => setError(apiErrorMessage(reason)) });
  const submit = (event: FormEvent) => { event.preventDefault(); setError(''); mutation.mutate(); };
  return <main className="login-page"><div className="login-aside"><div className="brand-mark">M</div><p className="eyebrow">Maintenance operations</p><h1>Keep every request moving.</h1><p className="login-copy">One calm workspace for facilities teams to triage, assign, and close the work that keeps your sites running.</p><div className="signal-list"><span><Activity size={16} /> Live operational overview</span><span><ShieldCheck size={16} /> Role-ready API foundation</span></div></div><form className="login-card" onSubmit={submit}><p className="eyebrow">Welcome back</p><h2>Sign in to Maintaina</h2><p className="muted">Use your maintenance system credentials.</p><label>Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@company.com" /></label><label>Password<input type="password" required minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Minimum 8 characters" /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" disabled={mutation.isPending}>{mutation.isPending ? 'Connecting...' : 'Continue'} <ArrowUpRight size={17} /></button><p className="api-note">The current backend returns a session-ready response while token issuance is being completed.</p></form></main>;
}

function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const signOut = useAuthStore((state) => state.signOut);
  const sessionEmail = useAuthStore((state) => state.sessionEmail);
  const navItems = [{ to: '/', label: 'Overview', icon: BarChart3 }, { to: '/requisitions', label: 'Requisitions', icon: ClipboardList }, { to: '/locations', label: 'Locations', icon: MapPin }, { to: '/categories', label: 'Categories', icon: Tag }, { to: '/users', label: 'People', icon: Users }];
  return <div className="app-shell"><aside className={`sidebar ${menuOpen ? 'open' : ''}`}><div className="sidebar-top"><div className="brand-lockup"><span className="brand-mark small">M</span><span>maintaina</span></div><button className="icon-button mobile-only" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X size={19} /></button></div><p className="nav-label">Workspace</p><nav>{navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}><Icon size={18} />{label}</NavLink>)}</nav><div className="sidebar-footer"><div className="avatar">{sessionEmail?.[0]?.toUpperCase()}</div><div className="account"><strong>{sessionEmail?.split('@')[0]}</strong><span>{sessionEmail}</span></div><button className="icon-button" onClick={signOut} aria-label="Sign out"><LogOut size={17} /></button></div></aside>{menuOpen && <button className="scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}<div className="content"><header className="topbar"><button className="icon-button mobile-only" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu size={21} /></button><div><span className="topbar-kicker">Facilities control room</span><strong>Tuesday, September 25, 2026</strong></div><div className="connection-pill"><span /> API connected</div></header><main className="main-content"><Routes><Route path="/" element={<Dashboard />} /><Route path="/requisitions" element={<Requisitions />} /><Route path="/requisitions/:id" element={<RequisitionDetail />} /><Route path="/locations" element={<ReferencePage type="locations" />} /><Route path="/categories" element={<ReferencePage type="categories" />} /><Route path="/users" element={<UsersPage />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></main></div></div>;
}

function PageHeading({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) { return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>{action}</div>; }

function Dashboard() {
  const summary = useQuery({ queryKey: ['dashboard'], queryFn: maintenanceService.dashboard });
  const requisitions = useQuery({ queryKey: ['requisitions'], queryFn: () => maintenanceService.requisitions() });
  const data = summary.data;
  return <><PageHeading eyebrow="Overview" title="Good morning, operator." action={<button className="secondary-button" onClick={() => { void summary.refetch(); void requisitions.refetch(); }}><RefreshCw size={16} /> Refresh</button>} /><div className="hero-strip"><div><span className="hero-label">Today at a glance</span><h2>Keep the floor clear for the work that matters.</h2><p>Track incoming maintenance demand and move each request toward resolution.</p></div><div className="hero-icon"><Activity size={31} /></div></div><section className="metric-grid"><Metric label="All requests" value={data?.total ?? 0} icon={<ClipboardList />} tone="blue" /><Metric label="Open" value={data?.byStatus?.aberta ?? 0} icon={<Activity />} tone="mint" /><Metric label="In service" value={data?.byStatus?.em_atendimento ?? 0} icon={<ArrowUpRight />} tone="gold" /><Metric label="Completed" value={data?.byStatus?.concluida ?? 0} icon={<ShieldCheck />} tone="rose" /></section><div className="content-grid"><section className="panel"><div className="panel-heading"><div><p className="eyebrow">Latest activity</p><h2>Recent requisitions</h2></div><NavLink className="text-link" to="/requisitions">View all <ArrowUpRight size={15} /></NavLink></div><RequisitionTable rows={requisitions.data?.data ?? []} loading={requisitions.isLoading} /></section><section className="panel status-panel"><div className="panel-heading"><div><p className="eyebrow">Distribution</p><h2>By status</h2></div></div>{statusOptions.map((status) => <div className="status-row" key={status}><span className={`status-dot ${status}`} /><span>{statusLabels[status]}</span><strong>{data?.byStatus?.[status] ?? 0}</strong></div>)}</section></div></>;
}

function Metric({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) { return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div><span>{label}</span><strong>{value}</strong></div><ArrowUpRight className="metric-arrow" size={16} /></div>; }

function Requisitions() {
  const [search, setSearch] = useState('');
  const query = useQuery({ queryKey: ['requisitions', search], queryFn: () => maintenanceService.requisitions(search ? { search } : undefined) });
  return <><PageHeading eyebrow="Work queue" title="Requisitions" action={<button className="primary-button compact" disabled title="The backend create endpoint is not implemented yet"><ClipboardList size={16} /> New request</button>} /><div className="toolbar"><div className="search-field"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by description or requester" /></div><span className="result-count">{query.data?.total ?? 0} total requests</span></div><section className="panel table-panel"><RequisitionTable rows={query.data?.data ?? []} loading={query.isLoading} /></section></>;
}

function RequisitionTable({ rows, loading }: { rows: Array<import('./types').Requisition>; loading: boolean }) { if (loading) return <div className="empty-state"><RefreshCw className="spin" size={20} /> Loading requests...</div>; if (!rows.length) return <div className="empty-state"><ClipboardList size={23} /><strong>No requisitions yet</strong><span>Requests returned by the API will appear here.</span></div>; return <div className="table-wrap"><table><thead><tr><th>Reference</th><th>Description</th><th>Priority</th><th>Status</th><th /></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td><NavLink className="row-link" to={`/requisitions/${row.id}`}>{row.number ?? row.id.slice(0, 8)}</NavLink><small>{row.requesterEmail ?? 'No requester'}</small></td><td>{row.description ?? 'Description pending'}</td><td><span className={`priority ${row.priority ?? 'media'}`}>{row.priority ?? '—'}</span></td><td><span className={`status-badge ${row.status ?? 'aberta'}`}>{statusLabels[row.status ?? 'aberta']}</span></td><td><NavLink to={`/requisitions/${row.id}`} className="icon-button" aria-label="Open requisition"><ArrowUpRight size={17} /></NavLink></td></tr>)}</tbody></table></div>; }

function RequisitionDetail() {
  const { id = '' } = useParams();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['requisition', id], queryFn: () => maintenanceService.requisition(id) });
  const mutation = useMutation({ mutationFn: (status: RequisitionStatus) => maintenanceService.updateStatus(id, status), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['requisition', id] }); void queryClient.invalidateQueries({ queryKey: ['requisitions'] }); } });
  const requisition = query.data;
  return <><PageHeading eyebrow="Requisition detail" title={requisition?.number ?? id} action={<NavLink className="secondary-button" to="/requisitions">Back to queue</NavLink>} />{query.isLoading ? <div className="empty-state"><RefreshCw className="spin" size={20} /> Loading request...</div> : requisition ? <div className="detail-grid"><section className="panel detail-main"><div className="detail-top"><span className={`status-badge ${requisition.status ?? 'aberta'}`}>{statusLabels[requisition.status ?? 'aberta']}</span><span className={`priority ${requisition.priority ?? 'media'}`}>{requisition.priority ?? 'No priority'}</span></div><h2>{requisition.description ?? 'Description pending'}</h2><dl className="detail-list"><div><dt>Requester</dt><dd>{requisition.requesterEmail ?? 'Not provided'}</dd></div><div><dt>Phone</dt><dd>{requisition.requesterPhone ?? 'Not provided'}</dd></div><div><dt>Location</dt><dd>{requisition.locationId ?? 'Not assigned'}</dd></div><div><dt>Category</dt><dd>{requisition.categoryId ?? 'Not assigned'}</dd></div></dl></section><section className="panel"><div className="panel-heading"><div><p className="eyebrow">Workflow</p><h2>Update status</h2></div></div><div className="status-actions">{statusOptions.map((status) => <button key={status} className={status === requisition.status ? 'selected' : ''} disabled={mutation.isPending} onClick={() => mutation.mutate(status)}><span className={`status-dot ${status}`} />{statusLabels[status]}</button>)}</div>{mutation.isError && <p className="form-error">{apiErrorMessage(mutation.error)}</p>}{mutation.isSuccess && <p className="success-message">Status updated successfully.</p>}</section></div> : <div className="empty-state">This requisition could not be found.</div>}</>;
}

function ReferencePage({ type }: { type: 'locations' | 'categories' }) { const query = useQuery({ queryKey: [type], queryFn: type === 'locations' ? maintenanceService.locations : maintenanceService.categories }); const title = type === 'locations' ? 'Locations' : 'Categories'; return <><PageHeading eyebrow="Reference data" title={title} action={<button className="primary-button compact" disabled title={`The backend ${type} create endpoint is not implemented yet`}><Database size={16} /> Add {type === 'locations' ? 'location' : 'category'}</button>} /><section className="reference-grid">{query.data?.map((item) => <article className="reference-card" key={item.id}><div className="reference-icon">{type === 'locations' ? <MapPin size={18} /> : <Tag size={18} />}</div><div><h2>{item.name}</h2><p>{item.description ?? 'No description provided.'}</p></div></article>)}</section>{!query.isLoading && !query.data?.length && <div className="empty-state panel">No {title.toLowerCase()} returned by the API.</div>}</>; }

function UsersPage() { const query = useQuery({ queryKey: ['users'], queryFn: maintenanceService.users }); return <><PageHeading eyebrow="Directory" title="People" /><section className="panel table-panel"><div className="panel-heading"><div><p className="eyebrow">Connected users</p><h2>Team directory</h2></div><span className="result-count">{query.data?.total ?? 0} people</span></div>{query.data?.data.length ? <div className="people-list">{query.data.data.map((user) => <div className="person-row" key={user.id}><div className="avatar">{user.name[0]?.toUpperCase()}</div><div><strong>{user.name}</strong><span>{user.email}</span></div><span className="role-chip">{user.role ?? 'member'}</span></div>)}</div> : <div className="empty-state"><Users size={23} /><strong>No people returned</strong><span>The users endpoint is connected and ready for persisted records.</span></div>}</section></>; }

export default App;
