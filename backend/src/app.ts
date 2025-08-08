import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import sensorRoutes from './routes/sensorRoutes';
import { initMQTT } from './services/mqttService';
import db from './db';

export function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => res.json({
    message: 'API IoT está em execução',
    version: '1.0.0',
    authentication: {
      info: 'Algumas rotas requerem autenticação via Bearer Token',
      authInfoEndpoint: '/api/sensors/auth/info'
    },
    endpoints: {
      sensors: '/api/sensors/:type/latest',
      predictions: '/api/sensors/:type/predict (🔒)',
      analysis: '/api/sensors/:type/analysis (🔒)',
      alerts: '/api/sensors/:type/alerts (🔒)'
    }
  }));

  app.use('/api/sensors', sensorRoutes);

  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: {
      origin: '*'
    }
  });

  initMQTT(io);

  db.query(`CREATE TABLE IF NOT EXISTS sensors_data (
    id SERIAL PRIMARY KEY,
    sensor_type VARCHAR(50) NOT NULL,
    value REAL NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
  );`)
    .catch((err: any) => {
      console.error('Erro ao criar tabela sensors_data:', err);
    });

  return server;
}

export default startServer;