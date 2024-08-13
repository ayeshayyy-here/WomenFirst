import React, { useState, createRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Pressable, ImageBackground, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient
import pwdIMage from '../../assets/images/Background.jpg';
import loginImage from '../../assets/images/login.png';  // Import the login image
import emailImage from '../../assets/images/email.png';  // Import the email image
import passwordImage from '../../assets/images/password.png';  // Import the password image

const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Create references for the TextInput components
  const usernameInputRef = createRef();
  const passwordInputRef = createRef();

  // Function to focus the username input
  const focusUsernameInput = () => {
    usernameInputRef.current.focus();
  };

  // Function to focus the password input
  const focusPasswordInput = () => {
    passwordInputRef.current.focus();
  };

  return (
    <ImageBackground
      source={pwdIMage}
      style={styles.backgroundImage}
    >
      <View style={styles.topLine} />
      <Text style={styles.title}>Welcome Back</Text>
      <View style={styles.container}>

        <View style={styles.inputContainer1}>
          <Image source={emailImage} style={styles.icon} /> 
          <TextInput
            ref={usernameInputRef} // Attach the reference
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#9A9A9A"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        <View style={styles.inputContainer}>
          <Image source={passwordImage} style={styles.icon} /> 
          <TextInput
            ref={passwordInputRef} // Attach the reference
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9A9A9A"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <LinearGradient
      colors={['#562f6a', '#dc2430']} // First color on the left, second color on the right
      start={{ x: 0, y: 0 }} // Gradient starts from the left side
      end={{ x: 1, y: 0 }}   // Gradient ends at the right side
      style={styles.button}
    >
      <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
    </LinearGradient>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerText}>
            Not a member? <Text style={styles.signup}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </View>
      <Image source={loginImage} style={styles.loginImage} />

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
  topLine: {
    width: '100%',
    height: 0.5, // Thickness of the line
    backgroundColor: '#000', // Color of the line
    bottom: 5,
    left: 0,
  },
  container: {
    width: '90%',
    // padding: 10,
    alignItems: 'center',
    marginTop: 10, // Adjust if needed to make space for the top line
  },
  title: {
    fontSize: 25,
    marginLeft: '6%',
    color: '#000',
    marginBottom: '25%',
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start', // Align the text view to the start of the container
  },
  inputContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: 20,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: 10,
    width: '100%',
  },
  input: {
    flex: 1,
    height: 40,
    // padding: 5,
    fontSize: 14,
    color: '#000',
  },
  icon: {
    width: 100, // Increased width
    height: 30, // Increased height
    marginRight: -20,
    marginLeft:-30
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    fontWeight:'bold',
    color: '#06225B',
    fontSize:12,
    marginBottom: 15,
    marginLeft:'60%'
  },
  button: {
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 50,
    marginBottom: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
  },
  footerText: {
    color: '#9A9A9A',
    fontSize: 14,
  },
  signup: {
    color: '#06225B',
    fontWeight: 'bold',
  },
  loginImage: {
    width: '100%',
    height: 350, // Increase the height of the image
    resizeMode: 'contain',
    marginTop: 10,
  },
});

export default Login;
