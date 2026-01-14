import { Controller, Get, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StatisticsService } from './statistics.service';
import { GetStatisticsDto, StatisticsPeriod } from './dto/get-statistics.dto';

@ApiTags('Статистика')
@Controller('api/statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить всю статистику' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: StatisticsPeriod,
    description: 'Период группировки данных (monthly, quarterly, annually)',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Начальная дата для фильтрации (ISO 8601)',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Конечная дата для фильтрации (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Статистика успешно получена',
    schema: {
      type: 'object',
      properties: {
        overview: {
          type: 'object',
          properties: {
            cars: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                previous: { type: 'number' },
                change: { type: 'number' },
                changePercent: { type: 'number' },
                isPositive: { type: 'boolean' },
              },
            },
            users: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                previous: { type: 'number' },
                change: { type: 'number' },
                changePercent: { type: 'number' },
                isPositive: { type: 'boolean' },
              },
            },
          },
        },
        monthlyCars: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              month: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        statusStats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
        periodStats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              period: { type: 'string' },
              count: { type: 'number' },
              totalRevenue: { type: 'number' },
            },
          },
        },
        targetStats: {
          type: 'object',
          properties: {
            target: { type: 'number' },
            revenue: { type: 'number' },
            count: { type: 'number' },
            achievementPercent: { type: 'number' },
            changePercent: { type: 'number' },
            isPositive: { type: 'boolean' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getAllStatistics(@Query() dto: GetStatisticsDto) {
    return await this.statisticsService.getAllStatistics(dto);
  }

  @Get('overview')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить общую статистику (количество автомобилей и пользователей)' })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Начальная дата для фильтрации',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Конечная дата для фильтрации',
  })
  @ApiResponse({ status: 200, description: 'Общая статистика' })
  async getOverview(@Query() dto: GetStatisticsDto) {
    const dateFrom = dto.date_from ? new Date(dto.date_from) : undefined;
    const dateTo = dto.date_to ? new Date(dto.date_to) : undefined;

    if (dateFrom && !dto.date_from?.includes('T')) {
      dateFrom.setUTCHours(0, 0, 0, 0);
    }
    if (dateTo && !dto.date_to?.includes('T')) {
      dateTo.setUTCHours(23, 59, 59, 999);
    }

    return await this.statisticsService.getOverviewStats(dateFrom, dateTo);
  }

  @Get('monthly-cars')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить месячную статистику по автомобилям' })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Начальная дата для фильтрации',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Конечная дата для фильтрации',
  })
  @ApiResponse({ status: 200, description: 'Месячная статистика по автомобилям' })
  async getMonthlyCars(@Query() dto: GetStatisticsDto) {
    const dateFrom = dto.date_from ? new Date(dto.date_from) : undefined;
    const dateTo = dto.date_to ? new Date(dto.date_to) : undefined;

    if (dateFrom && !dto.date_from?.includes('T')) {
      dateFrom.setUTCHours(0, 0, 0, 0);
    }
    if (dateTo && !dto.date_to?.includes('T')) {
      dateTo.setUTCHours(23, 59, 59, 999);
    }

    return await this.statisticsService.getMonthlyCarStats(dateFrom, dateTo);
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить статистику по статусам автомобилей' })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Начальная дата для фильтрации',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Конечная дата для фильтрации',
  })
  @ApiResponse({ status: 200, description: 'Статистика по статусам' })
  async getStatusStats(@Query() dto: GetStatisticsDto) {
    const dateFrom = dto.date_from ? new Date(dto.date_from) : undefined;
    const dateTo = dto.date_to ? new Date(dto.date_to) : undefined;

    if (dateFrom && !dto.date_from?.includes('T')) {
      dateFrom.setUTCHours(0, 0, 0, 0);
    }
    if (dateTo && !dto.date_to?.includes('T')) {
      dateTo.setUTCHours(23, 59, 59, 999);
    }

    return await this.statisticsService.getStatusStats(dateFrom, dateTo);
  }

  @Get('period')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить статистику по периодам (Monthly, Quarterly, Annually)' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: StatisticsPeriod,
    description: 'Период группировки',
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Начальная дата для фильтрации',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Конечная дата для фильтрации',
  })
  @ApiResponse({ status: 200, description: 'Статистика по периодам' })
  async getPeriodStats(@Query() dto: GetStatisticsDto) {
    const dateFrom = dto.date_from ? new Date(dto.date_from) : undefined;
    const dateTo = dto.date_to ? new Date(dto.date_to) : undefined;

    if (dateFrom && !dto.date_from?.includes('T')) {
      dateFrom.setUTCHours(0, 0, 0, 0);
    }
    if (dateTo && !dto.date_to?.includes('T')) {
      dateTo.setUTCHours(23, 59, 59, 999);
    }

    return await this.statisticsService.getPeriodStats(
      dto.period || StatisticsPeriod.MONTHLY,
      dateFrom,
      dateTo,
    );
  }

  @Get('target')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Получить статистику по целям (процент выполнения)' })
  @ApiQuery({
    name: 'date_from',
    required: false,
    type: String,
    description: 'Начальная дата для фильтрации',
  })
  @ApiQuery({
    name: 'date_to',
    required: false,
    type: String,
    description: 'Конечная дата для фильтрации',
  })
  @ApiResponse({ status: 200, description: 'Статистика по целям' })
  async getTargetStats(@Query() dto: GetStatisticsDto) {
    const dateFrom = dto.date_from ? new Date(dto.date_from) : undefined;
    const dateTo = dto.date_to ? new Date(dto.date_to) : undefined;

    if (dateFrom && !dto.date_from?.includes('T')) {
      dateFrom.setUTCHours(0, 0, 0, 0);
    }
    if (dateTo && !dto.date_to?.includes('T')) {
      dateTo.setUTCHours(23, 59, 59, 999);
    }

    return await this.statisticsService.getTargetStats(undefined, dateFrom, dateTo);
  }
}
