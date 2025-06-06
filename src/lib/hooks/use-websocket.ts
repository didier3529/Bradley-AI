import { useEffect, useState, useCallback, useRef } from 'react';
import { getMatrixDataFlow, type ConnectionStatus, type MatrixConnectionMetrics } from '@/lib/websocket/matrix-data-flow';

export interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  enableLogging?: boolean;
  enableMetrics?: boolean;
}

export interface UseWebSocketReturn {
  status: ConnectionStatus;
  metrics: MatrixConnectionMetrics;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribe: <T = any>(channel: string, callback: (data: T) => void) => () => void;
  unsubscribe: (channel: string) => void;
  send: (type: string, payload: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    url = 'ws://localhost:8080',
    autoConnect = true,
    enableLogging = true,
    enableMetrics = true,
  } = options;

  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [metrics, setMetrics] = useState<MatrixConnectionMetrics>({
    latency: 0,
    reconnectAttempts: 0,
    messagesReceived: 0,
    messagesSent: 0,
    connectionUptime: 0,
    lastHeartbeat: Date.now(),
    errorCount: 0,
  });

  const dataFlowRef = useRef(getMatrixDataFlow({
    url,
    enableLogging,
    enableMetrics,
  }));
  const subscriptionsRef = useRef(new Map<string, () => void>());

  // Update status when connection status changes
  useEffect(() => {
    const dataFlow = dataFlowRef.current;
    
    const unsubscribeStatus = dataFlow.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // Update metrics periodically
    const metricsInterval = setInterval(() => {
      setMetrics(dataFlow.getMetrics());
    }, 1000);

    // Set initial status
    setStatus(dataFlow.getStatus());
    setMetrics(dataFlow.getMetrics());

    return () => {
      unsubscribeStatus();
      clearInterval(metricsInterval);
    };
  }, []);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && status === 'disconnected') {
      dataFlowRef.current.connect().catch((error) => {
        console.error('[useWebSocket] Auto-connect failed:', error);
      });
    }
  }, [autoConnect, status]);

  const connect = useCallback(async () => {
    try {
      await dataFlowRef.current.connect();
    } catch (error) {
      console.error('[useWebSocket] Connection failed:', error);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    dataFlowRef.current.disconnect();
    
    // Clean up all subscriptions
    subscriptionsRef.current.forEach((unsubscribe) => {
      unsubscribe();
    });
    subscriptionsRef.current.clear();
  }, []);

  const subscribe = useCallback(<T = any>(
    channel: string,
    callback: (data: T) => void
  ): (() => void) => {
    const dataFlow = dataFlowRef.current;
    const unsubscribe = dataFlow.subscribe(channel, callback);
    
    // Store the unsubscribe function for cleanup
    subscriptionsRef.current.set(channel, unsubscribe);
    
    return () => {
      unsubscribe();
      subscriptionsRef.current.delete(channel);
    };
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    const unsubscribeFunc = subscriptionsRef.current.get(channel);
    if (unsubscribeFunc) {
      unsubscribeFunc();
      subscriptionsRef.current.delete(channel);
    }
  }, []);

  const send = useCallback((type: string, payload: any) => {
    dataFlowRef.current.send({
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      timestamp: Date.now(),
      source: 'client',
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up all subscriptions
      subscriptionsRef.current.forEach((unsubscribe) => {
        unsubscribe();
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  return {
    status,
    metrics,
    isConnected: status === 'connected',
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
  };
} 