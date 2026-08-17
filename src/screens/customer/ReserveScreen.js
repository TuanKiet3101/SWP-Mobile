import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import api from '../../config/api';

// --- Ca đỗ xe cắp nách ---
const SHIFTS = [
  { id: 'morning', label: 'Ca sáng', start: '06:00', end: '12:00' },
  { id: 'afternoon', label: 'Ca chiều', start: '12:00', end: '18:00' },
  { id: 'evening', label: 'Ca tối', start: '18:00', end: '22:00' },
  { id: 'overnight', label: 'Ca qua đêm', start: '22:00', end: '06:00' },
];

const toDateStr = (d) => {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const formatMoney = (v) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(v || 0)
    .replace('₫', 'đ');
};

// --- Chuẩn hóa biển số xe Việt Nam ---
const L = '[A-Z]';
const PATTERNS = [
  {
    re: new RegExp(`^(\\d{2})(${L}{2})(\\d{3})(\\d{2})$`),
    normalize: ([, prov, series, a, b]) => `${prov}${series}-${a}.${b}`,
  },
  {
    re: new RegExp(`^(\\d{2})(${L})([1-9])(\\d{3})(\\d{2})$`),
    normalize: ([, prov, series, digit, a, b]) => `${prov}${series}${digit}-${a}.${b}`,
  },
  {
    re: new RegExp(`^(\\d{2})(${L})(\\d{3})(\\d{2})$`),
    normalize: ([, prov, series, a, b]) => `${prov}${series}-${a}.${b}`,
  },
  {
    re: new RegExp(`^(\\d{2})(${L}{2})(\\d{4})$`),
    normalize: ([, prov, series, num]) => `${prov}${series}-${num}`,
  },
  {
    re: new RegExp(`^(\\d{2})(${L})([1-9])(\\d{4})$`),
    normalize: ([, prov, series, digit, num]) => `${prov}${series}${digit}-${num}`,
  },
  {
    re: new RegExp(`^(\\d{2})(${L})(\\d{4})$`),
    normalize: ([, prov, series, num]) => `${prov}${series}-${num}`,
  },
];

function cleanPlateInput(input) {
  return String(input || '')
    .trim()
    .toUpperCase()
    .replace(/Đ/g, 'D')
    .replace(/[^A-Z0-9]/g, '');
}

function validateAndNormalizePlateVN(input) {
  const s = cleanPlateInput(input);
  if (!s) return { valid: false, normalized: '', error: 'Biển số xe không được để trống' };

  for (const { re, normalize } of PATTERNS) {
    const m = s.match(re);
    if (m) {
      const prov = parseInt(m[1], 10);
      if (prov < 11 || prov > 99) {
        return { valid: false, normalized: '', error: 'Mã tỉnh/thành (2 số đầu) không hợp lệ (11-99)' };
      }
      return { valid: true, normalized: normalize(m), error: null };
    }
  }
  return {
    valid: false,
    normalized: '',
    error: 'Biển số sai định dạng VN. VD: 30A-123.45, 59F1-345.67'
  };
}

export default function ReserveScreen({ route, navigation }) {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [floors, setFloors] = useState([]);
  const [capacity, setCapacity] = useState([]);
  const [metaLoading, setMetaLoading] = useState(true);

  // Booking Type State: 'daily' or 'monthly'
  const [bookingType, setBookingType] = useState('daily');

  // Form State
  const [plateNumber, setPlateNumber] = useState('');
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [publicInfo, setPublicInfo] = useState(null);

  const handlePlateChange = (text) => {
    let clean = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    let formatted = clean;
    if (clean.length > 2) {
      const prov = clean.slice(0, 2);
      let rest = clean.slice(2);
      let series = '';
      let numPart = '';

      if (rest.length > 0) {
        if (/^[A-Z]{2}/.test(rest)) {
          series = rest.slice(0, 2);
          numPart = rest.slice(2);
        } else if (/^[A-Z][1-9]/.test(rest)) {
          series = rest.slice(0, 2);
          numPart = rest.slice(2);
        } else if (/^[A-Z]/.test(rest)) {
          series = rest.slice(0, 1);
          numPart = rest.slice(1);
        } else {
          series = '';
          numPart = rest;
        }
      }

      if (series) {
        formatted = `${prov}${series}`;
        if (numPart.length > 0) {
          formatted += `-${numPart}`;
          if (numPart.length === 5) {
            formatted = `${prov}${series}-${numPart.slice(0, 3)}.${numPart.slice(3)}`;
          } else if (numPart.length > 5) {
            formatted = `${prov}${series}-${numPart.slice(0, 3)}.${numPart.slice(3, 5)}`;
          }
        }
      }
    }
    setPlateNumber(formatted);
  };
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()));
  const [selectedShift, setSelectedShift] = useState('');

  // Real-time capacity preview (daily)
  const [availDetails, setAvailDetails] = useState(null);
  const [availLoading, setAvailLoading] = useState(false);

  // Real-time capacity & pricing preview (monthly)
  const [passCapacity, setPassCapacity] = useState(null);
  const [capacityLoading, setCapacityLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Parse incoming route params
  useEffect(() => {
    if (route?.params?.type === 'monthly') {
      setBookingType('monthly');
    } else if (route?.params?.type === 'daily') {
      setBookingType('daily');
    }
  }, [route?.params?.type]);

  // Calendar states
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonthIndex = (y, m) => {
    const day = new Date(y, m, 1).getDay();
    return (day + 6) % 7; // Monday is 0
  };

  const isPrevMonthDisabled = () => {
    const now = new Date();
    return calendarYear < now.getFullYear() ||
      (calendarYear === now.getFullYear() && calendarMonth <= now.getMonth());
  };

  const isShiftPassed = (shiftId) => {
    if (selectedDate !== toDateStr(new Date())) return false;

    const now = new Date();
    const currHour = now.getHours();
    const currMin = now.getMinutes();
    const currTotalMins = currHour * 60 + currMin;

    if (shiftId === 'morning') {
      return currTotalMins >= 12 * 60; // Ends at 12:00
    }
    if (shiftId === 'afternoon') {
      return currTotalMins >= 18 * 60; // Ends at 18:00
    }
    if (shiftId === 'evening') {
      return currTotalMins >= 22 * 60; // Ends at 22:00
    }
    if (shiftId === 'overnight') {
      // Starts at 22:00, ends at 06:00 next day. Valid all day D, starts at 22:00.
      return false;
    }
    return false;
  };

  const prevMonth = () => {
    if (isPrevMonthDisabled()) return;
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

  const renderCalendar = () => {
    const days = [];
    const firstDayIdx = getFirstDayOfMonthIndex(calendarYear, calendarMonth);
    const totalDays = getDaysInMonth(calendarYear, calendarMonth);

    for (let i = 0; i < firstDayIdx; i++) {
      days.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      days.push(d);
    }

    const todayStr = toDateStr(new Date());

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
          const isSelected = dayStr === selectedDate;
          const isToday = dayStr === todayStr;
          const isPast = dayStr < todayStr;

          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.calendarCell,
                isSelected && styles.calendarCellSelected,
                isToday && !isSelected && styles.calendarCellToday,
                isPast && styles.calendarCellDisabled
              ]}
              onPress={() => {
                if (isPast) return;
                setSelectedDate(dayStr);
                setCalendarVisible(false);
              }}
              disabled={isPast}
            >
              <Text style={[
                styles.calendarCellText,
                isSelected && styles.calendarCellTextSelected,
                isToday && !isSelected && styles.calendarCellTextToday,
                isPast && styles.calendarCellTextDisabled
              ]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Load master data
  const loadMeta = useCallback(async () => {
    setMetaLoading(true);
    try {
      const [vtRes, floorsRes, availRes, infoRes] = await Promise.all([
        api.get('/vehicle-types'),
        api.get('/floors'),
        api.get('/public/availability').catch(() => null),
        api.get('/public/info').catch(() => null)
      ]);
      setVehicleTypes(vtRes.data?.data || []);
      setFloors(floorsRes.data?.data || []);
      setCapacity(availRes?.data?.data || []);
      setPublicInfo(infoRes?.data?.data || null);
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu bãi đỗ xe.');
    } finally {
      setMetaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  // Lọc tầng có khu đỗ của loại xe đang chọn
  const filteredFloors = floors.filter(f => {
    if (!selectedVehicleType) return true;
    const floorMeta = capacity.find(c => String(c.floorId) === String(f.floor_id));
    if (!floorMeta) return true;
    const zones = (floorMeta.zones || []).filter(z => String(z.vehicleTypeId) === String(selectedVehicleType));
    return zones.reduce((sum, z) => sum + (z.total || 0), 0) > 0;
  });

  const formatFloorLabel = (label) => {
    if (!label) return '';
    return /^(tầng|hầm)\b/i.test(label) ? label : `Tầng ${label}`;
  };

  // Check availability realtime
  const checkRealtimeAvailability = useCallback(async () => {
    if (bookingType !== 'daily' || !selectedFloor || !selectedVehicleType || !selectedDate || !selectedShift) {
      setAvailDetails(null);
      return;
    }
    setAvailLoading(true);
    try {
      const { data } = await api.get('/reservations/window-availability', {
        params: {
          floorId: Number(selectedFloor),
          vehicleTypeId: Number(selectedVehicleType),
          shiftId: selectedShift,
          arrivalDate: selectedDate
        }
      });
      setAvailDetails(data.data);
    } catch (err) {
      console.error(err);
      setAvailDetails(null);
    } finally {
      setAvailLoading(false);
    }
  }, [selectedFloor, selectedVehicleType, selectedDate, selectedShift, bookingType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkRealtimeAvailability();
    }, 400);
    return () => clearTimeout(timer);
  }, [checkRealtimeAvailability]);

  // Check pass capacity realtime
  const checkPassCapacity = useCallback(async () => {
    if (bookingType !== 'monthly' || !selectedFloor || !selectedVehicleType) {
      setPassCapacity(null);
      return;
    }
    setCapacityLoading(true);
    try {
      const { data } = await api.get('/monthly-passes/capacity', {
        params: {
          floorId: Number(selectedFloor),
          vehicleTypeId: Number(selectedVehicleType)
        }
      });
      setPassCapacity(data.data);
    } catch (err) {
      console.error(err);
      setPassCapacity(null);
    } finally {
      setCapacityLoading(false);
    }
  }, [selectedFloor, selectedVehicleType, bookingType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkPassCapacity();
    }, 400);
    return () => clearTimeout(timer);
  }, [checkPassCapacity]);

  // Reset shift selection if it has passed due to date change
  useEffect(() => {
    if (selectedShift && isShiftPassed(selectedShift)) {
      setSelectedShift('');
    }
  }, [selectedDate, selectedShift]);

  const handleBooking = async () => {
    // Validate
    const plateVal = validateAndNormalizePlateVN(plateNumber);
    if (!plateVal.valid) {
      Alert.alert('Lỗi biển số', plateVal.error);
      return;
    }
    if (!selectedVehicleType) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại xe.');
      return;
    }
    if (!selectedFloor) {
      Alert.alert('Lỗi', 'Vui lòng chọn tầng đỗ.');
      return;
    }

    const todayStr = toDateStr(new Date());

    if (bookingType === 'daily') {
      if (selectedDate < todayStr) {
        Alert.alert('Lỗi', 'Ngày đến không thể ở quá khứ.');
        return;
      }
      if (selectedShift && isShiftPassed(selectedShift)) {
        Alert.alert('Lỗi', 'Ca gửi đã chọn đã quá giờ đỗ.');
        return;
      }
      if (!selectedShift) {
        Alert.alert('Lỗi', 'Vui lòng chọn ca đỗ xe.');
        return;
      }
      if (availDetails && !availDetails.canBook) {
        Alert.alert('Hết chỗ', 'Không còn chỗ trống trong ca đã chọn. Vui lòng chọn ca hoặc tầng khác.');
        return;
      }

      setSubmitting(true);
      try {
        const { data } = await api.post('/reservations', {
          plateNumber: plateVal.normalized,
          vehicleTypeId: Number(selectedVehicleType),
          floorId: Number(selectedFloor),
          shiftId: selectedShift,
          arrivalDate: selectedDate
        });

        const { checkoutUrl } = data.data || {};

        Alert.alert(
          'Đặt chỗ thành công',
          'Đơn đỗ xe đã được khởi tạo. Bạn sẽ được chuyển tới cổng thanh toán PayOS.',
          [
            {
              text: 'Thanh toán ngay',
              onPress: () => {
                if (checkoutUrl) {
                  navigation.replace('Main', { screen: 'Account' });
                  navigation.navigate('PaymentWebView', { url: checkoutUrl, type: 'reservation' });
                } else {
                  navigation.replace('Main', { screen: 'Account' });
                }
              }
            }
          ]
        );
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.error?.message || 'Không thể tạo đơn đặt chỗ.';
        Alert.alert('Đặt chỗ thất bại', msg);
      } finally {
        setSubmitting(false);
      }
    } else {
      // Monthly Pass Registration
      if (selectedDate < todayStr) {
        Alert.alert('Lỗi', 'Ngày bắt đầu hiệu lực không thể ở quá khứ.');
        return;
      }
      if (passCapacity && passCapacity.available === 0) {
        Alert.alert('Hết chỗ', 'Không còn vị trí đăng ký vé tháng tại tầng này cho loại xe của bạn.');
        return;
      }

      setSubmitting(true);
      try {
        const { data } = await api.post('/monthly-passes', {
          plateNumber: plateVal.normalized,
          vehicleTypeId: Number(selectedVehicleType),
          floorId: Number(selectedFloor),
          startDate: selectedDate
        });

        const { checkoutUrl } = data.data || {};

        Alert.alert(
          'Đăng ký thành công',
          'Đơn mua vé tháng đã được tạo. Bạn sẽ được chuyển tới cổng thanh toán PayOS.',
          [
            {
              text: 'Thanh toán ngay',
              onPress: () => {
                if (checkoutUrl) {
                  navigation.replace('Main', { screen: 'Account' });
                  navigation.navigate('PaymentWebView', { url: checkoutUrl, type: 'pass' });
                } else {
                  navigation.replace('Main', { screen: 'Account' });
                }
              }
            }
          ]
        );
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.error?.message || 'Không thể đăng ký mua vé tháng.';
        Alert.alert('Đăng ký thất bại', msg);
      } finally {
        setSubmitting(false);
      }
    }
  };



  if (metaLoading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Đang tải cấu hình bãi xe...</Text>
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
        <Text style={styles.headerTitle}>Đặt chỗ đỗ xe</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          {/* TAB SELECTOR */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, bookingType === 'daily' && styles.tabButtonActive]}
              onPress={() => setBookingType('daily')}
            >
              <Text style={[styles.tabText, bookingType === 'daily' && styles.tabTextActive]}>Đặt theo ngày</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, bookingType === 'monthly' && styles.tabButtonActive]}
              onPress={() => setBookingType('monthly')}
            >
              <Text style={[styles.tabText, bookingType === 'monthly' && styles.tabTextActive]}>Đăng ký Vé tháng</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formCard}>
            {/* Biển số xe */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Biển số xe *</Text>
              <View style={styles.inputWrapper}>
                <Feather name="credit-card" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: 30A-123.45 hoặc 59F1-345.67"
                  placeholderTextColor="#94a3b8"
                  value={plateNumber}
                  onChangeText={handlePlateChange}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Loại xe */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại xe *</Text>
              <View style={styles.optionsGrid}>
                {vehicleTypes.map((vt) => {
                  const isSel = String(vt.vehicle_type_id) === String(selectedVehicleType);
                  return (
                    <TouchableOpacity
                      key={vt.vehicle_type_id}
                      style={[styles.optionItem, isSel && styles.optionItemSel]}
                      onPress={() => {
                        setSelectedVehicleType(vt.vehicle_type_id);
                        setSelectedFloor(''); // Reset floor
                      }}
                    >
                      <Feather
                        name={vt.type_code?.toLowerCase()?.includes('motor') ? 'navigation' : 'truck'}
                        size={16}
                        color={isSel ? '#4f46e5' : '#64748b'}
                      />
                      <Text style={[styles.optionLabel, isSel && styles.optionLabelSel]}>{vt.type_name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Tầng */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tầng đỗ xe *</Text>
              <View style={styles.optionsGrid}>
                {filteredFloors.map((fl) => {
                  const isSel = String(fl.floor_id) === String(selectedFloor);
                  return (
                    <TouchableOpacity
                      key={fl.floor_id}
                      style={[styles.optionItem, isSel && styles.optionItemSel]}
                      onPress={() => setSelectedFloor(fl.floor_id)}
                    >
                      <Feather name="layers" size={16} color={isSel ? '#4f46e5' : '#64748b'} />
                      <Text style={[styles.optionLabel, isSel && styles.optionLabelSel]}>
                        {formatFloorLabel(fl.label || fl.floor_code)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Ngày đến / Ngày hiệu lực */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {bookingType === 'daily' ? 'Ngày đến *' : 'Ngày bắt đầu hiệu lực *'}
              </Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setCalendarVisible(true)}
              >
                <Feather name="calendar" size={16} color="#4f46e5" style={styles.inputIcon} />
                <Text style={[styles.input, { textAlignVertical: 'center', lineHeight: 46 }]}>
                  {selectedDate ? `Đã chọn: ${selectedDate}` : 'Chọn ngày từ lịch...'}
                </Text>
                <Feather name="chevron-down" size={16} color="#94a3b8" />
              </TouchableOpacity>

              {/* CALENDAR MODAL */}
              <Modal
                animationType="fade"
                transparent={true}
                visible={calendarVisible}
                onRequestClose={() => setCalendarVisible(false)}
              >
                <View style={styles.calendarModalOverlay}>
                  <View style={styles.calendarModalContent}>
                    {/* Header controls */}
                    <View style={styles.calendarHeader}>
                      <TouchableOpacity
                        onPress={prevMonth}
                        style={[styles.calendarArrowBtn, isPrevMonthDisabled() && styles.calendarArrowBtnDisabled]}
                        disabled={isPrevMonthDisabled()}
                      >
                        <Feather name="chevron-left" size={20} color={isPrevMonthDisabled() ? '#cbd5e1' : '#475569'} />
                      </TouchableOpacity>
                      <Text style={styles.calendarMonthTitle}>Tháng {calendarMonth + 1} / {calendarYear}</Text>
                      <TouchableOpacity onPress={nextMonth} style={styles.calendarArrowBtn}>
                        <Feather name="chevron-right" size={20} color="#475569" />
                      </TouchableOpacity>
                    </View>

                    {/* Grid */}
                    {renderCalendar()}

                    <TouchableOpacity
                      style={styles.calendarCloseBtn}
                      onPress={() => setCalendarVisible(false)}
                    >
                      <Text style={styles.calendarCloseBtnText}>Hủy bỏ</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>

            {/* Ca gửi (chỉ hiển thị nếu Đỗ theo ngày) */}
            {bookingType === 'daily' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Ca gửi *</Text>
                <View style={styles.shiftsGrid}>
                  {SHIFTS.map((sf) => {
                    const isSel = sf.id === selectedShift;
                    const isPassed = isShiftPassed(sf.id);
                    return (
                      <TouchableOpacity
                        key={sf.id}
                        style={[
                          styles.shiftItem,
                          isSel && styles.shiftItemSel,
                          isPassed && styles.shiftItemDisabled
                        ]}
                        onPress={() => {
                          if (isPassed) return;
                          setSelectedShift(sf.id);
                        }}
                        disabled={isPassed}
                      >
                        <Text style={[
                          styles.shiftLabel,
                          isSel && styles.shiftLabelSel,
                          isPassed && styles.shiftLabelDisabled
                        ]}>{sf.label}</Text>
                        <Text style={[
                          styles.shiftTime,
                          isSel && styles.shiftTimeSel,
                          isPassed && styles.shiftTimeDisabled
                        ]}>{sf.start} - {sf.end}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Realtime capacity feedback (daily) */}
            {(bookingType === 'daily' && selectedFloor && selectedVehicleType && selectedDate && selectedShift) && (
              <View style={styles.availCard}>
                {availLoading ? (
                  <View style={styles.availRow}>
                    <ActivityIndicator size="small" color="#4f46e5" />
                    <Text style={styles.availText}>Đang kiểm tra vị trí trống...</Text>
                  </View>
                ) : availDetails ? (
                  <View style={styles.availRow}>
                    <Feather
                      name={availDetails.canBook ? "check-circle" : "x-circle"}
                      size={20}
                      color={availDetails.canBook ? "#10b981" : "#ef4444"}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.availTitle, { color: availDetails.canBook ? "#10b981" : "#ef4444" }]}>
                        {availDetails.canBook ? `Còn trống ${availDetails.available ?? availDetails.availableSlots ?? availDetails.availableCount ?? availDetails.remaining ?? availDetails.count ?? availDetails.slots ?? 0} chỗ` : 'Đã hết vị trí trống'}
                      </Text>
                      <Text style={styles.availSub}>
                        {availDetails.canBook
                          ? 'Hệ thống sẽ gán vị trí tốt nhất khi xe vào bãi.'
                          : 'Vui lòng chọn tầng đỗ hoặc ca khác.'}
                      </Text>
                      {publicInfo?.bookingFee !== undefined && (
                        <Text style={[styles.availSub, { marginTop: 6, color: '#4f46e5', fontWeight: '700' }]}>
                          Phí giữ chỗ (đặt trước): {formatMoney(publicInfo.bookingFee)}
                        </Text>
                      )}
                    </View>
                  </View>
                ) : (
                  <Text style={styles.availError}>Không thể kiểm tra chỗ trống.</Text>
                )}
              </View>
            )}

            {/* Realtime capacity and pricing feedback (monthly) */}
            {(bookingType === 'monthly' && selectedFloor && selectedVehicleType) && (
              <View style={styles.infoCard}>
                {capacityLoading ? (
                  <View style={styles.infoRowCenter}>
                    <ActivityIndicator size="small" color="#4f46e5" />
                    <Text style={styles.infoText}>Đang tải thông tin chi tiết...</Text>
                  </View>
                ) : passCapacity ? (
                  <View style={styles.passDetails}>
                    <View style={styles.passDetailRow}>
                      <Text style={styles.passDetailLabel}>Chỗ trống vé tháng:</Text>
                      <Text style={[styles.passDetailValue, { color: passCapacity.available > 0 ? '#10b981' : '#ef4444' }]}>
                        {passCapacity.available > 0 ? `${passCapacity.available} chỗ còn trống` : 'Hết chỗ đăng ký'}
                      </Text>
                    </View>
                    <View style={styles.passDetailRow}>
                      <Text style={styles.passDetailLabel}>Giá vé tháng (1 tháng):</Text>
                      <Text style={[styles.passDetailValue, styles.priceValue]}>
                        {formatMoney(passCapacity.price || publicInfo?.monthlyPassPrice || 0)}
                      </Text>
                    </View>
                    <Text style={styles.passNoticeText}>
                      * Vé tháng có giá trị trong vòng 1 tháng từ ngày bắt đầu đính kèm. Bạn được ra vào không giới hạn số lượt và miễn phí gửi trong ca.
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.infoError}>Không tìm thấy thông tin gói vé.</Text>
                )}
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleBooking}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Feather name={bookingType === 'daily' ? 'bookmark' : 'shopping-bag'} size={18} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>
                    {bookingType === 'daily'
                      ? `Đặt chỗ đỗ & Thanh toán (${formatMoney(publicInfo?.bookingFee || 0)})`
                      : `Đăng ký & Thanh toán (${formatMoney(passCapacity?.price || publicInfo?.monthlyPassPrice || 0)})`}
                  </Text>
                </>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 20,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
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
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    gap: 8,
  },
  optionItemSel: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  optionLabel: {
    fontSize: 13.5,
    color: '#64748b',
    fontWeight: '600',
  },
  optionLabelSel: {
    color: '#4f46e5',
  },
  optionSubText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
  shiftsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  shiftItem: {
    flex: 1,
    minWidth: '45%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    gap: 4,
  },
  shiftItemSel: {
    borderColor: '#4f46e5',
    backgroundColor: '#eef2ff',
  },
  shiftLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  shiftLabelSel: {
    color: '#4f46e5',
  },
  shiftTime: {
    fontSize: 12,
    color: '#64748b',
  },
  shiftTimeSel: {
    color: '#4f46e5',
  },
  availCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  availRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  availText: {
    fontSize: 13.5,
    color: '#16a34a',
    fontWeight: '600',
  },
  availTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  availSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  availError: {
    fontSize: 13,
    color: '#ef4444',
  },
  submitBtn: {
    height: 52,
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
    marginTop: 10,
  },
  submitBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
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
  calendarArrowBtnDisabled: {
    backgroundColor: '#f8fafc',
    opacity: 0.5,
  },
  calendarCellDisabled: {
    backgroundColor: 'transparent',
  },
  calendarCellTextDisabled: {
    color: '#cbd5e1',
    fontWeight: '400',
  },
  shiftItemDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
    opacity: 0.6,
  },
  shiftLabelDisabled: {
    color: '#94a3b8',
    fontWeight: '400',
  },
  shiftTimeDisabled: {
    color: '#cbd5e1',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#4f46e5',
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 13.5,
    color: '#64748b',
  },
  infoError: {
    fontSize: 13,
    color: '#ef4444',
    textAlign: 'center',
  },
  passDetails: {
    gap: 10,
  },
  passDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passDetailLabel: {
    fontSize: 13.5,
    color: '#64748b',
    fontWeight: '500',
  },
  passDetailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  priceValue: {
    color: '#4f46e5',
    fontSize: 16,
  },
  passNoticeText: {
    fontSize: 11.5,
    color: '#94a3b8',
    lineHeight: 16,
    marginTop: 4,
  },
});
