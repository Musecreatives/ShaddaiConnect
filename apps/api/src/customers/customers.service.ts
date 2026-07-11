import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AdminCustomerRow {
  id: number;
  name: string | null;
  phone: string | null;
  email: string | null;
  createdAt: Date;
  voucherCount: number;
  totalPaidNaira: number;
}

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(limit = 50, offset = 0): Promise<{ customers: AdminCustomerRow[]; total: number }> {
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.customer.count(),
    ]);

    const ids = customers.map((c) => c.id);
    const [voucherCounts, paymentSums] = await Promise.all([
      this.prisma.voucher.groupBy({
        by: ['customerId'],
        _count: { id: true },
        where: { customerId: { in: ids } },
      }),
      this.prisma.payment.groupBy({
        by: ['customerId'],
        _sum: { amountNaira: true },
        where: { customerId: { in: ids }, status: 'success' },
      }),
    ]);

    const voucherCountById = new Map(voucherCounts.map((v) => [v.customerId, v._count.id]));
    const paidById = new Map(paymentSums.map((p) => [p.customerId, Number(p._sum.amountNaira ?? 0)]));

    return {
      total,
      customers: customers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        createdAt: c.createdAt,
        voucherCount: voucherCountById.get(c.id) ?? 0,
        totalPaidNaira: paidById.get(c.id) ?? 0,
      })),
    };
  }
}
