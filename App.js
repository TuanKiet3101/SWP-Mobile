import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';
import TabNavigator from './src/navigation/TabNavigator';
import LoginScreen from './src/screens/login/login';
import RegisterScreen from './src/screens/login/register';
import ReserveScreen from './src/screens/customer/ReserveScreen';
import MyReservationsScreen from './src/screens/customer/MyReservationsScreen';
import MyParkingScreen from './src/screens/customer/MyParkingScreen';
import BuyPassScreen from './src/screens/customer/BuyPassScreen';
import MyPassesScreen from './src/screens/customer/MyPassesScreen';
import ReportIncidentScreen from './src/screens/customer/ReportIncidentScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Main" 
          screenOptions={{ 
            headerShown: false,
            animation: 'slide_from_right'
          }}
        >
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Reserve" component={ReserveScreen} />
          <Stack.Screen name="MyReservations" component={MyReservationsScreen} />
          <Stack.Screen name="MyParking" component={MyParkingScreen} />
          <Stack.Screen name="BuyPass" component={BuyPassScreen} />
          <Stack.Screen name="MyPasses" component={MyPassesScreen} />
          <Stack.Screen name="ReportIncident" component={ReportIncidentScreen} />
        </Stack.Navigator>
        <StatusBar style="dark" />
      </NavigationContainer>
    </AuthProvider>
  );
}
