import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarListing } from '../car-listings/entities/car-listing.entity';
import { User } from '../users/entities/user.entity';
import { GetStatisticsDto, StatisticsPeriod } from './dto/get-statistics.dto';

const AVAILABLE_STATUSES = ['Продано', 'Активно', 'Долго продается', 'Появилось недавно'];

@Injectable()
export class StatisticsService {
  private readonly logger = new Logger(StatisticsService.name);

  constructor(
    @InjectRepository(CarListing)
    private carListingsRepository: Repository<CarListing>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Получить общую статистику (количество автомобилей и пользователей с процентами изменений)
   */
  async getOverviewStats(dateFrom?: Date, dateTo?: Date) {
    const queryBuilderCars = this.carListingsRepository.createQueryBuilder('car');
    const queryBuilderUsers = this.usersRepository.createQueryBuilder('user');

    // Применяем фильтры по датам если указаны
    if (dateFrom) {
      queryBuilderCars.andWhere('car.created_at >= :dateFrom', { dateFrom });
      queryBuilderUsers.andWhere('user.createdAt >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilderCars.andWhere('car.created_at <= :dateTo', { dateTo });
      queryBuilderUsers.andWhere('user.createdAt <= :dateTo', { dateTo });
    }

    // Текущее количество
    const totalCars = await queryBuilderCars.getCount();
    const totalUsers = await queryBuilderUsers.getCount();

    // Количество за предыдущий период для сравнения
    const previousDateFrom = dateFrom
      ? new Date(new Date(dateFrom).getTime() - (dateTo ? dateTo.getTime() - dateFrom.getTime() : 0))
      : null;
    const previousDateTo = dateFrom ? dateFrom : null;

    let previousCars = 0;
    let previousUsers = 0;

    if (previousDateFrom && previousDateTo) {
      const prevQueryBuilderCars = this.carListingsRepository.createQueryBuilder('car');
      const prevQueryBuilderUsers = this.usersRepository.createQueryBuilder('user');

      prevQueryBuilderCars.andWhere('car.created_at >= :dateFrom', { dateFrom: previousDateFrom });
      prevQueryBuilderCars.andWhere('car.created_at < :dateTo', { dateTo: previousDateTo });

      prevQueryBuilderUsers.andWhere('user.createdAt >= :dateFrom', { dateFrom: previousDateFrom });
      prevQueryBuilderUsers.andWhere('user.createdAt < :dateTo', { dateTo: previousDateTo });

      previousCars = await prevQueryBuilderCars.getCount();
      previousUsers = await prevQueryBuilderUsers.getCount();
    } else {
      // Если не указан период, сравниваем с предыдущим месяцем
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

      const prevQueryBuilderCars = this.carListingsRepository.createQueryBuilder('car');
      const prevQueryBuilderUsers = this.usersRepository.createQueryBuilder('user');

      prevQueryBuilderCars.andWhere('car.created_at >= :dateFrom', { dateFrom: previousMonthStart });
      prevQueryBuilderCars.andWhere('car.created_at <= :dateTo', { dateTo: previousMonthEnd });

      prevQueryBuilderUsers.andWhere('user.createdAt >= :dateFrom', { dateFrom: previousMonthStart });
      prevQueryBuilderUsers.andWhere('user.createdAt <= :dateTo', { dateTo: previousMonthEnd });

      previousCars = await prevQueryBuilderCars.getCount();
      previousUsers = await prevQueryBuilderUsers.getCount();
    }

    // Вычисляем проценты изменений
    const carsChangePercent = previousCars > 0
      ? ((totalCars - previousCars) / previousCars) * 100
      : totalCars > 0 ? 100 : 0;

    const usersChangePercent = previousUsers > 0
      ? ((totalUsers - previousUsers) / previousUsers) * 100
      : totalUsers > 0 ? 100 : 0;

    return {
      cars: {
        total: totalCars,
        previous: previousCars,
        change: totalCars - previousCars,
        changePercent: parseFloat(carsChangePercent.toFixed(2)),
        isPositive: totalCars >= previousCars,
      },
      users: {
        total: totalUsers,
        previous: previousUsers,
        change: totalUsers - previousUsers,
        changePercent: parseFloat(usersChangePercent.toFixed(2)),
        isPositive: totalUsers >= previousUsers,
      },
    };
  }

  /**
   * Получить месячную статистику по автомобилям
   */
  async getMonthlyCarStats(dateFrom?: Date, dateTo?: Date) {
    const queryBuilder = this.carListingsRepository
      .createQueryBuilder('car')
      .select("DATE_TRUNC('month', car.created_at)", 'month')
      .addSelect('COUNT(*)', 'count')
      .groupBy("DATE_TRUNC('month', car.created_at)")
      .orderBy("DATE_TRUNC('month', car.created_at)", 'ASC');

    if (dateFrom) {
      queryBuilder.andWhere('car.created_at >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('car.created_at <= :dateTo', { dateTo });
    }

    const results = await queryBuilder.getRawMany();

    // Форматируем результаты
    return results.map((item: any) => {
      const monthDate = new Date(item.month);
      const monthString = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
      return {
        month: monthString,
        count: parseInt(item.count),
      };
    });
  }

  /**
   * Получить статистику по статусам автомобилей
   */
  async getStatusStats(dateFrom?: Date, dateTo?: Date) {
    const queryBuilder = this.carListingsRepository
      .createQueryBuilder('car')
      .select('car.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('car.status IS NOT NULL')
      .groupBy('car.status');

    if (dateFrom) {
      queryBuilder.andWhere('car.created_at >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('car.created_at <= :dateTo', { dateTo });
    }

    const results = await queryBuilder.getRawMany();

    // Форматируем результаты и добавляем статусы с нулевым количеством
    const statusMap = new Map<string, number>();
    
    // Инициализируем все доступные статусы с нулем
    AVAILABLE_STATUSES.forEach(status => {
      statusMap.set(status, 0);
    });

    // Заполняем реальными данными
    results.forEach((item: any) => {
      statusMap.set(item.status, parseInt(item.count));
    });

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  }

  /**
   * Получить статистику по периодам (Monthly, Quarterly, Annually)
   */
  async getPeriodStats(period: StatisticsPeriod, dateFrom?: Date, dateTo?: Date) {
    let dateFormat: string;
    let periodLabel: string;

    switch (period) {
      case StatisticsPeriod.MONTHLY:
        dateFormat = "DATE_TRUNC('month', car.created_at)";
        periodLabel = 'month';
        break;
      case StatisticsPeriod.QUARTERLY:
        dateFormat = "DATE_TRUNC('quarter', car.created_at)";
        periodLabel = 'quarter';
        break;
      case StatisticsPeriod.ANNUALLY:
        dateFormat = "DATE_TRUNC('year', car.created_at)";
        periodLabel = 'year';
        break;
      default:
        dateFormat = "DATE_TRUNC('month', car.created_at)";
        periodLabel = 'month';
    }

    const queryBuilder = this.carListingsRepository
      .createQueryBuilder('car')
      .select(dateFormat, periodLabel)
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(car.price_raw)', 'totalRevenue')
      .groupBy(dateFormat)
      .orderBy(dateFormat, 'ASC');

    if (dateFrom) {
      queryBuilder.andWhere('car.created_at >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('car.created_at <= :dateTo', { dateTo });
    }

    const results = await queryBuilder.getRawMany();

    return results.map((item: any) => {
      let periodString: string;
      const periodDate = new Date(item[periodLabel]);
      
      if (period === StatisticsPeriod.MONTHLY) {
        periodString = `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === StatisticsPeriod.QUARTERLY) {
        const quarter = Math.floor(periodDate.getMonth() / 3) + 1;
        periodString = `${periodDate.getFullYear()}-Q${quarter}`;
      } else {
        periodString = `${periodDate.getFullYear()}`;
      }

      return {
        period: periodString,
        count: parseInt(item.count),
        totalRevenue: parseFloat(item.totalRevenue || 0),
      };
    });
  }

  /**
   * Получить целевую статистику (процент выполнения цели)
   */
  async getTargetStats(targetAmount?: number, dateFrom?: Date, dateTo?: Date) {
    const queryBuilder = this.carListingsRepository.createQueryBuilder('car');

    if (dateFrom) {
      queryBuilder.andWhere('car.created_at >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      queryBuilder.andWhere('car.created_at <= :dateTo', { dateTo });
    }

    const result = await queryBuilder
      .select('SUM(car.price_raw)', 'totalRevenue')
      .addSelect('COUNT(*)', 'totalCount')
      .getRawOne();

    const totalRevenue = parseFloat(result.totalRevenue || 0);
    const totalCount = parseInt(result.totalCount || 0);

    // Если цель не указана, используем среднее значение за последние месяцы
    let target = targetAmount;
    if (!target) {
      const monthlyAvg = await this.getAverageMonthlyRevenue();
      target = monthlyAvg * 12; // Годовая цель на основе среднего месячного
    }

    const achievementPercent = target > 0 ? (totalRevenue / target) * 100 : 0;

    // Получаем данные за предыдущий период для сравнения
    const previousPeriod = await this.getPreviousPeriodStats(dateFrom, dateTo);
    const changePercent = previousPeriod.revenue > 0
      ? ((totalRevenue - previousPeriod.revenue) / previousPeriod.revenue) * 100
      : totalRevenue > 0 ? 100 : 0;

    return {
      target: target,
      revenue: totalRevenue,
      count: totalCount,
      achievementPercent: parseFloat(achievementPercent.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      isPositive: totalRevenue >= previousPeriod.revenue,
    };
  }

  /**
   * Получить средний месячный доход
   */
  private async getAverageMonthlyRevenue(): Promise<number> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await this.carListingsRepository
      .createQueryBuilder('car')
      .select("DATE_TRUNC('month', car.created_at)", 'month')
      .addSelect('SUM(car.price_raw)', 'monthly_revenue')
      .where('car.created_at >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy("DATE_TRUNC('month', car.created_at)")
      .getRawMany();

    if (monthlyStats.length === 0) {
      return 0;
    }

    const totalRevenue = monthlyStats.reduce((sum, item: any) => {
      return sum + parseFloat(item.monthly_revenue || 0);
    }, 0);

    return totalRevenue / monthlyStats.length;
  }

  /**
   * Получить статистику за предыдущий период
   */
  private async getPreviousPeriodStats(dateFrom?: Date, dateTo?: Date) {
    let prevDateFrom: Date | undefined;
    let prevDateTo: Date | undefined;

    if (dateFrom && dateTo) {
      const periodLength = dateTo.getTime() - dateFrom.getTime();
      prevDateTo = new Date(dateFrom.getTime() - 1);
      prevDateFrom = new Date(prevDateTo.getTime() - periodLength);
    } else {
      // По умолчанию сравниваем с предыдущим месяцем
      const now = new Date();
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      prevDateFrom = previousMonthStart;
      prevDateTo = previousMonthEnd;
    }

    const result = await this.carListingsRepository
      .createQueryBuilder('car')
      .select('SUM(car.price_raw)', 'revenue')
      .where('car.created_at >= :dateFrom', { dateFrom: prevDateFrom })
      .andWhere('car.created_at <= :dateTo', { dateTo: prevDateTo })
      .getRawOne();

    return {
      revenue: parseFloat(result?.revenue || 0),
    };
  }

  /**
   * Получить всю статистику
   */
  async getAllStatistics(dto: GetStatisticsDto) {
    const dateFrom = dto.date_from ? new Date(dto.date_from) : undefined;
    const dateTo = dto.date_to ? new Date(dto.date_to) : undefined;

    // Если указана только дата без времени, устанавливаем время
    if (dateFrom && !dto.date_from?.includes('T')) {
      dateFrom.setUTCHours(0, 0, 0, 0);
    }
    if (dateTo && !dto.date_to?.includes('T')) {
      dateTo.setUTCHours(23, 59, 59, 999);
    }

    const [overview, monthlyCars, statusStats, periodStats, targetStats] = await Promise.all([
      this.getOverviewStats(dateFrom, dateTo),
      this.getMonthlyCarStats(dateFrom, dateTo),
      this.getStatusStats(dateFrom, dateTo),
      this.getPeriodStats(dto.period || StatisticsPeriod.MONTHLY, dateFrom, dateTo),
      this.getTargetStats(undefined, dateFrom, dateTo),
    ]);

    return {
      overview,
      monthlyCars,
      statusStats,
      periodStats,
      targetStats,
    };
  }
}
