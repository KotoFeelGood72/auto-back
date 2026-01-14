# API Ошибок Парсинга - Руководство для фронтенда

## Обзор

API для работы с ошибками парсинга позволяет получать список ошибок, статистику, отмечать ошибки как обработанные и работать с частично спарсенными данными.

## Базовый URL

```
http://194.87.130.217:3002/api/parsing-errors
```

## Авторизация

Все запросы требуют JWT токен и права доступа `admin` или `manager`:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Эндпоинты

### 1. Получить список ошибок парсинга

**GET** `/api/parsing-errors`

Возвращает список ошибок с пагинацией и фильтрацией.

#### Query параметры:

- `page` (опционально) - Номер страницы (по умолчанию: 1)
- `limit` (опционально) - Количество записей на странице (по умолчанию: 20)
- `parser_name` (опционально) - Фильтр по имени парсера (например: `dubicars`, `autotraders`)
- `error_type` (опционально) - Тип ошибки: `parsing`, `network`, `browser`, `database`, `unknown`
- `is_processed` (опционально) - Фильтр по статусу обработки (`true` или `false`)
- `date_from` (опционально) - Начальная дата (ISO 8601)
- `date_to` (опционально) - Конечная дата (ISO 8601)

#### Пример запроса:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/parsing-errors?page=1&limit=20&is_processed=false&parser_name=dubicars',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
```

#### Пример ответа:

```json
{
  "data": [
    {
      "id": 1,
      "parser_name": "dubicars",
      "url": "https://www.dubicars.com/used-cars/...",
      "error_type": "parsing",
      "error_name": "TypeError",
      "error_message": "Cannot read property 'textContent' of null",
      "error_stack": "TypeError: Cannot read property 'textContent' of null\n    at ...",
      "car_data": {
        "title": "2023 BMW X5",
        "make": "BMW",
        "model": "X5",
        "price_raw": 0
      },
      "context": {
        "selector": ".price",
        "url": "https://www.dubicars.com/..."
      },
      "is_processed": false,
      "processed_at": null,
      "created_at": "2026-01-14T20:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### 2. Получить статистику ошибок

**GET** `/api/parsing-errors/stats`

Возвращает статистику по ошибкам парсинга.

#### Пример запроса:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/parsing-errors/stats',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
```

#### Пример ответа:

```json
{
  "stats": [
    {
      "parser_name": "dubicars",
      "error_type": "parsing",
      "total_errors": 25,
      "unprocessed_errors": 15
    },
    {
      "parser_name": "autotraders",
      "error_type": "network",
      "total_errors": 10,
      "unprocessed_errors": 5
    }
  ],
  "errorTypeStats": [
    {
      "error_type": "parsing",
      "count": 30,
      "unprocessed": 18
    },
    {
      "error_type": "network",
      "count": 15,
      "unprocessed": 8
    }
  ],
  "parserStats": [
    {
      "parser_name": "dubicars",
      "count": 25,
      "unprocessed": 15
    },
    {
      "parser_name": "autotraders",
      "count": 20,
      "unprocessed": 10
    }
  ],
  "total_unprocessed": 25
}
```

---

### 3. Получить ошибки с частично спарсенными данными

**GET** `/api/parsing-errors/partial-data`

Возвращает только те ошибки, у которых есть частично спарсенные данные в поле `car_data`.

#### Query параметры:

Те же, что и для основного списка ошибок.

#### Пример запроса:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/parsing-errors/partial-data?is_processed=false',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
```

---

### 4. Получить ошибку по ID

**GET** `/api/parsing-errors/:id`

Возвращает детальную информацию об ошибке.

#### Пример запроса:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/parsing-errors/1',
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
```

#### Пример ответа:

```json
{
  "id": 1,
  "parser_name": "dubicars",
  "url": "https://www.dubicars.com/used-cars/...",
  "error_type": "parsing",
  "error_name": "TypeError",
  "error_message": "Cannot read property 'textContent' of null",
  "error_stack": "TypeError: Cannot read property 'textContent' of null\n    at ...",
  "car_data": {
    "title": "2023 BMW X5",
    "make": "BMW",
    "model": "X5",
    "year": "2023",
    "price_raw": 0
  },
  "context": {
    "selector": ".price",
    "url": "https://www.dubicars.com/..."
  },
  "is_processed": false,
  "processed_at": null,
  "created_at": "2026-01-14T20:00:00.000Z"
}
```

---

### 5. Отметить ошибку как обработанную

**POST** `/api/parsing-errors/:id/process`

Отмечает ошибку как обработанную и устанавливает дату обработки.

#### Пример запроса:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/parsing-errors/1/process',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
```

#### Пример ответа:

```json
{
  "success": true,
  "message": "Ошибка отмечена как обработанная",
  "error_id": 1,
  "error": {
    "id": 1,
    "is_processed": true,
    "processed_at": "2026-01-14T21:00:00.000Z",
    ...
  }
}
```

---

### 6. Отметить несколько ошибок как обработанные

**POST** `/api/parsing-errors/process-multiple`

Отмечает несколько ошибок как обработанные.

#### Варианты использования:

**Вариант 1: Query параметры**
```
POST /api/parsing-errors/process-multiple?ids=1,2,3
```

**Вариант 2: Body (JSON)**
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

или

```json
{
  "ids": "1,2,3,4,5"
}
```

#### Пример запроса с query параметрами:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/parsing-errors/process-multiple?ids=1,2,3,4,5',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const data = await response.json();
```

#### Пример запроса с body:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/parsing-errors/process-multiple',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      ids: [1, 2, 3, 4, 5]
    })
  }
);

const data = await response.json();
```

#### Пример ответа:

```json
{
  "success": true,
  "message": "Обработано 5 из 5 ошибок",
  "processed_count": 5,
  "failed_ids": []
}
```

---

## Примеры реализации для разных фреймворков

### React с хуками

```jsx
import { useState, useEffect } from 'react';

function ParsingErrorsList({ token }) {
  const [errors, setErrors] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    is_processed: false,
    parser_name: '',
    error_type: '',
  });

  useEffect(() => {
    fetchErrors();
  }, [filters]);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await fetch(
        `http://194.87.130.217:3002/api/parsing-errors?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      setErrors(data.data);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsProcessed = async (id) => {
    try {
      const response = await fetch(
        `http://194.87.130.217:3002/api/parsing-errors/${id}/process`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при обработке');
      }

      // Обновляем список
      fetchErrors();
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Не удалось отметить ошибку как обработанную');
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h1>Ошибки парсинга</h1>

      {/* Фильтры */}
      <div style={{ marginBottom: '20px' }}>
        <select
          value={filters.parser_name}
          onChange={(e) => setFilters({ ...filters, parser_name: e.target.value, page: 1 })}
        >
          <option value="">Все парсеры</option>
          <option value="dubicars">Dubicars</option>
          <option value="autotraders">Autotraders</option>
        </select>

        <select
          value={filters.error_type}
          onChange={(e) => setFilters({ ...filters, error_type: e.target.value, page: 1 })}
        >
          <option value="">Все типы</option>
          <option value="parsing">Parsing</option>
          <option value="network">Network</option>
          <option value="browser">Browser</option>
          <option value="database">Database</option>
          <option value="unknown">Unknown</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={filters.is_processed === false}
            onChange={(e) => setFilters({ ...filters, is_processed: !e.target.checked, page: 1 })}
          />
          Только необработанные
        </label>
      </div>

      {/* Список ошибок */}
      <div>
        {errors.map((error) => (
          <div key={error.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3>
                  {error.parser_name} - {error.error_type}
                </h3>
                <p><strong>URL:</strong> <a href={error.url} target="_blank" rel="noopener noreferrer">{error.url}</a></p>
                <p><strong>Ошибка:</strong> {error.error_name}</p>
                <p><strong>Сообщение:</strong> {error.error_message}</p>
                <p><strong>Дата:</strong> {new Date(error.created_at).toLocaleString()}</p>
                
                {error.car_data && (
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                    <strong>Частично спарсенные данные:</strong>
                    <pre>{JSON.stringify(error.car_data, null, 2)}</pre>
                  </div>
                )}

                {error.error_stack && (
                  <details style={{ marginTop: '10px' }}>
                    <summary>Стек ошибки</summary>
                    <pre style={{ fontSize: '12px', overflow: 'auto' }}>{error.error_stack}</pre>
                  </details>
                )}
              </div>

              <div>
                {!error.is_processed && (
                  <button
                    onClick={() => handleMarkAsProcessed(error.id)}
                    style={{ padding: '8px 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Отметить как обработанную
                  </button>
                )}
                {error.is_processed && (
                  <span style={{ color: 'green' }}>✓ Обработана</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Пагинация */}
      {pagination && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page === 1}
          >
            Назад
          </button>
          <span>
            Страница {pagination.page} из {pagination.totalPages} (Всего: {pagination.total})
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page >= pagination.totalPages}
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
}

export default ParsingErrorsList;
```

### Компонент статистики ошибок

```jsx
import { useState, useEffect } from 'react';

function ParsingErrorsStats({ token }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'http://194.87.130.217:3002/api/parsing-errors/stats',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка загрузки статистики');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка статистики...</div>;
  }

  if (!stats) {
    return <div>Нет данных</div>;
  }

  return (
    <div>
      <h1>Статистика ошибок парсинга</h1>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Всего необработанных ошибок: {stats.total_unprocessed}</h2>
      </div>

      {/* Статистика по парсерам */}
      <div style={{ marginBottom: '20px' }}>
        <h2>По парсерам</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Парсер</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Всего ошибок</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Необработанных</th>
            </tr>
          </thead>
          <tbody>
            {stats.parserStats.map((stat) => (
              <tr key={stat.parser_name}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stat.parser_name}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stat.count}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', color: stat.unprocessed > 0 ? 'red' : 'green' }}>
                  {stat.unprocessed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Статистика по типам ошибок */}
      <div style={{ marginBottom: '20px' }}>
        <h2>По типам ошибок</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Тип ошибки</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Всего</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Необработанных</th>
            </tr>
          </thead>
          <tbody>
            {stats.errorTypeStats.map((stat) => (
              <tr key={stat.error_type}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stat.error_type}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stat.count}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', color: stat.unprocessed > 0 ? 'red' : 'green' }}>
                  {stat.unprocessed}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Детальная статистика */}
      <div>
        <h2>Детальная статистика</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Парсер</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Тип ошибки</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Всего</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>Необработанных</th>
            </tr>
          </thead>
          <tbody>
            {stats.stats.map((stat, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stat.parser_name}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stat.error_type}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{stat.total_errors}</td>
                <td style={{ border: '1px solid #ccc', padding: '8px', color: stat.unprocessed_errors > 0 ? 'red' : 'green' }}>
                  {stat.unprocessed_errors}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ParsingErrorsStats;
```

### Vue 3 Composition API

```vue
<template>
  <div>
    <h1>Ошибки парсинга</h1>

    <!-- Фильтры -->
    <div class="filters">
      <select v-model="filters.parser_name" @change="fetchErrors">
        <option value="">Все парсеры</option>
        <option value="dubicars">Dubicars</option>
        <option value="autotraders">Autotraders</option>
      </select>

      <select v-model="filters.error_type" @change="fetchErrors">
        <option value="">Все типы</option>
        <option value="parsing">Parsing</option>
        <option value="network">Network</option>
        <option value="browser">Browser</option>
        <option value="database">Database</option>
        <option value="unknown">Unknown</option>
      </select>

      <label>
        <input
          type="checkbox"
          :checked="filters.is_processed === false"
          @change="filters.is_processed = !$event.target.checked; fetchErrors()"
        />
        Только необработанные
      </label>
    </div>

    <!-- Список ошибок -->
    <div v-if="loading">Загрузка...</div>
    <div v-else>
      <div
        v-for="error in errors"
        :key="error.id"
        class="error-card"
      >
        <div class="error-header">
          <div>
            <h3>{{ error.parser_name }} - {{ error.error_type }}</h3>
            <p><strong>URL:</strong> <a :href="error.url" target="_blank">{{ error.url }}</a></p>
            <p><strong>Ошибка:</strong> {{ error.error_name }}</p>
            <p><strong>Сообщение:</strong> {{ error.error_message }}</p>
            <p><strong>Дата:</strong> {{ new Date(error.created_at).toLocaleString() }}</p>
          </div>

          <div>
            <button
              v-if="!error.is_processed"
              @click="markAsProcessed(error.id)"
              class="btn-process"
            >
              Отметить как обработанную
            </button>
            <span v-else class="processed">✓ Обработана</span>
          </div>
        </div>

        <div v-if="error.car_data" class="partial-data">
          <strong>Частично спарсенные данные:</strong>
          <pre>{{ JSON.stringify(error.car_data, null, 2) }}</pre>
        </div>

        <details v-if="error.error_stack">
          <summary>Стек ошибки</summary>
          <pre class="error-stack">{{ error.error_stack }}</pre>
        </details>
      </div>

      <!-- Пагинация -->
      <div v-if="pagination" class="pagination">
        <button
          @click="filters.page--; fetchErrors()"
          :disabled="filters.page === 1"
        >
          Назад
        </button>
        <span>
          Страница {{ pagination.page }} из {{ pagination.totalPages }} (Всего: {{ pagination.total }})
        </span>
        <button
          @click="filters.page++; fetchErrors()"
          :disabled="filters.page >= pagination.totalPages"
        >
          Вперед
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  token: {
    type: String,
    required: true
  }
});

const errors = ref([]);
const pagination = ref(null);
const loading = ref(true);
const filters = ref({
  page: 1,
  limit: 20,
  is_processed: false,
  parser_name: '',
  error_type: '',
});

const fetchErrors = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    Object.keys(filters.value).forEach(key => {
      if (filters.value[key]) {
        params.append(key, filters.value[key]);
      }
    });

    const response = await fetch(
      `http://194.87.130.217:3002/api/parsing-errors?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${props.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Ошибка загрузки данных');
    }

    const data = await response.json();
    errors.value = data.data;
    pagination.value = data.pagination;
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    loading.value = false;
  }
};

const markAsProcessed = async (id) => {
  try {
    const response = await fetch(
      `http://194.87.130.217:3002/api/parsing-errors/${id}/process`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${props.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Ошибка при обработке');
    }

    fetchErrors();
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Не удалось отметить ошибку как обработанную');
  }
};

onMounted(() => {
  fetchErrors();
});
</script>

<style scoped>
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.error-card {
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
}

.error-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.btn-process {
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.processed {
  color: green;
}

.partial-data {
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.error-stack {
  font-size: 12px;
  overflow: auto;
}

.pagination {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
```

### Axios пример

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://194.87.130.217:3002';

class ParsingErrorsAPI {
  constructor(token) {
    this.token = token;
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Получить список ошибок
  async getErrors(params = {}) {
    try {
      const response = await this.axios.get('/api/parsing-errors', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка получения списка ошибок:', error);
      throw error;
    }
  }

  // Получить ошибку по ID
  async getErrorById(id) {
    try {
      const response = await this.axios.get(`/api/parsing-errors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка получения ошибки:', error);
      throw error;
    }
  }

  // Получить статистику
  async getStats() {
    try {
      const response = await this.axios.get('/api/parsing-errors/stats');
      return response.data;
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      throw error;
    }
  }

  // Получить ошибки с частичными данными
  async getErrorsWithPartialData(params = {}) {
    try {
      const response = await this.axios.get('/api/parsing-errors/partial-data', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка получения ошибок с частичными данными:', error);
      throw error;
    }
  }

  // Отметить ошибку как обработанную
  async markAsProcessed(id) {
    try {
      const response = await this.axios.post(`/api/parsing-errors/${id}/process`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обработке:', error);
      throw error;
    }
  }

  // Отметить несколько ошибок как обработанные
  async markMultipleAsProcessed(ids) {
    try {
      const response = await this.axios.post('/api/parsing-errors/process-multiple', null, {
        params: { ids: ids.join(',') }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при массовой обработке:', error);
      throw error;
    }
  }
}

// Использование
const errorsAPI = new ParsingErrorsAPI(userToken);

// Получить необработанные ошибки
const unprocessedErrors = await errorsAPI.getErrors({
  is_processed: false,
  page: 1,
  limit: 20
});

// Получить статистику
const stats = await errorsAPI.getStats();

// Отметить ошибку как обработанную
await errorsAPI.markAsProcessed(1);

  // Отметить несколько ошибок (через body)
  await errorsAPI.markMultipleAsProcessed([1, 2, 3, 4, 5]);
  
  // Или через query параметры
  await this.axios.post('/api/parsing-errors/process-multiple', null, {
    params: { ids: '1,2,3,4,5' }
  });
```

### TypeScript типы

```typescript
type ErrorType = 'parsing' | 'network' | 'browser' | 'database' | 'unknown';

interface ParsingError {
  id: number;
  parser_name: string;
  url: string;
  error_type: ErrorType;
  error_name: string | null;
  error_message: string | null;
  error_stack: string | null;
  car_data: Record<string, any> | null;
  context: Record<string, any> | null;
  is_processed: boolean;
  processed_at: Date | null;
  created_at: Date;
}

interface ParsingErrorsResponse {
  data: ParsingError[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ParsingErrorsStats {
  stats: Array<{
    parser_name: string;
    error_type: ErrorType;
    total_errors: number;
    unprocessed_errors: number;
  }>;
  errorTypeStats: Array<{
    error_type: ErrorType;
    count: number;
    unprocessed: number;
  }>;
  parserStats: Array<{
    parser_name: string;
    count: number;
    unprocessed: number;
  }>;
  total_unprocessed: number;
}

interface FilterParsingErrorsParams {
  page?: number;
  limit?: number;
  parser_name?: string;
  error_type?: ErrorType;
  is_processed?: boolean;
  date_from?: string;
  date_to?: string;
}

async function getParsingErrors(
  params: FilterParsingErrorsParams,
  token: string
): Promise<ParsingErrorsResponse> {
  const queryParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      queryParams.append(key, String(params[key]));
    }
  });

  const response = await fetch(
    `http://194.87.130.217:3002/api/parsing-errors?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Ошибка получения списка ошибок');
  }

  return await response.json();
}
```

## Обработка ошибок

```javascript
async function fetchErrorsWithErrorHandling(token, params = {}) {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(
      `http://194.87.130.217:3002/api/parsing-errors?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Необходима авторизация');
      }
      if (response.status === 403) {
        throw new Error('Недостаточно прав доступа');
      }
      throw new Error(`Ошибка ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка получения ошибок парсинга:', error);
    return {
      error: error.message,
      data: null
    };
  }
}
```

## Работа с частично спарсенными данными

```javascript
async function processPartialData(errorId, token) {
  // Получаем ошибку с частичными данными
  const error = await fetch(
    `http://194.87.130.217:3002/api/parsing-errors/${errorId}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  ).then(res => res.json());

  if (error.car_data) {
    // Используем частичные данные для создания/обновления объявления
    const carData = {
      ...error.car_data,
      short_url: error.url,
      status: 'нет цены' // или другой статус
    };

    // Отправляем данные на создание объявления
    // или используем для повторного парсинга
    console.log('Частичные данные:', carData);
  }
}
```

## Важные замечания

1. **Авторизация обязательна**: Все запросы требуют JWT токен
2. **Права доступа**: Требуются права `admin` или `manager`
3. **Формат дат**: Используйте ISO 8601 формат для фильтрации по датам
4. **Пагинация**: Используйте пагинацию для больших списков ошибок
5. **Частичные данные**: Поле `car_data` может содержать частично спарсенные данные, которые можно использовать для повторной обработки

## Дополнительные ресурсы

- Swagger документация: http://194.87.130.217:3002/api
- Базовый URL API: http://194.87.130.217:3002
