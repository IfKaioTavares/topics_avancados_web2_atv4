"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const predictionService_1 = require("../services/predictionService");
const router = (0, express_1.Router)();
/**
 * Retorna os últimos valores de um determinado sensor.
 * Exemplo: GET /api/sensors/temperature/latest?limit=50
 */
router.get('/:type/latest', async (req, res) => {
    const type = req.params.type;
    const limit = Number(req.query.limit) || 50;
    try {
        const { rows } = await db_1.default.query('SELECT value, timestamp FROM sensors_data WHERE sensor_type = $1 ORDER BY timestamp DESC LIMIT $2', [type, limit]);
        // Inverte a ordem para retornar em ordem cronológica ascendente
        res.json(rows.reverse());
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao obter dados' });
    }
});
/**
 * Fornece uma previsão simples (média móvel) para o próximo valor do sensor.
 * Exemplo: GET /api/sensors/temperature/predict
 */
router.get('/:type/predict', async (req, res) => {
    const type = req.params.type;
    try {
        const predicted = await (0, predictionService_1.getMovingAverage)(type);
        res.json({ predictedValue: predicted });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao gerar previsão' });
    }
});
/**
 * Fornece análise preditiva avançada com tendência
 * Exemplo: GET /api/sensors/temperature/analysis
 */
router.get('/:type/analysis', async (req, res) => {
    const type = req.params.type;
    try {
        const analysis = await (0, predictionService_1.predictNextValue)(type);
        res.json(analysis);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao gerar análise' });
    }
});
/**
 * Verifica se os dois últimos valores registrados estão acima do limite.
 * Exemplo: GET /api/sensors/gas/alerts
 */
router.get('/:type/alerts', async (req, res) => {
    const type = req.params.type;
    try {
        const alertData = await (0, predictionService_1.checkConsecutiveHighValues)(type);
        res.json(alertData);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao verificar alertas' });
    }
});
exports.default = router;
