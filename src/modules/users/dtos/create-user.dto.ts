import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsOptional()
  bankAccountNumber?: string;

  @ApiProperty({ example: '058', description: 'Bank code e.g. 058 for GTBank' })
  @IsString()
  @IsOptional()
  bankCode?: string;
}
