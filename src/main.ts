import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: false,
  });
  
  // Настройка trust proxy для правильного получения IP адреса
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', true);
  
  // Увеличение лимита размера тела запроса (до 50MB)
  // Для ответов лимит не устанавливается явно, так как мы отправляем файлы через res.send()
  expressApp.use((req, res, next) => {
    req.setTimeout(300000); // 5 минут таймаут для запросов
    res.setTimeout(300000); // 5 минут таймаут для ответов
    next();
  });
  
  // Глобальная валидация
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // CORS
  app.enableCors();
  
  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Auto Backend API')
    .setDescription('API для управления пользователями и объявлениями о продаже автомобилей')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
  console.log(`Swagger documentation: http://0.0.0.0:${port}/api`);
}
bootstrap();
