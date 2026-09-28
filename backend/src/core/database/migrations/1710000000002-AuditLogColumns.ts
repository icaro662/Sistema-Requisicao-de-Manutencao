import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

/**
 * Transforma `historico_alteracoes` em um log de auditoria completo:
 * permite registrar eventos que não pertencem a uma requisição (usuários,
 * locais, categorias, sistema) e adiciona o Resultado da operação.
 *
 * As verificações deixam a migration segura tanto para um banco criado pela
 * migration anterior quanto para um banco já sincronizado pelo TypeORM.
 */
export class AuditLogColumns1710000000002 implements MigrationInterface {
  name = 'AuditLogColumns1710000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    let table = await queryRunner.getTable('historico_alteracoes');
    if (!table) return;

    // `requisicao_id` passa a ser opcional: a FK precisa ser recriada.
    const requisitionForeignKeys = table.foreignKeys
      .filter((foreignKey: TableForeignKey) => foreignKey.referencedTableName === 'requisicoes');
    for (const foreignKey of requisitionForeignKeys) {
      await queryRunner.dropForeignKey('historico_alteracoes', foreignKey);
    }
    await queryRunner.query('ALTER TABLE historico_alteracoes MODIFY requisicao_id varchar(36) NULL');

    table = (await queryRunner.getTable('historico_alteracoes')) ?? table;
    const stillLinked = table.foreignKeys
      .some((foreignKey: TableForeignKey) => foreignKey.referencedTableName === 'requisicoes');
    if (!stillLinked) {
      await queryRunner.query(`
        ALTER TABLE historico_alteracoes
        ADD CONSTRAINT FK_historico_alteracoes_requisicao
        FOREIGN KEY (requisicao_id) REFERENCES requisicoes (id) ON DELETE CASCADE
      `);
    }

    const hasColumn = (name: string) => table.columns.some((column) => column.name === name);
    if (!hasColumn('entidade')) {
      await queryRunner.query(`ALTER TABLE historico_alteracoes ADD entidade varchar(30) NOT NULL DEFAULT 'requisicao'`);
    }
    if (!hasColumn('entidade_id')) {
      await queryRunner.query('ALTER TABLE historico_alteracoes ADD entidade_id varchar(36) NULL');
    }
    if (!hasColumn('resultado')) {
      await queryRunner.query(`ALTER TABLE historico_alteracoes ADD resultado varchar(20) NOT NULL DEFAULT 'sucesso'`);
    }
    if (!hasColumn('resultado_detalhe')) {
      await queryRunner.query('ALTER TABLE historico_alteracoes ADD resultado_detalhe varchar(500) NULL');
    }

    const hasIndex = (name: string) => table.indices.some((index) => index.name === name);
    if (!hasIndex('IDX_historico_alteracoes_usuario')) {
      await queryRunner.query('CREATE INDEX IDX_historico_alteracoes_usuario ON historico_alteracoes (usuario_id)');
    }
    if (!hasIndex('IDX_historico_alteracoes_criado')) {
      await queryRunner.query('CREATE INDEX IDX_historico_alteracoes_criado ON historico_alteracoes (criado_em)');
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('historico_alteracoes');
    if (!table) return;

    const hasIndex = (name: string) => table.indices.some((index) => index.name === name);
    if (hasIndex('IDX_historico_alteracoes_criado')) {
      await queryRunner.query('DROP INDEX IDX_historico_alteracoes_criado ON historico_alteracoes');
    }
    if (hasIndex('IDX_historico_alteracoes_usuario')) {
      await queryRunner.query('DROP INDEX IDX_historico_alteracoes_usuario ON historico_alteracoes');
    }

    const hasColumn = (name: string) => table.columns.some((column) => column.name === name);
    for (const column of ['resultado_detalhe', 'resultado', 'entidade_id', 'entidade']) {
      if (hasColumn(column)) {
        await queryRunner.query(`ALTER TABLE historico_alteracoes DROP COLUMN ${column}`);
      }
    }

    const requisitionForeignKeys = table.foreignKeys
      .filter((foreignKey: TableForeignKey) => foreignKey.referencedTableName === 'requisicoes');
    for (const foreignKey of requisitionForeignKeys) {
      await queryRunner.dropForeignKey('historico_alteracoes', foreignKey);
    }
    // Pode falhar se existirem eventos sem requisição; remova-os antes de reverter.
    await queryRunner.query('ALTER TABLE historico_alteracoes MODIFY requisicao_id varchar(36) NOT NULL');
    await queryRunner.query(`
      ALTER TABLE historico_alteracoes
      ADD CONSTRAINT FK_historico_alteracoes_requisicao
      FOREIGN KEY (requisicao_id) REFERENCES requisicoes (id) ON DELETE CASCADE
    `);
  }
}
