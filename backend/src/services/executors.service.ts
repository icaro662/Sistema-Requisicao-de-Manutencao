import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../models/user.entity';

@Injectable()
export class ExecutorsService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<Omit<User, 'password'>[]> {
    return this.usersRepository.find({
      where: { role: UserRole.EXECUTOR, isActive: true },
      order: { name: 'ASC' },
    }).then((users) => users.map(({ password: _password, ...user }) => user));
  }
}
