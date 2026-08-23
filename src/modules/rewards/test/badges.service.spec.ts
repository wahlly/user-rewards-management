import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadgesService } from '../services/badges.service';
import { UserBadgeEntity } from '../entities/user-badge.entity';
import { User } from '../../users/entities/user.entity';
import { rewardBadges } from '../../../common/constants/badges.constant';

describe('BadgesService', () => {
  let service: BadgesService;

  const mockRepository = {
    find: jest.fn(),
    save: jest.fn(),
  };

  const mockUser: Partial<User> = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    bankAccountNumber: '0123456789',
    bankCode: '058',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgesService,
        {
          provide: getRepositoryToken(UserBadgeEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BadgesService>(BadgesService);
  });

  afterEach(() => jest.clearAllMocks());

  // getCurrentBadge
  describe('getCurrentBadge', () => {
    it('returns null when user has no badges', async () => {
      mockRepository.find.mockResolvedValue([]);
      expect(await service.getCurrentBadge(1)).toBeNull();
    });

    it('returns the badge name when user has one badge', async () => {
      mockRepository.find.mockResolvedValue([{ badgeName: 'novice' }]);
      expect(await service.getCurrentBadge(1)).toBe('novice');
    });

    it('returns the highest badge when user has multiple badges', async () => {
      mockRepository.find.mockResolvedValue([
        { badgeName: 'novice' },
        { badgeName: 'enthusiast' },
        { badgeName: 'professional' },
      ]);
      expect(await service.getCurrentBadge(1)).toBe('professional');
    });

    it('returns "legend" when user has all badges', async () => {
      mockRepository.find.mockResolvedValue(
        rewardBadges.map((b) => ({ badgeName: b.name })),
      );
      expect(await service.getCurrentBadge(1)).toBe('legend');
    });
  });

  // getNextBadge
  describe('getNextBadge', () => {
    it('returns the first badge when user has no current badge', () => {
      expect(service.getNextBadge(null)?.name).toBe('novice');
    });

    it('returns the next badge above the current one', () => {
      expect(service.getNextBadge('novice')?.name).toBe('enthusiast');
      expect(service.getNextBadge('enthusiast')?.name).toBe('professional');
      expect(service.getNextBadge('professional')?.name).toBe('expert');
      expect(service.getNextBadge('expert')?.name).toBe('legend');
    });

    it('returns "legend" when user already has the highest badge — legend is the max attainable', () => {
      expect(service.getNextBadge('legend')?.name).toBe('legend');
    });
  });

  // getAchievementsRemainingToUnlockNextBadge
  describe('getAchievementsRemainingToUnlockNextBadge', () => {
    it('returns the correct number needed for the first badge', () => {
      const next = service.getNextBadge(null);
      expect(service.getAchievementsRemainingToUnlockNextBadge(0, next)).toBe(1);
    });

    it('returns correct remaining count mid-progression', () => {
      const next = service.getNextBadge('novice'); // enthusiast needs 3
      expect(service.getAchievementsRemainingToUnlockNextBadge(1, next)).toBe(2);
      expect(service.getAchievementsRemainingToUnlockNextBadge(2, next)).toBe(1);
    });

    it('returns 0 when user has already reached the highest badge', () => {
      const next = service.getNextBadge('legend'); // returns legend itself
      expect(service.getAchievementsRemainingToUnlockNextBadge(12, next)).toBe(0);
    });
  });

  // evaluateBadge
  describe('evaluateBadge', () => {
    it('returns null when user has no achievements', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.evaluateBadge(mockUser as User, 0);
      expect(result).toBeNull();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('awards "novice" when user unlocks their first achievement', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.evaluateBadge(mockUser as User, 1);
      expect(result).toBe('novice');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledWith({
        user: mockUser,
        badgeName: 'novice',
      });
    });

    it('does not re-award "novice" when user already has it (idempotency)', async () => {
      mockRepository.find.mockResolvedValue([{ badgeName: 'novice' }]);
      const result = await service.evaluateBadge(mockUser as User, 1);
      expect(result).toBeNull();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('awards "enthusiast" when user has "novice" and reaches 3 achievements', async () => {
      mockRepository.find.mockResolvedValue([{ badgeName: 'novice' }]);
      const result = await service.evaluateBadge(mockUser as User, 3);
      expect(result).toBe('enthusiast');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('awards "professional" when user has "novice" and "enthusiast" and reaches 5 achievements', async () => {
      mockRepository.find.mockResolvedValue([{ badgeName: 'novice' }, { badgeName: 'enthusiast' }]);
      const result = await service.evaluateBadge(mockUser as User, 5);
      expect(result).toBe('professional');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('awards the highest applicable badge when user has no badges and jumps to 5 achievements', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.evaluateBadge(mockUser as User, 5);
      expect(result).toBe('professional');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('awards "legend" when user reaches 12 achievements', async () => {
      mockRepository.find.mockResolvedValue(
        rewardBadges.slice(0, 4).map((b) => ({ badgeName: b.name })),
      );
      const result = await service.evaluateBadge(mockUser as User, 12);
      expect(result).toBe('legend');
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('returns null when user has all badges and no new threshold crossed', async () => {
      mockRepository.find.mockResolvedValue(
        rewardBadges.map((b) => ({ badgeName: b.name })),
      );
      const result = await service.evaluateBadge(mockUser as User, 12);
      expect(result).toBeNull();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
