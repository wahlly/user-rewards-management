import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PurchasesService } from '../../../purchases/services/purchases.service';
import { AchievementsService } from '../../services/achievements.service';
import { BadgesService } from '../../services/badges.service';
import { CashbackService } from '../../services/cashback.service';
import { AchievementsListener } from '../../listeners/achievements.listener';
import { BadgesListener } from '../../listeners/badges.listener';
import { BadgeUnlockedListener } from '../../listeners/badge-unlocked.listener';
import { PaymentsService } from '../../../payments/services/payments.service';
import { UsersService } from '../../../users/services/users.service';
import { PurchaseEntity } from '../../../purchases/entities/purchase.entity';
import { UserAchievementEntity } from '../../entities/user-achievement.entity';
import { UserBadgeEntity } from '../../entities/user-badge.entity';
import { CashbackEntity } from '../../entities/cashback.entity';
import { User } from '../../../users/entities/user.entity';

const flushPromises = async () => {
  for (let i = 0; i < 10; i++) {
    await new Promise(setImmediate);
  }
};

describe('Achievement Unlock Flow (Integration)', () => {
  let purchasesService: PurchasesService;

  const mockPurchaseRepository = { count: jest.fn(), save: jest.fn() };
  const mockAchievementRepository = { find: jest.fn(), save: jest.fn() };
  const mockBadgeRepository = { find: jest.fn(), save: jest.fn() };
  const mockCashbackRepository = { save: jest.fn() };
  const mockUsersService = { findByEmail: jest.fn() };
  const mockPaymentsService = { initiateTransfer: jest.fn().mockResolvedValue(undefined) };

  const mockUser: User = {
    id: 1,
    name: 'Wahlly West',
    email: 'wahlly@example.com',
    bankAccountNumber: '0123456789',
    bankCode: '058',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPurchase = { id: 1, user: mockUser, amount: 5000, createdAt: new Date() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot({ wildcard: false, global: true })],
      providers: [
        PurchasesService,
        AchievementsService,
        BadgesService,
        CashbackService,
        AchievementsListener,
        BadgesListener,
        BadgeUnlockedListener,
        { provide: getRepositoryToken(PurchaseEntity), useValue: mockPurchaseRepository },
        { provide: getRepositoryToken(UserAchievementEntity), useValue: mockAchievementRepository },
        { provide: getRepositoryToken(UserBadgeEntity), useValue: mockBadgeRepository },
        { provide: getRepositoryToken(CashbackEntity), useValue: mockCashbackRepository },
        { provide: UsersService, useValue: mockUsersService },
        { provide: PaymentsService, useValue: mockPaymentsService },
      ],
    }).compile();

    await module.init();  //triggers onmoduleinit, load all event subscribers
    purchasesService = module.get<PurchasesService>(PurchasesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('unlocks "first purchase" achievement on first purchase', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockPurchaseRepository.count.mockResolvedValue(0);
    mockPurchaseRepository.save.mockResolvedValue(mockPurchase);
    mockAchievementRepository.find.mockResolvedValue([]);
    mockAchievementRepository.save.mockResolvedValue({ id: 1, user: mockUser, achievementName: 'first purchase' });
    mockBadgeRepository.find.mockResolvedValue([]);
    mockBadgeRepository.save.mockResolvedValue({ id: 1, user: mockUser, badgeName: 'novice' });
    mockCashbackRepository.save.mockResolvedValue({ id: 1, user: mockUser, badgeName: 'novice', amount: 300 });

    await purchasesService.createPurchase('wahlly@example.com', 5000);
    await flushPromises();

    expect(mockAchievementRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ achievementName: 'first purchase' }),
    );
  });

  it('does not unlock an achievement when purchase count is below the next threshold', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockPurchaseRepository.count.mockResolvedValue(1);
    mockPurchaseRepository.save.mockResolvedValue(mockPurchase);
    mockAchievementRepository.find.mockResolvedValue([{ achievementName: 'first purchase' }]);

    await purchasesService.createPurchase('wahlly@example.com', 5000);
    await flushPromises();

    expect(mockAchievementRepository.save).not.toHaveBeenCalled();
  });

  it('unlocks "5 purchases" achievement on the 5th purchase', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockPurchaseRepository.count.mockResolvedValue(4);
    mockPurchaseRepository.save.mockResolvedValue(mockPurchase);
    mockAchievementRepository.find.mockResolvedValue([{ achievementName: 'first purchase' }]);
    mockAchievementRepository.save.mockResolvedValue({ id: 2, user: mockUser, achievementName: '5 purchases' });
    mockBadgeRepository.find.mockResolvedValue([{ badgeName: 'novice' }]);
    mockBadgeRepository.save.mockResolvedValue({ id: 2, user: mockUser, badgeName: 'enthusiast' });
    mockCashbackRepository.save.mockResolvedValue({ id: 2, user: mockUser, badgeName: 'enthusiast', amount: 300 });

    await purchasesService.createPurchase('wahlly@example.com', 5000);
    await flushPromises();

    expect(mockAchievementRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ achievementName: '5 purchases' }),
    );
  });

  it('unlocks multiple achievements at once when a fresh user jumps to 5 purchases', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockPurchaseRepository.count.mockResolvedValue(4);
    mockPurchaseRepository.save.mockResolvedValue(mockPurchase);
    mockAchievementRepository.find.mockResolvedValue([]);
    mockAchievementRepository.save.mockResolvedValue({});
    mockBadgeRepository.find.mockResolvedValue([]);
    mockBadgeRepository.save.mockResolvedValue({});
    mockCashbackRepository.save.mockResolvedValue({});

    await purchasesService.createPurchase('wahlly@example.com', 5000);
    await flushPromises();

    expect(mockAchievementRepository.save).toHaveBeenCalledTimes(2);
    expect(mockAchievementRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ achievementName: 'first purchase' }),
    );
    expect(mockAchievementRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ achievementName: '5 purchases' }),
    );
  });

  it('does not re-unlock an achievement the user already has (idempotency)', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockPurchaseRepository.count.mockResolvedValue(0);
    mockPurchaseRepository.save.mockResolvedValue(mockPurchase);
    mockAchievementRepository.find.mockResolvedValue([{ achievementName: 'first purchase' }]);

    await purchasesService.createPurchase('wahlly@example.com', 5000);
    await flushPromises();

    expect(mockAchievementRepository.save).not.toHaveBeenCalled();
  });
});
