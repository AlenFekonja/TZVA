import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

type TakePictureProps = {
  onImageTaken: (base64: string) => void;
  existingImage?: string | null;
};

const TakePicture: React.FC<TakePictureProps> = ({ onImageTaken, existingImage }) => {
  const [photo, setPhoto] = useState<string | null>(existingImage || null);

  useEffect(() => {
    setPhoto(existingImage || null);
  }, [existingImage]);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      ];

      const granted = await PermissionsAndroid.requestMultiple(permissions);

      return (
        granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
        (granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.READ_MEDIA_IMAGES'] === PermissionsAndroid.RESULTS.GRANTED)
      );
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Camera permission is required.');
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        cameraType: 'back',
        saveToPhotos: true,
        quality: 1,
        includeBase64: true,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.errorCode) {
          Alert.alert('Camera error', response.errorMessage || 'Unknown error');
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.uri) setPhoto(asset.uri);
          if (asset.base64 && asset.type) {
            const base64Image = `data:${asset.type};base64,${asset.base64}`;
            onImageTaken(base64Image);
          }
        } else {
          Alert.alert('Error', 'No image URI returned.');
        }
      },
    );
  };

  const handleUploadPhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Storage permission is required.');
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1,
        includeBase64: true,
      },
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          Alert.alert('Image picker error', response.errorMessage || 'Unknown error');
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          if (asset.uri) setPhoto(asset.uri);
          if (asset.base64 && asset.type) {
            const base64Image = `data:${asset.type};base64,${asset.base64}`;
            onImageTaken(base64Image);
          }
        } else {
          Alert.alert('Error', 'No image URI returned.');
        }
      },
    );
  };

  return (
    <View style={styles.container}>
      {photo ? (
        <Image source={{ uri: photo }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No image selected</Text>
        </View>
      )}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
          <Text style={styles.buttonText}>Open camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleUploadPhoto}>
          <Text style={styles.buttonText}>Upload image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
    marginTop: 30
  },
  image: {
    width: 375,
    height: 270,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 16,
  },
  placeholder: {
    backgroundColor: '#484444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: 'white',
    fontSize: 25,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 35,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    minWidth: 130,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TakePicture;