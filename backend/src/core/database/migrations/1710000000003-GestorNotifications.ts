import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from 'typeorm';

/**
 * Campo "Gestor" na requisição + sistema de notificações:
 * - `requisicoes.gestor_id`: gestor destinatário das notificações;
 * - `notificacoes`: mensagens endereçadas ao gestor (sino/tela);
 * - `comunicacoes`: histórico do que foi enviado (aplicativo e e-mail),
 *   com canal e resultado do envio.
 *
 * Todas as verificações deixam a migration segura tanto para um banco criado
 * pelas migrations anteriores quanto para um banco já sincronizado.
 */
export class GestorAndNotifications1710000000003 implements MigrationInterface {
  name = 'GestorAndNotifications1710000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    const requisitions = await queryRunner.getTable('requisicoes');
    if (requisitions && !requisitions.columns.some((column) => column.name === 'gestor_id')) {
      await queryRunner.addColumn('requisicoes', new TableColumn({
        name: 'gestor_id',
        type: 'varchar',
        length: '36',
        isNullable: true,
      }));
    }

    await this.createTableIfMissing(queryRunner, new Table({
      name: 'notificacoes',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'requisicao_id', type: 'varchar', length: '36', isNullable: true },
        { name: 'requisicao_numero', type: 'varchar', length: '20', isNullable: true },
        { name: 'destinatario_id', type: 'varchar', length: '36' },
        { name: 'mensagem', type: 'varchar', length: '500' },
        { name: 'status', type: 'varchar', length: '30', isNullable: true },
        { name: 'criado_em', type: 'datetime', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
        {
          name: 'atualizado_em',
          type: 'datetime',
          precision: 6,
          default: 'CURRENT_TIMESTAMP(6)',
          onUpdate: 'CURRENT_TIMESTAMP(6)',
        },
      ],
      indices: [
        new TableIndex({ name: 'IDX_notificacoes_destinatario', columnNames: ['destinatario_id'] }),
        new TableIndex({ name: 'IDX_notificacoes_criado', columnNames: ['criado_em'] }),
      ],
    }));

    await this.createTableIfMissing(queryRunner, new Table({
      name: 'comunicacoes',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'requisicao_id', type: 'varchar', length: '36', isNullable: true },
        { name: 'requisicao_numero', type: 'varchar', length: '20', isNullable: true },
        { name: 'destinatario_id', type: 'varchar', length: '36', isNullable: true },
        { name: 'destinatario_nome', type: 'varchar', length: '255' },
        { name: 'destinatario_email', type: 'varchar', length: '255', isNullable: true },
        { name: 'canal', type: 'varchar', length: '20', default: "'aplicacao'" },
        { name: 'assunto', type: 'varchar', length: '200' },
        { name: 'conteudo', type: 'text' },
        { name: 'resultado', type: 'varchar', length: '20', default: "'enviado'" },
        { name: 'resultado_detalhe', type: 'varchar', length: '500', isNullable: true },
        { name: 'criado_em', type: 'datetime', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
        {
          name: 'atualizado_em',
          type: 'datetime',
          precision: 6,
          default: 'CURRENT_TIMESTAMP(6)',
          onUpdate: 'CURRENT_TIMESTAMP(6)',
        },
      ],
      indices: [
        new TableIndex({ name: 'IDX_comunicacoes_destinatario', columnNames: ['destinatario_id'] }),
        new TableIndex({ name: 'IDX_comunicacoes_criado', columnNames: ['criado_em'] }),
      ],
    }));
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('comunicacoes');
    await queryRunner.dropTable('notificacoes');

    const requisitions = await queryRunner.getTable('requisicoes');
    if (requisitions?.columns.some((column) => column.name === 'gestor_id')) {
      await queryRunner.dropColumn('requisicoes', 'gestor_id');
    }
  }

  private async createTableIfMissing(queryRunner: QueryRunner, table: Table): Promise<void> {
    if (!(await queryRunner.hasTable(table.name))) {
      await queryRunner.createTable(table);
    }
  }
}
