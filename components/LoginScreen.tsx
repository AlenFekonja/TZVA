import React, {useEffect, useState} from 'react';
import {
  View,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
export const LoginScreen: React.FC<any> = ({navigation}) => {
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

        if (isOnboarding) {
          navigation.replace('OnboardingScreen');
        } else {
          navigation.replace('TabNav');
        }
      } catch (error) {
        ToastAndroid.show(
          'Login failed. Please check your credentials.',
          ToastAndroid.SHORT,
        );
      }
    } else {
      ToastAndroid.show('Please fill in both fields.', ToastAndroid.SHORT);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Text
        style={styles.link}
        onPress={() => navigation.navigate('RegisterScreen')}>
        Register
      </Text>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
    borderRadius: 5,
  },
  signupText: {
    marginTop: 20,
    textAlign: 'center',
  },
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});
