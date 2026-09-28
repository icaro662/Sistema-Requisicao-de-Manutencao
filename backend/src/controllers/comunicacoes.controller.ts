import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { UserRole } from '../models/user.entity';
import { NotificationsService } from '../services/notifications.service';

/**
 * Histórico de comunicações enviadas (notificações no aplicativo e e-mails),
 * com canal, destinatário e resultado do envio.
 */
@Controller('comunicacoes')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.MANAGER, UserRole.ADMIN)
export class ComunicacoesController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll() {
    return this.notificationsService.listCommunications();
  }
}
