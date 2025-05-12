import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { requestLocationPermission } from './LocationUtils';
import { Pin } from './Type';
import firestore from '@react-native-firebase/firestore';
import GetLocation from 'react-native-get-location';

export const MapScreen = () => {
  const [pins, setPins] = useState<Pin[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then(loc => {
        setLocation({ latitude: loc.latitude, longitude: loc.longitude });
      })
      .catch(error => {
        console.error('Error getting location:', error);
        setError('Failed to retrieve location.');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('pins')
      .where('review', '==', 'approved')
      .onSnapshot(snapshot => {
        if (!snapshot || snapshot.empty) return;
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
            image: pin.image,
          };
        });
        setPins(pinList);
      });

    return () => unsubscribe();
  }, []);

  if (loading || !location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const pinsData = JSON.stringify(pins);
  const userLat = location.latitude;
  const userLng = location.longitude;

const mapHtml = `
  <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
    </head>
    <body style="margin:0; padding:0; height:100%;">
      <div id="map" style="height:100%;"></div>
      <script>
        var map = L.map('map').setView([${userLat.toFixed(4)}, ${userLng.toFixed(4)}], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        L.marker([${userLat.toFixed(4)}, ${userLng.toFixed(4)}]).addTo(map)
          .bindPopup("You are here")
          .openPopup();

        function addMarkers(pins) {
          pins.forEach(pin => {
            let popupContent = '<strong>' + pin.title + '</strong><br>';
            popupContent += '<p>' + pin.description + '</p>';
            popupContent += '<p><strong>Location:</strong> ' + pin.street + ', ' + pin.city + '</p>';
            popupContent += '<p><strong>Category:</strong> ' + pin.category + '</p>';
            if (pin.image) {
              popupContent += '<img src="' + pin.image + '" alt="Pin Image" style="width:100px;height:100px;">';
            }
            L.marker([pin.latitude, pin.longitude]).addTo(map)
              .bindPopup(popupContent);
          });
        }

        const pins = ${pinsData};
        addMarkers(pins);
      </script>
    </body>
  </html>
`;

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        geolocationEnabled={true}
        onMessage={(event) => console.log('WebView Message:', event.nativeEvent.data)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen;
