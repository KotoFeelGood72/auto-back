# Auto Backend

## Описание
Небольшой бэкенд на NestJS с CRUD операциями и JWT авторизацией.

## Установка

```bash
npm install
```

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
DB_HOST=77.232.138.181
DB_PORT=5432
DB_USER=root
DB_PASSWORD=P@rs3r_S3cR3t!
DB_NAME=auto_db
PWL_HEADLESS=true
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

## Запуск

```bash
# Разработка
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

## API Endpoints

### Авторизация
- `POST /auth/login` - Вход в систему
- `POST /auth/register` - Регистрация

### Пользователи
- `GET /users` - Получить всех пользователей
- `GET /users/:id` - Получить пользователя по ID
- `PUT /users/:id` - Обновить пользователя
- `DELETE /users/:id` - Удалить пользователя

### Автомобили
- `GET /cars` - Получить все автомобили
- `GET /cars/:id` - Получить автомобиль по ID
- `POST /cars` - Создать автомобиль
- `PUT /cars/:id` - Обновить автомобиль
- `DELETE /cars/:id` - Удалить автомобиль
