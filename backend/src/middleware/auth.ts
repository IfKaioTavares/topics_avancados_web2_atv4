import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'iot-jwt-secret-key-2025';
const ADMIN_EMAIL = 'admin@ifba.edu.br';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('123456', 10);

export interface AuthRequest extends Request {
  user?: {
    email: string;
    exp: number;
  };
}

export function generateToken(email: string): string {
  return jwt.sign(
    { email },
    JWT_SECRET,
    { expiresIn: '15m' }
  );
}

export function verifyPassword(password: string): boolean {
  return bcrypt.compareSync(password, ADMIN_PASSWORD_HASH);
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log(`🚫 JWT - Token ausente: ${req.method} ${req.path} - IP: ${req.ip}`);
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    console.log(`✅ JWT - Acesso autorizado: ${req.method} ${req.path} - User: ${decoded.email}`);
    next();
  } catch (error: any) {
    console.log(`🚫 JWT - Token inválido: ${req.method} ${req.path} - Error: ${error.message}`);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', expired: true });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log(`ℹ️ Acesso público: ${req.method} ${req.path} - IP: ${req.ip}`);
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    console.log(`✅ JWT - Acesso com token: ${req.method} ${req.path} - User: ${decoded.email}`);
  } catch (error) {
    console.log(`⚠️ JWT - Token inválido ignorado: ${req.method} ${req.path}`);
  }
  
  next();
}
