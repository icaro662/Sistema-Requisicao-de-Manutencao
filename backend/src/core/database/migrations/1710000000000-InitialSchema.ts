import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1710000000000 implements MigrationInterface {
  name = 'InitialSchema1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id varchar(36) NOT NULL,
        nome varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        senha varchar(255) NOT NULL,
        telefone varchar(20) NULL,
        perfil enum ('solicitante', 'executor', 'gestor', 'admin') NOT NULL DEFAULT 'solicitante',
        local_id varchar(255) NULL,
        ativo tinyint NOT NULL DEFAULT 1,
        versao_token int NOT NULL DEFAULT 0,
        criado_em datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        atualizado_em datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE KEY UQ_usuarios_email (email),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS locais (
        id varchar(36) NOT NULL,
        nome varchar(255) NOT NULL,
        descricao text NULL,
        criado_em datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        atualizado_em datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE KEY UQ_locais_nome (nome),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id varchar(36) NOT NULL,
        nome varchar(255) NOT NULL,
        descricao text NULL,
        criado_em datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        atualizado_em datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE KEY UQ_categorias_nome (nome),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS requisicoes (
        id varchar(36) NOT NULL,
        numero varchar(255) NOT NULL,
        solicitante_id varchar(255) NOT NULL,
        local_id varchar(255) NOT NULL,
        categoria_id varchar(255) NOT NULL,
        descricao text NOT NULL,
        status enum ('aberta', 'em_analise', 'em_atendimento', 'aguardando_material', 'concluida', 'cancelada') NOT NULL DEFAULT 'aberta',
        prioridade enum ('baixa', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media',
        email_solicitante varchar(255) NOT NULL,
        telefone_solicitante varchar(255) NOT NULL,
        whatsapp_solicitante varchar(30) NULL,
        foto_url varchar(255) NULL,
        executor_id varchar(36) NULL,
        descricao_execucao text NULL,
        data_execucao datetime NULL,
        materiais_utilizados text NULL,
        observacoes text NULL,
        criado_em datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        atualizado_em datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        UNIQUE KEY UQ_requisicoes_numero (numero),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS arquivos (
        id varchar(36) NOT NULL,
        nome_arquivo varchar(255) NOT NULL,
        proprietario_id varchar(36) NOT NULL,
        criado_em datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        UNIQUE KEY UQ_arquivos_nome (nome_arquivo),
        PRIMARY KEY (id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS arquivos');
    await queryRunner.query('DROP TABLE IF EXISTS requisicoes');
    await queryRunner.query('DROP TABLE IF EXISTS categorias');
    await queryRunner.query('DROP TABLE IF EXISTS locais');
    await queryRunner.query('DROP TABLE IF EXISTS usuarios');
  }
}
