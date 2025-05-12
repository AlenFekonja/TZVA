import React, {useEffect, useState} from 'react';
import {
  Alert,
  Button,
  FlatList,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
  Animated,
} from 'react-native';
import {GestureHandlerRootView, RectButton} from 'react-native-gesture-handler';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import {styles} from './Style';
import {Pin} from './Type';
import auth from '@react-native-firebase/auth';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';
import {Picker} from '@react-native-picker/picker';

export const PinListScreen: React.FC<any> = ({navigation}) => {
  const [pins, setPins] = useState<Pin[]>([]);
  const userId = auth().currentUser?.email;
  const [filterOption, setFilterOption] = useState('myPins');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUserAdmin, setIsUserAdmin] = useState<Boolean | null>(null);

  useEffect(() => {
    const fetchUserDataAndPins = async () => {
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

      if (!userId) return;

      let query: FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> =
        firestore().collection('pins');

      if (filterOption === 'myPins') {
        query = query.where('userId', '==', userId);
      }

      query.onSnapshot(snapshot => {
        if (!snapshot || snapshot.empty) {
          setPins([]);
          return;
        }

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
            createdAt: pin.createdAt ? pin.createdAt.toDate() : new Date(),
            image: pin.image ?? undefined,
          };
        });

        setPins(pinList);
      });
    };

    fetchUserDataAndPins();
  }, [userId, filterOption]);

  const handleSelectPin = (pin: Pin) => {
    navigation.navigate('PinDetail', {pin});
  };

  const handleDeletePin = (pinId: string) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this pin?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await firestore().collection('pins').doc(pinId).delete();
            setPins(prevPins => prevPins.filter(pin => pin.id !== pinId));
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
    } catch (error) {
      console.error('Error updating pin status: ', error);
    }
  };

  const renderRightActions = (pinId: string) => (
    <View style={{flexDirection: 'row', width: 160}}>
      <Animated.View style={{flex: 1}}>
        <RectButton
          style={[styles.rightAction, {backgroundColor: 'green'}]}
          onPress={() => handlePinStatus(pinId, 'approved')}>
          <Text style={styles.actionText}>Approve</Text>
        </RectButton>
      </Animated.View>
      <Animated.View style={{flex: 1}}>
        <RectButton
          style={[styles.rightAction, {backgroundColor: 'red'}]}
          onPress={() => handlePinStatus(pinId, 'rejected')}>
          <Text style={styles.actionText}>Reject</Text>
        </RectButton>
      </Animated.View>
    </View>
  );

  const filteredPins = pins.filter(pin => {
    if (!searchTerm.trim()) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      pin.title?.toLowerCase().includes(lowerSearch) ||
      pin.description?.toLowerCase().includes(lowerSearch) ||
      pin.city?.toLowerCase().includes(lowerSearch) ||
      pin.street?.toLowerCase().includes(lowerSearch) ||
      pin.category?.toLowerCase().includes(lowerSearch) ||
      pin.review?.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6200ea" />

      <View style={{marginHorizontal: 10, marginBottom: 10}}>
        <TextInput
          placeholder="Search by Pin properties"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={{
            backgroundColor: '#fff',
            padding: 10,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: '#ccc',
          }}
        />
      </View>

      {isUserAdmin && (
        <View style={{margin: 10, backgroundColor: '#f0f0f0', borderRadius: 6}}>
          <Picker
            selectedValue={filterOption}
            onValueChange={itemValue => setFilterOption(itemValue)}>
            <Picker.Item label="My pins" value="myPins" />
            <Picker.Item label="All" value="all" />
          </Picker>
        </View>
      )}

      <FlatList
        data={filteredPins}
        keyExtractor={item => item.id}
        renderItem={({item}) => {
          const handleLongPress = () => {
            if (item.review === 'pending') {
              handleDeletePin(item.id);
            } else {
              Alert.alert(
                'Cannot Delete',
                'Only pins with review status "pending" can be deleted.',
              );
            }
          };

          const content = (
            <TouchableOpacity
              onPress={() => handleSelectPin(item)}
              onLongPress={handleLongPress}>
              <View style={styles.pinItem}>
                <Text style={styles.pinText}>{item.title}</Text>
                <Text style={styles.pinText}>{item.description}</Text>
                <Text style={styles.pinText}>
                  {item.city}, {item.street}
                </Text>
                <Text style={styles.pinText}>Review: {item.review}</Text>

                {item.image && (
                  <View style={{marginTop: 8}}>
                    <Image
                      source={{uri: item.image}}
                      style={{width: 300, height: 200, borderRadius: 8}}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );

          return isUserAdmin ? (
            <ReanimatedSwipeable
              renderRightActions={() => renderRightActions(item.id)}>
              {content}
            </ReanimatedSwipeable>
          ) : (
            content
          );
        }}
      />
    </GestureHandlerRootView>
  );
};
