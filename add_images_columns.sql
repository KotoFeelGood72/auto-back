-- Добавляем поля для изображений к существующей таблице car_listings
-- Без изменения существующих данных

-- Добавляем поле images как JSON (может быть NULL)
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS images JSON;

-- Добавляем поле main_image как TEXT (может быть NULL)
ALTER TABLE car_listings ADD COLUMN IF NOT EXISTS main_image TEXT;

-- Добавляем комментарии к полям
COMMENT ON COLUMN car_listings.images IS 'Массив ссылок на изображения автомобиля в формате JSON';
COMMENT ON COLUMN car_listings.main_image IS 'Главное изображение автомобиля (обычно первое из массива images)';


