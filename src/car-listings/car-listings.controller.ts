import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CarListingsService, AVAILABLE_STATUSES } from './car-listings.service';
import { CreateCarListingDto } from './dto/create-car-listing.dto';
import { UpdateCarListingDto } from './dto/update-car-listing.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Объявления о продаже автомобилей')
@Controller('car-listings')
export class CarListingsController {
  constructor(private readonly carListingsService: CarListingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новое объявление о продаже автомобиля' })
  @ApiResponse({ status: 201, description: 'Объявление создано' })
  create(@Body() createCarListingDto: CreateCarListingDto, @Req() req: Request) {
    const user = req.user as any;
    const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
    return this.carListingsService.create(createCarListingDto, user.userId, userName, req);
  }

  @Get()
  @ApiOperation({ summary: 'Получить все объявления о продаже автомобилей с фильтрацией и пагинацией' })
  @ApiQuery({ name: 'make', required: false, description: 'Фильтр по марке' })
  @ApiQuery({ name: 'model', required: false, description: 'Фильтр по модели' })
  @ApiQuery({ name: 'year', required: false, description: 'Фильтр по году' })
  @ApiQuery({ name: 'exterior_color', required: false, description: 'Фильтр по цвету' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Минимальная цена' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Максимальная цена' })
  @ApiQuery({ name: 'location', required: false, description: 'Фильтр по местоположению' })
  @ApiQuery({ name: 'body_type', required: false, description: 'Фильтр по типу кузова' })
  @ApiQuery({ name: 'fuel_type', required: false, description: 'Фильтр по типу топлива' })
  @ApiQuery({ name: 'maxKilometers', required: false, description: 'Максимальный пробег' })
  @ApiQuery({ name: 'status', required: false, description: 'Фильтр по статусу объявления', enum: AVAILABLE_STATUSES, example: 'Активно' })
  @ApiQuery({ name: 'limit', required: false, description: 'Количество записей на странице (по умолчанию 10)', example: 10 })
  @ApiQuery({ name: 'page', required: false, description: 'Номер страницы (начиная с 1, по умолчанию 1)', example: 1 })
  @ApiQuery({ name: 'search', required: false, description: 'Поиск по названию, марке, модели и другим полям', example: 'Toyota Camry' })
  @ApiResponse({ 
    status: 200, 
    description: 'Список объявлений с пагинацией и изображениями',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { 
            allOf: [
              { $ref: '#/components/schemas/CarListing' },
              {
                type: 'object',
                properties: {
                  images: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: 'Массив ссылок на изображения автомобиля'
                  },
                  main_image: { 
                    type: 'string',
                    description: 'Главное изображение автомобиля (первое из массива images)'
                  }
                }
              }
            ]
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', description: 'Текущая страница' },
            limit: { type: 'number', description: 'Количество записей на странице' },
            total: { type: 'number', description: 'Общее количество записей' },
            totalPages: { type: 'number', description: 'Общее количество страниц' }
          }
        },
        availableStatuses: {
          type: 'array',
          items: { type: 'string' },
          description: 'Доступные статусы для фильтрации',
          example: ['Продано', 'Активно', 'Долго продается', 'Появилось недавно']
        }
      }
    }
  })
  async findAll(@Query() filters: any) {
    return await this.carListingsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить объявление по ID с изображениями' })
  @ApiResponse({ 
    status: 200, 
    description: 'Объявление найдено с изображениями',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/CarListing' },
        {
          type: 'object',
          properties: {
            images: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Массив ссылок на изображения автомобиля'
            },
            main_image: { 
              type: 'string',
              description: 'Главное изображение автомобиля (первое из массива images)'
            }
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 404, description: 'Объявление не найдено' })
  findOne(@Param('id') id: string) {
    return this.carListingsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить объявление' })
  @ApiResponse({ status: 200, description: 'Объявление обновлено' })
  @ApiResponse({ status: 404, description: 'Объявление не найдено' })
  update(@Param('id') id: string, @Body() updateCarListingDto: UpdateCarListingDto, @Req() req: Request) {
    const user = req.user as any;
    const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
    return this.carListingsService.update(+id, updateCarListingDto, user.userId, userName, req);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить объявление' })
  @ApiResponse({ status: 200, description: 'Объявление удалено' })
  @ApiResponse({ status: 404, description: 'Объявление не найдено' })
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as any;
    const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
    return this.carListingsService.remove(+id, user.userId, userName, req);
  }
}
