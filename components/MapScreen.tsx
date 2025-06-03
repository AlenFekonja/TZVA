import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  ActivityIndicator,
  Animated,
  Easing,
  Text,
  Image,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { WebView } from 'react-native-webview';
import firestore from '@react-native-firebase/firestore';
import GetLocation from 'react-native-get-location';
import { requestLocationPermission } from './LocationUtils';
import {
  notifyNearestEvent,
  cancelNearestEventNotification,
} from './NotificationService';

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Pin = {
  id: string;
  title: string;
  description: string;
  category: string;
  street: string;
  city: string;
  latitude: number;
  longitude: number;
  userId: string;
  review: string;
  createdAt: Date;
  image?: string;
};

const getDistance = (loc1: Coordinates, loc2: Coordinates): number => {
  const R = 6371e3;
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLng = toRad(loc2.longitude - loc1.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(loc1.latitude)) *
      Math.cos(toRad(loc2.latitude)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getNearestPinWithinRadius = (
  userLocation: Coordinates,
  pins: Pin[],
  maxDistanceMeters: number
): Pin | null => {
  let nearest: Pin | null = null;
  let minDistance = Infinity;

  for (const pin of pins) {
    const distance = getDistance(userLocation, pin);
    console.log(`Checking pin "${pin.title}" at [${pin.latitude}, ${pin.longitude}]`);
    console.log(`Distance to user: ${Math.round(distance)} meters`);

    if (distance <= maxDistanceMeters && distance < minDistance) {
      nearest = pin;
      minDistance = distance;
    }
  }

  if (nearest) {
    console.log(`Nearest pin in range: "${nearest.title}" (${Math.round(minDistance)}m)`);
  } else {
    console.log('No pins found within 1km radius.');
  }

  return nearest;
};

const MapScreen = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePin, setActivePin] = useState<Pin | null>(null);
  const notificationShown = useRef<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const [bannerVisible, setBannerVisible] = useState(true);
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (
        _: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => Math.abs(gestureState.dx) > 10,
      onPanResponderMove: Animated.event(
        [null, { dx: translateX }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_evt, gestureState) => {
        if (Math.abs(gestureState.dx) > 120) {
          Animated.timing(translateX, {
            toValue: gestureState.dx > 0 ? 500 : -500,
            duration: 200,
            useNativeDriver: true,
          }).start(() => setBannerVisible(false));
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    const requestPermissions = async () => {
      const granted = await requestLocationPermission();
      if (!granted) {
        Alert.alert('Location permission is required to access the map');
      }
    };
    requestPermissions();
  }, []);

  useEffect(() => {
    GetLocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
      .then(loc =>
        setLocation({ latitude: loc.latitude, longitude: loc.longitude })
      )
      .catch(() => {
        Alert.alert('Error', 'Failed to retrieve location.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('pins')
      .where('review', '==', 'approved')
      .onSnapshot(snapshot => {
        if (!snapshot.empty) {
          const pinList: Pin[] = snapshot.docs.map(doc => {
            const pin = doc.data();
            return {
              id: doc.id,
              title: pin.title,
              description: pin.description,
              category: pin.category,
              street: pin.street,
              city: pin.city,
              latitude: Number(pin.latitude),
              longitude: Number(pin.longitude),
              userId: pin.userId,
              review: pin.review,
              createdAt: pin.createdAt?.toDate() || new Date(),
              image: pin.image,
            };
          });
          setPins(pinList);
        }
      });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!pins.length) return;

      GetLocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
        .then(loc => {
          const userLoc = { latitude: loc.latitude, longitude: loc.longitude };
          setLocation(userLoc);

          const nearest = getNearestPinWithinRadius(userLoc, pins, 1000); // 1km

          if (nearest) {
            setActivePin(nearest);
            if (notificationShown.current !== nearest.id) {
              notifyNearestEvent(nearest);
              notificationShown.current = nearest.id;
              setBannerVisible(true);
              translateX.setValue(0);
            }
          } else {
            setActivePin(null);
            if (notificationShown.current) {
              cancelNearestEventNotification();
              notificationShown.current = null;
              setBannerVisible(false);
            }
          }
        })
        .catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, [pins]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const pinsData = JSON.stringify(pins);
  const { latitude, longitude } = location;

  const mapHtml = `
    <html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    </head><body style="margin:0;height:100%"><div id="map" style="height:100%"></div>
      <script>
        var map = L.map('map').setView([${latitude}, ${longitude}], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        L.marker([${latitude}, ${longitude}]).addTo(map).bindPopup("You are here").openPopup();
        L.circle([${latitude}, ${longitude}], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.2,
          radius: 1000
        }).addTo(map);

        function addMarkers(pins) {
          pins.forEach(pin => {
            let html = '<b>' + pin.title + '</b><br>' + pin.description;
            if (pin.image) html += '<br><img src="' + pin.image + '" style="width:100px">';
            L.marker([pin.latitude, pin.longitude]).addTo(map).bindPopup(html);
          });
        }
        const pins = ${pinsData};
        addMarkers(pins);
      </script>
    </body></html>
  `;

  return (
    <View style={styles.container}>
      {activePin && bannerVisible && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.flashBanner,
            {
              opacity: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
              transform: [{ translateX }],
            },
          ]}
        >
          <Text style={styles.bannerTitle}>Accident Nearby</Text>
          <Text style={styles.bannerDescription}>{activePin.title}</Text>
          <Text style={styles.bannerDescription}>{activePin.description}</Text>
          {activePin.image && (
            <Image
              source={{ uri: activePin.image }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          )}
        </Animated.View>
      )}

      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashBanner: {
    right: 7,
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    width: '85%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'orange',
    borderRadius: 12,
    zIndex: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerDescription: {
    color: 'white',
    fontSize: 14,
  },
  bannerImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginTop: 8,
  },
});

export default MapScreen;