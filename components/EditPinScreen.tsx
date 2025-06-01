import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  View,
  StyleSheet,
  Button,
  Text,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import TakePicture from './TakePicture';
import { Pin } from './Type';
import { getCoordsFromAddress, isInSlovenia } from './AddPinScreen';

export const EditPinScreen: React.FC<any> = ({ route, navigation }) => {
  const { pin }: { pin: Pin } = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [category, setCategory] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean | null>(null);

  const inputTheme = {
    colors: {
      primary: '#000', // active border color
      outline: '#000', // inactive border color
      text: '#000',
      placeholder: '#777',
    },
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      const uid = auth().currentUser?.uid;
      if (!uid) return;

      try {
        const doc = await firestore().collection('users').doc(uid).get();
        if (doc.exists) {
          const data = doc.data();
          setIsUserAdmin(data?.admin ?? null);
        }
      } catch (err) {
        console.error('Error fetching role:', err);
      }
    };

    const fetchPinData = async () => {
      try {
        const pinDoc = await firestore().collection('pins').doc(pin.id).get();
        if (pinDoc.exists) {
          const data = pinDoc.data();
          setTitle(data?.title || '');
          setDescription(data?.description || '');
          setStreet(data?.street || '');
          setCity(data?.city || '');
          setLongitude(data?.longitude || '');
          setLatitude(data?.latitude || '');
          setCategory(data?.category || '');
          setImageData(data?.image || null);
        }
      } catch (err) {
        console.error('Failed to fetch pin:', err);
      }
    };

    fetchUserRole();
    fetchPinData();
  }, [pin]);

  const handleGetCoordinates = async (address: string) => {
    try {
      const coords = await getCoordsFromAddress(address);
      if (coords) {
        setLatitude(coords.latitude.toString());
        setLongitude(coords.longitude.toString());
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error getting coordinates: ', error);
      return false;
    }
  };

  const handleUpdate = async () => {
    if (title === '' || description === '' || street === '' || city === '') {
      Alert.alert('Empty input fields', 'Please enter all required fields.');
      return;
    }

    if (longitude === '' && latitude === '') {
      const address = `${street},${city},Slovenia`;
      const coordinatesFetched = await handleGetCoordinates(address);
      if (!coordinatesFetched) {
        Alert.alert('Invalid Address', 'Could not find coordinates.');
        return;
      }
    }

    if (!isInSlovenia(parseFloat(latitude), parseFloat(longitude))) {
      Alert.alert('Invalid Address', 'Coordinates are outside Slovenia.');
      return;
    }

    const updatedPin = {
      title,
      description,
      category,
      street,
      city,
      longitude,
      latitude,
      review: isUserAdmin ? 'approved' : 'pending',
      image: imageData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    try {
      await firestore().collection('pins').doc(pin.id).update(updatedPin);
      Alert.alert('Pin updated successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error updating pin');
    }
  };

  return (
    <ScrollView>
      <TakePicture onImageTaken={setImageData} existingImage={imageData} />
      <View style={styles.container}>
        <TextInput
          label="City"
          mode="outlined"
          value={city}
          onChangeText={setCity}
          style={styles.input}
          theme={inputTheme}
        />
        <TextInput
          label="Street"
          mode="outlined"
          value={street}
          onChangeText={setStreet}
          style={styles.input}
          theme={inputTheme}
        />
        <TextInput
          label="Longitude (optional)"
          mode="outlined"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
          style={styles.input}
          theme={inputTheme}
        />
        <TextInput
          label="Latitude (optional)"
          mode="outlined"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
          style={styles.input}
          theme={inputTheme}
        />
        <TextInput
          label="Title"
          mode="outlined"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          theme={inputTheme}
        />
        <TextInput
          label="Description"
          mode="outlined"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          theme={inputTheme}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={styles.picker}
          >
            <Picker.Item label="Traffic accident" value="Traffic accident" />
            <Picker.Item label="Traffic jam" value="Traffic jam" />
            <Picker.Item label="Natural disaster" value="Natural disaster" />
            <Picker.Item label="High Pedestrian Activity" value="High Pedestrian Activity" />
            <Picker.Item label="Construction Zone" value="Construction Zone" />
            <Picker.Item label="Dangerous road condition" value="Dangerous road condition" />
            <Picker.Item label="Other" value="Other" />
          </Picker>
        </View>

        <Button title="Update Pin" onPress={handleUpdate} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  label: {
    marginBottom: 6,
    fontWeight: '500',
    fontSize: 14,
  },
  pickerWrapper: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  picker: {
    height: 50,
  },
});
