import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Linking,
  ToastAndroid,
  KeyboardAvoidingView
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Loader from '../components/Loader';
import ProgramPopup from '../components/ProgramPopup';
import Women from '../../assets/images/women.png';
import axios from 'axios';
import syncStorage from 'react-native-sync-storage';
import AutoRegisterBadge from '../components/AutoRegisterBadge';


const FemaleAmbassadorRegistrationScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [errors, setErrors] = useState({});
  const [dob, setDob] = useState(new Date());
  const [signatureDate, setSignatureDate] = useState(new Date());
  const [districts, setDistricts] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [isFather, setIsFather] = useState(true);
  const [files, setFiles] = useState({
    cnic_front: null,
    cnic_back: null,
    student_card: null,
    recommendation_letter: null,
  });
  const [existingFiles, setExistingFiles] = useState({});
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [originalFormData, setOriginalFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isDropdownFocused, setIsDropdownFocused] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
 const [showPopup, setShowPopup] = useState(true);
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    full_name: '',
    relation: 'father',
    father_husband_name: '',
    cnic_bform: '',
    dob: '',
    present_district_id: '',
    contact_number: '',
    email: '',
    present_address: '',
    permanent_address: '',

    // Step 2: Educational Details
    district_id: '',
    university_type: '',
    university_id: '',
    education_level: '',
    department_program: '',
    academic_year: '',
    current_semester: '',
    student_id: '',

    // Step 3: Interests & Commitment
    motivation: '',
    past_involvement: '',
    social_media_platforms: [],
    followers_instagram: '',
    followers_facebook: '',
    followers_twitter: '',
    followers_linkedin: '',
    followers_youtube: '',
    followers_whatsapp: '',
    followers_tiktok: '',
    followers_snapchat: '',
    followers_pinterest: '',
    followers_telegram: '',
    social_media_platforms_active: '',
    follower_countactive: '',
    organize_events: '',
    hours_per_week: '',
    attend_training: '',
    commitment_duration: '',
    voluntary_participation: false,
    media_consent: false,
    signature_date: '',
  });

  // Check if form has been modified
  useEffect(() => {
    const checkForChanges = () => {
      for (const key in formData) {
        if (formData[key] !== originalFormData[key]) {
          if (Array.isArray(formData[key]) && Array.isArray(originalFormData[key])) {
            if (JSON.stringify(formData[key]) !== JSON.stringify(originalFormData[key])) {
              return true;
            }
          } else if (formData[key] !== originalFormData[key]) {
            return true;
          }
        }
      }
      
      for (const key in files) {
        if (files[key] !== null) {
          return true;
        }
      }
      
      return false;
    };

    setHasChanges(checkForChanges());
  }, [formData, files, originalFormData]);

  // Update character count when motivation changes
  useEffect(() => {
    setCharacterCount(formData.motivation.length);
  }, [formData.motivation]);

  // Fetch districts data
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get('https://fa-wdd.punjab.gov.pk/api/districts');
        setDistricts(response.data);
      } catch (error) {
        console.error('Error fetching districts:', error);
        Alert.alert('Error', 'Failed to load districts');
      }
    };

    fetchDistricts();
  }, []);

  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  
  // Check for existing data on component mount
  useEffect(() => { 
    const checkExistingData = async () => {
      try {
        setCheckingExisting(true);
        
        const userProfile = syncStorage.get('user_profile');
        if (userProfile) {
          const userData = JSON.parse(userProfile);

          const initialFormData = {
            full_name: userData.name || '',
            cnic_bform: userData.cnic || '',
            dob: userData.dob || '',
            contact_number: userData.contact || '',
            email: userData.email || '',
            present_address: userData.address || '',
          };
          setFormData(prev => ({ ...prev, ...initialFormData }));

          if (userData.cnic) {
            try {
              const response = await axios.get(
                'https://fa-wdd.punjab.gov.pk/api/ambassador',
                {
                  params: { cnic_bform: userData.cnic },
                  headers: { 'Accept': 'application/json' },
                  timeout: 15000,
                }
              );

              if (response.data.status && response.data.data) {
                const ambassadorData = response.data.data;

                const originalData = {
                  full_name: ambassadorData.full_name || userData.name || '',
                  father_husband_name: ambassadorData.father_name || '',
                  cnic_bform: ambassadorData.cnic_bform || userData.cnic || '',
                  dob: ambassadorData.dob || userData.dob || '',
                  contact_number: ambassadorData.contact_number || userData.contact || '',
                  email: ambassadorData.email || userData.email || '',
                  present_district_id: ambassadorData.present_district_id || userData.district || '',
                  present_address: ambassadorData.present_address || userData.address  ||'',
                  permanent_address: ambassadorData.permanent_address || '',
                  district_id: ambassadorData.district_id || '',
                  university_type: ambassadorData.university_type || '',
                  university_id: ambassadorData.university_id || '',
                  department_program: ambassadorData.department_program || '',
                  education_level: ambassadorData.education_level || '',
                  academic_year: ambassadorData.academic_year || '',
                  current_semester: ambassadorData.current_semester || '',
                  student_id: ambassadorData.student_id || '',
                  motivation: ambassadorData.motivation || '',
                  past_involvement: ambassadorData.past_involvement || '',
                  social_media_platforms: ambassadorData.social_media_platforms ? 
                    (typeof ambassadorData.social_media_platforms === 'string' ? 
                     JSON.parse(ambassadorData.social_media_platforms) : 
                     ambassadorData.social_media_platforms) : [],
                  social_media_platforms_active: ambassadorData.social_media_platforms_active || '',
                  follower_countactive: ambassadorData.follower_count ? ambassadorData.follower_count.toString() : '',
                  organize_events: ambassadorData.organize_events || '',
                  hours_per_week: ambassadorData.hours_per_week ? ambassadorData.hours_per_week.toString() : '',
                  attend_training: ambassadorData.attend_training || '',
                  commitment_duration: ambassadorData.commitment_duration || '',
                  voluntary_participation: ambassadorData.voluntary_participation === 1 || ambassadorData.voluntary_participation === true,
                  media_consent: ambassadorData.media_consent === 1 || ambassadorData.media_consent === true,
                  signature_date: ambassadorData.signature_date || '',
                };

                setOriginalFormData(originalData);
                setFormData(prev => ({ ...prev, ...originalData }));
                
                // Store the actual university object for dropdown display
                if (ambassadorData.university_id) {
                  try {
                    const uniResponse = await axios.get(
                      `https://fa-wdd.punjab.gov.pk/api/universities?district_id=${ambassadorData.district_id}&type=${ambassadorData.university_type}`
                    );
                    
                    if (uniResponse.data && Array.isArray(uniResponse.data)) {
                      const foundUni = uniResponse.data.find(uni => uni.id === ambassadorData.university_id);
                      if (foundUni) {
                        setSelectedUniversity({
                          label: `${foundUni.name} | ${foundUni.type === 'public' ? 'سرکاری' : 'نجی'}`,
                          value: foundUni.id
                        });
                      }
                    }
                  } catch (uniError) {
                    console.log('Error fetching university details:', uniError);
                  }
                }
                
                // Store the actual department object for dropdown display
                if (ambassadorData.department_program) {
                  try {
                    const deptResponse = await axios.get('https://fa-wdd.punjab.gov.pk/api/departments');
                    if (deptResponse.data && Array.isArray(deptResponse.data)) {
                      const foundDept = deptResponse.data.find(dept => dept.id === ambassadorData.department_program);
                      if (foundDept) {
                        setSelectedDepartment({
                          label: foundDept.department_name,
                          value: foundDept.id
                        });
                      }
                    }
                  } catch (deptError) {
                    console.log('Error fetching department details:', deptError);
                  }
                }
                
                setExistingFiles({
                  cnic_front: ambassadorData.cnic_front_url || 
                    (ambassadorData.cnic_front ? `https://fa-wdd.punjab.gov.pk/${ambassadorData.cnic_front}` : null),
                  cnic_back: ambassadorData.cnic_back_url || 
                    (ambassadorData.cnic_back ? `https://fa-wdd.punjab.gov.pk/${ambassadorData.cnic_back}` : null),
                  student_card: ambassadorData.student_card_url || 
                    (ambassadorData.student_card ? `https://fa-wdd.punjab.gov.pk/${ambassadorData.student_card}` : null),
                  recommendation_letter: ambassadorData.recommendation_letters_url || 
                    (ambassadorData.recommendation_letter ? `https://fa-wdd.punjab.gov.pk/${ambassadorData.recommendation_letter}` : null),
                });
                
                setIsUpdateMode(true);
                Alert.alert('Success', 'Existing registration data loaded. You can update your information.');
              }
            } catch (error) {
              if (error.response && error.response.status === 404) {
                console.log('No existing ambassador data found for this CNIC');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error checking existing data:', error);
      } finally {
        setCheckingExisting(false);
      }
    };

    checkExistingData();
  }, []);

  const [loadingUniversities, setLoadingUniversities] = useState(false);

  useEffect(() => {
    const fetchUniversities = async () => {
      if (formData.district_id && formData.university_type) {
        setLoadingUniversities(true);
        try {
          const response = await axios.get(
            `https://fa-wdd.punjab.gov.pk/api/universities?district_id=${formData.district_id}&type=${formData.university_type}`,
            { timeout: 10000 }
          );
          
          let universitiesData = [];
          
          if (response.data && response.data.status === 'empty') {
            universitiesData = response.data.data || [];
          } else if (response.data && response.data.status === 'success') {
            universitiesData = (response.data.data || []).map(uni => ({
              label: `${uni.name} | ${uni.type === 'public' ? 'سرکاری' : 'نجی'}`,
              value: uni.id,
              disabled: false
            }));
          } else if (Array.isArray(response.data)) {
            universitiesData = response.data.map(uni => ({
              label: `${uni.name} | ${uni.type === 'public' ? 'سرکاری' : 'نجی'}`,
              value: uni.id,
              disabled: false
            }));
          } else {
            universitiesData = response.data || [];
          }
          
          if (universitiesData.length === 0) {
            universitiesData = [{ 
              label: 'No universities found | کوئی یونیورسٹی نہیں ملی', 
              value: '', 
              disabled: true 
            }];
          }
          
          setUniversities(universitiesData);
          
        } catch (error) {
          console.error('Error fetching universities:', error);
          setUniversities([{ 
            label: 'Error loading universities | یونیورسٹیز لوڈ کرنے میں خرابی', 
            value: '', 
            disabled: true 
          }]);
        } finally {
          setLoadingUniversities(false);
        }
      } else {
        setUniversities([]);
        setLoadingUniversities(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchUniversities();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [formData.district_id, formData.university_type]);

  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get('https://fa-wdd.punjab.gov.pk/api/departments');
        setDepartments(response.data);
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  // Generate semesters based on academic year
 useEffect(() => {
  if (formData.academic_year) {
    const year = parseInt(formData.academic_year, 10); // ensure number
    const start = (year - 1) * 2 + 1;
    const end = year * 2;

    const semesterOptions = [];
    for (let i = start; i <= end; i++) {
      semesterOptions.push({
        label: `Semester ${i} | سمسٹر ${i}`,
        value: i.toString(),
      });
    }

    setSemesters(semesterOptions);
  } else {
    setSemesters([]); // clear when no year selected
  }
}, [formData.academic_year]);


  const getFilteredSemesters = (yearLevel) => {
    const allSemesters = [
      { label: 'Select Semester | سمسٹر منتخب کریں', value: '' },
      { label: 'Semester 1', value: '1' },
      { label: 'Semester 2', value: '2' },
      { label: 'Semester 3', value: '3' },
      { label: 'Semester 4', value: '4' },
      { label: 'Semester 5', value: '5' },
      { label: 'Semester 6', value: '6' },
      { label: 'Semester 7', value: '7' },
      { label: 'Semester 8', value: '8' },
    ];
    
    if (!yearLevel) return allSemesters;
    
    const year = parseInt(yearLevel);
    let allowedSemesters = [];
    
    switch(year) {
      case 1:
        allowedSemesters = ['1', '2'];
        break;
      case 2:
        allowedSemesters = ['3', '4'];
        break;
      case 3:
        allowedSemesters = ['3', '4','5', '6'];
        break;
      case 4:
        allowedSemesters = ['5', '6','7', '8'];
        break;
         case 5:
        allowedSemesters = ['3', '4','5', '6','7', '8'];
        break;
      default:
        allowedSemesters = [];
    }
    
    return allSemesters.filter(sem => 
      sem.value === '' || allowedSemesters.includes(sem.value)
    );
  };
const isFiveYearProgram = (program) => {
  const fiveYearPrograms = [
    'B.A. LL.B (Integrated Law)',
    'B.A. LL.B (Hons)',
    'Pharm-D (Doctor of Pharmacy)',
    'B.Arch (Bachelor of Architecture)',
    'Doctor of Physiotherapy',
    'MBBS',
    'DVM (Doctor of Veterinary Medicine)'
  ];
  return fiveYearPrograms.includes(program);
};

  // Handle input change
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }

    if (name === 'relation') {
      setIsFather(value === 'father');
    }
  };

  // Handle checkbox change for social media platforms
  const handleSocialMediaChange = (platform) => {
    setFormData(prev => {
      const currentPlatforms = prev.social_media_platforms || [];
      const updatedPlatforms = currentPlatforms.includes(platform)
        ? currentPlatforms.filter(p => p !== platform)
        : [...currentPlatforms, platform];
      
      return {
        ...prev,
        social_media_platforms: updatedPlatforms
      };
    });
  };

  // Handle file changes
  const handleFileChange = (type, file) => {
    setFiles(prev => ({ ...prev, [type]: file }));

    if (errors[`attachment_${type}`]) {
      setErrors(prev => ({
        ...prev,
        [`attachment_${type}`]: null,
      }));
    }
  };

  // Handle file updates
  const handleFileUpdate = async (type) => {
    Alert.alert(
      'Update File',
      'Would you like to update this file?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Update',
          onPress: () => {
            setExistingFiles(prev => ({ ...prev, [type]: null }));
          }
        }
      ]
    );
  };

  // Show toast message
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Info', message);
    }
  };

  // Validate form step
  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.full_name.trim()) {
        newErrors.full_name = 'Full Name is required';
        isValid = false;
      }

      if (!formData.father_husband_name.trim()) {
        newErrors.father_husband_name = 'Father/Husband Name is required';
        isValid = false;
      }

      if (!formData.cnic_bform.trim()) {
        newErrors.cnic_bform = 'CNIC/B-Form is required';
        isValid = false;
      } else if (!/^\d{13,15}$/.test(formData.cnic_bform)) {
        newErrors.cnic_bform = 'Must be 13-15 digits';
        isValid = false;
      } else {
        const lastDigit = parseInt(formData.cnic_bform.slice(-1));
        if (lastDigit % 2 !== 0) {
          newErrors.cnic_bform = 'Last digit must be even';
          isValid = false;
        }
      }

      if (!formData.dob) {
        newErrors.dob = 'Date of Birth is required';
        isValid = false;
      }

      if (!formData.present_district_id) {
        newErrors.present_district_id = 'Present District is required';
        isValid = false;
      }

      if (!formData.contact_number.trim()) {
        newErrors.contact_number = 'Contact Number is required';
        isValid = false;
      } else if (!/^03\d{9}$/.test(formData.contact_number)) {
        newErrors.contact_number = 'Must be in format 03001234567';
        isValid = false;
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
        isValid = false;
      }

      if (!formData.present_address.trim()) {
        newErrors.present_address = 'Present Address is required';
        isValid = false;
      }

      if (!formData.permanent_address.trim()) {
        newErrors.permanent_address = 'Permanent Address is required';
        isValid = false;
      }

    } else if (step === 2) {
      if (!formData.district_id) {
        newErrors.district_id = 'University District is required';
        isValid = false;
      }

      if (!formData.university_type) {
        newErrors.university_type = 'University Type is required';
        isValid = false;
      }

      if (!formData.university_id) {
        newErrors.university_id = 'University Name is required';
        isValid = false;
      }

      if (!formData.education_level) {
        newErrors.education_level = 'Education Level is required';
        isValid = false;
      }

      if (!formData.department_program) {
        newErrors.department_program = 'Department & Program is required';
        isValid = false;
      }

      if (!formData.academic_year) {
        newErrors.academic_year = 'Academic Year is required';
        isValid = false;
      }

      if (formData.academic_year && !formData.current_semester) {
        newErrors.current_semester = 'Current Semester is required';
        isValid = false;
      }

      if (!formData.student_id.trim()) {
        newErrors.student_id = 'Student ID is required';
        isValid = false;
      }

      if (!files.cnic_front && !existingFiles.cnic_front) {
        newErrors.attachment_cnic_front = 'CNIC Front is required';
        isValid = false;
      }

      if (!files.cnic_back && !existingFiles.cnic_back) {
        newErrors.attachment_cnic_back = 'CNIC Back is required';
        isValid = false;
      }
        if (!files.recommendation_letter && !existingFiles.recommendation_letter) {
        newErrors.attachment_recommendation_letter = 'Recommendation Letter is required';
        isValid = false;
      }

      if (!files.student_card && !existingFiles.student_card) {
        newErrors.attachment_student_card = 'Student ID Card is required';
        isValid = false;
      }

    } else if (step === 3) {
      if (!formData.motivation.trim()) {
        newErrors.motivation = 'Motivation is required';
        isValid = false;
      } else if (formData.motivation.length < 50) {
        newErrors.motivation = 'Please provide more details (minimum 50 characters)';
        isValid = false;
      }

      if (!formData.organize_events) {
        newErrors.organize_events = 'Please specify willingness to organize events';
        isValid = false;
      }

      if (!formData.hours_per_week) {
        newErrors.hours_per_week = 'Hours per week is required';
        isValid = false;
      } else if (parseInt(formData.hours_per_week) < 1) {
        newErrors.hours_per_week = 'Must be at least 1 hour';
        isValid = false;
      }

      if (!formData.attend_training) {
        newErrors.attend_training = 'Please specify willingness to attend training';
        isValid = false;
      }

      if (!formData.commitment_duration.trim()) {
        newErrors.commitment_duration = 'Commitment duration is required';
        isValid = false;
      }

      if (!formData.voluntary_participation) {
        newErrors.voluntary_participation = 'You must agree to voluntary participation';
        isValid = false;
      }

      if (!formData.media_consent) {
        newErrors.media_consent = 'You must consent to media coverage';
        isValid = false;
      }

      if (!formData.signature_date) {
        newErrors.signature_date = 'Signature date is required';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      showToast('Please fix all errors before proceeding');
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle date picker
  const showDatepicker = (type) => {
    const currentDate = type === 'dob' ? 
      (formData.dob ? new Date(formData.dob) : new Date()) : 
      (formData.signature_date ? new Date(formData.signature_date) : new Date());
    
    DateTimePickerAndroid.open({
      value: currentDate,
      onChange: (event, selectedDate) => {
        if (event.type === 'set') {
          const currentDate = selectedDate || (type === 'dob' ? new Date(formData.dob) : new Date(formData.signature_date));
          if (type === 'dob') {
            setDob(currentDate);
            handleChange('dob', currentDate.toISOString().split('T')[0]);
          } else {
            setSignatureDate(currentDate);
            handleChange('signature_date', currentDate.toISOString().split('T')[0]);
          }
        }
      },
      mode: 'date',
      is24Hour: true,
    });
  };

  // Handle file pick
  const pickDocument = async (type) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });

      if (res.size > 5 * 1024 * 1024) {
        Alert.alert('Error', 'File size must be less than 5MB');
        return;
      }

      handleFileChange(type, res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Error picking file');
      }
    }
  };

  // Handle image capture/selection
  const captureImage = async (type) => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Error', 'Camera permission denied');
          return;
        }
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 2000,
        maxHeight: 2000,
        includeBase64: false,
      };

      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          {
            text: 'Camera',
            onPress: async () => {
              try {
                const response = await launchCamera(options);
                handleImageResponse(response, type);
              } catch (error) {
                console.error('Camera Error:', error);
                Alert.alert('Error', 'Failed to open camera');
              }
            }
          },
          {
            text: 'Gallery',
            onPress: async () => {
              try {
                const response = await launchImageLibrary(options);
                handleImageResponse(response, type);
              } catch (error) {
                console.error('Gallery Error:', error);
                Alert.alert('Error', 'Failed to open gallery');
              }
            }
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Image Capture Error:', error);
      Alert.alert('Error', 'Error accessing media');
    }
  };

  const handleImageResponse = (response, type) => {
    if (response.didCancel) return;
    
    if (response.errorCode) {
      Alert.alert('Error', `Error: ${response.errorMessage}`);
      return;
    }
    
    if (response.assets?.[0]) {
      const asset = response.assets[0];
      const file = {
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.type || 'image/jpeg',
        uri: asset.uri,
        size: asset.fileSize,
      };

      handleFileChange(type, file);
    }
  };

  // View existing file
  const viewExistingFile = (url, type) => {
    if (url) {
      Alert.alert(
        'View File',
        `Would you like to view the existing ${type} file?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'View',
            onPress: () => {
              Linking.openURL(url).catch(err => {
                Alert.alert('Error', 'Could not open file');
              });
            }
          }
        ]
      );
    }
  };

  // API Integration - Submit/Update form data
  const handleSubmit = async () => {
    if (validateStep(3)) {
      setLoading(true);
      
      try {
        const submissionData = {
          full_name: formData.full_name,
          father_name: formData.father_husband_name,
          cnic_bform: formData.cnic_bform,
          dob: formData.dob,
          contact_number: formData.contact_number,
          email: formData.email,
          present_address: formData.present_address,
          permanent_address: formData.permanent_address,
          present_district_id: formData.present_district_id,
          district_id: formData.district_id,
          university_type: formData.university_type,
          relation: formData.relation,
          university_id: formData.university_id,
          education_level: formData.education_level,
          academic_year: formData.academic_year,
          department_program: formData.department_program,
          current_semester: formData.current_semester,
          student_id: formData.student_id,
          motivation: formData.motivation,
          past_involvement: formData.past_involvement || '',
          social_media_platforms: formData.social_media_platforms,
          followers_instagram: formData.followers_instagram || 0,
          followers_facebook: formData.followers_facebook || 0,
          followers_twitter: formData.followers_twitter || 0,
          followers_linkedin: formData.followers_linkedin || 0,
          followers_youtube: formData.followers_youtube || 0,
          followers_whatsapp: formData.followers_whatsapp || 0,
          followers_tiktok: formData.followers_tiktok || 0,
          followers_snapchat: formData.followers_snapchat || 0,
          followers_pinterest: formData.followers_pinterest || 0,
          followers_telegram: formData.followers_telegram || 0,
          social_media_platforms_active: formData.social_media_platforms_active,
          organize_events: formData.organize_events,
          hours_per_week: parseInt(formData.hours_per_week),
          attend_training: formData.attend_training,
          commitment_duration: formData.commitment_duration,
          voluntary_participation: formData.voluntary_participation ? 1 : 0,
          media_consent: formData.media_consent ? 1 : 0,
          signature_date: formData.signature_date,
          source: 'app',
        };
        
        const formDataToSend = new FormData();
        
        Object.keys(submissionData).forEach(key => {
          if (key === 'social_media_platforms') {
            formDataToSend.append(key, JSON.stringify(submissionData[key]));
          } else {
            formDataToSend.append(key, submissionData[key]);
          }
        });
        
        if (files.cnic_front || !existingFiles.cnic_front) {
          if (files.cnic_front) {
            formDataToSend.append('cnic_front', {
              uri: files.cnic_front.uri,
              type: files.cnic_front.type || 'image/jpeg',
              name: files.cnic_front.name || 'cnic_front.jpg'
            });
          }
        }

        if (files.cnic_back || !existingFiles.cnic_back) {
          if (files.cnic_back) {
            formDataToSend.append('cnic_back', {
              uri: files.cnic_back.uri,
              type: files.cnic_back.type || 'image/jpeg',
              name: files.cnic_back.name || 'cnic_back.jpg'
            });
          }
        }

        if (files.student_card || !existingFiles.student_card) {
          if (files.student_card) {
            formDataToSend.append('student_card', {
              uri: files.student_card.uri,
              type: files.student_card.type || 'image/jpeg',
              name: files.student_card.name || 'student_card.jpg'
            });
          }
        }
        
        if (files.recommendation_letter || !existingFiles.recommendation_letter) {
          if (files.recommendation_letter) {
            formDataToSend.append('recommendation_letter', {
              uri: files.recommendation_letter.uri,
              type: files.recommendation_letter.type || 'image/jpeg',
              name: files.recommendation_letter.name || 'recommendation_letter.jpg'
            });
          }
        }
        
        const response = await axios.post(
          'https://fa-wdd.punjab.gov.pk/api/womenambassadorregistrationupdate',
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Accept': 'application/json',
            },
            timeout: 30000,
          }
        );
        
        Alert.alert('Success', response.data.message || (isUpdateMode ? 'Registration updated successfully!' : 'Registration submitted successfully!'));
        
        setIsUpdateMode(false);
        setOriginalFormData({...formData});
        setFiles({
          cnic_front: null,
          cnic_back: null,
          student_card: null,
          recommendation_letter: null,
        });
        
        navigation.goBack();
        
      } catch (error) {
        console.error('API Error details:', error);
        
        if (error.response) {
          if (error.response.status === 422) {
            const backendErrors = {};
            Object.keys(error.response.data.errors).forEach(key => {
              backendErrors[key] = error.response.data.errors[key][0];
            });
            
            setErrors(backendErrors);
            Alert.alert('Error', 'Please fix the validation errors');
          } else {
            Alert.alert('Error', error.response.data.message || `Server error: ${error.response.status}`);
          }
        } else if (error.request) {
          Alert.alert('Error', 'Network error. Please check your connection. ' + error.message);
        } else {
          Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    } else {
      showToast('Please fix all errors before submitting');
    }
  };

  // Render step progress bar
  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.step, currentStep >= 1 && styles.activeStep]}>
          <View style={[styles.stepCircle, currentStep >= 1 && styles.activeStepCircle]}>
            <Text style={[styles.stepNumber, currentStep >= 1 && styles.activeStepNumber]}>1</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 1 && styles.activeStepLabel]}>
            Personal Info
            <Text style={styles.urduStepLabel}>ذاتی معلومات</Text>
          </Text>
        </View>
        
        <View style={styles.stepConnector}></View>
        
        <View style={[styles.step, currentStep >= 2 && styles.activeStep]}>
          <View style={[styles.stepCircle, currentStep >= 2 && styles.activeStepCircle]}>
            <Text style={[styles.stepNumber, currentStep >= 2 && styles.activeStepNumber]}>2</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 2 && styles.activeStepLabel]}>
            Educational Details
            <Text style={styles.urduStepLabel}>تعلیمی تفصیلات</Text>
          </Text>
        </View>
        
        <View style={styles.stepConnector}></View>
        
        <View style={[styles.step, currentStep >= 3 && styles.activeStep]}>
          <View style={[styles.stepCircle, currentStep >= 3 && styles.activeStepCircle]}>
            <Text style={[styles.stepNumber, currentStep >= 3 && styles.activeStepNumber]}>3</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 3 && styles.activeStepLabel]}>
            Interests & Commitments
            <Text style={styles.urduStepLabel}>دلچسپی اور عزم</Text>
          </Text>
        </View>
      </View>
    );
  };

  // Render update button that appears on each screen when changes are made
  const renderUpdateButton = () => {
    if (isUpdateMode && hasChanges) {
      return (
       <TouchableOpacity 
              style={styles.floatingUpdateButton}
              onPress={handleSubmit}
            >
              <Icon name="save" size={20} color="#7C2B5E" />
              <Text style={styles.floatingUpdateButtonText}>Update</Text>
            </TouchableOpacity>
      );
    }
    return null;
  };

  // Show loading while checking for existing data
  if (checkingExisting) {
    return (
      <ImageBackground 
        source={{uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <Loader/>
          <Text style={styles.loadingText}>Loading your information...</Text>
        </View>
      </ImageBackground>
    );
  }

  // Required field indicator component
  const RequiredField = () => <Text style={styles.requiredIndicator}> *</Text>;

  // Render step 1 - Personal Information
  const renderStep1 = () => {
    return (
      <View style={styles.formStep}>
        <Text style={styles.sectionTitle}>
          1. Personal Information
          <Text style={styles.urduTitle}>ذاتی معلومات</Text>
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Full Name <Text style={styles.urduLabel}>مکمل نام</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.full_name && styles.inputError]}
            placeholder="Enter Full Name | مکمل نام درج کریں"
            value={formData.full_name}
            onChangeText={(text) => handleChange('full_name', text)}
          />
          {errors.full_name && <Text style={styles.errorText}>{errors.full_name}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Relation</Text>
          <View style={styles.checkboxRow}>
            <TouchableOpacity
              style={[styles.checkbox, isFather && styles.checked]}
              onPress={() => {
                handleChange('relation', 'father');
                setIsFather(true);
              }}
            >
              {isFather && <Icon name="check" size={14} color="white" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Father | والد</Text>
            
            <TouchableOpacity
              style={[styles.checkbox, !isFather && styles.checked]}
              onPress={() => {
                handleChange('relation', 'husband');
                setIsFather(false);
              }}
            >
              {!isFather && <Icon name="check" size={14} color="white" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Husband | شوہر</Text>
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {isFather ? "Father's Name" : "Husband's Name"}
            <Text style={styles.urduLabel}>{isFather ? "والد کا نام" : "شوہر کا نام"}</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.father_husband_name && styles.inputError]}
            placeholder={isFather ? "Enter Father's Name | والد کا نام درج کریں" : "Enter Husband's Name | شوہر کا نام درج کریں"}
            value={formData.father_husband_name}
            onChangeText={(text) => handleChange('father_husband_name', text)}
          />
          {errors.father_husband_name && <Text style={styles.errorText}>{errors.father_husband_name}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            CNIC/B-Form Number (Last digit must be even)
            <Text style={styles.urduLabel}>شناختی کارڈ/بی فارم نمبر (آخری ہندسہ جفت ہونا چاہیے)</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.cnic_bform && styles.inputError]}
            placeholder="Enter CNIC/B-Form (13-15 digits) | شناختی کارڈ/بی فارم درج کریں"
            value={formData.cnic_bform}
            onChangeText={(text) => handleChange('cnic_bform', text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={15}
          />
          {errors.cnic_bform && <Text style={styles.errorText}>{errors.cnic_bform}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Date of Birth <Text style={styles.urduLabel}>تاریخ پیدائش</Text>
            <RequiredField />
          </Text>
          <TouchableOpacity 
            style={[styles.input, errors.dob && styles.inputError]}
            onPress={() => showDatepicker('dob')}
          >
            <Text>{formData.dob || 'Select Date | تاریخ منتخب کریں'}</Text>
          </TouchableOpacity>
          {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Present District <Text style={styles.urduLabel}>موجودہ ضلع</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.present_district_id && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={districts.map(d => ({ label: d.name, value: d.id }))}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select District | ضلع منتخب کریں"
            value={formData.present_district_id}
            onChange={item => handleChange('present_district_id', item.value)}
          />
          {errors.present_district_id && <Text style={styles.errorText}>{errors.present_district_id}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Contact Number (Mobile & WhatsApp)
            <Text style={styles.urduLabel}>رابطہ نمبر (موبائل اور واٹس ایپ)</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.contact_number && styles.inputError]}
            placeholder="e.g., 03001234567 | مثال کے طور پر، 03001234567"
            value={formData.contact_number}
            onChangeText={(text) => handleChange('contact_number', text.replace(/[^0-9]/g, ''))}
            keyboardType="phone-pad"
            maxLength={11}
          />
          {errors.contact_number && <Text style={styles.errorText}>{errors.contact_number}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Email Address <Text style={styles.urduLabel}>ای میل ایڈریس</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Enter Email Address | ای میل ایڈریس درج کریں"
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Present Address <Text style={styles.urduLabel}>موجودہ پتہ</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.present_address && styles.inputError]}
            placeholder="Enter Present Address | موجودہ پتہ درج کریں"
            value={formData.present_address}
            onChangeText={(text) => handleChange('present_address', text)}
          />
          {errors.present_address && <Text style={styles.errorText}>{errors.present_address}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Permanent Address <Text style={styles.urduLabel}>مستقل پتہ</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.permanent_address && styles.inputError]}
            placeholder="Enter Permanent Address | مستقل پتہ درج کریں"
            value={formData.permanent_address}
            onChangeText={(text) => handleChange('permanent_address', text)}
          />
          {errors.permanent_address && <Text style={styles.errorText}>{errors.permanent_address}</Text>}
        </View>
        
        <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render step 2 - Educational Details
  const renderStep2 = () => {
    return (
      <View style={styles.formStep}>
        <Text style={styles.sectionTitle}>
          2. Educational Details
          <Text style={styles.urduTitle}>تعلیمی تفصیلات</Text>
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            University District <Text style={styles.urduLabel}>ضلع</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.district_id && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={districts.map(d => ({ label: d.name, value: d.id }))}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select District | ضلع منتخب کریں"
            value={formData.district_id}
            onChange={item => handleChange('district_id', item.value)}
          />
          {errors.district_id && <Text style={styles.errorText}>{errors.district_id}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            University Type <Text style={styles.urduLabel}>یونیورسٹی کی قسم</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.university_type && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={[
              { label: 'Select Type | قسم منتخب کریں', value: '' },
              { label: 'Government | سرکاری', value: 'public' },
              { label: 'Private | نجی', value: 'private' },
            ]}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Type"
            value={formData.university_type}
            onChange={item => handleChange('university_type', item.value)}
          />
          {errors.university_type && <Text style={styles.errorText}>{errors.university_type}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            University Name <Text style={styles.urduLabel}>یونیورسٹی کا نام</Text>
            <RequiredField />
          </Text>
          
          {loadingUniversities ? (
            <View style={[styles.dropdown, styles.loadingDropdown]}>
              <ActivityIndicator size="small" color="#7C2B5E" />
              <Text style={styles.loadingDropdownText}>Loading universities...</Text>
            </View>
          ) : (
            <Dropdown
              style={[styles.dropdown, errors.university_id && styles.inputError, 
                     universities.length === 1 && universities[0]?.disabled && styles.disabledDropdown]}
              placeholderStyle={[styles.placeholderStyle, {color: '#212121'}]}
              selectedTextStyle={[styles.selectedTextStyle, {color: '#212121'}]}
              itemTextStyle={{color: '#212121'}}
              data={universities}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select University | یونیورسٹی منتخب کریں"
              value={formData.university_id}
              onChange={item => {
                if (!item.disabled && item.value) {
                  handleChange('university_id', item.value);
                  setSelectedUniversity(item);
                }
              }}
              disable={universities.some(u => u.disabled)}
              renderItem={(item, selected) => (
                <View style={[
                  styles.item, 
                  item.disabled && styles.disabledItem
                ]}>
                  <Text style={[
                    styles.textItem,
                    item.disabled && styles.disabledText,
                    selected && styles.selectedTextItem
                  ]}>
                    {item.label}
                  </Text>
                  {item.disabled && (
                    <Icon name="info-circle" size={16} color="#999" style={styles.infoIcon} />
                  )}
                </View>
              )}
            />
          )}
          
          {selectedUniversity && (
            <Text style={styles.selectedValueText}>
              Selected: {selectedUniversity.label}
            </Text>
          )}
          
          {!loadingUniversities && universities.length === 1 && universities[0]?.disabled && (
            <View style={styles.noUniversityContainer}>
              <Icon name="exclamation-circle" size={16} color="#FF6B6B" style={styles.warningIcon} />
              <View style={styles.noUniversityContent}>
                <Text style={styles.noUniversityText}>
                  No university found for selected criteria
                  <Text style={styles.urduNoUniversityText}> | منتخب معیار کے لیے کوئی یونیورسٹی نہیں ملی</Text>
                </Text>
                <Text style={styles.suggestionText}>
                  Please try selecting a different district or university type
                  <Text style={styles.urduSuggestionText}> | براہ کرم مختلف ضلع یا یونیورسٹی کی قسم منتخب کریں</Text>
                </Text>
              </View>
            </View>
          )}
          
          {errors.university_id && <Text style={styles.errorText}>{errors.university_id}</Text>}
        </View>
         <View style={styles.inputContainer}>
                  <Text style={styles.labelred}>  Only female university students enrolled in the 2nd semester or above in any discipline will be eligible to apply.
                 </Text>
                  </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Education Level <Text style={styles.urduLabel}>تعلیمی سطح</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.education_level && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={[
              { label: 'Select Education Level | تعلیمی سطح منتخب کریں', value: '' },
              { label: "Bachelor's Degree | بیچلر ڈگری", value: 'bachelor' },
              { label: "Master's Degree | ماسٹر ڈگری", value: 'master' },
              { label: 'PhD | پی ایچ ڈی', value: 'phd' },
            ]}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Education Level"
            value={formData.education_level}
            onChange={item => handleChange('education_level', item.value)}
          />
          {errors.education_level && <Text style={styles.errorText}>{errors.education_level}</Text>}
        </View>
        
        {/* <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Department & Program <Text style={styles.urduLabel}>شعبہ اور پروگرام</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.department_program && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={departments.map(d => ({ label: d.department_name, value: d.id }))}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Department & Program"
            value={formData.department_program}
            onChange={item => {
              handleChange('department_program', item.value);
              setSelectedDepartment(item);
            }}
          />
          
          {selectedDepartment && (
            <Text style={styles.selectedValueText}>
              Selected: {selectedDepartment.label}
            </Text>
          )}
          
          {errors.department_program && <Text style={styles.errorText}>{errors.department_program}</Text>}
        </View> */}
         <View style={styles.inputContainer}>
                  <Text style={styles.label}>
                    Department & Program <Text style={styles.urduLabel}>شعبہ اور پروگرام</Text>
                    <RequiredField />
                  </Text>
                  <Dropdown
                    style={[styles.dropdown, errors.department_program && styles.inputError]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={[
                      { label: 'Select Department & Program | شعبہ اور پروگرام منتخب کریں', value: '' },
                      { label: 'Arts and Humanities', value: 'Arts and Humanities' },
                      { label: 'Social Sciences', value: 'Social Sciences' },
                      { label: 'Natural Sciences', value: 'Natural Sciences' },
                      { label: 'Biological Sciences', value: 'Biological Sciences' },
                      { label: 'Physical Sciences', value: 'Physical Sciences' },
                      { label: 'Engineering and Technology', value: 'Engineering and Technology' },
                      { label: 'Computer and Information Sciences', value: 'Computer and Information Sciences' },
                      { label: 'Health and Allied Health Sciences', value: 'Health and Allied Health Sciences' },
                      { label: 'Medical Sciences', value: 'Medical Sciences' },
                      { label: 'Pharmaceutical Sciences', value: 'Pharmaceutical Sciences' },
                      { label: 'Agricultural Sciences', value: 'Agricultural Sciences' },
                      { label: 'Veterinary Sciences', value: 'Veterinary Sciences' },
                      { label: 'Environmental Sciences', value: 'Environmental Sciences' },
                      { label: 'Business and Management Sciences', value: 'Business and Management Sciences' },
                      { label: 'Commerce and Finance', value: 'Commerce and Finance' },
                      { label: 'Economics and Development Studies', value: 'Economics and Development Studies' },
                      { label: 'Law and Legal Studies', value: 'Law and Legal Studies' },
                      { label: 'Education and Teacher Training', value: 'Education and Teacher Training' },
                      { label: 'Languages and Literature', value: 'Languages and Literature' },
                      { label: 'Media and Communication Studies', value: 'Media and Communication Studies' },
                      { label: 'Fine Arts and Design', value: 'Fine Arts and Design' },
                      { label: 'Architecture and Urban Planning', value: 'Architecture and Urban Planning' },
                      { label: 'Mathematics and Statistics', value: 'Mathematics and Statistics' },
                      { label: 'Islamic and Religious Studies', value: 'Islamic and Religious Studies' },
                      { label: 'Gender and Development Studies', value: 'Gender and Development Studies' },
                      // Add these to your department_program dropdown data
        { label: 'B.A. LL.B (Integrated Law)', value: 'B.A. LL.B (Integrated Law)' },
        { label: 'B.A. LL.B (Hons)', value: 'B.A. LL.B (Hons)' },
        { label: 'Pharm-D (Doctor of Pharmacy)', value: 'Pharm-D (Doctor of Pharmacy)' },
        { label: 'B.Arch (Bachelor of Architecture)', value: 'B.Arch (Bachelor of Architecture)' },
        { label: 'Doctor of Physiotherapy', value: 'Doctor of Physiotherapy' },
        { label: 'MBBS', value: 'MBBS' },
        { label: 'DVM (Doctor of Veterinary Medicine)', value: 'DVM (Doctor of Veterinary Medicine)' },
                    ]}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Department & Program"
                    value={formData.department_program}
                    onChange={item => handleChange('department_program', item.value)}
                  />
                  {errors.department_program && <Text style={styles.errorText}>{errors.department_program}</Text>}
                </View>
  <View style={styles.inputContainer}>
  <Text style={styles.label}>
    Academic Year <Text style={styles.urduLabel}>تعلیمی سال</Text>
    <RequiredField />
  </Text>
  <Dropdown
    style={[styles.dropdown, errors.academic_year && styles.inputError]}
    placeholderStyle={styles.placeholderStyle}
    selectedTextStyle={styles.selectedTextStyle}
    data={[
      { label: 'Select Year | سال منتخب کریں', value: '' },
      { label: '1st Year | پہلا سال', value: '1' },
      { label: '2nd Year | دوسرا سال', value: '2' },
      { label: '3rd Year | تیسرا سال', value: '3' },
      { label: '4th Year | چوتھا سال', value: '4' },
      ...(isFiveYearProgram(formData.department_program) ? 
        [{ label: '5th Year | پانچواں سال', value: '5' }] : 
        [])
    ]}
    maxHeight={300}
    labelField="label"
    valueField="value"
    placeholder="Select Year"
    value={formData.academic_year}
    onChange={item => handleChange('academic_year', item.value)}
  />
  {errors.academic_year && <Text style={styles.errorText}>{errors.academic_year}</Text>}
</View>
        
        {formData.academic_year && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Current Semester <Text style={styles.urduLabel}>موجودہ سمسٹر</Text>
              <RequiredField />
            </Text>
            <Dropdown
              style={[styles.dropdown, errors.current_semester && styles.inputError]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={getFilteredSemesters(formData.academic_year)}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Semester | سمسٹر منتخب کریں"
              value={formData.current_semester}
              onChange={item => handleChange('current_semester', item.value)}
            />
            {errors.current_semester && <Text style={styles.errorText}>{errors.current_semester}</Text>}
            {!formData.current_semester && (
              <Text style={styles.hintText}>Please select your current semester</Text>
            )}
          </View>
        )}
        {/* <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Academic Year <Text style={styles.urduLabel}>تعلیمی سال</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.academic_year && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={[
              { label: 'Select Year | سال منتخب کریں', value: '' },
              { label: '1st Year | پہلا سال', value: '1' },
              { label: '2nd Year | دوسرا سال', value: '2' },
              { label: '3rd Year | تیسرا سال', value: '3' },
              { label: '4th Year | چوتھا سال', value: '4' },
            ]}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Year"
            value={formData.academic_year}
            onChange={item => handleChange('academic_year', item.value)}
          />
          {errors.academic_year && <Text style={styles.errorText}>{errors.academic_year}</Text>}
        </View>
        
        {formData.academic_year && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Current Semester <Text style={styles.urduLabel}>موجودہ سمسٹر</Text>
              <RequiredField />
            </Text>
            <Dropdown
              style={[styles.dropdown, errors.current_semester && styles.inputError]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={semesters}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Semester | سمسٹر منتخب کریں"
              value={formData.current_semester}
              onChange={item => handleChange('current_semester', item.value)}
            />
            {errors.current_semester && <Text style={styles.errorText}>{errors.current_semester}</Text>}
            {!formData.current_semester && semesters.length > 0 && (
              <Text style={styles.hintText}>Please select your current semester</Text>
            )}
          </View>
        )} */}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Student ID/Registration Number
            <Text style={styles.urduLabel}>طالب علم کا آئی ڈی/رجسٹریشن نمبر</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.student_id && styles.inputError]}
            placeholder="Enter Student ID | طالب علم کا آئی ڈی درج کریں"
            value={formData.student_id}
            onChangeText={(text) => handleChange('student_id', text)}
          />
          {errors.student_id && <Text style={styles.errorText}>{errors.student_id}</Text>}
        </View>
        
        <Text style={styles.sectionTitle}>
          3. Attachments
          <Text style={styles.urduTitle}>یونیورسٹی کی تصدیق</Text>
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            CNIC Front (PNG or JPEG)
            <Text style={styles.urduLabel}>شناختی کارڈ سامنے (پی این جی یا جے پی ای جی)</Text>
            <RequiredField />
          </Text>
          {existingFiles.cnic_front ? (
            <View style={styles.existingFileContainer}>
              <View style={styles.filePreviewRow}>
                <Image 
                  source={{ uri: existingFiles.cnic_front }} 
                  style={styles.filePreviewImage}
                  resizeMode="cover"
                  onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                />
                <View style={styles.fileActions}>
                  <TouchableOpacity 
                    style={styles.viewFileButton}
                    onPress={() => viewExistingFile(existingFiles.cnic_front, 'CNIC Front')}
                  >
                    <Icon name="eye" size={16} color="white" />
                    <Text style={styles.viewFileText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.updateFileButton}
                    onPress={() => handleFileUpdate('cnic_front')}
                  >
                    <Icon name="refresh" size={16} color="white" />
                    <Text style={styles.updateFileText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.fileButtonRow}>
              <TouchableOpacity 
                style={[styles.fileButton, errors.attachment_cnic_front && styles.inputError, {flex: 1, marginRight: 10}]}
                onPress={() => pickDocument('cnic_front')}
              >
                <Text style={styles.fileButtonText}>
                  {files.cnic_front ? files.cnic_front.name : 'Choose File | فائل منتخب کریں'}
                </Text>
                <Icon name="file" size={15} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fileButton, styles.captureButton]}
                onPress={() => captureImage('cnic_front')}
              >
                <Icon name="plus" size={15} color="#555" />
              </TouchableOpacity>
            </View>
          )}
          {errors.attachment_cnic_front && <Text style={styles.errorText}>{errors.attachment_cnic_front}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            CNIC Back (PNG or JPEG)
            <Text style={styles.urduLabel}>شناختی کارڈ پیچھے (پی این جی یا جے پی ای جی)</Text>
            <RequiredField />
          </Text>
          {existingFiles.cnic_back ? (
            <View style={styles.existingFileContainer}>
              <View style={styles.filePreviewRow}>
                <Image 
                  source={{ uri: existingFiles.cnic_back }} 
                  style={styles.filePreviewImage}
                  resizeMode="cover"
                  onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                />
                <View style={styles.fileActions}>
                  <TouchableOpacity 
                    style={styles.viewFileButton}
                    onPress={() => viewExistingFile(existingFiles.cnic_back, 'CNIC Back')}
                  >
                    <Icon name="eye" size={16} color="white" />
                    <Text style={styles.viewFileText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.updateFileButton}
                    onPress={() => handleFileUpdate('cnic_back')}
                  >
                    <Icon name="refresh" size={16} color="white" />
                    <Text style={styles.updateFileText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.fileButtonRow}>
              <TouchableOpacity 
                style={[styles.fileButton, errors.attachment_cnic_back && styles.inputError, {flex: 1, marginRight: 10}]}
                onPress={() => pickDocument('cnic_back')}
              >
                <Text style={styles.fileButtonText}>
                  {files.cnic_back ? files.cnic_back.name : 'Choose File | فائل منتخب کریں'}
                </Text>
                <Icon name="file" size={15} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fileButton, styles.captureButton]}
                onPress={() => captureImage('cnic_back')}
              >
                <Icon name="plus" size={15} color="#555" />
              </TouchableOpacity>
            </View>
          )}
          {errors.attachment_cnic_back && <Text style={styles.errorText}>{errors.attachment_cnic_back}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Student ID Card (PNG or JPEG)
            <Text style={styles.urduLabel}>طالب علم کا شناختی کارڈ (پی این جی یا جے پی ای جی)</Text>
            <RequiredField />
          </Text>
          {existingFiles.student_card ? (
            <View style={styles.existingFileContainer}>
              <View style={styles.filePreviewRow}>
                <Image 
                  source={{ uri: existingFiles.student_card }} 
                  style={styles.filePreviewImage}
                  resizeMode="cover"
                  onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                />
                <View style={styles.fileActions}>
                  <TouchableOpacity 
                    style={styles.viewFileButton}
                    onPress={() => viewExistingFile(existingFiles.student_card, 'Student Card')}
                  >
                    <Icon name="eye" size={16} color="white" />
                    <Text style={styles.viewFileText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.updateFileButton}
                    onPress={() => handleFileUpdate('student_card')}
                  >
                    <Icon name="refresh" size={16} color="white" />
                    <Text style={styles.updateFileText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.fileButtonRow}>
              <TouchableOpacity 
                style={[styles.fileButton, errors.attachment_student_card && styles.inputError, {flex: 1, marginRight: 10}]}
                onPress={() => pickDocument('student_card')}
              >
                <Text style={styles.fileButtonText}>
                  {files.student_card ? files.student_card.name : 'Choose File | فائل منتخب کریں'}
                </Text>
                <Icon name="file" size={15} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fileButton, styles.captureButton]}
                onPress={() => captureImage('student_card')}
              >
                <Icon name="plus" size={15} color="#555" />
              </TouchableOpacity>
            </View>
          )}
          {errors.attachment_student_card && <Text style={styles.errorText}>{errors.attachment_student_card}</Text>}
        </View>
        
        <Text style={styles.sectionTitle}>
          4. University Verification
          <Text style={styles.urduTitle}>یونیورسٹی کی تصدیق</Text><RequiredField />
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Official recommendation/endorsement letter
            <Text style={styles.urduLabel}>
              یونیورسٹی کے شعبہ جات یا طلبہ امور کے سربراہ کی طرف سے باضابطہ تجویز/تصدیقی خط
            </Text>
          </Text>
          {existingFiles.recommendation_letter ? (
            <View style={styles.existingFileContainer}>
              <View style={styles.filePreviewRow}>
                <Image 
                  source={{ uri: existingFiles.recommendation_letter }} 
                  style={styles.filePreviewImage}
                  resizeMode="cover"
                  onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
                />
                <View style={styles.fileActions}>
                  <TouchableOpacity 
                    style={styles.viewFileButton}
                    onPress={() => viewExistingFile(existingFiles.recommendation_letter, 'Recommendation Letter')}
                  >
                    <Icon name="eye" size={16} color="white" />
                    <Text style={styles.viewFileText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.updateFileButton}
                    onPress={() => handleFileUpdate('recommendation_letter')}
                  >
                    <Icon name="refresh" size={16} color="white" />
                    <Text style={styles.updateFileText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.fileButtonRow}>
              <TouchableOpacity 
                style={[styles.fileButton, errors.attachment_recommendation_letter && styles.inputError, {flex: 1, marginRight: 10}]}
                onPress={() => pickDocument('recommendation_letter')}
              >
                <Text style={styles.fileButtonText}>
                  {files.recommendation_letter ? files.recommendation_letter.name : 'Choose File | فائل منتخب کریں'}
                </Text>
                <Icon name="file" size={15} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fileButton, styles.captureButton]}
                onPress={() => captureImage('recommendation_letter')}
              >
                <Icon name="plus" size={15} color="#555" />
              </TouchableOpacity>
            </View>
          )}
          {errors.attachment_recommendation_letter && <Text style={styles.errorText}>{errors.attachment_recommendation_letter}</Text>}
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.navButton, styles.prevButton]} onPress={handlePrevious}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render step 3 - Interests & Commitment
  const renderStep3 = () => {
    const socialMediaPlatforms = [
      { id: 'instagram', label: 'Instagram', urduLabel: 'انسٹاگرام' },
      { id: 'facebook', label: 'Facebook', urduLabel: 'فیس بک' },
      { id: 'twitter', label: 'Twitter', urduLabel: 'ٹویٹر' },
      { id: 'linkedin', label: 'LinkedIn', urduLabel: 'لنکڈ ان' },
      { id: 'youtube', label: 'YouTube', urduLabel: 'یوٹیوب' },
      { id: 'whatsapp', label: 'WhatsApp', urduLabel: 'واٹس ایپ' },
      { id: 'tiktok', label: 'TikTok', urduLabel: 'ٹک ٹاک' },
      { id: 'snapchat', label: 'Snapchat', urduLabel: 'سنپ چیٹ' },
      { id: 'pinterest', label: 'Pinterest', urduLabel: 'پنٹرسٹ' },
      { id: 'telegram', label: 'Telegram', urduLabel: 'ٹیلی گرام' },
    ];

    return (
      <View style={styles.formStep}>
        <Text style={styles.sectionTitle}>
          4. Interest & Motivation
          <Text style={styles.urduTitle}>دلچسپی اور محرک</Text>
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Why do you want to become a Female Ambassador?
            <Text style={styles.urduLabel}>آپ خواتین سفیر کیوں بننا چاہتی ہیں؟</Text>
            <RequiredField />
          </Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={[styles.textArea, errors.motivation && styles.inputError]}
              placeholder="Write your motivation (minimum 50 characters) | اپنی تحریک لکھیں (کم از کم 50 حروف)"
              value={formData.motivation}
              onChangeText={(text) => handleChange('motivation', text)}
              multiline
              numberOfLines={5}
            />
            <View style={styles.characterCounter}>
              <Text style={[styles.characterCountText, characterCount < 50 && styles.characterCountError]}>
                {characterCount}/50 characters
              </Text>
              {characterCount < 50 && (
                <Text style={styles.characterCountHint}>
                  Minimum {50 - characterCount} more characters required
                </Text>
              )}
            </View>
          </View>
          {errors.motivation && <Text style={styles.errorText}>{errors.motivation}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Past Involvement in Social Causes/Leadership Roles
            <Text style={styles.urduLabel}>سماجی کاموں یا قائدانہ کرداروں میں ماضی کی شرکت</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="Describe any involvement | کسی بھی شرکت کی وضاحت کریں"
            value={formData.past_involvement}
            onChangeText={(text) => handleChange('past_involvement', text)}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <Text style={styles.sectionTitle}>
          5. Social Media & Outreach
          <Text style={styles.urduTitle}>سوشل میڈیا اور رسائی</Text>
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Please tick in which Social Media you have account (multiple options can be selected)
            <Text style={styles.urduLabel}>فعال سوشل میڈیا پلیٹ فارمز کی فہرست</Text>
          </Text>
          
          {socialMediaPlatforms.map(platform => (
            <View key={platform.id} style={styles.socialMediaRow}>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[styles.checkbox, formData.social_media_platforms.includes(platform.id) && styles.checked]}
                  onPress={() => handleSocialMediaChange(platform.id)}
                >
                  {formData.social_media_platforms.includes(platform.id) && <Icon name="check" size={14} color="white" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>
                  {platform.label}
                  <Text style={styles.urduLabelSmall}> {platform.urduLabel}</Text>
                </Text>
              </View>
              
              <TextInput
                style={[styles.followerInput, 
                  formData.social_media_platforms.includes(platform.id) ? styles.followerInputActive : styles.followerInputInactive]}
                placeholder="Followers"
                value={formData[`followers_${platform.id}`] || ''}
                onChangeText={(text) => handleChange(`followers_${platform.id}`, text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                editable={formData.social_media_platforms.includes(platform.id)}
              />
            </View>
          ))}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Willingness to Organize Events/Seminars
            <Text style={styles.urduLabel}>ایونٹس/سیمینارز کے انعقاد کی رضامندی</Text>
            <RequiredField />
          </Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={[styles.radio, formData.organize_events === 'yes' && styles.radioChecked]}
              onPress={() => handleChange('organize_events', 'yes')}
            >
              {formData.organize_events === 'yes' && <View style={styles.radioInner} />}
            </TouchableOpacity>
            <Text style={styles.radioLabel}>Yes | ہاں</Text>
            
            <TouchableOpacity
              style={[styles.radio, formData.organize_events === 'no' && styles.radioChecked]}
              onPress={() => handleChange('organize_events', 'no')}
            >
              {formData.organize_events === 'no' && <View style={styles.radioInner} />}
            </TouchableOpacity>
            <Text style={styles.radioLabel}>No | نہیں</Text>
          </View>
          {errors.organize_events && <Text style={styles.errorText}>{errors.organize_events}</Text>}
        </View>
        
        <Text style={styles.sectionTitle}>
          6. Availability & Commitment
          <Text style={styles.urduTitle}>دستیابی اور عزم</Text>
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Preferred Hours per Week
            <Text style={styles.urduLabel}>ہفتے میں ترجیحی اوقات</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.hours_per_week && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={[
              { label: '-- Select Hours --', value: '' },
              { label: '1-2 hours', value: '1-2 hours' },
              { label: '3-4 hours', value: '3-4 hours' },
              { label: '5-6 hours', value: '5-6 hours' },
              { label: '7-8 hours', value: '7-8 hours' },
              { label: '9-10 hours', value: '9-10 hours' },
              { label: '11-12 hours', value: '11-12 hours' },
              { label: 'More than 12 hours', value: 'More than 12 hours' },
            ]}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Hours | اوقات منتخب کریں"
            value={formData.hours_per_week}
            onChange={item => handleChange('hours_per_week', item.value)}
          />
          {errors.hours_per_week && <Text style={styles.errorText}>{errors.hours_per_week}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Consent to Attend Orientation/Training
            <Text style={styles.urduLabel}>اورینٹیشن/تربیتی سیشنز میں شرکت کی رضامندی</Text>
            <RequiredField />
          </Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={[styles.radio, formData.attend_training === 'yes' && styles.radioChecked]}
              onPress={() => handleChange('attend_training', 'yes')}
            >
              {formData.attend_training === 'yes' && <View style={styles.radioInner} />}
            </TouchableOpacity>
            <Text style={styles.radioLabel}>Yes | ہاں</Text>
            
            <TouchableOpacity
              style={[styles.radio, formData.attend_training === 'no' && styles.radioChecked]}
              onPress={() => handleChange('attend_training', 'no')}
            >
              {formData.attend_training === 'no' && <View style={styles.radioInner} />}
            </TouchableOpacity>
            <Text style={styles.radioLabel}>No | نہیں</Text>
          </View>
          {errors.attend_training && <Text style={styles.errorText}>{errors.attend_training}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Duration of Commitment
            <Text style={styles.urduLabel}>عزم کی مدت</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.commitment_duration && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={[
              { label: '-- Select Duration --', value: '' },
              { label: '1 month', value: '1 month' },
              { label: '2 months', value: '2 months' },
              { label: '3 months', value: '3 months' },
              { label: '4 months', value: '4 months' },
              { label: '5 months', value: '5 months' },
              { label: '6 months', value: '6 months' },
              { label: '7 months', value: '7 months' },
              { label: '8 months', value: '8 months' },
              { label: '9 months', value: '9 months' },
              { label: '10 months', value: '10 months' },
              { label: '11 months', value: '11 months' },
              { label: '12 months', value: '12 months' },
              { label: 'More than 1 year', value: 'More than 1 year' },
            ]}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Duration | مدت منتخب کریں"
            value={formData.commitment_duration}
            onChange={item => handleChange('commitment_duration', item.value)}
          />
          {errors.commitment_duration && <Text style={styles.errorText}>{errors.commitment_duration}</Text>}
        </View>
        
        <Text style={styles.sectionTitle}>
          7. Undertaking / Consent
          <Text style={styles.urduTitle}>عہد / رضامندی</Text>
        </Text>
        
        <View style={styles.declarationBox}>
          <Text style={styles.declarationText}>
            I voluntarily participate in the Female Ambassador Program and consent to media coverage and departmental use of pictures/events.
          </Text>
          <Text style={[styles.declarationText, styles.urduText]}>
            میں رضاکارانہ طور پر خواتین سفیر پروگرام میں حصہ لیتا/لیتی ہوں اور میڈیا کوریج اور محکمانہ استعمال کے لیے تصاویر/ایونٹس کی رضامندی دیتا/دیتی ہوں۔
          </Text>
        </View>
        
        <View style={styles.inputContainer}>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, formData.voluntary_participation && styles.checked]}
              onPress={() => handleChange('voluntary_participation', !formData.voluntary_participation)}
            >
              {formData.voluntary_participation && <Icon name="check" size={14} color="white" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              I agree to voluntary participation
              <Text style={styles.urduLabel}>میں رضاکارانہ شرکت سے متفق ہوں</Text>
              <RequiredField />
            </Text>
          </View>
          {errors.voluntary_participation && <Text style={styles.errorText}>{errors.voluntary_participation}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={[styles.checkbox, formData.media_consent && styles.checked]}
              onPress={() => handleChange('media_consent', !formData.media_consent)}
            >
              {formData.media_consent && <Icon name="check" size={14} color="white" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              I consent to media coverage
              <Text style={styles.urduLabel}>میں میڈیا کوریج سے متفق ہوں</Text>
              <RequiredField />
            </Text>
          </View>
          {errors.media_consent && <Text style={styles.errorText}>{errors.media_consent}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Date <Text style={styles.urduLabel}>تاریخ</Text>
            <RequiredField />
          </Text>
          <TouchableOpacity 
            style={[styles.input, errors.signature_date && styles.inputError]}
            onPress={() => showDatepicker('signature')}
            activeOpacity={0.7}
          >
            <Text style={{color: formData.signature_date ? '#212121' : '#9E9E9E'}}>
              {formData.signature_date || 'Select Date | تاریخ منتخب کریں'}
            </Text>
          </TouchableOpacity>
          {errors.signature_date && <Text style={styles.errorText}>{errors.signature_date}</Text>}
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.navButton, styles.prevButton]} onPress={handlePrevious}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          
          {isUpdateMode && hasChanges ? (
            <TouchableOpacity 
              style={[styles.navButton, styles.updateButton]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>Apply for Phase 2</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.navButton, styles.submitButton]} 
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>Submit Registration</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ImageBackground 
        source={{uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView style={styles.scrollView}>
          <Loader loading={loading} />
          
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={Women}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.headerTitle}>Female Ambassador Program Registration</Text>
            <Text style={styles.urduLabel}>مضبوط عورت، مضبوط پنجاب</Text>
          </View>
          
          {renderProgressBar()}
          
          <View style={styles.contentContainer}>
            <View style={styles.formContainer}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </View>
          </View>

          {renderUpdateButton()}
   <ProgramPopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        programType="ambassador"
      />
       <AutoRegisterBadge role="ambassador" />
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome, Future Ambassador!</Text>
            <Text style={styles.welcomeText}>
              Join the Female Ambassador Program to inspire and lead change on your campus and beyond.
            </Text>
            <View style={styles.bulletPoint}>
              <Icon name="check-circle" style={styles.bulletIcon} color="white" size={16} />
              <Text style={styles.bulletText}>Open to female university students</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Icon name="check-circle" style={styles.bulletIcon} color="white" size={16} />
              <Text style={styles.bulletText}>Opportunity to lead and inspire</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Icon name="check-circle" style={styles.bulletIcon} color="white" size={16} />
              <Text style={styles.bulletText}>Subject to university verification</Text>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  header: {
    backgroundColor: 'rgba(124, 43, 94, 0.9)',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    zIndex: 100,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 5,
  },
  logo: {
    width: 100,
    height: 70,
    marginRight: -2,
    borderRadius: 35,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: 5,
  },
  urduLabel: {
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    marginTop: 5,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.95)',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activeStepCircle: {
    backgroundColor: '#7C2B5E',
    shadowColor: '#7C2B5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  stepNumber: {
    color: '#666',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeStepNumber: {
    color: 'white',
  },
  stepLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  activeStepLabel: {
    color: '#7C2B5E',
    fontWeight: 'bold',
  },
  stepConnector: {
    flex: 1,
    height: 3,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
    borderRadius: 2,
  },
  urduStepLabel: {
    fontSize: 9,
    display: 'none',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 10,
  },
  formContainer: {
    flex: 1,
  },
  formStep: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C2B5E',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#F3E5F5',
  },
  urduTitle: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
    fontWeight: '600',
  },
  requiredIndicator: {
    color: 'red',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 12,
    backgroundColor: 'white',
    color: '#212121',
  },
  inputError: {
    borderColor: '#ff4444',
    backgroundColor: '#FFF9F9',
  },
  textAreaContainer: {
    position: 'relative',
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    backgroundColor: 'white',
    color: '#212121',
    height: 120,
    textAlignVertical: 'top',
  },
  characterCounter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 4,
    borderRadius: 4,
  },
  characterCountText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  characterCountError: {
    color: '#F44336',
  },
  characterCountHint: {
    fontSize: 10,
    color: '#F44336',
    marginTop: 2,
  },
  dropdown: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  placeholderStyle: {
    fontSize: 15,
    color: '#212121',
  },
  selectedTextStyle: {
    fontSize: 15,
    color: '#212121',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: '#7C2B5E',
    borderColor: '#7C2B5E',
  },
  checkboxLabel: {
    fontSize: 12,
    color: 'gray',
    marginRight: 20,
  },
  fileButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    backgroundColor: 'white',
  },
  fileButtonText: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
    marginRight: 10,
  },
  captureButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    marginTop: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
  },
  navButton: {
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  nextButton: {
    backgroundColor: '#7C2B5E',
    borderWidth: 2,
    borderColor: '#9C4D81',
  },
  prevButton: {
    backgroundColor: '#412F63',
    borderWidth: 2,
    borderColor: '#5D4B7A',
  },
  submitButton: {
    backgroundColor: '#7C2B5E',
    borderWidth: 2,
    borderColor: '#9C4D81',
  },
  updateButton: {
    backgroundColor: '#FF9800',
    borderWidth: 2,
    borderColor: '#FFB74D',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioChecked: {
    borderColor: '#7C2B5E',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7C2B5E',
  },
  radioLabel: {
    fontSize: 14,
    color: '#424242',
    marginRight: 20,
  },
  declarationBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  declarationText: {
    fontSize: 13,
    color: 'gray',
    marginBottom: 15,
    lineHeight: 20,
  },
  urduText: {
    textAlign: 'right',
    lineHeight: 24,
    color: 'gray',
  },
  existingFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1e7fe',
  },
  filePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filePreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  fileActions: {
    flexDirection: 'row',
  },
  viewFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0c6dfd',
    padding: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  updateFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    padding: 8,
    borderRadius: 4,
  },
  viewFileText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  updateFileText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  welcomeCard: {
    backgroundColor: 'rgba(124, 43, 94, 0.9)',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    flex: 1,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    marginTop: 20,
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  socialMediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  followerInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 8,
    width: 100,
    textAlign: 'center',
    fontSize: 8,
  },
  followerInputActive: {
    backgroundColor: 'white',
    color: '#212121',
  },
  followerInputInactive: {
    backgroundColor: '#f5f5f5',
    color: '#9E9E9E',
  },
  urduLabelSmall: {
    fontSize: 10,
    color: '#050505ff',
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledItem: {
    backgroundColor: '#f5f5f5',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  disabledText: {
    color: '#999',
    fontStyle: 'italic',
  },
  selectedTextItem: {
    color: '#7C2B5E',
    fontWeight: 'bold',
  },
  hintText: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 5,
    fontStyle: 'italic',
  },
  infoIcon: {
    marginLeft: 10,
  },
  loadingDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    backgroundColor: 'white',
  },
  loadingDropdownText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  disabledDropdown: {
    backgroundColor: '#f9f9f9',
    borderColor: '#e2e8f0',
  },
  noUniversityContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 10,
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
    borderRadius: 6,
  },
  warningIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  noUniversityContent: {
    flex: 1,
  },
  noUniversityText: {
    fontSize: 12,
    color: '#E53E3E',
    flex: 1,
  },
  urduNoUniversityText: {
    fontSize: 11,
    color: '#E53E3E',
  },
  suggestionText: {
    fontSize: 10,
    color: '#718096',
    marginTop: 4,
    fontStyle: 'italic',
  },
  urduSuggestionText: {
    fontSize: 10,
    color: '#718096',
  },
  floatingUpdateButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#f7f1f5ff',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  floatingUpdateButtonText: {
    color: '#7C2B5E',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedValueText: {
    fontSize: 12,
    color: '#7C2B5E',
    marginTop: 5,
    fontStyle: 'italic',
  },
   labelred: {
    fontSize: 10,
    color: '#671f1fff',
    marginBottom: 8,
    fontWeight: '600',
  },
});

export default FemaleAmbassadorRegistrationScreen;