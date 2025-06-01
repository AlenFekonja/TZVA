import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingsScreen: React.FC<any> = ({ navigation }) => {
  const settings = [
    { icon: 'clipboard-text-clock-outline', label: 'Pin history' },
    { icon: 'account-outline', label: 'Account settings' },
    { icon: 'map-outline', label: 'Location settings' },
    { icon: 'bullhorn-outline', label: 'Emergency contact' },
    { icon: 'pencil-outline', label: 'Personalization' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#0f1b3e" />
        </TouchableOpacity>
        <View style={styles.titleWrapper}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

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
                {/* for symmetry, use a hidden icon instead of spacer */}
                <View style={styles.settingIcon} />
              </View>
              <View style={styles.divider} />
            </TouchableOpacity>
          ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  backButton: {
    backgroundColor: '#E6EEF5',
    borderRadius: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
    marginRight: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f1b3e',
  },
  scrollContainer: {
    paddingVertical: 20,
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