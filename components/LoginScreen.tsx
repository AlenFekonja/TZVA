import React, { useEffect, useState } from 'react';
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
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Svg, { Path } from 'react-native-svg';
import { TextInput } from 'react-native-paper';

const { width } = Dimensions.get('window');

export const LoginScreen: React.FC<any> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isOnboarding, setIsOnboarding] = useState<Boolean | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const uid = auth().currentUser?.uid;
      if (!uid) return;
      try {
        const doc = await firestore().collection('users').doc(uid).get();
        if (doc.exists) {
          const data = doc.data();
          setIsOnboarding(data?.onboarding ?? null);
        }
      } catch (err) {
        console.error('Error fetching role:', err);
      }
    };

    fetchUserRole();
  }, []);

  const handleLogin = async () => {
    if (email && password) {
      try {
        await auth().signInWithEmailAndPassword(email, password);
        ToastAndroid.show('Login successful!', ToastAndroid.SHORT);
        navigation.replace(isOnboarding ? 'OnboardingScreen' : 'TabNav');
      } catch (error) {
        ToastAndroid.show('Login failed. Please check your credentials.', ToastAndroid.SHORT);
      }
    } else {
      ToastAndroid.show('Please fill in both fields.', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardWithCurve}>
          <View style={styles.card}>
            <Image source={require('../icons/logo.png')} style={styles.logo} />
            <Text style={styles.title}>VARNA POT</Text>

            <TextInput
              mode="outlined"
              label="G-mail"
              keyboardType="email-address"
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              theme={{ colors: { primary: '#104F8D' } }}
            />
            <TextInput
              mode="outlined"
              label="Password"
              secureTextEntry
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              theme={{ colors: { primary: '#104F8D' } }}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>LOG IN</Text>
            </TouchableOpacity>

            <Text style={styles.subText}>
              Don’t have an account yet?{' '}
              <Text
                style={styles.registerLink}
                onPress={() => navigation.navigate('RegisterScreen')}>
                Register!
              </Text>
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('RegisterScreen')}
              style={styles.registerButton}
            >
              <Text style={styles.registerText}>REGISTER</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.arrowContainer}
              onPress={() => navigation.navigate('RegisterScreen')}
            >
              <Image source={require('../icons/arrow-right.png')} style={styles.arrow} />
            </TouchableOpacity>
          </View>

          <Svg width={width * 0.9} height={120} viewBox={`0 0 ${width * 0.9} 120`}>
            <Path
              d={`
                M0,0
                L0,5
                Q0,45 80,60
                L${width * 0.9 - 15},110
                Q${width * 0.9},110 ${width * 0.9},95
                L${width * 0.9},0
                Z
              `}
              fill="#fff"
            />
          </Svg>
        </View>

        <View style={styles.socialContainer}>
          <View style={styles.googleButton}>
            <Image source={require('../icons/google.png')} style={styles.socialLogo} />
          </View>
          <View style={styles.facebookButton}>
            <Image source={require('../icons/facebook.png')} style={styles.socialLogo} />
          </View>
          <View style={styles.xButton}>
            <Image source={require('../icons/x.png')} style={styles.socialLogo} />
          </View>
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
  },
  cardWithCurve: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  card: {
    marginTop: 40,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    width: 265,
    height: 265,
    marginTop: -40,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: -30,
    color: '#000',
  },
  input: {
    width: '100%',
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingVertical: 12,
    width: '70%',
    marginTop: 10,
  },
  loginButtonText: {
    marginTop: 4,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  subText: {
    marginTop: 16,
    marginBottom: -10,
    fontSize: 10,
    color: '#333',
    fontWeight: 'bold',
  },
  registerLink: {
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 6,
    paddingVertical: 12,
    width: '70%',
    backgroundColor: '#fff',
  },
  registerText: {
    marginTop: 4,
    color: '#2196F3',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  socialContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginTop: -30,
    marginBottom: 30,
  },
  googleButton: {
    position: 'absolute',
    top: -20,
    left: '5%',
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -10 }],
    elevation: 4,
    shadowColor: 'transparent',
  },
  facebookButton: {
    position: 'absolute',
    top: -5,
    left: '35%',
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: 0 }],
    elevation: 4,
    shadowColor: 'transparent',
  },
  xButton: {
    position: 'absolute',
    top: 5,
    left: '65%',
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: 10 }],
    elevation: 4,
    shadowColor: 'transparent',
  },
  socialLogo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  arrowContainer: {
    backgroundColor: '#104F8D',
    width: 65,
    height: 65,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: -90,
    right: 7,
    zIndex: 5,
    elevation: 5,
    shadowColor: 'transparent',
  },
  arrow: {
    width: 45,
    height: 45,
    tintColor: '#fff',
    resizeMode: 'contain',
  },
});

export default LoginScreen;