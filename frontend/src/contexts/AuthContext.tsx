import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthenticationStatus = async () => {
      try {
        const token = localStorage.getItem('iot_token');
        
        // Verificar se o token existe no localStorage OU se o apiService já tem um token
        if (token || apiService.isAuthenticated()) {
          const isValid = await apiService.verifyToken();
          setIsAuthenticated(isValid);
          
          if (isValid && window.location.pathname === '/login') {
            navigate('/dashboard', { replace: true });
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        localStorage.removeItem('iot_token');
        localStorage.removeItem('iot_token_expiry');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthenticationStatus();
  }, [navigate]);

  // Novo useEffect para monitorar mudanças de autenticação
  useEffect(() => {
    if (isAuthenticated && window.location.pathname === '/login') {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const login = async (email: string, password: string) => {
    try {
      await apiService.login(email, password);
      
      // Aguardar um pouco para garantir que o token seja salvo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setIsAuthenticated(true);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao fazer login' 
      };
    }
  };

  const logout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  const value = {
    isAuthenticated,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
