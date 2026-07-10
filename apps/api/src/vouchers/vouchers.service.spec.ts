import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { VouchersService } from './vouchers.service';

const HOURLY_PLAN = {
  id: 1,
  name: 'Test Hourly',
  planType: 'hourly' as const,
  priceNaira: 100,
  durationHours: 2,
  validityDays: null,
  simultaneousUse: 1,
  dataCapMb: null,
  bandwidthDownKbps: null,
  bandwidthUpKbps: null,
  active: true,
  createdAt: new Date(),
};

const MONTHLY_PLAN = {
  ...HOURLY_PLAN,
  id: 2,
  name: 'Test Monthly',
  planType: 'monthly' as const,
  durationHours: null,
  validityDays: 30,
  simultaneousUse: 3,
};

describe('VouchersService', () => {
  let service: VouchersService;
  let tx: {
    plan: { findUnique: jest.Mock };
    voucher: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
    radCheck: { create: jest.Mock; deleteMany: jest.Mock; findFirst: jest.Mock; update: jest.Mock };
    radReply: { create: jest.Mock };
  };
  let prisma: { $transaction: jest.Mock; voucher: { findUnique: jest.Mock }; plan: { findUniqueOrThrow: jest.Mock } };

  beforeEach(async () => {
    tx = {
      plan: { findUnique: jest.fn() },
      voucher: {
        create: jest.fn((args) => ({ id: 1, status: 'unused', activatedAt: null, ...args.data })),
        findUnique: jest.fn().mockResolvedValue(null), // no collisions by default
        update: jest.fn(),
      },
      radCheck: {
        create: jest.fn(),
        deleteMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      radReply: { create: jest.fn() },
    };
    prisma = {
      $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(tx)),
      voucher: { findUnique: jest.fn() },
      plan: { findUniqueOrThrow: jest.fn() },
    };

    const module = await Test.createTestingModule({
      providers: [VouchersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(VouchersService);
  });

  describe('issue — hourly plan', () => {
    beforeEach(() => {
      tx.plan.findUnique.mockResolvedValue(HOURLY_PLAN);
    });

    it('writes Cleartext-Password and Simultaneous-Use radcheck rows', async () => {
      await service.issue(HOURLY_PLAN.id);

      expect(tx.radCheck.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ attribute: 'Cleartext-Password', op: ':=' }),
      });
      expect(tx.radCheck.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ attribute: 'Simultaneous-Use', op: ':=', value: '1' }),
      });
    });

    it('writes a Session-Timeout radreply row in seconds', async () => {
      await service.issue(HOURLY_PLAN.id);

      expect(tx.radReply.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ attribute: 'Session-Timeout', value: String(2 * 3600) }),
      });
    });

    it('does not write an Expiration radcheck row', async () => {
      await service.issue(HOURLY_PLAN.id);

      const expirationCalls = tx.radCheck.create.mock.calls.filter(
        ([arg]) => arg.data.attribute === 'Expiration',
      );
      expect(expirationCalls).toHaveLength(0);
    });

    it('creates the voucher as unused with no expiresAt', async () => {
      await service.issue(HOURLY_PLAN.id);

      expect(tx.voucher.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ status: 'unused', expiresAt: null }),
      });
    });
  });

  describe('issue — monthly plan', () => {
    beforeEach(() => {
      tx.plan.findUnique.mockResolvedValue(MONTHLY_PLAN);
    });

    it('writes an Expiration radcheck row using validityDays', async () => {
      await service.issue(MONTHLY_PLAN.id);

      const expirationCall = tx.radCheck.create.mock.calls.find(
        ([arg]) => arg.data.attribute === 'Expiration',
      );
      expect(expirationCall).toBeDefined();
      // "D Mon YYYY HH:MM:SS" — loose shape check, exact date depends on `new Date()`.
      expect(expirationCall![0].data.value).toMatch(/^\d{1,2} \w{3} \d{4} \d{2}:\d{2}:\d{2}$/);
    });

    it('does not write a Session-Timeout radreply row', async () => {
      await service.issue(MONTHLY_PLAN.id);

      expect(tx.radReply.create).not.toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ attribute: 'Session-Timeout' }) }),
      );
    });

    it('sets voucher.expiresAt ~validityDays from now', async () => {
      const before = Date.now();
      await service.issue(MONTHLY_PLAN.id);
      const after = Date.now();

      const createCall = tx.voucher.create.mock.calls[0][0];
      const expiresAt: Date = createCall.data.expiresAt;
      const expectedMs = 30 * 24 * 60 * 60 * 1000;
      expect(expiresAt.getTime() - before).toBeGreaterThanOrEqual(expectedMs - 1000);
      expect(expiresAt.getTime() - after).toBeLessThanOrEqual(expectedMs + 1000);
    });

    it('uses simultaneousUseOverride over the plan default when given', async () => {
      await service.issue(MONTHLY_PLAN.id, { simultaneousUseOverride: 7 });

      expect(tx.radCheck.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ attribute: 'Simultaneous-Use', value: '7' }),
      });
    });
  });

  describe('issue — validation', () => {
    it('throws NotFoundException for a missing plan', async () => {
      tx.plan.findUnique.mockResolvedValue(null);
      await expect(service.issue(999)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws BadRequestException for an inactive plan', async () => {
      tx.plan.findUnique.mockResolvedValue({ ...HOURLY_PLAN, active: false });
      await expect(service.issue(HOURLY_PLAN.id)).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('issue — code generation', () => {
    it('retries on a code collision', async () => {
      tx.plan.findUnique.mockResolvedValue(HOURLY_PLAN);
      tx.voucher.findUnique
        .mockResolvedValueOnce({ id: 999 }) // first generated code already taken
        .mockResolvedValueOnce(null); // second attempt is free

      await service.issue(HOURLY_PLAN.id);

      expect(tx.voucher.findUnique).toHaveBeenCalledTimes(2);
    });
  });

  describe('disable', () => {
    it('deletes radcheck rows and sets status disabled', async () => {
      prisma.voucher.findUnique.mockResolvedValue({
        id: 1,
        code: 'SHADDAI-ABCDE',
        status: 'unused',
      });
      tx.voucher.update.mockResolvedValue({ id: 1, status: 'disabled' });

      const result = await service.disable(1);

      expect(tx.radCheck.deleteMany).toHaveBeenCalledWith({
        where: { username: 'SHADDAI-ABCDE' },
      });
      expect(result).toEqual({ id: 1, status: 'disabled' });
    });

    it('throws NotFoundException for an unknown voucher id', async () => {
      prisma.voucher.findUnique.mockResolvedValue(null);
      await expect(service.disable(1)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
