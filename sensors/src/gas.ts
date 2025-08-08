import mqtt from 'mqtt';

const client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883');

client.on('connect', () => {
  console.log('Sensor de gás conectado');
  setInterval(() => {
    const value = Math.random() * 100;
    const payload = value.toFixed(2);
    client.publish('sensors/gas', payload);
    console.log(`Gás enviado: ${payload} ppm`);
  }, 15000);
});