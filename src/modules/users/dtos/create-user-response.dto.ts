import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: '0123456789' })
  bankAccountNumber: string;

  @ApiProperty({ example: '058', description: 'Bank code e.g. 058 for GTBank' })
  bankCode: string;

  @ApiProperty({ example: '2026-08-22T16:09:21.190Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-08-22T16:09:21.190Z' })
  updatedAt: Date;
}
