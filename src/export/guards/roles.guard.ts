import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../../users/users.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Требуется авторизация');
    }

    // Получаем полную информацию о пользователе из БД
    const fullUser = await this.usersService.findOne(user.userId);
    
    if (!fullUser) {
      throw new ForbiddenException('Пользователь не найден');
    }

    if (!requiredRoles.includes(fullUser.role)) {
      throw new ForbiddenException('Недостаточно прав для выполнения операции');
    }

    return true;
  }
}

