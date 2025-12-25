import { IsEnum, IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CarFiltersDto } from './export-cars.dto';
import { UserFiltersDto } from './export-users.dto';

export enum ExportType {
  CARS = 'cars',
  USERS = 'users',
}

export class PreviewExportDto {
  @IsEnum(ExportType)
  type: ExportType;

  // Фильтры для автомобилей
  @IsOptional()
  @IsString()
  make?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  year?: string;

  @IsOptional()
  @IsString()
  body_type?: string;

  @IsOptional()
  @IsString()
  fuel_type?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  seller_type?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price_min?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price_max?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  kilometers_min?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  kilometers_max?: number;

  // Фильтры для пользователей
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

