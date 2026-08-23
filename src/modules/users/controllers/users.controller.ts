import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  Res,
  Req,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { CreateUserResponseDto } from '../dtos/create-user-response.dto';
import { UserAchievementsResponseDto } from '../dtos/achievements-response.dto';
import { Request, Response } from 'express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully', type: CreateUserResponseDto })
  async create(
    @Req() req: Request,
    @Res() res: Response,
    @Body() dto: CreateUserDto
  ) {
    try {
      const result = await this.usersService.create(dto);

      res.status(HttpStatus.CREATED).json({
        status: true,
        message: "User created successfully",
        statusCode: HttpStatus.CREATED,
        data: result
      })
    } catch (error) {
      console.error('[UsersController] create-user error:', error);
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Get(':email/achievements')
  @ApiOperation({ summary: 'Get achievements and badge progress for a user' })
  @ApiParam({ name: 'email', description: 'User email address' })
  @ApiResponse({ status: 200, description: 'Achievements retrieved successfully', type: UserAchievementsResponseDto })
  async getAchievements(
    @Req() req: Request,
    @Res() res: Response,
    @Param('email') email: string,
  ) {
    try {
      const result = await this.usersService.getAchievements(email);

      res.status(HttpStatus.OK).json({
        status: true,
        message: "Achievement progress retrieved successfully",
        statusCode: HttpStatus.OK,
        data: result
      })
    } catch (error) {
      console.error('[UsersController] get-achievements error:', error);
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw new InternalServerErrorException('Failed to retrieve achievements');
    }
  }
}
