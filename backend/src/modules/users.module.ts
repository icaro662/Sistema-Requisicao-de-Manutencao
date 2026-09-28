import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../models/user.entity';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/users.service';
import { RolesGuard } from '../core/guards/roles.guard';
import { HistoryModule } from './history.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HistoryModule],
  controllers: [UsersController],
  providers: [UsersService, RolesGuard],
  exports: [UsersService],
})
export class UsersModule {}
