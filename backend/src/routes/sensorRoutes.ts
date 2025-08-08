import { Router } from 'express';
import db from '../db';
import { getMovingAverage, predictNextValue, checkConsecutiveHighValues } from '../services/predictionService';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

router.post('/auth/validate', authenticateToken, (req, res) => {
  res.json({ 
    message: 'Token válido', 
    timestamp: new Date().toISOString(),
    authenticated: true 
  });
});

router.get('/auth/info', (req, res) => {
  res.json({ 
    message: 'Para acessar rotas protegidas, use: Authorization: Bearer iot-token-2025-secure',
    protectedRoutes: [
      'GET /api/sensors/:type/predict',
      'GET /api/sensors/:type/analysis', 
      'GET /api/sensors/:type/alerts'
    ],
    publicRoutes: [
      'GET /api/sensors/:type/latest'
    ]
  });
});

/**
 * Retorna os últimos valores de um determinado sensor.
 * Exemplo: GET /api/sensors/temperature/latest?limit=50
 */
router.get('/:type/latest', optionalAuth, async (req, res) => {
  const type = req.params.type;
  const limit = Number(req.query.limit) || 50;
  try {
    const { rows } = await db.query(
      'SELECT value, timestamp FROM sensors_data WHERE sensor_type = $1 ORDER BY timestamp DESC LIMIT $2',
      [type, limit]
    );
    res.json(rows.reverse());
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao obter dados' });
  }
});

/**
 * Fornece uma previsão simples (média móvel) para o próximo valor do sensor.
 * Exemplo: GET /api/sensors/temperature/predict
 */
router.get('/:type/predict', authenticateToken, async (req, res) => {
  const type = req.params.type;
  try {
    const predicted = await getMovingAverage(type);
    res.json({ predictedValue: predicted });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar previsão' });
  }
});

/**
 * Fornece análise preditiva avançada com tendência
 * Exemplo: GET /api/sensors/temperature/analysis
 */
router.get('/:type/analysis', authenticateToken, async (req, res) => {
  const type = req.params.type;
  try {
    const analysis = await predictNextValue(type);
    res.json(analysis);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar análise' });
  }
});

/**
 * Verifica se os dois últimos valores registrados estão acima do limite.
 * Exemplo: GET /api/sensors/gas/alerts
 */
router.get('/:type/alerts', authenticateToken, async (req, res) => {
  const type = req.params.type;
  try {
    const alertData = await checkConsecutiveHighValues(type);
    res.json(alertData);
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao verificar alertas' });
  }
});

export default router;