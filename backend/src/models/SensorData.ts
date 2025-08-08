/**
 * Interface que representa um registro de sensor armazenado no banco de dados.
 */
export interface SensorData {
  sensor_type: string;
  value: number;
  timestamp: Date;
}