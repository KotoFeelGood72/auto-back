-- Создание таблицы history для хранения истории изменений
CREATE TABLE IF NOT EXISTS history (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER NOT NULL,
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    user_id INTEGER NOT NULL,
    user_name VARCHAR(255),
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_history_entity_type_entity_id ON history(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_history_user_id ON history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_action ON history(action);
CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at);
CREATE INDEX IF NOT EXISTS idx_history_entity_type_entity_id_created_at ON history(entity_type, entity_id, created_at);

-- Комментарии к таблице и колонкам
COMMENT ON TABLE history IS 'Таблица для хранения истории изменений сущностей';
COMMENT ON COLUMN history.entity_type IS 'Тип сущности (car, user, favorite, export)';
COMMENT ON COLUMN history.entity_id IS 'ID сущности';
COMMENT ON COLUMN history.action IS 'Тип действия (create, update, delete, view, export)';
COMMENT ON COLUMN history.changes IS 'JSON объект с изменениями (старые и новые значения)';
COMMENT ON COLUMN history.user_id IS 'ID пользователя, выполнившего действие';
COMMENT ON COLUMN history.user_name IS 'Имя пользователя на момент выполнения действия';
COMMENT ON COLUMN history.description IS 'Описание действия';
COMMENT ON COLUMN history.ip_address IS 'IP адрес пользователя';
COMMENT ON COLUMN history.user_agent IS 'User-Agent браузера пользователя';
COMMENT ON COLUMN history.created_at IS 'Дата и время создания записи';
