import React, { useState, useEffect, createRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image,
  ScrollView, KeyboardAvoidingView, Platform, ToastAndroid, Linking
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import pwdImage from '../../assets/images/Background.jpg';
import loginImage from '../../assets/images/login.png';
import emailImage from '../../assets/images/email.png';
import passwordImage from '../../assets/images/password.png';
import Loader from '../components/Loader';
import EncryptedStorage from 'react-native-encrypted-storage';
import syncStorage from 'react-native-sync-storage';

import CaptchaComponent from '../components/CaptchaComponent';

const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  const usernameInputRef = createRef();
  const passwordInputRef = createRef();
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        console.log('Checking if user is logged in...');
        const user = await EncryptedStorage.getItem('user');
        console.log('Retrieved user from EncryptedStorage:', user);
  
        if (user) {
          console.log('User found in storage, syncing with syncStorage...');
          syncStorage.set('user', user);
          const parsedUser = JSON.parse(user);
          console.log('Parsed user:', parsedUser);
  
          // Post to loginattempt API
          console.log('Posting to loginattempt API...');
          const loginAttemptResponse = await fetch('https://wwh.punjab.gov.pk/api/loginattempt', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              user_id: parsedUser.id, // Use the user ID from the parsed user object
              platform: 'app', // Hardcoded platform value
            }),
          });
  
          console.log('Login attempt response:', loginAttemptResponse);
  
          if (!loginAttemptResponse.ok) {
            throw new Error('Failed to log login attempt');
          }
  
          console.log('Navigating based on user role...');
          navigateBasedOnRole(parsedUser.roles[0], parsedUser);
        } else {
          console.log('No user found in storage.');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
  
    checkLoggedIn();
  }, []);
  
  const validateFields = () => {
    console.log('Validating fields...');
    if (!username.trim()) {
      console.log('Username is empty.');
      ToastAndroid.show('Please enter your email.', ToastAndroid.SHORT);
      return false;
    }
    if (!password.trim()) {
      console.log('Password is empty.');
      ToastAndroid.show('Please enter your password.', ToastAndroid.SHORT);
      return false;
    }
    console.log('Fields are valid.');
    return true;
  };
  
  const handleLogin = async () => {
    console.log('Handling login...');
    if (!isCaptchaValid) {
      ToastAndroid.show('Please enter a valid CAPTCHA', ToastAndroid.SHORT);
      return;
    }
  
   
    if (!validateFields()) {
      return;
    }
  
    setLoading(true);
    console.log('Loading set to true.');
  
    try {
      console.log('Making login API call...');
      const response = await fetch('https://wwh.punjab.gov.pk/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });
  
      const result = await response.json();
      console.log('Login API response:', result);
  
      if (response.ok) {
        console.log('Login successful, storing user data...');
        const userRole = result.user.roles[0];
        console.log('User role:', userRole);
  
        await EncryptedStorage.setItem('user', JSON.stringify(result.user));
        console.log('User stored in EncryptedStorage.');
  
        syncStorage.set('user', JSON.stringify(result.user));
        console.log('User synced with syncStorage.');
  
        navigateBasedOnRole(userRole, result.user);
        console.log('Navigated based on user role.');
  
        ToastAndroid.show('Login Successful', ToastAndroid.SHORT);
      } else {
        console.log('Login failed:', result.message || 'Invalid email or password.');
        ToastAndroid.show(result.message || 'Invalid email or password.', ToastAndroid.SHORT);
      }
    } catch (error) {
      console.error('Error during login:', error);
      ToastAndroid.show('Incorrect Login Credentials.', ToastAndroid.SHORT);
    } finally {
      console.log('Login process completed, setting loading to false.');
      setLoading(false);
    }
  };

  const navigateBasedOnRole = (role, user) => {
    switch (role) {
      case 1:
        navigation.navigate('DashboardA', { user });
        break;
      case 2:
        navigation.navigate('DashboardM', { user });
        break;
      case 3:
        navigation.navigate('DashboardWDD', { user });
        break;
      case 5:
         navigation.navigate('DashboardDeo', { user });
          break;
      default:
        ToastAndroid.show('Unknown role.', ToastAndroid.SHORT);
    }
  };
  const handleForgotPasswordPress = () => {
    // Open the provided URL
    Linking.openURL('https://wwh.punjab.gov.pk/forgot-password').catch((err) => {
      console.error("Failed to open URL: ", err);
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <ImageBackground source={pwdImage} style={styles.backgroundImage}>
          <View style={styles.container}>
            <View style={styles.topLine} />
            <Text style={styles.title}>Welcome Back</Text>
            <View style={styles.inputContainer1}>
              <Image source={emailImage} style={styles.icon} />
              <TextInput
                ref={usernameInputRef}
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#9A9A9A"
                value={username}
                onChangeText={setUsername}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress" // Provides additional email-specific features on iOS
              />
            </View>

            <View style={styles.inputContainer}>
              <Image source={passwordImage} style={styles.icon} />
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9A9A9A"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword} // Toggle password visibility
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordIcon}
              >
                <Icon
                  name={showPassword ? 'eye' : 'eye-slash'}
                  size={18}
                  style={styles.passicon}
                />
              </TouchableOpacity>
            </View>
 
            <CaptchaComponent 
            onCaptchaChange={(isValid) => setIsCaptchaValid(isValid)}
          />
            <TouchableOpacity>
              <Text style={styles.forgotPassword}  onPress={handleForgotPasswordPress}>Reset Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity 
            onPress={handleLogin}
            disabled={!isCaptchaValid || loading}
          >
            <LinearGradient
              colors={['#352E64', '#412E63', '#632D61', '#982B5D', '#C82A59']}
              style={[styles.button, (!isCaptchaValid || loading) && { opacity: 0.6 }]}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerText}>
                Not a member yet? <Text style={styles.signup}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </View>
          <Image source={loginImage} style={styles.loginImage} />
          {loading && <Loader />} 
        </ImageBackground>
      </ScrollView>
    </KeyboardAvoidingView>
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
    width: '120%',
    height: 0.5,
    backgroundColor: '#000',
    left: 0,
    marginTop: 10,
  },
  container: {
    width: '90%',
    alignItems: 'center',
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    marginTop: 20,
    color: '#000',
    marginBottom: '25%',
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontWeight: '300',
    fontFamily: 'Dubai-Regular',
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
    fontSize: 14,
    color: '#000',
  },
  icon: {
    width: 100,
    height: 30,
    marginRight: -20,
    marginLeft: -30,
  },
  showPasswordIcon: {
    position: 'absolute',
    right: 10, // Adjust right position
    top: '50%', // Center vertically
    transform: [{ translateY: -10 }], // Center vertically
  },
  passicon:{
    color:'#FF7074'
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    fontWeight: 'bold',
    color: '#06225B',
    fontSize: 12,
    marginBottom: 15,
    marginLeft: '60%',
    fontFamily: 'Dubai-Bold',
  },
  button: {
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 60,
    marginTop: 20,
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
    height: 350,
    resizeMode: 'contain',
    marginTop: 10,
  },
});

export default Login;
