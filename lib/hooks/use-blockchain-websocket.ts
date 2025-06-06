import { useEffect, useRef, useState, useCallback } from 'react';

export interface BlockchainWebSocketConfig {
  chainId: number;
  eventTypes: string[];
  onMessage?: (event: MessageEvent) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export interface WebSocketStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  reconnectCount: number;
}

export function useBlockchainWebSocket(config: BlockchainWebSocketConfig) {
  const {
    chainId,
    eventTypes,
    onMessage,
    onError,
    onOpen,
    onClose,
    reconnectAttempts = 5,
    reconnectDelay = 3000
  } = config;

  const [status, setStatus] = useState<WebSocketStatus>({
    connected: false,
    connecting: false,
    error: null,
    reconnectCount: 0
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectCountRef = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus(prev => ({ ...prev, connecting: true, error: null }));

    try {
      // Mock WebSocket URL - in production this would be a real blockchain WebSocket endpoint
      const wsUrl = `ws://localhost:8080/blockchain/${chainId}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`[BlockchainWebSocket] Connected to chain ${chainId}`);
        setStatus(prev => ({ 
          ...prev, 
          connected: true, 
          connecting: false,
          error: null
        }));
        reconnectCountRef.current = 0;

        // Subscribe to events
        ws.send(JSON.stringify({
          type: 'subscribe',
          events: eventTypes
        }));

        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log(`[BlockchainWebSocket] Message received:`, data);
          onMessage?.(event);
        } catch (error) {
          console.error('[BlockchainWebSocket] Failed to parse message:', error);
        }
      };

      ws.onclose = () => {
        console.log('[BlockchainWebSocket] Connection closed');
        setStatus(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false 
        }));

        wsRef.current = null;
        onClose?.();

        // Attempt reconnection if under limit
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          setStatus(prev => ({ 
            ...prev, 
            reconnectCount: reconnectCountRef.current 
          }));

          console.log(`[BlockchainWebSocket] Reconnecting in ${reconnectDelay}ms (attempt ${reconnectCountRef.current}/${reconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectDelay);
        } else {
          console.error('[BlockchainWebSocket] Max reconnection attempts reached');
          setStatus(prev => ({ 
            ...prev, 
            error: 'Max reconnection attempts reached' 
          }));
        }
      };

      ws.onerror = (error) => {
        console.error('[BlockchainWebSocket] WebSocket error:', error);
        setStatus(prev => ({ 
          ...prev, 
          error: 'WebSocket connection error',
          connecting: false
        }));
        onError?.(error);
      };

      wsRef.current = ws;

    } catch (error) {
      console.error('[BlockchainWebSocket] Failed to create WebSocket connection:', error);
      setStatus(prev => ({ 
        ...prev, 
        error: 'Failed to create connection',
        connecting: false
      }));
    }
  }, [chainId, eventTypes, onMessage, onError, onOpen, onClose, reconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus({
      connected: false,
      connecting: false,
      error: null,
      reconnectCount: 0
    });
    reconnectCountRef.current = 0;
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('[BlockchainWebSocket] Cannot send message: WebSocket not connected');
    return false;
  }, []);

  // Auto-connect on mount and when config changes
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    connect,
    disconnect,
    sendMessage,
    isConnected: status.connected,
    isConnecting: status.connecting,
    error: status.error,
    reconnectCount: status.reconnectCount
  };
} 