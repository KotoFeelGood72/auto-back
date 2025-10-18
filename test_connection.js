const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: '77.232.138.181',
    port: 5432,
    user: 'root',
    password: 'qJ-p*^y-B9As+P',
    database: 'postgres'
  });

  try {
    await client.connect();
    console.log('✅ Успешное подключение к PostgreSQL!');
    
    // Проверяем доступные базы данных
    const result = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.log('\nДоступные базы данных:');
    result.rows.forEach(row => {
      console.log(`- ${row.datname}`);
    });
    
    await client.end();
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
  }
}

testConnection();

