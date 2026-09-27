import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../models/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email: email.trim().toLowerCase() } });
  }

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: UserRole;
  }): Promise<User> {
    if (data.role === UserRole.REQUESTER) {
      throw new BadRequestException('Solicitantes devem usar o cadastro público.');
    }

    const user = this.usersRepository.create({
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: await hash(data.password, 12),
      phone: data.phone?.trim() || null,
      role: data.role ?? UserRole.REQUESTER,
      isActive: true,
      locationId: null,
      tokenVersion: 0,
    });

    return this.usersRepository.save(user);
  }

  async updateUser(id: string, data: {
    name?: string;
    phone?: string;
    role?: UserRole;
    password?: string;
  }): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (data.name !== undefined) user.name = data.name.trim();
    if (data.phone !== undefined) user.phone = data.phone.trim() || null;
    if (data.role !== undefined) user.role = data.role;
    if (data.password) {
      user.password = await hash(data.password, 12);
      user.tokenVersion += 1;
    }

    const savedUser = await this.usersRepository.save(user);
    const { password: _password, ...safeUser } = savedUser;
    return safeUser;
  }

  async incrementTokenVersion(id: string): Promise<User | null> {
    await this.usersRepository.increment({ id }, 'tokenVersion', 1);
    return this.usersRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<{ data: Omit<User, 'password'>[]; total: number }> {
    const [users, total] = await this.usersRepository.findAndCount({
      order: { name: 'ASC' },
    });

    return { data: users.map(({ password: _password, ...user }) => user), total };
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const { password: _password, ...safeUser } = user;
    return safeUser;
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { passwordResetToken: token } });
  }

  async saveUser(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
