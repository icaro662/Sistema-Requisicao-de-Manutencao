import { MigrationInterface, QueryRunner } from 'typeorm';

export class RequisitionHistory1710000000001 implements MigrationInterface {
  name = 'RequisitionHistory1710000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS historico_alteracoes (
        id varchar(36) NOT NULL,
        requisicao_id varchar(36) NOT NULL,
        usuario_id varchar(36) NULL,
        usuario_nome varchar(255) NOT NULL,
        acao varchar(50) NOT NULL,
        descricao text NOT NULL,
        status_anterior varchar(30) NULL,
        status_novo varchar(30) NULL,
        referencia_id varchar(36) NULL,
        criado_em datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        atualizado_em datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        KEY IDX_historico_alteracoes_requisicao (requisicao_id),
        PRIMARY KEY (id),
        CONSTRAINT FK_historico_alteracoes_requisicao FOREIGN KEY (requisicao_id) REFERENCES requisicoes (id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS historico_alteracoes');
  }
}
