import { Router } from 'express';
import { generateToken, verifyPassword, authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

// Login - gera token JWT
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  if (email !== 'admin@ifba.edu.br' || !verifyPassword(password)) {
    console.log(`🚫 Login falhou - Email: ${email} - IP: ${req.ip}`);
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const token = generateToken(email);
  console.log(`✅ Login realizado - Email: ${email} - IP: ${req.ip}`);
  
  res.json({
    success: true,
    token,
    expiresIn: 900, // 15 minutos em segundos
    user: { email }
  });
});

// Refresh token - gera novo token
router.post('/refresh', authenticateJWT, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }

  const newToken = generateToken(req.user.email);
  console.log(`🔄 Token renovado - Email: ${req.user.email} - IP: ${req.ip}`);
  
  res.json({
    success: true,
    token: newToken,
    expiresIn: 900,
    user: { email: req.user.email }
  });
});

// Verificar token
router.get('/verify', authenticateJWT, (req: AuthRequest, res) => {
  res.json({
    success: true,
    user: req.user,
    message: 'Token válido'
  });
});

// Logout (cliente deve descartar o token)
router.post('/logout', (req, res) => {
  console.log(`👋 Logout - IP: ${req.ip}`);
  res.json({ success: true, message: 'Logout realizado' });
});

export default router;
