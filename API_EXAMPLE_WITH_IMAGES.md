# Пример API ответов с изображениями автомобилей

## GET /car-listings - Получение списка объявлений

```json
{
  "data": [
    {
      "id": 1,
      "short_url": "https://example.com/car/123",
      "title": "Toyota Camry 2020",
      "make": "Toyota",
      "model": "Camry",
      "year": "2020",
      "body_type": "Седан",
      "horsepower": "150 л.с.",
      "fuel_type": "Бензин",
      "motors_trim": "2.0L",
      "kilometers": 50000,
      "price_formatted": "1 500 000 ₽",
      "price_raw": 1500000,
      "currency": "RUB",
      "exterior_color": "Белый",
      "location": "Москва",
      "phone": "+7 (999) 123-45-67",
      "seller_name": "Иван Иванов",
      "seller_type": "Частное лицо",
      "seller_logo": "https://example.com/logo.png",
      "seller_profile_link": "https://example.com/seller/123",
      "images": [
        "https://example.com/car1.jpg",
        "https://example.com/car2.jpg",
        "https://example.com/car3.jpg"
      ],
      "main_image": "https://example.com/car1.jpg",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

## GET /car-listings/:id - Получение объявления по ID

```json
{
  "id": 1,
  "short_url": "https://example.com/car/123",
  "title": "Toyota Camry 2020",
  "make": "Toyota",
  "model": "Camry",
  "year": "2020",
  "body_type": "Седан",
  "horsepower": "150 л.с.",
  "fuel_type": "Бензин",
  "motors_trim": "2.0L",
  "kilometers": 50000,
  "price_formatted": "1 500 000 ₽",
  "price_raw": 1500000,
  "currency": "RUB",
  "exterior_color": "Белый",
  "location": "Москва",
  "phone": "+7 (999) 123-45-67",
  "seller_name": "Иван Иванов",
  "seller_type": "Частное лицо",
  "seller_logo": "https://example.com/logo.png",
  "seller_profile_link": "https://example.com/seller/123",
  "images": [
    "https://example.com/car1.jpg",
    "https://example.com/car2.jpg",
    "https://example.com/car3.jpg"
  ],
  "main_image": "https://example.com/car1.jpg",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

## POST /car-listings - Создание объявления

### Запрос:
```json
{
  "short_url": "https://example.com/car/123",
  "title": "Toyota Camry 2020",
  "make": "Toyota",
  "model": "Camry",
  "year": "2020",
  "body_type": "Седан",
  "horsepower": "150 л.с.",
  "fuel_type": "Бензин",
  "motors_trim": "2.0L",
  "kilometers": 50000,
  "price_formatted": "1 500 000 ₽",
  "price_raw": 1500000,
  "currency": "RUB",
  "exterior_color": "Белый",
  "location": "Москва",
  "phone": "+7 (999) 123-45-67",
  "seller_name": "Иван Иванов",
  "seller_type": "Частное лицо",
  "seller_logo": "https://example.com/logo.png",
  "seller_profile_link": "https://example.com/seller/123",
  "images": [
    "https://example.com/car1.jpg",
    "https://example.com/car2.jpg",
    "https://example.com/car3.jpg"
  ]
}
```

### Ответ:
```json
{
  "id": 1,
  "short_url": "https://example.com/car/123",
  "title": "Toyota Camry 2020",
  "make": "Toyota",
  "model": "Camry",
  "year": "2020",
  "body_type": "Седан",
  "horsepower": "150 л.с.",
  "fuel_type": "Бензин",
  "motors_trim": "2.0L",
  "kilometers": 50000,
  "price_formatted": "1 500 000 ₽",
  "price_raw": 1500000,
  "currency": "RUB",
  "exterior_color": "Белый",
  "location": "Москва",
  "phone": "+7 (999) 123-45-67",
  "seller_name": "Иван Иванов",
  "seller_type": "Частное лицо",
  "seller_logo": "https://example.com/logo.png",
  "seller_profile_link": "https://example.com/seller/123",
  "images": [
    "https://example.com/car1.jpg",
    "https://example.com/car2.jpg",
    "https://example.com/car3.jpg"
  ],
  "main_image": "https://example.com/car1.jpg",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

## Особенности реализации

1. **Автоматическое определение главного изображения**: Если при создании или обновлении объявления не указано поле `main_image`, но есть массив `images`, то первая картинка из массива автоматически становится главной.

2. **Поля для изображений**:
   - `images` - массив строк с URL-адресами всех изображений автомобиля
   - `main_image` - строка с URL-адресом главного изображения (обычно первое из массива `images`)

3. **Обратная совместимость**: Все поля для изображений являются опциональными, поэтому существующие API запросы будут работать без изменений.

4. **Типы данных**:
   - `images` хранится как JSON массив в базе данных
   - `main_image` хранится как обычная текстовая строка


