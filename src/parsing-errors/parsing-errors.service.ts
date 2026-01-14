import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParsingError } from './entities/parsing-error.entity';
import { FilterParsingErrorsDto, ErrorType } from './dto/filter-parsing-errors.dto';

@Injectable()
export class ParsingErrorsService {
  private readonly logger = new Logger(ParsingErrorsService.name);

  constructor(
    @InjectRepository(ParsingError)
    private parsingErrorsRepository: Repository<ParsingError>,
  ) {}

  /**
   * Получить список ошибок с фильтрацией и пагинацией
   */
  async findAll(filters: FilterParsingErrorsDto) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.parsingErrorsRepository.createQueryBuilder('error');

    // Фильтр по парсеру
    if (filters.parser_name) {
      queryBuilder.andWhere('LOWER(error.parser_name) = LOWER(:parser_name)', {
        parser_name: filters.parser_name,
      });
    }

    // Фильтр по типу ошибки
    if (filters.error_type) {
      queryBuilder.andWhere('error.error_type = :error_type', {
        error_type: filters.error_type,
      });
    }

    // Фильтр по статусу обработки
    if (filters.is_processed !== undefined) {
      queryBuilder.andWhere('error.is_processed = :is_processed', {
        is_processed: filters.is_processed,
      });
    }

    // Фильтр по датам
    if (filters.date_from) {
      const dateFrom = new Date(filters.date_from);
      if (!filters.date_from.includes('T')) {
        dateFrom.setUTCHours(0, 0, 0, 0);
      }
      queryBuilder.andWhere('error.created_at >= :date_from', { date_from: dateFrom });
    }

    if (filters.date_to) {
      const dateTo = new Date(filters.date_to);
      if (!filters.date_to.includes('T')) {
        dateTo.setUTCHours(23, 59, 59, 999);
      }
      queryBuilder.andWhere('error.created_at <= :date_to', { date_to: dateTo });
    }

    // Сортировка по дате создания (новые сначала)
    queryBuilder.orderBy('error.created_at', 'DESC');

    // Получаем общее количество
    const total = await queryBuilder.getCount();

    // Применяем пагинацию
    queryBuilder.skip(skip).take(limit);

    // Получаем данные
    const data = await queryBuilder.getMany();

    // Вычисляем общее количество страниц
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Получить ошибку по ID
   */
  async findOne(id: number): Promise<ParsingError> {
    const error = await this.parsingErrorsRepository.findOne({
      where: { id },
    });

    if (!error) {
      throw new Error(`Parsing error with ID ${id} not found`);
    }

    return error;
  }

  /**
   * Отметить ошибку как обработанную
   */
  async markAsProcessed(id: number): Promise<ParsingError> {
    const error = await this.findOne(id);

    error.is_processed = true;
    error.processed_at = new Date();

    return await this.parsingErrorsRepository.save(error);
  }

  /**
   * Отметить несколько ошибок как обработанные
   */
  async markMultipleAsProcessed(ids: number[]): Promise<{ success: number; errors: number[] }> {
    const results = await Promise.allSettled(
      ids.map((id) => this.markAsProcessed(id)),
    );

    const success = results.filter((r) => r.status === 'fulfilled').length;
    const errors = results
      .map((r, index) => (r.status === 'rejected' ? ids[index] : null))
      .filter((id) => id !== null) as number[];

    return { success, errors };
  }

  /**
   * Получить статистику ошибок
   */
  async getStats() {
    // Общая статистика по парсерам и типам ошибок
    const statsQuery = this.parsingErrorsRepository
      .createQueryBuilder('error')
      .select('error.parser_name', 'parser_name')
      .addSelect('error.error_type', 'error_type')
      .addSelect('COUNT(*)', 'total_errors')
      .addSelect(
        'COUNT(*) FILTER (WHERE error.is_processed = false)',
        'unprocessed_errors',
      )
      .groupBy('error.parser_name')
      .addGroupBy('error.error_type')
      .orderBy('total_errors', 'DESC');

    const stats = await statsQuery.getRawMany();

    // Общее количество необработанных ошибок
    const totalUnprocessed = await this.parsingErrorsRepository.count({
      where: { is_processed: false },
    });

    // Статистика по типам ошибок
    const errorTypeStats = await this.parsingErrorsRepository
      .createQueryBuilder('error')
      .select('error.error_type', 'error_type')
      .addSelect('COUNT(*)', 'count')
      .addSelect(
        'COUNT(*) FILTER (WHERE error.is_processed = false)',
        'unprocessed',
      )
      .groupBy('error.error_type')
      .getRawMany();

    // Статистика по парсерам
    const parserStats = await this.parsingErrorsRepository
      .createQueryBuilder('error')
      .select('error.parser_name', 'parser_name')
      .addSelect('COUNT(*)', 'count')
      .addSelect(
        'COUNT(*) FILTER (WHERE error.is_processed = false)',
        'unprocessed',
      )
      .groupBy('error.parser_name')
      .getRawMany();

    return {
      stats: stats.map((item: any) => ({
        parser_name: item.parser_name,
        error_type: item.error_type,
        total_errors: parseInt(item.total_errors),
        unprocessed_errors: parseInt(item.unprocessed_errors),
      })),
      errorTypeStats: errorTypeStats.map((item: any) => ({
        error_type: item.error_type,
        count: parseInt(item.count),
        unprocessed: parseInt(item.unprocessed),
      })),
      parserStats: parserStats.map((item: any) => ({
        parser_name: item.parser_name,
        count: parseInt(item.count),
        unprocessed: parseInt(item.unprocessed),
      })),
      total_unprocessed: totalUnprocessed,
    };
  }

  /**
   * Получить ошибки с частично спарсенными данными
   */
  async findWithPartialData(filters: FilterParsingErrorsDto) {
    const result = await this.findAll(filters);
    
    // Фильтруем только те, у которых есть car_data
    result.data = result.data.filter((error) => error.car_data !== null);
    
    return result;
  }
}
