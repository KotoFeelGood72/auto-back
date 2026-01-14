import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../export/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ParsingErrorsService } from './parsing-errors.service';
import { FilterParsingErrorsDto, ErrorType } from './dto/filter-parsing-errors.dto';

@ApiTags('Ошибки парсинга')
@Controller('api/parsing-errors')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ParsingErrorsController {
  constructor(private readonly parsingErrorsService: ParsingErrorsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Получить список ошибок парсинга с фильтрацией и пагинацией' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество записей на странице', example: 20 })
  @ApiQuery({ name: 'parser_name', required: false, type: String, description: 'Имя парсера', example: 'dubicars' })
  @ApiQuery({ name: 'error_type', required: false, enum: ErrorType, description: 'Тип ошибки' })
  @ApiQuery({ name: 'is_processed', required: false, type: Boolean, description: 'Фильтр по статусу обработки', example: false })
  @ApiQuery({ name: 'date_from', required: false, type: String, description: 'Начальная дата (ISO 8601)' })
  @ApiQuery({ name: 'date_to', required: false, type: String, description: 'Конечная дата (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Список ошибок парсинга' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async findAll(@Query() filters: FilterParsingErrorsDto) {
    return await this.parsingErrorsService.findAll(filters);
  }

  @Get('stats')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Получить статистику ошибок парсинга' })
  @ApiResponse({ status: 200, description: 'Статистика ошибок' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async getStats() {
    return await this.parsingErrorsService.getStats();
  }

  @Get('partial-data')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Получить ошибки с частично спарсенными данными' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Номер страницы', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Количество записей на странице', example: 20 })
  @ApiQuery({ name: 'parser_name', required: false, type: String, description: 'Имя парсера' })
  @ApiQuery({ name: 'error_type', required: false, enum: ErrorType, description: 'Тип ошибки' })
  @ApiResponse({ status: 200, description: 'Список ошибок с частичными данными' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async findWithPartialData(@Query() filters: FilterParsingErrorsDto) {
    return await this.parsingErrorsService.findWithPartialData(filters);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Получить ошибку парсинга по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID ошибки' })
  @ApiResponse({ status: 200, description: 'Ошибка парсинга найдена' })
  @ApiResponse({ status: 404, description: 'Ошибка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.parsingErrorsService.findOne(id);
  }

  @Post(':id/process')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Отметить ошибку как обработанную' })
  @ApiParam({ name: 'id', type: Number, description: 'ID ошибки' })
  @ApiResponse({ status: 200, description: 'Ошибка отмечена как обработанная' })
  @ApiResponse({ status: 404, description: 'Ошибка не найдена' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async markAsProcessed(@Param('id', ParseIntPipe) id: number) {
    const error = await this.parsingErrorsService.markAsProcessed(id);
    return {
      success: true,
      message: 'Ошибка отмечена как обработанная',
      error_id: error.id,
      error: error,
    };
  }

  @Post('process-multiple')
  @HttpCode(HttpStatus.OK)
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Отметить несколько ошибок как обработанные' })
  @ApiResponse({ status: 200, description: 'Ошибки отмечены как обработанные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async markMultipleAsProcessed(@Body() body: { ids: number[] } | { ids: string }, @Query('ids') queryIds?: string) {
    let idArray: number[] = [];
    
    // Поддержка как body, так и query параметров
    if (body && 'ids' in body) {
      if (Array.isArray(body.ids)) {
        idArray = body.ids;
      } else if (typeof body.ids === 'string') {
        idArray = body.ids.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
      }
    } else if (queryIds) {
      idArray = queryIds.split(',').map((id) => parseInt(id.trim())).filter((id) => !isNaN(id));
    }

    if (idArray.length === 0) {
      return {
        success: false,
        message: 'Не указаны ID ошибок',
        processed_count: 0,
        failed_ids: [],
      };
    }

    const result = await this.parsingErrorsService.markMultipleAsProcessed(idArray);
    return {
      success: true,
      message: `Обработано ${result.success} из ${idArray.length} ошибок`,
      processed_count: result.success,
      failed_ids: result.errors,
    };
  }
}
