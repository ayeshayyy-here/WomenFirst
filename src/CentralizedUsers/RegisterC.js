import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Dimensions, Image, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';

const RegisterC = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    contact: '',
    dob: new Date(1999, 0, 1),
    district: '', // This will be "name+id" combination
    tehsil: 'Not Found',
    email: '',
    address: ''
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [districts, setDistricts] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [isFocus, setIsFocus] = useState(false);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await fetch('https://wwh.punjab.gov.pk/api/districts');
        const data = await response.json();
        if (data.success && data.districts) {
          const formattedDistricts = data.districts.map(district => ({
            label: district.name,
            value: `${district.name}${district.id}`, // Combine name + ID
            originalName: district.name,
            originalId: district.id
          }));
          setDistricts(formattedDistricts);
          console.log('Districts loaded with combined values:', formattedDistricts);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
        Alert.alert('Error', 'Failed to load districts. Please try again later.');
      } finally {
        setLoadingDistricts(false);
      }
    };

    fetchDistricts();
  }, []);

  // Function to extract ID from combined string
  const extractDistrictId = (combinedString) => {
    // Extract numbers from the end of the string
    const idMatch = combinedString.match(/\d+$/);
    return idMatch ? idMatch[0] : '';
  };

  // Function to extract name from combined string
  const extractDistrictName = (combinedString) => {
    // Remove numbers from the end of the string
    return combinedString.replace(/\d+$/, '');
  };

  const handleChange = (name, value) => {
    setFormData({...formData, [name]: value});
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('dob', selectedDate);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name) newErrors.name = 'Name is required';
    
    // CNIC validation - must be 13 digits AND last digit must be even
    if (!formData.cnic || formData.cnic.length !== 13 || !/^\d+$/.test(formData.cnic)) {
      newErrors.cnic = 'CNIC must be exactly 13 digits';
    } else {
      const lastDigit = parseInt(formData.cnic.charAt(12));
      if (lastDigit % 2 !== 0) {
        newErrors.cnic = 'CNIC last digit must be an even number';
      }
    }
    
    // Contact validation
    if (!formData.contact || formData.contact.length < 11 || !/^\d+$/.test(formData.contact)) {
      newErrors.contact = 'Contact must be at least 11 digits';
    }
    
    // Email validation
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // District validation
    if (!formData.district) newErrors.district = 'District is required';
    
    // Address validation
    if (!formData.address) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const formattedDate = formData.dob.toISOString().split('T')[0];
      
      // Extract both name and ID from the combined string
      const districtName = extractDistrictName(formData.district);
      const districtId = extractDistrictId(formData.district);
      
      console.log('Sending registration data to backend:', {
        Name: formData.name,
        CNIC: formData.cnic,
        Contact: formData.contact,
        D_O_B: formattedDate,
        District: formData.district, // Combined "name+id" string
        DistrictName: districtName,   // Extracted name
        DistrictId: districtId,       // Extracted ID
        Tehsil: formData.tehsil,
        Email: formData.email,
        Address: formData.address
      });
      
   const response = await fetch('https://dashboard-wdd.punjab.gov.pk/api/register', {
     // const response = await fetch('https://dashboard-wdd.punjab.gov.pk/api/managerHregister', {
  
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          Name: formData.name,
          CNIC: formData.cnic,
          Contact: formData.contact,
          D_O_B: formattedDate,
          District: formData.district, // Send combined "name+id" string
          Tehsil: formData.tehsil,
          Email: formData.email,
          Address: formData.address
        })
      });
      
      const data = await response.json();
      console.log('Registration response:', data);
      
      if (response.ok) {
        Alert.alert(
          'Success',
          data.message || 'User registered successfully',
          [{ text: 'OK', onPress: () => navigation.navigate('LoginC') }]
        );
      } else {
        if (response.status === 409) {
          Alert.alert('Error', data.message || 'User already exists');
        } else if (response.status === 422) {
          const backendErrors = data.errors || {};
          setErrors(prev => ({ ...prev, ...backendErrors }));
          Alert.alert('Validation Error', 'Please check your inputs');
        } else {
          Alert.alert('Error', data.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle district selection
  const handleDistrictChange = (item) => {
    // Set the combined "name+id" value
    setFormData({
      ...formData,
      district: item.value // This is the combined "name+id" string
    });
    
    if (errors.district) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.district;
        return newErrors;
      });
    }
    setIsFocus(false);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Curved Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={['#8e44ad', '#9b59b6']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerCurve} />
        </LinearGradient>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Combined Header Content */}
        <View style={styles.headerContent}>
          <Image 
          source={require('../../assets/images/logocm.png')}
       // source={{uri: 'https://cmp.punjab.gov.pk/img/maryam.png'}} 
            style={styles.headerLogo}
            resizeMode="contain"
          />
          
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>WOMEN FIRST!</Text>
            <View style={styles.taglineBox}>
              <Text style={styles.urduTagline}>ایک ایپ، آٹھ سہولتیں</Text>
              <Text style={styles.englishTagline}>One App, Eight Facilities</Text>
            </View>
          </View>
    
          <Image 
            source={require('../../assets/images/women.png')}
            style={styles.headerLogoo}
            resizeMode="contain"
          />
        </View>

        {/* Registration Form */}
        <View style={styles.loginCard}>
          <View style={styles.titleContainer}>
            <Text style={styles.loginTitle}>Create Account</Text>
            <Text style={styles.loginSubtitle}>Join to access all services</Text>
          </View>

          {[
            { label: 'Full Name', name: 'name', placeholder: 'Enter your full name', icon: 'person' },
            { 
              label: 'CNIC Number', 
              name: 'cnic', 
              placeholder: 'Enter 13-digit CNIC (last digit must be even)', 
              icon: 'credit-card', 
              keyboardType: 'numeric', 
              maxLength: 13 
            },
            { label: 'Mobile Number', name: 'contact', placeholder: '03XXXXXXXXX', icon: 'phone', keyboardType: 'phone-pad', maxLength: 11 },
            { label: 'Email Address', name: 'email', placeholder: 'example@domain.com', icon: 'email', keyboardType: 'email-address', autoCapitalize: 'none' },
          ].map((field) => (
            <View key={field.name} style={styles.inputSection}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              <View style={[styles.inputContainer, errors[field.name] && styles.errorInput]}>
                <Icon name={field.icon} size={20} color="#8e44ad" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor="#aaa"
                  value={formData[field.name]}
                  onChangeText={(text) => handleChange(field.name, text)}
                  keyboardType={field.keyboardType}
                  maxLength={field.maxLength}
                  autoCapitalize={field.autoCapitalize}
                />
              </View>
              {errors[field.name] && <Text style={styles.errorText}>{errors[field.name]}</Text>}
            </View>
          ))}

          {/* District Dropdown */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>District</Text>
            <Dropdown
              style={[styles.dropdown, isFocus && { borderColor: '#8e44ad' }, errors.district && styles.errorInput]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              data={districts}
              search
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocus ? 'Select your district' : '...'}
              searchPlaceholder="Search..."
              value={formData.district}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onChange={handleDistrictChange}
              renderLeftIcon={() => (
                <Icon name="location-city" size={20} color="#8e44ad" style={styles.inputIcon} />
              )}
              disable={loadingDistricts}
            />
            {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
            {formData.district && (
              <Text style={styles.infoText}>
                Selected: {extractDistrictName(formData.district)} 
                {extractDistrictId(formData.district) && ` (ID: ${extractDistrictId(formData.district)})`}
              </Text>
            )}
          </View>

          {/* Date of Birth Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TouchableOpacity 
              style={[styles.inputContainer, errors.dob && styles.errorInput]}
              onPress={() => setShowDatePicker(true)}
            >
              <Icon name="event" size={20} color="#8e44ad" style={styles.inputIcon} />
              <Text style={[styles.input, {color: formData.dob ? '#2d3436' : '#aaa'}]}>
                {formData.dob ? formData.dob.toLocaleDateString() : 'Select date of birth'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.dob}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
            {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
          </View>

          {/* Address Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Complete Address</Text>
            <View style={[styles.inputContainer, {height: 100}, errors.address && styles.errorInput]}>
              <Icon name="home" size={20} color="#8e44ad" style={[styles.inputIcon, {alignSelf: 'flex-start', marginTop: 12}]} />
              <TextInput
                style={[styles.input, {textAlignVertical: 'top', height: 80}]}
                placeholder="House #, Street, Area"
                placeholderTextColor="#aaa"
                value={formData.address}
                onChangeText={(text) => handleChange('address', text)}
                multiline
              />
            </View>
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          <TouchableOpacity 
            style={styles.loginButton}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <LinearGradient
              colors={['#8e44ad', '#9b59b6']}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'CREATING ACCOUNT...' : 'REGISTER NOW'}
              </Text>
              <Icon name="arrow-forward" size={20} color="white" style={styles.buttonIcon} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Already registered?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('LoginC')}>
              <Text style={styles.registerLink}>Login Here</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© Women Development Department</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};


const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({

 infoText: {
    color: '#636e72',
    fontSize: 10,
    marginTop: 5,
    marginLeft: 5,
    fontStyle: 'italic',
  },

  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBackground: {
    height: height * 0.25,
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  gradient: {
    flex: 1,
  },
  headerCurve: {
    position: 'absolute',
    bottom: -50,
    height: 60,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: height * 0.05,
    marginBottom: 10,
  },
  headerLogo: {
    width: 100,
    height: 100,
    shadowColor: '#f7f2f2ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
     headerLogoo: {
    width: 70,
    height: 70,
    shadowColor: '#a39d9d',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    color: '#fff',
     backgroundColor: '#fff',
    borderRadius: 35,
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 8,
  },
  taglineBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  urduTagline: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  englishTagline: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f1f1',
  },
  titleContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8e44ad',
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 12,
    color: '#8e44ad',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 18,
  },
  inputLabel: {
    color: '#556b70ff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 15,
    height: 50,
  },
  dropdown: {
    height: 50,
    backgroundColor: '#fafafa',
    borderColor: '#eee',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  placeholderStyle: {
    fontSize: 10,
    color: '#aaa',
    marginLeft: 10,
  },
  selectedTextStyle: {
    fontSize: 10,
    color: '#2d3436',
    marginLeft: 10,
  },
  iconStyle: {
    width: 10,
    height: 10,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#2d3436',
    fontSize: 14,
    height: '100%',
  },
  errorInput: {
    borderColor: '#d63031',
  },
  errorText: {
    color: '#d63031',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  infoText: {
    color: '#636e72',
    fontSize: 10,
    marginTop: 5,
    marginLeft: 5,
    fontStyle: 'italic',
  },
  loginButton: {
    borderRadius: 10,
    height: 50,
    marginTop: 15,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#636e72',
    fontSize: 12,
  },
  registerLink: {
    color: '#8e44ad',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  footerText: {
    color: '#636e72',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default RegisterC;