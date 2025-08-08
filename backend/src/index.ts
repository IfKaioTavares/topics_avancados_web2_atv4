import { startServer } from './app';

const port = Number(process.env.PORT) || 3001;
const server = startServer();

server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});