import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import TakePicture from './TakePicture';

export const getCoordsFromAddress = async (address: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } else {
    return null;
  }
};

export const isInSlovenia = (lat: number, lon: number): boolean => {
  return lat >= 45.42 && lat <= 46.88 && lon >= 13.38 && lon <= 16.60;
};

export const AddPinScreen = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [category, setCategory] = useState('Other');
  const [imageData, setImageData] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState<Boolean | null>(null);
  const [cityValid, setCityValid] = useState(true);

  const userId = auth().currentUser?.email;

  const inputTheme = {
    colors: {
      primary: '#000',
      outline: '#000',
      error: '#f00',
      text: '#000',
      placeholder: '#888',
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

    fetchUserRole();
  }, []);

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

  const handleSave = async () => {
    const isCityValid = /^[A-Za-zčćžšđČĆŽŠĐ\s-]+$/.test(city);
    setCityValid(isCityValid);

    if (title === '' || description === '' || street === '' || city === '') {
      Alert.alert('Empty input fields', 'Please enter values into all required fields.');
      return;
    }

    if (!isCityValid) {
      Alert.alert('Invalid city', 'Please enter a valid city name (no numbers).');
      return;
    }

    if (longitude === '' && latitude === '') {
      const address = `${street},${city},Slovenia`;
      const coordinatesFetched = await handleGetCoordinates(address);
      if (!coordinatesFetched) {
        Alert.alert('Invalid Address', 'Could not find valid coordinates for the provided address.');
        return;
      }
    }

    if (!isInSlovenia(parseFloat(latitude), parseFloat(longitude))) {
      Alert.alert('Invalid Address', 'Coordinates are not inside of Slovenia.');
      return;
    }

    const newPin = {
      title,
      description,
      category,
      street,
      city,
      longitude,
      latitude,
      userId,
      createdAt: firestore.FieldValue.serverTimestamp(),
      review: isUserAdmin ? 'approved' : 'pending',
      image: imageData,
    };

    try {
      await firestore().collection('pins').add(newPin);
      Alert.alert('Pin added successfully');
      setTitle('');
      setDescription('');
      setStreet('');
      setCity('');
      setLongitude('');
      setLatitude('');
      setCategory('Other');
      setImageData(null);
    } catch (error) {
      Alert.alert('Error saving pin');
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
          onChangeText={(text) => {
            setCity(text);
            if (!cityValid) setCityValid(true);
          }}
          error={!cityValid}
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
          multiline
          numberOfLines={4}
          style={[styles.input, { height: 100 }]}
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
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Pin</Text>
        </TouchableOpacity>
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 16,
  },
  picker: {
    height: 50,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default AddPinScreen;
