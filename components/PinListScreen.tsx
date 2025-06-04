import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Pin } from './Type';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';

export const PinListScreen: React.FC<any> = ({ navigation, route }) => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected'>('all');

  const userId = auth().currentUser?.email;

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('pins')
      .where('userId', '==', userId)
      .onSnapshot(snapshot => {
        const pinList: Pin[] = snapshot.docs.map(doc => {
          const pin = doc.data();
          return {
            id: doc.id,
            title: pin.title,
            description: pin.description,
            category: pin.category,
            street: pin.street,
            userId: pin.userId,
            city: pin.city,
            longitude: pin.longitude,
            latitude: pin.latitude,
            review: pin.review,
            createdAt: pin.createdAt?.toDate() ?? new Date(),
            image: pin.image,
          };
        });
        setPins(pinList);
      });

    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (route?.params?.updateStatus) {
      if (route.params.updateStatus === 'success') {
        Toast.show({
          type: 'success',
          text1: 'Pin updated',
          text2: 'Your changes were saved successfully.',
          position: 'top'
        });
      } else if (route.params.updateStatus === 'error') {
        Toast.show({
          type: 'error',
          text1: 'Update failed',
          text2: 'Something went wrong while saving.',
          position: 'top'
        });
      }
      navigation.setParams({ updateStatus: null });
    }
  }, [route?.params?.updateStatus]);

  const handleDeletePin = async (pinId: string) => {
    try {
      await firestore().collection('pins').doc(pinId).delete();
      setPins(prev => prev.filter(pin => pin.id !== pinId));
      Toast.show({
        type: 'success',
        text1: 'Pin deleted',
        text2: 'The pin was successfully removed.',
        position: 'top'
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Delete failed',
        text2: 'Unable to delete the pin.',
        position: 'top'
      });
    }
  };

  const handleEditPin = (pin: Pin) => {
    navigation.navigate('PinEdit', { pin });
  };

  const filteredPins = pins.filter(pin => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm.trim() ||
      pin.title?.toLowerCase().includes(lowerSearch) ||
      pin.description?.toLowerCase().includes(lowerSearch) ||
      pin.city?.toLowerCase().includes(lowerSearch) ||
      pin.street?.toLowerCase().includes(lowerSearch) ||
      pin.review?.toLowerCase().includes(lowerSearch);

    const matchesFilter =
      filter === 'all' || pin.review?.toLowerCase() === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={{ margin: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#fff',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ccc',
            paddingHorizontal: 10,
            alignItems: 'center',
          }}
        >
          <TextInput
            placeholder="Search by title, city, or street"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1, height: 40 }}
          />
          <Icon name="magnify" size={20} color="#555" />
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 }}>
        {['all', 'approved', 'rejected'].map(value => (
          <TouchableOpacity
            key={value}
            onPress={() => setFilter(value as typeof filter)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: filter === value ? '#007AFF' : '#eee',
              borderRadius: 20,
            }}
          >
            <Text style={{ color: filter === value ? '#fff' : '#333', fontWeight: 'bold' }}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPins}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('PinDetail', { pin: item })}
            style={{
              flexDirection: 'row',
              backgroundColor: '#fff',
              marginBottom: 12,
              padding: 8,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Image
              source={{ uri: item.image }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 8,
                marginRight: 12,
                backgroundColor: '#ddd',
              }}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 14 }} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 12, color: '#333' }} numberOfLines={1}>
                {item.street}
              </Text>
              <Text style={{ fontSize: 12, color: '#666' }} numberOfLines={1}>
                {item.description}
              </Text>
              <Text style={{ fontSize: 12, color: '#666' }} numberOfLines={1}>
                {item.city}
              </Text>
              <Text style={{ fontSize: 12, color: '#666' }} numberOfLines={1}>
                Review: {item.review || 'pending'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleEditPin(item)} style={{ padding: 8 }}>
              <Icon name="pencil-outline" size={20} color="#004080" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeletePin(item.id)} style={{ padding: 8 }}>
              <Icon name="delete-outline" size={20} color="#B00020" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      <Toast />
    </GestureHandlerRootView>
  );
};