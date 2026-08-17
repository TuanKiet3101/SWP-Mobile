import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import api from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cấu hình Google Sign-in khi Provider được khởi tạo
  useEffect(() => {
    GoogleSignin.configure({
      // Lấy Web Client ID từ file .env (hỗ trợ cả Expo và RN thông thường)
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || process.env.GOOGLE_IOS_CLIENT_ID,
      offlineAccess: true,
    });
  }, []);

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

  // Đăng nhập / Đăng ký bằng Google
  const loginWithGoogle = async () => {
    try {
      await clearSession();
      
      // Kiểm tra thiết bị có Google Play Services (chỉ ảnh hưởng trên Android)
      await GoogleSignin.hasPlayServices();
      
      // Mở Popup đăng nhập của Google
      const userInfo = await GoogleSignin.signIn();
      
      // Lấy idToken tương thích với các phiên bản thư viện cũ & mới
      const idToken = userInfo.idToken || (userInfo.data && userInfo.data.idToken);
      
      if (!idToken) {
        throw new Error('Không lấy được Google idToken từ thiết bị');
      }

      // Gửi idToken lên API backend
      const { data } = await api.post('/auth/google', { idToken });
      
      const token = data.data.token;
      const userData = data.data.user;

      // Lưu JWT Token và User Info vào AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
      
      setUser(userData);
      return data.data;
    } catch (error) {
      console.warn('Lỗi đăng nhập Google:', error);
      throw error;
    }
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    return data.data;
  };

  const resendVerification = async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data;
  };

  // Cập nhật hàm logout để đăng xuất cả tài khoản Google
  const logout = useCallback(async () => {
    try {
      // Đăng xuất Google để lần sau người dùng có thể chọn tài khoản khác
      await GoogleSignin.signOut();
    } catch (error) {
      console.warn('Lỗi khi đăng xuất Google:', error);
    }
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
        loginWithGoogle, // Export hàm đăng nhập Google
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
