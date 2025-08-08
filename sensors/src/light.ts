import mqtt from 'mqtt';

const client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');

client.on('connect', () => {
  console.log('Sensor de luz conectado');
  setInterval(() => {
    const value = Math.random() * 1000;
    const payload = value.toFixed(2);
    client.publish('sensors/light', payload);
    console.log(`Luz enviada: ${payload} lux`);
  }, 12000);
});