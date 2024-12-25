import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Keyboard } from 'react-native';
import { setCurrentUser } from '../store/user/user.action';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentTheme, selectCurrentUser } from '../store/user/user.selector';
import { getTheme } from './Colors/Color';
import { EXPO_PUBLIC_API_URL, EXPO_PUBLIC_API_URL_WS } from '@env';

const LoginScreen = ({ navigation }) => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [haveError, setError] = useState(false);
  const isDarkMode = useSelector(selectCurrentTheme);
  const themeColors = getTheme(isDarkMode); // Get the theme based on the mode

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  const handleChangeUsername = (value) => {
    setUsername(value);
  };

  const handleChangePassword = (value) => {
    setPassword(value);
  };

  const handleLogin = () => {
    setError('');
    setPassword('');
    Keyboard.dismiss();

    if (username.length < 8) {
      return setError('Username needs to be at least 8 characters');
    }

    if (password.length < 8) {
      return setError('Password needs to be at least 8 characters');
    }

    fetch(`${EXPO_PUBLIC_API_URL}/signIn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
      }),
    })
      .then((data) => data.json())
      .then((data) => {
        if (data === 'wrong credentials') {
          return setError('Wrong credentials, try again');
        }
        setPassword('');
        setUsername('');
        dispatch(setCurrentUser(data));
        navigation.replace('Home');
      })
      .catch((e) => {
        console.error(e);
        const errorNetwork = `${EXPO_PUBLIC_API_URL}/signIn`;
        setError('Network Error please try Again later. ',errorNetwork);
      });
      };

  useEffect(() => {
    if (user) {
      navigation.replace('Home');
    }
  }, [user, navigation]);
  useEffect(() => {
    console.log(EXPO_PUBLIC_API_URL)
  },[])
  return (
    <View style={[styles.container, { backgroundColor: themeColors.BACKGROUND }]}>
      <Text style={[styles.title, { color: themeColors.TEXT }]}>Gigs Picks</Text>
      <TextInput
        style={[styles.input, { color: themeColors.TEXT }]}
        placeholder="Username or Email"
        placeholderTextColor="#BFBFBF"
        keyboardType="username"
        autoCapitalize="none"
        onChangeText={handleChangeUsername}
        value={username}
      />
      <TextInput
        style={[styles.input, { color: themeColors.TEXT }]}
        placeholder="Password"
        placeholderTextColor="#BFBFBF"
        secureTextEntry
        onChangeText={handleChangePassword}
        value={password}
      />
      <TouchableOpacity style={[styles.loginButton, { backgroundColor: themeColors.PRIMARY_BUTTON }]} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>
      {haveError.length > 0 && (
        <View style={styles.ErrorContainer}>
          <Text style={styles.ErrorText}>*</Text>
          <Text style={styles.ErrorText}>{haveError}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.registerLink} onPress={goToRegister}>
        <Text style={[styles.registerLinkText, { color: themeColors.PRIMARY_BUTTON }]}>
          Don't have an account? Sign up
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  registerLink: {
    marginTop: 20,
  },
  registerLinkText: {
    fontSize: 16,
  },
  ErrorContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    gap: 5,
  },
  ErrorText: {
    color: 'red',
    marginTop: 10,
  },
});

export default LoginScreen;
