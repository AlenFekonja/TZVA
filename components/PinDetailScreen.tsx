import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { Pin } from './Type';

export const PinDetailScreen: React.FC<any> = ({ route, navigation }) => {
  const initialPin: Pin = route.params.pin;
  const [pin, setPin] = useState<Pin>(initialPin);
  const [isUserAdmin, setIsUserAdmin] = useState<Boolean | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const uid = auth().currentUser?.uid;
      if (!uid) return;

      try {
        const doc = await firestore().collection('users').doc(uid).get();
        if (doc.exists) {
          const data = doc.data();
          const adminStatus = data?.admin ?? null;
          setIsUserAdmin(adminStatus);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    };
    fetchUserData();
  }, []);

  const handleDeletePin = (pinId: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this pin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await firestore().collection('pins').doc(pinId).delete();
            navigation.goBack();
          } catch (error) {
            console.error('Error deleting pin: ', error);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handlePinStatus = async (pinId: string, review: string) => {
    try {
      await firestore().collection('pins').doc(pinId).update({ review });
      setPin(prev => ({ ...prev, review }));
    } catch (error) {
      console.error('Error updating pin status: ', error);
    }
  };

  const renderButton = (
    label: string,
    onPress: () => void,
    style: object,
    textStyle: object
  ) => (
    <TouchableOpacity onPress={onPress} style={[styles.baseButton, style]}>
      <Text style={[styles.baseButtonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {pin.image && (
        <Image source={{ uri: pin.image }} style={styles.image} resizeMode="cover" />
      )}

      <View style={styles.card}>
        <Text style={styles.title}>{pin.title}</Text>
        <Text style={styles.subtext}>{pin.description || 'No description provided.'}</Text>
      </View>

      <View style={styles.card}>
        <Detail label="Category" value={pin.category} />
        <Detail label="Street" value={pin.street} />
        <Detail label="City" value={pin.city} />
        {pin.latitude && pin.longitude && (
          <Detail label="Coordinates" value={`${pin.latitude}, ${pin.longitude}`} />
        )}
        <Detail label="Review Status" value={pin.review} />
        <Detail
          label="Created At"
          value={pin.createdAt ? new Date(pin.createdAt).toLocaleDateString() : 'N/A'}
        />
      </View>

      <View style={styles.buttonGroup}>
        {pin.review === 'pending' && (
          <>
            {renderButton('Edit', () => navigation.replace('PinEdit', { pin }), styles.editButton, styles.whiteText)}
            {renderButton('Delete', () => handleDeletePin(pin.id), styles.deleteButton, styles.whiteText)}
          </>
        )}

        {isUserAdmin && (
          <>
            {renderButton('Approve', () => handlePinStatus(pin.id, 'approved'), styles.approveButton, styles.whiteText)}
            {renderButton('Reject', () => handlePinStatus(pin.id, 'rejected'), styles.rejectButton, styles.rejectText)}
          </>
        )}
      </View>
    </ScrollView>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailItem}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || 'N/A'}</Text>
  </View>
);

export default PinDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 6,
  },
  subtext: {
    fontSize: 16,
    color: '#555',
  },
  detailItem: {
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#222',
  },
  value: {
    fontSize: 15,
    color: '#333',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  baseButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 6,
    minWidth: 120,
    alignItems: 'center',
  },
  baseButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  approveButton: {
    backgroundColor: '#2196F3', // solid blue
  },
  rejectButton: {
    borderWidth: 1.5,
    borderColor: '#2196F3',
    backgroundColor: 'transparent',
  },
  rejectText: {
    color: '#2196F3',
  },
  editButton: {
    backgroundColor: '#007bff',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  whiteText: {
    color: '#fff',
  },
});
