import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../models/location.entity';
import { Requisition } from '../models/requisition.entity';
import { User } from '../models/user.entity';
import { LocationsController } from '../controllers/locations.controller';
import { LocationsService } from '../services/locations.service';
import { HistoryModule } from './history.module';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Requisition, User]), HistoryModule],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
