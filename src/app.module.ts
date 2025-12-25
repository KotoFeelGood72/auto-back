import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CarListingsModule } from './car-listings/car-listings.module';
import { ExportModule } from './export/export.module';
import { HistoryModule } from './history/history.module';
import { User } from './users/entities/user.entity';
import { CarListing } from './car-listings/entities/car-listing.entity';
import { CarPhoto } from './car-listings/entities/car-photo.entity';
import { History } from './history/entities/history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, CarListing, CarPhoto, History],
      synchronize: false, // Отключаем синхронизацию
      logging: true, // Добавим логирование для отладки
    }),
    AuthModule,
    UsersModule,
    CarListingsModule,
    ExportModule,
    HistoryModule,
  ],
})
export class AppModule {}
