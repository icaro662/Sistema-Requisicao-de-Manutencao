import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('locais')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome', unique: true })
  name: string;

  @Column({ name: 'descricao', type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'criado_em' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'atualizado_em' })
  updatedAt: Date;
}
