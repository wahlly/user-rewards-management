import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../../common/dtos/api-response.dto';
import { CreateUserData } from '../../users/dtos/create-user-response.dto';

export class PurchaseData {
  @ApiProperty({ example: 4 })
  id: number;

  @ApiProperty({ type: () => CreateUserData })
  user: CreateUserData;

  @ApiProperty({ example: 5000 })
  amount: number;

  @ApiProperty({ example: '2026-08-23T10:41:44.955Z' })
  createdAt: Date;
}

export class CreatePurchaseResponseDto extends ApiResponseDto(PurchaseData) {}
