import { IsEnum, IsNumber, IsOptional, IsString, IsObject, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EntityType {
  CAR = 'car',
  USER = 'user',
  FAVORITE = 'favorite',
  EXPORT = 'export',
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  EXPORT = 'export',
}

export class ChangeFieldDto {
  @ApiPropertyOptional()
  @IsOptional()
  old?: any;

  @ApiPropertyOptional()
  @IsOptional()
  new?: any;
}

export class CreateHistoryDto {
  @ApiProperty({ enum: EntityType, description: 'Тип сущности' })
  @IsEnum(EntityType)
  entity_type: EntityType;

  @ApiProperty({ description: 'ID сущности' })
  @IsNumber()
  @Min(1)
  entity_id: number;

  @ApiProperty({ enum: ActionType, description: 'Тип действия' })
  @IsEnum(ActionType)
  action: ActionType;

  @ApiPropertyOptional({ description: 'Изменения полей (только для update)' })
  @IsOptional()
  @IsObject()
  changes?: Record<string, ChangeFieldDto>;

  @ApiPropertyOptional({ description: 'Описание действия', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

