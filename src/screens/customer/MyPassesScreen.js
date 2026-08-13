import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import api from '../../config/api';

const STATUS_MAP = {
  pending: { label: 'Chờ thanh toán', color: '#f59e0b', bg: '#fef3c7' },
  active: { label: 'Đang hoạt động', color: '#10b981', bg: '#d1fae5' },
  expired: { label: 'Hết hạn', color: '#64748b', bg: '#f1f5f9' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
};

export default function MyPassesScreen({ navigation }) {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadPasses = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/monthly-passes/mine');
      setPasses(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Không thể tải danh sách vé tháng.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPasses();
  }, []);

  const formatMoney = (v) => {
    return `${Number(v || 0).toLocaleString('vi-VN')} ₫`;
  };

  const formatFloorLabel = (label) => {
    if (!label) return '';
    return /^(tầng|hầm)\b/i.test(label) ? label : `Tầng ${label}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  const handleRepay = async (id) => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/monthly-passes/${id}/repay`);
      const { checkoutUrl, alreadyPaid } = data.data || {};
      
      if (alreadyPaid) {
        Alert.alert('Thông báo', 'Vé tháng này đã được thanh toán rồi.');
        loadPasses();
        return;
      }

      if (checkoutUrl) {
        await WebBrowser.openBrowserAsync(checkoutUrl);
      } else {
        Alert.alert('Lỗi', 'Không lấy được đường dẫn thanh toán.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', err.response?.data?.error?.message || 'Thanh toán lại thất bại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (id) => {
    Alert.alert(
      'Hủy vé tháng',
      'Bạn có chắc chắn muốn hủy đăng ký vé tháng này? Số tiền hoàn lại sẽ được tính theo chính sách hoàn tiền.',
      [
        { text: 'Giữ lại', style: 'cancel' },
        { 
          text: 'Xác nhận hủy', 
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const { data } = await api.post(`/monthly-passes/${id}/cancel`);
              Alert.alert('Thành công', data.message || 'Đã gửi yêu cầu hủy vé tháng thành công.');
              loadPasses();
            } catch (err) {
              console.error(err);
              Alert.alert('Lỗi', err.response?.data?.error?.message || 'Hủy vé tháng thất bại.');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Đang tải vé tháng...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vé tháng của tôi</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionIconBtn} onPress={() => loadPasses(true)}>
            <Feather name="refresh-cw" size={16} color="#4f46e5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconBtn} onPress={() => navigation.navigate('Reserve', { type: 'monthly' })}>
            <Feather name="plus-circle" size={18} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={styles.centerError}>
          <Feather name="alert-circle" size={48} color="#ef4444" style={{ marginBottom: 12 }} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadPasses()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : passes.length === 0 ? (
        <ScrollView 
          contentContainerStyle={styles.centerEmpty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadPasses(true)} />}
        >
          <Feather name="credit-card" size={64} color="#cbd5e1" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Chưa đăng ký vé tháng nào</Text>
          <Text style={styles.emptySubtitle}>Khi đăng ký mua vé tháng gửi xe, danh sách sẽ hiển thị ở đây.</Text>
          <TouchableOpacity 
            style={styles.buyNowBtn} 
            onPress={() => navigation.navigate('Reserve', { type: 'monthly' })}
          >
            <Text style={styles.buyNowText}>Mua vé tháng ngay</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadPasses(true)} />}
          showsVerticalScrollIndicator={false}
        >
          {actionLoading && (
            <View style={styles.actionOverlay}>
              <ActivityIndicator size="small" color="#4f46e5" />
              <Text style={styles.actionOverlayText}>Đang xử lý...</Text>
            </View>
          )}

          {passes.map((pass) => {
            const statusConfig = STATUS_MAP[pass.status] || { label: pass.status, color: '#64748b', bg: '#f1f5f9' };
            const isPending = pass.status === 'pending';
            const isActive = pass.status === 'active';
            
            return (
              <View key={pass.pass_id} style={styles.passCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.plateText}>{pass.plate_number}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                  </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.infoBlock}>
                  <View style={styles.infoRow}>
                    <Feather name="layers" size={14} color="#64748b" />
                    <Text style={styles.infoVal}>Tầng đỗ: {formatFloorLabel(pass.floor?.label || pass.floor?.floor_code)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Feather name="truck" size={14} color="#64748b" />
                    <Text style={styles.infoVal}>Loại xe: {pass.vehicleType?.type_name || ''}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Feather name="calendar" size={14} color="#64748b" />
                    <Text style={styles.infoVal}>
                      Hiệu lực: {formatDate(pass.start_date)} - {formatDate(pass.end_date)}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Feather name="dollar-sign" size={14} color="#64748b" />
                    <Text style={[styles.infoVal, { fontWeight: '700', color: '#4f46e5' }]}>
                      Giá vé: {formatMoney(pass.price)}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                {(isPending || isActive) && (
                  <View style={styles.actionsContainer}>
                    {isPending && (
                      <TouchableOpacity 
                        style={styles.payBtn} 
                        onPress={() => handleRepay(pass.pass_id)}
                      >
                        <Feather name="credit-card" size={14} color="#ffffff" style={{ marginRight: 6 }} />
                        <Text style={styles.payBtnText}>Thanh toán lại</Text>
                      </TouchableOpacity>
                    )}
                    {isActive && (
                      <TouchableOpacity 
                        style={styles.cancelBtn} 
                        onPress={() => handleCancel(pass.pass_id)}
                      >
                        <Feather name="slash" size={14} color="#ef4444" style={{ marginRight: 6 }} />
                        <Text style={styles.cancelBtnText}>Hủy đăng ký vé</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  centerError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  retryBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  centerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buyNowBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buyNowText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  scrollList: {
    padding: 16,
    gap: 14,
  },
  actionOverlay: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionOverlayText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '600',
  },
  passCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plateText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  infoBlock: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoVal: {
    fontSize: 13.5,
    color: '#475569',
    fontWeight: '500',
  },
  actionsContainer: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 12,
  },
  payBtn: {
    height: 38,
    borderRadius: 8,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtn: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fff5f5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  cancelBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
});
