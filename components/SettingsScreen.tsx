import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Button,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import auth from '@react-native-firebase/auth';
import { Switch } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import { storage } from './storage';

const SettingsScreen: React.FC<any> = ({ navigation }) => {
  const settings = [
    { icon: 'clipboard-text-clock-outline', label: 'Pin history' },
    { icon: 'account-outline', label: 'Account settings' },
    { icon: 'map-outline', label: 'Location settings' },
    { icon: 'bullhorn-outline', label: 'Emergency contact' },
    { icon: 'pencil-outline', label: 'Personalization' },
  ];

  const [radiusEnabled, setRadiusEnabled] = useState<boolean>(true);

  useEffect(() => {
    const saved = storage.getBoolean('radiusEnabled');
    if (saved === false) {
      setRadiusEnabled(false);
    }
  }, []);

  const toggleRadius = () => {
    const newValue = !radiusEnabled;
    setRadiusEnabled(newValue);
    storage.set('radiusEnabled', newValue);

    Toast.show({
      type: newValue ? 'success' : 'error',
      text1: newValue ? 'Radius Enabled' : 'Radius Disabled',
      text2: newValue
        ? 'You will now see the 1km alert circle.'
        : 'The alert radius is hidden.',
      position: 'top',
    });
  };

  const handleLogout = async () => {
    await auth().signOut();

    Toast.show({
      type: 'success',
      text1: 'Logged out successfully',
      text2: 'You have been signed out.',
      position: 'top',
    });

    navigation.replace('LoginScreen');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.centeredContent}>
          {settings.map((item, index) => (
            <TouchableOpacity key={index} style={styles.settingItem}>
              <View style={styles.iconLabelRow}>
                <Icon
                  name={item.icon}
                  size={24}
                  color="#000"
                  style={styles.settingIcon}
                />
                <Text style={styles.settingLabel}>{item.label}</Text>
                <View style={styles.settingIcon} />
              </View>
              <View style={styles.divider} />
            </TouchableOpacity>
          ))}

          <View
            style={[
              styles.settingItem,
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
            ]}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>
              Show 1km Alert Radius
            </Text>
            <Switch value={radiusEnabled} onValueChange={toggleRadius} />
          </View>
          <View style={styles.divider} />
          <Button title="Logout" onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingVertical: 20,
    marginTop: 50
  },
  centeredContent: {
    width: '100%',
    alignItems: 'center',
  },
  settingItem: {
    width: '90%',
    marginBottom: 18,
  },
  iconLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIcon: {
    width: 30,
    textAlign: 'center',
  },
  settingLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  divider: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});