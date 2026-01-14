-- Создание индекса на поле created_at для оптимизации фильтрации по датам
-- Этот индекс улучшит производительность запросов с фильтрацией по дате создания

CREATE INDEX IF NOT EXISTS idx_car_listings_created_at ON car_listings(created_at);

-- Проверка существования индекса
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'car_listings' 
  AND indexname = 'idx_car_listings_created_at';
