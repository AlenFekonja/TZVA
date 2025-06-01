import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ToastAndroid,
  ScrollView,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { TextInput } from 'react-native-paper';

const { width } = Dimensions.get('window');

export const RegisterScreen: React.FC<any> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      ToastAndroid.show('Please fill in all fields.', ToastAndroid.SHORT);
      return;
    }

    if (password !== confirmPassword) {
      ToastAndroid.show('Passwords do not match.', ToastAndroid.SHORT);
      return;
    }

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const { uid } = userCredential.user;

      await firestore().collection('users').doc(uid).set({
        email,
        username,
        admin: false,
        onboarding: true,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      ToastAndroid.show('Registration successful!', ToastAndroid.SHORT);
      navigation.replace('LoginScreen');
    } catch (error: any) {
      console.error(error);
      ToastAndroid.show('Registration failed. Try again.', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardWithCurve}>
          <Svg
            width={width * 0.9}
            height={120}
            viewBox={`0 0 ${width * 0.9} 120`}
            style={{ transform: [{ rotate: '180deg' }] }}
          >
            <Path
              d={`M0,0
                  L0,5
                  Q0,45 80,60
                  L${width * 0.9 - 15},110
                  Q${width * 0.9},110 ${width * 0.9},95
                  L${width * 0.9},0
                  Z`}
              fill="#fff"
            />
          </Svg>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.arrowInCard}
              onPress={() => navigation.goBack()}
            >
              <Image source={require('../icons/arrow-left.png')} style={styles.arrowWhite} />
            </TouchableOpacity>

            <Text style={styles.title}>REGISTER{'\n'}FORM</Text>

            <TextInput
              mode="outlined"
              label="Username"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              theme={{ colors: { primary: '#104F8D' } }}
            />
            <TextInput
              mode="outlined"
              label="G-mail"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              theme={{ colors: { primary: '#104F8D' } }}
            />
            <TextInput
              mode="outlined"
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              theme={{ colors: { primary: '#104F8D' } }}
            />
            <TextInput
              mode="outlined"
              label="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
              theme={{ colors: { primary: '#104F8D' } }}
            />

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>REGISTER</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}>
            <Image source={require('../icons/google.png')} style={styles.socialLogo} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Image source={require('../icons/facebook.png')} style={styles.socialLogo} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Image source={require('../icons/x.png')} style={styles.socialLogo} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#104F8D',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 30,
  },
  cardWithCurve: {
    marginTop: 40,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  card: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    position: 'relative',
    shadowColor: 'transparent',
  },
  arrowInCard: {
    position: 'absolute',
    top: -90,
    left: 10,
    backgroundColor: '#104F8D',
    width: 55,
    height: 55,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 10,
    shadowColor: 'transparent',
  },
  arrowWhite: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#000',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  registerButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingVertical: 12,
    width: '70%',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 3,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 10,
    width: '90%',
  },
  socialButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: 'transparent',
  },
  socialLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});

export default RegisterScreen;