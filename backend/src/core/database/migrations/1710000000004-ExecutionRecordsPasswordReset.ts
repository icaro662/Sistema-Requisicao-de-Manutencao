import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

/**
 * Completa o esquema com o que o código já usa, mas que as migrations anteriores
 * não criavam:
 * - `registros_execucao`: histórico de execuções do executor (uma requisição
 *   pode ter vários registros);
 * - `materiais_solicitacao`: pedidos de material feitos durante o atendimento;
 * - `usuarios.token_reset_senha` / `usuarios.token_reset_expira`: token de
 *   redefinição de senha.
 *
 * Também alinha o esquema ao gerado pelo TypeORM (igual ao banco de
 * desenvolvimento, mantido pelo `DB_SYNCHRONIZE=true`): nomes dos índices
 * únicos (`UQ_*` -> `IDX_*`) e a FK de `historico_alteracoes` (nome e regra de
 * exclusão que a entidade `RequisitionHistory` espera).
 *
 * Todas as verificações deixam a migration segura tanto para um banco criado
 * pelas migrations anteriores quanto para um banco já sincronizado.
 */
export class ExecutionRecordsPasswordReset1710000000004 implements MigrationInterface {
  name = 'ExecutionRecordsPasswordReset1710000000004';

  async up(queryRunner: QueryRunner): Promise<void> {
    await this.createTableIfMissing(queryRunner, new Table({
      name: 'registros_execucao',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'requisicao_id', type: 'varchar', length: '36' },
        { name: 'executor_id', type: 'varchar', length: '255' },
        { name: 'executor_nome', type: 'varchar', length: '255' },
        { name: 'descricao_execucao', type: 'text' },
        { name: 'data_atendimento', type: 'datetime' },
        { name: 'materiais_utilizados', type: 'text', isNullable: true },
        { name: 'observacoes', type: 'text', isNullable: true },
        { name: 'foto_url', type: 'varchar', length: '255', isNullable: true },
        { name: 'criado_em', type: 'datetime', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
        {
          name: 'atualizado_em',
          type: 'datetime',
          precision: 6,
          default: 'CURRENT_TIMESTAMP(6)',
          onUpdate: 'CURRENT_TIMESTAMP(6)',
        },
      ],
      foreignKeys: [this.requisitionForeignKey('FK_677287e73afb5dd79af7743c5a4')],
    }));

    await this.createTableIfMissing(queryRunner, new Table({
      name: 'materiais_solicitacao',
      columns: [
        { name: 'id', type: 'varchar', length: '36', isPrimary: true },
        { name: 'requisicao_id', type: 'varchar', length: '36' },
        { name: 'material_necessario', type: 'text' },
        { name: 'motivo', type: 'text', isNullable: true },
        { name: 'criado_em', type: 'datetime', precision: 6, default: 'CURRENT_TIMESTAMP(6)' },
        {
          name: 'atualizado_em',
          type: 'datetime',
          precision: 6,
          default: 'CURRENT_TIMESTAMP(6)',
          onUpdate: 'CURRENT_TIMESTAMP(6)',
        },
      ],
      foreignKeys: [this.requisitionForeignKey('FK_e1151d900c22318d371543157b7')],
    }));

    const users = await queryRunner.getTable('usuarios');
    if (users && !users.columns.some((column) => column.name === 'token_reset_senha')) {
      await queryRunner.addColumn('usuarios', new TableColumn({
        name: 'token_reset_senha',
        type: 'varchar',
        length: '64',
        isNullable: true,
      }));
    }
    if (users && !users.columns.some((column) => column.name === 'token_reset_expira')) {
      await queryRunner.addColumn('usuarios', new TableColumn({
        name: 'token_reset_expira',
        type: 'datetime',
        isNullable: true,
      }));
    }

    for (const index of UNIQUE_INDEXES) {
      await this.renameIndex(queryRunner, index.table, index.from, index.to);
    }

    await this.alignHistoryForeignKey(queryRunner, 'up');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await this.alignHistoryForeignKey(queryRunner, 'down');

    for (const index of UNIQUE_INDEXES) {
      await this.renameIndex(queryRunner, index.table, index.to, index.from);
    }

    const users = await queryRunner.getTable('usuarios');
    for (const column of ['token_reset_expira', 'token_reset_senha']) {
      if (users?.columns.some((entry) => entry.name === column)) {
        await queryRunner.dropColumn('usuarios', column);
      }
    }

    await this.dropTableIfPresent(queryRunner, 'materiais_solicitacao');
    await this.dropTableIfPresent(queryRunner, 'registros_execucao');
  }

  private async createTableIfMissing(queryRunner: QueryRunner, table: Table): Promise<void> {
    if (!(await queryRunner.hasTable(table.name))) {
      await queryRunner.createTable(table);
    }
  }

  private async dropTableIfPresent(queryRunner: QueryRunner, tableName: string): Promise<void> {
    if (await queryRunner.hasTable(tableName)) {
      await queryRunner.dropTable(tableName);
    }
  }

  /** Troca o nome de um índice preservando colunas e unicidade (idempotente). */
  private async renameIndex(queryRunner: QueryRunner, tableName: string, from: string, to: string): Promise<void> {
    const table = await queryRunner.getTable(tableName);
    if (!table) return;

    const hasIndex = (name: string) => table.indices.some((index) => index.name === name);
    const current = table.indices.find((index) => index.name === from);
    if (!current || hasIndex(to)) return;

    await queryRunner.dropIndex(tableName, current);
    await queryRunner.createIndex(tableName, new TableIndex({
      name: to,
      columnNames: current.columnNames,
      isUnique: current.isUnique,
      isSpatial: current.isSpatial,
      isFulltext: current.isFulltext,
      where: current.where,
    }));
  }

  private requisitionForeignKey(name: string): TableForeignKey {
    return new TableForeignKey({
      name,
      columnNames: ['requisicao_id'],
      referencedTableName: 'requisicoes',
      referencedColumnNames: ['id'],
      onDelete: 'NO ACTION',
      onUpdate: 'NO ACTION',
    });
  }

  /**
   * A FK de `historico_alteracoes` nas migrations antigas (`1710000000001` e
   * `1710000000002`) tem outro nome e `ON DELETE CASCADE`; a entidade
   * `RequisitionHistory` e o banco sincronizado usam o padrão do TypeORM.
   * No `up` deixa no formato da entidade, no `down` devolve o das migrations
   * antigas. Nunca há requisição dura excluída no código (só status), então a
   * troca não muda comportamento em execução.
   */
  private async alignHistoryForeignKey(queryRunner: QueryRunner, direction: 'up' | 'down'): Promise<void> {
    const table = await queryRunner.getTable(HISTORY_TABLE);
    if (!table) return;

    const target = direction === 'up'
      ? { fk: HISTORY_FK_TYPEORM, index: HISTORY_FK_TYPEORM, onDelete: 'NO ACTION', onUpdate: 'NO ACTION' }
      : { fk: HISTORY_FK_LEGACY, index: HISTORY_FK_INDEX_LEGACY, onDelete: 'CASCADE', onUpdate: 'RESTRICT' };

    const foreignKeys = table.foreignKeys.filter((foreignKey) => foreignKey.referencedTableName === 'requisicoes');
    const supportIndexes = table.indices.filter((index) => index.columnNames.length === 1 && index.columnNames[0] === 'requisicao_id');
    const targetIndex = supportIndexes.find((index) => index.name === target.index);
    const extraIndexes = supportIndexes.filter((index) => index.name !== target.index);
    if (foreignKeys.length === 1 && foreignKeys[0].name === target.fk && targetIndex && !extraIndexes.length) return;

    for (const foreignKey of foreignKeys) {
      await queryRunner.dropForeignKey(HISTORY_TABLE, foreignKey);
    }
    // Pode haver mais de um índice de apoio (o legado das migrations antigas e o
    // gerado pelo TypeORM): remove todos, exceto o nome que estamos buscando.
    for (const index of extraIndexes) {
      await queryRunner.dropIndex(HISTORY_TABLE, index);
    }

    // O índice de apoio é criado antes da FK: ela reaproveita o índice que já
    // existir no lugar de gerar outro com nome diferente.
    const refreshed = await queryRunner.getTable(HISTORY_TABLE);
    if (refreshed && !refreshed.indices.some((index) => index.name === target.index)) {
      await queryRunner.createIndex(HISTORY_TABLE, new TableIndex({
        name: target.index,
        columnNames: ['requisicao_id'],
      }));
    }

    await queryRunner.query(`
      ALTER TABLE ${HISTORY_TABLE}
      ADD CONSTRAINT \`${target.fk}\`
      FOREIGN KEY (requisicao_id) REFERENCES requisicoes (id)
      ON DELETE ${target.onDelete} ON UPDATE ${target.onUpdate}
    `);
  }
}

/** Índices únicos com o nome que o TypeORM gera (igual ao banco sincronizado). */
const UNIQUE_INDEXES: Array<{ table: string; from: string; to: string }> = [
  { table: 'usuarios', from: 'UQ_usuarios_email', to: 'IDX_446adfc18b35418aac32ae0b7b' },
  { table: 'arquivos', from: 'UQ_arquivos_nome', to: 'IDX_ee0710af285f7fda86188e9e1b' },
  { table: 'requisicoes', from: 'UQ_requisicoes_numero', to: 'IDX_31becd90da90ef1680e445cf9e' },
  { table: 'locais', from: 'UQ_locais_nome', to: 'IDX_64320ca4be574b81c57b95484b' },
  { table: 'categorias', from: 'UQ_categorias_nome', to: 'IDX_de8a2d8979f7820616e31dc1e1' },
];

const HISTORY_TABLE = 'historico_alteracoes';
/** Nome da FK/índice gerado pelo TypeORM para `RequisitionHistory`. */
const HISTORY_FK_TYPEORM = 'FK_c0d6e4c08f87e4f027119753438';
/** Nome usado nas migrations `1710000000001`/`1710000000002`. */
const HISTORY_FK_LEGACY = 'FK_historico_alteracoes_requisicao';
const HISTORY_FK_INDEX_LEGACY = 'IDX_historico_alteracoes_requisicao';
