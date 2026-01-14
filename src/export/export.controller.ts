import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Res,
  Req,
  HttpStatus,
  UseGuards,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ExportService } from './export.service';
import { ExportCarsDto } from './dto/export-cars.dto';
import { ExportUsersDto } from './dto/export-users.dto';
import { PreviewExportDto } from './dto/preview-export.dto';
import { ExportFormat } from './dto/export-cars.dto';

@ApiTags('Экспорт данных')
@Controller('api/export')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('cars')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Экспорт списка автомобилей' })
  @ApiResponse({ status: 200, description: 'Файл экспорта успешно создан' })
  @ApiResponse({ status: 400, description: 'Неверные параметры запроса' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 413, description: 'Превышен лимит записей' })
  @ApiResponse({ status: 504, description: 'Превышено время выполнения' })
  async exportCars(@Body() dto: ExportCarsDto, @Res() res: Response, @Req() req: Request) {
    try {
      const user = req.user as any;
      const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
      const result = await this.exportService.exportCars(dto, user.userId, userName, req);

      const filename = this.generateFilename('cars', dto.format);
      const contentType = this.getContentType(dto.format);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Для всех форматов отправляем как файл для скачивания
      // Это предотвращает ошибку 413 Payload Too Large
      return res.send(result);
    } catch (error) {
      throw error;
    }
  }

  @Post('users')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Экспорт списка пользователей' })
  @ApiResponse({ status: 200, description: 'Файл экспорта успешно создан' })
  @ApiResponse({ status: 400, description: 'Неверные параметры запроса' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 413, description: 'Превышен лимит записей' })
  @ApiResponse({ status: 504, description: 'Превышено время выполнения' })
  async exportUsers(@Body() dto: ExportUsersDto, @Res() res: Response, @Req() req: Request) {
    try {
      const user = req.user as any;
      const userName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email;
      const result = await this.exportService.exportUsers(dto, user.userId, userName, req);

      const filename = this.generateFilename('users', dto.format);
      const contentType = this.getContentType(dto.format);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      // Для всех форматов отправляем как файл для скачивания
      // Это предотвращает ошибку 413 Payload Too Large
      return res.send(result);
    } catch (error) {
      throw error;
    }
  }

  @Get('preview')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Предпросмотр количества записей для экспорта' })
  @ApiQuery({ name: 'type', enum: ['cars', 'users'], description: 'Тип данных' })
  @ApiQuery({ name: 'make', required: false, description: 'Марка автомобиля' })
  @ApiQuery({ name: 'model', required: false, description: 'Модель автомобиля' })
  @ApiQuery({ name: 'year', required: false, description: 'Год выпуска' })
  @ApiQuery({ name: 'body_type', required: false, description: 'Тип кузова' })
  @ApiQuery({ name: 'fuel_type', required: false, description: 'Тип топлива' })
  @ApiQuery({ name: 'location', required: false, description: 'Локация' })
  @ApiQuery({ name: 'seller_type', required: false, description: 'Тип продавца' })
  @ApiQuery({ name: 'price_min', required: false, type: Number, description: 'Минимальная цена' })
  @ApiQuery({ name: 'price_max', required: false, type: Number, description: 'Максимальная цена' })
  @ApiQuery({ name: 'kilometers_min', required: false, type: Number, description: 'Минимальный пробег' })
  @ApiQuery({ name: 'kilometers_max', required: false, type: Number, description: 'Максимальный пробег' })
  @ApiQuery({ name: 'role', required: false, description: 'Роль пользователя' })
  @ApiQuery({ name: 'email', required: false, description: 'Email пользователя' })
  @ApiResponse({ status: 200, description: 'Количество записей' })
  @ApiResponse({ status: 400, description: 'Неверные параметры запроса' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async preview(@Query() query: PreviewExportDto) {
    if (!query.type) {
      throw new BadRequestException('Параметр type обязателен');
    }

    let filters: any = {};

    if (query.type === 'cars') {
      filters = {
        make: query.make,
        model: query.model,
        year: query.year,
        body_type: query.body_type,
        fuel_type: query.fuel_type,
        location: query.location,
        seller_type: query.seller_type,
        price_min: query.price_min,
        price_max: query.price_max,
        kilometers_min: query.kilometers_min,
        kilometers_max: query.kilometers_max,
      };
    } else {
      filters = {
        role: query.role,
        email: query.email,
      };
    }

    // Удаляем undefined значения
    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined) {
        delete filters[key];
      }
    });

    const count = await this.exportService.previewCount(query.type, filters);

    return {
      count,
      type: query.type,
      filters_applied: filters,
    };
  }

  private generateFilename(type: string, format: ExportFormat): string {
    const date = new Date().toISOString().split('T')[0];
    const extension = format === ExportFormat.EXCEL ? 'xlsx' : format;
    return `${type}_export_${date}.${extension}`;
  }

  private getContentType(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.CSV:
        return 'text/csv; charset=utf-8';
      case ExportFormat.EXCEL:
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case ExportFormat.JSON:
        return 'application/json; charset=utf-8';
      default:
        return 'application/octet-stream';
    }
  }
}

