import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { ExecutorsService } from '../services/executors.service';

@Controller('executores')
@UseGuards(JwtGuard, RolesGuard)
export class ExecutorsController {
  constructor(private readonly executorsService: ExecutorsService) {}

  @Get()
  findAll() {
    return this.executorsService.findAll();
  }
}
