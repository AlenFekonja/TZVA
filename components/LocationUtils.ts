import { Alert, PermissionsAndroid } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import GetLocation from 'react-native-get-location';

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
      const grantedBackground = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        {
          title: 'Background Location Permission',
          message: 'This app needs access to your location in the background.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      
      return grantedBackground === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  } catch (err) {
    console.warn(err);
    return false;
  }
};
