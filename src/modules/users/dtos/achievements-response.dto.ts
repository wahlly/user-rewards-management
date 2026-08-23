import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../../common/dtos/api-response.dto';

export class UserAchievementsData {
  @ApiProperty({ example: ['first purchase'] })
  unlocked_achievements: string[];

  @ApiProperty({ example: ['5 purchases'] })
  next_available_achievements: string[];

  @ApiProperty({ example: 'beginner' })
  current_badge: string | null;

  @ApiProperty({ example: 'bronze' })
  next_badge: string | null;

  @ApiProperty({ example: 2 })
  remaining_to_unlock_next_badge: number;
}

export class UserAchievementsResponseDto extends ApiResponseDto(UserAchievementsData) {}
