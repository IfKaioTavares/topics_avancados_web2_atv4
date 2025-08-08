import React, { useState, useEffect } from 'react';
import './App.css';
import SensorChart from './components/SensorChart';
import ConnectionStatus from './components/ConnectionStatus';
import socketService, { SensorData } from './services/socketService';

const App: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  useEffect(() => {
    // Conectar ao servidor Socket.io
    const socket = socketService.connect();

    // Eventos de conexão
    socket.on('connect', () => {
      setIsConnected(true);
      setReconnectAttempts(0);
      console.log('Conectado ao servidor IoT');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Desconectado do servidor IoT');
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
      setReconnectAttempts(prev => prev + 1);
      console.log('Erro de conexão com o servidor IoT');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      setReconnectAttempts(attemptNumber);
      console.log(`Tentativa de reconexão #${attemptNumber}`);
    });

    // Escutar dados dos sensores
    socketService.onSensorData((data: SensorData) => {
      console.log('Dados recebidos:', data); // Debug
      setSensorData(prevData => {
        const newData = [...prevData, data];
        // Manter apenas os últimos 200 pontos no total para ter mais histórico
        return newData.slice(-200);
      });
    });

    // Cleanup ao desmontar o componente
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dashboard IoT - Sensores em Tempo Real</h1>
        <ConnectionStatus 
          isConnected={isConnected} 
          reconnectAttempts={reconnectAttempts} 
        />
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

export default App;
