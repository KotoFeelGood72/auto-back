import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ 
    description: 'Email пользователя', 
    example: 'user@example.com',
    format: 'email'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ 
    description: 'Пароль пользователя', 
    example: 'password123',
    minLength: 6
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ 
    description: 'Имя пользователя', 
    example: 'Иван'
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ 
    description: 'Фамилия пользователя', 
    example: 'Иванов'
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ 
    description: 'Активен ли пользователь', 
    example: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

