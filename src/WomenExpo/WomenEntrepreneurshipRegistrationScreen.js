
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ToastAndroid,
  TouchableWithoutFeedback,
  Image,
  Alert,
  ImageBackground,
  PermissionsAndroid, Platform,
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
import AutoRegisterBadge from '../components/AutoRegisterBadge';
import Women from '../../assets/images/women.png';
import Wepx from '../../assets/images/wepx.png';
import axios from 'axios';
import mime from 'mime';
import syncStorage from 'react-native-sync-storage';
import RNFS from 'react-native-fs';

const WomenEntrepreneurshipRegistrationScreen = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
   const [showPopup, setShowPopup] = useState(true);
  const [files, setFiles] = useState({
    cnic: null,
    passport: null,
    logo: null,
    registration: null,
  });
  const [existingRegistration, setExistingRegistration] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [changedFields, setChangedFields] = useState({});
  const [showUpdateButton, setShowUpdateButton] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Form data state
  const [formData, setFormData] = useState({
    business_name: '',
    owner_name: '',
    cnic: '',
    passport: '',
    mobile_number: '',
    email: '',
    country_id: '',
    province_id: '',
    district_id: '',
    province_input: '',
    district_input: '',
    category: '',
    other_category: '',
    description: '',
    customer_base: '',
    start_year: '',
    previous_exhibition: '',
    exhibition_name: '',
    exhibition_year: '',
    space_requirement: '',
    social_presence: '',
    registration_date: new Date().toISOString().split('T')[0],
    declaration_check: false,
  });

  // Update word count when description changes
  useEffect(() => {
    const words = formData.description.trim().split(/\s+/);
    setWordCount(words.length === 1 && words[0] === '' ? 0 : words.length);
  }, [formData.description]);

  const API_URL = 'https://wepx-wdd.punjab.gov.pk/api/womenexporegistration';
  const UPDATE_API_URL = 'https://wepx-wdd.punjab.gov.pk/api/updateWomenExpoRegistration';

  // Categories data for dropdown
  const categories = [
    { label: 'Choose a Category', value: '' },
    { label: 'Beauty & Cosmetics', value: 'beauty_cosmetics' },
    { label: 'Aesthetics', value: 'aesthetics' },
    { label: 'Textile', value: 'textile' },
    { label: 'Handicraft', value: 'handicraft' },
    { label: 'Fashion & Lifestyle', value: 'fashion_lifestyle' },
    { label: 'Leather', value: 'leather' },
    { label: 'Furniture', value: 'furniture' },
    { label: 'Jewellery & Apparel', value: 'jewelry_apparel' },
    { label: 'Organic & Natural Product', value: 'organic_natural' },
    { label: 'Event Management & Hospitality', value: 'event_management' },
    { label: 'Food', value: 'food' },
    { label: 'Interior Design', value: 'interior_design' },
    { label: 'Digital Creators/Media', value: 'digital_creators' },
    { label: 'Kitchen & Home Solutions', value: 'kitchen_home' },
    { label: 'Real Estate', value: 'real_estate' },
    { label: 'Motherhood & Childcare', value: 'motherhood_childcare' },
    { label: 'Mental Health & Wellness', value: 'mental_health' },
    { label: 'Sports', value: 'sports' },
    { label: 'Education & Consultancy', value: 'education_consultancy' },
    { label: 'Tech & Innovation', value: 'tech_innovation' },
    { label: 'NGOs & Development Sector', value: 'ngos_development' },
    { label: 'Other', value: 'other' },
  ];

  const customerBases = [
    { label: 'Select Customer Base', value: '' },
    { label: 'Women | خواتین', value: 'women' },
    { label: 'Men | مرد', value: 'men' },
    { label: 'Children | بچے', value: 'children' },
    { label: 'Mixed | مخلوط', value: 'mixed' },
  ];

  const exhibitionOptions = [
    { label: 'Select Option | آپشن منتخب کریں', value: '' },
    { label: 'Yes | ہاں', value: 'yes' },
    { label: 'No | نہیں', value: 'no' },
  ];

  const spaceOptions = [
    { label: 'Choose a Space Option', value: '' },
    { label: 'Category A: 20x20 ft (Large Businesses/Brands)', value: '20x20' },
    { label: 'Category B: 10x15 ft (Mid-Sized Startups)', value: '10x15' },
    { label: 'Category C: 6x10 ft (Small/Home-Based Units)', value: '6x10' },
  ];

  // Required field indicator component
  const RequiredField = () => <Text style={styles.requiredIndicator}> *</Text>;

  // Show toast message
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Info', message);
    }
  };

  // Fetch registration data by CNIC
  const fetchRegistrationByCnic = async (cnic) => {
    if (!cnic || !/^\d{13}$/.test(cnic)) return null;
    
    try {
      const response = await axios.get(`https://wepx-wdd.punjab.gov.pk/api/registrations/${cnic}`);
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching registration:', error);
      return null;
    }
  };

  // Load user data and check for existing registration
  useEffect(() => {
    const loadUserData = async () => {
      const userProfile = syncStorage.get('user_profile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        const updatedData = {
          owner_name: profile.name || '',
          cnic: profile.cnic || '',
          mobile_number: profile.contact || '',
          email: profile.email || '',
        };
        
        setFormData(prev => ({ ...prev, ...updatedData }));

        if (profile.cnic) {
          setLoading(true);
          try {
            const data = await fetchRegistrationByCnic(profile.cnic);
            if (data) {
              setExistingRegistration(data);
              setIsUpdating(true);
              
              const registrationData = {
                business_name: data.business_name || '',
                owner_name: data.owner_name || updatedData.owner_name || '',
                cnic: data.cnic || updatedData.cnic || '',
                passport: data.passport || '',
                mobile_number: data.mobile_number || updatedData.mobile_number || '',
                email: data.email || updatedData.email || '',
                country_id: data.country_id || '',
                province_id: data.province_id || '',
                district_id: data.district_id || '',
                province_input: data.province_input || '',
                district_input: data.district_input || '',
                category: data.category || '',
                other_category: data.other_category || '',
                description: data.description || '',
                customer_base: data.customer_base || '',
                start_year: data.start_year ? data.start_year.toString() : '',
                previous_exhibition: data.previous_exhibition || '',
                exhibition_name: data.exhibition_name || '',
                exhibition_year: data.exhibition_year ? data.exhibition_year.toString() : '',
                space_requirement: data.space_requirement || '',
                social_presence: data.social_presence || '',
                registration_date: data.registration_date || new Date().toISOString().split('T')[0],
                declaration_check: data.declaration_check === 1,
              };
              
              setFormData(prev => ({ ...prev, ...registrationData }));

              if (data.attachments) {
                const newFiles = {};
                if (data.attachments.cnic) {
                  newFiles.cnic = {
                    uri: data.attachments.cnic,
                    name: 'cnic.jpg',
                    type: 'image/jpeg'
                  };
                }
                if (data.attachments.passport) {
                  newFiles.passport = {
                    uri: data.attachments.passport,
                    name: 'passport.jpg',
                    type: 'image/jpeg'
                  };
                }
                if (data.attachments.logo) {
                  newFiles.logo = {
                    uri: data.attachments.logo,
                    name: 'logo.jpg',
                    type: 'image/jpeg'
                  };
                }
                if (data.attachments.registration_doc) {
                  newFiles.registration = {
                    uri: data.attachments.registration_doc,
                    name: 'registration.jpg',
                    type: 'image/jpeg'
                  };
                }
                setFiles(prev => ({ ...prev, ...newFiles }));
              }
              
              ToastAndroid.show('Existing registration loaded', ToastAndroid.SHORT);
            }
          } catch (error) {
            console.error('Error loading registration:', error);
          } finally {
            setLoading(false);
          }
        }
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const response = await axios.get('https://wepx-wdd.punjab.gov.pk/api/countries');
        setCountries(response.data);
      } catch (error) {
        console.error('Error fetching countries:', error);
        ToastAndroid.show('Failed to load countries', ToastAndroid.SHORT);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      if (formData.country_id === 130) { // Pakistan
        try {
          setLoadingProvinces(true);
          const response = await axios.get('https://wepx-wdd.punjab.gov.pk/api/provinces');
          setProvinces(response.data);
        } catch (error) {
          console.error('Error fetching provinces:', error);
          ToastAndroid.show('Failed to load provinces', ToastAndroid.SHORT);
        } finally {
          setLoadingProvinces(false);
        }
      } else {
        setProvinces([]);
        setFormData(prev => ({
          ...prev,
          province_id: '',
          province_input: '',
          district_id: '',
          district_input: ''
        }));
      }
    };

    fetchProvinces();
  }, [formData.country_id]);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (formData.province_id === 1) { // Punjab
        try {
          setLoadingDistricts(true);
          const response = await axios.get('https://wepx-wdd.punjab.gov.pk/api/districts');
          setDistricts(response.data);
        } catch (error) {
          console.error('Error fetching districts:', error);
          ToastAndroid.show('Failed to load districts', ToastAndroid.SHORT);
        } finally {
          setLoadingDistricts(false);
        }
      } else {
        setDistricts([]);
        setFormData(prev => ({
          ...prev,
          district_id: '',
          district_input: ''
        }));
      }
    };

    fetchDistricts();
  }, [formData.province_id]);

  // Handle input change
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Track changed fields
    if (existingRegistration && existingRegistration[name] !== value) {
      setChangedFields(prev => ({ ...prev, [name]: true }));
      setShowUpdateButton(true);
    } else if (existingRegistration && existingRegistration[name] === value) {
      setChangedFields(prev => {
        const newChangedFields = { ...prev };
        delete newChangedFields[name];
        return newChangedFields;
      });
      setShowUpdateButton(Object.keys(changedFields).length > 1);
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }

    if (name === 'category' && value !== 'other') {
      setFormData(prev => ({
        ...prev,
        other_category: '',
      }));
    }

    if (name === 'previous_exhibition' && value === 'no') {
      setFormData(prev => ({
        ...prev,
        exhibition_name: '',
        exhibition_year: '',
      }));
    }
  };

  // Handle file changes
  const handleFileChange = (type, file) => {
    setFiles(prev => ({ ...prev, [type]: file }));
    
    if (existingRegistration) {
      setChangedFields(prev => ({ ...prev, [`file_${type}`]: true }));
      setShowUpdateButton(true);
    }

    if (errors[`attachment_${type}`]) {
      setErrors(prev => ({
        ...prev,
        [`attachment_${type}`]: null,
      }));
    }
  };

  // Validate form step for new registration
  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.business_name.trim()) {
        newErrors.business_name = 'Business/Brand Name is required';
        isValid = false;
      }

      if (!formData.owner_name.trim()) {
        newErrors.owner_name = 'Owner Name is required';
        isValid = false;
      }

      if (!formData.cnic.trim()) {
        newErrors.cnic = 'CNIC is required';
        isValid = false;
      } else if (!/^\d{13}$/.test(formData.cnic)) {
        newErrors.cnic = 'CNIC must be exactly 13 digits';
        isValid = false;
      }

      if (!formData.mobile_number.trim()) {
        newErrors.mobile_number = 'Mobile Number is required';
        isValid = false;
      } else if (!/^03\d{9}$/.test(formData.mobile_number)) {
        newErrors.mobile_number = 'Must be in format 03001234567';
        isValid = false;
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
        isValid = false;
      }

      if (!formData.country_id) {
        newErrors.country_id = 'Country is required';
        isValid = false;
      }

      if (formData.country_id === 130 && !formData.province_id) {
        newErrors.province_id = 'Province is required';
        isValid = false;
      } else if (formData.country_id !== 130 && !formData.province_input) {
        newErrors.province_input = 'Province/State is required';
        isValid = false;
      }

      if (formData.country_id === 130 && formData.province_id === 1 && !formData.district_id) {
        newErrors.district_id = 'District is required';
        isValid = false;
      } else if (!formData.district_input) {
        newErrors.district_input = 'District/City is required';
        isValid = false;
      }

    } else if (step === 2) {
      if (!formData.category) {
        newErrors.category = 'Please select a Category';
        isValid = false;
      }

      if (formData.category === 'other' && !formData.other_category.trim()) {
        newErrors.other_category = 'Please specify Other Category';
        isValid = false;
      }

      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
        isValid = false;
      } else {
        if (wordCount < 200 || wordCount > 300) {
          newErrors.description = `Description must be between 200 and 300 words. Currently ${wordCount} words.`;
          isValid = false;
        }
      }

      if (!formData.customer_base) {
        newErrors.customer_base = 'Please select a Customer Base';
        isValid = false;
      }

      if (!formData.start_year) {
        newErrors.start_year = 'Business Start Year is required';
        isValid = false;
      } else if (formData.start_year.length !== 4 || isNaN(formData.start_year)) {
        newErrors.start_year = 'Please enter a valid 4-digit year';
        isValid = false;
      } else {
        const year = parseInt(formData.start_year);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
          newErrors.start_year = `Must be between 1900 and ${currentYear}`;
          isValid = false;
        }
      }

      if (!formData.previous_exhibition) {
        newErrors.previous_exhibition = 'Please select if you participated before';
        isValid = false;
      }

      if (formData.previous_exhibition === 'yes') {
        if (!formData.exhibition_name.trim()) {
          newErrors.exhibition_name = 'Exhibition name is required';
          isValid = false;
        }
        if (!formData.exhibition_year) {
          newErrors.exhibition_year = 'Exhibition year is required';
          isValid = false;
        } else if (formData.exhibition_year.length !== 4 || isNaN(formData.exhibition_year)) {
          newErrors.exhibition_year = 'Please enter a valid 4-digit year';
          isValid = false;
        } else {
          const year = parseInt(formData.exhibition_year);
          const currentYear = new Date().getFullYear();
          if (year < 1900 || year > currentYear) {
            newErrors.exhibition_year = `Must be between 1900 and ${currentYear}`;
            isValid = false;
          }
        }
      }

      if (!formData.space_requirement) {
        newErrors.space_requirement = 'Please select a Space Option';
        isValid = false;
      }
    } else if (step === 3) {
      if (!files.cnic && !existingRegistration?.attachments?.cnic) {
        newErrors.attachment_cnic = 'CNIC Copy is required';
        isValid = false;
      }

      if (!files.logo && !existingRegistration?.attachments?.logo) {
        newErrors.attachment_logo = 'Brand Logo/Image is required';
        isValid = false;
      }

      if (!formData.declaration_check) {
        newErrors.declaration_check = 'You must agree to the declaration';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle next step
  const handleNext = () => {
    const isValid = isUpdating ? validateUpdate(currentStep) : validateStep(currentStep);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    } else {
      showToast('Please fix all errors before proceeding');
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle file pick
  const pickDocument = async (type) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });

      if (res.size > 2 * 1024 * 1024) {
        ToastAndroid.show('File size must be less than 2MB', ToastAndroid.SHORT);
        return;
      }

      handleFileChange(type, res);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        ToastAndroid.show('Error picking file', ToastAndroid.SHORT);
      }
    }
  };

  // Handle image capture/selection
  const captureImage = async (type) => {
    try {
      // Request necessary permissions first
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
          ToastAndroid.show('Camera permission denied', ToastAndroid.SHORT);
          return;
        }
      }

      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 2000,
        maxHeight: 2000,
        saveToPhotos: true,
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
                ToastAndroid.show('Failed to open camera', ToastAndroid.SHORT);
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
                ToastAndroid.show('Failed to open gallery', ToastAndroid.SHORT);
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
      ToastAndroid.show('Error accessing media', ToastAndroid.SHORT);
    }
  };

  const handleImageResponse = (response, type) => {
    if (response.didCancel) {
      return;
    }
    
    if (response.errorCode) {
      ToastAndroid.show(`Error: ${response.errorMessage}`, ToastAndroid.SHORT);
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

  // Handle date picker
  const showDatepicker = () => {
    DateTimePickerAndroid.open({
      value: date,
      onChange: (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);
        handleChange('registration_date', currentDate.toISOString().split('T')[0]);
      },
      mode: 'date',
    });
  };

  // Prepare form data for submission
  const prepareFormData = () => {
    const data = new FormData();
    
    // Add all form fields
    Object.keys(formData).forEach(key => {
      if (formData[key] !== '' && formData[key] !== null) {
        data.append(key, formData[key]);
      }
    });

    // Add files
    Object.entries(files).forEach(([key, file]) => {
      if (file && file.uri) {
        const fileType = file.type || mime.getType(file.uri) || 'image/jpeg';
        data.append(`attachment_${key}`, {
          uri: file.uri,
          type: fileType,
          name: file.name || `${key}_${Date.now()}.${fileType.split('/')[1] || 'jpg'}`
        });
      }
    });

    return data;
  };

  // Validate update
  const validateUpdate = (step) => {
    const newErrors = {};
    let isValid = true;

    // Basic validations that are always required
    if (!formData.cnic.trim()) {
      newErrors.cnic = 'CNIC is required';
      isValid = false;
    } else if (!/^\d{13}$/.test(formData.cnic)) {
      newErrors.cnic = 'CNIC must be exactly 13 digits';
      isValid = false;
    }

    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile Number is required';
      isValid = false;
    } else if (!/^03\d{9}$/.test(formData.mobile_number)) {
      newErrors.mobile_number = 'Must be in format 03001234567';
      isValid = false;
    }

    // Step-specific validations
    if (step === 1) {
      // No additional validations needed for step 1 in update mode
    } else if (step === 2) {
      // Only validate fields that are being changed
      if (formData.category === 'other' && formData.other_category !== existingRegistration?.other_category && !formData.other_category.trim()) {
        newErrors.other_category = 'Please specify Other Category';
        isValid = false;
      }
      
      if (formData.description !== existingRegistration?.description && !formData.description.trim()) {
        newErrors.description = 'Description is required';
        isValid = false;
      } else if (formData.description !== existingRegistration?.description) {
        if (wordCount < 200 || wordCount > 300) {
          newErrors.description = `Description must be between 200 and 300 words. Currently ${wordCount} words.`;
          isValid = false;
        }
      }
    } else if (step === 3) {
      // Only require declaration check for updates
      if (!formData.declaration_check) {
        newErrors.declaration_check = 'You must agree to the declaration';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission for new registration
  const handleSubmit = async () => {
    if (!validateStep(3)) {
      ToastAndroid.show('Please fix all errors before submitting', ToastAndroid.LONG);
      return;
    }

    setLoading(true);
    
    try {
      const formDataToSend = prepareFormData();
      
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = await response.json();
      
      setLoading(false);
      
      if (response.ok) {
        ToastAndroid.show('Registration submitted successfully!', ToastAndroid.LONG);
        navigation.goBack();
      } else {
        let errorMessage = 'Submission failed';
        if (responseData.message) {
          errorMessage += ': ' + responseData.message;
        }
        if (responseData.errors) {
          const fieldErrors = {};
          Object.entries(responseData.errors).forEach(([field, messages]) => {
            fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages;
          });
          setErrors(fieldErrors);
          // Show the first error
          const firstError = Object.values(fieldErrors)[0];
          if (firstError) {
            ToastAndroid.show(firstError, ToastAndroid.LONG);
          }
        } else {
          ToastAndroid.show(errorMessage, ToastAndroid.LONG);
        }
      }
    } catch (error) {
      setLoading(false);
      console.error('API Error:', error);
      ToastAndroid.show('Network error. Please try again.', ToastAndroid.LONG);
    }
  };

  // Handle update
  const handleUpdate = async () => {
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Always include identification fields
      formDataToSend.append('cnic', formData.cnic);
      formDataToSend.append('mobile_number', formData.mobile_number);
      
      // Only include changed fields
      Object.keys(changedFields).forEach(field => {
        if (field.startsWith('file_')) {
          const fileType = field.replace('file_', '');
          const file = files[fileType];
          if (file) {
            formDataToSend.append(`attachment_${fileType}`, {
              uri: file.uri,
              type: file.type || 'image/jpeg',
              name: file.name || `${fileType}_${Date.now()}.jpg`
            });
          }
        } else if (formData[field] !== undefined) {
          formDataToSend.append(field, formData[field]);
        }
      });
      
      // Include declaration if changed
      if (changedFields.declaration_check) {
        formDataToSend.append('declaration_check', formData.declaration_check ? '1' : '0');
      }

      const response = await fetch(UPDATE_API_URL, {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = await response.json();
      
      if (response.ok) {
        ToastAndroid.show('Updated successfully!', ToastAndroid.LONG);
        setShowUpdateButton(false);
        setChangedFields({});
        // Refresh existing data
        const updatedData = await fetchRegistrationByCnic(formData.cnic);
        if (updatedData) {
          setExistingRegistration(updatedData);
        }
      } else {
        let errorMessage = 'Update failed';
        if (responseData.message) errorMessage += ': ' + responseData.message;
        ToastAndroid.show(errorMessage, ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Update error:', error);
      ToastAndroid.show('Network error. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
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
          <Text style={[styles.stepLabel, currentStep >= 1 && styles.activeStepLabel]}>Applicant Info</Text>
        </View>
        
        <View style={styles.stepConnector}></View>
        
        <View style={[styles.step, currentStep >= 2 && styles.activeStep]}>
          <View style={[styles.stepCircle, currentStep >= 2 && styles.activeStepCircle]}>
            <Text style={[styles.stepNumber, currentStep >= 2 && styles.activeStepNumber]}>2</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 2 && styles.activeStepLabel]}>Business Details</Text>
        </View>
        
        <View style={styles.stepConnector}></View>
        
        <View style={[styles.step, currentStep >= 3 && styles.activeStep]}>
          <View style={[styles.stepCircle, currentStep >= 3 && styles.activeStepCircle]}>
            <Text style={[styles.stepNumber, currentStep >= 3 && styles.activeStepNumber]}>3</Text>
          </View>
          <Text style={[styles.stepLabel, currentStep >= 3 && styles.activeStepLabel]}>Attachments</Text>
        </View>
      </View>
    );
  };

  // Render step 1 - Applicant Information
  const renderStep1 = () => {
    return (
      <View style={styles.formStep}>
        <Text style={styles.sectionTitle}>A. Applicant Information</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Business/Brand Name <Text style={styles.urduLabel}>کاروبار/برانڈ کا نام</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.business_name && styles.inputError]}
            placeholder="Enter Business/Brand Name | کاروبار/برانڈ کا نام درج کریں"
            value={formData.business_name}
            onChangeText={(text) => handleChange('business_name', text)}
          />
          {errors.business_name && <Text style={styles.errorText}>{errors.business_name}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Owner/Authorized Representative <Text style={styles.urduLabel}>مالک/اختیار شدہ نمائندہ</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.owner_name && styles.inputError]}
            placeholder="Enter Full Name | مکمل نام درج کریں"
            value={formData.owner_name}
            onChangeText={(text) => handleChange('owner_name', text)}
          />
          {errors.owner_name && <Text style={styles.errorText}>{errors.owner_name}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            CNIC No. <Text style={styles.urduLabel}>شناختی کارڈ نمبر</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.cnic && styles.inputError]}
            placeholder="Enter CNIC (13 digits) | شناختی کارڈ درج کریں (13 ہندسے)"
            value={formData.cnic}
            onChangeText={(text) => handleChange('cnic', text)}
            keyboardType="numeric"
            maxLength={13}
          />
          {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Passport No. (Optional) <Text style={styles.urduLabel}>پاسپورٹ نمبر (اختیاری)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Passport No. | پاسپورٹ نمبر درج کریں"
            value={formData.passport}
            onChangeText={(text) => handleChange('passport', text)}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Mobile Number (with WhatsApp) <Text style={styles.urduLabel}>موبائل نمبر (واٹس ایپ کے ساتھ)</Text>
            <RequiredField />
          </Text>
          <TextInput
            style={[styles.input, errors.mobile_number && styles.inputError]}
            placeholder="e.g., 03001234567 | مثال کے طور پر، 03001234567"
            value={formData.mobile_number}
            onChangeText={(text) => handleChange('mobile_number', text)}
            keyboardType="phone-pad"
            maxLength={11}
          />
          {errors.mobile_number && <Text style={styles.errorText}>{errors.mobile_number}</Text>}
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
            Country <Text style={styles.urduLabel}>ملک</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.country_id && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={countries.map(c => ({ label: c.countryname, value: c.id }))}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={loadingCountries ? "Loading countries..." : "Select Country"}
            value={formData.country_id}
            onChange={item => {
              handleChange('country_id', item.value);
              // Reset province and district when country changes
              handleChange('province_id', '');
              handleChange('district_id', '');
              handleChange('province_input', '');
              handleChange('district_input', '');
            }}
            disable={loadingCountries}
          />
          {errors.country_id && <Text style={styles.errorText}>{errors.country_id}</Text>}
        </View>

        {formData.country_id === 130 ? (
          // Pakistan - show province dropdown
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Province <Text style={styles.urduLabel}>صوبہ</Text>
              <RequiredField />
            </Text>
            <Dropdown
              style={[styles.dropdown, errors.province_id && styles.inputError]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={provinces.map(p => ({ label: p.name, value: p.id }))}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={loadingProvinces ? "Loading provinces..." : "Select Province"}
              value={formData.province_id}
              onChange={item => {
                handleChange('province_id', item.value);
                handleChange('province_input', item.label); // Store name in province_input
                handleChange('district_id', '');
                handleChange('district_input', '');
              }}
              disable={loadingProvinces}
            />
            {errors.province_id && <Text style={styles.errorText}>{errors.province_id}</Text>}
          </View>
        ) : (
          // Non-Pakistan - show province text input
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Province/State <Text style={styles.urduLabel}>صوبہ/ریاست</Text>
              <RequiredField />
            </Text>
            <TextInput
              style={[styles.input, errors.province_input && styles.inputError]}
              placeholder="Enter Province/State | صوبہ/ریاست درج کریں"
              value={formData.province_input}
              onChangeText={(text) => handleChange('province_input', text)}
            />
            {errors.province_input && <Text style={styles.errorText}>{errors.province_input}</Text>}
          </View>
        )}

        {formData.country_id === 130 && formData.province_id === 1 ? (
          // Punjab - show district dropdown
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              District <Text style={styles.urduLabel}>ضلع</Text>
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
              placeholder={loadingDistricts ? "Loading districts..." : "Select District"}
              value={formData.district_id}
              onChange={item => {
                handleChange('district_id', item.value);
                handleChange('district_input', item.label); // Store name in district_input
              }}
              disable={loadingDistricts}
            />
            {errors.district_id && <Text style={styles.errorText}>{errors.district_id}</Text>}
          </View>
        ) : (
          // Non-Punjab or non-Pakistan - show district text input
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              District/City <Text style={styles.urduLabel}>ضلع/شہر</Text>
              <RequiredField />
            </Text>
            <TextInput
              style={[styles.input, errors.district_input && styles.inputError]}
              placeholder="Enter District/City | ضلع/شہر درج کریں"
              value={formData.district_input}
              onChangeText={(text) => handleChange('district_input', text)}
            />
            {errors.district_input && <Text style={styles.errorText}>{errors.district_input}</Text>}
          </View>
        )}
        
        <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render step 2 - Business Details
  const renderStep2 = () => {
    return (
      <View style={styles.formStep}>
        <Text style={styles.sectionTitle}>B. Category of Participation</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Select Category <Text style={styles.urduLabel}>کیٹیگری منتخب کریں</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.category && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={categories}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Choose a Category"
            value={formData.category}
            onChange={item => {
              handleChange('category', item.value);
              if (errors.category) {
                setErrors(prev => ({
                  ...prev,
                  category: null,
                }));
              }
            }}
          />
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
        </View>
        
        {formData.category === 'other' && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              If Other, Specify <Text style={styles.urduLabel}>اگر دوسرا، وضاحت کریں</Text>
              <RequiredField />
            </Text>
            <TextInput
              style={[styles.input, errors.other_category && styles.inputError]}
              placeholder="Specify Category (if Other) | کیٹیگری کی وضاحت کریں (اگر دوسرا)"
              value={formData.other_category}
              onChangeText={(text) => handleChange('other_category', text)}
            />
            {errors.other_category && <Text style={styles.errorText}>{errors.other_category}</Text>}
          </View>
        )}
        
        <Text style={styles.sectionTitle}>C. Product/Service Overview</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Brief Description (200-300 words) <Text style={styles.urduLabel}>مختصر معلومات (200-300 الفاظ)</Text>
            <RequiredField />
          </Text>
          <View style={styles.textAreaContainer}>
            <TextInput
              style={[styles.textArea, errors.description && styles.inputError]}
              placeholder="Describe your product or service (200-300 words) | اپنی پروڈکٹ یا سروس کی وضاحت کریں"
              value={formData.description}
              onChangeText={(text) => handleChange('description', text)}
              multiline
              numberOfLines={4}
            />
            <View style={styles.wordCounter}>
              <Text style={[styles.wordCountText, (wordCount < 200 || wordCount > 300) && styles.wordCountError]}>
                {wordCount}/300 words
              </Text>
              {(wordCount < 200 || wordCount > 300) && (
                <Text style={styles.wordCountHint}>
                  {wordCount < 200 ? `Minimum ${200 - wordCount} more words required` : `Maximum ${wordCount - 300} words over limit`}
                </Text>
              )}
            </View>
          </View>
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>
        
        <Text style={styles.sectionSubtitle}>C-1. Customer Base & Business Start Date</Text>
        
        <View style={styles.row}>
          <View style={[styles.inputContainer, {flex: 1, marginRight: 10}]}>
            <Text style={styles.label}>
              Customer Base (Primary Consumers) <Text style={styles.urduLabel}>صارفین کی بنیاد (بنیادی صارفین)</Text>
              <RequiredField />
            </Text>
            <Dropdown
              style={[styles.dropdown, errors.customer_base && styles.inputError]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={customerBases}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder="Select Customer Base"
              value={formData.customer_base}
              onChange={item => handleChange('customer_base', item.value)}
            />
            {errors.customer_base && <Text style={styles.errorText}>{errors.customer_base}</Text>}
          </View>
          
          <View style={[styles.inputContainer, {flex: 1}]}>
            <Text style={styles.label}>
              Business Start Year <Text style={styles.urduLabel}>کاروبار شروع ہونے کا سال</Text>
              <RequiredField />
            </Text>
            <TextInput
              style={[styles.input, errors.start_year && styles.inputError]}
              placeholder="Enter Year | سال درج کریں"
              value={formData.start_year}
              onChangeText={(text) => {
                const numericValue = text.replace(/[^0-9]/g, '');
                handleChange('start_year', numericValue);
              }}
              keyboardType="numeric"
              maxLength={4}
            />
            {errors.start_year && <Text style={styles.errorText}>{errors.start_year}</Text>}
          </View>
        </View>
        
        <Text style={styles.sectionSubtitle}>C-2. Previous Exhibition Participation</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Have you participated in any exhibition before? <Text style={styles.urduLabel}>کیا آپ نے پہلے کسی نمائش میں شرکت کی ہے؟</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.previous_exhibition && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={exhibitionOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select Option"
            value={formData.previous_exhibition}
            onChange={item => handleChange('previous_exhibition', item.value)}
          />
          {errors.previous_exhibition && <Text style={styles.errorText}>{errors.previous_exhibition}</Text>}
        </View>
        
        {formData.previous_exhibition === 'yes' && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Name of Exhibition <Text style={styles.urduLabel}>نمائش کا نام</Text>
                <RequiredField />
              </Text>
              <TextInput
                style={[styles.input, errors.exhibition_name && styles.inputError]}
                placeholder="Enter Exhibition Name | نمائش کا نام درج کریں"
                value={formData.exhibition_name}
                onChangeText={(text) => handleChange('exhibition_name', text)}
              />
              {errors.exhibition_name && <Text style={styles.errorText}>{errors.exhibition_name}</Text>}
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Year of Exhibition <Text style={styles.urduLabel}>نمائش کا سال</Text>
                <RequiredField />
              </Text>
              <TextInput
                style={[styles.input, errors.exhibition_year && styles.inputError]}
                placeholder="Enter Year | سال درج کریں"
                value={formData.exhibition_year}
                onChangeText={(text) => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  handleChange('exhibition_year', numericValue);
                }}
                keyboardType="numeric"
                maxLength={4}
              />
              {errors.exhibition_year && <Text style={styles.errorText}>{errors.exhibition_year}</Text>}
            </View>
          </>
        )}
        
        <Text style={styles.sectionTitle}>D. Space Requirement</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Select Space Option (Subject to WDD approval and availability) 
            <Text style={styles.urduLabel}>جگہ کا آپشن منتخب کریں (ویمن ڈیولپمنٹ ڈیپارٹمنٹ کی منظوری اور دستیابی سے مشروط)</Text>
            <RequiredField />
          </Text>
          <Dropdown
            style={[styles.dropdown, errors.space_requirement && styles.inputError]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={spaceOptions}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Choose a Space Option"
            value={formData.space_requirement}
            onChange={item => handleChange('space_requirement', item.value)}
          />
          {errors.space_requirement && <Text style={styles.errorText}>{errors.space_requirement}</Text>}
        </View>
        
        <Text style={styles.sectionTitle}>E. Social/Digital Presence</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Website / Instagram / Facebook (if any) 
            <Text style={styles.urduLabel}>ویب سائٹ / انسٹاگرام / فیس بک (اگر کوئی ہو)</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.social_presence && styles.inputError]}
            placeholder="Enter Website or Social Media Links | ویب سائٹ یا سوشل میڈیا لنکس درج کریں"
            value={formData.social_presence}
            onChangeText={(text) => handleChange('social_presence', text)}
          />
          {errors.social_presence && <Text style={styles.errorText}>{errors.social_presence}</Text>}
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

  // Render step 3 - Attachments & Declaration
  const renderStep3 = () => {
    return (
      <View style={styles.formStep}>
        <Text style={styles.sectionTitle}>F. Required Attachments</Text>
        
        {/* CNIC Copy Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            CNIC Copy (PDF, JPG, PNG) 
            <Text style={styles.urduLabel}>شناختی کارڈ کی کاپی (پی ڈی ایف، جے پی جی، پی این جی)</Text>
            <RequiredField />
          </Text>
          <View style={styles.fileButtonRow}>
            <TouchableOpacity 
              style={[styles.fileButton, errors.attachment_cnic && styles.inputError, {flex: 1, marginRight: 10}]}
              onPress={() => pickDocument('cnic')}
            >
              <Text style={styles.fileButtonText}>
                {files.cnic ? files.cnic.name : 'Choose File | فائل منتخب کریں'}
              </Text>
              <Icon name="file" size={15} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fileButton, styles.captureButton]}
              onPress={() => captureImage('cnic')}
            >
              <Icon name="plus" size={15} color="#555" />
            </TouchableOpacity>
          </View>
          {files.cnic && files.cnic.uri && (
            <View style={styles.imagePreviewContainer}>
              <View style={styles.imagePreviewWrapper}>
                <Image 
                  source={{ uri: files.cnic.uri }} 
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setFiles(prev => ({ ...prev, cnic: null }))}
                >
                  <Icon name="times" size={12} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {existingRegistration?.attachments?.cnic && !files.cnic && (
            <View style={styles.existingFileContainer}>
              <Text style={styles.existingFileText}>Current file will be kept</Text>
              <TouchableOpacity 
                style={styles.viewExistingFileButton}
                onPress={() => {
                  Alert.alert(
                    'Existing File',
                    'This file will be kept unless you upload a new one',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.viewExistingFileText}>View</Text>
              </TouchableOpacity>
            </View>
          )}
          {errors.attachment_cnic && <Text style={styles.errorText}>{errors.attachment_cnic}</Text>}
        </View>

        {/* Passport Copy Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Passport Copy (Optional, PDF, JPG, PNG) 
            <Text style={styles.urduLabel}>پاسپورٹ کی کاپی (اختیاری، پی ڈی ایف، جے پی جی، پی این جی)</Text>
          </Text>
          <View style={styles.fileButtonRow}>
            <TouchableOpacity 
              style={[styles.fileButton, errors.attachment_passport && styles.inputError, {flex: 1, marginRight: 10}]}
              onPress={() => pickDocument('passport')}
            >
              <Text style={styles.fileButtonText}>
                {files.passport ? files.passport.name : 'Choose File | فائل منتخب کریں'}
              </Text>
              <Icon name="file" size={15} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fileButton, styles.captureButton]}
              onPress={() => captureImage('passport')}
            >
              <Icon name="plus" size={15} color="#555" />
            </TouchableOpacity>
          </View>
          {files.passport && files.passport.uri && (
            <View style={styles.imagePreviewContainer}>
              <View style={styles.imagePreviewWrapper}>
                <Image 
                  source={{ uri: files.passport.uri }} 
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setFiles(prev => ({ ...prev, passport: null }))}
                >
                  <Icon name="times" size={12} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {existingRegistration?.attachments?.passport && !files.passport && (
            <View style={styles.existingFileContainer}>
              <Text style={styles.existingFileText}>Current file will be kept</Text>
              <TouchableOpacity 
                style={styles.viewExistingFileButton}
                onPress={() => {
                  Alert.alert(
                    'Existing File',
                    'This file will be kept unless you upload a new one',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.viewExistingFileText}>View</Text>
              </TouchableOpacity>
            </View>
          )}
          {errors.attachment_passport && <Text style={styles.errorText}>{errors.attachment_passport}</Text>}
        </View>

        {/* Brand Logo Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Brand Logo/Image (JPG, PNG) 
            <Text style={styles.urduLabel}>برانڈ لوگو/تصویر (جے پی جی، پی این جی)</Text>
            <RequiredField />
          </Text>
          <View style={styles.fileButtonRow}>
            <TouchableOpacity 
              style={[styles.fileButton, errors.attachment_logo && styles.inputError, {flex: 1, marginRight: 10}]}
              onPress={() => pickDocument('logo')}
            >
              <Text style={styles.fileButtonText}>
                {files.logo ? files.logo.name : 'Choose File | فائل منتخب کریں'}
              </Text>
              <Icon name="file" size={15} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fileButton, styles.captureButton]}
              onPress={() => captureImage('logo')}
            >
              <Icon name="plus" size={15} color="#555" />
            </TouchableOpacity>
          </View>
          {files.logo && files.logo.uri && (
            <View style={styles.imagePreviewContainer}>
              <View style={styles.imagePreviewWrapper}>
                <Image 
                  source={{ uri: files.logo.uri }} 
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setFiles(prev => ({ ...prev, logo: null }))}
                >
                  <Icon name="times" size={12} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {existingRegistration?.attachments?.logo && !files.logo && (
            <View style={styles.existingFileContainer}>
              <Text style={styles.existingFileText}>Current file will be kept</Text>
              <TouchableOpacity 
                style={styles.viewExistingFileButton}
                onPress={() => {
                  Alert.alert(
                    'Existing File',
                    'This file will be kept unless you upload a new one',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.viewExistingFileText}>View</Text>
              </TouchableOpacity>
            </View>
          )}
          {errors.attachment_logo && <Text style={styles.errorText}>{errors.attachment_logo}</Text>}
        </View>

        {/* Business Registration Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Business Registration (if available, PDF, JPG, PNG) 
            <Text style={styles.urduLabel}>کاروباری رجسٹریشن (اگر دستیاب ہو، پی ڈی ایف، جے پی جی، پی این جی)</Text>
          </Text>
          <View style={styles.fileButtonRow}>
            <TouchableOpacity 
              style={[styles.fileButton, errors.attachment_registration && styles.inputError, {flex: 1, marginRight: 10}]}
              onPress={() => pickDocument('registration')}
            >
              <Text style={styles.fileButtonText}>
                {files.registration ? files.registration.name : 'Choose File | فائل منتخب کریں'}
              </Text>
              <Icon name="file" size={15} color="#555" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fileButton, styles.captureButton]}
              onPress={() => captureImage('registration')}
            >
              <Icon name="plus" size={15} color="#555" />
            </TouchableOpacity>
          </View>
          {files.registration && files.registration.uri && (
            <View style={styles.imagePreviewContainer}>
              <View style={styles.imagePreviewWrapper}>
                <Image 
                  source={{ uri: files.registration.uri }} 
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => setFiles(prev => ({ ...prev, registration: null }))}
                >
                  <Icon name="times" size={12} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          {existingRegistration?.attachments?.registration_doc && !files.registration && (
            <View style={styles.existingFileContainer}>
              <Text style={styles.existingFileText}>Current file will be kept</Text>
              <TouchableOpacity 
                style={styles.viewExistingFileButton}
                onPress={() => {
                  Alert.alert(
                    'Existing File',
                    'This file will be kept unless you upload a new one',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.viewExistingFileText}>View</Text>
              </TouchableOpacity>
            </View>
          )}
          {errors.attachment_registration && <Text style={styles.errorText}>{errors.attachment_registration}</Text>}
        </View>

        {/* Date Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Date <Text style={styles.urduLabel}>تاریخ</Text>
          </Text>
          <TouchableOpacity 
            style={styles.input}
            onPress={showDatepicker}
          >
            <Text>{formData.registration_date}</Text>
          </TouchableOpacity>
        </View>
        
        {/* Declaration Section */}
        <Text style={styles.sectionTitle}>Declaration</Text>
        
        <View style={styles.declarationBox}>
          <Text style={styles.declarationText}>
            I certify that the information provided above is true and correct. I understand that submission of this form does not guarantee stall allocation, which is subject to space availability and WDD approval.
          </Text>
          <Text style={[styles.declarationText, styles.urduText]}>
            میں تصدیق کرتا/کرتی ہوں کہ اوپر دی گئی معلومات درست اور سچی ہیں۔ میں سمجھتا/سمجھتی ہوں کہ اس فارم کی جمع کرانے سے اسٹال کی تخصیص کی ضمانت نہیں ملتی، جو جگہ کی دستیابی اور ڈبلیو ڈی ڈی کی منظوری سے مشروط ہے۔
          </Text>
          <Text style={styles.declarationText}>
            <Text style={{fontWeight: 'bold'}}>Note:</Text> Women Development Department reserves the right to cancel registration or stall allocation at any stage without assigning any reason.
          </Text>
          <Text style={[styles.declarationText, styles.urduText]}>
            نوٹ: ویمن ڈیولپمنٹ ڈیپارٹمنٹ کسی بھی مرحلے پر رجسٹریشن یا اسٹال کی تخصیص منسوخ کرنے کا حق محفوظ رکھتا ہے بغیر کوئی وجہ بتائے۔
          </Text>
        </View>
        
        {/* Checkbox Section */}
        <View style={[styles.inputContainer, {flexDirection: 'row', alignItems: 'center'}]}>
          <TouchableOpacity
            style={[styles.checkbox, formData.declaration_check && styles.checked]}
            onPress={() => handleChange('declaration_check', !formData.declaration_check)}
          >
            {formData.declaration_check && <Icon name="check" size={14} color="white" />}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            I agree to the declaration <Text style={styles.urduLabel}>میں اعلان سے متفق ہوں</Text>
            <RequiredField />
          </Text>
        </View>
        {errors.declaration_check && <Text style={styles.errorText}>{errors.declaration_check}</Text>}
        
        {/* Navigation Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.navButton, styles.prevButton]} onPress={handlePrevious}>
            <Text style={styles.buttonText}>Previous</Text>
          </TouchableOpacity>
          {!isUpdating && (
            <TouchableOpacity 
              style={[styles.navButton, styles.submitButton]} 
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render floating update button
  const renderFloatingUpdateButton = () => {
    if (!showUpdateButton || !isUpdating) return null;

    return (
      <TouchableOpacity 
        style={styles.floatingUpdateButton}
        onPress={handleUpdate}
      >
        <Icon name="save" size={20} color="white" />
        <Text style={styles.floatingUpdateButtonText}>Update</Text>
      </TouchableOpacity>
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
            <Text style={styles.headerTitle}>Promoting Women Entrepreneurship Across Punjab</Text>
            <View style={styles.logoContainer}>
              <Image 
                source={{uri: 'https://cmp.punjab.gov.pk/img/maryam.png'}} 
                style={styles.logo1}
                resizeMode="contain"
              />
              <Image 
                source={Wepx}
                style={styles.logo2}
                resizeMode="contain"
              />
              <Image 
                source={Women}
                style={styles.logo3}
                resizeMode="contain"
              />
            </View>
          </View>
          
          {renderProgressBar()}
          
          <View style={styles.contentContainer}>
            <View style={styles.formContainer}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </View>
          </View>
   {/* <ProgramPopup
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        programType="women-entrepreneurship"
      /> */}
      <AutoRegisterBadge role="expo" />
          {/* Footer Welcome Card */}
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Women Entrepreneurship Expo 2025</Text>
            <Text style={styles.welcomeText}>
              Join us for the largest gathering of women entrepreneurs in Punjab. Showcase your products, network with industry leaders, and grow your business.
            </Text>
            <View style={styles.bulletPoint}>
              <Icon name="check-circle" style={styles.bulletIcon} color="white" size={16} />
              <Text style={styles.bulletText}>Exclusive networking opportunities</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Icon name="check-circle" style={styles.bulletIcon} color="white" size={16} />
              <Text style={styles.bulletText}>Workshops and training sessions</Text>
            </View>
            <View style={styles.bulletPoint}>
              <Icon name="check-circle" style={styles.bulletIcon} color="white" size={16} />
              <Text style={styles.bulletText}>Media coverage and promotion</Text>
            </View>
          </View>
        </ScrollView>
        {renderFloatingUpdateButton()}
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // Background and container styles
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
  
  // Header styles
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
  logo1: {
    width: 100,
    height: 70,
    marginRight: -2,
    borderRadius: 35,
  },
  logo2: {
    width: 100,
    height: 100,
    marginRight: 5,
  },
  logo3: {
    width: 100,
    height: 70,
    marginLeft: 6,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    marginTop: 25,
  },
  
  // Progress bar styles
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
    shadowColor: 'rgba(0,0,0,0.1)',
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
  
  // Content container
  contentContainer: {
    padding: 20,
    paddingTop: 10,
  },
  
  // Form container styles
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
  
  // Section title styles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C2B5E',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#F3E5F5',
  },
  sectionSubtitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#412F63',
    marginBottom: 15,
    marginTop: 15,
  },
  
  // Input field styles
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
    fontWeight: '600',
  },
  urduLabel: {
    fontSize: 12,
    color: '#666',
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
  
  // Dropdown styles
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
    color: '#9E9E9E',
  },
  selectedTextStyle: {
    fontSize: 15,
    color: '#212121',
  },
  
  // File button styles
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
  
  // Row layout for side-by-side inputs
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  
  // Error text styles
  errorText: {
    color: '#ff4444',
    fontSize: 13,
    marginTop: 5,
  },
  
  // Button styles
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
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },
  
  // Floating update button
  floatingUpdateButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#7C2B5E',
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
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Welcome card styles
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
  
  // Declaration styles
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
  
  // Checkbox styles
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
    flex: 1,
  },
  
  // Image preview styles
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imagePreviewWrapper: {
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  
  // Existing file styles
  existingFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  existingFileText: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginRight: 10,
  },
  viewExistingFileButton: {
    padding: 5,
  },
  viewExistingFileText: {
    color: '#1976D2',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  
  // For loader
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
export default WomenEntrepreneurshipRegistrationScreen;