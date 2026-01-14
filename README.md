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
DB_HOST=194.87.130.217
DB_PORT=5432
DB_USER=root
DB_PASSWORD=P@rs3r_S3cR3t!
DB_NAME=auto_db
PWL_HEADLESS=true
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Максимальное количество записей для экспорта (по умолчанию: 100000)
EXPORT_MAX_RECORDS=100000
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

### Экспорт
- `POST /api/export/cars` - Экспорт автомобилей (CSV, Excel, JSON)
- `POST /api/export/users` - Экспорт пользователей (CSV, Excel, JSON)
- `GET /api/export/preview` - Предпросмотр количества записей для экспорта

## Изменения для фронтенда

### Исправление ошибки 413 Payload Too Large при экспорте

После исправления проблемы с экспортом были внесены следующие изменения:

1. **Увеличен лимит записей**: Максимальное количество записей для экспорта увеличено с 50,000 до 100,000 (настраивается через переменную окружения `EXPORT_MAX_RECORDS`).

2. **Изменен способ отправки данных**: **Все форматы экспорта (CSV, Excel, JSON) теперь отправляются как файлы для скачивания**, а не как JSON ответы. Это необходимо для предотвращения ошибки 413 при экспорте больших объемов данных.

3. **Настройка лимита**: Если вам нужно экспортировать больше 100,000 записей, установите переменную окружения `EXPORT_MAX_RECORDS` в файле `.env`:
   ```env
   EXPORT_MAX_RECORDS=200000
   ```

#### Что нужно изменить на фронтенде:

1. **Обработка JSON экспорта**: JSON формат теперь тоже отправляется как файл для скачивания, а не как JSON ответ. Убедитесь, что обработка JSON экспорта идентична обработке CSV и Excel.

2. **Пример кода для экспорта (JavaScript/TypeScript)**:

```typescript
async function exportData(format: 'csv' | 'excel' | 'json', filters?: any) {
  try {
    const response = await fetch('/api/export/cars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        format: format,
        filters: filters || {}
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка экспорта: ${response.status}`);
    }

    // Для всех форматов получаем blob и создаем ссылку для скачивания
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Получаем имя файла из заголовка Content-Disposition
    const contentDisposition = response.headers.get('Content-Disposition');
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
      : `cars_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при экспорте:', error);
    // Обработка ошибки
  }
}
```

3. **Если использовался старый код для JSON экспорта**:

**Было (неправильно):**
```typescript
if (format === 'json') {
  const data = await response.json();
  // Обработка JSON данных напрямую
  console.log(data);
}
```

**Стало (правильно):**
```typescript
// Для всех форматов используем blob и скачивание файла
const blob = await response.blob();
// ... код скачивания файла (см. пример выше)
```

4. **Если используется axios**:

```typescript
import axios from 'axios';

async function exportData(format: 'csv' | 'excel' | 'json', filters?: any) {
  try {
    const response = await axios.post(
      '/api/export/cars',
      {
        format: format,
        filters: filters || {}
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' // Важно: используем blob для всех форматов
      }
    );

    // Создаем ссылку для скачивания
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Получаем имя файла из заголовка
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition 
      ? contentDisposition.split('filename=')[1]?.replace(/"/g, '') 
      : `cars_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка при экспорте:', error);
  }
}
```

#### Важные моменты:

- ✅ Все форматы (CSV, Excel, JSON) теперь обрабатываются одинаково - как файлы для скачивания
- ✅ Используйте `responseType: 'blob'` при работе с axios
- ✅ Используйте `response.blob()` при работе с fetch API
- ✅ Имя файла автоматически генерируется на бэкенде и передается в заголовке `Content-Disposition`
- ❌ Не пытайтесь парсить JSON ответ напрямую через `response.json()` для экспорта
