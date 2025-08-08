import React, { useState, useEffect } from 'react';
import SensorChart from './SensorChart';
import ConnectionStatus from './ConnectionStatus';
import { useAuth } from '../contexts/AuthContext';
import apiService, { SensorData } from '../services/apiService';

const Dashboard: React.FC = () => {
  const { logout } = useAuth();
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [pollingErrors, setPollingErrors] = useState<number>(0);

  useEffect(() => {
    const startPolling = () => {
      // Iniciar polling dos dados dos sensores
      const startTime = Date.now() - (5 * 60 * 1000); // Últimos 5 minutos
      
      apiService.startPolling(
        (data: SensorData[]) => {
          setSensorData(prevData => {
            // Combinar dados existentes com novos dados
            const combinedData = [...prevData, ...data];
            // Manter apenas os últimos 200 pontos e remover duplicatas por timestamp
            const uniqueData = combinedData
              .filter((item, index, arr) => 
                arr.findIndex(t => t.timestamp === item.timestamp && t.value === item.value) === index
              )
              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
              .slice(-200);
            
            return uniqueData;
          });
          
          // Só considera conectado se realmente recebeu dados
          if (data.length > 0) {
            setIsConnected(true);
          }
          setPollingErrors(0);
        },
        (error: any) => {
          setPollingErrors(prev => {
            const newErrorCount = prev + 1;
            // Não desconectar imediatamente - dar algumas tentativas
            if (newErrorCount > 3) {
              setIsConnected(false);
            }
            return newErrorCount;
          });
        },
        startTime
      );
    };

    const stopPolling = () => {
      apiService.stopPolling();
      setIsConnected(false);
    };

    startPolling();
    
    return () => {
      stopPolling();
    };
  }, []);

  const handleLogout = () => {
    apiService.stopPolling();
    setSensorData([]);
    setIsConnected(false);
    setPollingErrors(0);
    logout();
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dashboard IoT - Sensores em Tempo Real</h1>
        <div className="header-actions">
          <ConnectionStatus 
            isConnected={isConnected} 
            reconnectAttempts={pollingErrors}
            isAuthenticated={true}
          />
          <button onClick={handleLogout} className="logout-button">
            Sair
          </button>
        </div>
      </header>

      <main className="dashboard">
        <div className="charts-container">
          <div className="chart-wrapper">
            <SensorChart
              sensorData={sensorData}
              sensorType="temperature"
              title="Sensor de Temperatura"
              color="#ff6384"
              unit="°C"
            />
          </div>
          
          <div className="chart-wrapper">
            <SensorChart
              sensorData={sensorData}
              sensorType="gas"
              title="Sensor de Gás"
              color="#36a2eb"
              unit="ppm"
            />
          </div>
          
          <div className="chart-wrapper">
            <SensorChart
              sensorData={sensorData}
              sensorType="light"
              title="Sensor de Luminosidade"
              color="#ffce56"
              unit="lux"
            />
          </div>
        </div>

        <div className="stats-container">
          <div className="stat-card">
            <h3>Total de Leituras</h3>
            <span className="stat-value">{sensorData.length}</span>
          </div>
          
          <div className="stat-card">
            <h3>Status da Conexão</h3>
            <span className={`stat-value ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div className="stat-card">
            <h3>Última Atualização</h3>
            <span className="stat-value">
              {sensorData.length > 0 
                ? new Date(sensorData[sensorData.length - 1].timestamp).toLocaleTimeString('pt-BR')
                : '--:--:--'
              }
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
