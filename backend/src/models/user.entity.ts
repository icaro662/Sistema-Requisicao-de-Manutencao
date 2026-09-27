import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum UserRole {
  REQUESTER = 'solicitante',
  EXECUTOR = 'executor',
  MANAGER = 'gestor',
  ADMIN = 'admin',
}

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome' })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'senha' })
  password: string;

  @Column({
    name: 'telefone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string | null;

  @Column({ name: 'perfil', type: 'enum', enum: UserRole, default: UserRole.REQUESTER })
  role: UserRole;

  @Column({
    name: 'local_id',
    type: 'varchar',
    nullable: true,
  })
  locationId: string | null;

  @Column({ name: 'ativo', default: true })
  isActive: boolean;

  @Column({ name: 'versao_token', type: 'int', default: 0 })
  tokenVersion: number;

  @CreateDateColumn({ name: 'criado_em' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  updatedAt: Date;
}
