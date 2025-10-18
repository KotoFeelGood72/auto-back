import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CarListingsService } from './car-listings.service';
import { CreateCarListingDto } from './dto/create-car-listing.dto';
import { UpdateCarListingDto } from './dto/update-car-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Объявления о продаже автомобилей')
@Controller('car-listings')
export class CarListingsController {
  constructor(private readonly carListingsService: CarListingsService) {}

  @Post()
  @ApiOperation({ summary: 'Создать новое объявление о продаже автомобиля' })
  @ApiResponse({ status: 201, description: 'Объявление создано' })
  create(@Body() createCarListingDto: CreateCarListingDto) {
    return this.carListingsService.create(createCarListingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все объявления о продаже автомобилей с фильтрацией' })
  @ApiQuery({ name: 'brand', required: false, description: 'Фильтр по бренду' })
  @ApiQuery({ name: 'model', required: false, description: 'Фильтр по модели' })
  @ApiQuery({ name: 'year', required: false, description: 'Фильтр по году' })
  @ApiQuery({ name: 'color', required: false, description: 'Фильтр по цвету' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Минимальная цена' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Максимальная цена' })
  @ApiQuery({ name: 'isAvailable', required: false, description: 'Доступность (true/false)' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'ID владельца' })
  @ApiResponse({ status: 200, description: 'Список объявлений' })
  findAll(@Query() filters: any) {
    return this.carListingsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить объявление по ID' })
  @ApiResponse({ status: 200, description: 'Объявление найдено' })
  @ApiResponse({ status: 404, description: 'Объявление не найдено' })
  findOne(@Param('id') id: string) {
    return this.carListingsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить объявление' })
  @ApiResponse({ status: 200, description: 'Объявление обновлено' })
  @ApiResponse({ status: 404, description: 'Объявление не найдено' })
  update(@Param('id') id: string, @Body() updateCarListingDto: UpdateCarListingDto) {
    return this.carListingsService.update(+id, updateCarListingDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить объявление' })
  @ApiResponse({ status: 200, description: 'Объявление удалено' })
  @ApiResponse({ status: 404, description: 'Объявление не найдено' })
  remove(@Param('id') id: string) {
    return this.carListingsService.remove(+id);
  }
}
