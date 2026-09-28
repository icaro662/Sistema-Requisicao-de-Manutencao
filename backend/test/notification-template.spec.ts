import { RequisitionStatus } from '../src/core/enums/status.enum';
import { buildNotificationTemplate } from '../src/core/templates/notification.template';

describe('buildNotificationTemplate', () => {
  const context = {
    event: 'Status atualizado',
    number: 'REQ-00003',
    status: RequisitionStatus.IN_SERVICE,
    previousStatus: RequisitionStatus.ANALYSIS,
    executorName: 'Ana Executor',
    locationName: 'Almoxarifado',
    actorName: 'Gestor Dev',
    changedAt: new Date('2026-09-28T12:00:00Z'),
  };

  it('carries status, executor, local and requisition number in the e-mail', () => {
    const template = buildNotificationTemplate(context);

    expect(template.html).toContain('Nº Requisição');
    expect(template.html).toContain('REQ-00003');
    expect(template.html).toContain('Em atendimento');
    expect(template.html).toContain('Ana Executor');
    expect(template.html).toContain('Almoxarifado');
    expect(template.subject).toBe('[REQ-00003] Status atualizado — Em atendimento');
  });

  it('summarizes the change from the previous status', () => {
    const template = buildNotificationTemplate(context);

    expect(template.message).toBe('Status alterado de "Em análise" para "Em atendimento"');
    expect(template.html).toContain('Resumo das alterações');
    expect(template.html).toContain('Em análise');
    expect(template.html).toContain('Gestor Dev');
  });

  it('uses the free-form message when there is no status change', () => {
    const template = buildNotificationTemplate({
      event: 'Notificação ao gestor',
      number: 'REQ-00010',
      status: RequisitionStatus.OPEN,
      message: 'Material aprovado, pode seguir.',
    });

    expect(template.message).toBe('Notificação ao gestor — Material aprovado, pode seguir.');
  });

  it('shows an unassigned executor when there is none', () => {
    const template = buildNotificationTemplate({
      event: 'Nova requisição',
      number: 'REQ-00011',
      status: RequisitionStatus.OPEN,
    });

    expect(template.html).toContain('Não atribuído');
    expect(template.message).toBe('Nova requisição — status "Aberta"');
  });

  it('escapes free-form text before writing the e-mail body', () => {
    const template = buildNotificationTemplate({
      event: 'Notificação ao gestor',
      number: 'REQ-00012',
      status: RequisitionStatus.OPEN,
      message: '<script>alert("x")</script>',
    });

    expect(template.html).not.toContain('<script>');
    expect(template.html).toContain('&lt;script&gt;');
  });
});
