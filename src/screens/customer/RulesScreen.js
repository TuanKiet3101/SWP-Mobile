import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../../config/api';

export default function RulesScreen() {
  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadPricing = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/public/pricing');
      setPricingRules(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Không thể tải bảng giá.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPricing();
  }, []);

  const formatMoney = (v) => {
    return `${Number(v || 0).toLocaleString('vi-VN')} ₫`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Quy định & Bảng giá</Text>
          <Text style={styles.subtitle}>Thông tin bảng giá dịch vụ đỗ xe PBMS</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshBtn} 
          onPress={() => loadPricing(true)}
          disabled={loading || refreshing}
        >
          <Feather name="refresh-cw" size={18} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Đang tải bảng giá...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="alert-triangle" size={48} color="#ef4444" style={{ marginBottom: 12 }} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadPricing()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadPricing(true)} />}
          showsVerticalScrollIndicator={false}
        >
          {/* Bảng giá Section */}
          <Text style={styles.sectionTitle}>Bảng giá dịch vụ</Text>
          
          {pricingRules.length === 0 ? (
            <View style={styles.emptyCard}>
              <Feather name="file-text" size={36} color="#94a3b8" style={{ marginBottom: 8 }} />
              <Text style={styles.emptyText}>Chưa có thông tin bảng giá dịch vụ.</Text>
            </View>
          ) : (
            pricingRules.map((rule) => (
              <View key={rule.vehicleTypeId} style={styles.pricingCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.typeNameRow}>
                    <View style={styles.carIconWrapper}>
                      <Feather name={rule.typeCode?.toLowerCase()?.includes('motor') ? 'navigation' : 'truck'} size={20} color="#4f46e5" />
                    </View>
                    <View>
                      <Text style={styles.cardTypeName}>{rule.typeName}</Text>
                      <Text style={styles.cardTypeCode}>{rule.typeCode}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardPrice}>{formatMoney(rule.baseRate)}</Text>
                </View>
                
                <View style={styles.cardDivider} />
                
                <View style={styles.cardDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Đơn vị tính:</Text>
                    <Text style={styles.detailValue}>{rule.unit} phút / đơn vị</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Hiệu lực từ:</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(rule.effectiveFrom)} {rule.effectiveTo ? `đến ${formatDate(rule.effectiveTo)}` : '(Vô thời hạn)'}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}

          {/* Quy định đỗ xe Section */}
          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Nội quy bãi đỗ xe</Text>
          <View style={styles.rulesCard}>
            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet}>
                <Text style={styles.ruleBulletText}>•</Text>
              </View>
              <Text style={styles.ruleText}>
                <Text style={{ fontWeight: '700', color: '#1e293b' }}>Giờ mở cửa:</Text> Hoạt động liên tục từ 06:00 đến 22:00 hàng ngày.
              </Text>
            </View>
            
            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet}>
                <Text style={styles.ruleBulletText}>•</Text>
              </View>
              <Text style={styles.ruleText}>
                <Text style={{ fontWeight: '700', color: '#1e293b' }}>Biển số hợp lệ:</Text> Mỗi biển số xe chỉ được phép có duy nhất một phiên gửi xe hoạt động tại bãi đỗ vào một thời điểm.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet}>
                <Text style={styles.ruleBulletText}>•</Text>
              </View>
              <Text style={styles.ruleText}>
                <Text style={{ fontWeight: '700', color: '#1e293b' }}>Check-out QR:</Text> QR code check-out của phiên gửi xe chỉ có giá trị sử dụng một lần để ra cổng.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet}>
                <Text style={styles.ruleBulletText}>•</Text>
              </View>
              <Text style={styles.ruleText}>
                <Text style={{ fontWeight: '700', color: '#1e293b' }}>Hủy đơn đặt chỗ:</Text> Đơn đặt chỗ (Reservation) đã thanh toán được phép hủy trước ca đỗ bắt đầu và được hoàn tiền tự động theo quy định hoàn trả.
              </Text>
            </View>

            <View style={styles.ruleItem}>
              <View style={styles.ruleBullet}>
                <Text style={styles.ruleBulletText}>•</Text>
              </View>
              <Text style={styles.ruleText}>
                <Text style={{ fontWeight: '700', color: '#1e293b' }}>Gửi xe quá giờ:</Text> Xe gửi quá giờ quy định tối đa có thể bị phạt thêm phụ phí đỗ xe theo giờ phát sinh.
              </Text>
            </View>
          </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
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
  scrollList: {
    padding: 20,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  pricingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTypeName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardTypeCode: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4f46e5',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  rulesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  ruleBullet: {
    marginTop: 2,
  },
  ruleBulletText: {
    fontSize: 16,
    color: '#4f46e5',
    fontWeight: '800',
  },
  ruleText: {
    fontSize: 13.5,
    color: '#475569',
    lineHeight: 20,
    flex: 1,
  },
});
