import { PermissionsAndroid, Platform } from 'react-native';

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const grantedForeground = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'This app needs access to your location.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    if (grantedForeground === PermissionsAndroid.RESULTS.GRANTED) {
      if (Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 29) {
        const grantedBackground = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Permission',
            message: 'This app needs background location access.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return grantedBackground === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }

    return false;
  } catch (err) {
    console.warn(err);
    return false;
  }
};
