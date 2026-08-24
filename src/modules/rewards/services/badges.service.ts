import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserBadgeEntity } from '../entities/user-badge.entity';
import { User } from '../../users/entities/user.entity';
import { rewardBadges, Badge } from '../../../common/constants/badges.constant';

@Injectable()
export class BadgesService {
  constructor(
    @InjectRepository(UserBadgeEntity)
    private readonly userBadgeRepository: Repository<UserBadgeEntity>,
  ) {}

  async getCurrentBadge(userId: number): Promise<string | null> {
    const earnedBadges = await this.userBadgeRepository.find({
      where: { user: { id: userId } },
    });

    if (!earnedBadges.length) return null;

    const earnedBadgesSet = new Set(earnedBadges.map((badge) => badge.badgeName));
    //RETURN HIGHEST BADGE EARNED
    const current = [...rewardBadges].reverse().find((b) => earnedBadgesSet.has(b.name));
    return current?.name ?? null;
  }

  getNextBadge(currentBadge: string | null): Badge | null {
    if (!currentBadge) return rewardBadges[0] ?? null;
    const currentIndex = rewardBadges.findIndex((badge) => badge.name === currentBadge);
    return rewardBadges[currentIndex + 1] ?? rewardBadges[currentIndex];
  }

  getAchievementsRemainingToUnlockNextBadge(totalUnlocked: number, nextBadge: Badge): number {
    if (!nextBadge) return 0;
    return nextBadge.requiredAchievements - totalUnlocked;
  }

  async evaluateBadge(user: User, totalUnlockedCount: number): Promise<string | null> {
    const earnedRewardBadges = await this.userBadgeRepository.find({
      where: { user: { id: user.id } },
    });

    const earnedRewardBadgesSet = new Set(earnedRewardBadges.map((badge) => badge.badgeName));

    //CHECK IF THERE'S BADGE YET TO BE CLAIMED
    const newBadge = [...rewardBadges]
      .reverse()
      .find((badge) => totalUnlockedCount >= badge.requiredAchievements && !earnedRewardBadgesSet.has(badge.name));

    if (!newBadge) return null;

    await this.userBadgeRepository.save({
      user,
      badgeName: newBadge.name
    });

    return newBadge.name;
  }
}
