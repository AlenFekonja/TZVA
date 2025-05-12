import React, {useState} from 'react';
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

export const RegisterScreen: React.FC<any> = ({navigation}) => {
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
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const {uid} = userCredential.user;

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
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
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
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Register" onPress={handleRegister} />
      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('LoginScreen')}>
          Login
        </Text>
      </Text>
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
  loginText: {
    marginTop: 20,
    textAlign: 'center',
  },
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});
