import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PurchasesService } from '../services/purchases.service';
import { PurchaseEntity } from '../entities/purchase.entity';
import { UsersService } from '../../users/services/users.service';
import { PurchaseCreatedEvent } from '../events/purchase-created.event';
import { User } from '../../users/entities/user.entity';

describe('PurchasesService', () => {
  let service: PurchasesService;

  const mockRepository = {
    count: jest.fn(),
    save: jest.fn(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockUser: Partial<User> = {
    id: 1,
    name: 'Wahlly West',
    email: 'wahlly@example.com',
    bankAccountNumber: '0123456789',
    bankCode: '058',
  };

  const mockPurchase = {
    id: 1,
    user: mockUser,
    amount: 5000,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: getRepositoryToken(PurchaseEntity), useValue: mockRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── createPurchase ───────────────────────────────────────────────────────

  describe('createPurchase', () => {
    it('saves the purchase and returns it', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockRepository.count.mockResolvedValue(0);
      mockRepository.save.mockResolvedValue(mockPurchase);

      const result = await service.createPurchase('wahlly@example.com', 5000);

      expect(mockRepository.save).toHaveBeenCalledWith({ user: mockUser, amount: 5000 });
      expect(result).toEqual(mockPurchase);
    });

    it('emits purchase.created with totalPurchaseCount = 1 on first purchase', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockRepository.count.mockResolvedValue(0);
      mockRepository.save.mockResolvedValue(mockPurchase);

      await service.createPurchase('wahlly@example.com', 5000);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'purchase.created',
        new PurchaseCreatedEvent(mockUser as User, 1),
      );
    });

    it('emits purchase.created with correct count on subsequent purchases', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockRepository.count.mockResolvedValue(4);
      mockRepository.save.mockResolvedValue(mockPurchase);

      await service.createPurchase('wahlly@example.com', 5000);

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'purchase.created',
        new PurchaseCreatedEvent(mockUser as User, 5),
      );
    });

    it('counts existing purchases before saving to avoid race condition', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockRepository.count.mockResolvedValue(2);
      mockRepository.save.mockResolvedValue(mockPurchase);

      await service.createPurchase('wahlly@example.com', 5000);

      const countCallOrder = mockRepository.count.mock.invocationCallOrder[0];
      const saveCallOrder = mockRepository.save.mock.invocationCallOrder[0];
      expect(countCallOrder).toBeLessThan(saveCallOrder);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockUsersService.findByEmail.mockRejectedValue(new NotFoundException());

      await expect(service.createPurchase('unknown@example.com', 5000)).rejects.toThrow(NotFoundException);
      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
