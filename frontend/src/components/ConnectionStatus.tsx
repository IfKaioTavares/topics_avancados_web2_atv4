import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  reconnectAttempts: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  reconnectAttempts 
}) => {
  return (
    <div className="connection-status">
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        <div className="status-dot"></div>
        <span className="status-text">
          {isConnected ? 'Conectado' : 'Desconectado'}
        </span>
      </div>
      {!isConnected && reconnectAttempts > 0 && (
        <small className="reconnect-info">
          Tentativas de reconexão: {reconnectAttempts}
        </small>
      )}
    </div>
  );
};

export default ConnectionStatus;
