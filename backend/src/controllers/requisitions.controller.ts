import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { RequisitionsService } from '../services/requisitions.service';

@Controller('requisitions')
export class RequisitionsController {
  constructor(private readonly requisitionsService: RequisitionsService) {}

  @Get()
  findAll(@Query() _query: Record<string, string>) { return this.requisitionsService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.requisitionsService.findOne(id); }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.requisitionsService.updateStatus(id, status);
  }
}
