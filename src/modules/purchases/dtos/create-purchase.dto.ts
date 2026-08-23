import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreatePurchaseDto {
  @ApiProperty({ example: 'wahlly@west.com', description: 'Email of the user making the purchase' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 5000.00, description: 'Purchase amount in Naira' })
  @IsNumber()
  @IsPositive()
  amount: number;
}
