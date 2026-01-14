import { IsOptional, IsString, IsBoolean, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ErrorType {
  PARSING = 'parsing',
  NETWORK = 'network',
  BROWSER = 'browser',
  DATABASE = 'database',
  UNKNOWN = 'unknown',
}

export class FilterParsingErrorsDto {
  @ApiPropertyOptional({ description: 'Номер страницы', example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Количество записей на странице', example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: 'Имя парсера', example: 'dubicars' })
  @IsOptional()
  @IsString()
  parser_name?: string;

  @ApiPropertyOptional({ 
    description: 'Тип ошибки',
    enum: ErrorType,
    example: ErrorType.PARSING
  })
  @IsOptional()
  @IsEnum(ErrorType)
  error_type?: ErrorType;

  @ApiPropertyOptional({ description: 'Фильтр по статусу обработки', example: false, default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  is_processed?: boolean;

  @ApiPropertyOptional({ description: 'Начальная дата (ISO 8601)', example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'Конечная дата (ISO 8601)', example: '2024-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsString()
  date_to?: string;
}
