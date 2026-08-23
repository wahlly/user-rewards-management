import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { User } from '../entities/user.entity';
import { AchievementsService } from '../../rewards/services/achievements.service';
import { BadgesService } from '../../rewards/services/badges.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAchievementsService = {
    getUnlockedAchievements: jest.fn(),
    getNextAvailableAchievements: jest.fn(),
  };

  const mockBadgesService = {
    getCurrentBadge: jest.fn(),
    getNextBadge: jest.fn(),
    getAchievementsRemainingToUnlockNextBadge: jest.fn(),
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
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: AchievementsService, useValue: mockAchievementsService },
        { provide: BadgesService, useValue: mockBadgesService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── create ───────────────────────────────────────────────────────────────

  describe('create', () => {
    const createDto = {
      name: 'John Doe',
      email: 'john@example.com',
      bankAccountNumber: '0123456789',
      bankCode: '058',
    };

    it('creates and returns a new user successfully', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: createDto.email });
      expect(mockUserRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('throws ConflictException when email already exists', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
  });

  // ─── findByEmail ──────────────────────────────────────────────────────────

  describe('findByEmail', () => {
    it('returns the user when found', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      const result = await service.findByEmail('john@example.com');
      expect(result).toEqual(mockUser);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findByEmail('unknown@example.com')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── getAchievements ──────────────────────────────────────────────────────

  describe('getAchievements', () => {
    it('returns correct shape for a new user with no achievements or badge', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockAchievementsService.getUnlockedAchievements.mockResolvedValue([]);
      mockAchievementsService.getNextAvailableAchievements.mockReturnValue(['first purchase']);
      mockBadgesService.getCurrentBadge.mockResolvedValue(null);
      mockBadgesService.getNextBadge.mockReturnValue({ name: 'novice', requiredAchievements: 1 });
      mockBadgesService.getAchievementsRemainingToUnlockNextBadge.mockReturnValue(1);

      const result = await service.getAchievements('john@example.com');

      expect(result).toEqual({
        unlocked_achievements: [],
        next_available_achievements: ['first purchase'],
        current_badge: null,
        next_badge: 'novice',
        remaining_to_unlock_next_badge: 1,
      });
    });

    it('returns correct shape for a user with some achievements and a badge', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockAchievementsService.getUnlockedAchievements.mockResolvedValue(['first purchase', '5 purchases']);
      mockAchievementsService.getNextAvailableAchievements.mockReturnValue(['10 purchases']);
      mockBadgesService.getCurrentBadge.mockResolvedValue('enthusiast');
      mockBadgesService.getNextBadge.mockReturnValue({ name: 'professional', requiredAchievements: 5 });
      mockBadgesService.getAchievementsRemainingToUnlockNextBadge.mockReturnValue(3);

      const result = await service.getAchievements('john@example.com');

      expect(result).toEqual({
        unlocked_achievements: ['first purchase', '5 purchases'],
        next_available_achievements: ['10 purchases'],
        current_badge: 'enthusiast',
        next_badge: 'professional',
        remaining_to_unlock_next_badge: 3,
      });
    });

    it('returns legend as next_badge and 0 remaining when user has reached the highest badge', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(mockUser);
      mockAchievementsService.getUnlockedAchievements.mockResolvedValue([
        'first purchase', '5 purchases', '10 purchases', '25 purchases', '50 purchases',
      ]);
      mockAchievementsService.getNextAvailableAchievements.mockReturnValue([]);
      mockBadgesService.getCurrentBadge.mockResolvedValue('legend');
      mockBadgesService.getNextBadge.mockReturnValue({ name: 'legend', requiredAchievements: 12 });
      mockBadgesService.getAchievementsRemainingToUnlockNextBadge.mockReturnValue(0);

      const result = await service.getAchievements('john@example.com');

      expect(result.current_badge).toBe('legend');
      expect(result.next_badge).toBe('legend');
      expect(result.remaining_to_unlock_next_badge).toBe(0);
      expect(result.next_available_achievements).toEqual([]);
    });

    it('throws NotFoundException when user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);
      await expect(service.getAchievements('unknown@example.com')).rejects.toThrow(NotFoundException);
    });
  });
});
