import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateCarListingDto {
  @IsOptional()
  @IsString()
  short_url?: string;

  @IsOptional()
  @IsString()
  title?: string;

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
  horsepower?: string;

  @IsOptional()
  @IsString()
  fuel_type?: string;

  @IsOptional()
  @IsString()
  motors_trim?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  kilometers?: number;

  @IsOptional()
  @IsString()
  price_formatted?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price_raw?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  exterior_color?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  seller_name?: string;

  @IsOptional()
  @IsString()
  seller_type?: string;

  @IsOptional()
  @IsString()
  seller_logo?: string;

  @IsOptional()
  @IsString()
  seller_profile_link?: string;
}
