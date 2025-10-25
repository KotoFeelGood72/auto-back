import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCarListingDto {
  @ApiProperty({ 
    description: 'Короткая ссылка на объявление', 
    example: 'https://example.com/car/123'
  })
  @IsString()
  short_url: string;

  @ApiPropertyOptional({ 
    description: 'Название объявления', 
    example: 'Toyota Camry 2020',
    default: 'Неизвестно'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ 
    description: 'Марка автомобиля', 
    example: 'Toyota',
    default: 'Неизвестно'
  })
  @IsOptional()
  @IsString()
  make?: string;

  @ApiPropertyOptional({ 
    description: 'Модель автомобиля', 
    example: 'Camry',
    default: 'Неизвестно'
  })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional({ 
    description: 'Год выпуска автомобиля', 
    example: '2020',
    default: 'Неизвестно'
  })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiPropertyOptional({ 
    description: 'Тип кузова', 
    example: 'Седан',
    default: 'Неизвестно'
  })
  @IsOptional()
  @IsString()
  body_type?: string;

  @ApiPropertyOptional({ 
    description: 'Мощность двигателя', 
    example: '150 л.с.',
    default: 'Неизвестно'
  })
  @IsOptional()
  @IsString()
  horsepower?: string;

  @ApiPropertyOptional({ 
    description: 'Тип топлива', 
    example: 'Бензин',
    default: 'Неизвестно'
  })
  @IsOptional()
  @IsString()
  fuel_type?: string;

  @ApiPropertyOptional({ 
    description: 'Комплектация двигателя', 
    example: '2.0L',
    default: 'Неизвестно'
  })
  @IsOptional()
  @IsString()
  motors_trim?: string;

  @ApiPropertyOptional({ 
    description: 'Пробег в километрах', 
    example: 50000,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  kilometers?: number;

  @ApiPropertyOptional({ 
    description: 'Отформатированная цена', 
    example: '1 500 000 ₽',
    default: '0'
  })
  @IsOptional()
  @IsString()
  price_formatted?: string;

  @ApiPropertyOptional({ 
    description: 'Цена в числовом формате', 
    example: 1500000,
    default: 0
  })
  @IsOptional()
  @IsNumber()
  price_raw?: number;

  @ApiPropertyOptional({ 
    description: 'Валюта', 
    example: 'RUB',
    default: 'Неизвестно'
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ 
    description: 'Цвет автомобиля', 
    example: 'Белый',
    default: 'Неизвестно'
  })
  @IsOptional()
  @IsString()
  exterior_color?: string;

  @ApiPropertyOptional({ 
    description: 'Местоположение', 
    example: 'Москва',
    default: 'Неизвестно'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ 
    description: 'Телефон продавца', 
    example: '+7 (999) 123-45-67',
    default: 'Не указан'
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ 
    description: 'Имя продавца', 
    example: 'Иван Иванов',
    default: 'Неизвестен'
  })
  @IsOptional()
  @IsString()
  seller_name?: string;

  @ApiPropertyOptional({ 
    description: 'Тип продавца', 
    example: 'Частное лицо',
    default: 'Неизвестен'
  })
  @IsOptional()
  @IsString()
  seller_type?: string;

  @ApiPropertyOptional({ 
    description: 'Логотип продавца', 
    example: 'https://example.com/logo.png'
  })
  @IsOptional()
  @IsString()
  seller_logo?: string;

  @ApiPropertyOptional({ 
    description: 'Ссылка на профиль продавца', 
    example: 'https://example.com/seller/123'
  })
  @IsOptional()
  @IsString()
  seller_profile_link?: string;
}
