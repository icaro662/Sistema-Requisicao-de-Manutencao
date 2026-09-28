import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { LocationsService } from '../services/locations.service';
import { CreateLocationDto } from '../dtos/locations/create-location.dto';
import { UpdateLocationDto } from '../dtos/locations/update-location.dto';
import { UserRole } from '../models/user.entity';

@Controller('locais')
@UseGuards(JwtGuard, RolesGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  findAll() {
    return this.locationsService.findAll();
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() dto: CreateLocationDto, @CurrentUser() user: RequestUser) {
    return this.locationsService.create(dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateLocationDto, @CurrentUser() user: RequestUser) {
    return this.locationsService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.locationsService.remove(id, user);
  }
}
