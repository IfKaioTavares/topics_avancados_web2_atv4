import { io, Socket } from 'socket.io-client';

export interface SensorData {
  id: string;
  type: 'temperature' | 'gas' | 'light';
  value: number;
  timestamp: Date;
}

class SocketService {
  private socket: Socket | null = null;

  connect(serverUrl: string = 'http://localhost:3001'): Socket {
    if (!this.socket) {
      this.socket = io(serverUrl);
    }
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onSensorData(callback: (data: SensorData) => void): void {
    if (this.socket) {
      this.socket.on('sensorData', (data: any) => {
        // Garantir que os dados estão no formato correto
        const formattedData: SensorData = {
          id: data.id || `${data.type || data.sensorType}_${Date.now()}`,
          type: data.type || data.sensorType,
          value: data.value,
          timestamp: new Date(data.timestamp)
        };
        callback(formattedData);
      });
    }
  }

  offSensorData(callback?: (data: SensorData) => void): void {
    if (this.socket) {
      this.socket.off('sensorData', callback);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
