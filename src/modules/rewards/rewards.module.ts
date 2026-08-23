import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAchievementEntity } from './entities/user-achievement.entity';
import { UserBadgeEntity } from './entities/user-badge.entity';
import { AchievementsService } from './services/achievements.service';
import { BadgesService } from './services/badges.service';
import { AchievementsListener } from './listeners/achievements.listener';
import { BadgesListener } from './listeners/badges.listener';

@Module({
  imports: [TypeOrmModule.forFeature([UserAchievementEntity, UserBadgeEntity])],
  controllers: [],
  providers: [
    AchievementsService,
    BadgesService,
    AchievementsListener,
    BadgesListener,
  ],
  exports: [AchievementsService, BadgesService],
})
export class RewardsModule {}
