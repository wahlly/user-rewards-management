import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { AchievementsService } from '../../rewards/services/achievements.service';
import { BadgesService } from '../../rewards/services/badges.service';
import { UserAchievementsResponseDto } from '../dtos/achievements-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly achievementsService: AchievementsService,
    private readonly badgesService: BadgesService,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOneBy({ email: dto.email });

    if (existing) {
      throw new ConflictException('A user with this email already exists');
    }

    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async getAchievements(email: string): Promise<any> {
    const user = await this.findByEmail(email);
    const unlockedAchievements = await this.achievementsService.getUnlockedAchievements(user.id);
    const nextAvailable = this.achievementsService.getNextAvailableAchievements(unlockedAchievements);
    const currentBadge = await this.badgesService.getCurrentBadge(user.id);
    const nextBadge = this.badgesService.getNextBadge(currentBadge);

    return {
      unlocked_achievements: unlockedAchievements,
      next_available_achievements: nextAvailable,
      current_badge: currentBadge,
      next_badge: nextBadge?.name ?? null,
      remaining_to_unlock_next_badge: this.badgesService.getAchievementsRemainingToUnlockNextBadge(
        unlockedAchievements.length,
        nextBadge,
      ),
    };
  }
}
