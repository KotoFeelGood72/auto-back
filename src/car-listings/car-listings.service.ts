import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarListing } from './entities/car-listing.entity';
import { CarPhoto } from './entities/car-photo.entity';
import { CreateCarListingDto } from './dto/create-car-listing.dto';
import { UpdateCarListingDto } from './dto/update-car-listing.dto';

@Injectable()
export class CarListingsService {
  constructor(
    @InjectRepository(CarListing)
    private carListingsRepository: Repository<CarListing>,
    @InjectRepository(CarPhoto)
    private carPhotosRepository: Repository<CarPhoto>,
  ) {}

  async create(createCarListingDto: CreateCarListingDto): Promise<CarListing> {
    const carListing = this.carListingsRepository.create(createCarListingDto);
    return this.carListingsRepository.save(carListing);
  }

  async findAll(filters?: any): Promise<{ data: CarListing[]; pagination: any }> {
    try {
      // Параметры пагинации
      const page = parseInt(filters?.page) || 1;
      const limit = parseInt(filters?.limit) || 10;
      const skip = (page - 1) * limit;

      // Создаем query builder
      const queryBuilder = this.carListingsRepository.createQueryBuilder('carListing');
      
      // Фильтрация по марке (без учета регистра)
      if (filters?.make) {
        queryBuilder.andWhere('LOWER(carListing.make) LIKE LOWER(:make)', { make: `%${filters.make}%` });
      }
      
      // Фильтрация по модели (без учета регистра)
      if (filters?.model) {
        queryBuilder.andWhere('LOWER(carListing.model) LIKE LOWER(:model)', { model: `%${filters.model}%` });
      }
      
      // Фильтрация по году
      if (filters?.year) {
        queryBuilder.andWhere('carListing.year = :year', { year: filters.year });
      }
      
      // Фильтрация по цвету (без учета регистра)
      if (filters?.exterior_color) {
        queryBuilder.andWhere('LOWER(carListing.exterior_color) LIKE LOWER(:exterior_color)', { exterior_color: `%${filters.exterior_color}%` });
      }
      
      // Фильтрация по минимальной цене
      if (filters?.minPrice) {
        queryBuilder.andWhere('carListing.price_raw >= :minPrice', { minPrice: parseFloat(filters.minPrice) });
      }
      
      // Фильтрация по максимальной цене
      if (filters?.maxPrice) {
        queryBuilder.andWhere('carListing.price_raw <= :maxPrice', { maxPrice: parseFloat(filters.maxPrice) });
      }
      
      // Фильтрация по местоположению
      if (filters?.location) {
        queryBuilder.andWhere('carListing.location ILIKE :location', { location: `%${filters.location}%` });
      }
      
      // Фильтрация по типу кузова (без учета регистра)
      if (filters?.body_type) {
        queryBuilder.andWhere('LOWER(carListing.body_type) LIKE LOWER(:body_type)', { body_type: `%${filters.body_type}%` });
      }
      
      // Фильтрация по типу топлива (без учета регистра)
      if (filters?.fuel_type) {
        queryBuilder.andWhere('LOWER(carListing.fuel_type) LIKE LOWER(:fuel_type)', { fuel_type: `%${filters.fuel_type}%` });
      }
      
      // Фильтрация по пробегу (максимальный)
      if (filters?.maxKilometers) {
        queryBuilder.andWhere('carListing.kilometers <= :maxKilometers', { maxKilometers: parseInt(filters.maxKilometers) });
      }
      
      // Поиск по нескольким полям
      if (filters?.search) {
        const searchTerm = `%${filters.search}%`;
        queryBuilder.andWhere(
          '(carListing.title ILIKE :search OR carListing.make ILIKE :search OR carListing.model ILIKE :search OR carListing.body_type ILIKE :search OR carListing.location ILIKE :search OR carListing.seller_name ILIKE :search)',
          { search: searchTerm }
        );
      }
      
      // Получаем общее количество записей для пагинации
      const total = await queryBuilder.getCount();
      
      // Применяем пагинацию
      queryBuilder.skip(skip).take(limit);
      
      // Получаем данные с фотографиями
      const data = await queryBuilder
        .leftJoinAndSelect('carListing.photos', 'photos')
        .getMany();
      
      // Добавляем поля images и main_image для обратной совместимости
      const dataWithImages = data.map(item => ({
        ...item,
        images: item.photos?.map(photo => photo.photo_url) || [],
        main_image: item.photos?.[0]?.photo_url || null
      }));
      
      // Вычисляем общее количество страниц
      const totalPages = Math.ceil(total / limit);
      
      return {
        data: dataWithImages,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error in findAll:', error);
      throw error;
    }
  }

  async findOne(id: number): Promise<CarListing> {
    const carListing = await this.carListingsRepository.findOne({
      where: { id },
      relations: ['photos']
    });
    
    if (!carListing) {
      throw new NotFoundException(`Car listing with ID ${id} not found`);
    }
    
    // Добавляем поля images и main_image для обратной совместимости
    return {
      ...carListing,
      images: carListing.photos?.map(photo => photo.photo_url) || [],
      main_image: carListing.photos?.[0]?.photo_url || null
    } as CarListing;
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
