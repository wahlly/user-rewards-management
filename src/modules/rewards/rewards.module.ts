import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAchievementEntity } from './entities/user-achievement.entity';
import { UserBadgeEntity } from './entities/user-badge.entity';
import { CashbackEntity } from './entities/cashback.entity';
import { AchievementsService } from './services/achievements.service';
import { BadgesService } from './services/badges.service';
import { CashbackService } from './services/cashback.service';
import { AchievementsListener } from './listeners/achievements.listener';
import { BadgesListener } from './listeners/badges.listener';
import { BadgeUnlockedListener } from './listeners/badge-unlocked.listener';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAchievementEntity, UserBadgeEntity, CashbackEntity]),
    PaymentsModule,
  ],
  controllers: [],
  providers: [
    AchievementsService,
    BadgesService,
    CashbackService,
    AchievementsListener,
    BadgesListener,
    BadgeUnlockedListener,
  ],
  exports: [AchievementsService, BadgesService],
})
export class RewardsModule {}
