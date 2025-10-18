import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ 
    description: 'Email пользователя', 
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    description: 'Пароль пользователя', 
    example: 'password123',
    minLength: 6
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    description: 'Имя пользователя', 
    example: 'Иван'
  })
  @IsString()
  firstName: string;

  @ApiProperty({ 
    description: 'Фамилия пользователя', 
    example: 'Иванов'
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ 
    description: 'Активен ли пользователь', 
    example: true,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
