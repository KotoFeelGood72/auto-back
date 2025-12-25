import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, ILike } from 'typeorm';
import { History } from './entities/history.entity';
import { CreateHistoryDto } from './dto/create-history.dto';
import { FilterHistoryDto } from './dto/filter-history.dto';
import { StatsHistoryDto } from './dto/stats-history.dto';
import { Request } from 'express';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    @InjectRepository(History)
    private historyRepository: Repository<History>,
  ) {}

  async create(
    dto: CreateHistoryDto,
    userId: number,
    userName: string,
    request?: Request,
  ): Promise<History> {
    const history = this.historyRepository.create({
      entityType: dto.entity_type,
      entityId: dto.entity_id,
      action: dto.action,
      changes: dto.changes || null,
      userId,
      userName,
      description: dto.description || null,
      ipAddress: request?.ip || request?.socket?.remoteAddress || null,
      userAgent: request?.headers['user-agent'] || null,
    });

    return await this.historyRepository.save(history);
  }

  async findAll(filters: FilterHistoryDto): Promise<{ data: History[]; pagination: any }> {
    const queryBuilder = this.historyRepository.createQueryBuilder('history');

    // Применяем фильтры
    if (filters.entity_type) {
      queryBuilder.andWhere('history.entityType = :entityType', { entityType: filters.entity_type });
    }

    if (filters.entity_id !== undefined) {
      queryBuilder.andWhere('history.entityId = :entityId', { entityId: filters.entity_id });
    }

    if (filters.action) {
      queryBuilder.andWhere('history.action = :action', { action: filters.action });
    }

    if (filters.user_id !== undefined) {
      queryBuilder.andWhere('history.userId = :userId', { userId: filters.user_id });
    }

    if (filters.date_from) {
      const dateFrom = new Date(filters.date_from);
      queryBuilder.andWhere('history.createdAt >= :dateFrom', { dateFrom });
    }

    if (filters.date_to) {
      const dateTo = new Date(filters.date_to);
      // Добавляем время конца дня
      dateTo.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('history.createdAt <= :dateTo', { dateTo });
    }

    if (filters.date_from && filters.date_to) {
      const dateFrom = new Date(filters.date_from);
      const dateTo = new Date(filters.date_to);
      dateTo.setHours(23, 59, 59, 999);
      
      if (dateFrom > dateTo) {
        throw new BadRequestException('date_from не может быть позже date_to');
      }
    }

    if (filters.search) {
      queryBuilder.andWhere('history.description ILIKE :search', { search: `%${filters.search}%` });
    }

    // Получаем общее количество записей
    const total = await queryBuilder.getCount();

    // Применяем пагинацию
    const limit = filters.limit || 50;
    const offset = filters.offset !== undefined ? filters.offset : (filters.page ? (filters.page - 1) * limit : 0);
    
    queryBuilder.skip(offset).take(limit);

    // Применяем сортировку
    const sortBy = filters.sort_by || 'created_at';
    const sortOrder = filters.sort_order || 'desc';
    
    // Валидация поля сортировки
    const allowedSortFields = ['created_at', 'user_id', 'entity_type', 'action'];
    if (!allowedSortFields.includes(sortBy)) {
      throw new BadRequestException(`Недопустимое поле для сортировки: ${sortBy}`);
    }

    const sortField = sortBy === 'created_at' ? 'history.createdAt' : `history.${sortBy}`;
    queryBuilder.orderBy(sortField, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    const data = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);
    const currentPage = filters.page || Math.floor(offset / limit) + 1;

    return {
      data,
      pagination: {
        total,
        limit,
        offset,
        page: currentPage,
        total_pages: totalPages,
      },
    };
  }

  async findOne(id: number): Promise<History> {
    const history = await this.historyRepository.findOne({ where: { id } });
    
    if (!history) {
      throw new NotFoundException(`Запись истории с ID ${id} не найдена`);
    }
    
    return history;
  }

  async findByEntity(entityType: string, entityId: number, filters?: { limit?: number; offset?: number; action?: string }): Promise<{ data: History[]; pagination: any }> {
    const queryBuilder = this.historyRepository
      .createQueryBuilder('history')
      .where('history.entityType = :entityType', { entityType })
      .andWhere('history.entityId = :entityId', { entityId })
      .orderBy('history.createdAt', 'DESC');

    if (filters?.action) {
      queryBuilder.andWhere('history.action = :action', { action: filters.action });
    }

    const total = await queryBuilder.getCount();

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    
    queryBuilder.skip(offset).take(limit);

    const data = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      data,
      pagination: {
        total,
        limit,
        offset,
        page: currentPage,
        total_pages: totalPages,
      },
    };
  }

  async getStats(filters: StatsHistoryDto): Promise<any> {
    const queryBuilder = this.historyRepository.createQueryBuilder('history');

    // Применяем фильтры
    if (filters.entity_type) {
      queryBuilder.andWhere('history.entityType = :entityType', { entityType: filters.entity_type });
    }

    if (filters.user_id !== undefined) {
      queryBuilder.andWhere('history.userId = :userId', { userId: filters.user_id });
    }

    if (filters.date_from) {
      const dateFrom = new Date(filters.date_from);
      queryBuilder.andWhere('history.createdAt >= :dateFrom', { dateFrom });
    }

    if (filters.date_to) {
      const dateTo = new Date(filters.date_to);
      dateTo.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('history.createdAt <= :dateTo', { dateTo });
    }

    // Общее количество действий
    const totalActions = await queryBuilder.getCount();

    // Статистика по типам действий
    const byActionQuery = queryBuilder.clone();
    const byAction = await byActionQuery
      .select('history.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('history.action')
      .getRawMany();

    const byActionMap: Record<string, number> = {};
    byAction.forEach((item: any) => {
      byActionMap[item.action] = parseInt(item.count);
    });

    // Статистика по типам сущностей
    const byEntityTypeQuery = queryBuilder.clone();
    const byEntityType = await byEntityTypeQuery
      .select('history.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('history.entityType')
      .getRawMany();

    const byEntityTypeMap: Record<string, number> = {};
    byEntityType.forEach((item: any) => {
      byEntityTypeMap[item.entityType] = parseInt(item.count);
    });

    // Статистика по пользователям (топ 10)
    const byUserQuery = queryBuilder.clone();
    const byUser = await byUserQuery
      .select('history.userId', 'user_id')
      .addSelect('history.userName', 'user_name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('history.userId')
      .addGroupBy('history.userName')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Статистика по датам (последние 30 дней)
    const byDateQuery = queryBuilder.clone();
    const byDate = await byDateQuery
      .select("DATE(history.createdAt)", 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy("DATE(history.createdAt)")
      .orderBy('date', 'DESC')
      .limit(30)
      .getRawMany();

    return {
      total_actions: totalActions,
      by_action: byActionMap,
      by_entity_type: byEntityTypeMap,
      by_user: byUser.map((item: any) => ({
        user_id: item.user_id,
        user_name: item.user_name,
        count: parseInt(item.count),
      })),
      by_date: byDate.map((item: any) => ({
        date: item.date,
        count: parseInt(item.count),
      })),
      period: {
        from: filters.date_from || null,
        to: filters.date_to || null,
      },
    };
  }

  async remove(id: number): Promise<void> {
    const history = await this.findOne(id);
    await this.historyRepository.remove(history);
  }

  // Вспомогательный метод для сравнения объектов и определения изменений
  compareObjects(oldObj: any, newObj: any): Record<string, { old?: any; new?: any }> | null {
    const changes: Record<string, { old?: any; new?: any }> = {};
    let hasChanges = false;

    // Получаем все уникальные ключи из обоих объектов
    const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);

    for (const key of allKeys) {
      const oldValue = oldObj?.[key];
      const newValue = newObj?.[key];

      // Игнорируем служебные поля
      if (key === 'password' || key === 'updatedAt' || key === 'createdAt') {
        continue;
      }

      // Сравниваем значения
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = {
          old: oldValue,
          new: newValue,
        };
        hasChanges = true;
      }
    }

    return hasChanges ? changes : null;
  }
}

