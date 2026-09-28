import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { AuditoriaQueryDto } from '../dtos/auditoria/auditoria-query.dto';
import { UserRole } from '../models/user.entity';
import { AuditoriaService } from '../services/auditoria.service';

@Controller('auditoria')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  /** Log de auditoria do sistema (Quem, O quê, Quando, Resultado). */
  @Get()
  findAll(@Query() query: AuditoriaQueryDto) {
    return this.auditoriaService.findAll(query);
  }
}
