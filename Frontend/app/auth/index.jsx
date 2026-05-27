// LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useDispatch } from 'react-redux';
import { login } from '../../src/redux/usersSlice';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();

  const handleLogin = () => {
    // Реализуйте логику для авторизации
    // В данном примере просто выводим в консоль введенные данные
    console.log('Username:', username);
    console.log('Password:', password);
    dispatch(login({username, password}))
    // Тут вы можете добавить ваш код для реальной авторизации
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={'light-content'}/>
      <Text style={styles.title}>Увійдіть в свій аккаунт</Text>
      <TextInput
        style={styles.input}
        placeholder="Нікнейм"
        placeholderTextColor='#9B907B'
        onChangeText={(text) => setUsername(text)}
        value={username}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        placeholderTextColor='#9B907B'
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        value={password}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Увійти</Text>
      </TouchableOpacity>
      <Text onPress={() => router.push('/auth/register')} style={styles.linkText}>
        Я не зареєстрован
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181c24',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#9B907B',
    marginBottom: 20,
  },
  input: {
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    width: 280,
    borderRadius: 5,
    color: '#9B907B',
    fontSize: 18,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    fontSize: 17,
    color: '#3498db',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;
