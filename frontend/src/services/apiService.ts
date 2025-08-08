import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface LoginResponse {
  success: boolean;
  token: string;
  expiresIn: number;
  user: { email: string };
}

export interface RefreshResponse {
  success: boolean;
  token: string;
  expiresIn: number;
  user: { email: string };
}

export interface SensorData {
  id: string;
  type: 'temperature' | 'gas' | 'light';
  value: number;
  timestamp: string;
}

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastDataTimestamp: number = 0;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Interceptor para adicionar token automaticamente
    this.api.interceptors.request.use((config: any) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Interceptor para tratar erro de token expirado
    this.api.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        if (error.response?.status === 401 && error.response?.data?.expired) {
          // Token expirou, tentar renovar
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Tentar novamente a requisição original
            error.config.headers.Authorization = `Bearer ${this.token}`;
            return this.api.request(error.config);
          } else {
            this.logout();
          }
        }
        return Promise.reject(error);
      }
    );

    // Carregar token salvo
    this.loadToken();
  }

  private loadToken() {
    const savedToken = localStorage.getItem('iot_token');
    const savedExpiry = localStorage.getItem('iot_token_expiry');
    
    if (savedToken && savedExpiry) {
      const expiryTime = parseInt(savedExpiry);
      const now = Date.now();
      
      if (now < expiryTime) {
        this.token = savedToken;
        this.startRefreshTimer(expiryTime - now);
      } else {
        this.clearStoredToken();
      }
    }
  }

  private saveToken(token: string, expiresIn: number) {
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem('iot_token', token);
    localStorage.setItem('iot_token_expiry', expiryTime.toString());
    this.token = token;
    this.startRefreshTimer((expiresIn * 1000) - 60000); // Renovar 1 minuto antes de expirar
  }

  private clearStoredToken() {
    localStorage.removeItem('iot_token');
    localStorage.removeItem('iot_token_expiry');
    this.token = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private startRefreshTimer(delay: number) {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    this.refreshTimer = setTimeout(async () => {
      await this.refreshToken();
    }, delay);
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await this.api.post('/auth/login', {
        email,
        password
      });
      
      const { token, expiresIn } = response.data;
      this.saveToken(token, expiresIn);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response: AxiosResponse<RefreshResponse> = await this.api.post('/auth/refresh');
      const { token, expiresIn } = response.data;
      this.saveToken(token, expiresIn);
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  logout() {
    this.clearStoredToken();
    // Não redirecionar aqui - deixar para o contexto
  }

  async verifyToken(): Promise<boolean> {
    try {
      await this.api.get('/auth/verify');
      return true;
    } catch (error) {
      this.clearStoredToken();
      return false;
    }
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  // Métodos da API dos sensores
  async getSensorData(type: string, limit: number = 50): Promise<SensorData[]> {
    const response = await this.api.get(`/sensors/${type}/latest?limit=${limit}`);
    return response.data;
  }

  async getAllSensorsData(limit: number = 50, startTime?: number): Promise<SensorData[]> {
    let url = `/sensors/latest?limit=${limit}`;
    if (startTime) {
      url += `&startTime=${new Date(startTime).toISOString()}`;
    }
    const response = await this.api.get(url);
    return response.data;
  }

  async getPrediction(type: string) {
    const response = await this.api.get(`/sensors/${type}/predict`);
    return response.data;
  }

  async getAnalysis(type: string) {
    const response = await this.api.get(`/sensors/${type}/analysis`);
    return response.data;
  }

  async getAlerts(type: string) {
    const response = await this.api.get(`/sensors/${type}/alerts`);
    return response.data;
  }

  // Funções de polling
  startPolling(
    onData: (data: SensorData[]) => void, 
    onError: (error: any) => void,
    startTime?: number,
    interval: number = 3000
  ) {
    this.lastDataTimestamp = startTime || Date.now() - (5 * 60 * 1000);
    
    const poll = async () => {
      try {
        const data = await this.getAllSensorsData(50, this.lastDataTimestamp);
        
        if (data.length > 0) {
          // Atualizar o último timestamp
          const latestTimestamp = Math.max(...data.map(d => new Date(d.timestamp).getTime()));
          this.lastDataTimestamp = latestTimestamp;
          
          onData(data);
        }
      } catch (error) {
        onError(error);
      }
    };

    // Primeira chamada imediata
    poll();
    
    // Configurar intervalo
    this.pollingInterval = setInterval(poll, interval);
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
