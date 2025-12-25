#!/bin/bash

# Скрипт для проверки статуса приложения на сервере

echo "=== Проверка Docker контейнеров ==="
docker ps | grep auto-back-app || echo "Контейнер не запущен"

echo ""
echo "=== Логи приложения (последние 50 строк) ==="
docker logs --tail 50 auto-back-app 2>&1 || echo "Не удалось получить логи"

echo ""
echo "=== Проверка доступности приложения на порту 3002 ==="
curl -s http://localhost:3002/api || echo "Приложение не отвечает на localhost:3002"

echo ""
echo "=== Проверка статуса Nginx ==="
systemctl status nginx --no-pager -l || service nginx status

echo ""
echo "=== Проверка конфигурации Nginx ==="
nginx -t 2>&1 || echo "Ошибка в конфигурации Nginx"

