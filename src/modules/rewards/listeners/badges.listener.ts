import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AchievementsService } from '../services/achievements.service';
import { BadgesService } from '../services/badges.service';
import { AchievementUnlockedEvent } from '../events/achievement-unlocked.event';
import { BadgeUnlockedEvent } from '../events/badge-unlocked.event';

@Injectable()
export class BadgesListener {
  constructor(
    private readonly achievementsService: AchievementsService,
    private readonly badgesService: BadgesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @OnEvent('achievement.unlocked')
  async handleAchievementUnlockedEvent(event: AchievementUnlockedEvent): Promise<void> {
    const unlockedAchievements = await this.achievementsService.getUnlockedAchievements(event.user.id);
    const newlyEarnedBadge = await this.badgesService.evaluateBadge(event.user, unlockedAchievements.length);

    if (newlyEarnedBadge) {
      this.eventEmitter.emit(
        'badge.unlocked',
        new BadgeUnlockedEvent(newlyEarnedBadge, event.user),
      );
    }
  }
}
