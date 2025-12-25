import { IsEnum, IsNumber, IsOptional, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EntityType } from './create-history.dto';

export class StatsHistoryDto {
  @ApiPropertyOptional({ enum: EntityType })
  @IsOptional()
  @IsEnum(EntityType)
  entity_type?: EntityType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  user_id?: number;

  @ApiPropertyOptional({ description: 'Начальная дата' })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'Конечная дата' })
  @IsOptional()
  @IsDateString()
  date_to?: string;
}

