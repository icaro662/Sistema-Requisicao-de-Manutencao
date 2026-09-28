import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { UsersService } from '../services/users.service';

/** Gestores ativos, para definição do gestor responsável por uma requisição. */
@Controller('gestores')
@UseGuards(JwtGuard, RolesGuard)
export class GestoresController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findManagers();
  }
}
