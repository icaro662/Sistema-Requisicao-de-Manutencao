import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestMaterial } from '../models/request-material.entity';
import { Requisition } from '../models/requisition.entity';
import { CreateRequestMaterialDto } from '../dtos/request-material.dto';
import { UserRole } from '../models/user.entity';

@Injectable()
export class RequestMaterialService {
  constructor(
    @InjectRepository(RequestMaterial)
    private readonly requestMaterialsRepository: Repository<RequestMaterial>,
    @InjectRepository(Requisition)
    private readonly requisitionsRepository: Repository<Requisition>,
  ) {}

  async findByRequisitionId(requisitionId: string): Promise<RequestMaterial[]> {
    return this.requestMaterialsRepository.find({
      where: { requisitionId },
      order: { createdAt: 'DESC' },
    });
  }

  async create(requisitionId: string, dto: CreateRequestMaterialDto): Promise<RequestMaterial> {
    const requisition = await this.requisitionsRepository.findOne({ where: { id: requisitionId } });
    if (!requisition) throw new NotFoundException('Requisição não encontrada');

    const material = this.requestMaterialsRepository.create({
      requisitionId,
      materialsNeeded: dto.materialsNeeded,
      reason: dto.reason || null,
    });

    return this.requestMaterialsRepository.save(material);
  }
}
