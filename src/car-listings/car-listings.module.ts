import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarListingsService } from './car-listings.service';
import { CarListingsController } from './car-listings.controller';
import { CarListing } from './entities/car-listing.entity';
import { CarPhoto } from './entities/car-photo.entity';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarListing, CarPhoto]),
    HistoryModule,
  ],
  controllers: [CarListingsController],
  providers: [CarListingsService],
})
export class CarListingsModule {}
