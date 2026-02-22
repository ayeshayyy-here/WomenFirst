import React, { useState, useEffect, useRef } from 'react'; 
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import syncStorage from 'react-native-sync-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import DigitalSkillsTracking from './DigitalSkillsTracking';

const { width, height } = Dimensions.get('window');
const API_URL = 'https://sehr-wdd.punjab.gov.pk/api/digital-skills-registrations';

const DigitalSkillsRegistrationForm = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [existingData, setExistingData] = useState(null);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    date_of_birth: '',
    age: '',
    marital_status: '',
    cnic_no: '',
    mobile_network: '',
    other_network_name: '',
    email: '',
    present_address: '',
    cell_no: '',
    has_disability: '0',
    disability_type: '',
    employment_status: '',
    educational_level: '',
    other_education_name: '',
    last_degree_institute: '',
    discipline: '',
    specialization: '',
    special_condition: '',
    cnic_front: null,
    cnic_back: null,
    domicile: null,
    educational_documents: null,
    disability_certificate: null,
  });

  const [errors, setErrors] = useState({});
  const scrollViewRef = useRef();

  // Fetch existing data on component mount
  useEffect(() => {
    checkExistingData();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkExistingData = async () => {
    try {
      setCheckingExisting(true);
      
      // Check syncStorage first
      const userProfile = syncStorage.get('user_profile');
      let syncStorageData = null;
      
      if (userProfile) {
        try {
          syncStorageData = typeof userProfile === 'string' ? JSON.parse(userProfile) : userProfile;
        } catch (e) {
          console.log('Error parsing syncStorage data:', e);
        }
      }

      if (syncStorageData?.cnic) {
        const cnic = syncStorageData.cnic.replace(/-/g, '');
        
        try {
          const response = await axios.get(`https://sehr-wdd.punjab.gov.pk/api/check-registration-digital/${cnic}`, {
            timeout: 10000,
          });
          
          if (response.data.success && response.data.data) {
            setExistingData(response.data.data);
            // Navigate directly to tracking screen if data exists
            setTimeout(() => {
              navigation.replace('DigitalSkillsTracking', { 
                registrationData: response.data.data,
                isExisting: true 
              });
            }, 1500);
            return;
          } else {
            prefillFormFromSyncStorage(syncStorageData);
          }
        } catch (error) {
          console.log('No existing data from backend:', error);
          if (syncStorageData) {
            prefillFormFromSyncStorage(syncStorageData);
          }
        }
      } else if (syncStorageData) {
        prefillFormFromSyncStorage(syncStorageData);
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
    } finally {
      setTimeout(() => setCheckingExisting(false), 1500);
    }
  };

  const prefillFormFromSyncStorage = (data) => {
    setFormData(prev => ({
      ...prev,
      full_name: data.name || '',
      cnic_no: data.cnic ? data.cnic.replace(/-/g, '') : '',
      date_of_birth: data.dob || '',
      cell_no: data.contact || '',
      email: data.email || '',
      present_address: data.address || '',
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
      if (!formData.father_name.trim()) newErrors.father_name = "Father's name is required";
      if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
      if (!formData.age) newErrors.age = 'Age is required';
      if (!formData.marital_status) newErrors.marital_status = 'Marital status is required';
      
      if (!formData.cnic_no) newErrors.cnic_no = 'CNIC is required';
      else if (!/^\d{13}$/.test(formData.cnic_no)) newErrors.cnic_no = 'CNIC must be exactly 13 digits';
      else if (parseInt(formData.cnic_no.charAt(12)) % 2 !== 0) newErrors.cnic_no = 'Last digit must be even';
      
      if (!formData.mobile_network) newErrors.mobile_network = 'Mobile network is required';
      if (formData.mobile_network === 'Any Other' && !formData.other_network_name.trim()) {
        newErrors.other_network_name = 'Please specify network';
      }
      
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!formData.present_address.trim()) newErrors.present_address = 'Present address is required';
      
      if (!formData.cell_no) newErrors.cell_no = 'Phone number is required';
      else if (!/^03\d{9}$/.test(formData.cell_no)) newErrors.cell_no = 'Mobile must be in format 03001234567';
      
    } else if (step === 2) {
      if (!formData.employment_status) newErrors.employment_status = 'Employment status is required';
      if (!formData.educational_level) newErrors.educational_level = 'Educational level is required';
      if (formData.educational_level === 'Others' && !formData.other_education_name.trim()) {
        newErrors.other_education_name = 'Please specify education level';
      }
      if (formData.has_disability === '1' && !formData.disability_type.trim()) {
        newErrors.disability_type = 'Disability type is required';
      }
    } else if (step === 3) {
      if (!formData.cnic_front) newErrors.cnic_front = 'CNIC Front is required';
      if (!formData.cnic_back) newErrors.cnic_back = 'CNIC Back is required';
      if (!formData.educational_documents) newErrors.educational_documents = 'Educational documents are required';
      if (formData.has_disability === '1' && !formData.disability_certificate) {
        newErrors.disability_certificate = 'Disability certificate is required';
      }
    }

    setErrors(newErrors);
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
        if (['cnic_front', 'cnic_back', 'domicile', 'educational_documents', 'disability_certificate'].includes(key)) {
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
          lastUpdated: new Date().toISOString(),
        };
        
        syncStorage.set('user_profile', JSON.stringify(userProfile));
        
        Alert.alert(
          'Success! 🎉',
          'Registration submitted successfully!',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.replace('DigitalSkillsTracking', { 
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
      Alert.alert('Submission Failed', 'There was an error submitting your registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <Animatable.View animation="fadeInDown" duration={800} style={styles.stepperContainer}>
      <LinearGradient
        colors={['#0a040b', '#121213', '#6A1B9A']}
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
          <Text style={styles.stepperLabel}>Personal Info</Text>
          <Text style={styles.stepperLabel}>Academic Info</Text>
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
            color={errors[field] ? '#FF3B30' : '#6A1B9A'} 
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
        <Icon name="radiobox-marked" size={14} color="#6A1B9A" style={styles.radioIcon} />
        <Text style={[styles.radioGroupLabel, errors[field] && styles.labelError]}>
          {label}{label.includes('required') ? '' : <Text style={styles.requiredStar}> *</Text>}
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
              colors={formData[field] === option.value ? ['#6A1B9A', '#0a040b'] : ['transparent', 'transparent']}
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

  const renderPicker = (field, label, items, required = true) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={200}
      duration={600}
      style={styles.pickerContainer}
    >
      <View style={styles.pickerHeader}>
        <Icon name="menu-down" size={14} color="#6A1B9A" style={styles.pickerIcon} />
        <Text style={[styles.pickerLabel, errors[field] && styles.labelError]}>
          {label}{required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
      </View>
      <View style={[styles.pickerWrapper, errors[field] && styles.pickerError]}>
        <Picker
          selectedValue={formData[field]}
          onValueChange={(value) => {
            setFormData(prev => ({ ...prev, [field]: value }));
            if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
          }}
          style={styles.picker}
          dropdownIconColor="#6A1B9A"
        >
          <Picker.Item 
            label={`Select ${label.toLowerCase()}`} 
            value="" 
            style={styles.pickerItem}
          />
          {items.map((item, index) => (
            <Picker.Item 
              key={index} 
              label={item.label} 
              value={item.value} 
              style={styles.pickerItem}
            />
          ))}
        </Picker>
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

  const renderFileUpload = (field, label, required = false) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={250}
      duration={600}
      style={styles.fileContainer}
    >
      <View style={styles.fileHeader}>
        <Icon name="file-upload" size={14} color="#6A1B9A" style={styles.fileIcon} />
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
          <Icon name="calendar" size={14} color="#6A1B9A" style={styles.labelIcon} />
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
          <Icon name="calendar-blank" size={18} color="#6A1B9A" />
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }], opacity: fadeAnim }]}>
            <Animatable.View animation="fadeInDown" duration={800} style={styles.stepHeader}>
              <LinearGradient
                colors={['rgba(106, 27, 154, 0.2)', 'rgba(74, 20, 140, 0.2)']}
                style={styles.stepHeaderGradient}
              >
                <Icon name="account-circle" size={24} color="white" />
                <Text style={styles.stepTitle}>Personal Information</Text>
              </LinearGradient>
            </Animatable.View>

            <View style={styles.formFields}>
              {renderInputField('full_name', 'Full Name', 'Enter Full Name', { 
                required: true, 
                icon: 'account',
              })}
              
              {renderInputField('father_name', "Father's Name", "Enter Father's Name", { 
                required: true, 
                icon: 'account-group',
              })}

              <View style={styles.row}>
                <View style={styles.col}>
                  {renderDatePicker()}
                </View>
                <View style={styles.col}>
                  {renderInputField('age', 'Age', 'Enter Age', { 
                    required: true, 
                    icon: 'numeric',
                    numeric: true,
                    maxLength: 2 
                  })}
                </View>
              </View>

              {renderPicker('marital_status', 'Marital Status', [
                { label: 'Single', value: 'Single' },
                { label: 'Married', value: 'Married' },
                { label: 'Widow', value: 'Widow' },
                { label: 'Divorcee', value: 'Divorcee' },
              ])}

              {renderInputField('cnic_no', 'CNIC No.', 'Enter CNIC (13 digits)', { 
                required: true, 
                icon: 'card-account-details',
                numeric: true,
                maxLength: 13 
              })}

              {renderPicker('mobile_network', 'Mobile Network', [
                { label: 'Jazz', value: 'Jazz' },
                { label: 'Zong', value: 'Zong' },
                { label: 'Telenor', value: 'Telenor' },
                { label: 'Ufone', value: 'Ufone' },
                { label: 'Any Other', value: 'Any Other' },
              ])}

              {formData.mobile_network === 'Any Other' && 
                renderInputField('other_network_name', 'Specify Network', 'Specify Network', { 
                  required: true, 
                  icon: 'network',
                })
              }

              {renderInputField('email', 'Email', 'Enter Email Address (optional)', { 
                icon: 'email',
                keyboardType: 'email-address' 
              })}

              {renderInputField('present_address', 'Present Address', 'Enter Present Address', { 
                required: true, 
                icon: 'map-marker',
                multiline: true 
              })}

              {renderInputField('cell_no', 'Cell No.', '03001234567', { 
                required: true, 
                icon: 'phone',
                numeric: true,
                maxLength: 11 
              })}

              {renderRadioGroup('has_disability', 'Do you have any disability?', [
                { label: 'Yes', value: '1' },
                { label: 'No', value: '0' },
              ])}

              {formData.has_disability === '1' && 
                renderInputField('disability_type', 'Type of Disability', 'Specify disability type', { 
                  required: true, 
                  icon: 'wheelchair-accessibility',
                })
              }
            </View>
          </Animated.View>
        );

      case 2:
        return (
          <Animated.View style={[styles.stepContent, { transform: [{ translateX: slideAnim }], opacity: fadeAnim }]}>
            <Animatable.View animation="fadeInDown" duration={800} style={styles.stepHeader}>
              <LinearGradient
                colors={['rgba(76, 175, 80, 0.2)', 'rgba(46, 125, 50, 0.2)']}
                style={styles.stepHeaderGradient}
              >
                <Icon name="school" size={24} color="white" />
                <Text style={styles.stepTitle}>Academic Information</Text>
              </LinearGradient>
            </Animatable.View>

            <View style={styles.formFields}>
              {renderPicker('employment_status', 'Employment Status', [
                { label: 'Unemployed', value: 'Unemployed' },
                { label: 'Student', value: 'Student' },
                { label: 'Self-employment / Small Business', value: 'Self-employment / Small Business' },
                { label: 'Job', value: 'Job' },
              ])}

              {renderPicker('educational_level', 'Educational Level', [
                { label: 'BS Honors (16 Years Edu)', value: 'BS Honors (16 Years Edu)' },
                { label: 'Mphil', value: 'Mphil' },
                { label: 'Phd', value: 'Phd' },
                { label: 'Others', value: 'Others' },
              ])}

              {formData.educational_level === 'Others' && 
                renderInputField('other_education_name', 'Specify Education', 'Specify Education Level', { 
                  required: true, 
                  icon: 'pencil',
                })
              }

              {renderInputField('last_degree_institute', 'Last Degree Institute', 'Enter Institute Name', { 
                icon: 'office-building',
              })}

              {renderInputField('discipline', 'Discipline', 'Enter Discipline', { 
                icon: 'book-open-variant',
              })}

              {renderInputField('specialization', 'Specialization', 'Enter Specialization', { 
                icon: 'certificate',
              })}

              {renderInputField('special_condition', 'Any Special Condition', 'Describe any special condition', { 
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
                colors={['rgba(33, 150, 243, 0.2)', 'rgba(13, 71, 161, 0.2)']}
                style={styles.stepHeaderGradient}
              >
                <Icon name="file-document" size={24} color="white" />
                <Text style={styles.stepTitle}>Required Documents</Text>
                <Text style={styles.stepSubtitle}>(Max 2MB each - PDF, JPG, PNG)</Text>
              </LinearGradient>
            </Animatable.View>

            <View style={styles.formFields}>
              {renderFileUpload('cnic_front', 'CNIC (Front)', true)}
              {renderFileUpload('cnic_back', 'CNIC (Back)', true)}
              {renderFileUpload('domicile', 'Domicile (Optional)', false)}
              {renderFileUpload('educational_documents', 'Educational Documents', true)}
              
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
                      • All files must be clear and readable{'\n'}
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

  if (checkingExisting) {
    return (
      <LinearGradient
        colors={['#0a040b', '#121213', '#6A1B9A']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#6A1B9A" />
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          style={styles.loadingContent}
        >
          <Icon name="database-search" size={60} color="white" />
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
      colors={['#0a040b', '#121213', '#6A1B9A']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#6A1B9A" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
          <LinearGradient
            colors={['rgba(10, 4, 11, 0.9)', 'rgba(18, 18, 19, 0.9)', 'rgba(106, 27, 154, 0.9)']}
            style={styles.headerGradient}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={14} color="white" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Icon name="account-tie-hat" size={28} color="white" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>SEHR Digital Skills Registration</Text>
                <Text style={styles.headerSubtitle}>Digital Skill Training - Economic Empowerment</Text>
              </View>
            </View>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>Step {currentStep}/3</Text>
            </View>
          </LinearGradient>
        </Animatable.View>

        <Animated.ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {renderStepIndicator()}
            
            {renderStepContent()}

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
                      colors={['#6A1B9A', '#4A148C']}
                      style={styles.nextButtonGradient}
                    >
                      <Text style={styles.nextButtonText}>Next</Text>
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
                      colors={loading ? ['#9E9E9E', '#757575'] : ['#6A1B9A', '#8E24AA']}
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
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 45,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    marginTop: 20,
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  stepBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
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
    backgroundColor: '#6A1B9A',
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
    shadowColor: '#6A1B9A',
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
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pickerError: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.1)',
  },
  picker: {
    height: 45,
    color: 'white',
  },
  pickerItem: {
    fontSize: 8,
    color: '#333',
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
});

export default DigitalSkillsRegistrationForm;