import { Controller, Get } from '@nestjs/common';
import { ExecutorsService } from '../services/executors.service';

@Controller('executors')
export class ExecutorsController {
  constructor(private readonly executorsService: ExecutorsService) {}

  @Get()
  findAll() { return this.executorsService.findAll(); }
}
