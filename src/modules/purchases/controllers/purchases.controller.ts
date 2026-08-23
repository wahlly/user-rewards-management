import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { PurchasesService } from '../services/purchases.service';
import { CreatePurchaseDto } from '../dtos/create-purchase.dto';
import { CreatePurchaseResponseDto } from '../dtos/create-purchase-response.dto';

@ApiTags('Purchases')
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @ApiOperation({ summary: 'Record a purchase for a user' })
  @ApiBody({ type: CreatePurchaseDto })
  @ApiResponse({ status: 201, description: 'Purchase recorded successfully', type: CreatePurchaseResponseDto })
  async create(@Body() dto: CreatePurchaseDto, @Res() res: Response) {
    try {
      const purchase = await this.purchasesService.createPurchase(dto.email, dto.amount);

      res.status(HttpStatus.CREATED).json({
        status: true,
        message: 'Purchase recorded successfully',
        statusCode: HttpStatus.CREATED,
        data: purchase,
      });
    } catch (error) {
      console.log('[PurchasesController] create-purchase error:', error);
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw new InternalServerErrorException('Failed to record purchase');
    }
  }
}
