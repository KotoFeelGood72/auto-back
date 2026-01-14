import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum StatisticsPeriod {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUALLY = 'annually',
}

export class GetStatisticsDto {
  @ApiPropertyOptional({
    enum: StatisticsPeriod,
    description: 'Период группировки данных',
    example: StatisticsPeriod.MONTHLY,
  })
  @IsOptional()
  @IsEnum(StatisticsPeriod)
  period?: StatisticsPeriod;

  @ApiPropertyOptional({
    description: 'Начальная дата для фильтрации (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({
    description: 'Конечная дата для фильтрации (ISO 8601)',
    example: '2024-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  date_to?: string;
}
