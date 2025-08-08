"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const port = Number(process.env.PORT) || 3001;
const server = (0, app_1.startServer)();
server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
