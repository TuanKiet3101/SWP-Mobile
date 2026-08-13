import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/customer/HomeScreen';
import SlotsScreen from '../screens/customer/SlotsScreen';
import RulesScreen from '../screens/customer/RulesScreen';
import AccountScreen from '../screens/customer/AccountScreen';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();

export default function TabNavigator({ navigation }) {
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Slots') {
              iconName = 'map-pin';
            } else if (route.name === 'Rules') {
              iconName = 'info';
            } else if (route.name === 'Account') {
              iconName = 'user';
            }

            return <Feather name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#4f46e5',
          tabBarInactiveTintColor: '#94a3b8',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            backgroundColor: '#ffffff',
            height: 60 + (insets.bottom > 0 ? insets.bottom - 4 : 0),
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ tabBarLabel: 'Trang chủ' }} 
        />
        <Tab.Screen 
          name="Slots" 
          component={SlotsScreen} 
          options={{ tabBarLabel: 'Chỗ trống' }} 
        />
        <Tab.Screen 
          name="Rules" 
          component={RulesScreen} 
          options={{ tabBarLabel: 'Quy định' }} 
        />
        <Tab.Screen 
          name="Account" 
          component={AccountScreen} 
          options={{ tabBarLabel: 'Tài khoản' }} 
        />
      </Tab.Navigator>

      {/* MODAL YÊU CẦU ĐĂNG NHẬP */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Feather name="lock" size={26} color="#4f46e5" />
            </View>
            <Text style={styles.modalTitle}>Yêu cầu đăng nhập</Text>
            <Text style={styles.modalMessage}>
              Vui lòng đăng nhập tài khoản để sử dụng tính năng này.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Hủy bỏ</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirmButton} 
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.modalConfirmButtonText}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
  },
  modalCancelButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  modalConfirmButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
});