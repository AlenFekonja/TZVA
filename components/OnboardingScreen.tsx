import React, {useEffect} from 'react';
import {View, StyleSheet, Button} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const OnboardingScreen: React.FC<any> = ({navigation}) => {

  const handleSkipOnboarding = async () => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    try {
      await firestore().collection('users').doc(uid).update({
        onboarding: false,
      });
      navigation.replace('TabNav');
    } catch (error) {
      console.error('Error updating onboarding status:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Button onPress={handleSkipOnboarding} title={'Skip onboarding'} />
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
});

export default OnboardingScreen;
