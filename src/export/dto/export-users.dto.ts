import { IsEnum, IsOptional, IsArray, IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExportFormat } from './export-cars.dto';

export class UserFiltersDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class ExportUsersDto {
  @IsEnum(ExportFormat)
  format: ExportFormat;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fields?: string[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserFiltersDto)
  filters?: UserFiltersDto;
}

