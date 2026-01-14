-- Добавление колонки status в таблицу car_listings
ALTER TABLE car_listings 
ADD COLUMN IF NOT EXISTS status VARCHAR(255);

-- Создание индекса для оптимизации поиска по статусу
CREATE INDEX IF NOT EXISTS idx_car_listings_status ON car_listings(status);
