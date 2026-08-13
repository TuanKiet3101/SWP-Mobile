import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image,
  RefreshControl,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../config/api';

export default function MyParkingScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // QR Modal
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedQrToken, setSelectedQrToken] = useState('');
  const [selectedPlate, setSelectedPlate] = useState('');

  const loadSessions = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/sessions/mine/active');
      setSessions(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Không thể tải thông tin xe trong bãi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const formatMoney = (v) => {
    return `${Number(v || 0).toLocaleString('vi-VN')} ₫`;
  };

  const formatFloorLabel = (label) => {
    if (!label) return '';
    return /^(tầng|hầm)\b/i.test(label) ? label : `Tầng ${label}`;
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const formatLocation = (s) => {
    if (!s.slot) return 'Chưa gán vị trí';
    const floor = s.slot.zone?.floor?.label || s.slot.zone?.floor?.floor_code;
    const parts = [
      floor && formatFloorLabel(floor),
      s.slot.zone?.label && `Khu ${s.slot.zone.label}`,
      s.slot.slot_code && `Ô đỗ ${s.slot.slot_code}`,
    ].filter(Boolean);
    return parts.length ? parts.join(' · ') : 'Không xác định';
  };

  const formatElapsed = (timeIn) => {
    if (!timeIn) return '';
    const mins = Math.max(0, Math.floor((Date.now() - new Date(timeIn).getTime()) / 60000));
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
  };

  const showQrCode = (token, plate) => {
    setSelectedQrToken(token);
    setSelectedPlate(plate);
    setQrModalVisible(true);
  };

  const hasLiveQr = (s) => s.qr_token && !String(s.qr_token).startsWith('revoked-');

  if (loading && !refreshing) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Đang tải thông tin xe...</Text>
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
        <Text style={styles.headerTitle}>Xe trong bãi</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => loadSessions(true)}>
          <Feather name="refresh-cw" size={16} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.centerError}>
          <Feather name="alert-circle" size={48} color="#ef4444" style={{ marginBottom: 12 }} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadSessions()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : sessions.length === 0 ? (
        <ScrollView 
          contentContainerStyle={styles.centerEmpty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSessions(true)} />}
        >
          <Feather name="truck" size={64} color="#cbd5e1" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Không có xe nào trong bãi</Text>
          <Text style={styles.emptySubtitle}>Khi xe của bạn được ghi nhận quét thẻ vào bãi đỗ, thông tin đỗ xe sẽ hiển thị ở đây.</Text>
          <TouchableOpacity 
            style={styles.bookNowBtn} 
            onPress={() => navigation.navigate('Reserve')}
          >
            <Text style={styles.bookNowText}>Đặt chỗ trước</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSessions(true)} />}
          showsVerticalScrollIndicator={false}
        >
          {sessions.map((s) => (
            <View key={s.session_id} style={styles.sessionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.plateRow}>
                  <Text style={styles.plateText}>{s.plate_number}</Text>
                  <View style={styles.badgeActive}>
                    <Text style={styles.badgeActiveText}>Đang gửi</Text>
                  </View>
                  {s.overstay && (
                    <View style={styles.badgeOverstay}>
                      <Text style={styles.badgeOverstayText}>Quá giờ</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.vehicleTypeText}>{s.vehicleType?.type_name || ''}</Text>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.infoBlock}>
                <View style={styles.infoRow}>
                  <Feather name="map-pin" size={14} color="#64748b" />
                  <Text style={styles.infoVal}>{formatLocation(s)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Feather name="log-in" size={14} color="#64748b" />
                  <Text style={styles.infoVal}>Vào bãi: {formatDateTime(s.time_in)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Feather name="clock" size={14} color="#64748b" />
                  <Text style={styles.infoVal}>Đã gửi: {formatElapsed(s.time_in)}</Text>
                </View>
                
                <View style={[styles.infoRow, { marginTop: 4 }]}>
                  <Feather name="dollar-sign" size={14} color="#64748b" />
                  {s.passCovered ? (
                    <Text style={[styles.infoVal, styles.passCoveredText]}>Vé tháng (Được miễn phí)</Text>
                  ) : (
                    <Text style={[styles.infoVal, styles.feeText]}>
                      Phí tạm tính: {s.estimatedFee != null ? formatMoney(s.estimatedFee) : 'Chờ tính toán'}
                    </Text>
                  )}
                </View>

                {s.overstay && (
                  <View style={styles.warningContainer}>
                    <Feather name="alert-triangle" size={14} color="#b45309" />
                    <Text style={styles.warningText}>
                      Xe đã gửi quá thời gian tối đa cho phép. Có thể phát sinh thêm phụ thu khi ra cổng.
                    </Text>
                  </View>
                )}
              </View>

              {hasLiveQr(s) && (
                <TouchableOpacity 
                  style={styles.qrBtn}
                  onPress={() => showQrCode(s.qr_token, s.plate_number)}
                >
                  <MaterialCommunityIcons name="qrcode" size={20} color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.qrBtnText}>Hiện mã QR ra cổng</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* QR MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={qrModalVisible}
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.qrModalContent}>
            <Text style={styles.qrModalTitle}>QR Check-Out</Text>
            <Text style={styles.qrModalSub}>{selectedPlate}</Text>
            
            {selectedQrToken ? (
              <Image 
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedQrToken}` }}
                style={styles.qrImage}
              />
            ) : null}
            
            <Text style={styles.qrHelpText}>
              Đưa mã QR này vào trước camera quét QR tại cổng kiểm soát khi muốn ra khỏi bãi đỗ xe.
            </Text>

            <TouchableOpacity style={styles.closeQrBtn} onPress={() => setQrModalVisible(false)}>
              <Text style={styles.closeQrBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  bookNowBtn: {
    backgroundColor: '#4f46e5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookNowText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  scrollList: {
    padding: 16,
    gap: 14,
  },
  sessionCard: {
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
  plateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plateText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  badgeActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeActiveText: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeOverstay: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeOverstayText: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '700',
  },
  vehicleTypeText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  infoBlock: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoVal: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  feeText: {
    fontWeight: '700',
    color: '#4f46e5',
    fontSize: 15,
  },
  passCoveredText: {
    fontWeight: '700',
    color: '#10b981',
    fontSize: 14.5,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    gap: 8,
    marginTop: 6,
    alignItems: 'flex-start',
  },
  warningText: {
    color: '#b45309',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  qrBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 16,
  },
  qrBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  qrModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  qrModalSub: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
  },
  qrImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  qrHelpText: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  closeQrBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    height: 46,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeQrBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
