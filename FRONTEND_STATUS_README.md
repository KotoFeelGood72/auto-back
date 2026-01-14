# Работа со статусами автомобилей - Руководство для фронтенда

## Обзор

API предоставляет возможность работы со статусами объявлений о продаже автомобилей. В каждом ответе списка автомобилей автоматически возвращается массив доступных статусов, который можно использовать для фильтрации и отображения в интерфейсе.

## Базовый URL

```
http://194.87.130.217:3002
```

## Доступные статусы

API поддерживает следующие статусы:

- **`Продано`** - автомобиль уже продан
- **`Активно`** - объявление активно и автомобиль доступен для покупки
- **`Долго продается`** - объявление размещено давно, но автомобиль еще не продан
- **`Появилось недавно`** - новое объявление, недавно добавленное в систему

## Получение списка автомобилей со статусами

### GET запрос

```http
GET /car-listings
```

### Пример ответа

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
    "total": 100,
    "totalPages": 10
  },
  "availableStatuses": [
    "Продано",
    "Активно",
    "Долго продается",
    "Появилось недавно"
  ]
}
```

**Важно:** Поле `availableStatuses` всегда присутствует в ответе и содержит актуальный список всех доступных статусов.

## Фильтрация по статусу

### Запрос с фильтром

```http
GET /car-listings?status=Активно
```

### Примеры запросов

#### Получить только активные объявления

```javascript
const response = await fetch('http://194.87.130.217:3002/car-listings?status=Активно');
const data = await response.json();
```

#### Комбинирование с другими фильтрами

```javascript
const params = new URLSearchParams({
  status: 'Активно',
  make: 'Toyota',
  maxPrice: '2000000',
  page: '1',
  limit: '20'
});

const response = await fetch(`http://194.87.130.217:3002/car-listings?${params}`);
const data = await response.json();
```

## Примеры реализации для разных фреймворков

### React с хуками

```jsx
import { useState, useEffect } from 'react';

function CarListings() {
  const [cars, setCars] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, [selectedStatus]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const url = selectedStatus 
        ? `http://194.87.130.217:3002/car-listings?status=${encodeURIComponent(selectedStatus)}`
        : 'http://194.87.130.217:3002/car-listings';
      
      const response = await fetch(url);
      const data = await response.json();
      
      setCars(data.data);
      setStatuses(data.availableStatuses);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <select 
        value={selectedStatus} 
        onChange={(e) => setSelectedStatus(e.target.value)}
      >
        <option value="">Все статусы</option>
        {statuses.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <div>
          {cars.map(car => (
            <div key={car.id}>
              <h3>{car.title}</h3>
              <p>Статус: {car.status}</p>
              <p>Цена: {car.price_formatted}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Vue 3 Composition API

```vue
<template>
  <div>
    <select v-model="selectedStatus" @change="fetchCars">
      <option value="">Все статусы</option>
      <option v-for="status in statuses" :key="status" :value="status">
        {{ status }}
      </option>
    </select>

    <div v-if="loading">Загрузка...</div>
    <div v-else>
      <div v-for="car in cars" :key="car.id">
        <h3>{{ car.title }}</h3>
        <p>Статус: {{ car.status }}</p>
        <p>Цена: {{ car.price_formatted }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const cars = ref([]);
const statuses = ref([]);
const selectedStatus = ref('');
const loading = ref(true);

const fetchCars = async () => {
  loading.value = true;
  try {
    const url = selectedStatus.value
      ? `http://194.87.130.217:3002/car-listings?status=${encodeURIComponent(selectedStatus.value)}`
      : 'http://194.87.130.217:3002/car-listings';
    
    const response = await fetch(url);
    const data = await response.json();
    
    cars.value = data.data;
    statuses.value = data.availableStatuses;
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCars();
});

watch(selectedStatus, () => {
  fetchCars();
});
</script>
```

### Axios пример

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://194.87.130.217:3002';

// Получить список автомобилей с фильтром по статусу
async function getCarsByStatus(status = null) {
  try {
    const params = status ? { status } : {};
    const response = await axios.get(`${API_BASE_URL}/car-listings`, { params });
    
    return {
      cars: response.data.data,
      pagination: response.data.pagination,
      availableStatuses: response.data.availableStatuses
    };
  } catch (error) {
    console.error('Ошибка получения автомобилей:', error);
    throw error;
  }
}

// Использование
const { cars, availableStatuses } = await getCarsByStatus('Активно');
console.log('Доступные статусы:', availableStatuses);
```

## Создание объявления со статусом

### POST запрос

```javascript
async function createCarListing(carData, token) {
  const response = await fetch('http://194.87.130.217:3002/car-listings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ...carData,
      status: 'Активно' // Установка статуса при создании
    })
  });
  
  return await response.json();
}
```

### Пример с Axios

```javascript
import axios from 'axios';

async function createCarListing(carData, token) {
  try {
    const response = await axios.post(
      'http://194.87.130.217:3002/car-listings',
      {
        ...carData,
        status: 'Активно'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Ошибка создания объявления:', error);
    throw error;
  }
}
```

## Обновление статуса объявления

### PATCH запрос

```javascript
async function updateCarStatus(carId, newStatus, token) {
  const response = await fetch(`http://194.87.130.217:3002/car-listings/${carId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      status: newStatus
    })
  });
  
  return await response.json();
}

// Использование
await updateCarStatus(123, 'Продано', userToken);
```

### Пример с Axios

```javascript
async function updateCarStatus(carId, newStatus, token) {
  try {
    const response = await axios.patch(
      `http://194.87.130.217:3002/car-listings/${carId}`,
      { status: newStatus },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    throw error;
  }
}
```

## Компонент выбора статуса

### React компонент

```jsx
function StatusSelector({ value, onChange, availableStatuses }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Все статусы</option>
      {availableStatuses.map(status => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}

// Использование
<StatusSelector 
  value={selectedStatus}
  onChange={setSelectedStatus}
  availableStatuses={statuses}
/>
```

### Vue компонент

```vue
<template>
  <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
    <option value="">Все статусы</option>
    <option v-for="status in availableStatuses" :key="status" :value="status">
      {{ status }}
    </option>
  </select>
</template>

<script setup>
defineProps({
  modelValue: String,
  availableStatuses: {
    type: Array,
    required: true
  }
});

defineEmits(['update:modelValue']);
</script>
```

## Визуальное отображение статусов

### React компонент с цветовой индикацией

```jsx
function StatusBadge({ status }) {
  const getStatusColor = (status) => {
    const colors = {
      'Активно': 'green',
      'Появилось недавно': 'blue',
      'Долго продается': 'orange',
      'Продано': 'gray'
    };
    return colors[status] || 'gray';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Активно': '✓',
      'Появилось недавно': '🆕',
      'Долго продается': '⏰',
      'Продано': '✓'
    };
    return icons[status] || '';
  };

  return (
    <span 
      style={{ 
        backgroundColor: getStatusColor(status),
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}
    >
      {getStatusIcon(status)} {status}
    </span>
  );
}
```

### CSS стили для статусов

```css
.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-активно {
  background-color: #10b981;
  color: white;
}

.status-появилось-недавно {
  background-color: #3b82f6;
  color: white;
}

.status-долго-продается {
  background-color: #f59e0b;
  color: white;
}

.status-продано {
  background-color: #6b7280;
  color: white;
}
```

## Обработка ошибок

```javascript
async function fetchCarsWithErrorHandling(status = null) {
  try {
    const params = status ? { status } : {};
    const response = await fetch(
      `http://194.87.130.217:3002/car-listings?${new URLSearchParams(params)}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка получения данных:', error);
    // Показать уведомление пользователю
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      availableStatuses: []
    };
  }
}
```

## Пагинация с фильтром по статусу

```javascript
async function fetchCarsPaginated(status, page = 1, limit = 10) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString()
  });
  
  if (status) {
    params.append('status', status);
  }
  
  const response = await fetch(
    `http://194.87.130.217:3002/car-listings?${params}`
  );
  const data = await response.json();
  
  return {
    cars: data.data,
    pagination: data.pagination,
    availableStatuses: data.availableStatuses
  };
}
```

## Типы для TypeScript

```typescript
interface CarListing {
  id: number;
  title: string;
  make: string;
  model: string;
  year: string;
  price_raw: number;
  price_formatted: string;
  status: CarStatus;
  images: string[];
  main_image: string | null;
  // ... другие поля
}

type CarStatus = 'Продано' | 'Активно' | 'Долго продается' | 'Появилось недавно';

interface CarListingsResponse {
  data: CarListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  availableStatuses: CarStatus[];
}

// Использование
async function getCars(status?: CarStatus): Promise<CarListingsResponse> {
  const url = status 
    ? `http://194.87.130.217:3002/car-listings?status=${encodeURIComponent(status)}`
    : 'http://194.87.130.217:3002/car-listings';
  
  const response = await fetch(url);
  return await response.json();
}
```

## Важные замечания

1. **Кодировка URL**: При передаче статусов в URL используйте `encodeURIComponent()` для корректной обработки кириллицы:
   ```javascript
   const status = encodeURIComponent('Активно');
   ```

2. **Регистр важен**: Статусы чувствительны к регистру. Используйте точные значения из `availableStatuses`.

3. **Кэширование статусов**: Массив `availableStatuses` можно кэшировать, так как он не изменяется часто.

4. **Валидация**: Всегда проверяйте, что выбранный статус присутствует в `availableStatuses` перед отправкой запроса.

5. **Авторизация**: Для создания и обновления объявлений требуется JWT токен в заголовке `Authorization`.

## Пример полного компонента (React)

```jsx
import { useState, useEffect } from 'react';

function CarListingsPage() {
  const [cars, setCars] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchCars();
  }, [selectedStatus, page]);

  const fetchCars = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });
      
      if (selectedStatus) {
        params.append('status', selectedStatus);
      }
      
      const response = await fetch(
        `http://194.87.130.217:3002/car-listings?${params}`
      );
      const data = await response.json();
      
      setCars(data.data);
      setStatuses(data.availableStatuses);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Объявления о продаже автомобилей</h1>
      
      <select 
        value={selectedStatus} 
        onChange={(e) => {
          setSelectedStatus(e.target.value);
          setPage(1);
        }}
      >
        <option value="">Все статусы</option>
        {statuses.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <>
          <div>
            {cars.map(car => (
              <div key={car.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
                <h3>{car.title}</h3>
                <p>Статус: <strong>{car.status}</strong></p>
                <p>Цена: {car.price_formatted}</p>
                {car.main_image && (
                  <img src={car.main_image} alt={car.title} style={{ maxWidth: '200px' }} />
                )}
              </div>
            ))}
          </div>

          {pagination && (
            <div>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Назад
              </button>
              <span>Страница {pagination.page} из {pagination.totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                Вперед
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default CarListingsPage;
```

## Дополнительные ресурсы

- Swagger документация: http://194.87.130.217:3002/api
- Базовый URL API: http://194.87.130.217:3002
