import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAchievementEntity } from '../entities/user-achievement.entity';
import { User } from '../../users/entities/user.entity';
import { rewardAchievements } from '../../../common/constants/achievements.constant';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(UserAchievementEntity)
    private readonly userAchievementRepository: Repository<UserAchievementEntity>,
  ) {}

  async getUnlockedAchievements(userId: number): Promise<string[]> {
    const unlockedAchievements = await this.userAchievementRepository.find({
      where: { user: { id: userId } },
    });
    return unlockedAchievements.map((achievement) => achievement.achievementName);
  }

  getNextAvailableAchievements(unlockedAchievements: string[]): string[] {
    const unlockedAchievementsSet = new Set(unlockedAchievements);
    return rewardAchievements.map((achievementGroup) =>
      achievementGroup.achievements.find((achievement) => !unlockedAchievementsSet.has(achievement.name)),
    )
    .filter(Boolean)
    .map((achievement) => achievement.name);
  }

  async evaluateAchievements(user: User, totalPurchaseCount: number): Promise<string[]> {
    const unlockedAchievements = await this.getUnlockedAchievements(user.id);
    const userUnlockedAchievementSet = new Set(unlockedAchievements);
    const newlyUnlocked: string[] = [];

    for (const group of rewardAchievements) {
      for (const achievement of group.achievements) {
        //CHECK IF ACHIEVEMENT IS CLAIMABLE
        if (totalPurchaseCount >= achievement.threshold && !userUnlockedAchievementSet.has(achievement.name)) {
          await this.userAchievementRepository.save({
            user,
            achievementName: achievement.name
          });  
          newlyUnlocked.push(achievement.name);
          userUnlockedAchievementSet.add(achievement.name); //ADD TO THE UNLOCKED_ACHIEVEMENT_SET TO PREVENT DOUBLE ENTRY
        }
      }
    }

    return newlyUnlocked;
  }
}
