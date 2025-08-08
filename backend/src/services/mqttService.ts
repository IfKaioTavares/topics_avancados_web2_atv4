import mqtt from 'mqtt';
import db from '../db';

export function initMQTT() {
  const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
  const client = mqtt.connect(brokerUrl);

  const topics = ['sensors/temperature', 'sensors/gas', 'sensors/light'];

  client.on('connect', () => {
    client.subscribe(topics, (err) => {
      if (err) {
        console.error('Erro ao se inscrever nos tópicos MQTT:', err.message);
      } else {
        console.log('Cliente MQTT conectado e inscrito nos tópicos', topics);
      }
    });
  });

  client.on('message', async (topic: string, message: Buffer) => {
    const value = parseFloat(message.toString());
    const parts = topic.split('/');
    if (parts.length < 2) return;
    const sensorType = parts[1];
    const timestamp = new Date();

    try {
      await db.query('INSERT INTO sensors_data (sensor_type, value, timestamp) VALUES ($1, $2, $3)', [
        sensorType,
        value,
        timestamp
      ]);
      console.log(`📊 Dados salvos - ${sensorType}: ${value} (${timestamp.toISOString()})`);
    } catch (err) {
      console.error('Erro ao inserir valor no banco:', err);
    }
  });
}