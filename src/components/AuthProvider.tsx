
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'facebook';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (provider: 'google' | 'facebook') => void;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:8000';

  useEffect(() => {
    // Check for existing token in localStorage
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('user_data');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    // Redirect to FastAPI OAuth endpoint
    window.location.href = `${API_BASE_URL}/auth/${provider}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('token');
      const userData = urlParams.get('user');
      
      if (authToken && userData) {
        try {
          const user = JSON.parse(decodeURIComponent(userData));
          setToken(authToken);
          setUser(user);
          
          localStorage.setItem('auth_token', authToken);
          localStorage.setItem('user_data', JSON.stringify(user));
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          toast({
            title: "Welcome!",
            description: `Successfully logged in with ${user.provider}`,
          });
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: "Login Error",
            description: "Failed to complete authentication",
            variant: "destructive"
          });
        }
      }
    };

    handleOAuthCallback();
  }, [toast]);

  const value = {
    user,
    isLoading,
    login,
    logout,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
