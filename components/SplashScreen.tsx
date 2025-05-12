import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';

export const SplashScreen: React.FC<any> = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('LoginScreen');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../icons/logo.png')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
