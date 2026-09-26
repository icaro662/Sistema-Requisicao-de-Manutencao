import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { NotificationsService } from '../services/notifications.service';
import { RequestUser } from '../common/interfaces/request-user.interface';

@Controller('notificacoes')
@UseGuards(JwtGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findForUser(@CurrentUser() user: RequestUser) {
    return this.notificationsService.findForUser(user.id, user.role);
  }
}
