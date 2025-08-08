import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SensorData } from '../services/socketService';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface SensorChartProps {
  sensorData: SensorData[];
  sensorType: 'temperature' | 'gas' | 'light';
  title: string;
  color: string;
  unit: string;
}

const SensorChart: React.FC<SensorChartProps> = ({ 
  sensorData, 
  sensorType, 
  title, 
  color, 
  unit 
}) => {
  const chartRef = useRef<ChartJS<'line'> | null>(null);

  const filteredData = sensorData
    .filter(data => data.type === sensorType)
    .slice(-30); // Aumentado para 30 pontos para melhor visualização

  // Debug: log dos dados filtrados
  useEffect(() => {
    console.log(`Dados filtrados para ${sensorType}:`, filteredData.length);
  }, [filteredData, sensorType]);

  // Verificar se há alerta (últimos dois valores acima do limite)
  const checkAlert = () => {
    if (filteredData.length < 2) return false;
    
    let limit = Infinity;
    switch (sensorType) {
      case 'temperature': limit = 30; break;
      case 'gas': limit = 50; break;
      case 'light': limit = 800; break;
    }
    
    const lastTwo = filteredData.slice(-2);
    return lastTwo.every(data => data.value > limit);
  };

  // Calcular tendência simples
  const calculateTrend = () => {
    if (filteredData.length < 5) return 'stable';
    
    const recent = filteredData.slice(-5);
    const values = recent.map(d => d.value);
    const firstHalf = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const secondHalf = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
    
    const diff = secondHalf - firstHalf;
    if (Math.abs(diff) < 1) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  };

  const hasAlert = checkAlert();
  const trend = calculateTrend();
  const trendColor = trend === 'increasing' ? '#e74c3c' : trend === 'decreasing' ? '#3498db' : '#95a5a6';
  const trendIcon = trend === 'increasing' ? '📈' : trend === 'decreasing' ? '📉' : '➡️';

  const chartData: ChartData<'line'> = {
    labels: filteredData.map(data => 
      new Date(data.timestamp).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    ),
    datasets: [
      {
        label: `${title} (${unit})`,
        data: filteredData.map(data => data.value),
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: '#e0e0e0',
        },
      },
      x: {
        grid: {
          color: '#e0e0e0',
        },
      },
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 6,
      },
    },
    animation: {
      duration: 300,
    },
  };

  useEffect(() => {
    // Atualizar o gráfico quando novos dados chegarem
    if (chartRef.current) {
      chartRef.current.update('none');
    }
  }, [sensorData]);

  return (
    <div className={`sensor-chart ${hasAlert ? 'sensor-alert' : ''}`}>
      <div className="sensor-header">
        <h3>{title}</h3>
        <div className="trend-indicator" style={{ color: trendColor }}>
          {trendIcon} {trend === 'increasing' ? 'Crescente' : trend === 'decreasing' ? 'Decrescente' : 'Estável'}
        </div>
      </div>
      
      {hasAlert && (
        <div className="alert-banner">
          ⚠️ ALERTA: Valores consecutivos acima do limite!
        </div>
      )}
      
      <div style={{ height: '300px', width: '100%' }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
      {filteredData.length > 0 && (
        <div className="current-value">
          <h4>Valor Atual: {filteredData[filteredData.length - 1].value.toFixed(2)} {unit}</h4>
          <small>
            Atualizado em: {' '}
            {new Date(filteredData[filteredData.length - 1].timestamp).toLocaleString('pt-BR')}
          </small>
        </div>
      )}
      
      <style>{`
        .sensor-chart {
          background: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin: 10px 0;
        }
        
        .sensor-chart.sensor-alert {
          border: 2px solid #e74c3c;
          box-shadow: 0 0 15px rgba(231, 76, 60, 0.3);
        }
        
        .sensor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .sensor-header h3 {
          margin: 0;
          color: #2c3e50;
        }
        
        .trend-indicator {
          font-size: 14px;
          font-weight: bold;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .alert-banner {
          background: #e74c3c;
          color: white;
          padding: 8px;
          border-radius: 4px;
          text-align: center;
          margin-bottom: 10px;
          font-weight: bold;
          animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .current-value {
          margin-top: 10px;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 4px;
        }
        
        .current-value h4 {
          margin: 0 0 5px 0;
          color: #2c3e50;
        }
        
        .current-value small {
          color: #6c757d;
        }
      `}</style>
    </div>
  );
};

export default SensorChart;
