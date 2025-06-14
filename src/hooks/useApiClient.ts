
import { useAuth } from '@/components/AuthProvider';
import { useCallback } from 'react';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

export const useApiClient = () => {
  const { token } = useAuth();
  
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:8000';

  const apiCall = useCallback(async (endpoint: string, options: ApiOptions = {}) => {
    const { method = 'GET', body } = options;
    
    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return response.json();
  }, [token, API_BASE_URL]);

  return { apiCall };
};
