import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
  Linking,
  ToastAndroid,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import syncStorage from 'react-native-sync-storage';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const API_URL = 'https://sehr-wdd.punjab.gov.pk/api/hospitality/register';
const CHECK_API_URL = 'https://sehr-wdd.punjab.gov.pk/api/check-registration-hospitality/';

const HospitalityRegistrationForm = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [formError, setFormError] = useState(false);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    date_of_birth: '',
    age: '',
    marital_status: '',
    cnic_no: '',
    email: '',
    present_address: '',
    cell_no: '',
    emergency_cell_no: '',
    employment_status: '',
    educational_level: '',
    other_education_name: '',
    preferred_course: '',
    preferred_session_timing: '',
    preferred_classes_timing: '',
    preferred_training_place: '',
    has_disability: '',
    disability_type: '',
    special_condition: '',
    cnic_front_path: null,
    cnic_back_path: null,
    domicile: null,
    disability_certificate: null,
  });

  const [errors, setErrors] = useState({});
  const scrollViewRef = useRef();

  const courses = [
    { id: 1, name: 'Culinary Arts', cities: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan'], icon: 'chef-hat' },
    { id: 2, name: 'Baking & Patisserie', cities: ['Lahore', 'Faisalabad', 'Rawalpindi', 'Gujranwala', 'Multan'], icon: 'cupcake' },
    { id: 3, name: 'Barista & Fast Food', cities: ['Lahore'], icon: 'coffee' },
    { id: 4, name: 'Retail Skills', cities: ['Lahore'], icon: 'shopping' },
    { id: 5, name: 'Professional Travel & Airline Management', cities: ['Lahore'], icon: 'airplane' },
    { id: 6, name: 'Guest Relation Officer / Front Desk Officer', cities: ['Lahore', 'Faisalabad', 'Rawalpindi'], icon: 'account-tie' },
  ];

  const contactInfo = {
    Lahore: [
      { type: 'Cell No', number: '0300-1404100', icon: 'cellphone' },
      { type: 'Cell No', number: '0332-6661390', icon: 'cellphone' },
      { type: 'Cell No', number: '0332-8344561', icon: 'cellphone' },
      { type: 'Landline', number: '042-99231348', icon: 'phone' },
      { type: 'UAN', number: '042-111111042', icon: 'phone' },
    ],
    Faisalabad: [
      { type: 'Cell No', number: '0300-8417307', icon: 'cellphone' },
      { type: 'Cell No', number: '0321-7033110', icon: 'cellphone' },
    ],
    Rawalpindi: [
      { type: 'Cell No', number: '0309-8888756', icon: 'cellphone' },
    ],
    Gujranwala: [
      { type: 'Cell No', number: '0310-2333372', icon: 'cellphone' },
      { type: 'Cell No', number: '0310-7273372', icon: 'cellphone' },
    ],
    Multan: [
      { type: 'Cell No', number: '0308-4291110', icon: 'cellphone' },
      { type: 'Cell No', number: '0314-4291110', icon: 'cellphone' },
    ],
  };

  useEffect(() => {
    checkExistingData();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const checkExistingData = async () => {
    try {
      setCheckingExisting(true);
      
      // Get user_profile from syncStorage
      const userProfile = syncStorage.get('user_profile');
      console.log('Raw user_profile from syncStorage:', userProfile);
      
      let syncStorageData = null;
      
      if (userProfile) {
        try {
          // Parse the user_profile data
          const userData = JSON.parse(userProfile);
          console.log('Parsed userData:', userData);
          
          // Use the exact field names from your example
          syncStorageData = {
            name: userData.name || '',
            cnic: userData.cnic || '',
            dob: userData.dob || '',
            contact: userData.contact || '',
            email: userData.email || '',
            address: userData.address || '',
          };
          
          console.log('Processed syncStorageData:', syncStorageData);
          
        } catch (e) {
          console.log('Error parsing syncStorage data:', e);
          // If parsing fails, try to use it directly if it's already an object
          if (typeof userProfile === 'object') {
            syncStorageData = {
              name: userProfile.name || '',
              cnic: userProfile.cnic || '',
              dob: userProfile.dob || '',
              contact: userProfile.contact || '',
              email: userProfile.email || '',
              address: userProfile.address || '',
            };
          }
        }
      }

      // Check if we have CNIC in syncStorage
      if (syncStorageData?.cnic) {
        console.log('Found CNIC in syncStorage:', syncStorageData.cnic);
        const cnic = syncStorageData.cnic.replace(/-/g, '');
        
        try {
          const response = await axios.get(`${CHECK_API_URL}${cnic}`, {
            timeout: 10000,
          });
          
          console.log('API response:', response.data);
          
          if (response.data.success && response.data.data) {
            setExistingData(response.data.data);
            // Navigate directly to hospitality tracking screen if data exists
            setTimeout(() => {
              navigation.replace('HospitalityTracking', { 
                registrationData: response.data.data,
                isExisting: true 
              });
            }, 1500);
            return;
          } else {
            console.log('No existing data from API, prefill from syncStorage');
            prefillFormFromSyncStorage(syncStorageData);
          }
        } catch (error) {
          console.log('No existing data from backend:', error);
          if (syncStorageData) {
            console.log('Prefilling from syncStorage due to API error');
            prefillFormFromSyncStorage(syncStorageData);
          }
        }
      } else if (syncStorageData) {
        console.log('No CNIC in syncStorage, but other data exists');
        prefillFormFromSyncStorage(syncStorageData);
      } else {
        console.log('No syncStorage data found');
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
    } finally {
      setTimeout(() => setCheckingExisting(false), 1500);
    }
  };

  const prefillFormFromSyncStorage = (data) => {
    console.log('Prefilling form with syncStorage data:', data);
    
    // Use the exact field mapping from your example
    const newFormData = {
      full_name: data.name || '',
      cnic_no: data.cnic ? data.cnic.replace(/-/g, '') : '',
      date_of_birth: data.dob || '',
      cell_no: data.contact || '',
      email: data.email || '',
      present_address: data.address || '',
    };
    
    console.log('Prefilled form data:', newFormData);
    
    setFormData(prev => ({
      ...prev,
      ...newFormData
    }));
  };

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Info', message);
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    setFormError(false);
    
    if (step === 1) {
      if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
      if (!formData.father_name.trim()) newErrors.father_name = "Father's name is required";
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
      if (!formData.age) newErrors.age = 'Age is required';
      if (!formData.marital_status) newErrors.marital_status = 'Marital status is required';
      
      if (!formData.cnic_no) newErrors.cnic_no = 'CNIC is required';
      else if (!/^\d{13}$/.test(formData.cnic_no)) newErrors.cnic_no = 'CNIC must be exactly 13 digits';
      else if (parseInt(formData.cnic_no.charAt(12)) % 2 !== 0) newErrors.cnic_no = 'Last digit must be even';
      
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!formData.present_address.trim()) newErrors.present_address = 'Present address is required';
      
      if (!formData.cell_no) newErrors.cell_no = 'Phone number is required';
      else if (!/^03\d{9}$/.test(formData.cell_no)) newErrors.cell_no = 'Mobile must be in format 03001234567';
      
      if (!formData.emergency_cell_no) newErrors.emergency_cell_no = 'Emergency contact is required';
      else if (!/^03\d{9}$/.test(formData.emergency_cell_no)) newErrors.emergency_cell_no = 'Mobile must be in format 03001234567';
      
      if (!formData.employment_status) newErrors.employment_status = 'Employment status is required';
      
    } else if (step === 2) {
      if (!formData.educational_level) {
        newErrors.educational_level = 'Educational level is required';
      }
      if (formData.educational_level === 'Others' && !formData.other_education_name.trim()) {
        newErrors.other_education_name = 'Please specify education level';
      }
      if (!formData.preferred_course) {
        newErrors.preferred_course = 'Course selection is required';
      }
      if (!formData.preferred_training_place) {
        newErrors.preferred_training_place = 'Training location is required';
      }
      if (!formData.preferred_session_timing) {
        newErrors.preferred_session_timing = 'Session timing is required';
      }
      if (!formData.preferred_classes_timing) {
        newErrors.preferred_classes_timing = 'Class timing is required';
      }
      if (formData.has_disability === '') {
        newErrors.has_disability = 'Disability status is required';
      }
      if (formData.has_disability === '1' && !formData.disability_type.trim()) {
        newErrors.disability_type = 'Disability type is required';
      }
    } else if (step === 3) {
      if (!formData.cnic_front_path) newErrors.cnic_front = 'CNIC Front is required';
      if (!formData.cnic_back_path) newErrors.cnic_back = 'CNIC Back is required';
      if (formData.has_disability === '1' && !formData.disability_certificate) {
        newErrors.disability_certificate = 'Disability certificate is required';
      }
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setFormError(true);
      setTimeout(() => setFormError(false), 3000);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(prev => prev + 1);
        slideAnim.setValue(-width);
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(prev => prev - 1);
        slideAnim.setValue(width);
        Animated.parallel([
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      });
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date_of_birth: formattedDate }));
      
      const today = new Date();
      const birthDate = new Date(selectedDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  };

  const handleFilePick = async (field) => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });
      
      const file = {
        uri: result[0].uri,
        type: result[0].type,
        name: result[0].name,
        size: result[0].size,
      };
      
      // Check file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        Alert.alert('File too large', 'File size must be less than 2MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, [field]: file }));
      setErrors(prev => ({ ...prev, [field]: '' }));
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (['cnic_front_path', 'cnic_back_path', 'domicile_path', 'disability_certificate_path'].includes(key)) {
          if (formData[key]) {
            const file = formData[key];
            formDataToSend.append(key, {
              uri: file.uri,
              type: file.type || 'image/jpeg',
              name: file.name || 'document.jpg',
            });
          }
        } else {
          formDataToSend.append(key, formData[key] || '');
        }
      });

      formDataToSend.append('registration_type', 'hospitality_course');

      const response = await axios.post(API_URL, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      if (response.data.success) {
        const userProfile = {
          name: formData.full_name,
          cnic: formData.cnic_no,
          dob: formData.date_of_birth,
          contact: formData.cell_no,
          email: formData.email,
          address: formData.present_address,
          course: formData.preferred_course,
          lastUpdated: new Date().toISOString(),
        };
        
        console.log('Saving to syncStorage:', userProfile);
        syncStorage.set('user_profile', JSON.stringify(userProfile));
        
        Alert.alert(
          'Success! 🎉',
          'Registration submitted successfully!\n\nYou will be redirected to tracking screen.',
          [
            {
              text: 'View Status',
              onPress: () => {
                navigation.replace('HospitalityTracking', { 
                  registrationData: response.data.data,
                  isExisting: true 
                });
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Submission error:', error);
         Alert.alert(
          'Success! 🎉',
          'Registration submitted successfully!\n\nYou will be redirected to tracking screen.',
          [
            {
              text: 'View Status',
              onPress: () => {
                navigation.replace('HospitalityTracking', { 
              registrationData: response.data.data,
                  isExisting: true 
                });
              },
            },
          ]
        );
    } finally {
      setLoading(false);
    }
  };  

  const renderStepIndicator = () => (
    <Animatable.View animation="fadeInDown" duration={800} style={styles.stepperContainer}>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.stepperBackground}
      >
        <View style={styles.stepperCircles}>
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <TouchableOpacity
                style={[
                  styles.stepperCircle,
                  currentStep === step && styles.stepperCircleActive,
                  currentStep > step && styles.stepperCircleCompleted,
                ]}
                disabled={step > currentStep}
              >
                <View style={styles.stepperCircleInner}>
                  {currentStep > step ? (
                    <Icon name="check" size={14} color="white" />
                  ) : (
                    <Text style={[
                      styles.stepperNumber,
                      (currentStep === step || currentStep > step) && styles.stepperNumberActive
                    ]}>
                      {step}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              {step < 3 && (
                <View style={[
                  styles.stepperLine,
                  currentStep > step && styles.stepperLineActive
                ]} />
              )}
            </React.Fragment>
          ))}
        </View>
        <View style={styles.stepperLabels}>
          <Text style={styles.stepperLabel}>Personal</Text>
          <Text style={styles.stepperLabel}>Course</Text>
          <Text style={styles.stepperLabel}>Documents</Text>
        </View>
      </LinearGradient>
    </Animatable.View>
  );

  const renderInputField = (field, label, placeholder, options = {}) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={100}
      duration={600}
      style={styles.inputContainer}
    >
      <View style={styles.inputHeader}>
        <View style={styles.labelContainer}>
          <Icon 
            name={options.icon || 'form-textbox'} 
            size={14} 
            color={errors[field] ? '#FF3B30' : '#388E3C'} 
            style={styles.labelIcon}
          />
          <Text style={[styles.label, errors[field] && styles.labelError]}>
            {label}
            {options.required && <Text style={styles.requiredStar}> *</Text>}
          </Text>
        </View>
        {errors[field] && (
          <Animatable.View 
            animation="shake" 
            iterationCount={2}
            style={styles.errorIndicator}
          >
            <Icon name="alert-circle" size={12} color="#FF3B30" />
          </Animatable.View>
        )}
      </View>
      <TextInput
        style={[
          styles.input,
          errors[field] && styles.inputError,
          options.multiline && styles.textArea,
        ]}
        value={formData[field]}
        onChangeText={(text) => {
          let processedText = text;
          if (options.numeric) {
            processedText = text.replace(/[^0-9]/g, '');
            if (options.maxLength) {
              processedText = processedText.slice(0, options.maxLength);
            }
          }
          setFormData(prev => ({ ...prev, [field]: processedText }));
          if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
        }}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.5)"
        multiline={options.multiline}
        numberOfLines={options.multiline ? 3 : 1}
        keyboardType={options.keyboardType || 'default'}
        maxLength={options.maxLength}
      />
      {errors[field] && (
        <Animatable.Text 
          animation="fadeIn" 
          duration={300}
          style={styles.errorText}
        >
          <Icon name="alert-circle-outline" size={10} color="#FF3B30" /> {errors[field]}
        </Animatable.Text>
      )}
    </Animatable.View>
  );

  const renderRadioGroup = (field, label, options) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={150}
      duration={600}
      style={styles.radioGroupContainer}
    >
      <View style={styles.radioHeader}>
        <Icon name="radiobox-marked" size={14} color="#388E3C" style={styles.radioIcon} />
        <Text style={[styles.radioGroupLabel, errors[field] && styles.labelError]}>
          {label}<Text style={styles.requiredStar}> *</Text>
        </Text>
      </View>
      <View style={styles.radioOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.radioOption,
              formData[field] === option.value && styles.radioOptionSelected,
            ]}
            onPress={() => {
              setFormData(prev => ({ ...prev, [field]: option.value }));
              if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
            }}
          >
            <LinearGradient
              colors={formData[field] === option.value ? ['#388E3C', '#4CAF50'] : ['transparent', 'transparent']}
              style={styles.radioGradient}
            >
              <View style={styles.radioCircle}>
                {formData[field] === option.value && (
                  <View style={styles.radioInnerCircle} />
                )}
              </View>
              <Text style={[
                styles.radioLabel,
                formData[field] === option.value && styles.radioLabelSelected,
              ]}>
                {option.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
      {errors[field] && (
        <Animatable.Text 
          animation="fadeIn" 
          duration={300}
          style={styles.errorText}
        >
          <Icon name="alert-circle-outline" size={10} color="#FF3B30" /> {errors[field]}
        </Animatable.Text>
      )}
    </Animatable.View>
  );


const [pickerModalVisible, setPickerModalVisible] = useState(false);
const [currentPickerField, setCurrentPickerField] = useState(null);
const [pickerItems, setPickerItems] = useState([]);
const [pickerLabel, setPickerLabel] = useState('');

const renderPicker = (field, label, items, onValueChange = null) => {
  return (
    <Animatable.View 
      animation="fadeInUp" 
      delay={200}
      duration={600}
      style={styles.pickerContainer}
    >
      <View style={styles.pickerHeader}>
        <Icon name="menu-down" size={14} color="#388E3C" style={styles.pickerIcon} />
        <Text style={[styles.pickerLabel, errors[field] && styles.labelError]}>
          {label}<Text style={styles.requiredStar}> *</Text>
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.pickerWrapper, errors[field] && styles.pickerError]}
        onPress={() => {
          setCurrentPickerField(field);
          setPickerItems(items);
          setPickerLabel(label);
          setPickerModalVisible(true);
        }}>
          
        <Text style={[
          styles.pickerText,
          formData[field] ? styles.pickerTextSelected : styles.pickerTextPlaceholder,
        ]} numberOfLines={2}>
          {formData[field] 
            ? items.find(item => item.value === formData[field])?.label || formData[field]
            : `Select ${label.toLowerCase()}`}
        </Text>
        <Icon name="chevron-down" size={20} color="#388E3C" />
      </TouchableOpacity>
      {errors[field] && (
        <Animatable.Text 
          animation="fadeIn" 
          duration={300}
          style={styles.errorText}
        >
          <Icon name="alert-circle-outline" size={10} color="#FF3B30" /> {errors[field]}
        </Animatable.Text>
      )}
    </Animatable.View>
  );
};
const PickerModal = () => (
  <Modal
    visible={pickerModalVisible}
    transparent={true}
    animationType="slide"
    onRequestClose={() => setPickerModalVisible(false)}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select {pickerLabel}</Text>
          <TouchableOpacity onPress={() => setPickerModalVisible(false)}>
            <Icon name="close" size={24} color="#388E3C" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalScrollView}>
          {pickerItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.modalOption,
                formData[currentPickerField] === item.value && styles.modalOptionSelected
              ]}
              onPress={() => {
                setFormData(prev => ({ ...prev, [currentPickerField]: item.value }));
                if (errors[currentPickerField]) {
                  setErrors(prev => ({ ...prev, [currentPickerField]: '' }));
                }
                setPickerModalVisible(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                formData[currentPickerField] === item.value && styles.modalOptionTextSelected
              ]}>
                {item.label}
              </Text>
              {formData[currentPickerField] === item.value && (
                <Icon name="check" size={20} color="#388E3C" />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <TouchableOpacity
          style={styles.modalCancelButton}
          onPress={() => setPickerModalVisible(false)}
        >
          <Text style={styles.modalCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
  const renderFileUpload = (field, label, required = false) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={250}
      duration={600}
      style={styles.fileContainer}
    >
      <View style={styles.fileHeader}>
        <Icon name="file-upload" size={14} color="#388E3C" style={styles.fileIcon} />
        <Text style={[styles.fileLabel, errors[field] && styles.labelError]}>
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.fileButton, errors[field] && styles.fileButtonError]}
        onPress={() => handleFilePick(field)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={formData[field] ? ['#4CAF50', '#2E7D32'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.fileGradient}
        >
          <Icon 
            name={formData[field] ? 'check-circle' : 'upload'} 
            size={20} 
            color="white" 
            style={styles.fileButtonIcon}
          />
          <Text style={styles.fileButtonText}>
            {formData[field] ? 'File Uploaded ✓' : `Upload ${label}`}
          </Text>
          {formData[field] && (
            <Text style={styles.fileSizeText}>
              {formatFileSize(formData[field].size)}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
      {errors[field] && (
        <Animatable.Text 
          animation="fadeIn" 
          duration={300}
          style={styles.errorText}
        >
          <Icon name="alert-circle-outline" size={10} color="#FF3B30" /> {errors[field]}
        </Animatable.Text>
      )}
    </Animatable.View>
  );

  const renderDatePicker = () => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={100}
      duration={600}
      style={styles.inputContainer}
    >
      <View style={styles.inputHeader}>
        <View style={styles.labelContainer}>
          <Icon name="calendar" size={14} color="#388E3C" style={styles.labelIcon} />
          <Text style={[styles.label, errors.date_of_birth && styles.labelError]}>
            Date of Birth<Text style={styles.requiredStar}> *</Text>
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.input, styles.dateInput, errors.date_of_birth && styles.inputError]}
        onPress={() => setShowDatePicker(true)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.dateGradient}
        >
          <Text style={formData.date_of_birth ? styles.inputText : styles.placeholder}>
            {formData.date_of_birth || 'Select Date of Birth'}
          </Text>
          <Icon name="calendar-blank" size={18} color="#388E3C" />
        </LinearGradient>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1950, 0, 1)}
        />
      )}
      {errors.date_of_birth && (
        <Animatable.Text 
          animation="fadeIn" 
          duration={300}
          style={styles.errorText}
        >
          <Icon name="alert-circle-outline" size={10} color="#FF3B30" /> {errors.date_of_birth}
        </Animatable.Text>
      )}
    </Animatable.View>
  );

  const renderCourseCards = () => {
    if (!formData.preferred_training_place) return null;
    
    const cityCourses = courses.filter(course => 
      course.cities.includes(formData.preferred_training_place)
    );

    return (
      <Animatable.View animation="fadeInUp" duration={600} delay={300} style={styles.courseGrid}>
        <Text style={styles.courseGridTitle}>Available Courses for {formData.preferred_training_place}:</Text>
        <View style={styles.courseCards}>
          {cityCourses.map((course) => (
            <TouchableOpacity
              key={course.id}
              style={[
                styles.courseCard,
                formData.preferred_course === course.name && styles.courseCardSelected,
              ]}
              onPress={() => {
                setFormData(prev => ({ ...prev, preferred_course: course.name }));
                if (errors.preferred_course) setErrors(prev => ({ ...prev, preferred_course: '' }));
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  formData.preferred_course === course.name 
                    ? ['#388E3C', '#4CAF50'] 
                    : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                }
                style={styles.courseCardGradient}
              >
                <Icon name={course.icon} size={24} color="white" style={styles.courseIcon} />
                <Text style={[
                  styles.courseName,
                  formData.preferred_course === course.name && styles.courseNameSelected,
                ]}>
                  {course.name}
                </Text>
                {formData.preferred_course === course.name && (
                  <View style={styles.courseSelectedIndicator}>
                    <Icon name="check-circle" size={16} color="white" />
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
        {errors.preferred_course && (
          <Animatable.Text animation="fadeIn" duration={300} style={styles.errorText}>
            <Icon name="alert-circle-outline" size={10} color="#FF3B30" /> {errors.preferred_course}
          </Animatable.Text>
        )}
      </Animatable.View>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }], opacity: fadeAnim }]}>
            <Animatable.View animation="fadeInDown" duration={800} style={styles.stepHeader}>
              <LinearGradient
                colors={['rgba(56, 142, 60, 0.2)', 'rgba(76, 175, 80, 0.2)']}
                style={styles.stepHeaderGradient}
              >
                <Icon name="account-circle" size={24} color="white" />
                <Text style={styles.stepTitle}>Personal Information</Text>
                <Text style={styles.stepSubtitle}>(Complete your demographic profile)</Text>
              </LinearGradient>
            </Animatable.View>

            <View style={styles.formFields}>
              {renderInputField('full_name', 'Full Name', 'Enter your full name', { 
                required: true, 
                icon: 'account',
                multiline: false 
              })}
              
              {renderInputField('father_name', "Father's Name", "Enter father's name", { 
                required: true, 
                icon: 'account-group',
                multiline: false 
              })}

              <View style={styles.row}>
                <View style={styles.col}>
                  {renderDatePicker()}
                </View>
                <View style={styles.col}>
                  {renderInputField('age', 'Age', 'Enter age', { 
                    required: true, 
                    icon: 'numeric',
                    numeric: true,
                    maxLength: 2 
                  })}
                </View>
              </View>

              {renderRadioGroup('marital_status', 'Marital Status', [
                { label: 'Single', value: 'Single' },
                { label: 'Married', value: 'Married' },
                { label: 'Widow', value: 'Widow' },
                { label: 'Divorcee', value: 'Divorcee' },
              ])}

              {renderInputField('cnic_no', 'CNIC Number', 'Enter 13-digit CNIC', { 
                required: true, 
                icon: 'card-account-details',
                numeric: true,
                maxLength: 13 
              })}

              {renderInputField('email', 'Email Address', 'email@example.com (optional)', { 
                icon: 'email',
                keyboardType: 'email-address' 
              })}

              {renderInputField('present_address', 'Present Address', 'Enter your complete address', { 
                required: true, 
                icon: 'map-marker',
                multiline: true 
              })}

              <View style={styles.row}>
                <View style={styles.col}>
                  {renderInputField('cell_no', 'Mobile Number', '03001234567', { 
                    required: true, 
                    icon: 'phone',
                    numeric: true,
                    maxLength: 11 
                  })}
                </View>
                <View style={styles.col}>
                  {renderInputField('emergency_cell_no', 'Emergency Contact', '03001234567', { 
                    required: true, 
                    icon: 'phone-alert',
                    numeric: true,
                    maxLength: 11 
                  })}
                </View>
              </View>

              {renderRadioGroup('employment_status', 'Employment Status', [
                { label: 'Unemployed', value: 'Unemployed' },
                { label: 'Student', value: 'Student' },
                { label: 'Self-employed', value: 'Self-employment / Small Business' },
                { label: 'Employed', value: 'Job' },
              ])}
            </View>
          </Animated.View>
        );

      case 2:
        const classTimings = formData.preferred_session_timing === 'Monday-Wednesday' 
          ? [
              { label: '09:00 AM to 01:00 PM', value: '09:00am-01:00pm' },
              { label: '01:30 PM to 05:30 PM', value: '01:30pm-05:30pm' },
            ]
          : formData.preferred_session_timing === 'Thursday-Saturday'
          ? [
              { label: '09:00 AM to 01:00 PM', value: '09:00am-01:00pm' },
              { label: '01:30 PM to 05:30 PM', value: '01:30pm-05:30pm' },
            ]
          : [];

        return (
          <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }], opacity: fadeAnim }]}>
            <Animatable.View animation="fadeInDown" duration={800} style={styles.stepHeader}>
              <LinearGradient
                colors={['rgba(33, 150, 243, 0.2)', 'rgba(13, 71, 161, 0.2)']}
                style={styles.stepHeaderGradient}
              >
                <Icon name="school" size={24} color="white" />
                <Text style={styles.stepTitle}>Academic & Course Information</Text>
                <Text style={styles.stepSubtitle}>Education & hospitality preferences</Text>
              </LinearGradient>
            </Animatable.View>

            <View style={styles.formFields}>
              {renderRadioGroup('educational_level', 'Educational Level', [
                { label: 'BS Honors (16 Years)', value: 'BS Honors (16 Years Edu)' },
                { label: 'BA/BSC (14 Years)', value: 'BA/BSC (14 Years Edu)' },
                { label: 'FA/FSC', value: 'FA/FSC' },
                { label: 'Matric', value: 'Matric' },
                { label: 'Middle', value: 'Middle' },
                { label: 'Primary', value: 'Primary' },
                { label: 'Literate', value: 'literate' },
                { label: 'Others', value: 'Others' },
              ])}

              {formData.educational_level === 'Others' && 
                renderInputField('other_education_name', 'Specify Education', 'Please specify your education level', { 
                  required: true, 
                  icon: 'pencil',
                  multiline: false 
                })
              }

              {renderPicker('preferred_session_timing', 'Session Days', [
                { label: 'Monday - Wednesday', value: 'Monday-Wednesday' },
                { label: 'Thursday - Saturday', value: 'Thursday-Saturday' },
              ])}

              {renderPicker('preferred_classes_timing', 'Class Timing', classTimings)}

              {renderPicker('preferred_training_place', 'Training Location', [
                              { label: 'TDCP-ITHM Head Office Lahore: 68-Trade Centre Block, M A Johar Town, Lahore. 54782', value: 'Lahore' },
                { label: 'TDCP-ITHM Gujranwala Campus: Building# 121 Satellite Town D Block Near Salamat Hospital', value: 'Gujranwala' },
                { label: 'TDCP-ITHM Rawalpindi Campus: 727-F, Satellite Town, Rawalpindi. 46300', value: 'Rawalpindi' },
                { label: 'TDCP-ITHM Faisalabad Campus: 113/5-A, Peoples Colony No.1, Main Jaranwala Road,Faisalabad', value: 'Faisalabad' },
                { label: 'TDCP-ITHM Multan Campus: Masha Allah Plaza Near Dera Ada Chowk Azmat Wasti Road (opposite Khabrain office,), Multan', value: 'Multan' },
              ])}

              {renderCourseCards()}

              {renderRadioGroup('has_disability', 'Do you have any disability?', [
                { label: 'Yes', value: '1' },
                { label: 'No', value: '0' },
              ])}

              {formData.has_disability === '1' && 
                renderInputField('disability_type', 'Type of Disability', 'Specify disability type', { 
                  required: true, 
                  icon: 'wheelchair-accessibility',
                  multiline: false 
                })
              }

              {renderInputField('special_condition', 'Special Condition (if any)', 'Describe any special condition', { 
                icon: 'alert-circle',
                multiline: true 
              })}
            </View>
          </Animated.View>
        );

      case 3:
        return (
          <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }], opacity: fadeAnim }]}>
            <Animatable.View animation="fadeInDown" duration={800} style={styles.stepHeader}>
              <LinearGradient
                colors={['rgba(255, 152, 0, 0.2)', 'rgba(245, 124, 0, 0.2)']}
                style={styles.stepHeaderGradient}
              >
                <Icon name="file-document" size={24} color="white" />
                <Text style={styles.stepTitle}>Required Documents</Text>
                <Text style={styles.stepSubtitle}>Upload your documents (Max 2MB each)</Text>
              </LinearGradient>
            </Animatable.View>

            <View style={styles.formFields}>
              {renderFileUpload('cnic_front_path', 'CNIC Front', true)}
              {renderFileUpload('cnic_back_path', 'CNIC Back', true)}
              {renderFileUpload('domicile', 'Domicile (Optional)', false)}
              
              {formData.has_disability === '1' && 
                renderFileUpload('disability_certificate', 'Disability Certificate', true)
              }

              <Animatable.View 
                animation="fadeInUp" 
                delay={300}
                duration={600}
                style={styles.disclaimerContainer}
              >
                <LinearGradient
                  colors={['rgba(255, 193, 7, 0.2)', 'rgba(255, 152, 0, 0.2)']}
                  style={styles.disclaimerGradient}
                >
                  <Icon name="shield-check" size={20} color="#FFC107" style={styles.disclaimerIcon} />
                  <View style={styles.disclaimerContent}>
                    <Text style={styles.disclaimerTitle}>Important Notice</Text>
                    <Text style={styles.disclaimerText}>
                      • All personal information remains confidential{'\n'}
                      • Limited seats available{'\n'}
                      • Submission doesn't guarantee enrollment{'\n'}
                      • You'll be notified about selection
                    </Text>
                  </View>
                </LinearGradient>
              </Animatable.View>
            </View>
          </Animated.View>
        );
    }
  };

  const renderContactModal = () => (
    <Modal
      visible={showContactModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowContactModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animatable.View 
          animation="slideInUp"
          duration={300}
          style={styles.modalContent}
        >
          <LinearGradient
            colors={['#388E3C', '#4CAF50']}
            style={styles.modalHeader}
          >
            <Icon name="phone" size={24} color="white" />
            <Text style={styles.modalTitle}>Contact Information</Text>
            <TouchableOpacity
              onPress={() => setShowContactModal(false)}
              style={styles.closeButton}
            >
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalSubtitle}>For any query feel free to contact:</Text>
            
            {Object.entries(contactInfo).map(([city, contacts]) => (
              <Animatable.View 
                key={city} 
                animation="fadeInUp"
                delay={100}
                style={styles.contactCard}
              >
                <View style={styles.cityHeader}>
                  <Icon name="city" size={20} color="#388E3C" />
                  <Text style={styles.cityName}>{city}</Text>
                </View>
                
                {contacts.map((contact, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.contactItem}
                    onPress={() => Linking.openURL(`tel:${contact.number.replace(/-/g, '')}`)}
                  >
                    <View style={styles.contactIconContainer}>
                      <Icon 
                        name={contact.icon} 
                        size={16} 
                        color="white" 
                      />
                    </View>
                    <View style={styles.contactDetails}>
                      <Text style={styles.contactType}>{contact.type}</Text>
                      <Text style={styles.contactNumber}>{contact.number}</Text>
                    </View>
                    <Icon name="phone-outgoing" size={20} color="#388E3C" />
                  </TouchableOpacity>
                ))}
              </Animatable.View>
            ))}
          </ScrollView>
        </Animatable.View>
      </View>
    </Modal>
  );

  if (checkingExisting) {
    return (
      <LinearGradient
        colors={['#0d1f0e', '#388E3C', '#2c5b2f']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#388E3C" />
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          style={styles.loadingContent}
        >
          <Icon name="briefcase-clock" size={60} color="white" />
          <Text style={styles.loadingTitle}>Checking Registration</Text>
          <Text style={styles.loadingSubtitle}>Looking for existing data...</Text>
          <ActivityIndicator size="large" color="white" style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>If data exists, you'll be redirected to tracking screen</Text>
        </Animatable.View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0a120a', '#2c3e2c', '#050905']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#388E3C" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
          <LinearGradient
            colors={['rgba(56, 142, 60, 0.9)', 'rgba(76, 175, 80, 0.9)']}
            style={styles.headerGradient}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Icon name="briefcase-account" size={28} color="white" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Hospitality Registration</Text>
                <Text style={styles.headerSubtitle}>SEHR Program - Tourism Department</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.contactHeaderButton}
              onPress={() => setShowContactModal(true)}
            >
              <Icon name="phone" size={20} color="white" />
            </TouchableOpacity>
          </LinearGradient>
        </Animatable.View>

        <Animated.ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {renderStepIndicator()}
            
            {renderStepContent()}

            {formError && (
              <Animatable.View 
                animation="bounceIn" 
                style={styles.errorBanner}
              >
                <LinearGradient
                  colors={['#FF3B30', '#D32F2F']}
                  style={styles.errorBannerGradient}
                >
                  <Icon name="alert-circle" size={20} color="white" />
                  <Text style={styles.errorBannerText}>
                    Please fix all errors before proceeding
                  </Text>
                </LinearGradient>
              </Animatable.View>
            )}

            {/* Navigation Buttons */}
            <Animatable.View 
              animation="fadeInUp" 
              duration={800}
              delay={400}
              style={styles.buttonContainer}
            >
              <View style={styles.buttonRow}>
                {currentStep > 1 && (
                  <TouchableOpacity 
                    style={styles.backButtonLarge}
                    onPress={handlePrevStep}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.backButtonGradient}
                    >
                      <Icon name="arrow-left" size={18} color="white" />
                      <Text style={styles.backButtonText}>Previous</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                
                {currentStep < 3 ? (
                  <TouchableOpacity 
                    style={styles.nextButton}
                    onPress={handleNextStep}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#2196F3', '#1976D2']}
                      style={styles.nextButtonGradient}
                    >
                      <Text style={styles.nextButtonText}>Continue</Text>
                      <Icon name="arrow-right" size={18} color="white" />
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={loading ? ['#9E9E9E', '#757575'] : ['#388E3C', '#4CAF50']}
                      style={styles.submitButtonGradient}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        <>
                          <Icon name="check-circle" size={18} color="white" />
                          <Text style={styles.submitButtonText}>Submit Registration</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>
            </Animatable.View>

            {/* Footer */}
            <Animatable.View 
              animation="fadeIn" 
              duration={1000}
              delay={500}
              style={styles.footer}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.footerGradient}
              >
                <Icon name="shield-lock" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.footerText}>
                  Your data is secured with 256-bit encryption
                </Text>
              </LinearGradient>
            </Animatable.View>
          </Animated.View>
        </Animated.ScrollView>
 <PickerModal />
        {renderContactModal()}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 30,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 30,
  },
  loadingSpinner: {
    marginTop: 30,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 10,
  },
  header: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 20,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  contactHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  stepperContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  stepperBackground: {
    borderRadius: 20,
    padding: 20,
  },
  stepperCircles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperCircleInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperCircleActive: {
    backgroundColor: '#388E3C',
  },
  stepperCircleCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepperNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
  },
  stepperNumberActive: {
    color: 'white',
  },
  stepperLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 5,
  },
  stepperLineActive: {
    backgroundColor: '#4CAF50',
  },
  stepperLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  stepperLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  stepContent: {
    marginHorizontal: 20,
  },
  stepHeader: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  stepHeaderGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  stepSubtitle: {
    fontSize: 8,
    color: 'rgba(176, 164, 164, 0.8)',
    marginLeft: 'auto',
  },
  formFields: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelIcon: {
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  labelError: {
    color: '#FF3B30',
  },
  requiredStar: {
    color: '#FF3B30',
  },
  errorIndicator: {
    backgroundColor: 'rgba(255,59,48,0.2)',
    padding: 4,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: 'white',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  inputError: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.1)',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  placeholder: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  inputText: {
    color: 'white',
    fontSize: 14,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 10,
    marginTop: 4,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -5,
  },
  col: {
    flex: 1,
    paddingHorizontal: 5,
  },
  dateInput: {
    padding: 0,
    overflow: 'hidden',
  },
  dateGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  radioGroupContainer: {
    marginBottom: 15,
  },
  radioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioIcon: {
    marginRight: 6,
  },
  radioGroupLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  radioOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  radioOption: {
    marginRight: 10,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  radioOptionSelected: {
    shadowColor: '#388E3C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  radioGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  radioLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  radioLabelSelected: {
    color: 'white',
    fontWeight: '600',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerIcon: {
    marginRight: 6,
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerError: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.1)',
  },
  pickerText: {
    fontSize: 10,
    flex: 1,
  },
  pickerTextSelected: {
    color: 'white',
  },
  pickerTextPlaceholder: {
    color: 'rgba(255,255,255,0.5)',
  },
  fileContainer: {
    marginBottom: 15,
  },
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileIcon: {
    marginRight: 6,
  },
  fileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  fileButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  fileButtonError: {
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  fileGradient: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileButtonIcon: {
    marginRight: 8,
  },
  fileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  fileSizeText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  courseGrid: {
    marginBottom: 15,
  },
  courseGridTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  courseCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  courseCard: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  courseCardGradient: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    position: 'relative',
    minHeight: 80,
  },
  courseIcon: {
    marginBottom: 8,
  },
  courseName: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  courseNameSelected: {
    color: 'white',
    fontWeight: '600',
  },
  courseSelectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  disclaimerContainer: {
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  disclaimerGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
  },
  disclaimerIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFC107',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  errorBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  errorBannerText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    marginLeft: 10,
    flex: 1,
  },
  buttonContainer: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButtonLarge: {
    flex: 1,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  backButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  nextButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  submitButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  footer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  footerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    marginLeft: 10,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#388E3C',
    marginLeft: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#388E3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactType: {
    fontSize: 12,
    color: '#666',
  },
  contactNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
    truncateText: {
    flex: 1,
    flexWrap: 'wrap',
    maxWidth: '90%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  modalOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOptionSelected: {
    backgroundColor: '#f0f9f0',
  },
  modalOptionText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginRight: 10,
    lineHeight: 20,
  },
  modalOptionTextSelected: {
    color: '#388E3C',
    fontWeight: '600',
  },
  modalCancelButton: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#388E3C',
    fontWeight: '600',
  },
});

export default HospitalityRegistrationForm;