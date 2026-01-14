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

## Ручное обновление статуса объявления

Вы можете вручную изменить статус любого объявления через API. Для этого используется метод PATCH с указанием ID объявления.

### Базовый пример с Fetch API

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
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Ошибка обновления статуса');
  }
  
  return await response.json();
}

// Использование
await updateCarStatus(123, 'Продано', userToken);
```

### Пример с Axios

```javascript
import axios from 'axios';

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
    if (error.response) {
      throw new Error(error.response.data.message || 'Ошибка обновления статуса');
    }
    throw error;
  }
}

// Использование
try {
  const updatedCar = await updateCarStatus(123, 'Активно', userToken);
  console.log('Статус обновлен:', updatedCar);
} catch (error) {
  console.error('Не удалось обновить статус:', error.message);
}
```

### React компонент для обновления статуса

```jsx
import { useState } from 'react';

function UpdateCarStatus({ carId, currentStatus, availableStatuses, token, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    if (selectedStatus === currentStatus) {
      return; // Статус не изменился
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(
        `http://194.87.130.217:3002/car-listings/${carId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: selectedStatus
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления статуса');
      }

      const updatedCar = await response.json();
      setSuccess(true);
      
      // Вызываем callback для обновления списка
      if (onUpdate) {
        onUpdate(updatedCar);
      }

      // Скрываем сообщение об успехе через 3 секунды
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label>
        Статус:
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setError(null);
            setSuccess(false);
          }}
          disabled={loading}
        >
          {availableStatuses.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={handleUpdate}
        disabled={loading || selectedStatus === currentStatus}
      >
        {loading ? 'Обновление...' : 'Обновить статус'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Ошибка: {error}
        </div>
      )}

      {success && (
        <div style={{ color: 'green', marginTop: '10px' }}>
          Статус успешно обновлен!
        </div>
      )}
    </div>
  );
}

// Использование в списке автомобилей
function CarList({ token }) {
  const [cars, setCars] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const handleStatusUpdate = (updatedCar) => {
    // Обновляем автомобиль в списке
    setCars(cars.map(car => 
      car.id === updatedCar.id ? updatedCar : car
    ));
  };

  return (
    <div>
      {cars.map(car => (
        <div key={car.id}>
          <h3>{car.title}</h3>
          <UpdateCarStatus
            carId={car.id}
            currentStatus={car.status}
            availableStatuses={statuses}
            token={token}
            onUpdate={handleStatusUpdate}
          />
        </div>
      ))}
    </div>
  );
}
```

### Vue компонент для обновления статуса

```vue
<template>
  <div>
    <label>
      Статус:
      <select
        v-model="selectedStatus"
        @change="error = null; success = false"
        :disabled="loading"
      >
        <option v-for="status in availableStatuses" :key="status" :value="status">
          {{ status }}
        </option>
      </select>
    </label>

    <button
      @click="handleUpdate"
      :disabled="loading || selectedStatus === currentStatus"
    >
      {{ loading ? 'Обновление...' : 'Обновить статус' }}
    </button>

    <div v-if="error" style="color: red; margin-top: 10px">
      Ошибка: {{ error }}
    </div>

    <div v-if="success" style="color: green; margin-top: 10px">
      Статус успешно обновлен!
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  carId: {
    type: Number,
    required: true
  },
  currentStatus: {
    type: String,
    required: true
  },
  availableStatuses: {
    type: Array,
    required: true
  },
  token: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['updated']);

const selectedStatus = ref(props.currentStatus);
const loading = ref(false);
const error = ref(null);
const success = ref(false);

const handleUpdate = async () => {
  if (selectedStatus.value === props.currentStatus) {
    return; // Статус не изменился
  }

  loading.value = true;
  error.value = null;
  success.value = false;

  try {
    const response = await fetch(
      `http://194.87.130.217:3002/car-listings/${props.carId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${props.token}`
        },
        body: JSON.stringify({
          status: selectedStatus.value
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка обновления статуса');
    }

    const updatedCar = await response.json();
    success.value = true;
    
    // Отправляем событие обновления
    emit('updated', updatedCar);

    // Скрываем сообщение об успехе через 3 секунды
    setTimeout(() => {
      success.value = false;
    }, 3000);
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>
```

### Массовое обновление статусов

```javascript
async function updateMultipleCarStatuses(carIds, newStatus, token) {
  const results = [];
  const errors = [];

  for (const carId of carIds) {
    try {
      const response = await fetch(
        `http://194.87.130.217:3002/car-listings/${carId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Ошибка для автомобиля ${carId}`);
      }

      const updatedCar = await response.json();
      results.push(updatedCar);
    } catch (error) {
      errors.push({ carId, error: error.message });
    }
  }

  return {
    success: results,
    errors: errors
  };
}

// Использование
const { success, errors } = await updateMultipleCarStatuses(
  [123, 124, 125],
  'Продано',
  userToken
);

console.log(`Успешно обновлено: ${success.length}`);
console.log(`Ошибок: ${errors.length}`);
```

### Обновление статуса с валидацией

```javascript
const AVAILABLE_STATUSES = ['Продано', 'Активно', 'Долго продается', 'Появилось недавно'];

async function updateCarStatusWithValidation(carId, newStatus, token) {
  // Валидация статуса
  if (!AVAILABLE_STATUSES.includes(newStatus)) {
    throw new Error(`Неверный статус. Доступные статусы: ${AVAILABLE_STATUSES.join(', ')}`);
  }

  try {
    const response = await fetch(
      `http://194.87.130.217:3002/car-listings/${carId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Объявление не найдено');
      }
      if (response.status === 401) {
        throw new Error('Необходима авторизация');
      }
      
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ошибка обновления статуса');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка обновления статуса:', error);
    throw error;
  }
}
```

### TypeScript типы для обновления статуса

```typescript
type CarStatus = 'Продано' | 'Активно' | 'Долго продается' | 'Появилось недавно';

interface UpdateCarStatusRequest {
  status: CarStatus;
}

interface CarListing {
  id: number;
  title: string;
  make: string;
  model: string;
  status: CarStatus;
  // ... другие поля
}

async function updateCarStatus(
  carId: number,
  status: CarStatus,
  token: string
): Promise<CarListing> {
  const response = await fetch(
    `http://194.87.130.217:3002/car-listings/${carId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status } as UpdateCarStatusRequest)
    }
  );

  if (!response.ok) {
    throw new Error('Ошибка обновления статуса');
  }

  return await response.json();
}
```

### Обработка ошибок с детальной информацией

```javascript
async function updateCarStatusWithDetailedErrorHandling(carId, newStatus, token) {
  try {
    const response = await fetch(
      `http://194.87.130.217:3002/car-listings/${carId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      }
    );

    if (!response.ok) {
      let errorMessage = 'Ошибка обновления статуса';
      
      switch (response.status) {
        case 400:
          errorMessage = 'Неверные данные запроса';
          break;
        case 401:
          errorMessage = 'Необходима авторизация';
          break;
        case 403:
          errorMessage = 'Недостаточно прав для выполнения операции';
          break;
        case 404:
          errorMessage = 'Объявление не найдено';
          break;
        case 500:
          errorMessage = 'Ошибка сервера';
          break;
        default:
          errorMessage = `Ошибка ${response.status}`;
      }

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Если не удалось распарсить JSON, используем стандартное сообщение
      }

      throw new Error(errorMessage);
    }

    const updatedCar = await response.json();
    return {
      success: true,
      data: updatedCar
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

### React Hook для обновления статуса

```jsx
import { useState } from 'react';

function useUpdateCarStatus(token) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateStatus = async (carId, newStatus) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://194.87.130.217:3002/car-listings/${carId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления статуса');
      }

      const updatedCar = await response.json();
      return updatedCar;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading, error };
}

// Использование
function CarStatusEditor({ carId, currentStatus, token }) {
  const { updateStatus, loading, error } = useUpdateCarStatus(token);
  const [statuses] = useState(['Продано', 'Активно', 'Долго продается', 'Появилось недавно']);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const handleUpdate = async () => {
    try {
      const updatedCar = await updateStatus(carId, selectedStatus);
      console.log('Статус обновлен:', updatedCar);
      alert('Статус успешно обновлен!');
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  return (
    <div>
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value)}
        disabled={loading}
      >
        {statuses.map(status => (
          <option key={status} value={status}>{status}</option>
        ))}
      </select>
      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Обновление...' : 'Обновить'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
```

## Важные замечания

1. **Авторизация обязательна**: Для обновления статуса требуется JWT токен в заголовке `Authorization`

2. **Валидация статуса**: Убедитесь, что используете только допустимые статусы:
   - `Продано`
   - `Активно`
   - `Долго продается`
   - `Появилось недавно`

3. **Обработка ошибок**: Всегда обрабатывайте возможные ошибки (404, 401, 400, 500)

4. **Обновление UI**: После успешного обновления обновите состояние компонента или перезагрузите список

5. **Права доступа**: Убедитесь, что пользователь имеет права на обновление объявлений

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

## Экспорт с фильтрацией по статусу

API экспорта поддерживает фильтрацию по статусу при выгрузке данных.

### Экспорт активных объявлений

```javascript
async function exportActiveCars(token) {
  const response = await fetch('http://194.87.130.217:3002/api/export/cars', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      format: 'csv',
      fields: ['id', 'title', 'make', 'model', 'price_formatted', 'status'],
      filters: {
        status: 'Активно'
      }
    })
  });
  
  if (!response.ok) {
    throw new Error('Ошибка экспорта');
  }
  
  // Получаем файл
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'active_cars.csv';
  a.click();
}
```

### Экспорт проданных автомобилей

```javascript
async function exportSoldCars(token) {
  const response = await fetch('http://194.87.130.217:3002/api/export/cars', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      format: 'excel',
      fields: ['id', 'title', 'make', 'model', 'status', 'created_at'],
      filters: {
        status: 'Продано'
      }
    })
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sold_cars.xlsx';
  a.click();
}
```

### Комбинация фильтров (статус + даты)

```javascript
async function exportActiveCarsByDate(token, dateFrom, dateTo) {
  const response = await fetch('http://194.87.130.217:3002/api/export/cars', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      format: 'csv',
      fields: ['id', 'title', 'make', 'model', 'status', 'price_formatted', 'created_at'],
      filters: {
        status: 'Активно',
        date_from: dateFrom,
        date_to: dateTo
      }
    })
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `active_cars_${dateFrom}_${dateTo}.csv`;
  a.click();
}

// Использование
await exportActiveCarsByDate(
  token,
  '2024-01-12T00:00:00.000Z',
  '2024-01-15T23:59:59.999Z'
);
```

### Экспорт с Axios

```javascript
import axios from 'axios';

async function exportCarsByStatus(status, format = 'csv', token) {
  try {
    const response = await axios.post(
      'http://194.87.130.217:3002/api/export/cars',
      {
        format: format,
        fields: ['id', 'title', 'make', 'model', 'status', 'price_formatted'],
        filters: {
          status: status
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob' // Важно для файлов
      }
    );
    
    // Создаем ссылку для скачивания
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cars_${status}.${format === 'excel' ? 'xlsx' : format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    throw error;
  }
}
```

### Предпросмотр количества перед экспортом

```javascript
async function previewExportByStatus(status, token) {
  const params = new URLSearchParams({
    type: 'cars',
    status: status
  });
  
  const response = await fetch(
    `http://194.87.130.217:3002/api/export/preview?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  const data = await response.json();
  return data;
}

// Использование
const preview = await previewExportByStatus('Активно', token);
console.log(`Будет экспортировано ${preview.count} записей`);
```

### React компонент для экспорта

```jsx
import { useState } from 'react';

function ExportCarsByStatus({ token }) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [format, setFormat] = useState('csv');
  const [loading, setLoading] = useState(false);
  const [previewCount, setPreviewCount] = useState(null);

  const handlePreview = async () => {
    if (!selectedStatus) return;
    
    try {
      const params = new URLSearchParams({
        type: 'cars',
        status: selectedStatus
      });
      
      const response = await fetch(
        `http://194.87.130.217:3002/api/export/preview?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      setPreviewCount(data.count);
    } catch (error) {
      console.error('Ошибка предпросмотра:', error);
    }
  };

  const handleExport = async () => {
    if (!selectedStatus) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://194.87.130.217:3002/api/export/cars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          format: format,
          fields: ['id', 'title', 'make', 'model', 'status', 'price_formatted'],
          filters: {
            status: selectedStatus
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Ошибка экспорта');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cars_${selectedStatus}.${format === 'excel' ? 'xlsx' : format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Ошибка при экспорте данных');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Экспорт автомобилей по статусу</h2>
      
      <div>
        <label>
          Статус:
          <select 
            value={selectedStatus} 
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPreviewCount(null);
            }}
          >
            <option value="">Выберите статус</option>
            <option value="Активно">Активно</option>
            <option value="Продано">Продано</option>
            <option value="Долго продается">Долго продается</option>
            <option value="Появилось недавно">Появилось недавно</option>
          </select>
        </label>
      </div>

      <div>
        <label>
          Формат:
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="json">JSON</option>
          </select>
        </label>
      </div>

      <div>
        <button onClick={handlePreview} disabled={!selectedStatus}>
          Предпросмотр
        </button>
        {previewCount !== null && (
          <p>Будет экспортировано записей: {previewCount}</p>
        )}
      </div>

      <div>
        <button 
          onClick={handleExport} 
          disabled={!selectedStatus || loading}
        >
          {loading ? 'Экспорт...' : 'Экспортировать'}
        </button>
      </div>
    </div>
  );
}
```

### Vue компонент для экспорта

```vue
<template>
  <div>
    <h2>Экспорт автомобилей по статусу</h2>
    
    <div>
      <label>
        Статус:
        <select v-model="selectedStatus" @change="previewCount = null">
          <option value="">Выберите статус</option>
          <option value="Активно">Активно</option>
          <option value="Продано">Продано</option>
          <option value="Долго продается">Долго продается</option>
          <option value="Появилось недавно">Появилось недавно</option>
        </select>
      </label>
    </div>

    <div>
      <label>
        Формат:
        <select v-model="format">
          <option value="csv">CSV</option>
          <option value="excel">Excel</option>
          <option value="json">JSON</option>
        </select>
      </label>
    </div>

    <div>
      <button @click="handlePreview" :disabled="!selectedStatus">
        Предпросмотр
      </button>
      <p v-if="previewCount !== null">
        Будет экспортировано записей: {{ previewCount }}
      </p>
    </div>

    <div>
      <button @click="handleExport" :disabled="!selectedStatus || loading">
        {{ loading ? 'Экспорт...' : 'Экспортировать' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  token: {
    type: String,
    required: true
  }
});

const selectedStatus = ref('');
const format = ref('csv');
const loading = ref(false);
const previewCount = ref(null);

const handlePreview = async () => {
  if (!selectedStatus.value) return;
  
  try {
    const params = new URLSearchParams({
      type: 'cars',
      status: selectedStatus.value
    });
    
    const response = await fetch(
      `http://194.87.130.217:3002/api/export/preview?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${props.token}`
        }
      }
    );
    
    const data = await response.json();
    previewCount.value = data.count;
  } catch (error) {
    console.error('Ошибка предпросмотра:', error);
  }
};

const handleExport = async () => {
  if (!selectedStatus.value) return;
  
  loading.value = true;
  try {
    const response = await fetch('http://194.87.130.217:3002/api/export/cars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${props.token}`
      },
      body: JSON.stringify({
        format: format.value,
        fields: ['id', 'title', 'make', 'model', 'status', 'price_formatted'],
        filters: {
          status: selectedStatus.value
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Ошибка экспорта');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cars_${selectedStatus.value}.${format.value === 'excel' ? 'xlsx' : format.value}`;
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    alert('Ошибка при экспорте данных');
  } finally {
    loading.value = false;
  }
};
</script>
```

### Экспорт с дополнительными фильтрами

```javascript
async function exportCarsWithMultipleFilters(token) {
  const response = await fetch('http://194.87.130.217:3002/api/export/cars', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      format: 'excel',
      fields: [
        'id', 
        'title', 
        'make', 
        'model', 
        'status', 
        'price_formatted', 
        'created_at'
      ],
      filters: {
        status: 'Активно',
        make: 'Toyota',
        price_min: 10000,
        price_max: 50000,
        date_from: '2024-01-01T00:00:00.000Z',
        date_to: '2024-01-31T23:59:59.999Z'
      }
    })
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'filtered_cars.xlsx';
  a.click();
}
```

### Обработка ошибок при экспорте

```javascript
async function exportCarsWithErrorHandling(status, token) {
  try {
    const response = await fetch('http://194.87.130.217:3002/api/export/cars', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        format: 'csv',
        fields: ['id', 'title', 'make', 'model', 'status'],
        filters: {
          status: status
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cars_${status}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

### TypeScript типы для экспорта

```typescript
type ExportFormat = 'csv' | 'excel' | 'json';

type CarStatus = 'Продано' | 'Активно' | 'Долго продается' | 'Появилось недавно';

interface ExportCarsFilters {
  status?: CarStatus;
  make?: string;
  model?: string;
  year?: string;
  date_from?: string;
  date_to?: string;
  price_min?: number;
  price_max?: number;
  // ... другие фильтры
}

interface ExportCarsRequest {
  format: ExportFormat;
  fields?: string[];
  filters?: ExportCarsFilters;
}

interface PreviewExportResponse {
  count: number;
  type: 'cars' | 'users';
  filters_applied: ExportCarsFilters;
}

async function exportCars(
  request: ExportCarsRequest, 
  token: string
): Promise<Blob> {
  const response = await fetch('http://194.87.130.217:3002/api/export/cars', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(request)
  });
  
  if (!response.ok) {
    throw new Error('Ошибка экспорта');
  }
  
  return await response.blob();
}
```

## Дополнительные ресурсы

- Swagger документация: http://194.87.130.217:3002/api
- Базовый URL API: http://194.87.130.217:3002
