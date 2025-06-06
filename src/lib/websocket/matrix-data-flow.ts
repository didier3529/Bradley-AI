import { matrixColors } from '@/styles/design-tokens';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error' | 'reconnecting';

export interface MatrixWebSocketMessage<T = any> {
  id: string;
  type: string;
  payload: T;
  timestamp: number;
  source: 'server' | 'client';
}

export interface MatrixDataSubscription {
  id: string;
  channel: string;
  callback: (data: any) => void;
  isActive: boolean;
}

export interface MatrixConnectionMetrics {
  latency: number;
  reconnectAttempts: number;
  messagesReceived: number;
  messagesSent: number;
  connectionUptime: number;
  lastHeartbeat: number;
  errorCount: number;
}

export interface MatrixDataFlowConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  messageTimeout: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}

export class MatrixDataFlowSystem {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'disconnected';
  private subscriptions = new Map<string, MatrixDataSubscription>();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private metrics: MatrixConnectionMetrics;
  private config: MatrixDataFlowConfig;
  private listeners = new Set<(status: ConnectionStatus) => void>();
  private messageQueue: MatrixWebSocketMessage[] = [];
  private isReconnecting = false;

  constructor(config: Partial<MatrixDataFlowConfig> = {}) {
    this.config = {
      url: config.url || 'ws://localhost:8080',
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 10,
      heartbeatInterval: config.heartbeatInterval || 30000,
      messageTimeout: config.messageTimeout || 10000,
      enableLogging: config.enableLogging ?? true,
      enableMetrics: config.enableMetrics ?? true,
    };

    this.metrics = {
      latency: 0,
      reconnectAttempts: 0,
      messagesReceived: 0,
      messagesSent: 0,
      connectionUptime: 0,
      lastHeartbeat: Date.now(),
      errorCount: 0,
    };

    // Auto-connect if URL is provided and we're on the client side
    if (this.config.url && typeof window !== 'undefined') {
      this.connect();
    }
  }

  /**
   * Establish WebSocket connection with Matrix aesthetics
   */
  public async connect(): Promise<void> {
    // SSR safety check
    if (typeof window === 'undefined') {
      console.log('🔌 WebSocket connection skipped during SSR');
      return;
    }
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.log('Connection already established', 'info');
      return;
    }

    this.setStatus('connecting');
    this.log('🌐 Initializing Matrix data connection...', 'matrix');

    try {
      this.ws = new WebSocket(this.config.url);
      this.setupEventListeners();
      
      // Connection timeout
      const connectionTimeout = setTimeout(() => {
        if (this.status === 'connecting') {
          this.handleConnectionError('Connection timeout');
        }
      }, 10000);

      return new Promise((resolve, reject) => {
        const onOpen = () => {
          clearTimeout(connectionTimeout);
          this.ws?.removeEventListener('open', onOpen);
          this.ws?.removeEventListener('error', onError);
          resolve();
        };

        const onError = (error: Event) => {
          clearTimeout(connectionTimeout);
          this.ws?.removeEventListener('open', onOpen);
          this.ws?.removeEventListener('error', onError);
          reject(error);
        };

        this.ws?.addEventListener('open', onOpen);
        this.ws?.addEventListener('error', onError);
      });
    } catch (error) {
      this.handleConnectionError(error);
      throw error;
    }
  }

  /**
   * Gracefully disconnect
   */
  public disconnect(): void {
    this.log('🔌 Disconnecting Matrix data flow...', 'matrix');
    this.isReconnecting = false;
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.setStatus('disconnected');
  }

  /**
   * Subscribe to data channel with Matrix styling
   */
  public subscribe<T = any>(
    channel: string,
    callback: (data: T) => void
  ): () => void {
    const id = `${channel}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const subscription: MatrixDataSubscription = {
      id,
      channel,
      callback,
      isActive: true,
    };

    this.subscriptions.set(id, subscription);
    this.log(`📡 Subscribed to channel: ${channel}`, 'matrix');

    // Send subscription message if connected
    if (this.status === 'connected') {
      this.send({
        id: `sub_${id}`,
        type: 'subscribe',
        payload: { channel },
        timestamp: Date.now(),
        source: 'client',
      });
    }

    // Return unsubscribe function
    return () => this.unsubscribe(id);
  }

  /**
   * Unsubscribe from channel
   */
  public unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.isActive = false;
      this.subscriptions.delete(subscriptionId);
      
      // Send unsubscribe message if connected
      if (this.status === 'connected') {
        this.send({
          id: `unsub_${subscriptionId}`,
          type: 'unsubscribe',
          payload: { channel: subscription.channel },
          timestamp: Date.now(),
          source: 'client',
        });
      }

      this.log(`📡 Unsubscribed from channel: ${subscription.channel}`, 'matrix');
    }
  }

  /**
   * Send message through WebSocket
   */
  public send(message: MatrixWebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        this.metrics.messagesSent++;
        this.log(`📤 Sent: ${message.type}`, 'debug');
      } catch (error) {
        this.log(`❌ Failed to send message: ${error}`, 'error');
        this.metrics.errorCount++;
      }
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      this.log(`📥 Queued message: ${message.type}`, 'debug');
    }
  }

  /**
   * Get connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Get connection metrics
   */
  public getMetrics(): MatrixConnectionMetrics {
    return { ...this.metrics };
  }

  /**
   * Listen to status changes
   */
  public onStatusChange(listener: (status: ConnectionStatus) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.handleConnectionOpen();
    };

    this.ws.onmessage = (event) => {
      this.handleMessage(event);
    };

    this.ws.onclose = (event) => {
      this.handleConnectionClose(event);
    };

    this.ws.onerror = (error) => {
      this.handleConnectionError(error);
    };
  }

  /**
   * Handle successful connection
   */
  private handleConnectionOpen(): void {
    this.log('✅ Matrix data flow established', 'success');
    this.setStatus('connected');
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    
    // Send queued messages
    this.flushMessageQueue();
    
    // Resubscribe to channels
    this.resubscribeChannels();
    
    // Start heartbeat
    this.startHeartbeat();
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: MatrixWebSocketMessage = JSON.parse(event.data);
      this.metrics.messagesReceived++;
      this.metrics.lastHeartbeat = Date.now();
      
      this.log(`📨 Received: ${message.type}`, 'debug');

      // Handle heartbeat responses
      if (message.type === 'heartbeat') {
        const latency = Date.now() - message.timestamp;
        this.metrics.latency = latency;
        return;
      }

      // Route message to subscribers
      this.routeMessage(message);
    } catch (error) {
      this.log(`❌ Failed to parse message: ${error}`, 'error');
      this.metrics.errorCount++;
    }
  }

  /**
   * Handle connection close
   */
  private handleConnectionClose(event: CloseEvent): void {
    this.log(`🔌 Connection closed: ${event.code} - ${event.reason}`, 'warning');
    this.clearTimers();
    
    if (!this.isReconnecting && event.code !== 1000) {
      this.attemptReconnection();
    } else {
      this.setStatus('disconnected');
    }
  }

  /**
   * Handle connection errors
   */
  private handleConnectionError(error: any): void {
    this.log(`❌ Connection error: ${error}`, 'error');
    this.metrics.errorCount++;
    this.setStatus('error');
    
    if (!this.isReconnecting) {
      this.attemptReconnection();
    }
  }

  /**
   * Attempt reconnection with exponential backoff
   */
  private attemptReconnection(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('❌ Max reconnection attempts reached', 'error');
      this.setStatus('error');
      return;
    }

    this.isReconnecting = true;
    this.setStatus('reconnecting');
    this.reconnectAttempts++;
    
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );

    this.log(`🔄 Reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${delay}ms`, 'warning');

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        this.attemptReconnection();
      });
    }, delay);
  }

  /**
   * Set connection status and notify listeners
   */
  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.log(`🔄 Status changed: ${status}`, 'matrix');
      
      // Notify listeners
      this.listeners.forEach(listener => {
        try {
          listener(status);
        } catch (error) {
          this.log(`❌ Status listener error: ${error}`, 'error');
        }
      });
    }
  }

  /**
   * Route message to appropriate subscribers
   */
  private routeMessage(message: MatrixWebSocketMessage): void {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.isActive && message.type.includes(subscription.channel)) {
        try {
          subscription.callback(message.payload);
        } catch (error) {
          this.log(`❌ Subscription callback error: ${error}`, 'error');
        }
      }
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  /**
   * Resubscribe to all active channels
   */
  private resubscribeChannels(): void {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.isActive) {
        this.send({
          id: `resub_${subscription.id}`,
          type: 'subscribe',
          payload: { channel: subscription.channel },
          timestamp: Date.now(),
          source: 'client',
        });
      }
    }
  }

  /**
   * Start heartbeat timer
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.status === 'connected') {
        this.send({
          id: `heartbeat_${Date.now()}`,
          type: 'heartbeat',
          payload: {},
          timestamp: Date.now(),
          source: 'client',
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Matrix-styled logging
   */
  private log(message: string, level: 'debug' | 'info' | 'warning' | 'error' | 'success' | 'matrix'): void {
    if (!this.config.enableLogging) return;

    const colors = {
      debug: '#666666',
      info: '#ffffff',
      warning: '#ffaa00',
      error: '#ff0040',
      success: matrixColors.matrixGreen,
      matrix: matrixColors.cyberBlue,
    };

    const styles = `color: ${colors[level]}; font-family: monospace; font-weight: bold;`;
    
    console.log(`%c[MatrixDataFlow] ${message}`, styles);
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.disconnect();
    this.subscriptions.clear();
    this.listeners.clear();
    this.messageQueue.length = 0;
  }
}

// Singleton instance for app-wide usage
let matrixDataFlowInstance: MatrixDataFlowSystem | null = null;

export function getMatrixDataFlow(config?: Partial<MatrixDataFlowConfig>): MatrixDataFlowSystem {
  if (!matrixDataFlowInstance) {
    matrixDataFlowInstance = new MatrixDataFlowSystem(config);
  }
  return matrixDataFlowInstance;
}

export function resetMatrixDataFlow(): void {
  if (matrixDataFlowInstance) {
    matrixDataFlowInstance.destroy();
    matrixDataFlowInstance = null;
  }
}

export default MatrixDataFlowSystem; 