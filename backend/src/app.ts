import express from 'express';
import cors from 'cors';
import sensorRoutes from './routes/sensorRoutes';
import authRoutes from './routes/authRoutes';
import { initMQTT } from './services/mqttService';
import db from './db';

export function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => res.json({
    message: 'API IoT está em execução',
    version: '2.0.0',
    authentication: {
      info: 'Sistema JWT com expiração de 15 minutos',
      loginEndpoint: 'POST /api/auth/login',
      refreshEndpoint: 'POST /api/auth/refresh'
    },
    endpoints: {
      auth: '/api/auth/*',
      sensors: '/api/sensors/:type/latest',
      predictions: '/api/sensors/:type/predict (🔒)',
      analysis: '/api/sensors/:type/analysis (🔒)',
      alerts: '/api/sensors/:type/alerts (🔒)'
    }
  }));

  app.use('/api/auth', authRoutes);
  app.use('/api/sensors', sensorRoutes);

  initMQTT();

  db.query(`CREATE TABLE IF NOT EXISTS sensors_data (
    id SERIAL PRIMARY KEY,
    sensor_type VARCHAR(50) NOT NULL,
    value REAL NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
  );`)
    .catch((err: any) => {
      console.error('Erro ao criar tabela sensors_data:', err);
    });

  return app;
}

export default startServer;