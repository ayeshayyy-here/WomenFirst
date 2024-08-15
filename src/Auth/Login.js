import React, { useState, createRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import Icon component
import pwdImage from '../../assets/images/Background.jpg';
import loginImage from '../../assets/images/login.png';
import emailImage from '../../assets/images/email.png';
import passwordImage from '../../assets/images/password.png';
import Loader from '../components/Loader'; // Import the custom Loader component

const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State for showing/hiding password
  const usernameInputRef = createRef();
  const passwordInputRef = createRef();

  const validateFields = () => {
    if (!username.trim()) {
      ToastAndroid.show('Please enter your email.', ToastAndroid.SHORT);
      return false;
    }
    if (!password.trim()) {
      ToastAndroid.show('Please enter your password.', ToastAndroid.SHORT);
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateFields()) {
      return; // Do not proceed if validation fails
    }

    console.log('Logging in with:', { email: username, password });

    setLoading(true); // Show loader

    try {
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
      
      console.log('API Response:', result); // Log the entire response for debugging

      if (response.ok) {
        // If login is successful, navigate to the dashboard
        ToastAndroid.show('Login Successful', ToastAndroid.SHORT);
        navigation.navigate('Dashboard', { user: result.user });
      } else {
        // If the API returns an error, display an alert with the error message
        ToastAndroid.show(result.message || 'Invalid email or password.', ToastAndroid.SHORT);
      }
    } catch (error) {
      // Handle network errors
      ToastAndroid.show('An error occurred. Please try again later.', ToastAndroid.SHORT);
    } finally {
      setLoading(false); // Hide loader
    }
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

            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogin}>
              <LinearGradient
                colors={['#4c1e86', '#d42b4d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.button}
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
