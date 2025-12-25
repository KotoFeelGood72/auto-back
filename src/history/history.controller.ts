import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../export/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { FilterHistoryDto } from './dto/filter-history.dto';
import { StatsHistoryDto } from './dto/stats-history.dto';

@ApiTags('История изменений')
@Controller('api/history')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Создать запись в истории изменений' })
  @ApiResponse({ status: 201, description: 'Запись истории успешно создана' })
  @ApiResponse({ status: 400, description: 'Неверные параметры запроса' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async create(@Body() dto: CreateHistoryDto, @Req() req: Request) {
    const user = req.user as any;
    const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    
    return await this.historyService.create(dto, user.userId, userName, req);
  }

  @Get()
  @ApiOperation({ summary: 'Получить список записей истории с фильтрацией' })
  @ApiResponse({ status: 200, description: 'Список записей истории' })
  @ApiResponse({ status: 400, description: 'Неверные параметры запроса' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findAll(@Query() filters: FilterHistoryDto) {
    return await this.historyService.findAll(filters);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Получить статистику по истории изменений' })
  @ApiResponse({ status: 200, description: 'Статистика истории' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async getStats(@Query() filters: StatsHistoryDto) {
    return await this.historyService.getStats(filters);
  }

  @Get('entity/:type/:id')
  @ApiOperation({ summary: 'Получить историю изменений конкретной сущности' })
  @ApiParam({ name: 'type', description: 'Тип сущности (car, user, favorite, export)' })
  @ApiParam({ name: 'id', description: 'ID сущности' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiResponse({ status: 200, description: 'История изменений сущности' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findByEntity(
    @Param('type') type: string,
    @Param('id', ParseIntPipe) id: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('action') action?: string,
  ) {
    return await this.historyService.findByEntity(type, id, { limit, offset, action });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить конкретную запись истории' })
  @ApiParam({ name: 'id', description: 'ID записи истории' })
  @ApiResponse({ status: 200, description: 'Запись истории' })
  @ApiResponse({ status: 404, description: 'Запись истории не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.historyService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Удалить запись истории (только для администраторов)' })
  @ApiParam({ name: 'id', description: 'ID записи истории' })
  @ApiResponse({ status: 200, description: 'Запись истории успешно удалена' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Запись истории не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.historyService.remove(id);
    return {
      message: 'Запись истории успешно удалена',
      id,
    };
  }
}

