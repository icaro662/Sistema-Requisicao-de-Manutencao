import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('arquivos')
export class UploadedFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome_arquivo', unique: true, length: 255 })
  filename: string;

  @Column({ name: 'proprietario_id', length: 36 })
  ownerId: string;

  @CreateDateColumn({ name: 'criado_em' })
  createdAt: Date;
}
