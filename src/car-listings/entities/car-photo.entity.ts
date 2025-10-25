import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CarListing } from './car-listing.entity';

@Entity('car_photos')
export class CarPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'listing_id' })
  listing_id: number;

  @Column({ type: 'text', name: 'photo_url' })
  photo_url: string;

  @ManyToOne(() => CarListing, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listing_id' })
  carListing: CarListing;
}
