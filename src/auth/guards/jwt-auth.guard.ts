import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    console.log('JwtAuthGuard: canActivate called');
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    console.log('JwtAuthGuard: handleRequest called with:', { err, user, info });
    if (err || !user) {
      console.log('JwtAuthGuard: Authentication failed:', err || 'No user');
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}

