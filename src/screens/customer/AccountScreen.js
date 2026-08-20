import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function AccountScreen({ navigation }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tài khoản</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {isAuthenticated ? (
          <View style={styles.profileSection}>
            {/* Avatar & Basic Info */}
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {(user?.fullName || user?.fullname || user?.full_name || 'U')?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.profileName}>{user?.fullName || user?.fullname || user?.full_name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || 'Chưa cập nhật email'}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{user?.role?.roleName || 'Khách hàng'}</Text>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuCard}>
              <Text style={styles.menuGroupTitle}>Quản lý dịch vụ</Text>
              
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigation.navigate('Profile')}
              >
                <View style={styles.menuIconText}>
                  <View style={[styles.menuIconWrapper, { backgroundColor: '#e0e7ff' }]}>
                    <Feather name="user" size={16} color="#4f46e5" />
                  </View>
                  <Text style={styles.menuItemText}>Hồ sơ & Ngân hàng hoàn tiền</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigation.navigate('MyParking')}
              >
                <View style={styles.menuIconText}>
                  <View style={[styles.menuIconWrapper, { backgroundColor: '#e0f2fe' }]}>
                    <Feather name="truck" size={16} color="#0284c7" />
                  </View>
                  <Text style={styles.menuItemText}>Xe đang gửi trong bãi</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigation.navigate('MyReservations')}
              >
                <View style={styles.menuIconText}>
                  <View style={[styles.menuIconWrapper, { backgroundColor: '#ecfdf5' }]}>
                    <Feather name="calendar" size={16} color="#059669" />
                  </View>
                  <Text style={styles.menuItemText}>Đơn đặt chỗ trước</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigation.navigate('MyPasses')}
              >
                <View style={styles.menuIconText}>
                  <View style={[styles.menuIconWrapper, { backgroundColor: '#fdf2f8' }]}>
                    <Feather name="credit-card" size={16} color="#db2777" />
                  </View>
                  <Text style={styles.menuItemText}>Vé tháng của tôi</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigation.navigate('Reserve', { type: 'monthly' })}
              >
                <View style={styles.menuIconText}>
                  <View style={[styles.menuIconWrapper, { backgroundColor: '#fef2f2' }]}>
                    <Feather name="shopping-bag" size={16} color="#dc2626" />
                  </View>
                  <Text style={styles.menuItemText}>Đăng ký mua vé tháng</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigation.navigate('ReportIncident')}
              >
                <View style={styles.menuIconText}>
                  <View style={[styles.menuIconWrapper, { backgroundColor: '#fff7ed' }]}>
                    <Feather name="alert-triangle" size={16} color="#ea580c" />
                  </View>
                  <Text style={styles.menuItemText}>Báo cáo sự cố</Text>
                </View>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Logout card */}
            <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
              <Feather name="log-out" size={16} color="#ef4444" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCard}>
              <Feather name="user-x" size={64} color="#cbd5e1" style={{ marginBottom: 16 }} />
              <Text style={styles.emptyTitle}>Bạn chưa đăng nhập</Text>
              <Text style={styles.emptySubtitle}>
                Vui lòng đăng nhập để xem lịch sử đặt chỗ, quản lý xe và đăng ký vé gửi xe tháng.
              </Text>
              <TouchableOpacity 
                style={styles.loginBtn} 
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginBtnText}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  scrollContent: {
    padding: 20,
  },
  profileSection: {
    gap: 20,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4f46e5',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4f46e5',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#ecfeff',
    borderColor: '#06b6d4',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 10,
  },
  badgeText: {
    color: '#0891b2',
    fontSize: 11,
    fontWeight: '700',
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    gap: 4,
  },
  menuGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
    paddingLeft: 8,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  menuIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#334155',
  },
  logoutBtn: {
    backgroundColor: '#fff5f5',
    borderColor: '#fee2e2',
    borderWidth: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14.5,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  loginBtn: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    height: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
