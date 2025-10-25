# Auto Backend - Docker Setup

## Запуск приложения в Docker

### Предварительные требования
- Docker
- Docker Compose

### Быстрый старт

1. **Сборка и запуск всех сервисов:**
```bash
docker-compose up --build
```

2. **Запуск в фоновом режиме:**
```bash
docker-compose up -d --build
```

3. **Остановка сервисов:**
```bash
docker-compose down
```

4. **Остановка с удалением volumes (удалит данные БД):**
```bash
docker-compose down -v
```

### Доступ к приложению

- **API:** http://localhost:3002
- **Swagger документация:** http://localhost:3002/api
- **База данных:** localhost:5432

### Структура сервисов

- **app** - NestJS приложение (порт 3002)
- **postgres** - PostgreSQL база данных (порт 5432)

### Переменные окружения

Все переменные окружения настроены в `docker-compose.yml`:

- `DB_HOST=postgres` - хост базы данных (имя сервиса)
- `DB_PORT=5432` - порт базы данных
- `DB_USER=root` - пользователь БД
- `DB_PASSWORD=P@rs3r_S3cR3t!` - пароль БД
- `DB_NAME=auto_db` - имя базы данных
- `JWT_SECRET` - секретный ключ для JWT
- `PORT=3002` - порт приложения

### Полезные команды

**Просмотр логов:**
```bash
docker-compose logs -f app
docker-compose logs -f postgres
```

**Выполнение команд в контейнере:**
```bash
docker-compose exec app sh
docker-compose exec postgres psql -U root -d auto_db
```

**Пересборка только приложения:**
```bash
docker-compose build app
docker-compose up -d app
```

### Особенности

1. **Автоматическая инициализация БД:** При первом запуске выполняется скрипт `add_images_columns.sql` для добавления полей изображений.

2. **Персистентность данных:** Данные PostgreSQL сохраняются в Docker volume `postgres_data`.

3. **Сеть:** Все сервисы работают в изолированной сети `auto-back-network`.

4. **Автоперезапуск:** Приложение автоматически перезапускается при сбоях (`restart: unless-stopped`).
