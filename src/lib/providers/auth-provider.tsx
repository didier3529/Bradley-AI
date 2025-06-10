"use client";

import { apiClient } from '@/lib/api/config';
import { NetworkType } from '@/types/blockchain';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

// Constants
const TOKEN_KEY = 'auth_token';
const WALLET_KEY = 'wallet_address';
const TOKEN_VERIFY_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Types
interface User {
  id: string;
  address: string;
  networks: NetworkType[];
  preferences: {
    defaultNetwork: NetworkType;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  error: Error | null;
  login: (address: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Check browser environment safely
const isBrowser = typeof window !== 'undefined';

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize with consistent state to prevent hydration mismatches
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false, // Changed to false to prevent hydration mismatch
    isInitialized: false,
    isAuthenticated: false,
    error: null,
  });

  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const verifyInterval = useRef<NodeJS.Timeout>();
  const isInitializing = useRef(false);

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Debug logging
  const logDebug = useCallback((message: string, data?: Record<string, unknown> | Error | null) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Auth] ${message}`, data ? data : '');
    }
  }, []);

  // Token verification
  const verifyToken = useCallback(async () => {
    // Skip verification if not in browser or not mounted
    if (!isBrowser || !isMounted) {
      return false;
    }

    try {
      const token = Cookies.get(TOKEN_KEY);
      if (!token) {
        logDebug('No token found');
        return false;
      }

      // Set token in API client
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Verify token with API
      const { data } = await apiClient.post('/api/auth/verify');

      if (!data?.valid) {
        logDebug('Token invalid');
        throw new Error('Invalid token');
      }

      return true;
    } catch (error) {
      logDebug('Token verification failed', error);
      // Clear invalid token
      if (isBrowser) {
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(WALLET_KEY);
        delete apiClient.defaults.headers.common['Authorization'];
      }
      return false;
    }
  }, [logDebug, isMounted]);

  // Login function
  const login = useCallback(async (address: string) => {
    if (!isBrowser || !isMounted) {
      return false;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      logDebug('Initiating login', { address });

      // Get message to sign
      const { data: messageData } = await apiClient.get(`/api/auth/message?address=${address}`);
      const message = messageData.message;

      // Request signature from wallet
      if (!window.ethereum) {
        throw new Error('Browser or ethereum provider not available');
      }

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Authenticate with backend
      const { data: authData } = await apiClient.post('/api/auth/wallet', {
        address,
        signature,
        message,
      });

      if (!authData?.token || !authData?.user) {
        throw new Error('Invalid authentication response');
      }

      // Store auth data in cookies
      Cookies.set(TOKEN_KEY, authData.token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      Cookies.set(WALLET_KEY, address, {
        expires: 7,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;

      // Update state
      setState(prev => ({
        ...prev,
        user: authData.user,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
        error: null,
      }));

      logDebug('Login successful', { userId: authData.user.id });
      return true;
    } catch (error) {
      logDebug('Login failed', error);
      // Clear any partial auth data
      if (isBrowser) {
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(WALLET_KEY);
        delete apiClient.defaults.headers.common['Authorization'];
      }

      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: error instanceof Error ? error : new Error('Login failed'),
      }));

      return false;
    }
  }, [logDebug, isMounted]);

  // Logout function
  const logout = useCallback(async () => {
    if (isBrowser) {
      Cookies.remove(TOKEN_KEY);
      Cookies.remove(WALLET_KEY);
      delete apiClient.defaults.headers.common['Authorization'];
    }

    setState({
      user: null,
      isLoading: false,
      isInitialized: true,
      isAuthenticated: false,
      error: null,
    });

    if (isBrowser) {
      router.replace('/');
    }
  }, [router]);

  // Initialize auth state - only after mounting to prevent hydration issues
  useEffect(() => {
    // Skip initialization if not mounted or already initialized
    if (!isMounted || state.isInitialized || isInitializing.current) {
      return;
    }

    const initAuth = async () => {
      try {
        isInitializing.current = true;
        setState(prev => ({ ...prev, isLoading: true }));

        const token = Cookies.get(TOKEN_KEY);
        if (!token) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isInitialized: true
          }));
          isInitializing.current = false;
          return;
        }

        const isValid = await verifyToken();
        if (!isValid) {
          throw new Error('Invalid token');
        }

        // If token is valid, fetch user data
        const { data: userData } = await apiClient.get('/api/auth/me');

        setState({
          user: userData,
          isLoading: false,
          isInitialized: true,
          isAuthenticated: true,
          error: null,
        });

        logDebug('Auth initialized successfully', { userId: userData.id });
      } catch (error) {
        console.error('Auth initialization failed:', error);

        // Clear invalid auth data
        if (isBrowser) {
          Cookies.remove(TOKEN_KEY);
          Cookies.remove(WALLET_KEY);
          delete apiClient.defaults.headers.common['Authorization'];
        }

        setState({
          user: null,
          isLoading: false,
          isInitialized: true,
          isAuthenticated: false,
          error: error instanceof Error ? error : new Error('Auth initialization failed'),
        });
      } finally {
        isInitializing.current = false;
      }
    };

    initAuth();
  }, [verifyToken, logDebug, isMounted, state.isInitialized]);

  // Setup token verification interval
  useEffect(() => {
    if (!isMounted || !state.isAuthenticated) {
      return;
    }

    verifyInterval.current = setInterval(() => {
      verifyToken().then(isValid => {
        if (!isValid) {
          logout();
        }
      });
    }, TOKEN_VERIFY_INTERVAL);

    return () => {
      if (verifyInterval.current) {
        clearInterval(verifyInterval.current);
      }
    };
  }, [state.isAuthenticated, verifyToken, logout, isMounted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (verifyInterval.current) {
        clearInterval(verifyInterval.current);
      }
    };
  }, []);

  const value = {
    user: state.user,
    isLoading: state.isLoading,
    isInitialized: state.isInitialized,
    isAuthenticated: state.isAuthenticated,
    error: state.error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
