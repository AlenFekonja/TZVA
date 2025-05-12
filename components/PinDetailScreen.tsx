import {
  Alert,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {Pin} from './Type';
import {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth';

export const PinDetailScreen: React.FC<any> = ({route, navigation}) => {
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
  });

  const handleDeletePin = (pinId: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this pin?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await firestore().collection('pins').doc(pinId).delete();
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
      await firestore().collection('pins').doc(pinId).update({
        review: review,
      });

      setPin(prev => ({...prev, review}));
    } catch (error) {
      console.error('Error updating pin status: ', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.buttonRow}>
        {pin.review == 'pending' && (
          <>
            <Button
              onPress={() => navigation.replace('PinEdit', {pin})}
              title="Edit"
            />
            <Button onPress={() => handleDeletePin} title="Delete" />
          </>
        )}

        {isUserAdmin && (
          <>
            <Button
              onPress={() => handlePinStatus(pin.id, 'approved')}
              title="Approve"
            />
            <Button
              onPress={() => handlePinStatus(pin.id, 'rejected')}
              title="Reject"
            />
          </>
        )}
      </View>

      {pin.image && (
        <Image
          source={{uri: pin.image}}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.detailItem}>
        <Text style={styles.label}>Title:</Text>
        <Text style={styles.value}>{pin.title}</Text>
      </View>

      <View style={styles.detailItem}>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{pin.description}</Text>
      </View>

      <View style={styles.detailItem}>
        <Text style={styles.label}>Category:</Text>
        <Text style={styles.value}>{pin.category}</Text>
      </View>

      <View style={styles.detailItem}>
        <Text style={styles.label}>Street:</Text>
        <Text style={styles.value}>{pin.street}</Text>
      </View>

      <View style={styles.detailItem}>
        <Text style={styles.label}>City:</Text>
        <Text style={styles.value}>{pin.city}</Text>
      </View>

      {pin.latitude && pin.longitude && (
        <View style={styles.detailItem}>
          <Text style={styles.label}>Coordinates:</Text>
          <Text style={styles.value}>
            {pin.latitude}, {pin.longitude}
          </Text>
        </View>
      )}

      <View style={styles.detailItem}>
        <Text style={styles.label}>Review:</Text>
        <Text style={styles.value}>{pin.review}</Text>
      </View>

      <View style={styles.detailItem}>
        <Text style={styles.label}>Created At:</Text>
        <Text style={styles.value}>
          {new Date(pin.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
};

export default PinDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  detailItem: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '500',
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
});
