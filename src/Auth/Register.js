import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ImageBackground,
  Image,
  ToastAndroid,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Assuming you use MaterialIcons
import LinearGradient from 'react-native-linear-gradient';
import pwdIMage from '../../assets/images/Background.jpg';
import registerImage from '../../assets/images/register.png';
import NameImage from '../../assets/images/name.png';
import emailImage from '../../assets/images/email.png';
import passwordImage from '../../assets/images/password.png';
import Districtpic from '../../assets/images/district.png';
import CnicImage from '../../assets/images/cnic.png';
import PhoneImage from '../../assets/images/phone.png';
import DOB from '../../assets/images/dob.png';
import DateTimePicker from '@react-native-community/datetimepicker';
import Loader from '../components/Loader';
import CaptchaComponent from '../components/CaptchaComponent';

const Register = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [useremail, setUseremail] = useState('');
  const [cnic, setCnic] = useState('');
  const [phoneNo, setPhoneNo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [district, setDistrict] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [date, setDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [districtId, setDistrictId] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);
  // New state variables for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // 18 years age restriction
  const today = new Date();
  const minDate = new Date(
    today.getFullYear() - 18,
    today.getMonth(),
    today.getDate(),
  );

  // Fetch districts data from API
  useEffect(() => {
    fetch('https://wwh.punjab.gov.pk/api/districts')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched districts data:', data);
        setDistricts(data.districts);
      })
      .catch(error => {
        console.error('Error fetching districts:', error);
      });
  }, []);
  // Search function
  useEffect(() => {
    if (searchQuery === '') {
      setFilteredDistricts(districts); // Reset to all districts if search query is empty
    } else {
      const filtered = districts.filter(district =>
        district.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredDistricts(filtered);
    }
  }, [searchQuery, districts]);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);

    if (currentDate > minDate) {
      Alert.alert('Age Restriction', 'You must be at least 18 years old.', [
        { text: 'OK' },
      ]);
      setDate(null);
    } else {
      setDate(currentDate);
    }
  };

  const handleDistrictSelect = district => {
    setDistrict(district.name);
    setDistrictId(district.id); // to store the districtId
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    // Existing validation
     if (!isCaptchaValid) {
          ToastAndroid.show('Please enter a valid CAPTCHA', ToastAndroid.SHORT);
          return;
        }
    if (!username) {
      ToastAndroid.show('Please Enter your Name.', ToastAndroid.LONG);
      return;
    }
    if (!useremail) {
      ToastAndroid.show('Email is required.', ToastAndroid.LONG);
      return;
    }
    if (!cnic) {
      ToastAndroid.show('Please enter your CNIC.', ToastAndroid.LONG);
      return;
    }
    // CNIC format validation (13 digits)
    const cnicRegex = /^\d{13}$/;
    if (!cnicRegex.test(cnic)) {
      ToastAndroid.show(
        'CNIC must be exactly 13 digits long.',
        ToastAndroid.LONG,
      );
      return;
    }
    if (!phoneNo) {
      ToastAndroid.show('Please enter your phone number.', ToastAndroid.LONG);
      return;
    }
    // Phone number format validation (10 to 11 digits)
    const phoneRegex = /^\d{11}$/;
    if (!phoneRegex.test(phoneNo)) {
      ToastAndroid.show(
        'Phone number must be 11 digits long.',
        ToastAndroid.LONG,
      );
      return;
    }
    if (!district) {
      ToastAndroid.show('Please select a district.', ToastAndroid.LONG);
      return;
    }
    if (!date) {
      ToastAndroid.show('Please select your Date of Birth.', ToastAndroid.LONG);
      return;
    }
    if (!password) {
      ToastAndroid.show('Password is required.', ToastAndroid.LONG);
      return;
    }
    if (password.length < 8) {
      ToastAndroid.show(
        'Password must be at least 8 characters long.',
        ToastAndroid.LONG,
      );
      return;
    }
    if (password !== confirmPassword) {
      ToastAndroid.show('Passwords do not match.', ToastAndroid.LONG);
      return;
    }
    setLoading(true);
    fetch('https://wwh.punjab.gov.pk/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: username,
        email: useremail,
        cnic: cnic,
        phone_no: phoneNo,
        district: districtId,
        dob: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        password,
        password_confirmation: confirmPassword,
        chk: '1',
      }),
    })
      .then(async response => {
        const text = await response.text();
        console.log('Response Text:', text);
        try {
          const data = JSON.parse(text);
          console.log('Registration Response:', data);
          if (data.success) {
            ToastAndroid.show(
              'User Registered Successfully!',
              ToastAndroid.LONG,
            );
            navigation.navigate('Login');
          } else {
            ToastAndroid.show(
              'Registration failed. Please try again.',
              ToastAndroid.LONG,
            );
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
          ToastAndroid.show(
            'An error occurred. Please try again.',
            ToastAndroid.LONG,
          );
        }
      })
      .catch(error => {
        console.error('Error registering user:', error);
        ToastAndroid.show(
          'An error occurred. Please try again.',
          ToastAndroid.LONG,
        );
      })
      .finally(() => {
        // Hide loader after submission
        setLoading(false);
      });
  };

  return (

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <ImageBackground source={pwdIMage} style={styles.backgroundImage}>
          <View style={styles.topLine} />
          <Text style={styles.title}>Sign Up</Text>
          <Text style={styles.subtitle}>
            Please provide the following information
          </Text>
          <View style={styles.centeredContent}>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer1}>
                <Image source={NameImage} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#9A9A9A"
                  value={username}
                  onChangeText={setUsername}
                />
              </View>
              <View style={styles.inputContainer1}>
                <Image source={emailImage} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#9A9A9A"
                  value={useremail}
                  onChangeText={setUseremail}
                />
              </View>
              <View style={styles.inputContainer1}>
                <Image source={CnicImage} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Cnic"
                  maxLength={13}
                  placeholderTextColor="#9A9A9A"
                  value={cnic}
                  onChangeText={setCnic}
                />
              </View>
              <View style={styles.inputContainer1}>
                <Image source={PhoneImage} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="Mobile no."
                  maxLength={11}
                  placeholderTextColor="#9A9A9A"
                  value={phoneNo}
                  onChangeText={setPhoneNo}
                />
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.inputContainer}>
                <Image source={Districtpic} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="District"
                  placeholderTextColor="#9A9A9A"
                  value={district}
                  editable={false}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowDatePicker(true)}>
                <Image source={DOB} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Date of Birth"
                  placeholderTextColor="#9A9A9A"
                  value={date ? date.toDateString() : ''}
                  editable={false}
                />
              </TouchableOpacity>

              <View style={styles.inputContainer}>
                <Image source={passwordImage} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9A9A9A"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword} // Toggle visibility
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.showPasswordIcon}>
                  <Icon
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={24}
                    color="#FF7074"
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <Image source={passwordImage} style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#9A9A9A"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword} // Toggle visibility
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.showPasswordIcon}>
                  <Icon
                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                    size={24}
                    color="#FF7074"
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
              <CaptchaComponent 
            onCaptchaChange={(isValid) => setIsCaptchaValid(isValid)}
          />
              <TouchableOpacity  disabled={!isCaptchaValid || loading}
                      onPress={handleSubmit}>
                          <LinearGradient
                            colors={['#352E64', '#412E63', '#632D61', '#982B5D', '#C82A59']}
                            style={[styles.button, (!isCaptchaValid || loading) && { opacity: 0.6 }]}
                          >
                  <Text style={styles.buttonText}>Submit</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerText}>
                  Already a member? <Text style={styles.signup}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
            <Image source={registerImage} style={styles.loginImage} />
          </View>
        </ImageBackground>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select District</Text>

              <View style={styles.searchContainer}>
                <Icon
                  name="search"
                  size={24}
                  color="#9A9A9A"
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search District"
                  placeholderTextColor="#9A9A9A"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              <ScrollView
                style={styles.modalList}
                showsVerticalScrollIndicator={false}>
                {filteredDistricts.length > 0 ? (
                  filteredDistricts.map(item => (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleDistrictSelect(item)}
                      style={styles.modalButton}>
                      <Text style={styles.modalButtonText}>{item.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.modalButtonText}>
                    No districts available
                  </Text>
                )}
              </ScrollView>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.closebuttontext}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {showDatePicker && (
          <DateTimePicker
            value={date || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        {loading && <Loader />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
  },
  topLine: {
    width: '120%',
    height: 0.3,
    backgroundColor: '#000',
    left: 0,
    marginTop: '14%',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    margin: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    padding: 8,
    fontSize: 16,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  showPasswordIcon: {
    position: 'absolute',
    right: 10, // Adjust right position
    top: '50%', // Center vertically
    transform: [{ translateY: -10 }], // Center vertically
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  formContainer: {
    width: '90%',
    alignItems: 'center',
    marginTop: 30, // Adjust space from the top
  },
  title: {
    fontSize: 25,
    marginBottom: 5,
    marginTop: '5%',
    color: '#000',
    marginLeft: '7%', // Adjust this value as needed
    fontWeight: '300',
    fontFamily: 'Dubai-Regular',
  },
  passicon:{
    color:'#FF7074'
  },
  subtitle: {
    fontSize: 14,
    // marginBottom: 10,
    color: 'grey',
    marginLeft: '7%', // Adjust this value as needed
    // textAlign: 'left',
  },
  inputContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginTop: 10,
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginTop: 10,
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
  button: {
    borderRadius: 25,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 60,
    marginTop: 18,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
  },
  footerText: {
    color: '#9A9A9A',
    fontSize: 14,
    marginTop: 8,
  },
  signup: {
    color: '#06225B',
    fontWeight: 'bold',
  },
  loginImage: {
    width: '100%',
    height: 150, // Increase the height of the image
    resizeMode: 'contain',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
    textAlign: 'center',
  },
  modalList: {
    maxHeight: 300, // Adjust height as needed
  },
  modalButton: {
    padding: 10,
    // borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  modalButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  closebuttontext: {
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
  },
  modalCloseButton: {
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
});

export default Register;
