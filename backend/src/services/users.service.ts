import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  findAll(): { data: unknown[]; total: number } { return { data: [], total: 0 }; }
  findOne(id: string): { id: string } { return { id }; }
}
