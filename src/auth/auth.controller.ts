import { Controller, Post, Body, HttpException, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { JwtService } from '@nestjs/jwt';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class VerifyTokenDto {
  @IsString()
  token: string;
}

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiBody({ 
    type: LoginDto,
    examples: {
      admin: {
        summary: 'Админ пользователь',
        value: {
          email: 'admin@test.com',
          password: 'admin123'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Успешный вход' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  async login(@Body() loginDto: LoginDto) {
    try {
      console.log('Login attempt for:', loginDto.email);
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      console.log('User validation result:', user ? 'Success' : 'Failed');
      if (!user) {
        throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
      }
      return this.authService.login(user);
    } catch (error) {
      console.error('Login error:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Login failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ 
    type: CreateUserDto,
    examples: {
      admin: {
        summary: 'Админ пользователь',
        value: {
          email: 'admin@test.com',
          password: 'admin123',
          firstName: 'Admin',
          lastName: 'User'
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Проверить токен' })
  @ApiBody({ 
    type: VerifyTokenDto,
    examples: {
      example: {
        summary: 'Пример токена',
        value: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Токен валиден' })
  @ApiResponse({ status: 401, description: 'Токен недействителен' })
  async verify(@Body() verifyTokenDto: VerifyTokenDto) {
    try {
      const decoded = this.jwtService.verify(verifyTokenDto.token);
      
      return {
        message: 'Token is valid',
        status: 'authenticated',
        user: {
          id: decoded.sub,
          email: decoded.email
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
  }
}
