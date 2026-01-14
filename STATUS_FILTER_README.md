# Работа с фильтрацией по статусу автомобилей

## Описание

API поддерживает фильтрацию объявлений о продаже автомобилей по статусу. Статус позволяет определить актуальность объявления и его состояние.

## Доступные статусы

- **Продано** - автомобиль уже продан
- **Активно** - объявление активно и автомобиль доступен для покупки
- **Долго продается** - объявление размещено давно, но автомобиль еще не продан
- **Появилось недавно** - новое объявление, недавно добавленное в систему

## Использование фильтра по статусу

### GET запрос с фильтром по статусу

Для получения списка автомобилей с определенным статусом используйте query-параметр `status`:

```bash
GET /car-listings?status=Активно
```

### Примеры запросов

#### Получить все активные объявления

```bash
curl -X GET "http://localhost:3000/car-listings?status=Активно"
```

#### Получить проданные автомобили

```bash
curl -X GET "http://localhost:3000/car-listings?status=Продано"
```

#### Получить новые объявления

```bash
curl -X GET "http://localhost:3000/car-listings?status=Появилось недавно"
```

#### Комбинирование с другими фильтрами

Фильтр по статусу можно комбинировать с другими фильтрами:

```bash
# Активные автомобили Toyota с ценой до 2000000
curl -X GET "http://localhost:3000/car-listings?status=Активно&make=Toyota&maxPrice=2000000"

# Новые объявления в Москве
curl -X GET "http://localhost:3000/car-listings?status=Появилось недавно&location=Москва"

# Долго продающиеся автомобили с пагинацией
curl -X GET "http://localhost:3000/car-listings?status=Долго продается&page=1&limit=20"
```

## Установка статуса при создании объявления

### POST запрос для создания объявления со статусом

```bash
POST /car-listings
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Пример тела запроса:**

```json
{
  "short_url": "https://example.com/car/123",
  "title": "Toyota Camry 2020",
  "make": "Toyota",
  "model": "Camry",
  "year": "2020",
  "price_raw": 1500000,
  "status": "Активно"
}
```

**Пример с curl:**

```bash
curl -X POST "http://localhost:3000/car-listings" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "short_url": "https://example.com/car/123",
    "title": "Toyota Camry 2020",
    "make": "Toyota",
    "model": "Camry",
    "year": "2020",
    "price_raw": 1500000,
    "status": "Активно"
  }'
```

## Обновление статуса объявления

### PATCH запрос для обновления статуса

```bash
PATCH /car-listings/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

**Пример тела запроса:**

```json
{
  "status": "Продано"
}
```

**Пример с curl:**

```bash
curl -X PATCH "http://localhost:3000/car-listings/123" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Продано"
  }'
```

## Примеры ответов

### Успешный ответ с фильтрацией

```json
{
  "data": [
    {
      "id": 1,
      "title": "Toyota Camry 2020",
      "make": "Toyota",
      "model": "Camry",
      "year": "2020",
      "price_raw": 1500000,
      "status": "Активно",
      "images": ["https://example.com/image1.jpg"],
      "main_image": "https://example.com/image1.jpg"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "availableStatuses": [
    "Продано",
    "Активно",
    "Долго продается",
    "Появилось недавно"
  ]
}
```

**Важно:** В каждом ответе списка автомобилей (`GET /car-listings`) теперь автоматически возвращается массив `availableStatuses` со всеми доступными статусами, которые можно использовать для фильтрации.

## Важные замечания

1. **Регистр важен**: Статус должен точно соответствовать одному из доступных значений:
   - `Продано`
   - `Активно`
   - `Долго продается`
   - `Появилось недавно`

2. **Опциональный параметр**: Поле `status` является опциональным. Если статус не указан, фильтрация по нему не применяется.

3. **Авторизация**: Для создания и обновления объявлений требуется JWT токен авторизации.

4. **База данных**: Перед использованием убедитесь, что выполнена миграция `add_status_column.sql` для добавления колонки `status` в таблицу `car_listings`.

## Применение миграции

Перед использованием фильтра по статусу выполните SQL миграцию:

```bash
psql -h <host> -U <user> -d <database> -f add_status_column.sql
```

Или через любой другой способ выполнения SQL скриптов в вашей базе данных.
