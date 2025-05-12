import React, {useState, useEffect} from 'react';
import {
  View,
  Switch,
  Text,
  StyleSheet,
  ToastAndroid,
  Button,
} from 'react-native';
import {storage} from '../App';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import {styles} from './Style';

const SettingsScreen: React.FC<any> = ({navigation}) => {
  const [isNotifEnabled, setIsNotifEnabled] =
    useState(false);

  useEffect(() => {
    const currentUser = auth().currentUser;
    const savedValue = storage.getBoolean(
      'Notif-' + currentUser?.email,
    );
    if (savedValue !== undefined) {
      setIsNotifEnabled(savedValue);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
      console.log('User logged out successfully!');
      navigation.navigate('LoginScreen');
    } catch (error) {
      console.error('Error logging out: ', error);
    }
  };

  const toggleSwitch = async (value: boolean) => {
    
  };

  return (
    <View style={styles.container2}>
      <Text style={styles.label}>
        Enable/disable push notifications
      </Text>
      <Switch value={isNotifEnabled} onValueChange={toggleSwitch} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default SettingsScreen;
