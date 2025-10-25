import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CarPhoto } from './car-photo.entity';

@Entity('car_listings')
export class CarListing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  short_url: string;

  @Column({ type: 'text', default: 'Неизвестно' })
  title: string;

  @Column({ type: 'text', default: 'Неизвестно' })
  make: string;

  @Column({ type: 'text', default: 'Неизвестно' })
  model: string;

  @Column({ type: 'text', default: 'Неизвестно' })
  year: string;

  @Column({ type: 'text', default: 'Неизвестно' })
  body_type: string;

  @Column({ type: 'text', default: 'Неизвестно' })
  horsepower: string;

  @Column({ type: 'text', default: 'Неизвестно' })
  fuel_type: string;

  @Column({ type: 'text', default: 'Неизвестно' })
  motors_trim: string;

  @Column({ type: 'integer', default: 0 })
  kilometers: number;

  @Column({ type: 'text', default: '0' })
  price_formatted: string;

  @Column({ type: 'numeric', default: 0 })
  price_raw: number;

  @Column({ type: 'text', default: 'Неизвестно' })
  currency: string;

  @Column({ type: 'text', default: 'Неизвестно' })
  exterior_color: string;

  @Column({ type: 'text', default: 'Неизвестно' })
  location: string;

  @Column({ type: 'text', default: 'Не указан' })
  phone: string;

  @Column({ type: 'text', default: 'Неизвестен' })
  seller_name: string;

  @Column({ type: 'text', default: 'Неизвестен' })
  seller_type: string;

  @Column({ type: 'text', nullable: true })
  seller_logo: string;

  @Column({ type: 'text', nullable: true })
  seller_profile_link: string;

  @OneToMany(() => CarPhoto, photo => photo.carListing)
  photos: CarPhoto[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
