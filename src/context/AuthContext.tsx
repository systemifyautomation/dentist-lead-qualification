import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface UserData {
  name: string;
  phone: string;
  role: 'admin' | 'super-admin' | 'utilisateur';
}

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  user: UserData | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_TOKEN_KEY = 'reactivationflow_auth_token';
const AUTH_USER_KEY = 'reactivationflow_auth_user';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth token on mount and listen for storage events
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUserData = localStorage.getItem(AUTH_USER_KEY);
      
      if (token && storedUserData) {
        try {
          // Verify token is valid (check expiration)
          const tokenData = JSON.parse(atob(token));
          if (tokenData.exp > Date.now()) {
            const userData = JSON.parse(storedUserData);
            setIsAuthenticated(true);
            setUser(userData);
          } else {
            // Token expired, clear it
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
          }
        } catch {
          // Invalid token, clear it
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(AUTH_USER_KEY);
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === AUTH_TOKEN_KEY || e.key === AUTH_USER_KEY) {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Sending login request to webhook...', { phone });
      
      // Send POST request to webhook for WhatsApp verification
      const response = await fetch(import.meta.env.VITE_WEBHOOK_LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          password,
          timestamp: new Date().toISOString()
        })
      });

      console.log('Webhook response status:', response.status);

      // Only proceed if we get 200 status (webhook validates credentials)
      if (response.status === 200) {
        console.log('Webhook approved login, creating session...');
        
        // Parse webhook response to get user data
        const responseData = await response.json();
        const userData: UserData = {
          name: responseData.name || 'Utilisateur',
          phone: responseData.phone || phone,
          role: responseData.role || 'utilisateur'
        };
        
        // Create a simple token with expiration (24 hours)
        const tokenData = {
          user: userData.phone,
          exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
        };
        const token = btoa(JSON.stringify(tokenData));
        
        localStorage.setItem(AUTH_TOKEN_KEY, token);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
        
        setIsAuthenticated(true);
        setUser(userData);
        console.log('Login successful!', userData);
        return { success: true };
      } else {
        console.log('Webhook rejected login with status:', response.status);
        return { success: false, error: 'Login verification failed. Please try again.' };
      }
    } catch (error) {
      console.error('Login verification error:', error);
      return { success: false, error: 'Unable to verify login. Please check your connection.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

// The provider and its hook intentionally share a module.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
