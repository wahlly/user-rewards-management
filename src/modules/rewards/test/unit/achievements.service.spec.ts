import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AchievementsService } from '../../services/achievements.service';
import { UserAchievementEntity } from '../../entities/user-achievement.entity';
import { User } from '../../../users/entities/user.entity';

describe('AchievementsService', () => {
  let service: AchievementsService;

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
        AchievementsService,
        {
          provide: getRepositoryToken(UserAchievementEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
  });

  afterEach(() => jest.clearAllMocks());

  // getUnlockedAchievements
  describe('getUnlockedAchievements', () => {
    it('returns empty array when user has no achievements', async () => {
      mockRepository.find.mockResolvedValue([]);
      expect(await service.getUnlockedAchievements(1)).toEqual([]);
    });

    it('returns the names of all achievements the user has unlocked', async () => {
      mockRepository.find.mockResolvedValue([
        { achievementName: 'first purchase' },
        { achievementName: '5 purchases' },
      ]);
      expect(await service.getUnlockedAchievements(1)).toEqual(['first purchase', '5 purchases']);
    });
  });

  // getNextAvailableAchievements
  describe('getNextAvailableAchievements', () => {
    it('returns first achievement in each group when nothing is unlocked', () => {
      expect(service.getNextAvailableAchievements([])).toEqual(['first purchase']);
    });

    it('returns the next achievement after the first is unlocked', () => {
      expect(service.getNextAvailableAchievements(['first purchase'])).toEqual(['5 purchases']);
    });

    it('returns the correct next achievement mid-sequence', () => {
      expect(service.getNextAvailableAchievements(['first purchase', '5 purchases'])).toEqual(['10 purchases']);
    });

    it('returns empty array when all achievements are unlocked', () => {
      expect(
        service.getNextAvailableAchievements([
          'first purchase', '5 purchases', '10 purchases', '25 purchases', '50 purchases',
        ]),
      ).toEqual([]);
    });
  });

  // evaluateAchievements
  describe('evaluateAchievements', () => {
    it('unlocks nothing when purchase count is 0', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.evaluateAchievements(mockUser as User, 0);
      expect(result).toEqual([]);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('unlocks "first purchase" on the first purchase', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.evaluateAchievements(mockUser as User, 1);
      expect(result).toEqual(['first purchase']);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('unlocks only "first purchase" when count is between 1 and 4', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.evaluateAchievements(mockUser as User, 3);
      expect(result).toEqual(['first purchase']);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('unlocks both "first purchase" and "5 purchases" when a fresh user reaches 5 purchases', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.evaluateAchievements(mockUser as User, 5);
      expect(result).toEqual(['first purchase', '5 purchases']);
      expect(mockRepository.save).toHaveBeenCalledTimes(2);
    });

    it('does not re-unlock "first purchase" when user already has it (idempotency)', async () => {
      mockRepository.find.mockResolvedValue([{ achievementName: 'first purchase' }]);
      const result = await service.evaluateAchievements(mockUser as User, 1);
      expect(result).toEqual([]);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('only unlocks "5 purchases" when user already has "first purchase" and reaches 5', async () => {
      mockRepository.find.mockResolvedValue([{ achievementName: 'first purchase' }]);
      const result = await service.evaluateAchievements(mockUser as User, 5);
      expect(result).toEqual(['5 purchases']);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('unlocks all 5 achievements when a fresh user reaches 50 purchases at once', async () => {
      mockRepository.find.mockResolvedValue([]);
      const result = await service.evaluateAchievements(mockUser as User, 50);
      expect(result).toEqual(['first purchase', '5 purchases', '10 purchases', '25 purchases', '50 purchases']);
      expect(mockRepository.save).toHaveBeenCalledTimes(5);
    });

    it('unlocks nothing when user already has all achievements', async () => {
      mockRepository.find.mockResolvedValue([
        { achievementName: 'first purchase' },
        { achievementName: '5 purchases' },
        { achievementName: '10 purchases' },
        { achievementName: '25 purchases' },
        { achievementName: '50 purchases' },
      ]);
      const result = await service.evaluateAchievements(mockUser as User, 50);
      expect(result).toEqual([]);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('saves achievements with correct user and name', async () => {
      mockRepository.find.mockResolvedValue([]);
      await service.evaluateAchievements(mockUser as User, 1);
      expect(mockRepository.save).toHaveBeenCalledWith({
        user: mockUser,
        achievementName: 'first purchase',
      });
    });
  });
});
