import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarListingsService } from './car-listings.service';
import { CarListingsController } from './car-listings.controller';
import { CarListing } from './entities/car-listing.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarListing])],
  controllers: [CarListingsController],
  providers: [CarListingsService],
})
export class CarListingsModule {}
