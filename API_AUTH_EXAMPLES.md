# Exemplos de uso da API com autenticação

## 🔓 Rotas Públicas (sem token)
curl http://localhost:3000/api/sensors/temperature/latest?limit=10

curl http://localhost:3000/api/sensors/auth/info

## 🔒 Rotas Protegidas (requerem token)

# Testar token válido
curl -H "Authorization: Bearer iot-token-2025-secure" \
     http://localhost:3000/api/sensors/temperature/predict

curl -H "Authorization: Bearer iot-token-2025-secure" \
     http://localhost:3000/api/sensors/temperature/analysis

curl -H "Authorization: Bearer iot-token-2025-secure" \
     http://localhost:3000/api/sensors/gas/alerts

# Validar token
curl -X POST -H "Authorization: Bearer iot-token-2025-secure" \
     http://localhost:3000/api/sensors/auth/validate

## ❌ Teste com token inválido (deve retornar erro 403)
curl -H "Authorization: Bearer token-incorreto" \
     http://localhost:3000/api/sensors/temperature/predict

## ❌ Teste sem token (deve retornar erro 401)
curl http://localhost:3000/api/sensors/temperature/predict
