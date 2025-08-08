import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.PGUSER || 'iot_user',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'iot_sensors',
  password: process.env.PGPASSWORD || 'iot_password',
  port: Number(process.env.PGPORT) || 5432
});

export default {
  query: (text: string, params?: any[]) => pool.query(text, params)
};