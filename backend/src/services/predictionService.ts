import db from '../db';

/**
 * Calcula uma média móvel simples para os valores recentes de um sensor.
 * A previsão retornada é o valor médio dos últimos `windowSize` registros.
 *
 * @param sensorType Tipo de sensor (temperature, gas ou light)
 * @param windowSize Quantidade de valores considerados no cálculo da média
 */
export async function getMovingAverage(sensorType: string, windowSize: number = 5): Promise<number | null> {
  const { rows } = await db.query(
    'SELECT value FROM sensors_data WHERE sensor_type = $1 ORDER BY timestamp DESC LIMIT $2',
    [sensorType, windowSize]
  );
  if (!rows || rows.length === 0) {
    return null;
  }
  const values: number[] = rows.map((r) => Number(r.value));
  const sum = values.reduce((acc, v) => acc + v, 0);
  return sum / values.length;
}

/**
 * Analisa a tendência dos valores do sensor e prevê o próximo valor
 * usando regressão linear simples
 */
export async function predictNextValue(sensorType: string, windowSize: number = 10): Promise<{
  predictedValue: number | null;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
}> {
  const { rows } = await db.query(
    'SELECT value, timestamp FROM sensors_data WHERE sensor_type = $1 ORDER BY timestamp DESC LIMIT $2',
    [sensorType, windowSize]
  );

  if (!rows || rows.length < 3) {
    return { predictedValue: null, trend: 'stable', confidence: 0 };
  }

  const values = rows.map((r, index) => ({ x: index, y: Number(r.value) })).reverse();
  
  // Calcular regressão linear simples
  const n = values.length;
  const sumX = values.reduce((sum, point) => sum + point.x, 0);
  const sumY = values.reduce((sum, point) => sum + point.y, 0);
  const sumXY = values.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = values.reduce((sum, point) => sum + point.x * point.x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Prever próximo valor
  const predictedValue = slope * n + intercept;
  
  // Determinar tendência
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (Math.abs(slope) > 0.5) {
    trend = slope > 0 ? 'increasing' : 'decreasing';
  }
  
  // Calcular confiança baseada na correlação
  const meanY = sumY / n;
  const ssTotal = values.reduce((sum, point) => sum + Math.pow(point.y - meanY, 2), 0);
  const ssResidual = values.reduce((sum, point) => {
    const predicted = slope * point.x + intercept;
    return sum + Math.pow(point.y - predicted, 2);
  }, 0);
  
  const confidence = Math.max(0, Math.min(1, 1 - (ssResidual / ssTotal)));
  
  return { predictedValue, trend, confidence };
}

/**
 * Verifica se há dois valores consecutivos acima do limite para um sensor
 */
export async function checkConsecutiveHighValues(sensorType: string): Promise<{
  hasAlert: boolean;
  values: number[];
  limit: number;
}> {
  const { rows } = await db.query(
    'SELECT value FROM sensors_data WHERE sensor_type = $1 ORDER BY timestamp DESC LIMIT 2',
    [sensorType]
  );

  if (!rows || rows.length < 2) {
    return { hasAlert: false, values: [], limit: 0 };
  }

  const values = rows.map((r: any) => Number(r.value)).reverse();
  
  let limit = Infinity;
  switch (sensorType) {
    case 'temperature':
      limit = 30;
      break;
    case 'gas':
      limit = 50;
      break;
    case 'light':
      limit = 800;
      break;
  }

  const hasAlert = values.every(value => value > limit);
  
  return { hasAlert, values, limit };
}