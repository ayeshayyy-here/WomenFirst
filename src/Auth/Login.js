import React, {useState, createRef} from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient
import pwdImage from '../../assets/images/Background.jpg';
import loginImage from '../../assets/images/login.png'; // Import the login image
import emailImage from '../../assets/images/email.png'; // Import the email image
import passwordImage from '../../assets/images/password.png'; // Import the password image

const Login = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Create references for the TextInput components
  const usernameInputRef = createRef();
  const passwordInputRef = createRef();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
    >
      <ScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false} // Hide vertical scrollbar
        showsHorizontalScrollIndicator={false} // Hide horizontal scrollbar
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
                secureTextEntry
              />
            </View>

            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
            <LinearGradient
              colors={['#4c1e86', '#d42b4d']} // Adjusted to match the gradient in the image
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
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
    height: 0.5, // Thickness of the line
    backgroundColor: '#000', // Color of the line
    left: 0,
    marginTop: 10,
  },
  container: {
    width: '90%',
    alignItems: 'center',
    marginTop: 10, // Adjust if needed to make space for the top line
  },
  title: {
    fontSize: 26,
    marginTop: 20,
    // marginLeft: '2%',
    color: '#000',
    marginBottom: '25%',
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start', // Align the text view to the start of the container
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
    width: 100, // Increased width
    height: 30, // Increased height
    marginRight: -20,
    marginLeft: -30,
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
    height: 350, // Increase the height of the image
    resizeMode: 'contain',
    marginTop: 10,
  },
});

export default Login;
