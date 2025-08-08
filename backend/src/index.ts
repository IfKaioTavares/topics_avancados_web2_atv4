import { startServer } from './app';

const port = Number(process.env.PORT) || 3001;
const app = startServer();

app.listen(port, () => {
  console.log(`🚀 Servidor IoT rodando na porta ${port}`);
  console.log(`📡 Dashboard: http://localhost:3001`);
  console.log(`🔐 Autenticação JWT ativa (15 min)`);
});