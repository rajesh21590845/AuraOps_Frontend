import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser as loginApi, registerUser as registerApi, verifyOtp as verifyOtpApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('auraops_token') || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('auraops_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('auraops_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Track if OTP is required
  const [otpRequired, setOtpRequired] = useState(false);
  const [pendingUser, setPendingUser] = useState(null); // store user waiting for OTP

  // ------------------- LOGIN -------------------
  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await loginApi(credentials);

      if (!response.data.token) {
        // Backend says "please verify your account"
        setPendingUser({ email: credentials.email });
        setOtpRequired(true);
        return { success: false, otpRequired: true };
      }

      const token = response.data.token;
      const userToSave = { 
        email: response.data.email || credentials.email, 
        name: response.data.name || null 
      };

      setToken(token);
      setUser(userToSave);
      localStorage.setItem('auraops_token', token);
      localStorage.setItem('auraops_user', JSON.stringify(userToSave));

      setOtpRequired(false);
      setPendingUser(null);

      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      // If backend specifically asks for verification
      if (error.response?.data?.message?.includes('verify')) {
        setPendingUser({ email: credentials.email });
        setOtpRequired(true);
        return { success: false, otpRequired: true };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check your credentials.',
      };
    } finally {
      setLoading(false);
    }
  };

  // ------------------- SIGNUP -------------------
  const signup = async (data) => {
    setLoading(true);
    try {
      await registerApi(data);
      const userToSave = { email: data.email, name: data.name || null };
      setPendingUser(userToSave);
      setOtpRequired(true);
      return { success: true, otpRequired: true, message: 'OTP sent to your email' };
    } catch (error) {
      console.error('Signup failed:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Signup failed. Please try again.',
      };
    } finally {
      setLoading(false);
    }
  };

  // ------------------- VERIFY OTP -------------------
  const verifyOtp = async (otp) => {
  if (!pendingUser) {
    return { success: false, message: 'No user pending verification' };
  }

  setLoading(true);
  try {
    await verifyOtpApi({
      email: pendingUser.email,
      otp,
    });

    setOtpRequired(false);
    setPendingUser(null);

    return {
      success: true,
      message: 'Account verified successfully. Please login.',
    };
  } catch (error) {
    console.error('OTP verification failed:', error);

    return {
      success: false,
      message: error.response?.data?.message || 'OTP verification failed.',
    };
  } finally {
    setLoading(false);
  }
};
  // ------------------- LOGOUT -------------------
  const logout = () => {
    setToken(null);
    setUser(null);
    setPendingUser(null);
    setOtpRequired(false);
    localStorage.removeItem('auraops_token');
    localStorage.removeItem('auraops_user');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        otpRequired,
        pendingUser,
        login,
        signup,
        verifyOtp,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};