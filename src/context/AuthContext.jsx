import { createContext, useContext, useEffect, useState } from 'react';
import {
  clearAuthStorage,
  extractAuthTokens,
  getMeta,
  getStoredAccessToken,
  getStoredRefreshToken,
  getUserIdFromToken,
  loginUser,
  registerUser,
  storeAuthTokens,
  verifyOtp as verifyOtpApi,
} from '../services/api';

const AuthContext = createContext(null);

const readStoredJson = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredAccessToken() || null);
  const [refreshToken, setRefreshToken] = useState(getStoredRefreshToken() || null);
  const [user, setUser] = useState(readStoredJson('auraops_user'));
  const [meta, setMeta] = useState(readStoredJson('auraops_meta'));
  const [loading, setLoading] = useState(false);

  const [otpRequired, setOtpRequired] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const readStoredUserId = () => {
    const storedUser = readStoredJson('auraops_user');
    return storedUser?.userId || storedUser?.userID || storedUser?.user_id || storedUser?.id || storedUser?._id || null;
  };

  const persistAuthState = ({ accessToken, refreshToken: nextRefreshToken, user: nextUser, meta: nextMeta = null }) => {
    setToken(accessToken);
    setRefreshToken(nextRefreshToken);
    setUser(nextUser);
    setMeta(nextMeta);
    storeAuthTokens({ accessToken, refreshToken: nextRefreshToken });
    localStorage.setItem('auraops_user', JSON.stringify(nextUser));
    localStorage.setItem('auraops_meta', JSON.stringify(nextMeta));
  };

  const resolveUserId = (responseData, tokenValue) => {
    return (
      responseData?.userId ||
      responseData?.userID ||
      responseData?.user_id ||
      responseData?.id ||
      responseData?._id ||
      responseData?.user?._id ||
      responseData?.user?.id ||
      responseData?.user?.userId ||
      responseData?.user?.userID ||
      responseData?.user?.user_id ||
      user?.userId ||
      user?.userID ||
      user?.user_id ||
      user?.id ||
      user?._id ||
      readStoredUserId() ||
      getUserIdFromToken(tokenValue)
    );
  };

  const fetchMeta = async (userIdOverride) => {
    const userId = userIdOverride || getUserIdFromToken();
    if (!userId) {
      throw new Error('User ID not found in token');
    }

    const response = await getMeta(userId);
    const metaData = response.data;
    setMeta(metaData);
    localStorage.setItem('auraops_meta', JSON.stringify(metaData));
    return metaData;
  };

  useEffect(() => {
    const syncStoredTokens = () => {
      setToken(getStoredAccessToken());
      setRefreshToken(getStoredRefreshToken());
      setUser(readStoredJson('auraops_user'));
      setMeta(readStoredJson('auraops_meta'));
    };

    window.addEventListener('auraops-auth-token-change', syncStoredTokens);
    return () => window.removeEventListener('auraops-auth-token-change', syncStoredTokens);
  }, []);

  // ------------------- SIGNUP (SEND OTP ONLY) -------------------
  const signup = async (data) => {
    setLoading(true);
    try {
      await registerUser({ email: data.email });

      // store full data temporarily
      setPendingUser(data);
      setOtpRequired(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP',
      };
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    setLoading(true);
    try {
      const response = await loginUser({
        email: data.email,
        password: data.password,
      });

      const { accessToken, refreshToken: nextRefreshToken } = extractAuthTokens(response.data);
      if (!accessToken || !nextRefreshToken) {
        return {
          success: false,
          message: response.data?.message || 'Login failed',
        };
      }

      const userId = resolveUserId(response.data, accessToken);
      const userData = {
        userId,
        email: response.data?.email || response.data?.user?.email || data.email,
        name: response.data?.name || response.data?.user?.name || '',
      };

      persistAuthState({ accessToken, refreshToken: nextRefreshToken, user: userData });

      try {
        const metaData = await fetchMeta(userId);
        return { success: true, meta: metaData };
      } catch (metaError) {
        console.error('Failed to fetch meta data after login:', metaError);
        return {
          success: true,
          meta: null,
          metaError: metaError.response?.data?.message || 'Unable to fetch onboarding data',
        };
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------- VERIFY OTP (CREATE + LOGIN) -------------------
  const verifyOtp = async (otp) => {
    if (!pendingUser) {
      return { success: false, message: 'No signup data found' };
    }

    setLoading(true);
    try {
      const response = await verifyOtpApi({
        email: pendingUser.email,
        otp,
        name: pendingUser.name,
        password: pendingUser.password,
      });

      const { accessToken, refreshToken: nextRefreshToken } = extractAuthTokens(response.data);
      if (!accessToken || !nextRefreshToken) {
        return {
          success: false,
          message: response.data?.message || 'OTP verification failed',
        };
      }

      const userId = resolveUserId(response.data, accessToken);
      const userData = {
        userId,
        email: response.data.email || response.data.user?.email,
        name: response.data.name || response.data.user?.name,
      };

      persistAuthState({ accessToken, refreshToken: nextRefreshToken, user: userData });

      // cleanup
      setOtpRequired(false);
      setPendingUser(null);

      try {
        const metaData = await fetchMeta(userId);
        return { success: true, meta: metaData };
      } catch (metaError) {
        console.error('Failed to fetch meta data:', metaError);
        return {
          success: true,
          meta: null,
          metaError: metaError.response?.data?.message || 'Unable to fetch onboarding data',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setMeta(null);
    setOtpRequired(false);
    setPendingUser(null);
    clearAuthStorage();
  };

  return (
    <AuthContext.Provider
      value={{
        signup,
        login,
        verifyOtp,
        fetchMeta,
        otpRequired,
        pendingUser,
        loading,
        user,
        meta,
        token,
        refreshToken,
        isAuthenticated: Boolean(token),
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
