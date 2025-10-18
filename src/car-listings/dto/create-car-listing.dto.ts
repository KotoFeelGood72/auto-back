import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCarListingDto {
  @ApiProperty({ 
    description: 'Марка автомобиля', 
    example: 'Toyota'
  })
  @IsString()
  brand: string;

  @ApiProperty({ 
    description: 'Модель автомобиля', 
    example: 'Camry'
  })
  @IsString()
  model: string;

  @ApiProperty({ 
    description: 'Год выпуска автомобиля', 
    example: 2020,
    minimum: 1900,
    maximum: 2025
  })
  @IsNumber()
  year: number;

  @ApiProperty({ 
    description: 'Цвет автомобиля', 
    example: 'Белый'
  })
  @IsString()
  color: string;

  @ApiProperty({ 
    description: 'Цена автомобиля в рублях', 
    example: 1500000,
    minimum: 0
  })
  @IsNumber()
  price: number;

  @ApiPropertyOptional({ 
    description: 'Доступен ли автомобиль для продажи', 
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ 
    description: 'ID владельца автомобиля', 
    example: 1
  })
  @IsNumber()
  ownerId: number;
}
