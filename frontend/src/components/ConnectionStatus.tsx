import React from 'react';

interface ConnectionStatusProps {
  isConnected: boolean;
  reconnectAttempts: number;
  isAuthenticated?: boolean;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  reconnectAttempts,
  isAuthenticated = true
}) => {
  // Se não estiver autenticado, não mostrar status de conexão
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="connection-status">
      <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
        <div className="status-dot"></div>
        <span className="status-text">
          {isConnected ? 'Dados Atualizados' : 'Aguardando Dados'}
        </span>
      </div>
      {!isConnected && reconnectAttempts > 0 && (
        <small className="reconnect-info">
          Tentativas: {reconnectAttempts}
        </small>
      )}
    </div>
  );
};

export default ConnectionStatus;
