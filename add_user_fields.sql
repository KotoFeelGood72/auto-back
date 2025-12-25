-- Добавление полей role, phone и bio в таблицу users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Обновление существующих пользователей (если нужно установить роль admin для первого пользователя)
-- UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';

