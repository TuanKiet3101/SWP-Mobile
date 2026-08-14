import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import api from '../../config/api';

// Danh sách loại sự cố tương ứng với role staff
const INCIDENT_TYPES_LIST = [
  { value: 'vehicle_damage', label: 'Hư hại xe (Trầy xước, móp méo...)' },
  { value: 'lost_ticket', label: 'Mất thẻ / Mất QR Code' },
  { value: 'wrong_info', label: 'Sai thông tin xe (Biển số, loại xe...)' },
  { value: 'overstay', label: 'Thắc mắc phí quá hạn gửi' },
  { value: 'wrong_zone', label: 'Đỗ sai khu vực quy định' },
  { value: 'other', label: 'Sự cố khác' }
];

export default function ReportIncidentScreen({ navigation }) {
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Loại sự cố
  const [selectedType, setSelectedType] = useState(null);
  const [typeModalVisible, setTypeModalVisible] = useState(false);

  // Danh sách xe trong bãi
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [pickerModalVisible, setPickerModalVisible] = useState(false);

  // Lấy danh sách xe đang gửi trong bãi
  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const { data } = await api.get('/sessions/mine/active');
        setSessions(data.data || []);
      } catch (error) {
        console.warn('Lỗi tải danh sách xe trong bãi:', error);
      }
    };
    fetchActiveSessions();
  }, []);

  // Hàm định nghĩa tên vị trí xe trong bãi
  const formatLocationLabel = (s) => {
    if (!s.slot) return 'Chưa gán vị trí đỗ';
    const floor = s.slot.zone?.floor?.label || s.slot.zone?.floor?.floor_code || '';
    const zone = s.slot.zone?.label || '';
    const slotCode = s.slot.slot_code || '';
    return `Tầng ${floor} · Khu ${zone} · Ô đỗ ${slotCode}`;
  };

  // Hàm định dạng ngày giờ gửi xe
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Hàm yêu cầu sử dụng Camera khi chạy trên Expo Go
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Yêu cầu quyền truy cập',
        'Ứng dụng cần quyền sử dụng máy ảnh để chụp ảnh báo cáo sự cố. Vui lòng cho phép quyền trong cài đặt thiết bị.',
        [{ text: 'Đồng ý' }]
      );
      return false;
    }
    return true;
  };

  // Hàm yêu cầu sử dụng Thư viện ảnh khi chạy trên Expo Go
  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Yêu cầu quyền truy cập',
        'Ứng dụng cần quyền truy cập thư viện ảnh để tải lên ảnh sự cố.',
        [{ text: 'Đồng ý' }]
      );
      return false;
    }
    return true;
  };

  // Hàm chụp ảnh từ Camera
  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Lỗi khi mở camera:', error);
      Alert.alert('Lỗi', 'Không thể mở camera trên thiết bị của bạn.');
    }
  };

  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    const hasPermission = await requestLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Lỗi khi mở thư viện ảnh:', error);
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh.');
    }
  };

  // Hàm gửi đơn báo cáo sự cố lên server
  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Thông báo', 'Vui lòng chọn loại sự cố.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập mô tả chi tiết sự cố.');
      return;
    }

    if (!photo) {
      Alert.alert('Thông báo', 'Vui lòng chụp hoặc tải lên một hình ảnh liên quan đến sự cố.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('type', selectedType.value);
      
      if (selectedSession) {
        formData.append('sessionId', selectedSession.session_id);
      }

      // Chuẩn bị file ảnh để gửi
      const uriParts = photo.split('/');
      const filename = uriParts[uriParts.length - 1];
      const fileType = filename.split('.').pop();

      formData.append('photo', {
        uri: photo,
        name: filename,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
      });

      await api.post('/incidents/customer', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert(
        'Thành công',
        'Báo cáo sự cố đã được gửi đi thành công. Ban quản lý bãi xe sẽ tiến hành xử lý sớm nhất có thể.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Lỗi gửi báo cáo sự cố:', error);
      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra trong quá trình gửi báo cáo. Vui lòng thử lại sau.';
      Alert.alert('Thất bại', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo sự cố</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Hướng dẫn ngắn */}
          <View style={styles.instructionCard}>
            <Feather name="info" size={20} color="#0284c7" style={styles.instructionIcon} />
            <Text style={styles.instructionText}>
              Vui lòng cung cấp hình ảnh thực tế và mô tả chi tiết sự cố gặp phải (ví dụ: hỏng hóc, sai thông tin vé, mất thẻ xe...) để được hỗ trợ tốt nhất.
            </Text>
          </View>

          {/* Chọn loại sự cố */}
          <Text style={styles.label}>Loại sự cố <Text style={{ color: '#ef4444' }}>*</Text></Text>
          <TouchableOpacity 
            style={styles.pickerSelector} 
            onPress={() => setTypeModalVisible(true)}
          >
            <View style={styles.pickerSelectorContent}>
              <Feather name="alert-circle" size={18} color="#64748b" style={{ marginRight: 10 }} />
              <Text 
                style={[
                  styles.pickerSelectorText, 
                  selectedType && { color: '#0f172a', fontWeight: '600' }
                ]}
                numberOfLines={1}
              >
                {selectedType ? selectedType.label : 'Bấm để chọn loại sự cố...'}
              </Text>
            </View>
            <Feather name="chevron-down" size={18} color="#94a3b8" />
          </TouchableOpacity>

          {/* Chọn xe trong bãi */}
          <Text style={styles.label}>Xe liên quan trong bãi (Không bắt buộc)</Text>
          <TouchableOpacity 
            style={styles.pickerSelector} 
            onPress={() => setPickerModalVisible(true)}
          >
            <View style={styles.pickerSelectorContent}>
              <Feather name="truck" size={18} color="#64748b" style={{ marginRight: 10 }} />
              <Text 
                style={[
                  styles.pickerSelectorText, 
                  selectedSession && { color: '#0f172a', fontWeight: '600' }
                ]}
                numberOfLines={1}
              >
                {selectedSession 
                  ? `${selectedSession.plate_number} ${selectedSession.slot ? `(Ô ${selectedSession.slot.slot_code})` : ''}`
                  : 'Bấm để chọn xe liên quan...'
                }
              </Text>
            </View>
            {selectedSession ? (
              <TouchableOpacity 
                style={styles.clearSelectionBtn} 
                onPress={() => setSelectedSession(null)}
              >
                <Feather name="x" size={16} color="#ef4444" />
              </TouchableOpacity>
            ) : (
              <Feather name="chevron-down" size={18} color="#94a3b8" />
            )}
          </TouchableOpacity>

          {/* Form mô tả sự cố */}
          <Text style={styles.label}>Mô tả chi tiết sự cố <Text style={{ color: '#ef4444' }}>*</Text></Text>
          <TextInput
            style={styles.textInput}
            placeholder="Mô tả chi tiết về sự cố bạn đang gặp phải..."
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          {/* Upload ảnh */}
          <Text style={styles.label}>Hình ảnh minh chứng <Text style={{ color: '#ef4444' }}>*</Text></Text>
          
          {photo ? (
            <View style={styles.photoContainer}>
              <Image source={{ uri: photo }} style={styles.previewImage} />
              <TouchableOpacity style={styles.removePhotoButton} onPress={() => setPhoto(null)}>
                <Feather name="trash-2" size={16} color="#ffffff" />
                <Text style={styles.removePhotoText}>Xóa ảnh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePickerOptions}>
              <TouchableOpacity style={styles.pickerButton} onPress={takePhoto}>
                <View style={[styles.iconCircle, { backgroundColor: '#eef2ff' }]}>
                  <Feather name="camera" size={24} color="#4f46e5" />
                </View>
                <Text style={styles.pickerButtonTitle}>Chụp hình</Text>
                <Text style={styles.pickerButtonDesc}>Sử dụng máy ảnh</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.pickerButton} onPress={pickImage}>
                <View style={[styles.iconCircle, { backgroundColor: '#f0fdf4' }]}>
                  <Feather name="image" size={24} color="#22c55e" />
                </View>
                <Text style={styles.pickerButtonTitle}>Chọn ảnh</Text>
                <Text style={styles.pickerButtonDesc}>Từ thư viện thiết bị</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Nút gửi */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Feather name="send" size={18} color="#ffffff" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Gửi báo cáo sự cố</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL PICKER CHỌN LOẠI SỰ CỐ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={typeModalVisible}
        onRequestClose={() => setTypeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Chọn loại sự cố</Text>
            <Text style={styles.bottomSheetSub}>Phân loại giúp phản hồi của bạn được xử lý nhanh hơn</Text>
            
            <FlatList
              data={INCIDENT_TYPES_LIST}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = selectedType?.value === item.value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.sessionItem,
                      isSelected && styles.selectedSessionItem
                    ]}
                    onPress={() => {
                      setSelectedType(item);
                      setTypeModalVisible(false);
                    }}
                  >
                    <View>
                      <Text style={styles.sessionPlate}>{item.label}</Text>
                    </View>
                    {isSelected && (
                      <Feather name="check-circle" size={18} color="#4f46e5" />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={{ maxHeight: 280 }}
            />

            <TouchableOpacity 
              style={styles.closeSheetBtn} 
              onPress={() => setTypeModalVisible(false)}
            >
              <Text style={styles.closeSheetBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL PICKER CHỌN XE TRONG BÃI */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={pickerModalVisible}
        onRequestClose={() => setPickerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>Chọn xe đang gửi</Text>
            <Text style={styles.bottomSheetSub}>Chọn xe liên quan trực tiếp đến sự cố đang báo cáo</Text>
            
            {sessions.length === 0 ? (
              <View style={styles.emptySessionsContainer}>
                <Feather name="truck" size={36} color="#cbd5e1" style={{ marginBottom: 8 }} />
                <Text style={styles.emptySessionsText}>Không tìm thấy xe nào của bạn đang gửi trong bãi.</Text>
              </View>
            ) : (
              <FlatList
                data={sessions}
                keyExtractor={(item) => item.session_id.toString()}
                renderItem={({ item }) => {
                  const isSelected = selectedSession?.session_id === item.session_id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.sessionItem,
                        isSelected && styles.selectedSessionItem
                      ]}
                      onPress={() => {
                        setSelectedSession(item);
                        setPickerModalVisible(false);
                      }}
                    >
                      <View>
                        <Text style={styles.sessionPlate}>{item.plate_number}</Text>
                        <Text style={styles.sessionLocation}>{formatLocationLabel(item)}</Text>
                        <Text style={styles.sessionTime}>Vào bãi: {formatDateTime(item.time_in)}</Text>
                      </View>
                      {isSelected && (
                        <Feather name="check-circle" size={18} color="#4f46e5" />
                      )}
                    </TouchableOpacity>
                  );
                }}
                style={{ maxHeight: 250 }}
              />
            )}

            <TouchableOpacity 
              style={styles.closeSheetBtn} 
              onPress={() => setPickerModalVisible(false)}
            >
              <Text style={styles.closeSheetBtnText}>Đóng</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  instructionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: 13.5,
    color: '#0369a1',
    lineHeight: 18,
    fontWeight: '500',
  },
  label: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: -4,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: '#0f172a',
    height: 120,
  },
  pickerSelector: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pickerSelectorText: {
    fontSize: 14.5,
    color: '#94a3b8',
  },
  clearSelectionBtn: {
    backgroundColor: '#fee2e2',
    padding: 4,
    borderRadius: 8,
  },
  imagePickerOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  pickerButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pickerButtonTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  pickerButtonDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  removePhotoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 14,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Picker Modal Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 10,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  bottomSheetSub: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  emptySessionsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptySessionsText: {
    fontSize: 13.5,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
    marginBottom: 10,
  },
  selectedSessionItem: {
    borderColor: '#4f46e5',
    backgroundColor: '#f5f3ff',
  },
  sessionPlate: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  sessionLocation: {
    fontSize: 12.5,
    color: '#475569',
    fontWeight: '500',
    marginTop: 2,
  },
  sessionTime: {
    fontSize: 11.5,
    color: '#94a3b8',
    marginTop: 4,
  },
  closeSheetBtn: {
    backgroundColor: '#f1f5f9',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  closeSheetBtnText: {
    color: '#475569',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
