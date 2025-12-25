import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportController } from './export.controller';
import { ExportService } from './export.service';
import { CarListing } from '../car-listings/entities/car-listing.entity';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarListing, User]),
    UsersModule,
    forwardRef(() => HistoryModule),
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}

