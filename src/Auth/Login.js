import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Pressable, Alert, ImageBackground } from 'react-native';
import pwdIMage from '../../assets/images/Background.jpg';

const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [click,setClick] = useState(false);

  // const handleLogin = () => {
  //   if (username === 'admin' && password === 'password') {
  //     Alert.alert('Login Success', 'Welcome to the app!');
  //     // Navigate to another screen if needed
  //     // navigation.navigate('Home');
  //   } else {
  //     Alert.alert('Login Failed', 'Invalid username or password');
  //   }
  // };

  return (
    <ImageBackground
      source={pwdIMage} // Replace with your background image URL
      style={styles.backgroundImage}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#aaa"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <View style={styles.rememberView}>
            <View style={styles.switch}>
                <Switch  value={click} onValueChange={setClick} trackColor={{true : "#06225B" , false : "white"}} />
                <Text style={styles.rememberText}>Remember Me</Text>
            </View>
            <View>
                <Pressable onPress={() => Alert.alert("Forget Password!")}>
                    <Text style={styles.forgetText}>Forgot Password?</Text>
                </Pressable>
            </View>
        </View>
        <TouchableOpacity style={styles.button}onPress={() => navigation.navigate('Dashboard')}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <View>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerText}>Don't Have Account?  <Text style={styles.signup}>Sign Up</Text></Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: darken the background image
  },
  container: {
    width: '90%',
    height: '45%',
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background for the form
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 30,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rememberView: {
    width: "100%",
    justifyContent: "space-between", // Distribute space between elements
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
    color: "#333",
  },
  switch: {
    flexDirection: "row",
    gap: 1,
    alignItems: "center",
    color: "#333",
  },
  rememberText: {
    fontSize: 13,
    color: "#333",
  },
  forgetText: {
    fontSize: 11,
    color: "#365FC4",
  },
  footerText : {
    textAlign: "center",
    color: '#333',
    padding: 15,
  },
  signup : {
    color: "#365FC4",
    fontSize : 13
  },
});

export default Login;
