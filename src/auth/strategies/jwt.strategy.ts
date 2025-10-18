import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
    console.log('JWT Strategy initialized with secret:', process.env.JWT_SECRET || 'your-secret-key');
  }

  async validate(payload: any) {
    console.log('JWT Strategy validate called with payload:', payload);
    // Возвращаем данные из payload без дополнительной проверки в БД
    const result = { 
      userId: payload.sub, 
      email: payload.email 
    };
    console.log('JWT Strategy returning:', result);
    return result;
  }
}
