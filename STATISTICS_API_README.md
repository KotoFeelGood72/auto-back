# API Статистики - Руководство для фронтенда

## Обзор

API статистики предоставляет данные для построения дашборда с различными метриками и графиками. Все эндпоинты требуют JWT авторизации.

## Базовый URL

```
http://194.87.130.217:3002/api/statistics
```

## Авторизация

Все запросы требуют JWT токен в заголовке:

```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Эндпоинты

### 1. Получить всю статистику

**GET** `/api/statistics`

Возвращает все виды статистики одним запросом.

#### Query параметры:

- `period` (опционально) - Период группировки: `monthly`, `quarterly`, `annually`
- `date_from` (опционально) - Начальная дата (ISO 8601)
- `date_to` (опционально) - Конечная дата (ISO 8601)

#### Пример запроса:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/statistics?period=monthly&date_from=2024-01-01&date_to=2024-12-31',
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
  "overview": {
    "cars": {
      "total": 3782,
      "previous": 3405,
      "change": 377,
      "changePercent": 11.01,
      "isPositive": true
    },
    "users": {
      "total": 5359,
      "previous": 5892,
      "change": -533,
      "changePercent": -9.05,
      "isPositive": false
    }
  },
  "monthlyCars": [
    { "month": "2024-01", "count": 250 },
    { "month": "2024-02", "count": 350 },
    { "month": "2024-03", "count": 280 }
  ],
  "statusStats": [
    { "status": "Активно", "count": 2500 },
    { "status": "Продано", "count": 1000 },
    { "status": "Долго продается", "count": 200 },
    { "status": "Появилось недавно", "count": 82 }
  ],
  "periodStats": [
    {
      "period": "2024-01",
      "count": 250,
      "totalRevenue": 12500000
    }
  ],
  "targetStats": {
    "target": 240000,
    "revenue": 181320,
    "count": 3782,
    "achievementPercent": 75.55,
    "changePercent": 10.0,
    "isPositive": true
  }
}
```

---

### 2. Общая статистика (Overview)

**GET** `/api/statistics/overview`

Возвращает общее количество автомобилей и пользователей с процентами изменений.

#### Пример запроса:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/statistics/overview',
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
  "cars": {
    "total": 3782,
    "previous": 3405,
    "change": 377,
    "changePercent": 11.01,
    "isPositive": true
  },
  "users": {
    "total": 5359,
    "previous": 5892,
    "change": -533,
    "changePercent": -9.05,
    "isPositive": false
  }
}
```

---

### 3. Месячная статистика по автомобилям

**GET** `/api/statistics/monthly-cars`

Возвращает количество созданных автомобилей по месяцам.

#### Пример запроса:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/statistics/monthly-cars?date_from=2024-01-01&date_to=2024-12-31',
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
[
  { "month": "2024-01", "count": 250 },
  { "month": "2024-02", "count": 350 },
  { "month": "2024-03", "count": 280 },
  { "month": "2024-04", "count": 300 }
]
```

---

### 4. Статистика по статусам

**GET** `/api/statistics/status`

Возвращает количество автомобилей по каждому статусу.

#### Пример запроса:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/statistics/status',
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
[
  { "status": "Активно", "count": 2500 },
  { "status": "Продано", "count": 1000 },
  { "status": "Долго продается", "count": 200 },
  { "status": "Появилось недавно", "count": 82 }
]
```

---

### 5. Статистика по периодам

**GET** `/api/statistics/period`

Возвращает статистику, сгруппированную по выбранному периоду (месяц, квартал, год).

#### Query параметры:

- `period` (опционально) - `monthly`, `quarterly`, `annually` (по умолчанию: `monthly`)
- `date_from` (опционально) - Начальная дата
- `date_to` (опционально) - Конечная дата

#### Пример запроса:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/statistics/period?period=quarterly&date_from=2024-01-01&date_to=2024-12-31',
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
[
  {
    "period": "2024-Q1",
    "count": 880,
    "totalRevenue": 44000000
  },
  {
    "period": "2024-Q2",
    "count": 920,
    "totalRevenue": 46000000
  }
]
```

---

### 6. Статистика по целям

**GET** `/api/statistics/target`

Возвращает статистику выполнения целей (процент выполнения, доходы).

#### Пример запроса:

```javascript
const response = await fetch(
  'http://194.87.130.217:3002/api/statistics/target?date_from=2024-01-01&date_to=2024-12-31',
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
  "target": 240000,
  "revenue": 181320,
  "count": 3782,
  "achievementPercent": 75.55,
  "changePercent": 10.0,
  "isPositive": true
}
```

---

## Примеры реализации для разных фреймворков

### React с хуками

```jsx
import { useState, useEffect } from 'react';

function StatisticsDashboard({ token }) {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchStatistics();
  }, [period, dateFrom, dateTo]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period: period
      });
      
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await fetch(
        `http://194.87.130.217:3002/api/statistics?${params}`,
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
      setStatistics(data);
    } catch (error) {
      console.error('Ошибка:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!statistics) {
    return <div>Нет данных</div>;
  }

  return (
    <div>
      <h1>Дашборд статистики</h1>

      {/* Фильтры */}
      <div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="monthly">По месяцам</option>
          <option value="quarterly">По кварталам</option>
          <option value="annually">По годам</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          placeholder="От"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          placeholder="До"
        />
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Автомобили</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {statistics.overview.cars.total}
          </p>
          <p style={{ color: statistics.overview.cars.isPositive ? 'green' : 'red' }}>
            {statistics.overview.cars.isPositive ? '↑' : '↓'} {statistics.overview.cars.changePercent}%
          </p>
        </div>

        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h3>Пользователи</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {statistics.overview.users.total}
          </p>
          <p style={{ color: statistics.overview.users.isPositive ? 'green' : 'red' }}>
            {statistics.overview.users.isPositive ? '↑' : '↓'} {statistics.overview.users.changePercent}%
          </p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div style={{ marginTop: '20px' }}>
        <h2>Ежемесячные продажи</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '300px' }}>
          {statistics.monthlyCars.map((item) => (
            <div
              key={item.month}
              style={{
                flex: 1,
                backgroundColor: '#3b82f6',
                height: `${(item.count / Math.max(...statistics.monthlyCars.map(i => i.count))) * 100}%`,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                padding: '10px',
                color: 'white',
                borderRadius: '4px 4px 0 0'
              }}
            >
              {item.count}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          {statistics.monthlyCars.map((item) => (
            <div key={item.month} style={{ flex: 1, textAlign: 'center', fontSize: '12px' }}>
              {item.month}
            </div>
          ))}
        </div>
      </div>

      {/* Status Stats */}
      <div style={{ marginTop: '20px' }}>
        <h2>Статистика по статусам</h2>
        {statistics.statusStats.map((item) => (
          <div key={item.status} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.status}</span>
              <span>{item.count}</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '20px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  width: `${(item.count / statistics.statusStats.reduce((sum, s) => sum + s.count, 0)) * 100}%`,
                  height: '100%',
                  backgroundColor: '#3b82f6'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Target Stats */}
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h2>Ежемесячная цель</h2>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
            {statistics.targetStats.achievementPercent}%
          </div>
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: '20px solid #e5e7eb',
              borderTopColor: '#3b82f6',
              margin: '20px auto',
              transform: 'rotate(-90deg)',
              background: `conic-gradient(#3b82f6 ${statistics.targetStats.achievementPercent}%, #e5e7eb 0%)`
            }}
          />
          <p>Цель: ${statistics.targetStats.target.toLocaleString()}</p>
          <p>Доход: ${statistics.targetStats.revenue.toLocaleString()}</p>
          <p style={{ color: statistics.targetStats.isPositive ? 'green' : 'red' }}>
            {statistics.targetStats.isPositive ? '↑' : '↓'} {statistics.targetStats.changePercent}%
          </p>
        </div>
      </div>
    </div>
  );
}

export default StatisticsDashboard;
```

### Vue 3 Composition API

```vue
<template>
  <div>
    <h1>Дашборд статистики</h1>

    <!-- Фильтры -->
    <div>
      <select v-model="period" @change="fetchStatistics">
        <option value="monthly">По месяцам</option>
        <option value="quarterly">По кварталам</option>
        <option value="annually">По годам</option>
      </select>
      <input
        type="date"
        v-model="dateFrom"
        @change="fetchStatistics"
        placeholder="От"
      />
      <input
        type="date"
        v-model="dateTo"
        @change="fetchStatistics"
        placeholder="До"
      />
    </div>

    <div v-if="loading">Загрузка...</div>
    <div v-else-if="statistics">
      <!-- Overview Cards -->
      <div class="overview-cards">
        <div class="card">
          <h3>Автомобили</h3>
          <p class="big-number">{{ statistics.overview.cars.total }}</p>
          <p :class="statistics.overview.cars.isPositive ? 'positive' : 'negative'">
            {{ statistics.overview.cars.isPositive ? '↑' : '↓' }}
            {{ statistics.overview.cars.changePercent }}%
          </p>
        </div>

        <div class="card">
          <h3>Пользователи</h3>
          <p class="big-number">{{ statistics.overview.users.total }}</p>
          <p :class="statistics.overview.users.isPositive ? 'positive' : 'negative'">
            {{ statistics.overview.users.isPositive ? '↑' : '↓' }}
            {{ statistics.overview.users.changePercent }}%
          </p>
        </div>
      </div>

      <!-- Monthly Chart -->
      <div class="chart-section">
        <h2>Ежемесячные продажи</h2>
        <div class="chart-container">
          <div
            v-for="item in statistics.monthlyCars"
            :key="item.month"
            class="chart-bar"
            :style="{
              height: `${(item.count / maxMonthlyCount) * 100}%`
            }"
          >
            {{ item.count }}
          </div>
        </div>
        <div class="chart-labels">
          <span v-for="item in statistics.monthlyCars" :key="item.month">
            {{ item.month }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  token: {
    type: String,
    required: true
  }
});

const statistics = ref(null);
const loading = ref(true);
const period = ref('monthly');
const dateFrom = ref('');
const dateTo = ref('');

const maxMonthlyCount = computed(() => {
  if (!statistics.value?.monthlyCars) return 1;
  return Math.max(...statistics.value.monthlyCars.map(item => item.count));
});

const fetchStatistics = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams({
      period: period.value
    });
    
    if (dateFrom.value) params.append('date_from', dateFrom.value);
    if (dateTo.value) params.append('date_to', dateTo.value);

    const response = await fetch(
      `http://194.87.130.217:3002/api/statistics?${params}`,
      {
        headers: {
          'Authorization': `Bearer ${props.token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Ошибка загрузки статистики');
    }

    statistics.value = await response.json();
  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchStatistics();
});
</script>

<style scoped>
.overview-cards {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.card {
  border: 1px solid #ccc;
  padding: 20px;
  border-radius: 8px;
  flex: 1;
}

.big-number {
  font-size: 24px;
  font-weight: bold;
}

.positive {
  color: green;
}

.negative {
  color: red;
}

.chart-section {
  margin-top: 20px;
}

.chart-container {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  height: 300px;
}

.chart-bar {
  flex: 1;
  background-color: #3b82f6;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 10px;
  color: white;
  border-radius: 4px 4px 0 0;
}

.chart-labels {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.chart-labels span {
  flex: 1;
  text-align: center;
  font-size: 12px;
}
</style>
```

### Axios пример

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://194.87.130.217:3002';

class StatisticsAPI {
  constructor(token) {
    this.token = token;
    this.axios = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  // Получить всю статистику
  async getAllStatistics(params = {}) {
    try {
      const response = await this.axios.get('/api/statistics', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      throw error;
    }
  }

  // Получить общую статистику
  async getOverview(params = {}) {
    try {
      const response = await this.axios.get('/api/statistics/overview', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка получения общей статистики:', error);
      throw error;
    }
  }

  // Получить месячную статистику
  async getMonthlyCars(params = {}) {
    try {
      const response = await this.axios.get('/api/statistics/monthly-cars', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка получения месячной статистики:', error);
      throw error;
    }
  }

  // Получить статистику по статусам
  async getStatusStats(params = {}) {
    try {
      const response = await this.axios.get('/api/statistics/status', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка получения статистики по статусам:', error);
      throw error;
    }
  }

  // Получить статистику по периодам
  async getPeriodStats(period = 'monthly', params = {}) {
    try {
      const response = await this.axios.get('/api/statistics/period', {
        params: { period, ...params }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка получения статистики по периодам:', error);
      throw error;
    }
  }

  // Получить статистику по целям
  async getTargetStats(params = {}) {
    try {
      const response = await this.axios.get('/api/statistics/target', { params });
      return response.data;
    } catch (error) {
      console.error('Ошибка получения статистики по целям:', error);
      throw error;
    }
  }
}

// Использование
const statsAPI = new StatisticsAPI(userToken);

// Получить всю статистику
const allStats = await statsAPI.getAllStatistics({
  period: 'monthly',
  date_from: '2024-01-01',
  date_to: '2024-12-31'
});

// Получить только общую статистику
const overview = await statsAPI.getOverview();
```

### TypeScript типы

```typescript
type StatisticsPeriod = 'monthly' | 'quarterly' | 'annually';

interface OverviewStats {
  cars: {
    total: number;
    previous: number;
    change: number;
    changePercent: number;
    isPositive: boolean;
  };
  users: {
    total: number;
    previous: number;
    change: number;
    changePercent: number;
    isPositive: boolean;
  };
}

interface MonthlyCarStat {
  month: string;
  count: number;
}

interface StatusStat {
  status: string;
  count: number;
}

interface PeriodStat {
  period: string;
  count: number;
  totalRevenue: number;
}

interface TargetStat {
  target: number;
  revenue: number;
  count: number;
  achievementPercent: number;
  changePercent: number;
  isPositive: boolean;
}

interface AllStatistics {
  overview: OverviewStats;
  monthlyCars: MonthlyCarStat[];
  statusStats: StatusStat[];
  periodStats: PeriodStat[];
  targetStats: TargetStat;
}

interface StatisticsParams {
  period?: StatisticsPeriod;
  date_from?: string;
  date_to?: string;
}

async function getStatistics(
  params: StatisticsParams,
  token: string
): Promise<AllStatistics> {
  const queryParams = new URLSearchParams();
  
  if (params.period) queryParams.append('period', params.period);
  if (params.date_from) queryParams.append('date_from', params.date_from);
  if (params.date_to) queryParams.append('date_to', params.date_to);

  const response = await fetch(
    `http://194.87.130.217:3002/api/statistics?${queryParams}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Ошибка получения статистики');
  }

  return await response.json();
}
```

## Обработка ошибок

```javascript
async function fetchStatisticsWithErrorHandling(token, params = {}) {
  try {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(
      `http://194.87.130.217:3002/api/statistics?${queryParams}`,
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
        throw new Error('Недостаточно прав');
      }
      throw new Error(`Ошибка ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    return {
      error: error.message,
      data: null
    };
  }
}
```

## Использование с библиотеками графиков

### Chart.js

```javascript
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

async function renderMonthlyChart(token) {
  const response = await fetch(
    'http://194.87.130.217:3002/api/statistics/monthly-cars',
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  const data = await response.json();

  const ctx = document.getElementById('monthlyChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(item => item.month),
      datasets: [{
        label: 'Количество автомобилей',
        data: data.map(item => item.count),
        backgroundColor: '#3b82f6'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
```

### Recharts (React)

```jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function MonthlyChart({ token }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('http://194.87.130.217:3002/api/statistics/monthly-cars', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(setData);
  }, [token]);

  return (
    <BarChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" fill="#3b82f6" />
    </BarChart>
  );
}
```

## Важные замечания

1. **Авторизация обязательна**: Все запросы требуют JWT токен
2. **Формат дат**: Используйте ISO 8601 формат (`YYYY-MM-DD` или `YYYY-MM-DDTHH:mm:ss`)
3. **Временные зоны**: Все даты обрабатываются в UTC
4. **Производительность**: Для больших периодов запрос может выполняться дольше
5. **Кэширование**: Рекомендуется кэшировать результаты на клиенте

## Дополнительные ресурсы

- Swagger документация: http://194.87.130.217:3002/api
- Базовый URL API: http://194.87.130.217:3002
