import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Communication } from '../models/communication.entity';
import { Notification } from '../models/notification.entity';
import { Requisition } from '../models/requisition.entity';
import { Location } from '../models/location.entity';
import { User, UserRole } from '../models/user.entity';
import { RequisitionStatus } from '../core/enums/status.enum';
import { CommunicationChannel, CommunicationOutcome } from '../core/enums/communication.enum';
import { EmailProvider } from '../core/providers/email.provider';
import { buildNotificationTemplate, NotificationTemplate } from '../core/templates/notification.template';

/** Notificação no formato consumido pelo front (sino e tela de notificações). */
export interface NotificationView {
  id: string;
  message: string;
  requisitionId: string;
  requisitionNumber: string;
  status: RequisitionStatus | null;
  createdAt: Date;
  read: boolean;
}

/** O que motivou a notificação enviada ao gestor. */
export interface NotifyOptions {
  /** Evento que motivou a notificação (ex.: "Status atualizado"). */
  event: string;
  /** Status anterior, quando o evento alterou o status. */
  previousStatus?: RequisitionStatus | null;
  /** Usuário que provocou o evento. */
  actorId?: string | null;
  /** Texto livre enviado junto (notificação manual). */
  message?: string | null;
  /** Quando false, o autor também recebe a notificação (padrão: não notifica a si mesmo). */
  skipActor?: boolean;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(Communication)
    private readonly communicationsRepository: Repository<Communication>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
    private readonly emailProvider: EmailProvider,
  ) {}

  /**
   * Notificações do usuário: o gestor recebe as mensagens endereçadas a ele
   * (sistema de notificações); nos demais perfis o sino continua derivado das
   * próprias requisições, como antes.
   */
  async findForUser(userId: string, userRole: string): Promise<NotificationView[]> {
    if (userRole === UserRole.MANAGER) {
      const notifications = await this.notificationsRepository.find({
        where: { recipientId: userId },
        order: { createdAt: 'DESC' },
        take: 100,
      });
      return notifications.map((notification) => this.toView(notification));
    }

    const qb = this.requisitionsRepository.createQueryBuilder('r');

    if (userRole === 'solicitante') {
      qb.where('r.requesterId = :userId', { userId });
    } else if (userRole === 'executor') {
      qb.where('r.executorId = :userId', { userId });
    }

    const requisitions = await qb.orderBy('r.createdAt', 'DESC').getMany();

    return requisitions.map((r) => ({
      id: r.id,
      message: `Solicitação ${r.number || r.id.slice(0, 8)} atualizada`,
      requisitionId: r.id,
      requisitionNumber: r.number || '',
      status: r.status,
      createdAt: r.createdAt,
      read: false,
    }));
  }

  /**
   * Envia uma notificação ao gestor da requisição: cria a notificação no
   * aplicativo, registra a comunicação e envia o e-mail com o resumo das
   * alterações (Status, Executor, Local e Nº da requisição).
   *
   * Sem gestor definido, avisa toda a equipe de gestão. O próprio autor do
   * evento não é notificado (`skipActor`), e uma falha de notificação nunca
   * interrompe a operação que a originou. Retorna as notificações criadas
   * (vazio quando não há destinatário).
   */
  async notifyManager(requisition: Requisition, options: NotifyOptions): Promise<Notification[]> {
    try {
      const recipients = await this.resolveRecipients(requisition, options.skipActor === false ? null : options.actorId);
      if (!recipients.length) {
        this.logger.warn(`Nenhum gestor para notificar sobre a requisição ${requisition.number ?? requisition.id}`);
        return [];
      }

      const [executor, location, actorName] = await Promise.all([
        this.describeUser(requisition.executorId),
        this.describeLocation(requisition.locationId),
        this.describeUser(options.actorId),
      ]);

      const template = buildNotificationTemplate({
        event: options.event,
        number: requisition.number ?? requisition.id.slice(0, 8),
        status: requisition.status,
        previousStatus: options.previousStatus ?? null,
        executorName: executor,
        locationName: location,
        actorName,
        message: options.message ?? null,
      });

      const created: Notification[] = [];
      for (const recipient of recipients) {
        created.push(await this.deliver(requisition, recipient, template));
      }
      return created;
    } catch (error) {
      this.logger.error(
        `Falha ao notificar gestor da requisição ${requisition.number ?? requisition.id}: ${(error as Error).message}`,
      );
      return [];
    }
  }

  /** Histórico de comunicações enviadas, mais recente primeiro. */
  async listCommunications(limit = 100): Promise<Communication[]> {
    return this.communicationsRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /** Grava a notificação no aplicativo, registra a comunicação e envia o e-mail. */
  private async deliver(
    requisition: Requisition,
    recipient: User,
    template: NotificationTemplate,
  ): Promise<Notification> {
    const notification = await this.notificationsRepository.save(
      this.notificationsRepository.create({
        requisitionId: requisition.id,
        requisitionNumber: requisition.number ?? null,
        recipientId: recipient.id,
        message: template.message.slice(0, 500),
        status: requisition.status,
      }),
    );

    await this.recordCommunication({
      requisition,
      recipient,
      channel: CommunicationChannel.APPLICATION,
      subject: template.subject,
      body: template.message,
      outcome: CommunicationOutcome.SENT,
    });

    const email = await this.emailProvider.send(recipient.email, template.subject, template.html);
    await this.recordCommunication({
      requisition,
      recipient,
      channel: CommunicationChannel.EMAIL,
      subject: template.subject,
      body: template.html,
      outcome: email.outcome,
      detail: email.detail ?? null,
    });

    return notification;
  }

  private async recordCommunication(input: {
    requisition: Requisition;
    recipient: User;
    channel: CommunicationChannel;
    subject: string;
    body: string;
    outcome: CommunicationOutcome;
    detail?: string | null;
  }): Promise<void> {
    await this.communicationsRepository.save(
      this.communicationsRepository.create({
        requisitionId: input.requisition.id,
        requisitionNumber: input.requisition.number ?? null,
        recipientId: input.recipient.id,
        recipientName: input.recipient.name,
        recipientEmail: input.recipient.email,
        channel: input.channel,
        subject: input.subject.slice(0, 200),
        body: input.body,
        outcome: input.outcome,
        detail: input.detail ?? null,
      }),
    );
  }

  /**
   * Gestor da requisição; sem definição, toda a equipe de gestão ativa.
   * `skipUserId` remove um destinatário (o próprio autor do evento).
   */
  private async resolveRecipients(requisition: Requisition, skipUserId?: string | null): Promise<User[]> {
    let recipients: User[] = [];

    if (requisition.gestorId) {
      const gestor = await this.usersRepository.findOne({ where: { id: requisition.gestorId } });
      if (gestor?.isActive) recipients = [gestor];
    }

    if (!recipients.length) {
      recipients = await this.usersRepository.find({
        where: { role: UserRole.MANAGER, isActive: true },
        order: { name: 'ASC' },
      });
    }

    return recipients.filter((user) => user.id !== skipUserId);
  }

  private async describeUser(userId?: string | null): Promise<string | null> {
    if (!userId) return null;
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    return user?.name ?? null;
  }

  private async describeLocation(locationId?: string | null): Promise<string | null> {
    if (!locationId) return null;
    const location = await this.locationsRepository.findOne({ where: { id: locationId } });
    return location?.name ?? null;
  }

  private toView(notification: Notification): NotificationView {
    return {
      id: notification.id,
      message: notification.message,
      requisitionId: notification.requisitionId ?? '',
      requisitionNumber: notification.requisitionNumber ?? '',
      status: notification.status,
      createdAt: notification.createdAt,
      read: false,
    };
  }
}
