import React, {useEffect, useState} from 'react';
import {Alert, Button, ScrollView, Text, TextInput, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {styles} from './Style';
import TakePicture from './TakePicture';
import {Pin} from './Type';
import {getCoordsFromAddress, isInSlovenia} from './AddPinScreen';

export const EditPinScreen: React.FC<any> = ({route, navigation}) => {
  const {pin}: {pin: Pin} = route.params;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [category, setCategory] = useState('');
  const [imageData, setImageData] = useState<string | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean | null>(null);

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
      Alert.alert(
        'Empty input fields',
        'Please enter values into all required fields.',
      );
      return;
    }

    if (longitude == '' && latitude == '') {
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

    if (!isInSlovenia(parseFloat(latitude), parseFloat(longitude))) {
      Alert.alert('Invalid Address', 'Coordinates are not inside of Slovenia.');
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
        <Text>City:</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} />
        <Text>Street:</Text>
        <TextInput
          style={styles.input}
          value={street}
          onChangeText={setStreet}
        />
        <Text>Longitude (optional):</Text>
        <TextInput
          style={styles.input}
          value={longitude}
          onChangeText={setLongitude}
        />
        <Text>Latitude (optional):</Text>
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
        <Button title="Update Pin" onPress={handleUpdate} />
      </View>
    </ScrollView>
  );
};
