import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequestUser } from '../common/interfaces/request-user.interface';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { JwtGuard } from '../core/guards/jwt.guard';
import { RolesGuard } from '../core/guards/roles.guard';
import { UserRole } from '../models/user.entity';
import { UsersService } from '../services/users.service';

@Controller('usuarios')
@UseGuards(JwtGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() { return this.usersService.findAll(); }

  @Post()
  async create(@Body() dto: CreateUserDto, @CurrentUser() currentUser: RequestUser) {
    const { password: _password, ...user } = await this.usersService.createUser(dto, currentUser);
    return user;
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto, @CurrentUser() currentUser: RequestUser) {
    return this.usersService.updateUser(id, dto, currentUser);
  }
}
