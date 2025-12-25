import { IsEnum, IsOptional, IsArray, IsString, IsNumber, IsObject, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum ExportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  JSON = 'json',
}

export class CarFiltersDto {
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
}

export class ExportCarsDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CarFiltersDto)
  filters?: CarFiltersDto;
}

