import React, { useState, useEffect } from 'react';
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
  Dimensions,
  Linking,
  ToastAndroid,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import * as Animatable from 'react-native-animatable';
import Collapsible from 'react-native-collapsible';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

const DigitalSkillsRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    father_name: '',
    dob: '',
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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showOtherNetwork, setShowOtherNetwork] = useState(false);
  const [showOtherEducation, setShowOtherEducation] = useState(false);
  const [showDisabilityDetails, setShowDisabilityDetails] = useState(false);
  const [isPersonalExpanded, setIsPersonalExpanded] = useState(true);
  const [isAcademicExpanded, setIsAcademicExpanded] = useState(false);
  const [isDocumentsExpanded, setIsDocumentsExpanded] = useState(false);

  const mobileNetworks = [
    { value: 'Jazz', label: 'Jazz', icon: 'signal' },
    { value: 'Zong', label: 'Zong', icon: 'signal' },
    { value: 'Telenor', label: 'Telenor', icon: 'signal' },
    { value: 'Ufone', label: 'Ufone', icon: 'signal' },
    { value: 'Any Other', label: 'Any Other', icon: 'signal' },
  ];

  const maritalStatuses = [
    { value: 'Single', label: 'Single', icon: 'user' },
    { value: 'Married', label: 'Married', icon: 'heart' },
    { value: 'Widow', label: 'Widow', icon: 'user-circle' },
    { value: 'Divorcee', label: 'Divorcee', icon: 'user-times' },
  ];

  const employmentStatuses = [
    { value: 'Unemployed', label: 'Unemployed', icon: 'briefcase' },
    { value: 'Student', label: 'Student', icon: 'graduation-cap' },
    { value: 'Self-employment / Small Business', label: 'Self-employment / Small Business', icon: 'store' },
    { value: 'Job', label: 'Job', icon: 'briefcase' },
  ];

  const educationLevels = [
    { value: 'BS Honors (16 Years Edu)', label: 'BS Honors (16 Years)', icon: 'graduation-cap' },
    { value: 'BA/BSC (14 Years Edu)', label: 'BA/BSC (14 Years)', icon: 'university' },
    { value: 'FA/FSC', label: 'FA/FSC', icon: 'book' },
    { value: 'Matric', label: 'Matric', icon: 'certificate' },
    { value: 'Middle', label: 'Middle', icon: 'school' },
    { value: 'Primary', label: 'Primary', icon: 'child' },
    { value: 'Illiterate', label: 'Illiterate', icon: 'user' },
    { value: 'Others', label: 'Others', icon: 'ellipsis-h' },
  ];

  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Info', message);
    }
  };

  const validateField = (field, value) => {
    let error = '';
    let isValid = true;

    switch (field) {
      case 'full_name':
      case 'father_name':
      case 'present_address':
        if (!value.trim()) {
          error = 'This field is required';
          isValid = false;
        }
        break;
      
      case 'dob':
        if (!value) {
          error = 'Date of birth is required';
          isValid = false;
        } else {
          const dob = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          if (age < 16) {
            error = 'Must be at least 16 years old';
            isValid = false;
          }
          if (age > 60) {
            error = 'Must not exceed 60 years';
            isValid = false;
          }
        }
        break;
      
      case 'age':
        if (!value || isNaN(value)) {
          error = 'Age is required';
          isValid = false;
        } else {
          const age = parseInt(value);
          if (age < 16 || age > 60) {
            error = 'Age must be between 16 and 60 years';
            isValid = false;
          }
        }
        break;
      
      case 'cnic_no':
        const cnicRegex = /^\d{13}$/;
        const cleanedCnic = value.replace(/\D/g, '');
        if (!cnicRegex.test(cleanedCnic)) {
          error = 'CNIC must be 13 digits';
          isValid = false;
        } else if (cleanedCnic.length === 13) {
          const lastDigit = parseInt(cleanedCnic[cleanedCnic.length - 1]);
          if (lastDigit % 2 !== 0) {
            error = 'Last digit must be even for females';
            isValid = false;
          }
        }
        break;
      
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Invalid email format';
          isValid = false;
        }
        break;
      
      case 'cell_no':
        const phoneRegex = /^03\d{9}$/;
        if (!phoneRegex.test(value)) {
          error = 'Must be in format 03001234567';
          isValid = false;
        }
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return isValid;
  };

  const validateStep = (step) => {
    let isValid = true;
    const newErrors = {};

    if (step === 1) {
      const requiredFields = ['full_name', 'father_name', 'dob', 'age', 'cnic_no', 'present_address', 'cell_no'];
      requiredFields.forEach(field => {
        if (!formData[field]) {
          newErrors[field] = 'This field is required';
          isValid = false;
        }
      });

      if (!formData.marital_status) {
        newErrors.marital_status = 'Please select marital status';
        isValid = false;
      }

      if (!formData.mobile_network) {
        newErrors.mobile_network = 'Please select mobile network';
        isValid = false;
      }

      if (formData.mobile_network === 'Any Other' && !formData.other_network_name) {
        newErrors.other_network_name = 'Please specify network name';
        isValid = false;
      }

      if (formData.has_disability === '1' && !formData.disability_type) {
        newErrors.disability_type = 'Please specify disability type';
        isValid = false;
      }
    }

    if (step === 2) {
      if (!formData.employment_status) {
        newErrors.employment_status = 'Please select employment status';
        isValid = false;
      }

      if (!formData.educational_level) {
        newErrors.educational_level = 'Please select education level';
        isValid = false;
      }

      if (formData.educational_level === 'Others' && !formData.other_education_name) {
        newErrors.other_education_name = 'Please specify education level';
        isValid = false;
      }
    }

    if (step === 3) {
      if (!formData.cnic_front) {
        newErrors.cnic_front = 'CNIC front is required';
        isValid = false;
      }

      if (!formData.cnic_back) {
        newErrors.cnic_back = 'CNIC back is required';
        isValid = false;
      }

      if (formData.has_disability === '1' && !formData.disability_certificate) {
        newErrors.disability_certificate = 'Disability certificate is required';
        isValid = false;
      }
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      showToast('Please fill all required fields');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleDOBChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const age = calculateAge(selectedDate);
      
      setFormData(prev => ({
        ...prev,
        dob: dateStr,
        age: age.toString(),
      }));
      
      validateField('dob', dateStr);
      validateField('age', age.toString());
    }
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleCnicChange = (value) => {
    let cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length > 13) {
      cleaned = cleaned.slice(0, 13);
    }
    
    // Format with dashes
    let formatted = cleaned;
    if (cleaned.length > 5) {
      formatted = cleaned.slice(0, 5) + '-' + cleaned.slice(5);
    }
    if (cleaned.length > 12) {
      formatted = cleaned.slice(0, 5) + '-' + cleaned.slice(5, 12) + '-' + cleaned.slice(12);
    }
    
    setFormData(prev => ({ ...prev, cnic_no: formatted }));
    validateField('cnic_no', cleaned);
  };

  const handleMobileNetworkChange = (value) => {
    setFormData(prev => ({ 
      ...prev, 
      mobile_network: value,
      other_network_name: value === 'Any Other' ? prev.other_network_name : ''
    }));
    setShowOtherNetwork(value === 'Any Other');
    setErrors(prev => ({ ...prev, mobile_network: '', other_network_name: '' }));
  };

  const handleEducationLevelChange = (value) => {
    setFormData(prev => ({ 
      ...prev, 
      educational_level: value,
      other_education_name: value === 'Others' ? prev.other_education_name : ''
    }));
    setShowOtherEducation(value === 'Others');
    setErrors(prev => ({ ...prev, educational_level: '', other_education_name: '' }));
  };

  const handleDisabilityChange = (value) => {
    setFormData(prev => ({ 
      ...prev, 
      has_disability: value,
      disability_type: value === '0' ? '' : prev.disability_type,
      disability_certificate: value === '0' ? null : prev.disability_certificate
    }));
    setShowDisabilityDetails(value === '1');
    setErrors(prev => ({ 
      ...prev, 
      disability_type: '',
      disability_certificate: ''
    }));
  };

  const pickFile = async (fieldName) => {
    try {
      Alert.alert(
        'Select Document',
        'Choose document type',
        [
          { text: 'Gallery', onPress: () => pickImage(fieldName) },
          { text: 'Files', onPress: () => pickDocument(fieldName) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error picking file:', error);
      showToast('Failed to pick document');
    }
  };

  const pickImage = async (fieldName) => {
    try {
      const options = {
        title: 'Select Image',
        storageOptions: {
          skipBackup: true,
          path: 'images',
        },
      };

      ImagePicker.launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.error) {
          console.error('ImagePicker Error: ', response.error);
          showToast('Error picking image');
        } else {
          const source = response.assets?.[0] || response;
          if (source.uri) {
            setFormData(prev => ({
              ...prev,
              [fieldName]: {
                uri: source.uri,
                name: source.fileName || `image_${Date.now()}.jpg`,
                type: source.type || 'image/jpeg',
              },
            }));
            setErrors(prev => ({ ...prev, [fieldName]: '' }));
          }
        }
      });
    } catch (error) {
      console.error('Error picking image:', error);
      showToast('Failed to pick image');
    }
  };

  const pickDocument = async (fieldName) => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });

      setFormData(prev => ({
        ...prev,
        [fieldName]: {
          uri: result.uri,
          name: result.name,
          type: result.type,
        },
      }));
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Error picking document:', error);
        showToast('Failed to pick document');
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      showToast('Please fix all errors before submitting');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showToast('Registration submitted successfully');
      
      // Reset form
      setFormData({
        full_name: '',
        father_name: '',
        dob: '',
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
      
      setCurrentStep(1);
      setErrors({});
      setShowOtherNetwork(false);
      setShowOtherEducation(false);
      setShowDisabilityDetails(false);
    }, 2000);
  };

  const renderStep1 = () => (
    <Animatable.View 
      animation="fadeIn"
      duration={500}
      style={styles.stepContainer}
    >
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setIsPersonalExpanded(!isPersonalExpanded)}
      >
        <LinearGradient
          colors={['#f8f9fa', '#e9ecef']}
          style={styles.sectionHeader}
        >
          <FontAwesomeIcon name="user-circle" size={20} color="#004d40" />
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Icon 
            name={isPersonalExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#004d40" 
          />
        </LinearGradient>
      </TouchableOpacity>
      
      <Collapsible collapsed={!isPersonalExpanded}>
        <View style={styles.collapsibleContent}>
          <View style={styles.formGrid}>
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <Icon name="user" size={14} color="#666" />
                  <Text style={styles.label}>Full Name</Text>
                  <Text style={styles.requiredStar}> *</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    errors.full_name && styles.inputError,
                  ]}
                  value={formData.full_name}
                  onChangeText={(value) => {
                    setFormData(prev => ({ ...prev, full_name: value }));
                    validateField('full_name', value);
                  }}
                  placeholder="Enter Full Name"
                />
                {errors.full_name && (
                  <Text style={styles.errorText}>
                    <Icon name="exclamation-circle" size={12} /> {errors.full_name}
                  </Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <Icon name="male" size={14} color="#666" />
                  <Text style={styles.label}>Father's Name</Text>
                  <Text style={styles.requiredStar}> *</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    errors.father_name && styles.inputError,
                  ]}
                  value={formData.father_name}
                  onChangeText={(value) => {
                    setFormData(prev => ({ ...prev, father_name: value }));
                    validateField('father_name', value);
                  }}
                  placeholder="Enter Father's Name"
                />
                {errors.father_name && (
                  <Text style={styles.errorText}>
                    <Icon name="exclamation-circle" size={12} /> {errors.father_name}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <Icon name="calendar" size={14} color="#666" />
                  <Text style={styles.label}>Date of Birth</Text>
                  <Text style={styles.requiredStar}> *</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.dateInput,
                    errors.dob && styles.inputError,
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={formData.dob ? styles.inputText : styles.placeholder}>
                    {formData.dob ? moment(formData.dob).format('DD/MM/YYYY') : 'Select Date'}
                  </Text>
                  <Icon name="calendar" size={18} color="#666" />
                </TouchableOpacity>
                {errors.dob && (
                  <Text style={styles.errorText}>
                    <Icon name="exclamation-circle" size={12} /> {errors.dob}
                  </Text>
                )}
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <Icon name="birthday-cake" size={14} color="#666" />
                  <Text style={styles.label}>Age</Text>
                  <Text style={styles.requiredStar}> *</Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    errors.age && styles.inputError,
                  ]}
                  value={formData.age}
                  onChangeText={(value) => {
                    setFormData(prev => ({ ...prev, age: value }));
                    validateField('age', value);
                  }}
                  placeholder="Enter Age"
                  keyboardType="numeric"
                  editable={false}
                />
                {errors.age && (
                  <Text style={styles.errorText}>
                    <Icon name="exclamation-circle" size={12} /> {errors.age}
                  </Text>
                )}
                <Text style={styles.helperText}>
                  <Icon name="info-circle" size={12} /> Must be 16-60 years
                </Text>
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Icon name="heart" size={14} color="#666" />
                <Text style={styles.label}>Marital Status</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <View style={styles.optionsGrid}>
                {maritalStatuses.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.optionCard,
                      formData.marital_status === status.value && styles.optionCardSelected,
                    ]}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, marital_status: status.value }));
                      setErrors(prev => ({ ...prev, marital_status: '' }));
                    }}
                  >
                    <Icon 
                      name={status.icon} 
                      size={16} 
                      color={formData.marital_status === status.value ? '#fff' : '#004d40'} 
                    />
                    <Text style={[
                      styles.optionText,
                      formData.marital_status === status.value && styles.optionTextSelected,
                    ]}>
                      {status.label}
                    </Text>
                    {formData.marital_status === status.value && (
                      <View style={styles.selectedIndicator}>
                        <Icon name="check" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              {errors.marital_status && (
                <Text style={styles.errorText}>
                  <Icon name="exclamation-circle" size={12} /> {errors.marital_status}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Icon name="id-card" size={14} color="#666" />
                <Text style={styles.label}>CNIC No</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  errors.cnic_no && styles.inputError,
                ]}
                value={formData.cnic_no}
                onChangeText={handleCnicChange}
                placeholder="12345-1234567-1"
                keyboardType="numeric"
                maxLength={15}
              />
              {errors.cnic_no && (
                <Text style={styles.errorText}>
                  <Icon name="exclamation-circle" size={12} /> {errors.cnic_no}
                </Text>
              )}
              <Text style={styles.helperText}>
                <Icon name="info-circle" size={12} /> Last digit must be even for females
              </Text>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Icon name="signal" size={14} color="#666" />
                <Text style={styles.label}>Mobile Network</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <View style={styles.optionsGrid}>
                {mobileNetworks.map((network) => (
                  <TouchableOpacity
                    key={network.value}
                    style={[
                      styles.optionCard,
                      formData.mobile_network === network.value && styles.optionCardSelected,
                    ]}
                    onPress={() => handleMobileNetworkChange(network.value)}
                  >
                    <Icon 
                      name={network.icon} 
                      size={16} 
                      color={formData.mobile_network === network.value ? '#fff' : '#004d40'} 
                    />
                    <Text style={[
                      styles.optionText,
                      formData.mobile_network === network.value && styles.optionTextSelected,
                    ]}>
                      {network.label}
                    </Text>
                    {formData.mobile_network === network.value && (
                      <View style={styles.selectedIndicator}>
                        <Icon name="check" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              {errors.mobile_network && (
                <Text style={styles.errorText}>
                  <Icon name="exclamation-circle" size={12} /> {errors.mobile_network}
                </Text>
              )}
              
              {showOtherNetwork && (
                <View style={{ marginTop: 10 }}>
                  <View style={styles.labelContainer}>
                    <Icon name="edit" size={14} color="#666" />
                    <Text style={styles.label}>Specify Network</Text>
                    <Text style={styles.requiredStar}> *</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      errors.other_network_name && styles.inputError,
                    ]}
                    value={formData.other_network_name}
                    onChangeText={(value) => {
                      setFormData(prev => ({ ...prev, other_network_name: value }));
                      setErrors(prev => ({ ...prev, other_network_name: '' }));
                    }}
                    placeholder="Enter network name"
                  />
                  {errors.other_network_name && (
                    <Text style={styles.errorText}>
                      <Icon name="exclamation-circle" size={12} /> {errors.other_network_name}
                    </Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Icon name="envelope" size={14} color="#666" />
                <Text style={styles.label}>Email</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  errors.email && styles.inputError,
                ]}
                value={formData.email}
                onChangeText={(value) => {
                  setFormData(prev => ({ ...prev, email: value }));
                  validateField('email', value);
                }}
                placeholder="email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && (
                <Text style={styles.errorText}>
                  <Icon name="exclamation-circle" size={12} /> {errors.email}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Icon name="home" size={14} color="#666" />
                <Text style={styles.label}>Present Address</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <TextInput
                style={[
                  styles.textArea,
                  errors.present_address && styles.inputError,
                ]}
                value={formData.present_address}
                onChangeText={(value) => {
                  setFormData(prev => ({ ...prev, present_address: value }));
                  validateField('present_address', value);
                }}
                placeholder="Enter your complete address"
                multiline
                numberOfLines={3}
              />
              {errors.present_address && (
                <Text style={styles.errorText}>
                  <Icon name="exclamation-circle" size={12} /> {errors.present_address}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Icon name="phone" size={14} color="#666" />
                <Text style={styles.label}>Cell No</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  errors.cell_no && styles.inputError,
                ]}
                value={formData.cell_no}
                onChangeText={(value) => {
                  setFormData(prev => ({ ...prev, cell_no: value }));
                  validateField('cell_no', value);
                }}
                placeholder="03001234567"
                keyboardType="phone-pad"
              />
              {errors.cell_no && (
                <Text style={styles.errorText}>
                  <Icon name="exclamation-circle" size={12} /> {errors.cell_no}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Icon name="wheelchair" size={14} color="#666" />
                <Text style={styles.label}>Disability Status</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleDisabilityChange('1')}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.has_disability === '1' && styles.radioCircleSelected,
                  ]}>
                    {formData.has_disability === '1' && (
                      <View style={styles.radioInnerCircle} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.radioOption}
                  onPress={() => handleDisabilityChange('0')}
                >
                  <View style={[
                    styles.radioCircle,
                    formData.has_disability === '0' && styles.radioCircleSelected,
                  ]}>
                    {formData.has_disability === '0' && (
                      <View style={styles.radioInnerCircle} />
                    )}
                  </View>
                  <Text style={styles.radioLabel}>No</Text>
                </TouchableOpacity>
              </View>
              
              {showDisabilityDetails && (
                <View style={{ marginTop: 10 }}>
                  <View style={styles.labelContainer}>
                    <Icon name="edit" size={14} color="#666" />
                    <Text style={styles.label}>Type of Disability</Text>
                    <Text style={styles.requiredStar}> *</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      errors.disability_type && styles.inputError,
                    ]}
                    value={formData.disability_type}
                    onChangeText={(value) => {
                      setFormData(prev => ({ ...prev, disability_type: value }));
                      setErrors(prev => ({ ...prev, disability_type: '' }));
                    }}
                    placeholder="Describe disability"
                  />
                  {errors.disability_type && (
                    <Text style={styles.errorText}>
                      <Icon name="exclamation-circle" size={12} /> {errors.disability_type}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </Collapsible>
    </Animatable.View>
  );

  const renderStep2 = () => (
    <Animatable.View 
      animation="fadeIn"
      duration={500}
      style={styles.stepContainer}
    >
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setIsAcademicExpanded(!isAcademicExpanded)}
      >
        <LinearGradient
          colors={['#f8f9fa', '#e9ecef']}
          style={styles.sectionHeader}
        >
          <FontAwesomeIcon name="graduation-cap" size={20} color="#004d40" />
          <Text style={styles.sectionTitle}>Academic Information</Text>
          <Icon 
            name={isAcademicExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#004d40" 
          />
        </LinearGradient>
      </TouchableOpacity>
      
      <Collapsible collapsed={!isAcademicExpanded}>
        <View style={styles.collapsibleContent}>
          <View style={styles.formGrid}>
            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Icon name="briefcase" size={14} color="#666" />
                <Text style={styles.label}>Employment Status</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <View style={styles.optionsGrid}>
                {employmentStatuses.map((status) => (
                  <TouchableOpacity
                    key={status.value}
                    style={[
                      styles.optionCard,
                      formData.employment_status === status.value && styles.optionCardSelected,
                    ]}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, employment_status: status.value }));
                      setErrors(prev => ({ ...prev, employment_status: '' }));
                    }}
                  >
                    <Icon 
                      name={status.icon} 
                      size={16} 
                      color={formData.employment_status === status.value ? '#fff' : '#004d40'} 
                    />
                    <Text style={[
                      styles.optionText,
                      formData.employment_status === status.value && styles.optionTextSelected,
                    ]}>
                      {status.label}
                    </Text>
                    {formData.employment_status === status.value && (
                      <View style={styles.selectedIndicator}>
                        <Icon name="check" size={12} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              {errors.employment_status && (
                <Text style={styles.errorText}>
                  <Icon name="exclamation-circle" size={12} /> {errors.employment_status}
                </Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Icon name="book" size={14} color="#666" />
                <Text style={styles.label}>Educational Level</Text>
                <Text style={styles.requiredStar}> *</Text>
              </View>
              <View style={styles.educationGrid}>
                {educationLevels.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.educationCard,
                      formData.educational_level === level.value && styles.educationCardSelected,
                    ]}
                    onPress={() => handleEducationLevelChange(level.value)}
                  >
                    <View style={styles.educationIcon}>
                      <Icon 
                        name={level.icon} 
                        size={20} 
                        color={formData.educational_level === level.value ? '#fff' : '#004d40'} 
                      />
                    </View>
                    <Text style={[
                      styles.educationText,
                      formData.educational_level === level.value && styles.educationTextSelected,
                    ]}>
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.educational_level && (
                <Text style={styles.errorText}>
                  <Icon name="exclamation-circle" size={12} /> {errors.educational_level}
                </Text>
              )}
              
              {showOtherEducation && (
                <View style={{ marginTop: 10 }}>
                  <View style={styles.labelContainer}>
                    <Icon name="edit" size={14} color="#666" />
                    <Text style={styles.label}>Specify Education Level</Text>
                    <Text style={styles.requiredStar}> *</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.input,
                      errors.other_education_name && styles.inputError,
                    ]}
                    value={formData.other_education_name}
                    onChangeText={(value) => {
                      setFormData(prev => ({ ...prev, other_education_name: value }));
                      setErrors(prev => ({ ...prev, other_education_name: '' }));
                    }}
                    placeholder="Enter education level"
                  />
                  {errors.other_education_name && (
                    <Text style={styles.errorText}>
                      <Icon name="exclamation-circle" size={12} /> {errors.other_education_name}
                    </Text>
                  )}
                </View>
              )}
            </View>

            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <Icon name="university" size={14} color="#666" />
                  <Text style={styles.label}>Last Degree Institute</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.last_degree_institute}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, last_degree_institute: value }))}
                  placeholder="Institute name"
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.labelContainer}>
                  <Icon name="book-open" size={14} color="#666" />
                  <Text style={styles.label}>Discipline</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={formData.discipline}
                  onChangeText={(value) => setFormData(prev => ({ ...prev, discipline: value }))}
                  placeholder="Field of study"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Icon name="star" size={14} color="#666" />
                <Text style={styles.label}>Specialization</Text>
              </View>
              <TextInput
                style={styles.input}
                value={formData.specialization}
                onChangeText={(value) => setFormData(prev => ({ ...prev, specialization: value }))}
                placeholder="Area of expertise"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelContainer}>
                <Icon name="info-circle" size={14} color="#666" />
                <Text style={styles.label}>Special Conditions</Text>
              </View>
              <TextInput
                style={styles.textArea}
                value={formData.special_condition}
                onChangeText={(value) => setFormData(prev => ({ ...prev, special_condition: value }))}
                placeholder="Describe any special conditions or requirements"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        </View>
      </Collapsible>
    </Animatable.View>
  );

  const renderStep3 = () => (
    <Animatable.View 
      animation="fadeIn"
      duration={500}
      style={styles.stepContainer}
    >
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setIsDocumentsExpanded(!isDocumentsExpanded)}
      >
        <LinearGradient
          colors={['#f8f9fa', '#e9ecef']}
          style={styles.sectionHeader}
        >
          <FontAwesomeIcon name="file-upload" size={20} color="#004d40" />
          <Text style={styles.sectionTitle}>Required Documents</Text>
          <Icon 
            name={isDocumentsExpanded ? 'chevron-up' : 'chevron-down'} 
            size={20} 
            color="#004d40" 
          />
        </LinearGradient>
      </TouchableOpacity>
      
      <Collapsible collapsed={!isDocumentsExpanded}>
        <View style={styles.collapsibleContent}>
          <View style={styles.documentGrid}>
            <DocumentUpload
              title="CNIC Front"
              icon="id-card"
              value={formData.cnic_front}
              onPress={() => pickFile('cnic_front')}
              error={errors.cnic_front}
              required
            />
            
            <DocumentUpload
              title="CNIC Back"
              icon="id-card"
              value={formData.cnic_back}
              onPress={() => pickFile('cnic_back')}
              error={errors.cnic_back}
              required
            />
            
            <DocumentUpload
              title="Domicile"
              icon="file-contract"
              value={formData.domicile}
              onPress={() => pickFile('domicile')}
              optional
            />
            
            <DocumentUpload
              title="Educational Documents"
              icon="graduation-cap"
              value={formData.educational_documents}
              onPress={() => pickFile('educational_documents')}
            />
            
            {showDisabilityDetails && (
              <DocumentUpload
                title="Disability Certificate"
                icon="wheelchair"
                value={formData.disability_certificate}
                onPress={() => pickFile('disability_certificate')}
                error={errors.disability_certificate}
                required
              />
            )}
          </View>

          <View style={styles.noteCard}>
            <Icon name="info-circle" size={20} color="#004d40" />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Important Notes</Text>
              <Text style={styles.noteText}>
                • All documents must be clear and legible
              </Text>
              <Text style={styles.noteText}>
                • Maximum file size: 5MB per document
              </Text>
              <Text style={styles.noteText}>
                • Accepted formats: JPG, PNG, PDF
              </Text>
              <Text style={styles.noteText}>
                • Required documents are marked with *
              </Text>
            </View>
          </View>
        </View>
      </Collapsible>
    </Animatable.View>
  );

  const DocumentUpload = ({ title, icon, value, onPress, error, required, optional }) => (
    <View style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <Icon name={icon} size={16} color="#004d40" />
        <Text style={styles.documentTitle}>
          {title}
          {required && <Text style={styles.requiredStar}> *</Text>}
          {optional && <Text style={styles.optionalText}> (Optional)</Text>}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.documentUpload,
          error && styles.inputError,
          value && styles.documentUploadFilled,
        ]}
        onPress={onPress}
      >
        {value ? (
          <View style={styles.documentInfo}>
            <Icon name="check-circle" size={20} color="#4caf50" />
            <Text style={styles.documentName} numberOfLines={1}>
              {value.name}
            </Text>
            <TouchableOpacity
              onPress={() => {
                const field = Object.keys(formData).find(key => formData[key] === value);
                if (field) {
                  setFormData(prev => ({ ...prev, [field]: null }));
                  setErrors(prev => ({ ...prev, [field]: '' }));
                }
              }}
              style={styles.removeButton}
            >
              <Icon name="times" size={16} color="#f44336" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.documentPlaceholder}>
            <Icon name="cloud-upload" size={24} color="#666" />
            <Text style={styles.uploadText}>Upload Document</Text>
            <Text style={styles.uploadSubtext}>JPG, PNG, PDF up to 5MB</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>
          <Icon name="exclamation-circle" size={12} /> {error}
        </Text>
      )}
    </View>
  );

  const renderStepper = () => (
    <View style={styles.stepperContainer}>
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <TouchableOpacity
            style={styles.stepperItem}
            onPress={() => currentStep >= step && setCurrentStep(step)}
          >
            <LinearGradient
              colors={
                currentStep === step 
                  ? ['#004d40', '#00695c']
                  : currentStep > step
                  ? ['#4caf50', '#2e7d32']
                  : ['#e0e0e0', '#bdbdbd']
              }
              style={styles.stepperCircle}
            >
              {currentStep > step ? (
                <Icon name="check" size={18} color="#fff" />
              ) : (
                <Text style={styles.stepperNumber}>{step}</Text>
              )}
            </LinearGradient>
            <Text style={[
              styles.stepperLabel,
              currentStep === step && styles.stepperLabelActive,
              currentStep > step && styles.stepperLabelCompleted,
            ]}>
              {step === 1 ? 'Personal' : step === 2 ? 'Academic' : 'Documents'}
            </Text>
          </TouchableOpacity>
          {step < 3 && (
            <View style={[
              styles.stepperLine,
              currentStep > step && styles.stepperLineCompleted,
            ]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <LinearGradient
      colors={['#f5f7fa', '#e4e8f0']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Animatable.View 
          animation="zoomIn"
          duration={800}
          style={styles.header}
        >
          <LinearGradient
            colors={['#004d40', '#00695c']}
            style={styles.headerGradient}
          >
            <FontAwesomeIcon name="laptop-code" size={32} color="#fff" />
            <Text style={styles.mainTitle}>
              Digital Skills Training
            </Text>
            <Text style={styles.subTitle}>
              Economic Empowerment of Rural Females
            </Text>
          </LinearGradient>
        </Animatable.View>

        <View style={styles.formContainer}>
          <View style={styles.stepperWrapper}>
            {renderStepper()}
          </View>

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </View>
      </ScrollView>

      <LinearGradient
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
        style={styles.footer}
      >
        <View style={[
          styles.buttonContainer,
          currentStep === 1 && styles.buttonContainerFirstStep
        ]}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={handlePrevStep}
            >
              <Icon name="arrow-left" size={16} color="#004d40" />
              <Text style={styles.backButtonText}>Previous</Text>
            </TouchableOpacity>
          )}
          
          {currentStep < 3 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextStep}
            >
              <Text style={styles.nextButtonText}>Next</Text>
              <Icon name="arrow-right" size={16} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="paper-plane" size={16} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Registration</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={['#004d40', '#00695c']}
              style={[styles.progressFill, { width: `${(currentStep / 3) * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep} of 3 • {Math.round((currentStep / 3) * 100)}% Complete
          </Text>
        </View>
      </LinearGradient>

      {showDatePicker && (
        <DateTimePicker
          value={formData.dob ? new Date(formData.dob) : new Date()}
          mode="date"
          display="spinner"
          onChange={handleDOBChange}
          maximumDate={new Date(new Date().getFullYear() - 16, 11, 31)}
          minimumDate={new Date(new Date().getFullYear() - 60, 0, 1)}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerGradient: {
    padding: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 5,
    textAlign: 'center',
  },
  stepperWrapper: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperItem: {
    alignItems: 'center',
    zIndex: 1,
  },
  stepperCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepperNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepperLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  stepperLabelActive: {
    color: '#004d40',
    fontWeight: '600',
  },
  stepperLabelCompleted: {
    color: '#2e7d32',
  },
  stepperLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 10,
  },
  stepperLineCompleted: {
    backgroundColor: '#4caf50',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 0,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  collapsibleHeader: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004d40',
    marginLeft: 10,
    flex: 1,
  },
  collapsibleContent: {
    padding: 15,
  },
  formGrid: {
    padding: 0,
  },
  formRow: {
    flexDirection: 'row',
    marginHorizontal: -8,
    marginBottom: 15,
  },
  formGroup: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginLeft: 6,
  },
  requiredStar: {
    color: '#f44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInput: {
    padding: 12,
  },
  inputText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  inputError: {
    borderColor: '#f44336',
    backgroundColor: '#fff',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '45%',
  },
  optionCardSelected: {
    backgroundColor: '#004d40',
    borderColor: '#004d40',
  },
  optionText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  optionTextSelected: {
    color: '#fff',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  educationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  educationCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    margin: 5,
    borderWidth: 2,
    borderColor: 'transparent',
    width: '30%',
    minWidth: 100,
  },
  educationCardSelected: {
    backgroundColor: '#004d40',
    borderColor: '#004d40',
  },
  educationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  educationText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  educationTextSelected: {
    color: '#fff',
  },
  radioGroup: {
    flexDirection: 'row',
    marginTop: 5,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginVertical: 5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#004d40',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#004d40',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#004d40',
  },
  radioLabel: {
    fontSize: 14,
    color: '#555',
  },
  documentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  documentCard: {
    width: '48%',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginLeft: 6,
    flex: 1,
  },
  optionalText: {
    color: '#666',
    fontSize: 11,
  },
  documentUpload: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
    minHeight: 120,
  },
  documentUploadFilled: {
    borderStyle: 'solid',
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e8',
  },
  documentPlaceholder: {
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  documentName: {
    fontSize: 12,
    color: '#333',
    flex: 1,
    marginHorizontal: 8,
  },
  removeButton: {
    padding: 4,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  noteContent: {
    flex: 1,
    marginLeft: 12,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004d40',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  buttonContainerFirstStep: {
    justifyContent: 'flex-end',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#004d40',
    borderRadius: 25,
    paddingHorizontal: 25,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#004d40',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004d40',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e7d32',
    borderRadius: 25,
    paddingHorizontal: 30,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
});

export default DigitalSkillsRegistrationForm;