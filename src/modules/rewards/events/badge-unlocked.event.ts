import { User } from '../../users/entities/user.entity';

export class BadgeUnlockedEvent {
  constructor(
    public readonly badgeName: string,
    public readonly user: User,
  ) {}
}
