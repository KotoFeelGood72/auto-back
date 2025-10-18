import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarListing } from './entities/car-listing.entity';
import { CreateCarListingDto } from './dto/create-car-listing.dto';
import { UpdateCarListingDto } from './dto/update-car-listing.dto';

@Injectable()
export class CarListingsService {
  constructor(
    @InjectRepository(CarListing)
    private carListingsRepository: Repository<CarListing>,
  ) {}

  async create(createCarListingDto: CreateCarListingDto): Promise<CarListing> {
    const carListing = this.carListingsRepository.create(createCarListingDto);
    return this.carListingsRepository.save(carListing);
  }

  async findAll(filters?: any): Promise<CarListing[]> {
    try {
      // Если нет фильтров, возвращаем все записи
      if (!filters || Object.keys(filters).length === 0) {
        return await this.carListingsRepository.find();
      }

      const queryBuilder = this.carListingsRepository.createQueryBuilder('carListing');
      
      // Фильтрация по бренду
      if (filters.brand) {
        queryBuilder.andWhere('carListing.brand = :brand', { brand: filters.brand });
      }
      
      // Фильтрация по модели
      if (filters.model) {
        queryBuilder.andWhere('carListing.model = :model', { model: filters.model });
      }
      
      // Фильтрация по году
      if (filters.year) {
        queryBuilder.andWhere('carListing.year = :year', { year: parseInt(filters.year) });
      }
      
      // Фильтрация по цвету
      if (filters.color) {
        queryBuilder.andWhere('carListing.color = :color', { color: filters.color });
      }
      
      // Фильтрация по минимальной цене
      if (filters.minPrice) {
        queryBuilder.andWhere('carListing.price >= :minPrice', { minPrice: parseFloat(filters.minPrice) });
      }
      
      // Фильтрация по максимальной цене
      if (filters.maxPrice) {
        queryBuilder.andWhere('carListing.price <= :maxPrice', { maxPrice: parseFloat(filters.maxPrice) });
      }
      
      // Фильтрация по доступности
      if (filters.isAvailable !== undefined && filters.isAvailable !== '') {
        queryBuilder.andWhere('carListing.isAvailable = :isAvailable', { 
          isAvailable: filters.isAvailable === 'true' 
        });
      }
      
      // Фильтрация по владельцу
      if (filters.ownerId) {
        queryBuilder.andWhere('carListing.ownerId = :ownerId', { ownerId: parseInt(filters.ownerId) });
      }
      
      return await queryBuilder.getMany();
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<CarListing> {
    const carListing = await this.carListingsRepository.findOne({
      where: { id },
    });
    
    if (!carListing) {
      throw new NotFoundException(`Car listing with ID ${id} not found`);
    }
    
    return carListing;
  }

  async update(id: number, updateCarListingDto: UpdateCarListingDto): Promise<CarListing> {
    const carListing = await this.findOne(id);
    Object.assign(carListing, updateCarListingDto);
    return this.carListingsRepository.save(carListing);
  }

  async remove(id: number): Promise<void> {
    const carListing = await this.findOne(id);
    await this.carListingsRepository.remove(carListing);
  }
}
