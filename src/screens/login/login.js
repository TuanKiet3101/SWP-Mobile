import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Feather, FontAwesome } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [needVerify, setNeedVerify] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const { login, loginWithGoogle, resendVerification } = useAuth();

  const navigateAfterLogin = () => {
    const routes = navigation.getState()?.routes;
    const prevRoute = routes && routes.length > 1 ? routes[routes.length - 2] : null;
    
    if (prevRoute && prevRoute.name === 'Register') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Main');
    }
  };

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email.');
      return;
    }
    setResending(true);
    try {
      const data = await resendVerification(resendEmail.trim());
      Alert.alert('Thành công', data?.message || 'Đã gửi lại email xác minh thành công. Vui lòng kiểm tra hộp thư.');
      setNeedVerify(false);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || 'Gửi lại email xác minh thất bại.';
      Alert.alert('Lỗi', msg);
    } finally {
      setResending(false);
    }
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoading(true);
    setNeedVerify(false);
    try {
      await login(username.trim(), password);
      // Đăng nhập thành công, điều hướng an toàn
      navigateAfterLogin();
    } catch (error) {
      console.error(error);
      let errorMsg = 'Có lỗi xảy ra, vui lòng thử lại sau.';
      if (error.response) {
        if (error.response.data?.error?.code === 'EMAIL_NOT_VERIFIED') {
          setNeedVerify(true);
          setResendEmail(username.includes('@') ? username.trim() : '');
        }
        errorMsg = error.response.data?.error?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      } else if (error.request) {
        errorMsg = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và cấu hình API.';
      }
      Alert.alert('Đăng nhập thất bại', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigateAfterLogin();
    } catch (error) {
      console.error('Google login error:', error);
      const errorStr = String(error);
      if (!errorStr.includes('cancel') && !errorStr.includes('SIGN_IN_CANCELLED')) {
        let errorMsg = 'Đăng nhập bằng Google thất bại. Vui lòng thử lại.';
        if (error.response) {
          errorMsg = error.response.data?.error?.message || errorMsg;
        }
        Alert.alert('Thất bại', errorMsg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Feather name="lock" size={32} color="#ffffff" />
          </View>
          <Text style={styles.title}>Chào mừng trở lại</Text>
          <Text style={styles.subtitle}>Đăng nhập để quản lý và đặt chỗ đỗ xe</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Chưa xác minh email */}
          {needVerify && (
            <View style={styles.verifyContainer}>
              <Text style={styles.verifyText}>
                Tài khoản chưa xác minh email. Nhập email đã đăng ký để nhận lại liên kết xác minh:
              </Text>
              <View style={styles.verifyRow}>
                <TextInput
                  style={styles.verifyInput}
                  value={resendEmail}
                  onChangeText={setResendEmail}
                  placeholder="email@vidu.com"
                  placeholderTextColor="#94a3b8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.verifyButton} 
                  onPress={handleResend}
                  disabled={resending}
                >
                  {resending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.verifyButtonText}>Gửi lại</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên đăng nhập</Text>
            <View style={styles.inputWrapper}>
              <Feather name="user" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập tên đăng nhập"
                placeholderTextColor="#94a3b8"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu"
                placeholderTextColor="#94a3b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={secureText}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                <Feather name={secureText ? "eye-off" : "eye"} size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color="#4f46e5" />
            ) : (
              <View style={styles.googleButtonContent}>
                <FontAwesome name="google" size={20} color="#db4437" style={styles.googleIcon} />
                <Text style={styles.googleButtonText}>Tiếp tục với Google</Text>
              </View>
            )}
          </TouchableOpacity>


          {/* Navigation Links */}
          <View style={styles.footerLinks}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              navigation.navigate('Main');
            }}
          >
            <Text style={styles.backButtonText}>Quay lại Trang chủ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    backgroundColor: '#f8fafc',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  footerText: {
    color: '#64748b',
    fontSize: 14,
  },
  linkText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 14,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  verifyContainer: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  verifyText: {
    fontSize: 13,
    color: '#b45309',
    lineHeight: 18,
    marginBottom: 10,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifyInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  verifyButton: {
    backgroundColor: '#d97706',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 4,
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#334155',
    fontSize: 16,
    fontWeight: '600',
  },
});