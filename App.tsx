import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PinListScreen } from './components/PinListScreen';
import { AddPinScreen } from './components/AddPinScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MMKV } from 'react-native-mmkv';
import SettingsScreen from './components/SettingsScreen';
import { LoginScreen } from './components/LoginScreen';
import messaging from '@react-native-firebase/messaging';
import {Alert, PermissionsAndroid, StyleSheet, View} from 'react-native';
import { RegisterScreen } from './components/RegisterScreen';
import { MapScreen } from './components/MapScreen';
import PinDetailScreen from './components/PinDetailScreen';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import { EditPinScreen } from './components/EditPinScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const styles = StyleSheet.create({
  activeIconContainer: {
    width: 48,
    height: 36,
    backgroundColor: '#b3e5fc', 
    borderRadius: 10,           
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
///https://nominatim.openstreetmap.org/search?format=json&q=Koro%C5%A1ka+cesta+46,+Maribor,+Slovenia
export const storage = new MMKV();

function PinStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PinList" component={PinListScreen} />
      <Stack.Screen name="PinDetail" component={PinDetailScreen} />
      <Stack.Screen name="PinEdit" component={EditPinScreen} />
    </Stack.Navigator>
  );
}

function MapStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="PinDetail" component={PinDetailScreen} />
    </Stack.Navigator>
  );
}
function TabNav() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: true,
        tabBarStyle: { height: 60, paddingBottom: 5 },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <MaterialCommunityIcons
                name="map-outline"
                color={focused ? '#000' : color}
                size={focused ? 24 : size} 
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Pin list"
        component={PinStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <MaterialCommunityIcons
                name="format-list-bulleted"
                color={focused ? '#000' : color}
                size={size}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Add pin"
        component={AddPinScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <MaterialCommunityIcons
                name="plus-box-outline"
                color={focused ? '#000' : color}
                size={size}
              />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : null}>
              <MaterialCommunityIcons
                name="cog-outline"
                color={focused ? '#000' : color}
                size={size}
              />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}


const App: React.FC = () => {

  useEffect(() => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={'SplashScreen'}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TabNav" component={TabNav} options={{ headerShown: false }} />
        <Stack.Screen name="SplashScreen" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
