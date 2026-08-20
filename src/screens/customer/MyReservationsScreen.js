import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';

const VIETNAM_BANKS = [
  { code: 'VCB', shortName: 'VIETCOMBANK', name: 'Ngân hàng TMCP Ngoại Thương Việt Nam' },
  { code: 'CTG', shortName: 'VIETINBANK', name: 'Ngân hàng TMCP Công Thương Việt Nam' },
  { code: 'BIDV', shortName: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam' },
  { code: 'VBA', shortName: 'AGRIBANK', name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam' },
  { code: 'TCB', shortName: 'TECHCOMBANK', name: 'Ngân hàng TMCP Kỹ Thương Việt Nam' },
  { code: 'MB', shortName: 'MBBANK', name: 'Ngân hàng TMCP Quân Đội' },
  { code: 'ACB', shortName: 'ACB', name: 'Ngân hàng TMCP Á Châu' },
  { code: 'VPB', shortName: 'VPBANK', name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng' },
  { code: 'TPB', shortName: 'TPBANK', name: 'Ngân hàng TMCP Tiên Phong' },
  { code: 'STB', shortName: 'SACOMBANK', name: 'Ngân hàng TMCP Sài Gòn Thương Tín' },
  { code: 'HDB', shortName: 'HDBANK', name: 'Ngân hàng TMCP Phát triển TP.HCM' },
  { code: 'VIB', shortName: 'VIB', name: 'Ngân hàng TMCP Quốc Tế Việt Nam' },
  { code: 'MSB', shortName: 'MSB', name: 'Ngân hàng TMCP Hàng Hải Việt Nam' },
  { code: 'SHB', shortName: 'SHB', name: 'Ngân hàng TMCP Sài Gòn - Hà Nội' },
  { code: 'LPB', shortName: 'LPBANK', name: 'Ngân hàng TMCP Lộc Phát Việt Nam' },
  { code: 'SSB', shortName: 'SEABANK', name: 'Ngân hàng TMCP Đông Nam Á' },
  { code: 'OCB', shortName: 'OCB', name: 'Ngân hàng TMCP Phương Đông' },
  { code: 'EIB', shortName: 'EXIMBANK', name: 'Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam' },
  { code: 'SCB', shortName: 'SCB', name: 'Ngân hàng TMCP Sài Gòn' },
  { code: 'BAB', shortName: 'BAC A BANK', name: 'Ngân hàng TMCP Bắc Á' },
  { code: 'BVB', shortName: 'BAOVIET BANK', name: 'Ngân hàng TMCP Bảo Việt' },
  { code: 'VAB', shortName: 'VIET A BANK', name: 'Ngân hàng TMCP Việt Á' },
  { code: 'VBB', shortName: 'VIETBANK', name: 'Ngân hàng TMCP Việt Nam Thương Tín' },
  { code: 'NAB', shortName: 'NAM A BANK', name: 'Ngân hàng TMCP Nam Á' },
  { code: 'KLB', shortName: 'KIENLONG BANK', name: 'Ngân hàng TMCP Kiên Long' },
  { code: 'PGB', shortName: 'PGBANK', name: 'Ngân hàng TMCP Thịnh vượng và Phát triển' },
  { code: 'NCB', shortName: 'NCB', name: 'Ngân hàng TMCP Quốc Dân' },
  { code: 'GPB', shortName: 'GPBANK', name: 'Ngân hàng TNHH MTV Dầu Khí Toàn Cầu' },
  { code: 'OJB', shortName: 'OCEANBANK', name: 'Ngân hàng TNHH MTV Đại Dương' },
  { code: 'VRB', shortName: 'VRB', name: 'Ngân hàng Liên doanh Việt - Nga' },
  { code: 'PBVN', shortName: 'PUBLIC BANK', name: 'Ngân hàng TNHH MTV Public Việt Nam' },
  { code: 'HLBVN', shortName: 'HONG LEONG BANK', name: 'Ngân hàng TNHH MTV Hong Leong Việt Nam' },
  { code: 'SHBVN', shortName: 'SHINHAN BANK', name: 'Ngân hàng TNHH MTV Shinhan Việt Nam' },
  { code: 'WVN', shortName: 'WOORI BANK', name: 'Ngân hàng TNHH MTV Woori Việt Nam' },
  { code: 'SCVN', shortName: 'STANDARD CHARTERED', name: 'Ngân hàng TNHH MTV Standard Chartered Việt Nam' },
  { code: 'HSBC', shortName: 'HSBC', name: 'Ngân hàng TNHH MTV HSBC Việt Nam' },
  { code: 'CITI', shortName: 'CITIBANK', name: 'Ngân hàng Citibank Việt Nam' },
  { code: 'CBBANK', shortName: 'CBBANK', name: 'Ngân hàng Thương mại TNHH MTV Xây dựng Việt Nam' },
  { code: 'SAIGONBANK', shortName: 'SAIGONBANK', name: 'Ngân hàng TMCP Sài Gòn Công Thương' },
  { code: 'DONGABANK', shortName: 'DONG A BANK', name: 'Ngân hàng TMCP Đông Á' },
  { code: 'KASIKORN', shortName: 'KASIKORNBANK', name: 'Ngân hàng KASIKORNBANK' },
];

const STATUS_MAP = {
  pending: { label: 'Chờ thanh toán', color: '#f59e0b', bg: '#fef3c7' },
  confirmed: { label: 'Đã xác nhận', color: '#10b981', bg: '#d1fae5' },
  checked_in: { label: 'Đang trong bãi', color: '#3b82f6', bg: '#dbeafe' },
  completed: { label: 'Hoàn tất', color: '#64748b', bg: '#f1f5f9' },
  cancelled: { label: 'Đã hủy', color: '#ef4444', bg: '#fee2e2' },
  no_show: { label: 'Không đến', color: '#6b7280', bg: '#e5e7eb' },
};

const SHIFTS = {
  morning: 'Ca sáng (06:00 - 12:00)',
  afternoon: 'Ca chiều (12:00 - 18:00)',
  evening: 'Ca tối (18:00 - 22:00)',
  overnight: 'Ca qua đêm (22:00 - 06:00)',
};

export default function MyReservationsScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Repay & Cancel states
  const [actionLoading, setActionLoading] = useState(false);

  // QR Modal
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedQrToken, setSelectedQrToken] = useState('');
  const [selectedPlate, setSelectedPlate] = useState('');

  // Cancel policy Modal
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [refundPolicy, setRefundPolicy] = useState(null);
  const [policyLoading, setPolicyLoading] = useState(false);

  // Bank Info States
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankRequired, setBankRequired] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');

  // PayOS & Cancel Success Modals States
  const [payosModalVisible, setPayosModalVisible] = useState(false);
  const [payosCheckoutUrl, setPayosCheckoutUrl] = useState('');
  const [payosType, setPayosType] = useState('');
  const [cancelSuccessModalVisible, setCancelSuccessModalVisible] = useState(false);

  const triggerPayosRedirect = (url, type) => {
    setPayosCheckoutUrl(url);
    setPayosType(type);
    setPayosModalVisible(true);
    
    // Auto-redirect after 1.5 seconds
    setTimeout(() => {
      setPayosModalVisible((visible) => {
        if (visible) {
          navigation.navigate('PaymentWebView', { url, type });
        }
        return false;
      });
    }, 1500);
  };

  const filteredBanks = VIETNAM_BANKS.filter((b) => {
    const query = bankSearchQuery.toUpperCase().trim();
    if (!query) return true;
    return (
      b.code.includes(query) ||
      b.shortName.includes(query) ||
      b.name.toUpperCase().includes(query)
    );
  });

  // Filter date states
  const [filterDate, setFilterDate] = useState('');
  const [filterCalendarVisible, setFilterCalendarVisible] = useState(false);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  const toDateStr = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonthIndex = (y, m) => {
    const day = new Date(y, m, 1).getDay();
    return (day + 6) % 7;
  };

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  };

  const renderFilterCalendar = () => {
    const days = [];
    const firstDayIdx = getFirstDayOfMonthIndex(calendarYear, calendarMonth);
    const totalDays = getDaysInMonth(calendarYear, calendarMonth);

    for (let i = 0; i < firstDayIdx; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }

    return (
      <View style={styles.calendarGrid}>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((h, i) => (
          <View key={`h-${i}`} style={styles.calendarDayHeader}>
            <Text style={styles.calendarDayHeaderText}>{h}</Text>
          </View>
        ))}
        {days.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} style={styles.calendarCellEmpty} />;
          }

          const dayStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = dayStr === filterDate;
          const isToday = dayStr === toDateStr(new Date());

          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.calendarCell,
                isSelected && styles.calendarCellSelected,
                isToday && !isSelected && styles.calendarCellToday
              ]}
              onPress={() => {
                setFilterDate(dayStr);
                setFilterCalendarVisible(false);
              }}
            >
              <Text style={[
                styles.calendarCellText,
                isSelected && styles.calendarCellTextSelected,
                isToday && !isSelected && styles.calendarCellTextToday
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const loadReservations = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/reservations/mine');
      setReservations(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Không thể tải danh sách đặt chỗ.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReservations();
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

  const formatWindow = (startStr, endStr) => {
    if (!startStr) return '';
    const start = new Date(startStr);
    const end = new Date(endStr);
    const dateStr = start.toLocaleDateString('vi-VN');
    const startHm = start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const endHm = end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} (${startHm} - ${endHm})`;
  };

  const handleRepay = async (id) => {
    setActionLoading(true);
    try {
      const { data } = await api.post(`/reservations/${id}/repay`);
      const { checkoutUrl, alreadyPaid } = data.data || {};

      if (alreadyPaid) {
        Alert.alert('Thông báo', 'Đơn đặt chỗ này đã được thanh toán rồi.');
        loadReservations();
        return;
      }

      if (checkoutUrl) {
        triggerPayosRedirect(checkoutUrl, 'reservation');
      } else {
        Alert.alert('Lỗi', 'Không lấy được đường dẫn thanh toán.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', err.response?.data?.error?.message || 'Không thể thực hiện thanh toán lại.');
    } finally {
      setActionLoading(false);
    }
  };

  const openCancelModal = async (res) => {
    setCancelTarget(res);
    setCancelModalVisible(true);
    setBankName('');
    setBankAccountNumber('');
    setBankAccountHolder('');
    setBankRequired(false);
    setBankModalVisible(false);
    setBankSearchQuery('');

    if (res.status === 'pending') {
      setRefundPolicy(null); // Pending cancel has no refund policy details needed
      return;
    }

    const hasBank = user?.bankAccountNumber || user?.bank_account_number;
    if (!hasBank) {
      setBankRequired(true);
    }

    setPolicyLoading(true);
    try {
      const { data } = await api.get('/reservations/refund-policy');
      setRefundPolicy(data.data);
    } catch (err) {
      console.error(err);
      setRefundPolicy(null);
    } finally {
      setPolicyLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;

    if (bankRequired) {
      if (!bankName.trim() || !bankAccountNumber.trim() || !bankAccountHolder.trim()) {
        Alert.alert('Thông báo', 'Vui lòng điền đầy đủ thông tin tài khoản ngân hàng để nhận hoàn tiền.');
        return;
      }
      if (!/^\d{6,30}$/.test(bankAccountNumber.trim())) {
        Alert.alert('Thông báo', 'Số tài khoản ngân hàng chỉ chứa số (từ 6 đến 30 chữ số).');
        return;
      }
    }

    setCancelModalVisible(false);
    setActionLoading(true);
    try {
      const payload = bankRequired ? {
        bankName: bankName.trim(),
        bankAccountNumber: bankAccountNumber.trim(),
        bankAccountHolder: bankAccountHolder.trim()
      } : undefined;

      const { data } = await api.post(`/reservations/${cancelTarget.reservation_id}/cancel`, payload);
      
      if (bankRequired && user) {
        updateUser({
          ...user,
          bankName: bankName.trim(),
          bankAccountNumber: bankAccountNumber.trim(),
          bankAccountHolder: bankAccountHolder.trim(),
          bank_name: bankName.trim(),
          bank_account_number: bankAccountNumber.trim(),
          bank_account_holder: bankAccountHolder.trim(),
        });
      }

      setCancelSuccessModalVisible(true);
      loadReservations();
    } catch (err) {
      console.error(err);
      const code = err.response?.data?.error?.code;
      const msg = err.response?.data?.error?.message;

      if (code === 'BANK_INFO_REQUIRED') {
        setBankRequired(true);
        setCancelModalVisible(true);
        Alert.alert('Thông báo', msg || 'Vui lòng cung cấp tài khoản ngân hàng nhận hoàn tiền.');
      } else {
        Alert.alert('Lỗi', msg || 'Hủy đặt chỗ thất bại.');
      }
    } finally {
      setActionLoading(false);
      setCancelTarget(null);
    }
  };

  const showQrCode = (token, plate) => {
    setSelectedQrToken(token);
    setSelectedPlate(plate);
    setQrModalVisible(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Đang tải đặt chỗ...</Text>
      </View>
    );
  }

  const filteredReservations = filterDate
    ? reservations.filter(res => {
      if (!res.start_time) return false;
      const resDate = res.start_time.split('T')[0];
      return resDate === filterDate;
    })
    : reservations;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn đặt chỗ</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => loadReservations(true)}>
          <Feather name="refresh-cw" size={16} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {/* FILTER BAR */}
      {!error && reservations.length > 0 && (
        <View style={styles.filterBar}>
          {filterDate ? (
            <View style={styles.filterActiveContainer}>
              <Text style={styles.filterActiveText}>Đang lọc ngày: {filterDate}</Text>
              <TouchableOpacity onPress={() => setFilterDate('')} style={styles.clearFilterBtn}>
                <Feather name="x-circle" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setFilterCalendarVisible(true)} style={styles.filterTriggerBtn}>
              <Feather name="calendar" size={16} color="#4f46e5" style={{ marginRight: 6 }} />
              <Text style={styles.filterTriggerText}>Lọc đơn đặt chỗ theo ngày...</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {error ? (
        <View style={styles.centerError}>
          <Feather name="alert-circle" size={48} color="#ef4444" style={{ marginBottom: 12 }} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadReservations()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : reservations.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.centerEmpty}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadReservations(true)} />}
        >
          <Feather name="calendar" size={64} color="#cbd5e1" style={{ marginBottom: 16 }} />
          <Text style={styles.emptyTitle}>Chưa có đơn đặt chỗ nào</Text>
          <Text style={styles.emptySubtitle}>Khi bạn đặt chỗ giữ vị trí đỗ xe trước, danh sách sẽ hiển thị tại đây.</Text>
          <TouchableOpacity
            style={styles.bookNowBtn}
            onPress={() => navigation.navigate('Reserve')}
          >
            <Text style={styles.bookNowText}>Đặt chỗ ngay</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadReservations(true)} />}
          showsVerticalScrollIndicator={false}
        >
          {actionLoading && (
            <View style={styles.actionOverlay}>
              <ActivityIndicator size="small" color="#4f46e5" />
              <Text style={styles.actionOverlayText}>Đang xử lý...</Text>
            </View>
          )}

          {filteredReservations.length === 0 ? (
            <View style={styles.centerFilterEmpty}>
              <Feather name="search" size={48} color="#cbd5e1" style={{ marginBottom: 16 }} />
              <Text style={styles.filterEmptyTitle}>Không tìm thấy đơn nào</Text>
              <Text style={styles.filterEmptySubtitle}>Không có đơn đặt chỗ nào vào ngày {filterDate}.</Text>
              <TouchableOpacity onPress={() => setFilterDate('')} style={styles.resetFilterBtn}>
                <Text style={styles.resetFilterBtnText}>Xem tất cả đơn</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredReservations.map((res) => {
              const statusConfig = STATUS_MAP[res.status] || { label: res.status, color: '#64748b', bg: '#f1f5f9' };
              const isLive = ['confirmed', 'checked_in'].includes(res.status);
              const isCancellable = ['pending', 'confirmed'].includes(res.status);

              return (
                <View key={res.reservation_id} style={styles.resCard}>
                  {/* Status Bar */}
                  <View style={styles.cardHeader}>
                    <Text style={styles.plateText}>{res.plate_number}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                      <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  {/* Info Block */}
                  <View style={styles.infoBlock}>
                    <View style={styles.infoRow}>
                      <Feather name="layers" size={14} color="#64748b" />
                      <Text style={styles.infoVal}>
                        {formatFloorLabel(res.floor?.label || res.floor?.floor_code)}
                        {res.zone?.zone_code ? ` · Khu ${res.zone.zone_code}` : ''}
                        {res.slot?.slot_code ? ` · Ô đỗ ${res.slot.slot_code}` : ' (Gán tự động)'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Feather name="clock" size={14} color="#64748b" />
                      <Text style={styles.infoVal}>
                        Thời gian: {formatWindow(res.start_time, res.end_time)}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Feather name="truck" size={14} color="#64748b" />
                      <Text style={styles.infoVal}>
                        {res.vehicleType?.type_name || 'Phương tiện'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Feather name="dollar-sign" size={14} color="#64748b" />
                      <Text style={[styles.infoVal, { fontWeight: '700', color: '#4f46e5' }]}>
                        Phí đặt: {formatMoney(res.price)}
                      </Text>
                    </View>
                    {res.created_at && (
                      <Text style={styles.createdAtText}>Ngày đặt: {formatDateTime(res.created_at)}</Text>
                    )}
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsContainer}>
                    {/* QR Check-in Code */}
                    {isLive && res.qr_token && (
                      <TouchableOpacity
                        style={styles.qrBtn}
                        onPress={() => showQrCode(res.qr_token, res.plate_number)}
                      >
                        <MaterialCommunityIcons name="qrcode" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                        <Text style={styles.qrBtnText}>Mã QR Vào cổng</Text>
                      </TouchableOpacity>
                    )}

                    {/* Repay pending */}
                    {res.status === 'pending' && (
                      <TouchableOpacity
                        style={styles.payBtn}
                        onPress={() => handleRepay(res.reservation_id)}
                      >
                        <Feather name="credit-card" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                        <Text style={styles.payBtnText}>Thanh toán lại</Text>
                      </TouchableOpacity>
                    )}

                    {/* Cancel Button */}
                    {isCancellable && (
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => openCancelModal(res)}
                      >
                        <Feather name="trash-2" size={14} color="#ef4444" style={{ marginRight: 4 }} />
                        <Text style={styles.cancelBtnText}>Hủy đặt chỗ</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }))}
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
            <Text style={styles.qrModalTitle}>QR Check-In</Text>
            <Text style={styles.qrModalSub}>{selectedPlate}</Text>

            {selectedQrToken ? (
              <Image
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${selectedQrToken}` }}
                style={styles.qrImage}
              />
            ) : null}

            <Text style={styles.qrHelpText}>
              Vui lòng đưa mã này ra trước camera quét QR tại cổng phụ khi vào bãi đỗ xe.
            </Text>

            <TouchableOpacity style={styles.closeQrBtn} onPress={() => setQrModalVisible(false)}>
              <Text style={styles.closeQrBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CANCEL CONFIRM MODAL WITH REFUND POLICY */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalContent}>
            <View style={styles.warningIcon}>
              <Feather name="alert-triangle" size={24} color="#ef4444" />
            </View>
            <Text style={styles.cancelTitle}>Xác nhận hủy đặt chỗ</Text>

            {policyLoading ? (
              <ActivityIndicator size="small" color="#4f46e5" style={{ marginVertical: 10 }} />
            ) : cancelTarget?.status === 'confirmed' ? (
              <>
                <View style={styles.policyBlock}>
                  <Text style={styles.policyTitle}>Chính sách hoàn tiền:</Text>
                  <Text style={styles.policyText}>
                    • Hủy trước khi ca đỗ bắt đầu {refundPolicy?.cutoffHours || 1} giờ: Hoàn trả {refundPolicy?.refundPercent || 100}% số tiền.
                  </Text>
                  <Text style={styles.policyText}>
                    • Hủy sau mốc trên: Không được hoàn trả chi phí.
                  </Text>
                  <Text style={styles.policyWarning}>
                    Hệ thống tự động thực hiện hoàn tiền vào tài khoản ngân hàng liên kết.
                  </Text>
                </View>

                {bankRequired && (
                  <View style={styles.bankFieldsContainer}>
                    <Text style={styles.bankInputTitle}>Nhập tài khoản nhận tiền hoàn:</Text>
                    <TouchableOpacity
                      style={[styles.bankInput, { justifyContent: 'center' }]}
                      onPress={() => setBankModalVisible(true)}
                    >
                      <Text style={{ fontSize: 13.5, color: bankName ? '#334155' : '#94a3b8' }}>
                        {bankName || 'Chọn ngân hàng từ danh sách'}
                      </Text>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.bankInput}
                      placeholder="Số tài khoản"
                      placeholderTextColor="#94a3b8"
                      value={bankAccountNumber}
                      onChangeText={setBankAccountNumber}
                      keyboardType="numeric"
                      maxLength={30}
                    />
                    <TextInput
                      style={styles.bankInput}
                      placeholder="Tên chủ tài khoản (viết hoa không dấu)"
                      placeholderTextColor="#94a3b8"
                      value={bankAccountHolder}
                      onChangeText={(val) => setBankAccountHolder(val.toUpperCase())}
                      maxLength={100}
                    />
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.cancelDesc}>
                Bạn có chắc chắn muốn hủy đơn đỗ xe này? Đơn chưa thanh toán sẽ bị hủy ngay lập tức.
              </Text>
            )}

            <View style={styles.cancelButtons}>
              <TouchableOpacity
                style={styles.cancelKeepBtn}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.cancelKeepText}>Giữ lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelConfirmBtn}
                onPress={handleCancel}
              >
                <Text style={styles.cancelConfirmText}>Xác nhận hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FILTER CALENDAR MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={filterCalendarVisible}
        onRequestClose={() => setFilterCalendarVisible(false)}
      >
        <View style={styles.calendarModalOverlay}>
          <View style={styles.calendarModalContent}>
            {/* Header controls */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.calendarArrowBtn}>
                <Feather name="chevron-left" size={20} color="#475569" />
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>Tháng {calendarMonth + 1} / {calendarYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calendarArrowBtn}>
                <Feather name="chevron-right" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Grid */}
            {renderFilterCalendar()}

            <TouchableOpacity
              style={styles.calendarCloseBtn}
              onPress={() => setFilterCalendarVisible(false)}
            >
              <Text style={styles.calendarCloseBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal Chọn Ngân Hàng */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={bankModalVisible}
        onRequestClose={() => setBankModalVisible(false)}
      >
        <View style={styles.bankModalOverlay}>
          <View style={styles.bankModalContent}>
            <View style={styles.bankModalHeader}>
              <Text style={styles.bankModalTitle}>Chọn Ngân Hàng</Text>
              <TouchableOpacity onPress={() => setBankModalVisible(false)} style={styles.bankModalCloseBtn}>
                <Feather name="x" size={20} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <View style={styles.bankSearchWrapper}>
              <Feather name="search" size={16} color="#64748b" style={styles.bankSearchIcon} />
              <TextInput
                style={styles.bankSearchInput}
                placeholder="Tìm kiếm ngân hàng..."
                placeholderTextColor="#94a3b8"
                value={bankSearchQuery}
                onChangeText={setBankSearchQuery}
                autoCapitalize="characters"
              />
            </View>

            <FlatList
              data={filteredBanks}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              style={{ width: '100%', flex: 1 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bankItem}
                  onPress={() => {
                    setBankName(item.shortName);
                    setBankModalVisible(false);
                    setBankSearchQuery('');
                  }}
                >
                  <View style={styles.bankItemTextContainer}>
                    <Text style={styles.bankItemShortName}>{item.shortName}</Text>
                    <Text style={styles.bankItemFullName}>{item.name}</Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* MODAL THÔNG BÁO CHUYỂN SANG PAYOS */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={payosModalVisible}
        onRequestClose={() => setPayosModalVisible(false)}
      >
        <View style={styles.payosModalOverlay}>
          <View style={styles.payosModalContent}>
            <View style={styles.payosIconContainer}>
              <Feather name="credit-card" size={28} color="#4f46e5" />
            </View>
            <Text style={styles.payosModalTitle}>Đang chuyển hướng...</Text>
            <Text style={styles.payosModalDesc}>
              Hệ thống đang kết nối bảo mật đến cổng thanh toán PayOS. Vui lòng giữ kết nối internet và không tắt ứng dụng.
            </Text>
            <ActivityIndicator size="small" color="#4f46e5" style={{ marginVertical: 14 }} />
            <TouchableOpacity
              style={styles.payosConfirmBtn}
              onPress={() => {
                setPayosModalVisible(false);
                if (payosCheckoutUrl) {
                  navigation.navigate('PaymentWebView', { url: payosCheckoutUrl, type: payosType });
                }
              }}
            >
              <Text style={styles.payosConfirmBtnText}>Thanh toán ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL THÔNG BÁO HỦY VÉ THÀNH CÔNG */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={cancelSuccessModalVisible}
        onRequestClose={() => setCancelSuccessModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIconContainer}>
              <Feather name="check-circle" size={32} color="#10b981" />
            </View>
            <Text style={styles.successModalTitle}>Hủy đặt chỗ thành công</Text>
            <Text style={styles.successModalDesc}>
              Đơn đặt chỗ của bạn đã được hủy thành công. Số tiền hoàn lại sẽ được tự động hoàn về tài khoản ngân hàng liên kết của bạn.
            </Text>
            <TouchableOpacity
              style={styles.successConfirmBtn}
              onPress={() => setCancelSuccessModalVisible(false)}
            >
              <Text style={styles.successConfirmBtnText}>Đồng ý</Text>
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
  resCard: {
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
  createdAtText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
    paddingTop: 12,
    gap: 10,
  },
  qrBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#10b981',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  payBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingHorizontal: 8,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelBtnText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
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
  cancelModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 12,
  },
  cancelDesc: {
    fontSize: 13.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  policyBlock: {
    backgroundColor: '#fffbeb',
    borderColor: '#fef3c7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  policyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#b45309',
    marginBottom: 6,
  },
  policyText: {
    fontSize: 12.5,
    color: '#d97706',
    lineHeight: 18,
    marginBottom: 4,
  },
  policyWarning: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#92400e',
    marginTop: 6,
    lineHeight: 16,
  },
  cancelButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelKeepBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelKeepText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  cancelConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelConfirmText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
  },
  filterTriggerText: {
    fontSize: 13.5,
    color: '#64748b',
    fontWeight: '600',
  },
  filterActiveContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
  },
  filterActiveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4f46e5',
  },
  clearFilterBtn: {
    padding: 4,
  },
  centerFilterEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 10,
  },
  filterEmptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  filterEmptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 16,
  },
  resetFilterBtn: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  resetFilterBtnText: {
    color: '#4f46e5',
    fontSize: 13,
    fontWeight: '700',
  },
  calendarModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  calendarModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  calendarArrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    rowGap: 8,
    marginBottom: 16,
  },
  calendarDayHeader: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  calendarDayHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
  },
  calendarCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  calendarCellEmpty: {
    width: '14.28%',
    aspectRatio: 1,
  },
  calendarCellSelected: {
    backgroundColor: '#4f46e5',
  },
  calendarCellToday: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#4f46e5',
  },
  calendarCellText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  calendarCellTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  calendarCellTextToday: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  calendarCloseBtn: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  calendarCloseBtnText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  bankFieldsContainer: {
    width: '100%',
    marginBottom: 20,
    gap: 10,
  },
  bankInputTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  bankInput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 13.5,
    color: '#334155',
    backgroundColor: '#ffffff',
    width: '100%',
  },
  bankModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  bankModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '75%',
    padding: 20,
    alignItems: 'center',
  },
  bankModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  bankModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  bankModalCloseBtn: {
    padding: 4,
  },
  bankSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: '#f8fafc',
    marginBottom: 16,
    width: '100%',
  },
  bankSearchIcon: {
    marginRight: 8,
  },
  bankSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    height: '100%',
    padding: 0,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    width: '100%',
  },
  bankItemTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  bankItemShortName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4f46e5',
  },
  bankItemFullName: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  payosModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  payosModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  payosIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  payosModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  payosModalDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  payosConfirmBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 44,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payosConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  successModalDesc: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  successConfirmBtn: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    height: 44,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
