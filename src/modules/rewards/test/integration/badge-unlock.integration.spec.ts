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

describe('Badge Unlock Flow (Integration)', () => {
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

    purchasesService = module.get<PurchasesService>(PurchasesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('awards "novice" badge when user unlocks their first achievement', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockPurchaseRepository.count.mockResolvedValue(0);
    mockPurchaseRepository.save.mockResolvedValue(mockPurchase);
    // evaluateAchievements: no existing achievements
    mockAchievementRepository.find.mockResolvedValueOnce([]);
    mockAchievementRepository.save.mockResolvedValue({ id: 1, user: mockUser, achievementName: 'first purchase' });
    // getUnlockedAchievements (for badge evaluation): 1 achievement now
    mockAchievementRepository.find.mockResolvedValueOnce([{ achievementName: 'first purchase' }]);
    mockBadgeRepository.find.mockResolvedValue([]);
    mockBadgeRepository.save.mockResolvedValue({ id: 1, user: mockUser, badgeName: 'novice' });
    mockCashbackRepository.save.mockResolvedValue({ id: 1, user: mockUser, badgeName: 'novice', amount: 300 });

    await purchasesService.createPurchase('wahlly@example.com', 5000);
    await flushPromises();

    expect(mockBadgeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ badgeName: 'novice' }),
    );
  });

  it('awards "enthusiast" badge when user reaches 3 achievements', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockPurchaseRepository.count.mockResolvedValue(9);
    mockPurchaseRepository.save.mockResolvedValue(mockPurchase);
    // evaluateAchievements: already has first purchase and 5 purchases
    mockAchievementRepository.find.mockResolvedValueOnce([
      { achievementName: 'first purchase' },
      { achievementName: '5 purchases' },
    ]);
    mockAchievementRepository.save.mockResolvedValue({ id: 3, user: mockUser, achievementName: '10 purchases' });
    // getUnlockedAchievements (for badge evaluation): 3 achievements now
    mockAchievementRepository.find.mockResolvedValueOnce([
      { achievementName: 'first purchase' },
      { achievementName: '5 purchases' },
      { achievementName: '10 purchases' },
    ]);
    mockBadgeRepository.find.mockResolvedValue([{ badgeName: 'novice' }]);
    mockBadgeRepository.save.mockResolvedValue({ id: 2, user: mockUser, badgeName: 'enthusiast' });
    mockCashbackRepository.save.mockResolvedValue({ id: 2, user: mockUser, badgeName: 'enthusiast', amount: 300 });

    await purchasesService.createPurchase('wahlly@example.com', 5000);
    await flushPromises();

    expect(mockBadgeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ badgeName: 'enthusiast' }),
    );
  });

  it('does not re-award a badge the user already has (idempotency)', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockPurchaseRepository.count.mockResolvedValue(0);
    mockPurchaseRepository.save.mockResolvedValue(mockPurchase);
    mockAchievementRepository.find.mockResolvedValueOnce([]);
    mockAchievementRepository.save.mockResolvedValue({ id: 1, user: mockUser, achievementName: 'first purchase' });
    mockAchievementRepository.find.mockResolvedValueOnce([{ achievementName: 'first purchase' }]);
    // user already has novice badge
    mockBadgeRepository.find.mockResolvedValue([{ badgeName: 'novice' }]);

    await purchasesService.createPurchase('wahlly@example.com', 5000);
    await flushPromises();

    expect(mockBadgeRepository.save).not.toHaveBeenCalled();
    expect(mockPaymentsService.initiateTransfer).not.toHaveBeenCalled();
  });

  it('triggers a ₦300 cashback transfer when a badge is unlocked', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockPurchaseRepository.count.mockResolvedValue(0);
    mockPurchaseRepository.save.mockResolvedValue(mockPurchase);
    mockAchievementRepository.find.mockResolvedValueOnce([]);
    mockAchievementRepository.save.mockResolvedValue({ id: 1, user: mockUser, achievementName: 'first purchase' });
    mockAchievementRepository.find.mockResolvedValueOnce([{ achievementName: 'first purchase' }]);
    mockBadgeRepository.find.mockResolvedValue([]);
    mockBadgeRepository.save.mockResolvedValue({ id: 1, user: mockUser, badgeName: 'novice' });
    mockCashbackRepository.save.mockResolvedValue({ id: 1, user: mockUser, badgeName: 'novice', amount: 300 });

    await purchasesService.createPurchase('wahlly@example.com', 5000);
    await flushPromises();

    expect(mockCashbackRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ badgeName: 'novice', amount: 300 }),
    );
    expect(mockPaymentsService.initiateTransfer).toHaveBeenCalled();
  });

  it('does not trigger cashback when no new badge is earned', async () => {
    mockUsersService.findByEmail.mockResolvedValue(mockUser);
    mockPurchaseRepository.count.mockResolvedValue(1);
    mockPurchaseRepository.save.mockResolvedValue(mockPurchase);
    mockAchievementRepository.find.mockResolvedValue([{ achievementName: 'first purchase' }]);

    await purchasesService.createPurchase('wahlly@example.com', 5000);
    await flushPromises();

    expect(mockCashbackRepository.save).not.toHaveBeenCalled();
    expect(mockPaymentsService.initiateTransfer).not.toHaveBeenCalled();
  });
});
