import React, { useState, useRef } from 'react';
import { StyleSheet, View, ActivityIndicator, TouchableOpacity, Text, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PaymentWebViewScreen({ route, navigation }) {
  const { url, type } = route.params || {};
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'cancel'
  // Dùng ref-like flag để tránh gọi verify nhiều lần khi WebView redirect nhiều bước
  const [verifying, setVerifying] = useState(false);
  // Ref lưu URL cuối cùng để detect kết quả khi WebView báo lỗi (returnUrl không reachable)
  const lastKnownUrl = useRef(null);
  const hasHandled = useRef(false);

  if (!url) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Đường dẫn thanh toán không hợp lệ.</Text>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.closeButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Hàm dùng chung để xử lý kết quả thanh toán từ URL
  const handlePaymentUrl = async (currentUrl) => {
    if (!currentUrl) return;
    if (hasHandled.current) return;

    // Bỏ qua các URL thuộc về cổng thanh toán PayOS
    if (currentUrl.includes('payos.vn')) return;

    // PayOS redirect về returnUrl kèm query: ?orderCode=...&code=00&status=PAID (thành công)
    // hoặc ?cancel=true / status=CANCELLED (hủy)
    const isSuccess =
      currentUrl.includes('code=00') ||
      currentUrl.includes('status=PAID') ||
      currentUrl.includes('payment-success');
    const isCancel =
      currentUrl.includes('cancel=true') ||
      currentUrl.includes('status=CANCELLED') ||
      currentUrl.includes('payment-cancel');

    if (!isSuccess && !isCancel) return;

    // Đánh dấu đã xử lý để tránh gọi lại nhiều lần
    hasHandled.current = true;
    setVerifying(true);

    if (isSuccess) {
      try {
        // Đọc orderCode từ redirect URL (PayOS luôn đính kèm ?orderCode=...)
        let orderCode = null;
        try {
          const parsed = new URL(currentUrl);
          orderCode = parsed.searchParams.get('orderCode');
        } catch {
          // fallback: regex
          const match = currentUrl.match(/[?&]orderCode=(\d+)/);
          orderCode = match ? match[1] : null;
        }

        if (orderCode) {
          const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
          const token = await AsyncStorage.getItem('userToken');

          console.log('Calling /payments/verify with orderCode:', orderCode);
          const response = await fetch(`${apiUrl}/payments/verify?orderCode=${orderCode}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          const json = await response.json();
          console.log('Verify response:', response.status, JSON.stringify(json).substring(0, 300));
        } else {
          console.warn('Không tìm thấy orderCode trong redirect URL:', currentUrl);
        }
      } catch (err) {
        console.warn('Lỗi khi gọi API verify payment:', err);
      }
    }

    setPaymentStatus(isSuccess ? 'success' : 'cancel');
  };

  const handleNavigationStateChange = (navState) => {
    // Lưu lại URL hiện tại để dùng khi WebView báo lỗi
    if (navState.url) lastKnownUrl.current = navState.url;
    // Vẫn thử xử lý ngay nếu URL khớp (iOS thường không gặp lỗi connect)
    handlePaymentUrl(navState.url);
  };

  // Khi WebView không load được (returnUrl → localhost → ERR_CONNECTION_REFUSED)
  // → đây chính là tín hiệu PayOS đã redirect về → dùng lastKnownUrl để detect kết quả
  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.log('WebView error:', nativeEvent.code, nativeEvent.url);
    const errorUrl = nativeEvent.url || lastKnownUrl.current || '';
    handlePaymentUrl(errorUrl);
  };

  if (paymentStatus) {
    const isSuccess = paymentStatus === 'success';
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultIconBg, isSuccess ? styles.successBg : styles.failBg]}>
            <Feather
              name={isSuccess ? "check" : "x"}
              size={48}
              color="#ffffff"
            />
          </View>

          <Text style={styles.resultTitle}>
            {isSuccess ? "Thanh toán thành công" : "Thanh toán đã hủy"}
          </Text>

          <Text style={styles.resultSubtitle}>
            {isSuccess
              ? "Giao dịch thanh toán của bạn đã hoàn tất. Hệ thống đã ghi nhận thông tin vé/đơn đặt chỗ."
              : "Thao tác thanh toán đã bị hủy hoặc không thành công. Bạn có thể kiểm tra lại trong danh mục tài khoản."}
          </Text>

          <View style={styles.resultButtons}>
            <TouchableOpacity
              style={styles.primaryResultButton}
              onPress={() => {
                if (type === 'pass') {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }, { name: 'MyPasses' }],
                  });
                } else {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Main' }, { name: 'MyReservations' }],
                  });
                }
              }}
            >
              <Text style={styles.primaryResultButtonText}>
                {type === 'pass' ? "Xem vé tháng của tôi" : "Xem đơn đặt chỗ của tôi"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryResultButton}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Main' }],
                });
              }}
            >
              <Text style={styles.secondaryResultButtonText}>Quay về Trang chủ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar cho phép thoát ngang */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#0f172a" />
          <Text style={styles.headerTitle}>Thanh toán PayOS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.webViewWrapper}>
        <WebView
          source={{ uri: url }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationStateChange}
          // onShouldStartLoadWithRequest chạy ĐỒNG BỘ trước khi WebView load bất kỳ trang nào.
          // Trả về false → WebView KHÔNG load URL → không bao giờ hiện "Webpage not available".
          // Đây là cách duy nhất đáng tin cậy trên Android để chặn trang lỗi native.
          onShouldStartLoadWithRequest={(request) => {
            const reqUrl = request.url || '';

            // Luôn cho phép trang PayOS chính
            if (reqUrl.includes('payos.vn')) return true;
            // Cho phép load URL thanh toán ban đầu (url từ params)
            if (reqUrl === url) return true;

            // Kiểm tra xem đây có phải returnUrl với kết quả thanh toán không
            const isSuccess =
              reqUrl.includes('code=00') ||
              reqUrl.includes('status=PAID') ||
              reqUrl.includes('payment-success');
            const isCancel =
              reqUrl.includes('cancel=true') ||
              reqUrl.includes('status=CANCELLED') ||
              reqUrl.includes('payment-cancel');

            if (isSuccess || isCancel) {
              // Trigger xử lý kết quả (async, không cần await ở đây)
              handlePaymentUrl(reqUrl);
              // Trả về false → WebView KHÔNG load URL này → không có trang lỗi
              return false;
            }

            return true;
          }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
        {loading && (
          <ActivityIndicator
            size="large"
            color="#4f46e5"
            style={styles.loadingIndicator}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? 36 : 0,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  webViewWrapper: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#ef4444',
    marginBottom: 16,
  },
  closeButton: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  resultIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successBg: {
    backgroundColor: '#10b981',
  },
  failBg: {
    backgroundColor: '#ef4444',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
    marginBottom: 36,
  },
  resultButtons: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 8,
  },
  primaryResultButton: {
    backgroundColor: '#4f46e5',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryResultButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryResultButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryResultButtonText: {
    color: '#475569',
    fontSize: 15,
    fontWeight: '700',
  },
});
