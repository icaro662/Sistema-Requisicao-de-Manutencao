import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import { AuditEntity, HistoryAction } from '../models/history.entity';
import { User, UserRole } from '../models/user.entity';
import { HistoryService } from './history.service';

/** Quem realizou a operação (quando omitido, o próprio usuário é o responsável). */
export interface UserActor {
  id: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly historyService: HistoryService,
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
  }, actor?: UserActor | null): Promise<User> {
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

    const saved = await this.usersRepository.save(user);

    // Auditoria: quem criou o usuário (sem ator = cadastro público/auto).
    await this.historyService.record({
      entityType: AuditEntity.USER,
      entityId: saved.id,
      userId: actor?.id ?? saved.id,
      action: HistoryAction.USER_CREATED,
      description: actor
        ? `Usuário ${saved.name} (${saved.email}) criado com perfil ${saved.role}`
        : `Cadastro público realizado por ${saved.name} (${saved.email}) com perfil ${saved.role}`,
    });

    return saved;
  }

  async updateUser(id: string, data: {
    name?: string;
    phone?: string;
    role?: UserRole;
    password?: string;
  }, actor?: UserActor | null): Promise<Omit<User, 'password'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const previousRole = user.role;
    const changed: string[] = [];

    if (data.name !== undefined) { user.name = data.name.trim(); changed.push('nome'); }
    if (data.phone !== undefined) { user.phone = data.phone.trim() || null; changed.push('telefone'); }
    if (data.role !== undefined) { user.role = data.role; changed.push('perfil'); }
    if (data.password) {
      user.password = await hash(data.password, 12);
      user.tokenVersion += 1;
      changed.push('senha');
    }

    const savedUser = await this.usersRepository.save(user);

    // Auditoria: quem alterou o usuário e o que mudou.
    const roleDetail = data.role !== undefined && data.role !== previousRole
      ? ` (perfil de ${previousRole} para ${data.role})`
      : '';
    await this.historyService.record({
      entityType: AuditEntity.USER,
      entityId: id,
      userId: actor?.id ?? null,
      action: HistoryAction.USER_UPDATED,
      description: `Usuário ${savedUser.name} (${savedUser.email}) atualizado: ${changed.join(', ')}${roleDetail}`,
    });

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

  /** Gestores ativos — usados para escolher o gestor de uma requisição. */
  async findManagers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.usersRepository.find({
      where: { role: UserRole.MANAGER, isActive: true },
      order: { name: 'ASC' },
    });

    return users.map(({ password: _password, ...user }) => user);
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
