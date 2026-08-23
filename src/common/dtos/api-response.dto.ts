import { ApiProperty } from '@nestjs/swagger';

export function ApiResponseDto<T>(DtoClass: new (...args: any[]) => T) {
  class ApiResponseWrapper {
    @ApiProperty({ example: true })
    status: boolean;

    @ApiProperty({ example: 'Request successful' })
    message: string;

    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ type: () => DtoClass })
    data: T;
  }

  return ApiResponseWrapper;
}
