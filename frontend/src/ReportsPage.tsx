import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, RefreshCw } from 'lucide-react';
import { maintenanceService } from './services/maintenanceService';
import type { Category, Location, RequisitionPriority, RequisitionStatus, User } from './types';

const statusLabels: Record<RequisitionStatus, string> = {
  aberta: 'Aberta',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_material: 'Aguardando material',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const priorityOptions: Array<{ value: RequisitionPriority; label: string }> = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const statusOptions = Object.entries(statusLabels) as Array<[RequisitionStatus, string]>;

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    locationId: '',
    executorId: '',
    categoryId: '',
    priority: '',
    status: '',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);
  const locations = useQuery({ queryKey: ['locations'], queryFn: maintenanceService.locations });
  const categories = useQuery({ queryKey: ['categories'], queryFn: maintenanceService.categories });
  const executors = useQuery({ queryKey: ['executors'], queryFn: maintenanceService.executors });
  const report = useQuery({
    queryKey: ['report', appliedFilters],
    queryFn: () => maintenanceService.report({
      ...appliedFilters,
      priority: appliedFilters.priority as RequisitionPriority || undefined,
      status: appliedFilters.status as RequisitionStatus || undefined,
    }),
  });

  const updateFilter = (field: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setAppliedFilters(filters);
  };

  const clear = () => {
    const empty = { from: '', to: '', locationId: '', executorId: '', categoryId: '', priority: '', status: '' };
    setFilters(empty);
    setAppliedFilters(empty);
  };

  const exportReport = async (format: 'pdf' | 'excel') => {
    setExporting(format);
    try {
      const blob = await maintenanceService.exportReport(format, {
        ...appliedFilters,
        priority: appliedFilters.priority as RequisitionPriority || undefined,
        status: appliedFilters.status as RequisitionStatus || undefined,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'pdf' ? 'relatorio-requisicoes.pdf' : 'relatorio-requisicoes.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Painel do gestor</p>
        <h1>Relatórios</h1>
      </div>
      <BarChart3 size={22} />
    </div>

    <section className="panel report-filters-panel">
      <div className="panel-heading">
        <div><p className="eyebrow">Consulta personalizada</p><h2>Filtros do relatório</h2></div>
      </div>
      <form className="report-filters" onSubmit={submit}>
        <label>Data inicial<input type="date" value={filters.from} onChange={(event) => updateFilter('from', event.target.value ? `${event.target.value}T00:00:00.000Z` : '')} /></label>
        <label>Data final<input type="date" value={filters.to} onChange={(event) => updateFilter('to', event.target.value ? `${event.target.value}T23:59:59.999Z` : '')} /></label>
        <label>Local<select value={filters.locationId} onChange={(event) => updateFilter('locationId', event.target.value)}><option value="">Todos os locais</option>{locations.data?.map((item: Location) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Executor<select value={filters.executorId} onChange={(event) => updateFilter('executorId', event.target.value)}><option value="">Todos os executores</option>{executors.data?.map((item: User) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Categoria<select value={filters.categoryId} onChange={(event) => updateFilter('categoryId', event.target.value)}><option value="">Todas as categorias</option>{categories.data?.map((item: Category) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Prioridade<select value={filters.priority} onChange={(event) => updateFilter('priority', event.target.value)}><option value="">Todas as prioridades</option>{priorityOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label>Status<select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}><option value="">Todos os status</option>{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <div className="report-filter-actions"><button className="primary-button" type="submit"><BarChart3 size={16} /> Gerar relatório</button><button className="secondary-button" type="button" onClick={clear}>Limpar</button></div>
      </form>
    </section>

    <section className="report-summary-grid">
      <div className="metric-card"><div><span>Total encontrado</span><strong>{report.data?.total ?? 0}</strong></div></div>
      {statusOptions.slice(0, 3).map(([status, label]) => <div className="metric-card" key={status}><div><span>{label}</span><strong>{report.data?.byStatus?.[status] ?? 0}</strong></div></div>)}
    </section>

    <section className="report-charts-grid">
      <article className="panel report-chart-panel">
        <div className="panel-heading"><div><p className="eyebrow">Distribuição</p><h2>Por status</h2></div></div>
        <div className="report-bars">{statusOptions.map(([status, label]) => { const value = report.data?.byStatus?.[status] ?? 0; const maximum = Math.max(...Object.values(report.data?.byStatus ?? { total: 1 }), 1); return <div className="report-bar-row" key={status}><span>{label}</span><div className="report-bar-track"><div className={`report-bar ${status}`} style={{ width: `${(value / maximum) * 100}%` }} /></div><strong>{value}</strong></div>; })}</div>
      </article>
      <article className="panel report-chart-panel">
        <div className="panel-heading"><div><p className="eyebrow">Evolução</p><h2>Por período</h2></div></div>
        <div className="report-bars">{Object.entries(report.data?.byPeriod ?? {}).length ? Object.entries(report.data?.byPeriod ?? {}).map(([period, value]) => { const maximum = Math.max(...Object.values(report.data?.byPeriod ?? { total: 1 }), 1); return <div className="report-bar-row" key={period}><span>{period}</span><div className="report-bar-track"><div className="report-bar period" style={{ width: `${(value / maximum) * 100}%` }} /></div><strong>{value}</strong></div>; }) : <div className="empty-state compact-empty">Nenhum período encontrado.</div>}</div>
      </article>
    </section>

    <section className="panel table-panel">
      <div className="panel-heading"><div><p className="eyebrow">Resultado</p><h2>Requisições encontradas</h2></div><div className="report-export-actions">{report.isFetching && <RefreshCw className="spin" size={18} />}<button className="secondary-button compact" disabled={Boolean(exporting) || !report.data?.total} onClick={() => void exportReport('pdf')}><Download size={15} />{exporting === 'pdf' ? 'Gerando...' : 'PDF'}</button><button className="secondary-button compact" disabled={Boolean(exporting) || !report.data?.total} onClick={() => void exportReport('excel')}><Download size={15} />{exporting === 'excel' ? 'Gerando...' : 'Excel'}</button></div></div>
      {!report.data?.rows.length ? <div className="empty-state"><BarChart3 size={23} /><strong>Nenhum resultado encontrado</strong><span>Ajuste os filtros para consultar outras requisições.</span></div> : <div className="table-wrap"><table><thead><tr><th>Número</th><th>Descrição</th><th>Prioridade</th><th>Status</th><th>Data</th></tr></thead><tbody>{report.data.rows.map((row) => <tr key={row.id}><td>{row.number}</td><td>{row.description}</td><td><span className={`priority ${row.priority}`}>{row.priority}</span></td><td><span className={`status-badge ${row.status}`}>{row.status ? statusLabels[row.status] : '—'}</span></td><td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString('pt-BR') : '—'}</td></tr>)}</tbody></table></div>}
    </section>
  </>;
}
