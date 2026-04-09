import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as loginApi, registerUser as registerApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('auraops_user')));
  const [token, setToken] = useState(localStorage.getItem('auraops_token'));
  const [loading, setLoading] = useState(false);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await loginApi(credentials);
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      localStorage.setItem('auraops_token', token);
      localStorage.setItem('auraops_user', JSON.stringify(user));
      
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data) => {
    setLoading(true);
    try {
      const response = await registerApi(data);
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      localStorage.setItem('auraops_token', token);
      localStorage.setItem('auraops_user', JSON.stringify(user));
      
      return { success: true };
    } catch (error) {
      console.error('Signup failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auraops_token');
    localStorage.removeItem('auraops_user');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
