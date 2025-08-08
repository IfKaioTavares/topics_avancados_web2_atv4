"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const sensorRoutes_1 = __importDefault(require("./routes/sensorRoutes"));
const mqttService_1 = require("./services/mqttService");
const db_1 = __importDefault(require("./db"));
/**
 * Cria e configura a aplicação Express e o servidor HTTP.
 * Este método encapsula a criação do servidor para permitir a inicialização
 * controlada e a integração com WebSockets.
 */
function startServer() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Endpoint básico para verificação
    app.get('/', (req, res) => res.send('API IoT está em execução'));
    // Rotas para sensores
    app.use('/api/sensors', sensorRoutes_1.default);
    // Cria servidor HTTP e instancia socket.io
    const server = http_1.default.createServer(app);
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: '*'
        }
    });
    // Inicia conexão MQTT e streaming de dados
    (0, mqttService_1.initMQTT)(io);
    // Garante que a tabela existe
    db_1.default.query(`CREATE TABLE IF NOT EXISTS sensors_data (
    id SERIAL PRIMARY KEY,
    sensor_type VARCHAR(50) NOT NULL,
    value REAL NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
  );`)
        .catch((err) => {
        console.error('Erro ao criar tabela sensors_data:', err);
    });
    return server;
}
exports.startServer = startServer;
exports.default = startServer;
