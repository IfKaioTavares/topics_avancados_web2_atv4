import React, { useState, useEffect } from 'react';
import './AlertPanel.css';

interface Alert {
  id: string;
  sensorType: string;
  message: string;
  values?: number[];
  currentValue?: number;
  timestamp: Date;
  type: 'alert';
}

interface Prediction {
  id: string;
  sensorType: string;
  predictedValue: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timestamp: Date;
  type: 'prediction';
}

type Notification = Alert | Prediction;

const AlertPanel: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // const socket = socketService.getSocket();
    // if (!socket) return;

    // // Escutar alertas
    // socket.on('alert', (data: any) => {
    //   const alert: Alert = {
    //     id: `alert_${Date.now()}`,
    //     sensorType: data.sensorType,
    //     message: data.message,
    //     values: data.values,
    //     currentValue: data.currentValue,
    //     timestamp: new Date(data.timestamp),
    //     type: 'alert'
    //   };
      
    //   setNotifications(prev => [alert, ...prev.slice(0, 9)]); // Manter apenas 10 notificações
    // });

    // // Escutar previsões
    // socket.on('prediction', (data: any) => {
    //   const prediction: Prediction = {
    //     id: `prediction_${Date.now()}`,
    //     sensorType: data.sensorType,
    //     predictedValue: data.predictedValue,
    //     trend: data.trend,
    //     confidence: data.confidence,
    //     timestamp: new Date(data.timestamp),
    //     type: 'prediction'
    //   };
      
    //   setNotifications(prev => [prediction, ...prev.slice(0, 9)]);
    // });

    // return () => {
    //   socket.off('alert');
    //   socket.off('prediction');
    // };
  }, []);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getSensorDisplayName = (sensorType: string) => {
    switch (sensorType) {
      case 'temperature': return 'Temperatura';
      case 'gas': return 'Gás';
      case 'light': return 'Luminosidade';
      default: return sensorType;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return '#e74c3c';
      case 'decreasing': return '#3498db';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="alert-panel">
      <div className="alert-header">
        <h3>Alertas e Previsões</h3>
        {notifications.length > 0 && (
          <button onClick={clearNotifications} className="clear-btn">
            Limpar
          </button>
        )}
      </div>
      
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">Nenhuma notificação recente</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification ${notification.type}`}
            >
              {notification.type === 'alert' ? (
                <div className="alert-content">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-details">
                    <h4>{getSensorDisplayName(notification.sensorType)} - ALERTA</h4>
                    <p>{notification.message}</p>
                    <small>
                      Valor atual: {notification.currentValue?.toFixed(2) || 'N/A'} - {' '}
                      {notification.timestamp.toLocaleTimeString('pt-BR')}
                    </small>
                  </div>
                </div>
              ) : (
                <div className="prediction-content">
                  <div 
                    className="trend-icon"
                    style={{ color: getTrendColor(notification.trend) }}
                  >
                    {getTrendIcon(notification.trend)}
                  </div>
                  <div className="prediction-details">
                    <h4>{getSensorDisplayName(notification.sensorType)} - Previsão</h4>
                    <p>
                      Tendência: <strong style={{ color: getTrendColor(notification.trend) }}>
                        {notification.trend === 'increasing' ? 'Crescente' : 
                         notification.trend === 'decreasing' ? 'Decrescente' : 'Estável'}
                      </strong>
                    </p>
                    <p>
                      Próximo valor estimado: <strong>{notification.predictedValue.toFixed(2)}</strong>
                    </p>
                    <p>Confiança: {(notification.confidence * 100).toFixed(1)}%</p>
                    <small>{notification.timestamp.toLocaleTimeString('pt-BR')}</small>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlertPanel;
