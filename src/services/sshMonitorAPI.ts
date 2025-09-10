import { SSHSession } from '@/types/ssh';

const API_BASE_URL = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3002';

export interface LiveConnection {
  remoteIP: string;
  remotePort: string;
  localAddr?: string;
  status: string;
  timestamp: string;
  isLocal?: boolean;
}

export interface SSHSummaryResponse {
  success: boolean;
  data?: string;
  error?: string;
  fileSize?: number;
  reportGeneratedDate?: string;
}

export interface LiveConnectionsResponse {
  success: boolean;
  connections: LiveConnection[];
  count: number;
  error?: string;
}

export interface GenerateReportResponse {
  success: boolean;
  message?: string;
  data?: string;
  output?: string;
  error?: string;
}

class SSHMonitorAPI {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners: ((data: any) => void)[] = [];

  async loadSSHSummary(): Promise<SSHSummaryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/ssh-summary`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch SSH summary: ${error}`
      };
    }
  }

  async generateReport(): Promise<GenerateReportResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-report`, {
        method: 'POST'
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate report: ${error}`
      };
    }
  }

  async getLiveConnections(): Promise<LiveConnectionsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/live-connections`);
      return await response.json();
    } catch (error) {
      return {
        success: false,
        connections: [],
        count: 0,
        error: `Failed to fetch live connections: ${error}`
      };
    }
  }

  connectWebSocket(onMessage: (data: any) => void): void {
    this.listeners.push(onMessage);
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      this.ws = new WebSocket(WS_URL);
      
      this.ws.onopen = () => {
        console.log('Connected to SSH Monitor WebSocket');
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.listeners.forEach(listener => listener(data));
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('SSH Monitor WebSocket disconnected');
        this.scheduleReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('SSH Monitor WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      this.connectWebSocket(() => {}); // Reconnect with existing listeners
    }, 5000);
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.listeners = [];
  }

  removeListener(listener: (data: any) => void): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
}

export const sshMonitorAPI = new SSHMonitorAPI();
