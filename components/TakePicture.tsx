import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';

type TakePictureProps = {
  onImageTaken: (base64: string) => void;
  existingImage?: string | null;
};

const TakePicture: React.FC<TakePictureProps> = ({
  onImageTaken,
  existingImage,
}) => {
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
        granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        (granted['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED ||
          granted['android.permission.READ_MEDIA_IMAGES'] ===
            PermissionsAndroid.RESULTS.GRANTED)
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
          Alert.alert(
            'Image picker error',
            response.errorMessage || 'Unknown error',
          );
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
        <Image source={{uri: photo}} style={styles.image} />
      )  : (
        <View style={[styles.image, styles.placeholder]}>
          <Text style={styles.placeholderText}>No image selected</Text>
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: 10,
        }}>
        <Button title="Take Picture" onPress={handleTakePhoto} />
        <Button title="Upload from Device" onPress={handleUploadPhoto} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
  },
});

export default TakePicture;
