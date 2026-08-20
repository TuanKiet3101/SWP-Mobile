import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

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

export default function ProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || user?.fullname || user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bankName, setBankName] = useState(user?.bankName || user?.bank_name || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(user?.bankAccountNumber || user?.bank_account_number || '');
  const [bankAccountHolder, setBankAccountHolder] = useState(user?.bankAccountHolder || user?.bank_account_holder || '');
  const [loading, setLoading] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState('');

  const filteredBanks = VIETNAM_BANKS.filter((b) => {
    const query = bankSearchQuery.toUpperCase().trim();
    if (!query) return true;
    return (
      b.code.includes(query) ||
      b.shortName.includes(query) ||
      b.name.toUpperCase().includes(query)
    );
  });

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Thông báo', 'Họ tên không được để trống.');
      return;
    }

    if (phone.trim() && !/^0\d{9,10}$/.test(phone.trim())) {
      Alert.alert('Thông báo', 'Số điện thoại không hợp lệ (0 + 9-10 chữ số).');
      return;
    }

    // Nếu nhập thông tin ngân hàng thì phải đầy đủ cả 3 trường, hoặc xóa trắng cả 3 trường
    const hasAnyBankField = bankName.trim() || bankAccountNumber.trim() || bankAccountHolder.trim();
    const hasAllBankFields = bankName.trim() && bankAccountNumber.trim() && bankAccountHolder.trim();

    if (hasAnyBankField && !hasAllBankFields) {
      Alert.alert('Thông báo', 'Nếu muốn liên kết ngân hàng nhận hoàn tiền, vui lòng điền đầy đủ cả 3 trường (Tên ngân hàng, Số tài khoản, Chủ tài khoản). Hoặc để trống cả 3 để xóa thông tin.');
      return;
    }

    if (bankAccountNumber.trim() && !/^\d{6,30}$/.test(bankAccountNumber.trim())) {
      Alert.alert('Thông báo', 'Số tài khoản ngân hàng chỉ chứa số (từ 6 đến 30 ký tự).');
      return;
    }

    setLoading(false);
    setLoading(true);

    try {
      const { data } = await api.patch('/auth/me', {
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        bankName: bankName.trim() || null,
        bankAccountNumber: bankAccountNumber.trim() || null,
        bankAccountHolder: bankAccountHolder.trim() || null,
      });

      if (data && data.data) {
        await updateUser(data.data);
        Alert.alert('Thành công', 'Cập nhật thông tin hồ sơ thành công.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', err.response?.data?.error?.message || 'Cập nhật hồ sơ thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Thông tin cơ bản */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên <Text style={{ color: '#ef4444' }}>*</Text></Text>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={16} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ tên đầy đủ"
                  value={fullName}
                  onChangeText={setFullName}
                  maxLength={100}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              <View style={styles.inputWrapper}>
                <Feather name="phone" size={16} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại (ví dụ: 0912345678)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ email</Text>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Feather name="mail" size={16} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: '#94a3b8' }]}
                  value={user?.email}
                  editable={false}
                />
              </View>
              <Text style={styles.hintText}>Email không thể thay đổi</Text>
            </View>
          </View>

          {/* Tài khoản ngân hàng nhận hoàn tiền */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tài khoản ngân hàng hoàn tiền</Text>
            <Text style={styles.sectionDesc}>
              Nhập tài khoản ngân hàng để hệ thống tự động hoàn phí đặt chỗ hoặc hoàn vé tháng khi bạn thực hiện hủy đơn hợp lệ.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên ngân hàng</Text>
              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={() => setBankModalVisible(true)}
              >
                <Feather name="box" size={16} color="#64748b" style={styles.inputIcon} />
                <Text style={[styles.input, { lineHeight: 42, color: bankName ? '#334155' : '#94a3b8' }]}>
                  {bankName || 'Chọn ngân hàng từ danh sách'}
                </Text>
                <Feather name="chevron-down" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số tài khoản</Text>
              <View style={styles.inputWrapper}>
                <Feather name="credit-card" size={16} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số tài khoản ngân hàng"
                  value={bankAccountNumber}
                  onChangeText={setBankAccountNumber}
                  keyboardType="numeric"
                  maxLength={30}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên chủ tài khoản (viết hoa không dấu)</Text>
              <View style={styles.inputWrapper}>
                <Feather name="file-text" size={16} color="#64748b" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ví dụ: NGUYEN VAN A"
                  value={bankAccountHolder}
                  onChangeText={(val) => setBankAccountHolder(val.toUpperCase())}
                  maxLength={100}
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Feather name="check" size={18} color="#ffffff" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Lưu thông tin</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

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
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  sectionCard: {
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  sectionDesc: {
    fontSize: 12.5,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    height: '100%',
    padding: 0,
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  hintText: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    marginLeft: 2,
  },
  saveBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  saveBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
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
});
