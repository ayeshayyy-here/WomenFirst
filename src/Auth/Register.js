import React, { useState, createRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ImageBackground, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient
import pwdIMage from '../../assets/images/Background.jpg';
import registerImage from '../../assets/images/register.png';  // Import the login image
import emailImage from '../../assets/images/email.png';  // Import the email image
import passwordImage from '../../assets/images/password.png';  // Import the password image
import Districtpic from '../../assets/images/district.png';
import DOB from '../../assets/images/dob.png';

const Register = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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
      <Text style={styles.title}>Sign Up</Text>
      <Text style={styles.subtitle}>Please provide the following information</Text>
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
        
        {/* <View style={styles.inputContainer}> */}
          {/* <Image source={passwordImage} style={styles.icon} />  */}
          <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.inputContainer}
            >
              <Image source={Districtpic} style={styles.icon} /> 
              <TextInput
                style={styles.input}
                placeholder="District"
                placeholderTextColor="#9A9A9A"
                value={district}
                onChangeText={setDistrict}
                editable={false} // Make it non-editable to prevent text entry
              />
            </TouchableOpacity>
        {/* </View> */}
        <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.inputContainer}
            >
              <Image source={DOB} style={styles.icon} /> 
              <TextInput
                style={styles.input}
                placeholder="Date of Birth"
                placeholderTextColor="#9A9A9A"
                value={district}
                onChangeText={setDistrict}
                editable={false} // Make it non-editable to prevent text entry
              />
            </TouchableOpacity>
        {/* <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity> */}

        <LinearGradient
      colors={['#562f6a', '#dc2430']} // First color on the left, second color on the right
      start={{ x: 0, y: 0 }} // Gradient starts from the left side
      end={{ x: 1, y: 0 }}   // Gradient ends at the right side
      style={styles.button}
    >
      <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </LinearGradient>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerText}>
            Already member? <Text style={styles.signup}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
      <Image source={registerImage} style={styles.loginImage} />

 <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select District</Text>
                {/* You can add more components inside the modal as needed */}
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
    bottom: 10,
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
    marginBottom: '2%',
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start', // Align the text view to the start of the container
  },
    subtitle: {
    fontSize: 14,
    marginLeft: '6%',
    color: 'grey',
    marginBottom: '2%',
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start', // Align the text view to the start of the container
  },
  inputContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginBottom: 10,
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
    marginTop: 20,
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
    // marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  modalButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#562f6a',
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default Register;
