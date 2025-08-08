import { Request, Response, NextFunction } from 'express';

const AUTH_TOKEN = process.env.AUTH_TOKEN || 'iot-token-2025-secure';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log(`🚫 Acesso negado - Token ausente: ${req.method} ${req.path} - IP: ${req.ip}`);
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  if (token !== AUTH_TOKEN) {
    console.log(`🚫 Acesso negado - Token inválido: ${req.method} ${req.path} - IP: ${req.ip} - Token: ${token}`);
    return res.status(403).json({ error: 'Token inválido' });
  }

  console.log(`✅ Acesso autorizado: ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token && token !== AUTH_TOKEN) {
    console.log(`🚫 Token inválido fornecido: ${req.method} ${req.path} - IP: ${req.ip}`);
    return res.status(403).json({ error: 'Token inválido' });
  }

  if (token) {
    console.log(`✅ Acesso com token válido: ${req.method} ${req.path} - IP: ${req.ip}`);
  } else {
    console.log(`ℹ️ Acesso público: ${req.method} ${req.path} - IP: ${req.ip}`);
  }
  
  next();
}
