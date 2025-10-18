# Auto Backend - NestJS

## Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка переменных окружения
Скопируйте файл `env.example` в `.env` и настройте переменные:
```bash
cp env.example .env
```

### 3. Запуск приложения
```bash
# Режим разработки
npm run start:dev

# Продакшн
npm run build
npm run start:prod
```

## API Endpoints

### Авторизация
- `POST /auth/login` - Вход в систему
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- `POST /auth/register` - Регистрация
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```

### Пользователи (требует JWT токен)
- `GET /users` - Получить всех пользователей
- `GET /users/:id` - Получить пользователя по ID
- `POST /users` - Создать пользователя
- `PATCH /users/:id` - Обновить пользователя
- `DELETE /users/:id` - Удалить пользователя

### Автомобили (требует JWT токен)
- `GET /cars` - Получить все автомобили
- `GET /cars/:id` - Получить автомобиль по ID
- `POST /cars` - Создать автомобиль
- `PATCH /cars/:id` - Обновить автомобиль
- `DELETE /cars/:id` - Удалить автомобиль

## Использование JWT токена

После успешного логина вы получите токен в ответе:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

Используйте этот токен в заголовке Authorization:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Структура базы данных

### Таблица users
- id (Primary Key)
- email (Unique)
- password (Hashed)
- firstName
- lastName
- isActive
- createdAt
- updatedAt

### Таблица cars
- id (Primary Key)
- brand
- model
- year
- color
- price
- isAvailable
- ownerId (Foreign Key to users.id)
- createdAt
- updatedAt

