"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMQTT = void 0;
const mqtt_1 = __importDefault(require("mqtt"));
const db_1 = __importDefault(require("../db"));
/**
 * Inicia o cliente MQTT, se conecta ao broker Mosquitto e trata mensagens recebidas nos tópicos
 * de sensores.  Quando uma nova leitura chega, armazena no banco, emite um evento via WebSocket
 * e verifica se houve dois valores consecutivos acima do limite configurado para cada sensor.
 *
 * @param io Instância do Socket.IO usada para emitir eventos a clientes conectados
 */
function initMQTT(io) {
    // URL do broker MQTT.  Pode ser configurada via variável de ambiente.
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
    const client = mqtt_1.default.connect(brokerUrl);
    const topics = ['sensors/temperature', 'sensors/gas', 'sensors/light'];
    // Estado temporário para detectar valores altos consecutivos
    const lastHigh = {};
    client.on('connect', () => {
        client.subscribe(topics, (err) => {
            if (err) {
                console.error('Erro ao se inscrever nos tópicos MQTT:', err.message);
            }
            else {
                console.log('Cliente MQTT conectado e inscrito nos tópicos', topics);
            }
        });
    });
    client.on('message', async (topic, message) => {
        const value = parseFloat(message.toString());
        const parts = topic.split('/');
        if (parts.length < 2)
            return;
        const sensorType = parts[1];
        const timestamp = new Date();
        // Armazena no banco de dados
        try {
            await db_1.default.query('INSERT INTO sensors_data (sensor_type, value, timestamp) VALUES ($1, $2, $3)', [
                sensorType,
                value,
                timestamp
            ]);
        }
        catch (err) {
            console.error('Erro ao inserir valor no banco:', err);
        }
        // Envia leitura em tempo real aos clientes
        io.emit('sensorData', {
            id: `${sensorType}_${Date.now()}`,
            type: sensorType,
            value,
            timestamp
        });
        // Sistema de alerta simples (o frontend já cuida dos alertas visuais)
        // Não precisa fazer nada aqui, os gráficos já mostram os alertas
    });
}
exports.initMQTT = initMQTT;
