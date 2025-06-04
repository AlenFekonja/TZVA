import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import Swiper from 'react-native-swiper';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const { width, height } = Dimensions.get('window');

export const OnboardingScreen: React.FC<any> = ({ navigation }) => {
  const swiperRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);


  const handleNext = () => {
    if (currentIndex < 2) {
      swiperRef.current?.scrollBy(1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding =async () => {
    const uid = auth().currentUser?.uid;
          await firestore().collection('users').doc(uid).update({
        onboarding: false,
      });
      navigation.replace('TabNav');
  };

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        loop={false}
        showsPagination
        activeDotColor="#007AFF"
        dotColor="#ccc"
        onIndexChanged={setCurrentIndex}
      >
        <View style={styles.slide}>
          <Image
            source={require('../assets/onboarding_1.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.slide}>
          <Image
            source={require('../assets/onboarding_2.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <View style={styles.slide}>
          <Image
            source={require('../assets/onboarding_3.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </Swiper>

      <TouchableOpacity style={styles.skipButton} onPress={handleNext}>
        <Text style={styles.skipText}>
          {currentIndex < 2 ? 'Next' : 'Get Started'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  image: {
    width: width * 0.9,
    height: height * 0.7,
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#007AFF',
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;