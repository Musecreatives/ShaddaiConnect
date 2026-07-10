import { Injectable, NotFoundException } from '@nestjs/common';
import type { Plan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

export interface PlanDto {
  id: number;
  name: string;
  planType: string;
  priceNaira: number;
  durationHours: number | null;
  validityDays: number | null;
  simultaneousUse: number;
  dataCapMb: number | null;
  bandwidthDownKbps: number | null;
  bandwidthUpKbps: number | null;
  active: boolean;
  createdAt: Date;
}

function toPlanDto(plan: Plan): PlanDto {
  return {
    id: plan.id,
    name: plan.name,
    planType: plan.planType,
    priceNaira: Number(plan.priceNaira),
    durationHours: plan.durationHours,
    validityDays: plan.validityDays,
    simultaneousUse: plan.simultaneousUse,
    dataCapMb: plan.dataCapMb === null ? null : Number(plan.dataCapMb),
    bandwidthDownKbps: plan.bandwidthDownKbps,
    bandwidthUpKbps: plan.bandwidthUpKbps,
    active: plan.active,
    createdAt: plan.createdAt,
  };
}

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublic(): Promise<PlanDto[]> {
    const plans = await this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { priceNaira: 'asc' },
    });
    return plans.map(toPlanDto);
  }

  async findAll(): Promise<PlanDto[]> {
    const plans = await this.prisma.plan.findMany({ orderBy: { id: 'asc' } });
    return plans.map(toPlanDto);
  }

  async findOneOrThrow(id: number): Promise<Plan> {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException(`Plan ${id} not found`);
    return plan;
  }

  async create(dto: CreatePlanDto): Promise<PlanDto> {
    const plan = await this.prisma.plan.create({
      data: {
        name: dto.name,
        planType: dto.planType,
        priceNaira: dto.priceNaira,
        durationHours: dto.durationHours,
        validityDays: dto.validityDays,
        simultaneousUse: dto.simultaneousUse ?? 1,
        dataCapMb: dto.dataCapMb,
        bandwidthDownKbps: dto.bandwidthDownKbps,
        bandwidthUpKbps: dto.bandwidthUpKbps,
        active: dto.active ?? true,
      },
    });
    return toPlanDto(plan);
  }

  async update(id: number, dto: UpdatePlanDto): Promise<PlanDto> {
    await this.findOneOrThrow(id);
    const plan = await this.prisma.plan.update({
      where: { id },
      data: {
        name: dto.name,
        planType: dto.planType,
        priceNaira: dto.priceNaira,
        durationHours: dto.durationHours,
        validityDays: dto.validityDays,
        simultaneousUse: dto.simultaneousUse,
        dataCapMb: dto.dataCapMb,
        bandwidthDownKbps: dto.bandwidthDownKbps,
        bandwidthUpKbps: dto.bandwidthUpKbps,
        active: dto.active,
      },
    });
    return toPlanDto(plan);
  }
}
