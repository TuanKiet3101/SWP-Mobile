import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user, logout } = useAuth();

  const handleHeroBtnPress = () => {
    if (isAuthenticated) {
      navigation.navigate('Account');
    } else {
      navigation.navigate('Register');
    }
  };

  const stats = [
    { value: '4', label: 'Vai trò người dùng' },
    { value: '100%', label: 'Tính phí tự động' },
    { value: '24/7', label: 'Theo dõi thời gian thực' },
    { value: '0đ', label: 'Đăng ký tài khoản' },
  ];

  const guestLinks = [
    {
      to: 'Rules',
      title: 'Bảng giá',
      desc: 'Xem giá đỗ theo loại xe — công khai.',
      icon: 'dollar-sign',
    },
    {
      to: 'Slots',
      title: 'Chỗ trống',
      desc: 'Tra cứu chỗ trống theo thời gian thực.',
      icon: 'map-pin',
    },
    {
      to: 'Rules',
      title: 'Quy định',
      desc: 'Giờ mở cửa, nội quy bãi đỗ xe.',
      icon: 'info',
    },
    {
      to: 'ReportIncident',
      title: 'Báo cáo sự cố',
      desc: 'Gửi khiếu nại về hư hại xe hoặc phản hồi sự cố bãi đỗ.',
      icon: 'alert-triangle',
    },
  ];

  const features = [
    {
      title: 'Tìm chỗ tức thì',
      desc: 'Xem chỗ trống theo tầng và khu vực theo thời gian thực, không còn chạy lòng vòng.',
      icon: 'search',
    },
    {
      title: 'Đặt chỗ & vé tháng',
      desc: 'Giữ chỗ trước khi đến và mua vé tháng chỉ với vài thao tác trên điện thoại.',
      icon: 'calendar',
    },
    {
      title: 'Thanh toán minh bạch',
      desc: 'Tính phí tự động theo giờ/ngày và loại xe, hóa đơn rõ ràng cho mỗi lượt gửi.',
      icon: 'credit-card',
    },
    {
      title: 'Phân quyền rõ ràng',
      desc: 'Admin, Quản lý, Nhân viên và Khách hàng — mỗi vai trò có trải nghiệm riêng.',
      icon: 'shield',
    },
    {
      title: 'Báo cáo & thống kê',
      desc: 'Doanh thu theo ngày, tỷ lệ lấp đầy và phân tích giờ cao điểm trực quan.',
      icon: 'bar-chart-2',
    },
    {
      title: 'Vận hành tại cổng',
      desc: 'Nhân viên ghi nhận xe vào/ra nhanh chóng, hạn chế ùn tắc tối đa.',
      icon: 'activity',
    },
  ];

  const steps = [
    { n: '01', title: 'Đăng ký tài khoản', desc: 'Tạo tài khoản khách hàng miễn phí nhanh chóng.' },
    { n: '02', title: 'Tìm & đặt chỗ', desc: 'Chọn bãi đỗ, xem chỗ trống và giữ chỗ theo nhu cầu.' },
    { n: '03', title: 'Gửi xe & thanh toán', desc: 'Vào/ra bằng biển số, hệ thống tính phí tự động.' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* TOP HEADER BAR */}
      <View style={styles.topHeaderBar}>
        <View style={styles.logoRow}>
          <Feather name="aperture" size={22} color="#4f46e5" />
          <Text style={styles.logoText}>PBMS</Text>
        </View>
        <View style={styles.headerAuthButtons}>
          {isAuthenticated ? (
            <View style={styles.headerUserContainer}>
              <Text style={styles.headerWelcomeText} numberOfLines={1}>
                Chào, {user?.fullName || user?.fullname || user?.full_name}
              </Text>
              <TouchableOpacity onPress={logout} style={styles.headerLogoutBtn}>
                <Feather name="log-out" size={16} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity 
                style={styles.headerLoginBtn} 
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.headerLoginBtnText}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerRegisterBtn} 
                onPress={() => navigation.navigate('Register')}
              >
                <Text style={styles.headerRegisterBtnText}>Đăng ký</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.badgeContainer}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Giải pháp đỗ xe thông minh</Text>
          </View>
          
          {isAuthenticated ? (
            <View style={styles.userHomeContainer}>
              <Text style={styles.userHomeWelcome}>Xin chào, {user?.fullName || user?.fullname || user?.full_name || 'Khách hàng'}</Text>
              <Text style={styles.userHomeSub}>Chọn một dịch vụ dưới đây để tiếp tục:</Text>
              
              <View style={styles.quickActionsGrid}>
                <TouchableOpacity 
                  style={[styles.quickActionCard, { backgroundColor: '#e0f2fe' }]} 
                  onPress={() => navigation.navigate('MyParking')}
                >
                  <View style={[styles.quickActionIconBg, { backgroundColor: '#0284c7' }]}>
                    <Feather name="truck" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.quickActionText}>Xe trong bãi</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.quickActionCard, { backgroundColor: '#ecfdf5' }]} 
                  onPress={() => navigation.navigate('Reserve')}
                >
                  <View style={[styles.quickActionIconBg, { backgroundColor: '#059669' }]}>
                    <Feather name="bookmark" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.quickActionText}>Đặt chỗ đỗ</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.quickActionCard, { backgroundColor: '#eef2ff' }]} 
                  onPress={() => navigation.navigate('MyReservations')}
                >
                  <View style={[styles.quickActionIconBg, { backgroundColor: '#4f46e5' }]}>
                    <Feather name="calendar" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.quickActionText}>Đơn đặt chỗ</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.quickActionCard, { backgroundColor: '#fdf2f8' }]} 
                  onPress={() => navigation.navigate('MyPasses')}
                >
                  <View style={[styles.quickActionIconBg, { backgroundColor: '#db2777' }]}>
                    <Feather name="credit-card" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.quickActionText}>Vé tháng</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.quickActionCard, { backgroundColor: '#fff7ed', width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 12 }]} 
                  onPress={() => navigation.navigate('ReportIncident')}
                >
                  <View style={[styles.quickActionIconBg, { backgroundColor: '#ea580c' }]}>
                    <Feather name="alert-triangle" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.quickActionText}>Báo cáo sự cố khẩn cấp</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.heroTitle}>
                Đỗ xe <Text style={styles.gradientText}>nhanh và tiện lợi</Text>
              </Text>
              <Text style={styles.heroSubtitle}>
                Giải pháp quản lý bãi đỗ xe thông minh cho cuộc sống hiện đại — tiết kiệm thời gian, tối ưu chi phí và vận hành minh bạch.
              </Text>

              <TouchableOpacity style={styles.primaryButton} onPress={handleHeroBtnPress}>
                <Text style={styles.primaryButtonText}>
                  {isAuthenticated ? 'Vào hệ thống' : 'Bắt đầu miễn phí'}
                </Text>
                <Feather name="arrow-right" size={16} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </>
          )}

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((s, idx) => (
              <View key={idx} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* QUICK ACCESS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Xem ngay không cần đăng nhập</Text>
          <Text style={styles.sectionSubtitle}>
            Tra cứu bảng giá, chỗ trống và quy định bãi đỗ chỉ với một chạm.
          </Text>

          <View style={styles.guestLinksContainer}>
            {guestLinks.map((g, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.guestLinkCard}
                onPress={() => {
                  if (g.to === 'ReportIncident') {
                    if (isAuthenticated) {
                      navigation.navigate('ReportIncident');
                    } else {
                      Alert.alert(
                        'Yêu cầu đăng nhập',
                        'Vui lòng đăng nhập để sử dụng tính năng gửi báo cáo sự cố.',
                        [
                          { text: 'Hủy bỏ', style: 'cancel' },
                          { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
                        ]
                      );
                    }
                  } else {
                    navigation.navigate(g.to);
                  }
                }}
              >
                <View style={[styles.iconContainerBlue, g.to === 'ReportIncident' && { backgroundColor: '#ea580c' }]}>
                  <Feather name={g.icon} size={22} color="#ffffff" />
                </View>
                <Text style={styles.guestLinkTitle}>{g.title}</Text>
                <Text style={styles.guestLinkDesc}>{g.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FEATURES */}
        <View style={[styles.section, { backgroundColor: '#f1f5f9' }]}>
          <Text style={styles.sectionTitle}>Mọi thứ bạn cần để vận hành</Text>
          <Text style={styles.sectionSubtitle}>
            Từ tìm chỗ, đặt chỗ đến thanh toán và báo cáo — tất cả trong một hệ thống.
          </Text>

          <View style={styles.featuresGrid}>
            {features.map((f, idx) => (
              <View key={idx} style={styles.featureCard}>
                <View style={styles.iconContainerIndigo}>
                  <Feather name={f.icon} size={20} color="#ffffff" />
                </View>
                <Text style={styles.featureCardTitle}>{f.title}</Text>
                <Text style={styles.featureCardDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* HOW IT WORKS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bắt đầu chỉ với 3 bước</Text>
          <Text style={styles.sectionSubtitle}>Đơn giản từ lúc đăng ký đến khi gửi xe.</Text>

          <View style={styles.stepsContainer}>
            {steps.map((s, idx) => (
              <View key={idx} style={styles.stepCard}>
                <Text style={styles.stepNumber}>{s.n}</Text>
                <Text style={styles.stepTitle}>{s.title}</Text>
                <Text style={styles.stepDesc}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Text style={styles.ctaTitle}>Sẵn sàng đỗ xe thông minh hơn?</Text>
            <Text style={styles.ctaSubtitle}>
              Tạo tài khoản khách hàng miễn phí và trải nghiệm dịch vụ đỗ xe PBMS ngay hôm nay.
            </Text>
            <View style={styles.ctaActions}>
              <TouchableOpacity style={styles.ctaPrimaryBtn} onPress={handleHeroBtnPress}>
                <Text style={styles.ctaPrimaryBtnText}>
                  {isAuthenticated ? 'Vào hệ thống' : 'Đăng ký ngay'}
                </Text>
              </TouchableOpacity>
              {!isAuthenticated && (
                <TouchableOpacity 
                  style={styles.ctaSecondaryBtn}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.ctaSecondaryBtnText}>Đăng nhập</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 28,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#e0e7ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#06b6d4',
    marginRight: 8,
  },
  badgeText: {
    color: '#4f46e5',
    fontSize: 12,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 12,
  },
  gradientText: {
    color: '#4f46e5',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 36,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4f46e5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    backgroundColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 28,
  },
  guestLinksContainer: {
    flexDirection: 'column',
  },
  guestLinkCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  iconContainerBlue: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#06b6d4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  guestLinkTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  guestLinkDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  featuresGrid: {
    flexDirection: 'column',
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  iconContainerIndigo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  featureCardDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  stepsContainer: {
    flexDirection: 'column',
  },
  stepCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stepNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#06b6d4',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  ctaCard: {
    backgroundColor: '#4f46e5',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  ctaActions: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 12,
  },
  ctaPrimaryBtn: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 110,
  },
  ctaPrimaryBtnText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 14,
  },
  ctaSecondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 110,
  },
  ctaSecondaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  topHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4f46e5',
    letterSpacing: 0.5,
  },
  headerAuthButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  headerWelcomeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    maxWidth: 160,
  },
  headerLogoutBtn: {
    padding: 2,
  },
  headerLoginBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  headerLoginBtnText: {
    color: '#4f46e5',
    fontWeight: '600',
    fontSize: 13,
  },
  headerRegisterBtn: {
    backgroundColor: '#4f46e5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRegisterBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  userHomeContainer: {
    width: '100%',
    marginVertical: 16,
    alignItems: 'center',
  },
  userHomeWelcome: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
  },
  userHomeSub: {
    fontSize: 13.5,
    color: '#64748b',
    marginTop: 6,
    marginBottom: 20,
    textAlign: 'center',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 12,
  },
  quickActionCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  quickActionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1e293b',
  },
});
