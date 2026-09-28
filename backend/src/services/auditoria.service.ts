import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequisitionHistory } from '../models/history.entity';
import { AuditoriaQueryDto } from '../dtos/auditoria/auditoria-query.dto';

export interface AuditoriaPage {
  data: RequisitionHistory[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class AuditoriaService {
  constructor(
    @InjectRepository(RequisitionHistory)
    private readonly historyRepository: Repository<RequisitionHistory>,
  ) {}

  /** Lista o log de auditoria (Quem, O quê, Quando, Resultado) com filtros. */
  async findAll(query: AuditoriaQueryDto): Promise<AuditoriaPage> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = Math.min(query.limit && query.limit > 0 ? query.limit : 10, 100);

    if (query.de && query.ate && new Date(query.de) > new Date(query.ate)) {
      throw new BadRequestException('A data inicial não pode ser posterior à data final');
    }

    const qb = this.historyRepository.createQueryBuilder('h');

    if (query.usuario?.trim()) {
      const term = query.usuario.trim();
      qb.andWhere('(h.userName LIKE :usuario OR h.userId = :usuarioId)', {
        usuario: `%${term}%`,
        usuarioId: term,
      });
    }

    if (query.acao) qb.andWhere('h.action = :acao', { acao: query.acao });
    if (query.entidade) qb.andWhere('h.entityType = :entidade', { entidade: query.entidade });
    if (query.resultado) qb.andWhere('h.resultado = :resultado', { resultado: query.resultado });
    if (query.requisicaoId) qb.andWhere('h.requisitionId = :requisicaoId', { requisicaoId: query.requisicaoId });

    if (query.de) qb.andWhere('h.createdAt >= :de', { de: new Date(`${query.de}T00:00:00`) });
    if (query.ate) qb.andWhere('h.createdAt <= :ate', { ate: new Date(`${query.ate}T23:59:59.999`) });

    qb.orderBy('h.createdAt', 'DESC')
      .addOrderBy('h.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }
}
