// Step1Form.js - Fixed with synchronous SyncStorage (matching the working example)
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
  LogBox,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RadioButton, Menu, Provider as PaperProvider } from 'react-native-paper';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import SyncStorage from 'react-native-sync-storage';
import axios from 'axios';

// Ignore specific warnings
LogBox.ignoreLogs(['Warning: ...']);

const { width, height } = Dimensions.get('window');

// API Base URL
const API_BASE_URL = 'https://wbic-wdd.punjab.gov.pk/api/v1';

// Beautiful Color Scheme
const COLORS = {
  primary: '#c13397',
  primaryDark: '#6b075f',
  primaryLight: '#cf54cf',
  primarySoft: '#F0ECFF',
  primaryGradient: ['#bb37a1', '#c43fa9', '#c64fc6'],
  success: '#00C48C',
  successLight: '#E0F9F0',
  warning: '#FFB946',
  warningLight: '#FFF4E5',
  error: '#FF4D4F',
  errorLight: '#FFE5E5',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  textLighter: '#BDC3C7',
  border: '#E8ECF0',
  background: '#F9FAFC',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  stepActive: '#a1339d',
  stepCompleted: '#00C48C',
  stepInactive: '#E8ECF0',
  shadow: '#000000',
};

const Step1Form = ({ navigation, route }) => {
  // Form State
  const [formData, setFormData] = useState({
    applicant_id: null,
    name: '',
    parentage_type: '',
    father_name: '',
    husband_name: '',
    cnic: '',
    contact_number: '',
    email: '',
    dob: null,
    age: '',
    current_address: '',
    permanent_address: '',
    province: '',
    other_province: '',
    district_id: '',
    city_manual: '',
    application_via: '',
    tsp_name: '',
    highest_qualification: '',
    other_qualification: '',
    has_laptop: '',
    is_student: '',
    std_district_id: '',
    std_type: '',
    university_id: '',
    other_university: '',
    department_id: '',
    std_year: '',
    std_semester: '',
    cnic_readonly: false,
  });

  // File State
  const [files, setFiles] = useState({
    cnic_front: null,
    cnic_back: null,
    business_registration_file: null,
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [uniDistricts, setUniDistricts] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [showMenu, setShowMenu] = useState({
    parentage_type: false,
    province: false,
    highest_qualification: false,
    std_district_id: false,
    std_type: false,
    university_id: false,
    department_id: false,
    std_year: false,
    std_semester: false,
    application_via: false,
    district_id: false,
  });

  // Dynamic UI States
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [showOtherProvince, setShowOtherProvince] = useState(false);
  const [showOtherQual, setShowOtherQual] = useState(false);
  const [showTSPName, setShowTSPName] = useState(false);
  const [showOtherUniversity, setShowOtherUniversity] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showManualCity, setShowManualCity] = useState(false);

  // API client
 // API client configuration - update this at the top of your file
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'multipart/form-data',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    console.log('[API Request] Headers:', config.headers);
    return config;
  },
  error => {
    console.log('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log(`[API Response] ${response.config.url} - Status: ${response.status}`);
    console.log('[API Response] Data:', response.data);
    return response;
  },
  error => {
    console.log('[API Response Error]', error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

  // ============================================================
  // INITIALIZATION - Load SyncStorage data synchronously
  // ============================================================

  useEffect(() => {
    initializeForm();
  }, []);

  // Dynamic UI effect hooks
  useEffect(() => {
    setShowOtherProvince(formData.province === 'Other');
    setShowDistrictDropdown(formData.province === 'Punjab');
    setShowManualCity(formData.province !== '' && formData.province !== 'Punjab' && formData.province !== 'Other');
  }, [formData.province]);

  useEffect(() => {
    setShowOtherQual(formData.highest_qualification === 'Others');
  }, [formData.highest_qualification]);

  useEffect(() => {
    setShowTSPName(formData.application_via === 'tsp');
  }, [formData.application_via]);

  useEffect(() => {
    setShowStudentDetails(formData.is_student === '1');
  }, [formData.is_student]);

  useEffect(() => {
    setShowOtherUniversity(formData.university_id === 'others');
    if (formData.university_id && formData.university_id !== 'others') {
      fetchDepartments(formData.university_id);
    }
  }, [formData.university_id]);

  useEffect(() => {
    if (formData.std_district_id && formData.std_type) {
      fetchUniversities(formData.std_district_id, formData.std_type);
    }
  }, [formData.std_district_id, formData.std_type]);

  useEffect(() => {
    if (formData.dob) {
      calculateAge();
    }
  }, [formData.dob]);

  const initializeForm = async () => {
    try {
      setInitialLoading(true);
      console.log('========== [Initialize] Starting form initialization ==========');
      
      // Step 1: Load user profile from SyncStorage (SYNCHRONOUS - like working example)
      loadUserProfile();
      
      // Step 2: Load districts data from API
      await loadDistrictsData();
      
    } catch (error) {
      console.error('Initialize Error:', error);
      Alert.alert('Error', 'Failed to load data. Please check your connection.');
    } finally {
      setInitialLoading(false);
      console.log('========== [Initialize] Form initialization completed ==========');
    }
  };

  // FIXED: Use synchronous syncStorage.get() - exactly like the working example
  const loadUserProfile = () => {
    try {
      console.log('[SyncStorage] Attempting to load user_profile from SyncStorage...');
      
      // IMPORTANT: Use syncStorage.get() SYNCHRONOUSLY (not async/await)
      const userProfileData = SyncStorage.get('user_profile');
      
      console.log('[SyncStorage] Raw stored profile:', userProfileData);
      
      if (userProfileData) {
        let profile;
        try {
          profile = typeof userProfileData === 'string' ? JSON.parse(userProfileData) : userProfileData;
          console.log('[SyncStorage] Parsed profile:', profile);
        } catch (e) {
          console.log('[SyncStorage] Parse error:', e);
          profile = userProfileData;
        }
        
        if (profile) {
          setUserProfile(profile);
          console.log('[SyncStorage] Profile set successfully');
          
          // Auto-fill form with profile data
          autoFillFromProfile(profile);
        } else {
          console.log('[SyncStorage] Profile is empty/null');
        }
      } else {
        console.log('[SyncStorage] No user_profile found in SyncStorage');
      }
    } catch (error) {
      console.error('[SyncStorage] Error loading profile:', error);
    }
  };

  // Auto-fill form data from SyncStorage profile
  const autoFillFromProfile = (profile) => {
    console.log('[AutoFill] Auto-filling form from profile data:', profile);
    
    const updates = {};
    
    // Check each field and update if available in profile
    if (profile.name && profile.name.trim() !== '') {
      updates.name = profile.name;
      console.log('[AutoFill] Name filled:', profile.name);
    }
    
    if (profile.cnic && profile.cnic.trim() !== '') {
      // Remove any dashes from CNIC if present
      const cleanCnic = profile.cnic.replace(/-/g, '');
      updates.cnic = cleanCnic;
      updates.cnic_readonly = true;
      console.log('[AutoFill] CNIC filled:', cleanCnic);
    }
    
    if (profile.email && profile.email.trim() !== '') {
      updates.email = profile.email;
      console.log('[AutoFill] Email filled:', profile.email);
    }
    
    if (profile.contact && profile.contact.trim() !== '') {
      updates.contact_number = profile.contact;
      console.log('[AutoFill] Contact filled:', profile.contact);
    }
    
    if (profile.address && profile.address.trim() !== '') {
      updates.current_address = profile.address;
      console.log('[AutoFill] Current Address filled:', profile.address);
    }
    
    if (profile.permanent_address && profile.permanent_address.trim() !== '') {
      updates.permanent_address = profile.permanent_address;
      console.log('[AutoFill] Permanent Address filled:', profile.permanent_address);
    }
    
    if (profile.dob && profile.dob.trim() !== '') {
      try {
        const dobDate = new Date(profile.dob);
        if (!isNaN(dobDate.getTime())) {
          updates.dob = dobDate;
          console.log('[AutoFill] DOB filled:', profile.dob);
        }
      } catch (e) {
        console.log('[AutoFill] Error parsing DOB:', e);
      }
    }
    
    if (profile.district && profile.district.trim() !== '') {
      updates.district_id = profile.district;
      console.log('[AutoFill] District filled:', profile.district);
    }
    
    if (profile.tehsil && profile.tehsil.trim() !== '') {
      updates.city_manual = profile.tehsil;
      console.log('[AutoFill] Tehsil/City filled:', profile.tehsil);
    }
    
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
      console.log('[AutoFill] Form updated with profile data:', updates);
    } else {
      console.log('[AutoFill] No new data to fill from profile');
    }
  };

  const loadDistrictsData = async () => {
    try {
      console.log('[API] Fetching districts...');
      const districtsResponse = await api.get('/districts');
      
      if (districtsResponse.data.success) {
        setDistricts(districtsResponse.data.data);
        console.log('[Districts] Loaded:', districtsResponse.data.data.length);
      }
    } catch (error) {
      console.log('[Districts API Error]:', error.message);
    }
    
    try {
      console.log('[API] Fetching uni-districts...');
      const uniDistrictsResponse = await api.get('/uni-districts');
      
      if (uniDistrictsResponse.data.success) {
        setUniDistricts(uniDistrictsResponse.data.data);
        console.log('[UniDistricts] Loaded:', uniDistrictsResponse.data.data.length);
      }
    } catch (error) {
      console.log('[UniDistricts API Error]:', error.message);
    }
  };

  const fetchUniversities = async (districtId, type) => {
    if (!districtId) return;
    try {
      console.log(`[API] Fetching universities - District: ${districtId}, Type: ${type}`);
      const response = await api.get('/universities', {
        params: { district_id: districtId, type },
      });
      if (response.data.success) {
        setUniversities(response.data.data);
        console.log('[Universities] Loaded:', response.data.data.length);
      }
    } catch (error) {
      console.log('[Universities API Error]:', error.message);
    }
  };

  const fetchDepartments = async (universityId) => {
    try {
      console.log(`[API] Fetching departments for university: ${universityId}`);
      const response = await api.get(`/departments/${universityId}`);
      if (response.data.success) {
        setDepartments(response.data.data);
        console.log('[Departments] Loaded:', response.data.data.length);
      }
    } catch (error) {
      console.log('[Departments API Error]:', error.message);
    }
  };

  const calculateAge = () => {
    if (!formData.dob) return;
    
    const today = new Date();
    const birthDate = new Date(formData.dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age > 0) {
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dob: selectedDate }));
      if (errors.dob) {
        setErrors(prev => ({ ...prev, dob: null }));
      }
    }
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    
    if (field === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (field === 'cnic') {
      value = value.replace(/[^0-9]/g, '').slice(0, 13);
    } else if (field === 'contact_number') {
      value = value.replace(/[^0-9]/g, '').slice(0, 11);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field, value) => {
    setShowMenu(prev => ({ ...prev, [field]: false }));
    handleInputChange(field, value);
  };

  const handleFilePick = async (fileType) => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });
      
      setFiles(prev => ({ ...prev, [fileType]: result[0] }));
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({ ...prev, [fileType]: null }));
  };

  const validateForm = () => {
    console.log('[Validation] Validating form...');
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.parentage_type) newErrors.parentage_type = 'Parentage type is required';
    if (formData.parentage_type === 'do' && !formData.father_name) newErrors.father_name = 'Father\'s name is required';
    if (formData.parentage_type === 'wo' && !formData.husband_name) newErrors.husband_name = 'Husband\'s name is required';
    if (!formData.cnic || formData.cnic.length !== 13) newErrors.cnic = 'Valid CNIC is required (13 digits)';
    if (!formData.contact_number || formData.contact_number.length !== 11) newErrors.contact_number = 'Valid contact number is required (11 digits)';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.dob) newErrors.dob = 'Date of birth is required';
    if (!formData.current_address) newErrors.current_address = 'Current address is required';
    if (!formData.permanent_address) newErrors.permanent_address = 'Permanent address is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (formData.province === 'Other' && !formData.other_province) newErrors.other_province = 'Please specify province';
    if (formData.province === 'Punjab' && !formData.district_id) newErrors.district_id = 'District is required';
    if (formData.province !== 'Punjab' && formData.province && !formData.city_manual) newErrors.city_manual = 'City is required';
    if (!formData.application_via) newErrors.application_via = 'Please select application type';
    if (formData.application_via === 'tsp' && !formData.tsp_name) newErrors.tsp_name = 'TSP name is required';
    if (!formData.highest_qualification) newErrors.highest_qualification = 'Highest qualification is required';
    if (formData.highest_qualification === 'Others' && !formData.other_qualification) newErrors.other_qualification = 'Please specify qualification';
    if (formData.has_laptop === '') newErrors.has_laptop = 'Please select if you have a laptop';
    if (formData.is_student === '') newErrors.is_student = 'Please specify if you are a student';
    
    if (formData.is_student === '1') {
      if (!formData.std_district_id) newErrors.std_district_id = 'Institute district is required';
      if (!formData.std_type) newErrors.std_type = 'Institute type is required';
      if (!formData.university_id) newErrors.university_id = 'University is required';
      if (formData.university_id === 'others' && !formData.other_university) newErrors.other_university = 'Please specify university';
      if (!formData.department_id) newErrors.department_id = 'Department is required';
      if (!formData.std_year) newErrors.std_year = 'Year is required';
      if (!formData.std_semester) newErrors.std_semester = 'Semester is required';
    }
    
    if (!files.cnic_front) newErrors.cnic_front = 'CNIC front image is required';
    if (!files.cnic_back) newErrors.cnic_back = 'CNIC back image is required';
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('[Validation]', isValid ? 'Form is valid' : 'Form has errors', newErrors);
    return isValid;
  };

// FIXED handleSubmit function - using correct SyncStorage methods
const handleSubmit = async () => {
  if (!validateForm()) {
    Alert.alert('Validation Error', 'Please fill all required fields correctly');
    return;
  }
  
  setLoading(true);
  console.log('[Submit] Preparing form data for submission...');
  
  const formDataToSend = new FormData();
  
  // Add all form fields
  Object.keys(formData).forEach(key => {
    if (key !== 'cnic_readonly' && formData[key] !== null && formData[key] !== '') {
      if (key === 'dob' && formData[key] instanceof Date) {
        formDataToSend.append(key, formData[key].toISOString().split('T')[0]);
      } else if (key !== 'applicant_id') {
        formDataToSend.append(key, formData[key]);
      }
    }
  });
  
  // Add applicant_id if exists
  if (formData.applicant_id) {
    formDataToSend.append('applicant_id', formData.applicant_id.toString());
  }
  
  // Add files
  if (files.cnic_front) {
    formDataToSend.append('cnic_front', {
      uri: files.cnic_front.uri,
      type: files.cnic_front.type || 'image/jpeg',
      name: files.cnic_front.name || 'cnic_front.jpg',
    });
  }
  
  if (files.cnic_back) {
    formDataToSend.append('cnic_back', {
      uri: files.cnic_back.uri,
      type: files.cnic_back.type || 'image/jpeg',
      name: files.cnic_back.name || 'cnic_back.jpg',
    });
  }
  
  if (files.business_registration_file) {
    formDataToSend.append('business_registration_file', {
      uri: files.business_registration_file.uri,
      type: files.business_registration_file.type || 'application/pdf',
      name: files.business_registration_file.name || 'document.pdf',
    });
  }
  
  try {
    console.log('[Submit] Sending request to /register/step1');
    
    const response = await api.post('/register/step1', formDataToSend, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
    });
    
    console.log('[Submit] Response status:', response.status);
    console.log('[Submit] Response data:', response.data);
    
    // Check for success in response
    if (response.data && response.data.success === true) {
      console.log('[Submit Success] Data saved:', response.data);
      
   
      
      // Show success message
      Alert.alert(
        'Success!', 
        response.data.message || 'Step 1 saved successfully!',
        [
          { 
            text: 'Continue', 
            onPress: () => {
              if (response.data.applicant_id) {
                navigation.navigate('Step2Form', { applicantId: response.data.applicant_id });
              } else {
                navigation.navigate('Step2Form');
              }
            }
          }
        ]
      );
    } else {
      console.log('[Submit] Response success false or missing');
      const errorMessage = response.data?.message || 'Failed to save form. Please try again.';
      Alert.alert('Error', errorMessage);
    }
    
  } catch (error) {
    console.log('[Submit Error]', error);
    
    if (error.response) {
      console.log('[Submit Error] Status:', error.response.status);
      console.log('[Submit Error] Data:', error.response.data);
      
      if (error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        if (validationErrors) {
          const newErrors = {};
          Object.keys(validationErrors).forEach(key => {
            newErrors[key] = validationErrors[key][0];
          });
          setErrors(newErrors);
          Alert.alert('Validation Error', 'Please check the form for errors and try again.');
        } else {
          Alert.alert('Validation Error', error.response.data.message || 'Please check your inputs.');
        }
      } else if (error.response.status === 500) {
        Alert.alert('Server Error', 'Something went wrong on the server. Please try again later.');
      } else {
        Alert.alert('Error', error.response.data?.message || 'Failed to save form. Please try again.');
      }
    } else if (error.request) {
      Alert.alert('Network Error', 'Unable to connect to server. Please check your internet connection.');
    } else {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  const getSemesterOptions = () => {
    if (!formData.std_year) return [];
    const year = parseInt(formData.std_year);
    const start = year * 2 - 1;
    const end = year * 2;
    return [
      { value: start.toString(), label: `Semester ${start}` },
      { value: end.toString(), label: `Semester ${end}` },
    ];
  };

  // Progress Steps Component
  const ProgressSteps = () => (
    <View style={styles.progressContainer}>
      <View style={styles.stepWrapper}>
        <LinearGradient
          colors={COLORS.primaryGradient}
          style={[styles.stepCircle, styles.stepActive]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}>
          <Text style={styles.stepCircleText}>1</Text>
        </LinearGradient>
        <Text style={[styles.stepLabel, styles.stepLabelActive]}>Personal</Text>
      </View>
      <View style={[styles.stepLine, { backgroundColor: COLORS.border }]} />
      <View style={styles.stepWrapper}>
        <View style={[styles.stepCircle, styles.stepInactive]}>
          <Text style={styles.stepCircleText}>2</Text>
        </View>
        <Text style={styles.stepLabel}>Business</Text>
      </View>
      <View style={[styles.stepLine, { backgroundColor: COLORS.border }]} />
      <View style={styles.stepWrapper}>
        <View style={[styles.stepCircle, styles.stepInactive]}>
          <Text style={styles.stepCircleText}>3</Text>
        </View>
        <Text style={styles.stepLabel}>Learning</Text>
      </View>
    </View>
  );

  // User Info Banner Component
  const UserInfoBanner = () => {
    if (!userProfile) return null;
    
    return (
      <LinearGradient
        colors={['#F0ECFF', '#FFFFFF']}
        style={styles.userBanner}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <View style={styles.userBannerContent}>
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.userBannerIcon}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}>
            <Icon name="person" size={24} color={COLORS.white} />
          </LinearGradient>
          <View style={styles.userBannerText}>
            <Text style={styles.userBannerName}>{userProfile.name || 'User'}</Text>
            <Text style={styles.userBannerInfo}>
              <Icon name="phone" size={12} color={COLORS.textLight} /> {userProfile.contact || 'N/A'} | 
              <Icon name="email" size={12} color={COLORS.textLight} /> {userProfile.email || 'N/A'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  const renderMenuSelect = (label, field, options, placeholder = 'Select an option', required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <Menu
        visible={showMenu[field]}
        onDismiss={() => setShowMenu(prev => ({ ...prev, [field]: false }))}
        anchor={
          <TouchableOpacity
            style={[styles.selectButton, errors[field] && styles.inputError]}
            onPress={() => setShowMenu(prev => ({ ...prev, [field]: true }))}
          >
            <Text style={formData[field] ? styles.selectText : styles.selectPlaceholder}>
              {options.find(opt => opt.value === formData[field])?.label || placeholder}
            </Text>
            <Icon name="arrow-drop-down" size={24} color={COLORS.textLight} />
          </TouchableOpacity>
        }
      >
        {options.map(option => (
          <Menu.Item
            key={option.value}
            onPress={() => handleSelectChange(field, option.value)}
            title={option.label}
          />
        ))}
      </Menu>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderRadioGroup = (label, field, options, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <RadioButton.Group
        onValueChange={(value) => handleInputChange(field, value)}
        value={formData[field]}
      >
        <View style={styles.radioGroup}>
          {options.map(option => (
            <View key={option.value} style={styles.radioOption}>
              <RadioButton value={option.value} color={COLORS.primary} />
              <Text style={styles.radioLabel}>{option.label}</Text>
            </View>
          ))}
        </View>
      </RadioButton.Group>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderFilePicker = (label, field, required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      {!files[field] && (
        <TouchableOpacity
          style={[styles.filePicker, errors[field] && styles.inputError]}
          onPress={() => handleFilePick(field)}
        >
          <Icon name="attach-file" size={24} color={COLORS.primary} />
          <Text style={styles.filePickerText}>Choose file</Text>
        </TouchableOpacity>
      )}
      
      {files[field] && (
        <View style={styles.filePreview}>
          <Icon name="insert-drive-file" size={20} color={COLORS.success} />
          <Text style={styles.fileName} numberOfLines={1}>
            {files[field].name}
          </Text>
          <TouchableOpacity onPress={() => removeFile(field)}>
            <Icon name="close" size={20} color={COLORS.error} />
          </TouchableOpacity>
        </View>
      )}
      
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  if (initialLoading) {
    return (
      <LinearGradient
        colors={['#F9FAFC', '#FFFFFF']}
        style={styles.loadingContainer}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your information...</Text>
      </LinearGradient>
    );
  }

  return (
    <PaperProvider>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView 
            style={styles.container} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Header with Gradient */}
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.header}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}>
              <View style={styles.headerContent}>
                <Icon name="business-center" size={32} color={COLORS.white} />
                <Text style={styles.headerTitle}>WBIC Application Form</Text>
                <Text style={styles.headerSubtitle}>Women Business Incubation Center</Text>
              </View>
            </LinearGradient>

            {/* Progress Steps */}
            <ProgressSteps />

            {/* User Info Banner - Shows SyncStorage data */}
            <UserInfoBanner />

            <View style={styles.content}>
              {/* Personal Details Section */}
              <LinearGradient
                colors={[COLORS.primarySoft, COLORS.white]}
                style={styles.sectionHeader}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                <Icon name="person-outline" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
              </LinearGradient>

              {/* Name - Pre-filled from SyncStorage */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Name of applicant <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.textLighter}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Parentage Row */}
              <View style={styles.row}>
                <View style={[styles.col, styles.col3]}>
                  {renderMenuSelect('Parentage', 'parentage_type', [
                    { value: 'do', label: 'd/o' },
                    { value: 'wo', label: 'w/o' },
                  ], 'Select', true)}
                </View>
                <View style={[styles.col, styles.col7]}>
                  {formData.parentage_type === 'do' && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Father's Name <Text style={styles.required}>*</Text></Text>
                      <TextInput
                        style={[styles.input, errors.father_name && styles.inputError]}
                        value={formData.father_name}
                        onChangeText={(text) => handleInputChange('father_name', text)}
                        placeholder="Enter father's name"
                        placeholderTextColor={COLORS.textLighter}
                      />
                      {errors.father_name && <Text style={styles.errorText}>{errors.father_name}</Text>}
                    </View>
                  )}
                  {formData.parentage_type === 'wo' && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Husband's Name <Text style={styles.required}>*</Text></Text>
                      <TextInput
                        style={[styles.input, errors.husband_name && styles.inputError]}
                        value={formData.husband_name}
                        onChangeText={(text) => handleInputChange('husband_name', text)}
                        placeholder="Enter husband's name"
                        placeholderTextColor={COLORS.textLighter}
                      />
                      {errors.husband_name && <Text style={styles.errorText}>{errors.husband_name}</Text>}
                    </View>
                  )}
                  {!formData.parentage_type && (
                    <View style={styles.disabledInput}>
                      <Text style={styles.disabledText}>Select parentage type first</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* CNIC and Contact - Pre-filled */}
              <View style={styles.row}>
                <View style={[styles.col, styles.col6]}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>CNIC No (without dashes) <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={[styles.input, styles.cnicInput, errors.cnic && styles.inputError]}
                      value={formData.cnic}
                      onChangeText={(text) => handleInputChange('cnic', text)}
                      placeholder="XXXXXXXXXXXXX"
                      placeholderTextColor={COLORS.textLighter}
                      keyboardType="numeric"
                      maxLength={13}
                      editable={!formData.cnic_readonly}
                    />
                    {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}
                  </View>
                </View>
                <View style={[styles.col, styles.col6]}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Contact Number <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={[styles.input, errors.contact_number && styles.inputError]}
                      value={formData.contact_number}
                      onChangeText={(text) => handleInputChange('contact_number', text)}
                      placeholder="03XXXXXXXXX"
                      placeholderTextColor={COLORS.textLighter}
                      keyboardType="phone-pad"
                      maxLength={11}
                    />
                    {errors.contact_number && <Text style={styles.errorText}>{errors.contact_number}</Text>}
                  </View>
                </View>
              </View>

              {/* Email, DOB, Age - Email Pre-filled */}
              <View style={styles.row}>
                <View style={[styles.col, styles.col6]}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email Address <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      value={formData.email}
                      onChangeText={(text) => handleInputChange('email', text)}
                      placeholder="Enter email address"
                      placeholderTextColor={COLORS.textLighter}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                  </View>
                </View>
                <View style={[styles.col, styles.col4]}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Date of Birth <Text style={styles.required}>*</Text></Text>
                    <TouchableOpacity
                      style={[styles.dateInput, errors.dob && styles.inputError]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={formData.dob ? styles.selectText : styles.selectPlaceholder}>
                        {formData.dob ? formData.dob.toLocaleDateString() : 'Select date'}
                      </Text>
                      <Icon name="calendar-today" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                    {showDatePicker && (
                      <DateTimePicker
                        value={formData.dob || new Date()}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                      />
                    )}
                    {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
                  </View>
                </View>
                <View style={[styles.col, styles.col2]}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                      style={[styles.input, styles.disabledInput]}
                      value={formData.age}
                      editable={false}
                      placeholder="Auto"
                      placeholderTextColor={COLORS.textLighter}
                    />
                  </View>
                </View>
              </View>

              {/* Addresses */}
              <View style={styles.row}>
                <View style={[styles.col, styles.col6]}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Current Residential Address <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={[styles.input, styles.textArea, errors.current_address && styles.inputError]}
                      value={formData.current_address}
                      onChangeText={(text) => handleInputChange('current_address', text)}
                      placeholder="Enter current address"
                      placeholderTextColor={COLORS.textLighter}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                    {errors.current_address && <Text style={styles.errorText}>{errors.current_address}</Text>}
                  </View>
                </View>
                <View style={[styles.col, styles.col6]}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Permanent Address <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      style={[styles.input, styles.textArea, errors.permanent_address && styles.inputError]}
                      value={formData.permanent_address}
                      onChangeText={(text) => handleInputChange('permanent_address', text)}
                      placeholder="Enter permanent address"
                      placeholderTextColor={COLORS.textLighter}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                    {errors.permanent_address && <Text style={styles.errorText}>{errors.permanent_address}</Text>}
                  </View>
                </View>
              </View>

              {/* Province and City */}
              <View style={styles.row}>
                <View style={[styles.col, styles.col6]}>
                  {renderMenuSelect('Province', 'province', [
                    { value: 'Punjab', label: 'Punjab' },
                    { value: 'Sindh', label: 'Sindh' },
                    { value: 'KPK', label: 'KPK' },
                    { value: 'Balochistan', label: 'Balochistan' },
                    { value: 'AJK', label: 'AJK' },
                    { value: 'GB', label: 'GB' },
                    { value: 'Other', label: 'Other' },
                  ], 'Select Province', true)}
                  {showOtherProvince && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Specify Province <Text style={styles.required}>*</Text></Text>
                      <TextInput
                        style={[styles.input, errors.other_province && styles.inputError]}
                        value={formData.other_province}
                        onChangeText={(text) => handleInputChange('other_province', text)}
                        placeholder="Enter province name"
                        placeholderTextColor={COLORS.textLighter}
                      />
                      {errors.other_province && <Text style={styles.errorText}>{errors.other_province}</Text>}
                    </View>
                  )}
                </View>
                <View style={[styles.col, styles.col6]}>
                  {showDistrictDropdown && renderMenuSelect('City (District)', 'district_id', 
                    districts.map(d => ({ value: d.id, label: d.dname })), 'Select District', true
                  )}
                  {showManualCity && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>City <Text style={styles.required}>*</Text></Text>
                      <TextInput
                        style={[styles.input, errors.city_manual && styles.inputError]}
                        value={formData.city_manual}
                        onChangeText={(text) => handleInputChange('city_manual', text)}
                        placeholder="Enter city name"
                        placeholderTextColor={COLORS.textLighter}
                      />
                      {errors.city_manual && <Text style={styles.errorText}>{errors.city_manual}</Text>}
                    </View>
                  )}
                </View>
              </View>

              {/* Application Type Section */}
              <LinearGradient
                colors={[COLORS.primarySoft, COLORS.white]}
                style={styles.sectionHeader}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                <Icon name="assignment-ind" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>APPLICATION TYPE</Text>
              </LinearGradient>
              
              {renderRadioGroup('Are you applying independently or via training service provider?', 'application_via', [
                { value: 'independent', label: 'Independently' },
                { value: 'tsp', label: 'Via Training Service Provider (TSP)' },
              ], true)}
              
              {showTSPName && (
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Mention TSP Name <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.input, errors.tsp_name && styles.inputError]}
                    value={formData.tsp_name}
                    onChangeText={(text) => handleInputChange('tsp_name', text)}
                    placeholder="Enter TSP Name"
                    placeholderTextColor={COLORS.textLighter}
                  />
                  {errors.tsp_name && <Text style={styles.errorText}>{errors.tsp_name}</Text>}
                </View>
              )}

              {/* Education Details Section */}
              <LinearGradient
                colors={[COLORS.primarySoft, COLORS.white]}
                style={styles.sectionHeader}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                <Icon name="school" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>EDUCATION DETAILS</Text>
              </LinearGradient>
              
              <View style={styles.row}>
                <View style={[styles.col, styles.col6]}>
                  {renderMenuSelect('Highest Educational', 'highest_qualification', [
                    { value: 'Matriculation', label: 'Matriculation' },
                    { value: 'Intermediate', label: 'Intermediate' },
                    { value: 'Bachelors', label: 'Bachelors' },
                    { value: 'Masters', label: 'Masters' },
                    { value: 'PhD', label: 'PhD' },
                    { value: 'Others', label: 'Others' },
                  ], 'Select', true)}
                  {showOtherQual && (
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Specify Qualification <Text style={styles.required}>*</Text></Text>
                      <TextInput
                        style={[styles.input, errors.other_qualification && styles.inputError]}
                        value={formData.other_qualification}
                        onChangeText={(text) => handleInputChange('other_qualification', text)}
                        placeholder="Enter qualification"
                        placeholderTextColor={COLORS.textLighter}
                      />
                      {errors.other_qualification && <Text style={styles.errorText}>{errors.other_qualification}</Text>}
                    </View>
                  )}
                </View>
                <View style={[styles.col, styles.col6]}>
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Do you have a laptop/PC for attending online sessions? <Text style={styles.required}>*</Text></Text>
                    <RadioButton.Group
                      onValueChange={(value) => handleInputChange('has_laptop', value)}
                      value={formData.has_laptop}
                    >
                      <View style={styles.radioGroup}>
                        <View style={styles.radioOption}>
                          <RadioButton value="1" color={COLORS.primary} />
                          <Text style={styles.radioLabel}>Yes</Text>
                        </View>
                        <View style={styles.radioOption}>
                          <RadioButton value="0" color={COLORS.primary} />
                          <Text style={styles.radioLabel}>No</Text>
                        </View>
                      </View>
                    </RadioButton.Group>
                    {errors.has_laptop && <Text style={styles.errorText}>{errors.has_laptop}</Text>}
                  </View>
                </View>
              </View>

              {/* Student Section */}
              <View style={styles.studentBox}>
                <View style={styles.studentHeader}>
                  <Text style={styles.studentTitle}>Are you currently a student? <Text style={styles.required}>*</Text></Text>
                  <RadioButton.Group
                    onValueChange={(value) => handleInputChange('is_student', value)}
                    value={formData.is_student}
                  >
                    <View style={styles.radioGroup}>
                      <View style={styles.radioOption}>
                        <RadioButton value="1" color={COLORS.success} />
                        <Text style={styles.radioLabel}>Yes</Text>
                      </View>
                      <View style={styles.radioOption}>
                        <RadioButton value="0" color={COLORS.error} />
                        <Text style={styles.radioLabel}>No</Text>
                      </View>
                    </View>
                  </RadioButton.Group>
                </View>
                {errors.is_student && <Text style={styles.errorText}>{errors.is_student}</Text>}

                {showStudentDetails && (
                  <View style={styles.studentDetails}>
                    <View style={styles.row}>
                      <View style={[styles.col, styles.col4]}>
                        {renderMenuSelect('Institute District', 'std_district_id', 
                          uniDistricts.map(d => ({ value: d.id, label: d.dname })), 'Select District', true
                        )}
                      </View>
                      <View style={[styles.col, styles.col4]}>
                        {renderMenuSelect('Institute Type', 'std_type', [
                          { value: 'public', label: 'Public' },
                          { value: 'private', label: 'Private' },
                        ], 'Select Type', true)}
                      </View>
                      <View style={[styles.col, styles.col4]}>
                        {renderMenuSelect('University/Institution', 'university_id', [
                          ...universities.map(u => ({ value: u.id, label: u.name })),
                          { value: 'others', label: 'Others (Not in list)' }
                        ], 'Loading universities...', true)}
                        {showOtherUniversity && (
                          <View style={styles.inputContainer}>
                            <Text style={styles.label}>Please mention your University name <Text style={styles.required}>*</Text></Text>
                            <TextInput
                              style={[styles.input, errors.other_university && styles.inputError]}
                              value={formData.other_university}
                              onChangeText={(text) => handleInputChange('other_university', text)}
                              placeholder="Enter university name"
                              placeholderTextColor={COLORS.textLighter}
                            />
                            {errors.other_university && <Text style={styles.errorText}>{errors.other_university}</Text>}
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.col, styles.col6]}>
                        {renderMenuSelect('Department', 'department_id', 
                          departments.map(d => ({ value: d.id, label: d.name })), 'Select Department', true
                        )}
                      </View>
                      <View style={[styles.col, styles.col3]}>
                        {renderMenuSelect('Year', 'std_year', [
                          { value: '1', label: 'Year 1' },
                          { value: '2', label: 'Year 2' },
                          { value: '3', label: 'Year 3' },
                          { value: '4', label: 'Year 4' },
                        ], 'Select Year', true)}
                      </View>
                      <View style={[styles.col, styles.col3]}>
                        {renderMenuSelect('Semester', 'std_semester', 
                          getSemesterOptions(), 'Select Semester', true
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* Attachments Section */}
              <LinearGradient
                colors={[COLORS.primarySoft, COLORS.white]}
                style={styles.sectionHeader}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}>
                <Icon name="attachment" size={16} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>ATTACHMENTS</Text>
              </LinearGradient>
              
              <View style={styles.attachmentInfo}>
                <Icon name="info" size={16} color={COLORS.primary} />
                <Text style={styles.attachmentInfoText}>
                  Accepted formats: JPG, PNG, PDF (Max size: 2MB each).
                </Text>
              </View>

              <View style={styles.row}>
                <View style={[styles.col, styles.col4]}>
                  {renderFilePicker('CNIC Front', 'cnic_front', true)}
                </View>
                <View style={[styles.col, styles.col4]}>
                  {renderFilePicker('CNIC Back', 'cnic_back', true)}
                </View>
                <View style={[styles.col, styles.col4]}>
                  {renderFilePicker('Business Reg. (Optional)', 'business_registration_file')}
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={COLORS.primaryGradient}
                  style={styles.submitGradient}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Continue to Next Step</Text>
                      <Icon name="arrow-forward" size={20} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -15,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  stepWrapper: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepActive: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  stepInactive: {
    backgroundColor: COLORS.stepInactive,
  },
  stepCircleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  stepLabel: {
    fontSize: 11,
    color: COLORS.textLighter,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  stepLine: {
    width: 50,
    height: 2,
    marginHorizontal: 8,
  },
  userBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  userBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userBannerText: {
    marginLeft: 12,
    flex: 1,
  },
  userBannerName: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  userBannerInfo: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: 'gray',
    marginBottom: 6,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  required: {
    color: COLORS.error,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 10,
    backgroundColor: COLORS.white,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 2,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 11,
    marginTop: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  col: {
    paddingHorizontal: 4,
  },
  col2: {
    flex: 0.16,
  },
  col3: {
    flex: 0.25,
  },
  col4: {
    flex: 0.33,
  },
  col6: {
    flex: 0.5,
  },
  col7: {
    flex: 0.58,
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  selectText: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  selectPlaceholder: {
    fontSize: 14,
    color: COLORS.textLighter,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  disabledInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    color: COLORS.textLighter,
  },
  disabledText: {
    fontSize: 14,
    color: COLORS.textLighter,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  cnicInput: {
    paddingRight: 40,
  },
  studentBox: {
    backgroundColor: COLORS.successLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  studentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  studentDetails: {
    marginTop: 12,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  attachmentInfoText: {
    fontSize: 10,
    color: COLORS.textLight,
    marginLeft: 8,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  filePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    backgroundColor: COLORS.white,
  },
  filePickerText: {
    fontSize: 10,
    color: COLORS.primary,
    marginLeft: 10,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default Step1Form;