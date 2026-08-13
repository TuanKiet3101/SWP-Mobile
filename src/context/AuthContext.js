import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userInfo']);
      setUser(null);
    } catch (error) {
      console.warn('Error clearing session:', error);
    }
  }, []);

  // Khôi phục phiên từ AsyncStorage
  const loadUser = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const savedUser = await AsyncStorage.getItem('userInfo');

      if (!token) {
        setLoading(false);
        return;
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }

      // Gọi API /auth/me để xác thực token và lấy thông tin mới nhất
      const { data } = await api.get('/auth/me');
      if (data && data.data) {
        setUser(data.data);
        await AsyncStorage.setItem('userInfo', JSON.stringify(data.data));
      } else {
        await clearSession();
      }
    } catch (error) {
      console.warn('Error loading user session, logging out:', error);
      await clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username, password) => {
    await clearSession();
    const { data } = await api.post('/auth/login', { username, password });
    
    const token = data.data.token;
    const userData = data.data.user;

    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
    
    setUser(userData);
    return data.data;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  };

  const resendVerification = async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data;
  };

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const updateUser = useCallback(async (nextUser) => {
    try {
      setUser(nextUser);
      await AsyncStorage.setItem('userInfo', JSON.stringify(nextUser));
    } catch (error) {
      console.warn('Error updating user state:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, 
        login, 
        register, 
        resendVerification,
        logout, 
        updateUser, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};