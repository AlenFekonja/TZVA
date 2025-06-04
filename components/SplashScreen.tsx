import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types'; 

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SplashScreen'>;

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    const timer = setTimeout(() => {
    navigation.replace('OnboardingScreen');
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
    backgroundColor: '#2196F3',
  },
  logo: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
  },
});

export default SplashScreen;