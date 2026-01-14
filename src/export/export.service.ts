import { Injectable, BadRequestException, PayloadTooLargeException, GatewayTimeoutException, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarListing } from '../car-listings/entities/car-listing.entity';
import { User } from '../users/entities/user.entity';
import { ExportFormat } from './dto/export-cars.dto';
import { ExportCarsDto, CarFiltersDto } from './dto/export-cars.dto';
import { ExportUsersDto, UserFiltersDto } from './dto/export-users.dto';
import { HistoryService } from '../history/history.service';
import { EntityType, ActionType } from '../history/dto/create-history.dto';
import { Request } from 'express';
import * as XLSX from 'xlsx';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);
  private readonly MAX_RECORDS: number;
  private readonly TIMEOUT_MS = 5 * 60 * 1000; // 5 минут

  // Доступные поля для экспорта автомобилей
  private readonly CAR_FIELDS = [
    'id',
    'title',
    'make',
    'model',
    'year',
    'body_type',
    'fuel_type',
    'kilometers',
    'horsepower',
    'exterior_color',
    'price_formatted',
    'currency',
    'location',
    'phone',
    'seller_name',
    'seller_type',
    'short_url',
    'main_image',
    'status',
    'created_at',
    'updated_at',
  ];

  // Доступные поля для экспорта пользователей
  private readonly USER_FIELDS = [
    'id',
    'email',
    'firstName',
    'lastName',
    'phone',
    'role',
    'bio',
    'created_at',
    'updated_at',
  ];

  // Русские названия полей для заголовков
  private readonly CAR_FIELD_NAMES: Record<string, string> = {
    id: 'ID',
    title: 'Название',
    make: 'Марка',
    model: 'Модель',
    year: 'Год',
    body_type: 'Тип кузова',
    fuel_type: 'Тип топлива',
    kilometers: 'Пробег',
    horsepower: 'Мощность',
    exterior_color: 'Цвет',
    price_formatted: 'Цена',
    currency: 'Валюта',
    location: 'Локация',
    phone: 'Телефон',
    seller_name: 'Имя продавца',
    seller_type: 'Тип продавца',
    short_url: 'URL',
    main_image: 'Главное изображение',
    status: 'Статус',
    created_at: 'Дата создания',
    updated_at: 'Дата обновления',
  };

  private readonly USER_FIELD_NAMES: Record<string, string> = {
    id: 'ID',
    email: 'Email',
    firstName: 'Имя',
    lastName: 'Фамилия',
    phone: 'Телефон',
    role: 'Роль',
    bio: 'Биография',
    created_at: 'Дата создания',
    updated_at: 'Дата обновления',
  };

  constructor(
    @InjectRepository(CarListing)
    private carListingsRepository: Repository<CarListing>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => HistoryService))
    private historyService: HistoryService,
    private configService: ConfigService,
  ) {
    // Лимит записей настраивается через переменную окружения EXPORT_MAX_RECORDS
    // По умолчанию: 100000 записей
    this.MAX_RECORDS = this.configService.get<number>('EXPORT_MAX_RECORDS', 100000);
    this.logger.log(`Лимит записей для экспорта установлен: ${this.MAX_RECORDS}`);
  }

  async exportCars(dto: ExportCarsDto, userId?: number, userName?: string, request?: Request): Promise<Buffer | string> {
    const startTime = Date.now();
    
    try {
      // Валидация полей
      const fields = this.validateFields(dto.fields || [], this.CAR_FIELDS, 'cars');

      // Получение данных с фильтрами
      const data = await this.getCarsData(dto.filters || {});

      // Проверка лимита записей
      if (data.length > this.MAX_RECORDS) {
        throw new PayloadTooLargeException(
          `Превышен лимит записей. Максимум: ${this.MAX_RECORDS}, получено: ${data.length}`
        );
      }

      // Формирование данных для экспорта
      const exportData = await this.prepareCarData(data, fields);

      // Экспорт в нужном формате
      const result = await this.exportData(exportData, fields, dto.format, this.CAR_FIELD_NAMES);

      const duration = Date.now() - startTime;
      this.logger.log(`Экспорт автомобилей: ${data.length} записей, формат: ${dto.format}, время: ${duration}ms`);

      // Логируем экспорт
      if (userId) {
        try {
          await this.historyService.create(
            {
              entity_type: EntityType.EXPORT,
              entity_id: 0, // Для экспорта entity_id не имеет значения
              action: ActionType.EXPORT,
              description: `Экспорт автомобилей: ${data.length} записей, формат: ${dto.format}`,
            },
            userId,
            userName || '',
            request,
          );
        } catch (error) {
          console.error('Ошибка логирования экспорта автомобилей:', error);
        }
      }

      return result;
    } catch (error) {
      if (error instanceof PayloadTooLargeException) {
        throw error;
      }
      if (Date.now() - startTime > this.TIMEOUT_MS) {
        throw new GatewayTimeoutException('Превышено время выполнения запроса');
      }
      this.logger.error('Ошибка экспорта автомобилей:', error);
      throw error;
    }
  }

  async exportUsers(dto: ExportUsersDto, userId?: number, userName?: string, request?: Request): Promise<Buffer | string> {
    const startTime = Date.now();
    
    try {
      // Валидация полей
      const fields = this.validateFields(dto.fields || [], this.USER_FIELDS, 'users');

      // Получение данных с фильтрами
      const data = await this.getUsersData(dto.filters || {});

      // Проверка лимита записей
      if (data.length > this.MAX_RECORDS) {
        throw new PayloadTooLargeException(
          `Превышен лимит записей. Максимум: ${this.MAX_RECORDS}, получено: ${data.length}`
        );
      }

      // Формирование данных для экспорта
      const exportData = this.prepareUserData(data, fields);

      // Экспорт в нужном формате
      const result = await this.exportData(exportData, fields, dto.format, this.USER_FIELD_NAMES);

      const duration = Date.now() - startTime;
      this.logger.log(`Экспорт пользователей: ${data.length} записей, формат: ${dto.format}, время: ${duration}ms`);

      // Логируем экспорт
      if (userId) {
        try {
          await this.historyService.create(
            {
              entity_type: EntityType.EXPORT,
              entity_id: 0,
              action: ActionType.EXPORT,
              description: `Экспорт пользователей: ${data.length} записей, формат: ${dto.format}`,
            },
            userId,
            userName || '',
            request,
          );
        } catch (error) {
          console.error('Ошибка логирования экспорта пользователей:', error);
        }
      }

      return result;
    } catch (error) {
      if (error instanceof PayloadTooLargeException) {
        throw error;
      }
      if (Date.now() - startTime > this.TIMEOUT_MS) {
        throw new GatewayTimeoutException('Превышено время выполнения запроса');
      }
      this.logger.error('Ошибка экспорта пользователей:', error);
      throw error;
    }
  }

  async previewCount(type: 'cars' | 'users', filters: CarFiltersDto | UserFiltersDto): Promise<number> {
    if (type === 'cars') {
      const queryBuilder = this.buildCarsQuery(filters as CarFiltersDto);
      return await queryBuilder.getCount();
    } else {
      const queryBuilder = this.buildUsersQuery(filters as UserFiltersDto);
      return await queryBuilder.getCount();
    }
  }

  private validateFields(fields: string[], availableFields: string[], type: string): string[] {
    if (fields.length === 0) {
      return availableFields;
    }

    const invalidFields = fields.filter(field => !availableFields.includes(field));
    if (invalidFields.length > 0) {
      throw new BadRequestException({
        error: {
          code: 400,
          message: 'Неверные поля для экспорта',
          details: {
            field: 'fields',
            invalid_fields: invalidFields,
            allowed_fields: availableFields,
            type,
          },
        },
      });
    }

    return fields;
  }

  private async getCarsData(filters: CarFiltersDto): Promise<CarListing[]> {
    const queryBuilder = this.buildCarsQuery(filters);
    // Не загружаем фотографии для экспорта - это значительно ускоряет запрос
    // Главное изображение будет получено отдельным запросом только для нужных полей
    return await queryBuilder.getMany();
  }

  private buildCarsQuery(filters: CarFiltersDto) {
    const queryBuilder = this.carListingsRepository.createQueryBuilder('carListing');

    if (filters.make) {
      queryBuilder.andWhere('LOWER(carListing.make) LIKE LOWER(:make)', { make: `%${filters.make}%` });
    }

    if (filters.model) {
      queryBuilder.andWhere('LOWER(carListing.model) LIKE LOWER(:model)', { model: `%${filters.model}%` });
    }

    if (filters.year) {
      queryBuilder.andWhere('carListing.year = :year', { year: filters.year });
    }

    if (filters.body_type) {
      queryBuilder.andWhere('LOWER(carListing.body_type) LIKE LOWER(:body_type)', { body_type: `%${filters.body_type}%` });
    }

    if (filters.fuel_type) {
      queryBuilder.andWhere('LOWER(carListing.fuel_type) LIKE LOWER(:fuel_type)', { fuel_type: `%${filters.fuel_type}%` });
    }

    if (filters.location) {
      queryBuilder.andWhere('LOWER(carListing.location) LIKE LOWER(:location)', { location: `%${filters.location}%` });
    }

    if (filters.seller_type) {
      queryBuilder.andWhere('LOWER(carListing.seller_type) LIKE LOWER(:seller_type)', { seller_type: `%${filters.seller_type}%` });
    }

    if (filters.price_min !== undefined) {
      queryBuilder.andWhere('carListing.price_raw >= :price_min', { price_min: filters.price_min });
    }

    if (filters.price_max !== undefined) {
      queryBuilder.andWhere('carListing.price_raw <= :price_max', { price_max: filters.price_max });
    }

    if (filters.kilometers_min !== undefined) {
      queryBuilder.andWhere('carListing.kilometers >= :kilometers_min', { kilometers_min: filters.kilometers_min });
    }

    if (filters.kilometers_max !== undefined) {
      queryBuilder.andWhere('carListing.kilometers <= :kilometers_max', { kilometers_max: filters.kilometers_max });
    }

    // Валидация диапазонов
    if (filters.price_min !== undefined && filters.price_max !== undefined) {
      if (filters.price_min > filters.price_max) {
        throw new BadRequestException('price_min не может быть больше price_max');
      }
    }

    if (filters.kilometers_min !== undefined && filters.kilometers_max !== undefined) {
      if (filters.kilometers_min > filters.kilometers_max) {
        throw new BadRequestException('kilometers_min не может быть больше kilometers_max');
      }
    }

    // Фильтрация по датам
    if (filters.date_from || filters.date_to) {
      // Валидация формата и логики дат
      let dateFrom: Date | null = null;
      let dateTo: Date | null = null;

      if (filters.date_from) {
        dateFrom = this.parseDate(filters.date_from, true);
        if (!dateFrom) {
          throw new BadRequestException({
            error: {
              message: 'Неверный формат даты. Используйте формат ISO 8601 (YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss)',
              code: 'INVALID_DATE_FORMAT',
            },
          });
        }
      }

      if (filters.date_to) {
        dateTo = this.parseDate(filters.date_to, false);
        if (!dateTo) {
          throw new BadRequestException({
            error: {
              message: 'Неверный формат даты. Используйте формат ISO 8601 (YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss)',
              code: 'INVALID_DATE_FORMAT',
            },
          });
        }
      }

      // Проверка логики: date_from не может быть больше date_to
      if (dateFrom && dateTo && dateFrom > dateTo) {
        throw new BadRequestException({
          error: {
            message: 'Дата начала не может быть больше даты окончания',
            code: 'INVALID_DATE_RANGE',
          },
        });
      }

      // Применение фильтров
      if (dateFrom) {
        queryBuilder.andWhere('carListing.created_at >= :date_from', { date_from: dateFrom });
      }

      if (dateTo) {
        queryBuilder.andWhere('carListing.created_at <= :date_to', { date_to: dateTo });
      }
    }

    // Фильтрация по статусу
    if (filters.status) {
      queryBuilder.andWhere('carListing.status = :status', { status: filters.status });
    }

    return queryBuilder;
  }

  /**
   * Парсит строку даты в объект Date
   * @param dateString - строка даты в формате ISO 8601
   * @param isStartOfDay - если true и время не указано, использовать начало дня (00:00:00), иначе конец дня (23:59:59)
   * @returns объект Date или null если формат неверный
   */
  private parseDate(dateString: string, isStartOfDay: boolean): Date | null {
    try {
      // Если дата в формате YYYY-MM-DD (без времени)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return null;
        }
        // Если время не указано, устанавливаем начало или конец дня
        if (isStartOfDay) {
          date.setUTCHours(0, 0, 0, 0);
        } else {
          date.setUTCHours(23, 59, 59, 999);
        }
        return date;
      }

      // Если дата с временем
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch (error) {
      return null;
    }
  }

  private async getUsersData(filters: UserFiltersDto): Promise<User[]> {
    const queryBuilder = this.buildUsersQuery(filters);
    return await queryBuilder.getMany();
  }

  private buildUsersQuery(filters: UserFiltersDto) {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (filters.role) {
      queryBuilder.andWhere('LOWER(user.role) = LOWER(:role)', { role: filters.role });
    }

    if (filters.email) {
      queryBuilder.andWhere('LOWER(user.email) LIKE LOWER(:email)', { email: `%${filters.email}%` });
    }

    return queryBuilder;
  }

  private async prepareCarData(data: CarListing[], fields: string[]): Promise<any[]> {
    // Если нужно поле main_image, загружаем фотографии только для нужных записей
    const needsMainImage = fields.includes('main_image');
    
    if (needsMainImage && data.length > 0) {
      const ids = data.map(item => item.id);
      const photos = await this.carListingsRepository
        .createQueryBuilder('carListing')
        .leftJoinAndSelect('carListing.photos', 'photos')
        .where('carListing.id IN (:...ids)', { ids })
        .getMany();
      
      const photosMap = new Map<number, string>();
      photos.forEach(car => {
        photosMap.set(car.id, car.photos?.[0]?.photo_url || '');
      });
      
      return data.map(item => {
        const result: any = {};
        fields.forEach(field => {
          if (field === 'main_image') {
            result[field] = photosMap.get(item.id) || '';
          } else if (field === 'created_at') {
            result[field] = item.created_at ? new Date(item.created_at).toISOString() : '';
          } else if (field === 'updated_at') {
            result[field] = item.updated_at ? new Date(item.updated_at).toISOString() : '';
          } else {
            result[field] = item[field] ?? '';
          }
        });
        return result;
      });
    }
    
    return data.map(item => {
      const result: any = {};
      fields.forEach(field => {
        if (field === 'created_at') {
          result[field] = item.created_at ? new Date(item.created_at).toISOString() : '';
        } else if (field === 'updated_at') {
          result[field] = item.updated_at ? new Date(item.updated_at).toISOString() : '';
        } else {
          result[field] = item[field] ?? '';
        }
      });
      return result;
    });
  }

  private prepareUserData(data: User[], fields: string[]): any[] {
    return data.map(item => {
      const result: any = {};
      
      fields.forEach(field => {
        if (field === 'created_at') {
          result[field] = item.createdAt ? new Date(item.createdAt).toISOString() : '';
        } else if (field === 'updated_at') {
          result[field] = item.updatedAt ? new Date(item.updatedAt).toISOString() : '';
        } else {
          result[field] = item[field] ?? '';
        }
      });
      
      return result;
    });
  }

  private async exportData(
    data: any[],
    fields: string[],
    format: ExportFormat,
    fieldNames: Record<string, string>,
  ): Promise<Buffer | string> {
    switch (format) {
      case ExportFormat.CSV:
        return this.exportToCSV(data, fields, fieldNames);
      case ExportFormat.EXCEL:
        return this.exportToExcel(data, fields, fieldNames);
      case ExportFormat.JSON:
        return this.exportToJSON(data);
      default:
        throw new BadRequestException('Неверный формат экспорта');
    }
  }

  private exportToCSV(data: any[], fields: string[], fieldNames: Record<string, string>): Buffer {
    // UTF-8 BOM для корректного отображения в Excel
    const BOM = '\uFEFF';
    
    // Заголовки
    const headers = fields.map(field => fieldNames[field] || field);
    let csv = BOM + headers.map(h => this.escapeCSVValue(h)).join(',') + '\n';
    
    // Данные
    data.forEach(row => {
      const values = fields.map(field => {
        const value = row[field] ?? '';
        return this.escapeCSVValue(String(value));
      });
      csv += values.join(',') + '\n';
    });
    
    return Buffer.from(csv, 'utf-8');
  }

  private escapeCSVValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  private exportToExcel(data: any[], fields: string[], fieldNames: Record<string, string>): Buffer {
    // Подготовка данных для Excel
    const worksheetData: any[] = [];
    
    // Заголовки
    const headers = fields.map(field => fieldNames[field] || field);
    worksheetData.push(headers);
    
    // Данные
    data.forEach(row => {
      const values = fields.map(field => row[field] ?? '');
      worksheetData.push(values);
    });
    
    // Создание рабочей книги
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Форматирование заголовков
    const headerRange = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: fields.length - 1, r: 0 } });
    worksheet['!rows'] = [{ hpt: 20 }];
    
    // Автоматическая ширина колонок
    const colWidths = fields.map((field, index) => {
      const maxLength = Math.max(
        headers[index].length,
        ...data.map(row => String(row[field] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Конвертация в буфер
    return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));
  }

  private exportToJSON(data: any[]): string {
    return JSON.stringify(data, null, 2);
  }
}

