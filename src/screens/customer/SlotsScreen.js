import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../../config/api';

export default function SlotsScreen() {
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadAvailability = async (isRef = false) => {
    if (isRef) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/public/availability');
      setFloors(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const totalAvailable = floors.reduce((s, f) => s + f.available, 0);
  const totalSlots = floors.reduce((s, f) => s + f.total, 0);

  const formatFloorLabel = (label) => {
    if (!label) return '';
    if (label.toLowerCase().startsWith('b')) {
      return `Hầm ${label.substring(1)}`;
    }
    return `Tầng ${label}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Trạng thái chỗ trống</Text>
          <Text style={styles.subtitle}>Cập nhật thời gian thực từ bãi đỗ xe</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshBtn} 
          onPress={() => loadAvailability(true)}
          disabled={loading || refreshing}
        >
          <Feather name="refresh-cw" size={18} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {/* Stats Summary */}
      {!loading && !error && floors.length > 0 && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={styles.iconWrapper}>
              <Feather name="check-circle" size={24} color="#10b981" />
            </View>
            <View>
              <Text style={styles.statVal}>{totalAvailable}</Text>
              <Text style={styles.statLabel}>Còn trống</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.statItem}>
            <View style={styles.iconWrapperIndigo}>
              <Feather name="grid" size={24} color="#4f46e5" />
            </View>
            <View>
              <Text style={styles.statVal}>{totalSlots}</Text>
              <Text style={styles.statLabel}>Tổng chỗ</Text>
            </View>
          </View>
        </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text style={styles.loadingText}>Đang tải dữ liệu bãi xe...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="alert-triangle" size={48} color="#ef4444" style={{ marginBottom: 12 }} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadAvailability()}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : floors.length === 0 ? (
        <ScrollView 
          contentContainerStyle={styles.center}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAvailability(true)} />}
        >
          <Feather name="map" size={48} color="#94a3b8" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>Chưa có dữ liệu sơ đồ bãi đỗ xe</Text>
        </ScrollView>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAvailability(true)} />}
          showsVerticalScrollIndicator={false}
        >
          {floors.map((floor) => {
            const pct = floor.total > 0 ? (floor.available / floor.total) * 100 : 0;
            const progressColor = pct > 50 ? '#10b981' : pct > 15 ? '#f59e0b' : '#ef4444';
            
            return (
              <View key={floor.floorId} style={styles.floorCard}>
                <View style={styles.floorHeader}>
                  <View style={styles.floorNameRow}>
                    <View style={styles.floorIconWrapper}>
                      <Feather name="layers" size={18} color="#4f46e5" />
                    </View>
                    <Text style={styles.floorName}>{formatFloorLabel(floor.floorName || floor.floorCode || `Floor ${floor.floorId}`)}</Text>
                  </View>
                  <Text style={styles.floorCount}>
                    <Text style={{ fontWeight: '700', color: progressColor }}>{floor.available}</Text>
                    /{floor.total} trống
                  </Text>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${pct}%`, backgroundColor: progressColor }]} />
                </View>

                {/* Zones Breakdown */}
                {floor.zones && floor.zones.length > 0 ? (
                  <View style={styles.zonesList}>
                    {floor.zones.map((zone) => {
                      const zoneAvailable = zone.available ?? 0;
                      const zoneTotal = zone.total ?? 0;
                      const isFull = zoneAvailable === 0;
                      
                      return (
                        <View key={zone.zoneId} style={styles.zoneRow}>
                          <View style={styles.zoneLeft}>
                            <View style={[styles.dot, { backgroundColor: isFull ? '#ef4444' : '#10b981' }]} />
                            <Text style={styles.zoneName}>Khu {zone.zoneName || zone.zoneCode}</Text>
                            {zone.vehicleType?.typeName && (
                              <Text style={styles.vehicleTypeBadge}>{zone.vehicleType.typeName}</Text>
                            )}
                          </View>
                          <Text style={styles.zoneCount}>
                            {isFull ? (
                              <Text style={styles.fullText}>Hết chỗ</Text>
                            ) : (
                              `${zoneAvailable}/${zoneTotal} trống`
                            )}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.noZonesText}>Không có khu vực nào hoạt động</Text>
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    margin: 20,
    marginBottom: 0,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperIndigo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 16,
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
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  scrollList: {
    padding: 20,
    gap: 16,
  },
  floorCard: {
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
  floorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  floorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  floorIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  floorCount: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  zonesList: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    gap: 10,
  },
  zoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  zoneName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  vehicleTypeBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4f46e5',
    backgroundColor: '#eef2ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  zoneCount: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  fullText: {
    color: '#ef4444',
    fontWeight: '600',
  },
  noZonesText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
