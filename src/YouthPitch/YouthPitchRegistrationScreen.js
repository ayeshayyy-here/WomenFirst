
import React, { useState, useEffect, useCallback } from 'react';
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
  Platform,
  ActivityIndicator,
  Linking,
  ToastAndroid,
  KeyboardAvoidingView,
  PermissionsAndroid,
  RefreshControl
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Loader from '../components/Loader';
import ProgramPopup from '../components/ProgramPopup';
import Women from '../../assets/images/women.png';
import axios from 'axios';
import syncStorage from 'react-native-sync-storage';
import AutoRegisterBadge from '../components/AutoRegisterBadge';

const YouthPitchRegistrationScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [errors, setErrors] = useState({});
  const [dob, setDob] = useState(new Date());
  const [declarationDate, setDeclarationDate] = useState(new Date());
  const [districts, setDistricts] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [isFather, setIsFather] = useState(true);
  const [files, setFiles] = useState({
    student_card_front: null,
    student_id_card_front: null,
    student_id_card_back: null,
    business_overview: null,
    bonafide_certificate: null,
  });
  const [existingFiles, setExistingFiles] = useState({});
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [characterCounts, setCharacterCounts] = useState({
    elevator_pitch: 0,
    description: 0,
    advocacy_experience: 0
  });
  const [imageLoading, setImageLoading] = useState({});
  const [initialFormData, setInitialFormData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
   const [showPopup, setShowPopup] = useState(true);
 const [wordCounts, setWordCounts] = useState({
  description: 0,
  elevator_pitch: 0,
  advocacy_experience: 0,
});

 
  // API base URL
  const API_BASE_URL = 'https://ypc-wdd.punjab.gov.pk/api';
 // const API_BASE_URL = 'https://4ee79ed4f4e0.ngrok-free.app/api';
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    full_name: '',
    guardian_type: 'father',
    father_name: '',
    husband_name: '',
    cnic_bform: '',
    dob: '',
    contact_number: '',
    email: '',
    current_address: '',
    permanent_address: '',

    // Step 2: Academic Information
    district_id: '',
    university_type: '',
    university_id: '',
    department_program: '',
    program_level: '',
    year_level: '',
    current_semester: '',
    student_id: '',

    // Step 3: Startup Details & Declaration
    elevator_pitch: '',
    startup_title: '',
    idea_status: '',
    description: '',
    sectors: [],
    other_sector: '',
    advocacy_experience: '',
    womens_empowerment_strategies: '',
    university_clubs: '',
    team_members: '',
    role: '',
    other_role: '',
    social_media_link: '',
    previous_participation: '',
    previous_participation_details: '',
    funding_received: '',
    funding_details: '',
    declaration_check: false,
    declaration_date: '',
  });
useEffect(() => {
  const countWords = (text = "") => {
    const words = text.trim().split(/\s+/);
    return words.length === 1 && words[0] === "" ? 0 : words.length;
  };

  setWordCounts({
    description: countWords(formData.description),
    elevator_pitch: countWords(formData.elevator_pitch),
    advocacy_experience: countWords(formData.advocacy_experience),
  });
}, [
  formData.description,
  formData.elevator_pitch,
  formData.advocacy_experience,
]);

const handleServiceUnavailable = () => {
  ToastAndroid.show('Service Unavailable', ToastAndroid.SHORT);
};
  // Check for changes in form data
  useEffect(() => {
    const changesDetected = Object.keys(formData).some(key => {
      // Special handling for arrays and objects
      if (key === 'sectors') {
        const initialSectors = Array.isArray(initialFormData[key]) ? initialFormData[key] : [];
        const currentSectors = Array.isArray(formData[key]) ? formData[key] : [];
        return JSON.stringify(initialSectors) !== JSON.stringify(currentSectors);
      }
      
      return formData[key] !== initialFormData[key];
    }) || Object.keys(files).some(key => files[key] !== null);
    
    setHasChanges(changesDetected);
  }, [formData, files, initialFormData]);

  // Fetch districts data
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get('https://fa-wdd.punjab.gov.pk/api/districts');
        setDistricts(response.data);
      } catch (error) {
        console.error('Error fetching districts:', error);
        showToast('Failed to load districts. Please try again.');
      }
    };

    fetchDistricts();
  }, []);

  // Fetch universities based on district and type
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
              value: uni.id.toString(),
              disabled: false,
              originalData: uni
            }));
          } else if (Array.isArray(response.data)) {
            universitiesData = response.data.map(uni => ({
              label: `${uni.name} | ${uni.type === 'public' ? 'سرکاری' : 'نجی'}`,
              value: uni.id.toString(),
              disabled: false,
              originalData: uni
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
          
          // If we have a university_id but it's not in the list, try to find it
          if (formData.university_id && universitiesData.length > 0) {
            const foundUni = universitiesData.find(u => u.value === formData.university_id.toString());
            if (!foundUni) {
              // University might be from a different district/type, try to fetch it specifically
              try {
                const uniResponse = await axios.get(
                  `https://fa-wdd.punjab.gov.pk/api/universities/${formData.university_id}`
                );
                if (uniResponse.data) {
                  const uni = uniResponse.data;
                  setUniversities(prev => [
                    ...prev.filter(u => !u.disabled),
                    {
                      label: `${uni.name} | ${uni.type === 'public' ? 'سرکاری' : 'نجی'}`,
                      value: uni.id.toString(),
                      disabled: false,
                      originalData: uni
                    }
                  ]);
                }
              } catch (error) {
                console.error('Error fetching specific university:', error);
              }
            }
          }
          
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
  }, [formData.district_id, formData.university_type, formData.university_id]);

  // Check for existing registration data
  const checkExistingRegistration = useCallback(async () => {
    try {
      setCheckingExisting(true);
      
      // Check if we have user profile data with CNIC
      const userProfile = syncStorage.get('user_profile');
          console.log('userProfile:', userProfile);
      if (userProfile) {
        const userData = JSON.parse(userProfile);
        
        if (userData.cnic && userData.cnic.length === 13) {
          // Try to fetch registration data from API
          try {
            const response = await axios.get(`${API_BASE_URL}/registration/${userData.cnic}`);
            
            if (response.data.success && response.data.data) {
              const existingData = response.data.data;
              
              // Process the data for form
              const processedData = {
                ...existingData,
                sectors: Array.isArray(existingData.sectors) ? 
                  existingData.sectors : 
                  (typeof existingData.sectors === 'string' ? 
                    JSON.parse(existingData.sectors) : []),
                declaration_check: existingData.declaration_check === true || 
                  existingData.declaration_check === '1' || 
                  existingData.declaration_check === 1
              };
              
              setFormData(prev => ({ ...prev, ...processedData }));
              setInitialFormData(processedData);
              
              // Set existing files if any
              const fileFields = ['student_card_front', 'student_id_card_front', 'student_id_card_back', 'business_overview', , 'bonafide_certificate'];
              const newExistingFiles = {};
              
              fileFields.forEach(field => {
                if (existingData[field]) {
                  newExistingFiles[field] = existingData[field];
                }
              });
              
              setExistingFiles(newExistingFiles);
              setIsUpdateMode(true);
              
              // Set guardian type
              if (processedData.guardian_type) {
                setIsFather(processedData.guardian_type === 'father');
              }
              
              showToast('Existing registration data loaded');
              return;
            }
          } catch (error) {
            console.log('No existing registration found or error fetching:', error);
            // Continue to prefill with user data
          }
        }
        
        // Pre-fill form with user data if available
        const initialFormData = {
          full_name: userData.name || '',
          cnic_bform: userData.cnic || '',
          dob: userData.dob || '',
          contact_number: userData.contact || '',
          email: userData.email || '',
        };
        
        setFormData(prev => ({ ...prev, ...initialFormData }));
        setInitialFormData(prev => ({ ...prev, ...initialFormData }));
      }
    } catch (error) {
      console.error('Error checking existing data:', error);
    } finally {
      setCheckingExisting(false);
    }
  }, []);

  // Load data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkExistingRegistration();
    }, [checkExistingRegistration])
  );

  // Handle input change
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Update character counts for text areas
    if (['elevator_pitch', 'description', 'advocacy_experience'].includes(name)) {
      setCharacterCounts(prev => ({
        ...prev,
        [name]: value.length
      }));
    }

    // Clear errors when field is updated
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }

    // Handle guardian type change
    if (name === 'guardian_type') {
      setIsFather(value === 'father');
    }
  };

  // Handle checkbox change for sectors
  const handleSectorChange = (sector) => {
    setFormData(prev => {
      const currentSectors = Array.isArray(prev.sectors) ? prev.sectors : [];
      let updatedSectors;
      
      if (currentSectors.includes(sector)) {
        updatedSectors = currentSectors.filter(s => s !== sector);
      } else {
        updatedSectors = [...currentSectors, sector];
      }
      
      return {
        ...prev,
        sectors: updatedSectors
      };
    });
  };

  // Handle file changes
  const handleFileChange = (type, file) => {
    setFiles(prev => ({ ...prev, [type]: file }));

    if (errors[type]) {
      setErrors(prev => ({
        ...prev,
        [type]: null,
      }));
    }
  };

  // Handle file updates
  const handleFileUpdate = (type) => {
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

  // Get filtered semesters based on year level
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
  // Generate full image URLs
  const getImageUrl = (path) => {
    if (!path) return null;
    
    // If it's already a full URL, return as is
    if (path.startsWith('http')) return path;
    
    // Otherwise, construct the full URL
    return `https://ypc-wdd.punjab.gov.pk/${path}`;
  };

  // Validate form step - only validate fields that are visible or have changes
 const validateStep = (step, isUpdate = false) => {
  const newErrors = {};
  let isValid = true;

  if (step === 1) {
    // Full Name
    if (isUpdate && formData.full_name === initialFormData.full_name) {
      // Skip validation for unchanged fields in update mode
    } else if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full Name is required';
      isValid = false;
    }

    // Guardian Type
    if (isUpdate && formData.guardian_type === initialFormData.guardian_type) {
      // Skip
    } else if (!formData.guardian_type) {
      newErrors.guardian_type = 'Guardian type is required';
      isValid = false;
    }

    // Father's Name (if guardian is father)
    if (formData.guardian_type === 'father') {
      if (isUpdate && formData.father_name === initialFormData.father_name) {
        // Skip
      } else if (!formData.father_name.trim()) {
        newErrors.father_name = "Father's Name is required";
        isValid = false;
      }
    }

    // Husband's Name (if guardian is husband)
    if (formData.guardian_type === 'husband') {
      if (isUpdate && formData.husband_name === initialFormData.husband_name) {
        // Skip
      } else if (!formData.husband_name.trim()) {
        newErrors.husband_name = "Husband's Name is required";
        isValid = false;
      }
    }

    // CNIC/B-Form
    if (isUpdate && formData.cnic_bform === initialFormData.cnic_bform) {
      // Skip
    } else if (!formData.cnic_bform.trim()) {
      newErrors.cnic_bform = 'CNIC/B-Form is required';
      isValid = false;
    } else if (!/^\d{13}$/.test(formData.cnic_bform)) {
      newErrors.cnic_bform = 'Must be 13 digits';
      isValid = false;
    } else {
      const lastDigit = parseInt(formData.cnic_bform.slice(-1));
      if (lastDigit % 2 !== 0) {
        newErrors.cnic_bform = 'Last digit must be even';
        isValid = false;
      }
    }

    // Date of Birth
    if (isUpdate && formData.dob === initialFormData.dob) {
      // Skip
    } else if (!formData.dob) {
      newErrors.dob = 'Date of Birth is required';
      isValid = false;
    }

    // Contact Number
    if (isUpdate && formData.contact_number === initialFormData.contact_number) {
      // Skip
    } else if (!formData.contact_number.trim()) {
      newErrors.contact_number = 'Contact Number is required';
      isValid = false;
    } else if (!/^03\d{9}$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Must be in format 03001234567';
      isValid = false;
    }

    // Email
    if (isUpdate && formData.email === initialFormData.email) {
      // Skip
    } else if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    // Current Address
    if (isUpdate && formData.current_address === initialFormData.current_address) {
      // Skip
    } else if (!formData.current_address.trim()) {
      newErrors.current_address = 'Current Address is required';
      isValid = false;
    }

    // Permanent Address
    if (isUpdate && formData.permanent_address === initialFormData.permanent_address) {
      // Skip
    } else if (!formData.permanent_address.trim()) {
      newErrors.permanent_address = 'Permanent Address is required';
      isValid = false;
    }

  } else if (step === 2) {
    // District
    if (isUpdate && formData.district_id === initialFormData.district_id) {
      // Skip
    } else if (!formData.district_id) {
      newErrors.district_id = 'University District is required';
      isValid = false;
    }

    // University Type
    if (isUpdate && formData.university_type === initialFormData.university_type) {
      // Skip
    } else if (!formData.university_type) {
      newErrors.university_type = 'University Type is required';
      isValid = false;
    }

    // University
    if (isUpdate && formData.university_id === initialFormData.university_id) {
      // Skip
    } else if (!formData.university_id) {
      newErrors.university_id = 'University Name is required';
      isValid = false;
    }

    // Department & Program
    if (isUpdate && formData.department_program === initialFormData.department_program) {
      // Skip
    } else if (!formData.department_program) {
      newErrors.department_program = 'Department & Program is required';
      isValid = false;
    }

    // Program Level
    if (isUpdate && formData.program_level === initialFormData.program_level) {
      // Skip
    } else if (!formData.program_level) {
      newErrors.program_level = 'Program Level is required';
      isValid = false;
    }

    // Academic Year
    if (isUpdate && formData.year_level === initialFormData.year_level) {
      // Skip
    } else if (!formData.year_level) {
      newErrors.year_level = 'Academic Year is required';
      isValid = false;
    }

    // Current Semester
    if (isUpdate && formData.current_semester === initialFormData.current_semester) {
      // Skip
    } else if (!formData.current_semester) {
      newErrors.current_semester = 'Current Semester is required';
      isValid = false;
    }

    // Student ID
    if (isUpdate && formData.student_id === initialFormData.student_id) {
      // Skip
    } else if (!formData.student_id.trim()) {
      newErrors.student_id = 'Student ID is required';
      isValid = false;
    }

    // File validations - only if not in update mode or file is being changed
    if (!isUpdate || !existingFiles.student_card_front) {
      if (!files.student_card_front && !existingFiles.student_card_front) {
        newErrors.student_card_front = 'Student Card Front is required';
        isValid = false;
      }
    }

    if (!isUpdate || !existingFiles.student_id_card_front) {
      if (!files.student_id_card_front && !existingFiles.student_id_card_front) {
        newErrors.student_id_card_front = 'Student ID Card Front is required';
        isValid = false;
      }
    }

    if (!isUpdate || !existingFiles.student_id_card_back) {
      if (!files.student_id_card_back && !existingFiles.student_id_card_back) {
        newErrors.student_id_card_back = 'Student ID Card Back is required';
        isValid = false;
      }
    }

    if (!isUpdate || !existingFiles.bonafide_certificate) {
      if (!files.bonafide_certificate && !existingFiles.bonafide_certificate) {
        newErrors.bonafide_certificate = 'Bonafide Certificate is required';
        isValid = false;
      }
    }

  } else if (step === 3) {
    // Elevator Pitch
    if (isUpdate && formData.elevator_pitch === initialFormData.elevator_pitch) {
      // Skip
    } else if (!formData.elevator_pitch.trim()) {
      newErrors.elevator_pitch = 'Elevator Pitch is required';
      isValid = false;
    } else if (formData.elevator_pitch.split(' ').length > 200) {
      newErrors.elevator_pitch = 'Maximum 200 words allowed';
      isValid = false;
    }

    // Startup Title
    if (isUpdate && formData.startup_title === initialFormData.startup_title) {
      // Skip
    } else if (!formData.startup_title.trim()) {
      newErrors.startup_title = 'Startup Title is required';
      isValid = false;
    }

    // Idea Status
    if (isUpdate && formData.idea_status === initialFormData.idea_status) {
      // Skip
    } else if (!formData.idea_status) {
      newErrors.idea_status = 'Idea Status is required';
      isValid = false;
    }

    // Description
    if (isUpdate && formData.description === initialFormData.description) {
      // Skip
    } else if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    } else if (formData.description.split(' ').length > 200) {
      newErrors.description = 'Maximum 200 words allowed';
      isValid = false;
    }

    // Sectors
    if (isUpdate && JSON.stringify(formData.sectors) === JSON.stringify(initialFormData.sectors || [])) {
      // Skip
    } else if (!formData.sectors || formData.sectors.length === 0) {
      newErrors.sectors = 'At least one sector is required';
      isValid = false;
    }

    // Other Sector (if Others is selected)
    if (formData.sectors?.includes('Others')) {
      if (isUpdate && formData.other_sector === initialFormData.other_sector) {
        // Skip
      } else if (!formData.other_sector.trim()) {
        newErrors.other_sector = 'Please specify other sector';
        isValid = false;
      }
    }

    // Advocacy Experience (word count check only)
    if (formData.advocacy_experience && formData.advocacy_experience.split(' ').length > 400) {
      newErrors.advocacy_experience = 'Maximum 400 words allowed';
      isValid = false;
    }

    // Women Empowerment Strategies
    if (isUpdate && formData.womens_empowerment_strategies === initialFormData.womens_empowerment_strategies) {
      // Skip
    } else if (!formData.womens_empowerment_strategies.trim()) {
      newErrors.womens_empowerment_strategies = 'Women empowerment strategies are required';
      isValid = false;
    }

    // Team Members
    if (isUpdate && formData.team_members === initialFormData.team_members) {
      // Skip
    } else if (!formData.team_members || formData.team_members < 1) {
      newErrors.team_members = 'Number of team members is required';
      isValid = false;
    }

    // Role
    if (isUpdate && formData.role === initialFormData.role) {
      // Skip
    } else if (!formData.role) {
      newErrors.role = 'Your role is required';
      isValid = false;
    }

    // Other Role (if Other is selected)
    if (formData.role === 'Other') {
      if (isUpdate && formData.other_role === initialFormData.other_role) {
        // Skip
      } else if (!formData.other_role.trim()) {
        newErrors.other_role = 'Please specify your role';
        isValid = false;
      }
    }

    // Previous Participation
    if (isUpdate && formData.previous_participation === initialFormData.previous_participation) {
      // Skip
    } else if (!formData.previous_participation) {
      newErrors.previous_participation = 'Please specify previous participation';
      isValid = false;
    }

    // Previous Participation Details (if Yes is selected)
    if (formData.previous_participation === 'Yes') {
      if (isUpdate && formData.previous_participation_details === initialFormData.previous_participation_details) {
        // Skip
      } else if (!formData.previous_participation_details.trim()) {
        newErrors.previous_participation_details = 'Please provide details';
        isValid = false;
      }
    }

    // Funding Received
    if (isUpdate && formData.funding_received === initialFormData.funding_received) {
      // Skip
    } else if (!formData.funding_received) {
      newErrors.funding_received = 'Please specify funding status';
      isValid = false;
    }

    // Funding Details (if Yes is selected)
    if (formData.funding_received === 'Yes') {
      if (isUpdate && formData.funding_details === initialFormData.funding_details) {
        // Skip
      } else if (!formData.funding_details.trim()) {
        newErrors.funding_details = 'Please provide funding details';
        isValid = false;
      }
    }

    // Declaration Check
    if (isUpdate && formData.declaration_check === initialFormData.declaration_check) {
      // Skip
    } else if (!formData.declaration_check) {
      newErrors.declaration_check = 'You must agree to the declaration';
      isValid = false;
    }

    // Declaration Date
    if (isUpdate && formData.declaration_date === initialFormData.declaration_date) {
      // Skip
    } else if (!formData.declaration_date) {
      newErrors.declaration_date = 'Declaration date is required';
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
      (formData.declaration_date ? new Date(formData.declaration_date) : new Date());
    
    DateTimePickerAndroid.open({
      value: currentDate,
      onChange: (event, selectedDate) => {
        if (event.type === 'set') {
          const currentDate = selectedDate;
          if (type === 'dob') {
            setDob(currentDate);
            handleChange('dob', currentDate.toISOString().split('T')[0]);
          } else {
            setDeclarationDate(currentDate);
            handleChange('declaration_date', currentDate.toISOString().split('T')[0]);
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
      // Request camera permissions first
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "This app needs access to your camera",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission denied', 'Camera permission is required to take photos');
          return;
        }
      }

      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          {
            text: 'Camera',
            onPress: async () => {
              try {
                const response = await launchCamera({
                  mediaType: 'photo',
                  quality: 0.8,
                  maxWidth: 2000,
                  maxHeight: 2000,
                  includeBase64: false,
                  saveToPhotos: true,
                  cameraType: 'back',
                });
                
                if (response.didCancel) {
                  console.log('User cancelled camera');
                  return;
                }
                
                if (response.errorCode) {
                  console.log('Camera Error: ', response.errorMessage);
                  Alert.alert('Error', `Camera error: ${response.errorMessage}`);
                  return;
                }
                
                if (response.assets && response.assets.length > 0) {
                  const asset = response.assets[0];
                  const file = {
                    name: asset.fileName || `photo_${Date.now()}.jpg`,
                    type: asset.type || 'image/jpeg',
                    uri: asset.uri,
                    size: asset.fileSize,
                  };
                  handleFileChange(type, file);
                }
              } catch (error) {
                console.error('Camera Error:', error);
                Alert.alert('Error', 'Failed to open camera. Please check permissions.');
              }
            }
          },
          {
            text: 'Gallery',
            onPress: async () => {
              try {
                const response = await launchImageLibrary({
                  mediaType: 'photo',
                  quality: 0.8,
                  maxWidth: 2000,
                  maxHeight: 2000,
                  includeBase64: false,
                });
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
    const fullUrl = getImageUrl(url);
    if (fullUrl) {
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
              Linking.openURL(fullUrl).catch(err => {
                Alert.alert('Error', 'Could not open file');
              });
            }
          }
        ]
      );
    }
  };
 
  // Handle form submission to API
 // Handle form submission for new registration
const handleSubmit = async () => {
  if (!validateStep(currentStep, false)) {
    showToast('Please fix all errors before submitting');
    return;
  }

  setLoading(true);
  try {
    // Prepare form data for API submission
    const submissionData = new FormData();
    
    // In create mode, send all data
    Object.keys(formData).forEach(key => {
      if (key !== 'sectors' && key !== 'declaration_check') {
        submissionData.append(key, formData[key]);
      }
    });
    
    // Add sectors as a JSON string
    submissionData.append('sectors', JSON.stringify(formData.sectors));
    
    // Add declaration check
    submissionData.append('declaration_check', formData.declaration_check ? '1' : '0');
    
    // Add all files
    Object.keys(files).forEach(key => {
      if (files[key]) {
        submissionData.append(key, {
          uri: files[key].uri,
          type: files[key].type || 'image/jpeg',
          name: files[key].name || `file_${Date.now()}.jpg`,
        });
      }
    });

    // Submit to API
    const response = await axios.post(`${API_BASE_URL}/registration`, submissionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
    
    const result = response.data;
    
    if (result.success) {
      // Refresh the data from API to get the latest
      try {
        const refreshResponse = await axios.get(`${API_BASE_URL}/registration/${formData.cnic_bform}`);
        if (refreshResponse.data.success) {
          const updatedData = refreshResponse.data.data;
          setInitialFormData(updatedData);
          setFormData(prev => ({ ...prev, ...updatedData }));
          
          // Update existing files
          const fileFields = ['student_card_front', 'student_id_card_front', 'student_id_card_back', 'business_overview', 'bonafide_certificate'];
          const newExistingFiles = {};
          
          fileFields.forEach(field => {
            if (updatedData[field]) {
              newExistingFiles[field] = updatedData[field];
            }
          });
          
          setExistingFiles(newExistingFiles);
          setFiles({
            student_card_front: null,
            student_id_card_front: null,
            student_id_card_back: null,
            business_overview: null,
            bonafide_certificate: null,
          });
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
      
      Alert.alert('Success', result.message, [
        {
          text: 'OK',
          onPress: () => {
            setIsUpdateMode(true);
            setHasChanges(false);
            showToast('Registration submitted successfully');
          }
        }
      ]);
    } else {
      // Handle validation errors from server
      if (result.errors) {
        setErrors(result.errors);
        showToast('Please fix the errors highlighted in red');
      } else {
        Alert.alert('Error', result.message || 'Submission failed');
      }
    }
  } catch (error) {
    console.error('Submission error:', error);
    if (error.response?.data?.errors) {
      setErrors(error.response.data.errors);
      showToast('Please fix the validation errors');
    } else {
      Alert.alert('Error', 'Failed to submit registration. Please check your internet connection.');
    }
  } finally {
    setLoading(false);
  }
};

// Handle form update for existing registration
const handleUpdate = async () => {
  if (!validateStep(currentStep, true)) {
    showToast('Please fix all errors before updating');
    return;
  }

  setLoading(true);
  try {
    // Prepare form data for API submission - only changed fields
    const submissionData = new FormData();
    
    // Add CNIC as identifier
    submissionData.append('cnic_bform', formData.cnic_bform);
    
    // Add all changed form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== initialFormData[key]) {
        if (key !== 'sectors' && key !== 'declaration_check') {
          submissionData.append(key, formData[key]);
        }
      }
    });
    
    // Add sectors if changed
    if (JSON.stringify(formData.sectors) !== JSON.stringify(initialFormData.sectors || [])) {
      submissionData.append('sectors', JSON.stringify(formData.sectors));
    }
    
    // Add declaration check if changed
    if (formData.declaration_check !== (initialFormData.declaration_check || false)) {
      submissionData.append('declaration_check', formData.declaration_check ? '1' : '0');
    }
    
    // Add files that are being updated
    Object.keys(files).forEach(key => {
      if (files[key]) {
        submissionData.append(key, {
          uri: files[key].uri,
          type: files[key].type || 'image/jpeg',
          name: files[key].name || `file_${Date.now()}.jpg`,
        });
      }
    });

    // Submit to API update endpoint
    const response = await axios.post(`${API_BASE_URL}/registration/update`, submissionData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000,
    });
    
    const result = response.data;
    
    if (result.success) {
      // Refresh the data from API to get the latest
      try {
        const refreshResponse = await axios.get(`${API_BASE_URL}/registration/${formData.cnic_bform}`);
        if (refreshResponse.data.success) {
          const updatedData = refreshResponse.data.data;
          setInitialFormData(updatedData);
          
          // Update existing files
          const fileFields = ['student_card_front', 'student_id_card_front', 'student_id_card_back', 'business_overview', 'bonafide_certificate'];
          const newExistingFiles = {};
          
          fileFields.forEach(field => {
            if (updatedData[field]) {
              newExistingFiles[field] = updatedData[field];
            }
          });
          
          setExistingFiles(newExistingFiles);
          setFiles({
            student_card_front: null,
            student_id_card_front: null,
            student_id_card_back: null,
            business_overview: null,
            bonafide_certificate: null,
          });
        }
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
      
      Alert.alert('Success', result.message, [
        {
          text: 'OK',
          onPress: () => {
            setHasChanges(false);
            showToast('Registration updated successfully');
          }
        }
      ]);
    } else {
      // Handle validation errors from server
      if (result.errors) {
        setErrors(result.errors);
        showToast('Please fix the errors highlighted in red');
      } else {
        Alert.alert('Error', result.message || 'Update failed');
      }
    }
  } catch (error) {
    console.error('Update error:', error);
    if (error.response?.data?.errors) {
      setErrors(error.response.data.errors);
      showToast('Please fix the validation errors');
    } else if (error.response?.status === 404) {
      Alert.alert('Error', 'Registration not found. Please submit as a new registration.');
      setIsUpdateMode(false);
    } else {
      Alert.alert('Error', 'Failed to update registration. Please check your internet connection.');
    }
  } finally {
    setLoading(false);
  }
};

// Modified main submission handler that routes to appropriate function
const handleFormSubmission = async () => {
  if (isUpdateMode) {
    await handleUpdate();
  } else {
    await handleSubmit();
  }
};

// Update your submit button to use handleFormSubmission


// Update your floating update button to use handleUpdate
const renderUpdateButton = () => {
  if (isUpdateMode && hasChanges) {
    return (
      <TouchableOpacity 
        style={styles.floatingUpdateButton}
         onPress={handleServiceUnavailable}
      >
        <Icon name="save" size={20} color="#7C2B5E" />
        <Text style={styles.floatingUpdateButtonText}>Update</Text>
      </TouchableOpacity>
    );
  }
  return null;
};

  // Fetch registration data by CNIC
  const fetchRegistrationData = async () => {
    if (!formData.cnic_bform || formData.cnic_bform.length !== 13) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/registration/${formData.cnic_bform}`);
      const result = response.data;
      
      if (result.success) {
        // Update form with existing data
        const existingData = result.data;
        const processedData = {
          ...existingData,
          sectors: Array.isArray(existingData.sectors) ? 
            existingData.sectors : 
            (typeof existingData.sectors === 'string' ? 
              JSON.parse(existingData.sectors) : []),
          declaration_check: existingData.declaration_check === true || 
            existingData.declaration_check === '1' || 
            existingData.declaration_check === 1
        };
        
        setFormData(prev => ({
          ...prev,
          ...processedData
        }));
        
        setInitialFormData(processedData);
        
        // Set existing files if any
        const fileFields = ['student_card_front', 'student_id_card_front', 'student_id_card_back', 'business_overview', 'bonafide_certificate'];
        const newExistingFiles = {};
        
        fileFields.forEach(field => {
          if (existingData[field]) {
            newExistingFiles[field] = existingData[field];
          }
        });
        
        setExistingFiles(newExistingFiles);
        setIsUpdateMode(true);
        
        showToast('Existing registration data loaded');
      }
    } catch (error) {
      console.error('Error fetching registration data:', error);
      // Don't show error if it's a 404 (not found)
      if (error.response?.status !== 404) {
        showToast('Error loading registration data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch registration data when CNIC is entered
  useEffect(() => {
    if (formData.cnic_bform && formData.cnic_bform.length === 13) {
      const timer = setTimeout(() => {
        fetchRegistrationData();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [formData.cnic_bform]);

  // Refresh data
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (formData.cnic_bform && formData.cnic_bform.length === 13) {
      await fetchRegistrationData();
    }
    setRefreshing(false);
  }, [formData.cnic_bform]);

  // Render step progress bar
  const renderProgressBar = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={[styles.step, currentStep >= 1 && styles.activeStep]}>
          <View style={[styles.stepCircle, currentStep >= 1 && styles.activeStepCircle]}>
            <Text style={[styles.stepNumber, currentStep >= 1 && styles.activeStepNumber]}>1</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 1 && styles.activeStepLabel]}>
            Personal Information
          </Text>
        </View>
        
        <View style={styles.stepConnector}></View>
        
        <View style={[styles.step, currentStep >= 2 && styles.activeStep]}>
          <View style={[styles.stepCircle, currentStep >= 2 && styles.activeStepCircle]}>
            <Text style={[styles.stepNumber, currentStep >= 2 && styles.activeStepNumber]}>2</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 2 && styles.activeStepLabel]}>
            Academic Information
          </Text>
        </View>
        
        <View style={styles.stepConnector}></View>
        
        <View style={[styles.step, currentStep >= 3 && styles.activeStep]}>
          <View style={[styles.stepCircle, currentStep >= 3 && styles.activeStepCircle]}>
            <Text style={[styles.stepNumber, currentStep >= 3 && styles.activeStepNumber]}>3</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 3 && styles.activeStepLabel]}>
            Startup Details
          </Text>
        </View>
      </View>
    );
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
          A. Personal Information
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
          <Text style={styles.label}>
            Guardian Type <Text style={styles.urduLabel}>سرپرست کی قسم</Text>
            <RequiredField />
          </Text>
          <View style={styles.radioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => handleChange('guardian_type', 'father')}
            >
              <View style={[styles.radio, formData.guardian_type === 'father' && styles.radioSelected]}>
                {formData.guardian_type === 'father' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Father | والد</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => handleChange('guardian_type', 'husband')}
            >
              <View style={[styles.radio, formData.guardian_type === 'husband' && styles.radioSelected]}>
                {formData.guardian_type === 'husband' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Husband | شوہر</Text>
            </TouchableOpacity>
          </View>
          {errors.guardian_type && <Text style={styles.errorText}>{errors.guardian_type}</Text>}
        </View>
        
        {formData.guardian_type === 'father' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Father's Name <Text style={styles.urduLabel}>والد کا نام</Text>
              <RequiredField />
            </Text>
            <TextInput
              style={[styles.input, errors.father_name && styles.inputError]}
              placeholder="Enter Father's Name | والد کا نام درج کریں"
              value={formData.father_name}
              onChangeText={(text) => handleChange('father_name', text)}
            />
            {errors.father_name && <Text style={styles.errorText}>{errors.father_name}</Text>}
          </View>
        )}
        
        {formData.guardian_type === 'husband' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Husband's Name <Text style={styles.urduLabel}>شوہر کا نام</Text>
              <RequiredField />
            </Text>
            <TextInput
              style={[styles.input, errors.husband_name && styles.inputError]}
              placeholder="Enter Husband's Name | شوہر کا نام درج کریں"
              value={formData.husband_name}
              onChangeText={(text) => handleChange('husband_name', text)}
            />
            {errors.husband_name && <Text style={styles.errorText}>{errors.husband_name}</Text>}
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            CNIC/B-Form Number <Text style={styles.urduLabel}>شناختی کارڈ/بی فارم نمبر</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.cnic_bform && styles.inputError]}
            placeholder="Enter CNIC/B-Form (13 digits) | شناختی کارڈ/بی فارم درج کریں"
            value={formData.cnic_bform}
            onChangeText={(text) => handleChange('cnic_bform', text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={13}
            onBlur={fetchRegistrationData}
          />
          {errors.cnic_bform && <Text style={styles.errorText}>{errors.cnic_bform}</Text>}
          {formData.cnic_bform.length === 13 && (
            <Text style={styles.hintText}>
              {isUpdateMode ? 'Existing registration found. You can update your information.' : 'Checking for existing registration...'}
            </Text>
          )}
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
            Contact Number <Text style={styles.urduLabel}>رابطہ نمبر</Text>
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
            Current Address <Text style={styles.urduLabel}>موجودہ پتہ</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.textArea, errors.current_address && styles.inputError]}
            placeholder="Enter Current Address | موجودہ پتہ درج کریں"
            value={formData.current_address}
            onChangeText={(text) => handleChange('current_address', text)}
            multiline
            numberOfLines={3}
          />
          {errors.current_address && <Text style={styles.errorText}>{errors.current_address}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Permanent Address <Text style={styles.urduLabel}>مستقل پتہ</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.textArea, errors.permanent_address && styles.inputError]}
            placeholder="Enter Permanent Address | مستقل پتہ درج کریں"
            value={formData.permanent_address}
            onChangeText={(text) => handleChange('permanent_address', text)}
            multiline
            numberOfLines={3}
          />
          {errors.permanent_address && <Text style={styles.errorText}>{errors.permanent_address}</Text>}
        </View>
        
        <TouchableOpacity style={[styles.navButton, styles.nextButton]}  onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render step 2 - Academic Information
  const renderStep2 = () => {
    const universityValue = formData.university_id ? 
      universities.find(u => u.value === formData.university_id.toString())?.value || '' : '';

    return (
      <View style={styles.formStep}>
        <Text style={styles.sectionTitle}>
          B. Academic Information
          <Text style={styles.urduTitle}>تعلیمی معلومات</Text>
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
            data={districts.map(d => ({ label: d.name, value: d.id.toString() }))}
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
              value={universityValue}
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
                  <Text style={styles.urduNoUniversityText}> | منتخب معیار کے لیے کوئی یونیอร์سٹی نہیں ملی</Text>
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
            Program Level <Text style={styles.urduLabel}>پروگرام کی سطح</Text>
            <RequiredField />
          </Text>
          <View style={styles.radioGroup}>
            {['bs', 'ms', 'phd'].map(level => (
              <TouchableOpacity
                key={level}
                style={styles.radioOption}
                onPress={() => handleChange('program_level', level)}
              >
                <View style={[styles.radio, formData.program_level === level && styles.radioSelected]}>
                  {formData.program_level === level && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>
                  {level === 'bs' ? 'BS' : level === 'ms' ? 'MS / MPhil' : 'PhD'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.program_level && <Text style={styles.errorText}>{errors.program_level}</Text>}
        </View>
        
        {/* <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Academic Year <Text style={styles.urduLabel}>تعلیمی سال</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.year_level && styles.inputError]}
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
            value={formData.year_level}
            onChange={item => handleChange('year_level', item.value)}
          />
          {errors.year_level && <Text style={styles.errorText}>{errors.year_level}</Text>}
        </View> */}
        <View style={styles.inputContainer}>
  <Text style={styles.label}>
    Academic Year <Text style={styles.urduLabel}>تعلیمی سال</Text>
    <RequiredField />
  </Text>
  <Dropdown
    style={[styles.dropdown, errors.year_level && styles.inputError]}
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
    value={formData.year_level}
    onChange={item => handleChange('year_level', item.value)}
  />
  {errors.year_level && <Text style={styles.errorText}>{errors.year_level}</Text>}
</View>
        
        {formData.year_level && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Current Semester <Text style={styles.urduLabel}>موجودہ سمسٹر</Text>
              <RequiredField />
            </Text>
            <Dropdown
              style={[styles.dropdown, errors.current_semester && styles.inputError]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={getFilteredSemesters(formData.year_level)}
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
          Attachments
          <Text style={styles.urduTitle}>یونیورسٹی کی تصدیق</Text>
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Student Card Front (PNG/JPG/PDF)
            <Text style={styles.urduLabel}>طالب علم کا کارڈ سامنے</Text>
            <RequiredField />
          </Text>
          {existingFiles.student_card_front ? (
            <View style={styles.existingFileContainer}>
              <View style={styles.filePreviewRow}>
                <Image 
                  source={{ uri: getImageUrl(existingFiles.student_card_front) }} 
                  style={styles.filePreviewImage}
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(prev => ({...prev, student_card_front: true}))}
                  onLoadEnd={() => setImageLoading(prev => ({...prev, student_card_front: false}))}
                  onError={(e) => {
                    console.log('Image loading error:', e.nativeEvent.error);
                    setImageLoading(prev => ({...prev, student_card_front: false}));
                  }}
                />
                {imageLoading.student_card_front && (
                  <ActivityIndicator size="small" color="#7C2B5E" style={styles.imageLoader} />
                )}
                <View style={styles.fileActions}>
                  <TouchableOpacity 
                    style={styles.viewFileButton}
                    onPress={() => viewExistingFile(existingFiles.student_card_front, 'Student Card Front')}
                  >
                    <Icon name="eye" size={16} color="white" />
                    <Text style={styles.viewFileText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.updateFileButton}
                    onPress={() => handleFileUpdate('student_card_front')}
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
                style={[styles.fileButton, errors.student_card_front && styles.inputError, {flex: 1, marginRight: 10}]}
                onPress={() => pickDocument('student_card_front')}
              >
                <Text style={styles.fileButtonText}>
                  {files.student_card_front ? files.student_card_front.name : 'Choose File | فائل منتخب کریں'}
                </Text>
                <Icon name="file" size={15} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fileButton, styles.captureButton]}
                onPress={() => captureImage('student_card_front')}
              >
                <Icon name="plus" size={15} color="#555" />
              </TouchableOpacity>
            </View>
          )}
          {errors.student_card_front && <Text style={styles.errorText}>{errors.student_card_front}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Student ID Card Front (PNG/JPG/PDF)
            <Text style={styles.urduLabel}>طالب علم کا شناخت کارڈ سامنے</Text>
            <RequiredField />
          </Text>
          {existingFiles.student_id_card_front ? (
            <View style={styles.existingFileContainer}>
              <View style={styles.filePreviewRow}>
                <Image 
                  source={{ uri: getImageUrl(existingFiles.student_id_card_front) }} 
                  style={styles.filePreviewImage}
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(prev => ({...prev, student_id_card_front: true}))}
                  onLoadEnd={() => setImageLoading(prev => ({...prev, student_id_card_front: false}))}
                  onError={(e) => {
                    console.log('Image loading error:', e.nativeEvent.error);
                    setImageLoading(prev => ({...prev, student_id_card_front: false}));
                  }}
                />
                {imageLoading.student_id_card_front && (
                  <ActivityIndicator size="small" color="#7C2B5E" style={styles.imageLoader} />
                )}
                <View style={styles.fileActions}>
                  <TouchableOpacity 
                    style={styles.viewFileButton}
                    onPress={() => viewExistingFile(existingFiles.student_id_card_front, 'Student ID Card Front')}
                  >
                    <Icon name="eye" size={16} color="white" />
                    <Text style={styles.viewFileText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.updateFileButton}
                    onPress={() => handleFileUpdate('student_id_card_front')}
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
                style={[styles.fileButton, errors.student_id_card_front && styles.inputError, {flex: 1, marginRight: 10}]}
                onPress={() => pickDocument('student_id_card_front')}
              >
                <Text style={styles.fileButtonText}>
                  {files.student_id_card_front ? files.student_id_card_front.name : 'Choose File | فائل منتخب کریں'}
                </Text>
                <Icon name="file" size={15} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fileButton, styles.captureButton]}
                onPress={() => captureImage('student_id_card_front')}
              >
                <Icon name="plus" size={15} color="#555" />
              </TouchableOpacity>
            </View>
          )}
          {errors.student_id_card_front && <Text style={styles.errorText}>{errors.student_id_card_front}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Student ID Card Back (PNG/JPG/PDF)
            <Text style={styles.urduLabel}>طالب علم کا شناخت کارڈ پیچھے</Text>
            <RequiredField />
          </Text>
          {existingFiles.student_id_card_back ? (
            <View style={styles.existingFileContainer}>
              <View style={styles.filePreviewRow}>
                <Image 
                  source={{ uri: getImageUrl(existingFiles.student_id_card_back) }} 
                  style={styles.filePreviewImage}
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(prev => ({...prev, student_id_card_back: true}))}
                  onLoadEnd={() => setImageLoading(prev => ({...prev, student_id_card_back: false}))}
                  onError={(e) => {
                    console.log('Image loading error:', e.nativeEvent.error);
                    setImageLoading(prev => ({...prev, student_id_card_back: false}));
                  }}
                />
                {imageLoading.student_id_card_back && (
                  <ActivityIndicator size="small" color="#7C2B5E" style={styles.imageLoader} />
                )}
                <View style={styles.fileActions}>
                  <TouchableOpacity 
                    style={styles.viewFileButton}
                    onPress={() => viewExistingFile(existingFiles.student_id_card_back, 'Student ID Card Back')}
                  >
                    <Icon name="eye" size={16} color="white" />
                    <Text style={styles.viewFileText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.updateFileButton}
                    onPress={() => handleFileUpdate('student_id_card_back')}
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
                style={[styles.fileButton, errors.student_id_card_back && styles.inputError, {flex: 1, marginRight: 10}]}
                onPress={() => pickDocument('student_id_card_back')}
              >
                <Text style={styles.fileButtonText}>
                  {files.student_id_card_back ? files.student_id_card_back.name : 'Choose File | فائل منتخب کریں'}
                </Text>
                <Icon name="file" size={15} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fileButton, styles.captureButton]}
                onPress={() => captureImage('student_id_card_back')}
              >
                <Icon name="plus" size={15} color="#555" />
              </TouchableOpacity>
            </View>
          )}
          {errors.student_id_card_back && <Text style={styles.errorText}>{errors.student_id_card_back}</Text>}
        </View>
        
         <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Bonafide Certificate (PNG/JPG/PDF)
            <Text style={styles.urduLabel}>بونافائیڈ سرٹیفکیٹے</Text>
            <RequiredField />
          </Text>
          {existingFiles.bonafide_certificate ? (
            <View style={styles.existingFileContainer}>
              <View style={styles.filePreviewRow}>
                <Image 
                  source={{ uri: getImageUrl(existingFiles.bonafide_certificate) }} 
                  style={styles.filePreviewImage}
                  resizeMode="cover"
                  onLoadStart={() => setImageLoading(prev => ({...prev, bonafide_certificate: true}))}
                  onLoadEnd={() => setImageLoading(prev => ({...prev, bonafide_certificate: false}))}
                  onError={(e) => {
                    console.log('Image loading error:', e.nativeEvent.error);
                    setImageLoading(prev => ({...prev, bonafide_certificate: false}));
                  }}
                />
                {imageLoading.bonafide_certificate && (
                  <ActivityIndicator size="small" color="#7C2B5E" style={styles.imageLoader} />
                )}
                <View style={styles.fileActions}>
                  <TouchableOpacity 
                    style={styles.viewFileButton}
                    onPress={() => viewExistingFile(existingFiles.bonafide_certificate, 'Student ID Card Back')}
                  >
                    <Icon name="eye" size={16} color="white" />
                    <Text style={styles.viewFileText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.updateFileButton}
                    onPress={() => handleFileUpdate('bonafide_certificate')}
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
                style={[styles.fileButton, errors.bonafide_certificate && styles.inputError, {flex: 1, marginRight: 10}]}
                onPress={() => pickDocument('bonafide_certificate')}
              >
                <Text style={styles.fileButtonText}>
                  {files.bonafide_certificate ? files.bonafide_certificate.name : 'Choose File | فائل منتخب کریں'}
                </Text>
                <Icon name="file" size={15} color="#555" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.fileButton, styles.captureButton]}
                onPress={() => captureImage('bonafide_certificate')}
              >
                <Icon name="plus" size={15} color="#555" />
              </TouchableOpacity>
            </View>
          )}
          {errors.bonafide_certificate && <Text style={styles.errorText}>{errors.bonafide_certificate}</Text>}
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

  // Render step 3 - Startup Details & Declaration
  const renderStep3 = () => {
    const sectors = [
      'Beauty Cosmetics', 'Aesthetics', 'Textile', 'Handicraft', 'Fashion & Lifestyle',
      'Leather', 'Furniture', 'Jewellery & Apparel', 'Organic & Natural Product',
      'Event Management', 'Food', 'Interior Design', 'Digital Creators', 'Kitchen Home',
      'Real Estate', 'Motherhood Childcare', 'Mental Health', 'Sports', 'Education Consultancy',
      'Tech & Innovation', 'NGOs & Development Sector', 'Others'
    ];

    return (
      <View style={styles.formStep}>
        <Text style={styles.sectionTitle}>
          C. Startup Details
          <Text style={styles.urduTitle}>اسٹارٹ اپ کی تفصیلات</Text>
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Elevator Pitch (max 200 words) <Text style={styles.urduLabel}>ایلیویٹر پچ</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.textArea, errors.elevator_pitch && styles.inputError]}
            placeholder="Describe your elevator pitch (max 200 words)"
            value={formData.elevator_pitch}
            onChangeText={(text) => handleChange('elevator_pitch', text)}
            multiline
            numberOfLines={5}
          />
         <View style={styles.wordCounter}>
 <Text
  style={[
    styles.wordCountText,
    wordCounts.elevator_pitch > 200 && styles.wordCountError,
  ]}
>
  {wordCounts.elevator_pitch}/200 words
</Text>

{wordCounts.elevator_pitch > 200 && (
  <Text style={styles.wordCountHint}>
    {`Maximum ${wordCounts.elevator_pitch - 200} words over limit`}
  </Text>
)}

</View>

          {errors.elevator_pitch && <Text style={styles.errorText}>{errors.elevator_pitch}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Startup Title <Text style={styles.urduLabel}>اسٹارٹ اپ کا عنوان</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.startup_title && styles.inputError]}
            placeholder="Enter Startup Title | اسٹارٹ اپ کا عنوان درج کریں"
            value={formData.startup_title}
            onChangeText={(text) => handleChange('startup_title', text)}
          />
          {errors.startup_title && <Text style={styles.errorText}>{errors.startup_title}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Status of Idea <Text style={styles.urduLabel}>آئیڈیا کی حیثیت</Text>
            <RequiredField />
          </Text>
          <View style={styles.radioGroup}>
            {['Just an Idea', 'Early Stage Prototype', 'Operational Startup'].map(status => (
              <TouchableOpacity
                key={status}
                style={styles.radioOption}
                onPress={() => handleChange('idea_status', status)}
              >
                <View style={[styles.radio, formData.idea_status === status && styles.radioSelected]}>
                  {formData.idea_status === status && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.idea_status && <Text style={styles.errorText}>{errors.idea_status}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Brief Description (max 200 words) <Text style={styles.urduLabel}>مختصر تفصیل</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            placeholder="Describe your startup (max 200 words)"
            value={formData.description}
            onChangeText={(text) => handleChange('description', text)}
            multiline
            numberOfLines={5}
          />
         <View style={styles.wordCounter}>
 <Text
  style={[
    styles.wordCountText,
    wordCounts.description > 200 && styles.wordCountError,
  ]}
>
  {wordCounts.description}/200 words
</Text>

{wordCounts.description > 200 && (
  <Text style={styles.wordCountHint}>
    {`Maximum ${wordCounts.description - 200} words over limit`}
  </Text>
)}

</View>

          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Business Overview (Optional) <Text style={styles.urduLabel}>کاروباری جائزہ</Text>
          </Text>
          <View style={styles.fileButtonRow}>
            <TouchableOpacity 
              style={[styles.fileButton, {flex: 1, marginRight: 10}]}
              onPress={() => pickDocument('business_overview')}
            >
              <Text style={styles.fileButtonText}>
                {files.business_overview ? files.business_overview.name : 'Choose File | فائل منتخب کریں'}
              </Text>
              <Icon name="file" size={15} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fileButton, styles.captureButton]}
              onPress={() => captureImage('business_overview')}
            >
              <Icon name="plus" size={15} color="#555" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Sector/Industry <Text style={styles.urduLabel}>شعبہ/صنعت</Text>
            <RequiredField />
          </Text>
          <View style={styles.checkboxGrid}>
            {sectors.map(sector => (
              <TouchableOpacity
                key={sector}
                style={styles.checkboxOption}
                onPress={() => handleSectorChange(sector)}
              >
                <View style={[styles.checkbox, formData.sectors?.includes(sector) && styles.checkboxSelected]}>
                  {formData.sectors?.includes(sector) && <Icon name="check" size={12} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>{sector}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.sectors && <Text style={styles.errorText}>{errors.sectors}</Text>}
        </View>
        
        {formData.sectors?.includes('Others') && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Specify Other Sector <Text style={styles.urduLabel}>دوسرے شعبے کی وضاحت</Text>
              <RequiredField />
            </Text>
            <TextInput
              style={[styles.input, errors.other_sector && styles.inputError]}
              placeholder="Specify other sector | دوسرے شعبے کی وضاحت کریں"
              value={formData.other_sector}
              onChangeText={(text) => handleChange('other_sector', text)}
            />
            {errors.other_sector && <Text style={styles.errorText}>{errors.other_sector}</Text>}
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Previous Advocacy Experience (max 400 words)<Text style={styles.urduLabel}>پچھلا تجربہ</Text>
          </Text>
          <TextInput
            style={[styles.textArea, errors.advocacy_experience && styles.inputError]}
            placeholder="Describe your experience (max 400 words)"
            value={formData.advocacy_experience}
            onChangeText={(text) => handleChange('advocacy_experience', text)}
            multiline
            numberOfLines={5}
          />
         <View style={styles.wordCounter}>
 <Text
  style={[
    styles.wordCountText,
    wordCounts.advocacy_experience > 400 && styles.wordCountError,
  ]}
>
  {wordCounts.advocacy_experience}/400 words
</Text>

{wordCounts.advocacy_experience > 400 && (
  <Text style={styles.wordCountHint}>
    {`Maximum ${wordCounts.advocacy_experience - 400} words over limit`}
  </Text>
)}

</View>

          {errors.advocacy_experience && <Text style={styles.errorText}>{errors.advocacy_experience}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Women's Empowerment Strategies <Text style={styles.urduLabel}>خواتین کی بااختیاری کی حکمت عملی</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.textArea, errors.womens_empowerment_strategies && styles.inputError]}
            placeholder="List three specific strategies | تین مخصوص حکمت عملیوں کی فہرست بنائیں"
            value={formData.womens_empowerment_strategies}
            onChangeText={(text) => handleChange('womens_empowerment_strategies', text)}
            multiline
            numberOfLines={5}
          />
          {errors.womens_empowerment_strategies && <Text style={styles.errorText}>{errors.womens_empowerment_strategies}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            University Clubs <Text style={styles.urduLabel}>یونیورسٹی کلبز</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            placeholder="List clubs/societies you are part of"
            value={formData.university_clubs}
            onChangeText={(text) => handleChange('university_clubs', text)}
            multiline
            numberOfLines={3}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Team Members <Text style={styles.urduLabel}>ٹیم ممبران</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.team_members && styles.inputError]}
            placeholder="Number of team members | ٹیم ممبران کی تعداد"
            value={formData.team_members}
            onChangeText={(text) => handleChange('team_members', text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />
          {errors.team_members && <Text style={styles.errorText}>{errors.team_members}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Your Role <Text style={styles.urduLabel}>آپ کا کردار</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.role && styles.inputError]}
            data={[
              { label: 'Select Role | کردار منتخب کریں', value: '' },
              { label: 'Founder', value: 'Founder' },
              { label: 'Co-Founder', value: 'Co-Founder' },
              { label: 'Marketing Lead', value: 'Marketing Lead' },
              { label: 'Product Developer', value: 'Product Developer' },
              { label: 'Finance Lead', value: 'Finance Lead' },
              { label: 'Other', value: 'Other' },
            ]}
            placeholder="Select Role"
            value={formData.role}
            onChange={item => handleChange('role', item.value)}
            labelField="label"
            valueField="value"
          />
          {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}
        </View>
        
        {formData.role === 'Other' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Specify Role <Text style={styles.urduLabel}>کردار کی وضاحت</Text>
              <RequiredField />
            </Text>
            <TextInput
              style={[styles.input, errors.other_role && styles.inputError]}
              placeholder="Specify your role | اپنے کردار کی وضاحت کریں"
              value={formData.other_role}
              onChangeText={(text) => handleChange('other_role', text)}
            />
            {errors.other_role && <Text style={styles.errorText}>{errors.other_role}</Text>}
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Social Media Link <Text style={styles.urduLabel}>سوشل میڈیا لنک</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter social media link | سوشل میڈیا لنک درج کریں"
            value={formData.social_media_link}
            onChangeText={(text) => handleChange('social_media_link', text)}
            keyboardType="url"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Previous Participation <Text style={styles.urduLabel}>پچھلی شرکت</Text>
            <RequiredField />
          </Text>
          <View style={styles.radioGroup}>
            {['Yes', 'No'].map(option => (
              <TouchableOpacity
                key={option}
                style={styles.radioOption}
                onPress={() => handleChange('previous_participation', option)}
              >
                <View style={[styles.radio, formData.previous_participation === option && styles.radioSelected]}>
                  {formData.previous_participation === option && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.previous_participation && <Text style={styles.errorText}>{errors.previous_participation}</Text>}
        </View>
        
        {formData.previous_participation === 'Yes' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Participation Details <Text style={styles.urduLabel}>شرکت کی تفصیلات</Text>
              <RequiredField />
            </Text>
            <TextInput
              style={[styles.textArea, errors.previous_participation_details && styles.inputError]}
              placeholder="Mention previous competitions | پچھلے مقابلوں کا ذکر کریں"
              value={formData.previous_participation_details}
              onChangeText={(text) => handleChange('previous_participation_details', text)}
              multiline
              numberOfLines={3}
            />
            {errors.previous_participation_details && <Text style={styles.errorText}>{errors.previous_participation_details}</Text>}
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Funding Received <Text style={styles.urduLabel}>فنڈنگ موصول</Text>
            <RequiredField />
          </Text>
          <View style={styles.radioGroup}>
            {['Yes', 'No'].map(option => (
              <TouchableOpacity
                key={option}
                style={styles.radioOption}
                onPress={() => handleChange('funding_received', option)}
              >
                <View style={[styles.radio, formData.funding_received === option && styles.radioSelected]}>
                  {formData.funding_received === option && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.funding_received && <Text style={styles.errorText}>{errors.funding_received}</Text>}
        </View>
        
        {formData.funding_received === 'Yes' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Funding Details <Text style={styles.urduLabel}>فنڈنگ کی تفصیلات</Text>
              <RequiredField />
            </Text>
            <TextInput
              style={[styles.textArea, errors.funding_details && styles.inputError]}
              placeholder="Specify amount and source | رقم اور ذریعہ کی وضاحت کریں"
              value={formData.funding_details}
              onChangeText={(text) => handleChange('funding_details', text)}
              multiline
              numberOfLines={3}
            />
            {errors.funding_details && <Text style={styles.errorText}>{errors.funding_details}</Text>}
          </View>
        )}
        
        <Text style={styles.sectionTitle}>
          D. Consent & Declaration
          <Text style={styles.urduTitle}>رضامندی اور اعلان</Text>
        </Text>
        
        <View style={styles.declarationBox}>
          <Text style={styles.declarationText}>
            I certify that the information provided is accurate and true to the best of my knowledge.
            {'\n'}
            <Text style={styles.urduText}>
              میں تصدیق کرتا/کرتی ہوں کہ فراہم کردہ معلومات میری بہترین معلومات کے مطابق درست اور سچی ہیں۔
            </Text>
          </Text>
          
          <Text style={styles.declarationText}>
            I agree to attend the training workshop if shortlisted and participate in the final round in Lahore.
            {'\n'}
            <Text style={styles.urduText}>
              میں شارٹ لسٹ ہونے کی صورت میں تربیتی ورکشاپ میں شرکت کرنے اور لاہور میں فائنل راؤنڈ میں حصہ لینے سے اتفاق کرتا/کرتی ہوں۔
            </Text>
          </Text>
          
          <Text style={styles.declarationText}>
            I consent to media coverage and public sharing of startup information by the organizers.
            {'\n'}
            <Text style={styles.urduText}>
              میں منتظمین کی طرف سے میڈیا کوریج اور اسٹارٹ اپ کی معلومات کے عوامی اشتراک سے رضامندی دیتا/دیتی ہوں۔
            </Text>
          </Text>
        </View>
        
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => handleChange('declaration_check', !formData.declaration_check)}
          >
            <View style={[styles.checkbox, formData.declaration_check && styles.checkboxSelected]}>
              {formData.declaration_check && <Icon name="check" size={12} color="white" />}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to the declaration <Text style={styles.urduLabel}>میں اعلان سے متفق ہوں</Text>
              <RequiredField />
            </Text>
          </TouchableOpacity>
          {errors.declaration_check && <Text style={styles.errorText}>{errors.declaration_check}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Date <Text style={styles.urduLabel}>تاریخ</Text>
            <RequiredField />
          </Text>
          <TouchableOpacity 
            style={[styles.input, errors.declaration_date && styles.inputError]}
            onPress={() => showDatepicker('declaration')}
          >
            <Text>{formData.declaration_date || 'Select Date | تاریخ منتخب کریں'}</Text>
          </TouchableOpacity>
          {errors.declaration_date && <Text style={styles.errorText}>{errors.declaration_date}</Text>}
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.navButton, styles.prevButton]} onPress={handlePrevious}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
         <TouchableOpacity style={[styles.navButton, styles.submitButton]}  onPress={handleServiceUnavailable}>
  <Text style={styles.buttonText}>
    {isUpdateMode ? 'Update Registration' : 'Submit Registration'}
  </Text>
</TouchableOpacity>
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
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7C2B5E']}
            />
          }
        >
          <Loader loading={loading} />
          
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={Women}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.headerTitle}>Women's Startup Competition Registration</Text>
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
        programType="ypc"
      /> 
       <AutoRegisterBadge role="ypc" />
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome, Entrepreneur!</Text>
            <Text style={styles.welcomeText}>
              Join the Women's Startup Competition to showcase your innovative ideas and connect with opportunities across Punjab.
            </Text>
            <View style={styles.bulletPoint}>
              <Icon name="check-circle" style={styles.bulletIcon} color="white" size={16} />
              <Text style={styles.bulletText}>Open to women students and entrepreneurs in Punjab</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Icon name="check-circle" style={styles.bulletIcon} color="white" size={16} />
              <Text style={styles.bulletText}>Ideas and startups at all stages welcome</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Icon name="check-circle" style={styles.bulletIcon} color="white" size={16} />
              <Text style={styles.bulletText}>Subject to organizer approval</Text>
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
  labelred: {
    fontSize: 10,
    color: '#671f1fff',
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
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
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
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioSelected: {
    borderColor: '#7C2B5E',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C2B5E',
  },
  radioLabel: {
    fontSize: 14,
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
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxSelected: {
    backgroundColor: '#7C2B5E',
    borderColor: '#7C2B5E',
  },
  checkboxLabel: {
    fontSize: 9,
    color: '#424242',
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 10,
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
  imageLoader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
   // Word counter styles
  wordCounter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    padding: 4,
    borderRadius: 4,
  },
  wordCountText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  wordCountError: {
    color: '#F44336',
  },
  wordCountHint: {
    fontSize: 10,
    color: '#F44336',
    marginTop: 2,
  },
  
});

export default YouthPitchRegistrationScreen;