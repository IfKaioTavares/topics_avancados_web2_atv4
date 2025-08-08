import mqtt from 'mqtt';

const client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');

client.on('connect', () => {
  console.log('Sensor de temperatura conectado');
  setInterval(() => {
    const value = 20 + Math.random() * 15;
    const payload = value.toFixed(2);
    client.publish('sensors/temperature', payload);
    console.log(`Temperatura enviada: ${payload}°C`);
  }, 10000);
});