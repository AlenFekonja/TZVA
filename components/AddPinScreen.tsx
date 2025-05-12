import {useEffect, useState} from 'react';
import {Alert, Button, ScrollView, Text, TextInput, View} from 'react-native';
import {styles} from './Style';
import {Picker} from '@react-native-picker/picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import TakePicture from './TakePicture';

/////https://nominatim.openstreetmap.org/search?format=json&q=Koro%C5%A1ka+cesta+46,+Maribor,+Slovenia
export const getCoordsFromAddress = async (address: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address,
  )}`;
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
  const minLat = 45.42;
  const maxLat = 46.88;
  const minLon = 13.38;
  const maxLon = 16.60;

  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
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
  const userId = auth().currentUser?.email;

  const [isUserAdmin, setIsUserAdmin] = useState<Boolean | null>(null);

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

    if(title==='' || description==='' || street==='' || city==='')  {
      Alert.alert(
        'Empty input fields',
        'Please enter values into all required fields.',
      );
      return;
    }

    if(longitude=='' && latitude==''){
    const address = `${street},${city},Slovenia`;

    const coordinatesFetched = await handleGetCoordinates(address);

    if (!coordinatesFetched) {
      Alert.alert(
        'Invalid Address',
        'Could not find valid coordinates for the provided address.',
      );
      return;
    }
    }

     if (!isInSlovenia(parseFloat(latitude),parseFloat(longitude))) {
      Alert.alert(
        'Invalid Address',
        'Coordinates are not inside of Slovenia.',
      );
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
        <Text>City:</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} />
        <Text>Street:</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={setStreet}
        />
        <Text>Longitude {'(optional)'}:</Text>
        <TextInput
          style={styles.input}
          value={longitude}
          onChangeText={setLongitude}
        />
        <Text>Latitude {'(optional)'}:</Text>
        <TextInput
          style={styles.input}
          value={latitude}
          onChangeText={setLatitude}
        />
        <Text>Title:</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} />
        <Text>Description:</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
        />
        <Text>Category:</Text>
        <Picker
          selectedValue={category}
          onValueChange={itemValue => setCategory(itemValue)}>
          <Picker.Item label="Traffic accident" value="Traffic accident" />
          <Picker.Item label="Traffic jam" value="Traffic jam" />
          <Picker.Item label="Natural disaster" value="Natural disaster" />
          <Picker.Item
            label="High Pedestrian Activity"
            value="High Pedestrian Activity"
          />
          <Picker.Item label="Construction Zone" value="Construction Zone" />
          <Picker.Item
            label="Dangerous road condition"
            value="Dangerous road condition"
          />
          <Picker.Item label="Other" value="Other" />
        </Picker>
        <Button title="Save Pin" onPress={handleSave} />
      </View>
    </ScrollView>
  );
};
