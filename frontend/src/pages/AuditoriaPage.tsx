import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, History, RefreshCw, ScrollText, Search, X } from 'lucide-react';
import { apiErrorMessage } from '../services/api';
import { maintenanceService } from '../services/maintenanceService';
import HistoryTimeline, { formatHistoryDate, historyActionLabel, historyActionLabels } from '../components/HistoryTimeline';
import type { AuditEntityValue, AuditFilters, AuditResult, HistoryAction } from '../types';

const PAGE_SIZE = 10;

const entityLabels: Record<AuditEntityValue, string> = {
  requisicao: 'Requisição',
  usuario: 'Usuário',
  local: 'Local',
  categoria: 'Categoria',
  sistema: 'Sistema',
};

interface ChipOption {
  value: string;
  label: string;
  tone?: string;
}

const actionOptions: ChipOption[] = (Object.keys(historyActionLabels) as HistoryAction[])
  .map((value) => ({ value, label: historyActionLabels[value] }))
  .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

// "Filtrar por:" — mesmos chips da lista de requisições (Todos + valores).
const resultadoOptions: ChipOption[] = [
  { value: '', label: 'Todos' },
  { value: 'sucesso', label: 'Sucesso', tone: 'success' },
  { value: 'falha', label: 'Falha', tone: 'failure' },
];

const entityOptions: ChipOption[] = [
  { value: '', label: 'Todos' },
  ...Object.entries(entityLabels).map(([value, label]) => ({
    value,
    label,
    tone: value === 'requisicao' || value === 'usuario' ? value : '',
  })),
];

const acaoOptions: ChipOption[] = [{ value: '', label: 'Todas' }, ...actionOptions];

const emptyFilters = { usuario: '', acao: '', entidade: '', resultado: '', de: '', ate: '' };

type FilterState = typeof emptyFilters;

export default function AuditoriaPage() {
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [page, setPage] = useState(1);
  const [historyTarget, setHistoryTarget] = useState<{ id: string; label: string } | null>(null);

  const query: AuditFilters = {
    usuario: filters.usuario || undefined,
    acao: (filters.acao || undefined) as HistoryAction | undefined,
    entidade: (filters.entidade || undefined) as AuditEntityValue | undefined,
    resultado: (filters.resultado || undefined) as AuditResult | undefined,
    de: filters.de || undefined,
    ate: filters.ate || undefined,
    page,
    limit: PAGE_SIZE,
  };

  const audit = useQuery({
    queryKey: ['auditoria', filters, page],
    queryFn: () => maintenanceService.auditoria(query),
    placeholderData: (previous) => previous,
  });

  const history = useQuery({
    queryKey: ['requisition-history', historyTarget?.id],
    queryFn: () => maintenanceService.requisitionHistory(historyTarget!.id),
    enabled: Boolean(historyTarget),
  });

  const requisition = useQuery({
    queryKey: ['requisition', historyTarget?.id],
    queryFn: () => maintenanceService.requisition(historyTarget!.id),
    enabled: Boolean(historyTarget),
  });

  // Como na lista de requisições, os filtros valem na hora (sem "Aplicar").
  const updateFilter = (field: keyof FilterState, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };

  const clear = () => {
    setFilters(emptyFilters);
    setPage(1);
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  const chipClass = (field: keyof FilterState, option: ChipOption) =>
    ['audit-chip', option.tone ? `tone-${option.tone}` : '', filters[field] === option.value ? 'active' : '']
      .filter(Boolean)
      .join(' ');

  const entries = audit.data?.data ?? [];
  const total = audit.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const error = audit.isError ? apiErrorMessage(audit.error) : '';

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">Administração</p>
        <h1>Auditoria</h1>
      </div>
      <ScrollText size={22} />
    </div>

    <div className="toolbar audit-toolbar">
      <div className="audit-toolbar-top">
        <div className="search-field">
          <Search size={15} />
          <input
            type="search"
            aria-label="Pesquisar por usuário"
            placeholder="Pesquisar por usuário ou e-mail..."
            value={filters.usuario}
            onChange={(event) => updateFilter('usuario', event.target.value)}
          />
        </div>
        <span className="result-count">
          {total} registro{total === 1 ? '' : 's'}
        </span>
      </div>

      <div className="audit-filter-row">
        <span className="audit-filter-label"><Filter size={14} /> Filtrar por:</span>
        {resultadoOptions.map((option) => (
          <button
            key={option.value || 'todos-resultado'}
            type="button"
            className={chipClass('resultado', option)}
            onClick={() => updateFilter('resultado', option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="audit-filter-row">
        <span className="audit-filter-label">Objeto:</span>
        {entityOptions.map((option) => (
          <button
            key={option.value || 'todos-objeto'}
            type="button"
            className={chipClass('entidade', option)}
            onClick={() => updateFilter('entidade', option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="audit-filter-row">
        <span className="audit-filter-label">Ação:</span>
        {acaoOptions.map((option) => (
          <button
            key={option.value || 'todas-acoes'}
            type="button"
            className={chipClass('acao', option)}
            onClick={() => updateFilter('acao', option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="audit-filter-row">
        <span className="audit-filter-label">Período:</span>
        <label className="audit-date">
          Data inicial
          <input type="date" value={filters.de} onChange={(event) => updateFilter('de', event.target.value)} />
        </label>
        <label className="audit-date">
          Data final
          <input type="date" value={filters.ate} onChange={(event) => updateFilter('ate', event.target.value)} />
        </label>
        {hasActiveFilters && (
          <button type="button" className="text-link audit-clear" onClick={clear}>
            <X size={13} /> Limpar filtros
          </button>
        )}
      </div>
    </div>

    {error && <p className="form-error">{error}</p>}

    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Log de operações</p>
          <h2>Registros de auditoria</h2>
        </div>
        <div className="report-export-actions">
          <button
            className="secondary-button compact"
            onClick={() => void audit.refetch()}
            disabled={audit.isFetching}
            aria-label="Atualizar auditoria"
          >
            <RefreshCw className={audit.isFetching ? 'spin' : undefined} size={15} /> Atualizar
          </button>
        </div>
      </div>

      {audit.isLoading ? (
        <div className="empty-state"><RefreshCw className="spin" size={18} /> Carregando auditoria...</div>
      ) : error ? (
        <div className="empty-state"><strong>Não foi possível carregar a auditoria</strong><span>Tente novamente em instantes.</span></div>
      ) : entries.length === 0 ? (
        <div className="empty-state">
          <ScrollText size={23} />
          <strong>Nenhum registro encontrado</strong>
          <span>Ajuste os filtros para consultar outras operações.</span>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Quando</th>
                  <th>Quem</th>
                  <th>Operação</th>
                  <th>Objeto</th>
                  <th>Resultado</th>
                  <th aria-label="Ações" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatHistoryDate(entry.createdAt)}</td>
                    <td>{entry.userName || 'Sistema'}<small>{entry.userId ? 'Usuário do sistema' : 'Automático'}</small></td>
                    <td>
                      {historyActionLabel(entry.action)}
                      <small>{entry.description}</small>
                    </td>
                    <td><span className={`audit-entity ${entry.entityType}`}>{entityLabels[entry.entityType] ?? entry.entityType}</span></td>
                    <td>
                      <span className={`audit-result ${entry.resultado}`}>
                        {entry.resultado === 'falha' ? 'Falha' : 'Sucesso'}
                      </span>
                      {entry.resultadoDetalhe && <small className="audit-result-detail">{entry.resultadoDetalhe}</small>}
                    </td>
                    <td>
                      {entry.requisitionId ? (
                        <button
                          className="secondary-button compact"
                          onClick={() => setHistoryTarget({ id: entry.requisitionId!, label: entry.description })}
                        >
                          <History size={14} /> Histórico completo
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="audit-pagination">
            <span>Página {page} de {totalPages}</span>
            <div>
              <button className="secondary-button compact" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                Anterior
              </button>
              <button className="secondary-button compact" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                Próxima
              </button>
            </div>
          </div>
        </>
      )}
    </section>

    {historyTarget && (
      <div className="audit-overlay" onClick={() => setHistoryTarget(null)}>
        <div className="audit-dialog" onClick={(event) => event.stopPropagation()}>
          <div className="audit-dialog-head">
            <div>
              <p className="eyebrow">Histórico completo</p>
              <h2>{requisition.data ? `${requisition.data.number} • ${requisition.data.description}` : 'Requisição'}</h2>
            </div>
            <button className="icon-button" onClick={() => setHistoryTarget(null)} aria-label="Fechar histórico">
              <X size={18} />
            </button>
          </div>
          <div className="audit-dialog-body">
            <HistoryTimeline
              entries={history.data ?? []}
              isLoading={history.isLoading}
              emptyMessage="Nenhuma alteração registrada para esta requisição."
            />
            {history.isError && <p className="form-error">{apiErrorMessage(history.error)}</p>}
          </div>
        </div>
      </div>
    )}
  </>;
}
