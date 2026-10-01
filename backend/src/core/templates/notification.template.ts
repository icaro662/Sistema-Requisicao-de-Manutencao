import { statusLabel } from '../enums/status-labels';

/** Dados usados para montar a notificação de uma requisição. */
export interface NotificationContext {
  /** Evento que gerou a notificação (ex.: "Status atualizado"). */
  event: string;
  /** Nº da requisição (ex.: REQ-00003). */
  number: string;
  /** Status atual da requisição. */
  status: string;
  /** Status anterior, quando o evento mudou o status. */
  previousStatus?: string | null;
  /** Executor responsável (quando atribuído). */
  executorName?: string | null;
  /** Local da requisição. */
  locationName?: string | null;
  /** Quem provocou o evento (ex.: quem alterou o status). */
  actorName?: string | null;
  /** Texto livre enviado junto (notificação manual). */
  message?: string | null;
  /** Quando o evento aconteceu. */
  changedAt?: Date;
}

/** Notificação pronta: texto no aplicativo e e-mail com o resumo das alterações. */
export interface NotificationTemplate {
  /** Texto exibido no sino e na tela de notificações. */
  message: string;
  /** Assunto do e-mail. */
  subject: string;
  /** Corpo HTML do e-mail. */
  html: string;
}

const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (char) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char] ?? char
  ));

const formatDate = (value?: Date | null): string =>
  value
    ? value.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

/**
 * Monta a notificação de uma requisição com os dados exigidos pelo template:
 * Status, Executor, Local e Nº da requisição — além do resumo das alterações
 * (de → para, responsável e data) usado no e-mail enviado ao gestor.
 */
export function buildNotificationTemplate(context: NotificationContext): NotificationTemplate {
  const status = statusLabel(context.status);
  const previous = context.previousStatus ? statusLabel(context.previousStatus) : null;
  const executor = context.executorName?.trim() || 'Não atribuído';
  const location = context.locationName?.trim() || '—';
  const number = context.number || '—';

  const statusChanged = Boolean(previous && previous !== status);
  const note = context.message?.trim();

  const message = statusChanged
    ? `Status alterado de "${previous}" para "${status}"`
    : note
      ? `${context.event} — ${note}`
      : `${context.event} — status "${status}"`;

  const subject = `[${number}] ${context.event} — ${status}`;

  const rows: Array<[string, string]> = [
    ['Nº Requisição', number],
    ['Status', status],
    ['Executor', executor],
    ['Local', location],
  ];

  const summary = [
    previous && statusChanged ? `<li><strong>Status:</strong> ${escapeHtml(previous)} → <strong>${escapeHtml(status)}</strong></li>` : '',
    context.actorName?.trim() ? `<li><strong>Responsável:</strong> ${escapeHtml(context.actorName.trim())}</li>` : '',
    `<li><strong>Data:</strong> ${formatDate(context.changedAt ?? new Date())}</li>`,
    note ? `<li><strong>Observação:</strong> ${escapeHtml(note)}</li>` : '',
  ].filter(Boolean).join('');

  const html = `
    <div style="font-family: 'DM Sans', sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #183247;">
      <h2 style="color: #102a43; margin-bottom: 4px;">${escapeHtml(context.event)}</h2>
      <p style="color: #52636b; margin-bottom: 20px;">${escapeHtml(message)}</p>

      <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        ${rows.map(([label, value]) => `
          <tr>
            <th style="text-align: left; padding: 8px 12px; background: #f2f6f5; border: 1px solid #e1e8e7; color: #7b8c90; font-size: 12px; text-transform: uppercase; letter-spacing: .04em;">${label}</th>
            <td style="padding: 8px 12px; border: 1px solid #e1e8e7; color: #102a43; font-size: 14px;">${escapeHtml(value)}</td>
          </tr>`).join('')}
      </table>

      <h3 style="color: #102a43; font-size: 14px; margin-bottom: 8px;">Resumo das alterações</h3>
      <ul style="color: #52636b; font-size: 14px; line-height: 1.7; margin: 0 0 20px; padding-left: 18px;">
        ${summary}
      </ul>

      <p style="color: #91a09f; font-size: 12px; line-height: 1.5; border-top: 1px solid #e1e8e7; padding-top: 16px;">
        Central de Operações de Manutenção — este é um resumo automático das alterações da requisição.
      </p>
    </div>
  `;

  return { message, subject, html };
}
