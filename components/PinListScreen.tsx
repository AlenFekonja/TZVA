import React, { useEffect, useState } from 'react';
import { Alert,FlatList,StatusBar,Text,TouchableOpacity,View,Image,TextInput } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Pin } from './Type';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const PinListScreen: React.FC<any> = ({ navigation }) => {
  const [pins, setPins] = useState<Pin[]>([]);
  const userId = auth().currentUser?.email;
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleDeletePin = (pinId: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this pin?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          await firestore().collection('pins').doc(pinId).delete();
          setPins(prev => prev.filter(pin => pin.id !== pinId));
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEditPin = (pin: Pin) => {
    navigation.navigate('PinEdit', { pin });
  };

  const filteredPins = pins.filter(pin =>
    pin.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            placeholder="Search by entering title, city or street"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={{ flex: 1, height: 40 }}
          />
          <Icon name="magnify" size={20} color="#555" />
        </View>
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
              <Text
                style={{ fontWeight: 'bold', fontSize: 14 }}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <Text
                style={{ fontSize: 12, color: '#333' }}
                numberOfLines={1}
              >
                {item.street}
              </Text>
              <Text
                style={{ fontSize: 12, color: '#666' }}
                numberOfLines={1}
              >
                {item.description}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleEditPin(item)}
              style={{ padding: 8 }}
            >
              <Icon name="pencil-outline" size={20} color="#004080" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDeletePin(item.id)}
              style={{ padding: 8 }}
            >
              <Icon name="delete-outline" size={20} color="#B00020" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </GestureHandlerRootView>
  );
};
