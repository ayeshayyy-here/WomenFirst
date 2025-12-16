import React, {useState, useEffect} from 'react';
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
  PermissionsAndroid,
  Image,
} from 'react-native';
import Loader from '../components/Loader';
import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProgressBar from '../components/ProgressBar';
import {useNavigation} from '@react-navigation/native';
import {DatePickerInput} from 'react-native-paper-dates';
import syncStorage from 'react-native-sync-storage';
import DocumentPicker from 'react-native-document-picker';
import {launchCamera} from 'react-native-image-picker';

const Personal = ({route, navigation}) => {
  const [personalId, setPersonalId] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  
  // Main form data state - ONLY the fields from your requested sections
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    fname: '',
    phone: '',
    mobile: '',
    address: '',
    caddress: '',
    email: '',
    
    // CNIC Information
    cnic: '',
    datee: null,
    dateb: null,
    datei: null,
    disability: '',
    disabilityDetails: '',
    
    // Guardian Information
    gname: '',
    grelationship: '',
    gaddress: '',
    gmobile: '',
    goccupation: '',
    gemail: '',
    
    // Emergency Contact
    ename: '',
    erelationship: '',
    eaddress: '',
    emobile: '',
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [stateFunctions, setStateFunctions] = useState({});
  const [isFocus, setIsFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placesOfIssue, setPlacesOfIssue] = useState([]);
  const [selectedplaceoi, setselectedplaceoi] = useState([]);
  const [maritalStatus, setMaritalStatus] = useState('');
  const [relationship, setRelationship] = useState('');
  const [showDisabilityDetailsInput, setShowDisabilityDetailsInput] = useState(false);

  // Data options
  const relationtype = [
    {id: 1, name: 'Guardian'},
    {id: 2, name: 'Father'},
    {id: 3, name: 'Husband'},
  ];

  const maritalstatus = [
    {id: 1, name: 'Single'},
    {id: 2, name: 'Married'},
    {id: 3, name: 'Widowed'},
    {id: 4, name: 'Divorced'},
  ];

  const yesNoOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];

  // Safe date parsing function
  const parseDate = (dateString) => {
    if (!dateString) return null;
    
    try {
      // Handle different date formats from API
      let date;
      
      // If it's already a Date object
      if (dateString instanceof Date) {
        return dateString;
      }
      
      // If it's a timestamp
      if (typeof dateString === 'number') {
        date = new Date(dateString);
      } 
      // If it's a string
      else if (typeof dateString === 'string') {
        // Remove timezone info if present and try different formats
        const cleanDateString = dateString.split(' ')[0]; // Take only date part
        date = new Date(cleanDateString);
        
        // If still invalid, try with different separators
        if (isNaN(date.getTime())) {
          const parts = cleanDateString.split(/[-/]/);
          if (parts.length === 3) {
            date = new Date(parts[0], parts[1] - 1, parts[2]); // YYYY-MM-DD
          }
        }
      }
      
      // Check if date is valid
      if (date && !isNaN(date.getTime())) {
        return date;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  };

  // Safe date formatting function
  const formatDateForDisplay = (dateValue) => {
    if (!dateValue) return undefined;
    
    const date = parseDate(dateValue);
    if (!date) return undefined;
    
    return date;
  };

  // Safe date formatting for API
  const formatDateForAPI = (dateValue) => {
    if (!dateValue) return null;
    
    const date = parseDate(dateValue);
    if (!date) return null;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch user data on component mount
  useEffect(() => {
    console.log('🔵 COMPONENT MOUNTED - Starting initialization');
    const user = JSON.parse(syncStorage.get('user'));
    console.log('🔵 User from syncStorage:', user);

    if (user) {
      console.log('🔵 Setting initial form data from user:', {
        name: user.name,
        cnic: user.cnic,
        email: user.email,
        phone: user.phone_no
      });
      
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        cnic: user.cnic || '',
        email: user.email || '',
        phone: user.phone_no || '',
      }));
      
      // Also fetch existing personal data using user_id
      console.log('🔵 Calling fetchPersonalData with user ID:', user.id);
      fetchPersonalData(user.id);
    } else {
      console.log('🔴 ERROR: No user found in syncStorage');
    }
  }, []);

  // Fetch places of issue
  useEffect(() => {
    console.log('🔵 Fetching places of issue...');
    fetch('https://wwh.punjab.gov.pk/api/districts')
      .then(response => {
        console.log('🔵 Places of issue API response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('🔵 Places of issue data received:', data);
        setPlacesOfIssue(data.districts || []);
      })
      .catch(error => {
        console.error('🔴 Error fetching places of issue:', error);
      });
  }, []);

  // Fetch existing personal data using user_id
  const fetchPersonalData = async (userId) => {
    console.log('🟡 START fetchPersonalData - User ID:', userId);
    try {
      setLoading(true);
      console.log('🟡 Making API call to getPersonal with user ID:', userId);
      
      const response = await fetch(`https://wwh.punjab.gov.pk/api/getPersonal/${userId}`);
      console.log('🟡 Personal data API response status:', response.status);
      
      const result = await response.json();
      console.log('🟡 Personal data API FULL RESPONSE:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data) {
        const data = result.data;
        console.log('🟢 SUCCESS: Personal data found:', data);
        
        // Set the personal_id from personal_information.id
        if (data.id) {
          console.log('🟢 Setting personalId:', data.id);
          setPersonalId(data.id);
          setDataExists(true); // Data exists, so we can show update button
        } else {
          console.log('🟡 No ID found in personal data');
        }
        
        // Safely parse dates
        const expiryDate = formatDateForDisplay(data.expiry_date);
        const dobDate = formatDateForDisplay(data.dob);
        const issueDate = formatDateForDisplay(data.issue_date);

        console.log('🟡 Parsed dates:', {
          expiryDate,
          dobDate,
          issueDate,
          rawExpiry: data.expiry_date,
          rawDob: data.dob,
          rawIssue: data.issue_date
        });

        setFormData(prev => ({
          ...prev,
          name: data.name || '',
          fname: data.fname || '',
          phone: data.phone_no || '',
          mobile: data.mobile || '',
          address: data.paddress || '',
          caddress: data.caddress || '',
          email: data.email || '',
          cnic: data.cnic || '',
          datee: expiryDate,
          dateb: dobDate,
          datei: issueDate,
          disability: data.disability || '',
          disabilityDetails: data.disability_details || '',
        }));
        
        console.log('🟡 Setting place of issue:', data.Place_issue);
        setselectedplaceoi(data.Place_issue || '');
        console.log('🟡 Setting marital status:', data.marital_status);
        setMaritalStatus(data.marital_status || '');
        
        // Handle disability details visibility
        if (data.disability === 'Yes') {
          console.log('🟡 Disability is Yes, showing details input');
          setShowDisabilityDetailsInput(true);
        }
        
        // Set profile image if exists
        if (data.profile_url) {
          console.log('🟡 Setting profile image URL:', data.profile_url);
          setCapturedImage(data.profile_url);
        }
        
        // Fetch guardian data using personal_id
        if (data.id) {
          console.log('🟡 Calling fetchGuardianData with personal_id:', data.id);
          fetchGuardianData(data.id);
        } else {
          console.log('🔴 Cannot fetch guardian data - no personal_id available');
        }
      } else {
        console.log('🟡 No personal data found or API returned success:false');
        setDataExists(false); // No data exists
      }
    } catch (error) {
      console.error('🔴 Error fetching personal data:', error);
      setDataExists(false);
    } finally {
      setLoading(false);
      console.log('🟡 END fetchPersonalData');
    }
  };

  // Fetch existing guardian data using personal_id
  const fetchGuardianData = async (personalId) => {
    console.log('🟣 START fetchGuardianData - Personal ID:', personalId);
    try {
      console.log('🟣 Making API call to getGdetail-check with personal_id:', personalId);
      const response = await fetch(`https://wwh.punjab.gov.pk/api/getGdetail-check/${personalId}`);
      console.log('🟣 Guardian data API response status:', response.status);
      
      const result = await response.json();
      console.log('🟣 Guardian data API FULL RESPONSE:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data && result.data.length > 0) {
        const guardianData = result.data[0];
        console.log('🟢 SUCCESS: Guardian data found:', guardianData);
        
        setFormData(prev => ({
          ...prev,
          gname: guardianData.gname || '',
          grelationship: guardianData.relationship || '',
          gaddress: guardianData.gaddress || '',
          gmobile: guardianData.gmobile || '',
          goccupation: guardianData.goccupation || '',
          gemail: guardianData.gemail || '',
          ename: guardianData.ename || '',
          erelationship: guardianData.erelationship || '',
          eaddress: guardianData.eaddress || '',
          emobile: guardianData.emobile || '',
        }));
        console.log('🟣 Setting relationship:', guardianData.relationship);
        setRelationship(guardianData.relationship || '');
      } else {
        console.log('🟣 No guardian data found or empty array');
      }
    } catch (error) {
      console.error('🔴 Error fetching guardian data:', error);
    } finally {
      console.log('🟣 END fetchGuardianData');
    }
  };

  const handleInputChange = (name, value) => {
    console.log(`✏️ Input change - ${name}:`, value);
    setFormData({...formData, [name]: value});
  };

  const handledisabilityInputChange = (field, value) => {
    console.log(`✏️ Disability input change - ${field}:`, value);
    setFormData({ ...formData, [field]: value });
    if (field === 'disability' && value === 'Yes') {
      console.log('🟡 Disability set to Yes, showing details input');
      setShowDisabilityDetailsInput(true);
    } else if (field === 'disability' && value === 'No') {
      console.log('🟡 Disability set to No, hiding details input');
      setShowDisabilityDetailsInput(false);
      setFormData((prevData) => ({ ...prevData, disabilityDetails: '' }));
    }
  };

 
  // Create personal record and return the ID
 // Create personal record and return the ID - UPDATED VERSION
const createPersonalRecord = async (userId) => {
  console.log('🟠 START createPersonalRecord - User ID:', userId);
  const formDataToSend = new FormData();
  
  // Log all data being sent
  console.log('🟠 Data being sent to personal API:', {
    user_id: userId,
    name: formData.name,
    fname: formData.fname,
    paddress: formData.address,
    caddress: formData.caddress,
    phone_no: formData.phone,
    mobile: formData.mobile,
    email: formData.email,
    cnic: formData.cnic,
    expiry_date: formatDateForAPI(formData.datee),
    issue_date: formatDateForAPI(formData.datei),
    dob: formatDateForAPI(formData.dateb),
    disability: formData.disability,
    disability_details: formData.disabilityDetails,
    Place_issue: selectedplaceoi,
    marital_status: maritalStatus,
    hasProfileImage: !!stateFunctions[selectedAttachment]?.URI
  });

  formDataToSend.append('user_id', userId);
  formDataToSend.append('name', formData.name || '');
  formDataToSend.append('fname', formData.fname || '');
  formDataToSend.append('paddress', formData.address || '');
  formDataToSend.append('caddress', formData.caddress || '');
  formDataToSend.append('phone_no', formData.phone || '');
  formDataToSend.append('mobile', formData.mobile || '');
  formDataToSend.append('email', formData.email || '');
  formDataToSend.append('cnic', formData.cnic || '');
  formDataToSend.append('expiry_date', formatDateForAPI(formData.datee));
  formDataToSend.append('issue_date', formatDateForAPI(formData.datei));
  formDataToSend.append('dob', formatDateForAPI(formData.dateb));
  formDataToSend.append('disability', formData.disability || '');
  formDataToSend.append('disability_details', formData.disabilityDetails || '');
  formDataToSend.append('Place_issue', selectedplaceoi || '');
  formDataToSend.append('marital_status', maritalStatus || '');

  // Append profile image if exists
  if (stateFunctions[selectedAttachment]?.URI) {
    console.log('🟠 Appending profile image to FormData');
    formDataToSend.append('profile', {
      uri: stateFunctions[selectedAttachment]?.URI,
      type: 'image/jpeg',
      name: 'profile.jpg',
    });
  }

  console.log('🟠 Creating personal record...');
  try {
    const response = await fetch('https://wwh.punjab.gov.pk/api/personal', {
      method: 'POST',
      body: formDataToSend,
    });

    const result = await response.json();
    console.log('🟠 Create Personal API FULL RESPONSE:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('🟢 Personal record created successfully, now fetching the personal_id...');
      
      // 🚨 CRITICAL FIX: After successful creation, fetch the personal data again to get the ID
      console.log('🟠 Fetching personal data to get the personal_id...');
      const fetchResponse = await fetch(`https://wwh.punjab.gov.pk/api/getPersonal/${userId}`);
      const fetchResult = await fetchResponse.json();
      
      console.log('🟠 Fetch personal data after creation:', JSON.stringify(fetchResult, null, 2));
      
      if (fetchResult.success && fetchResult.data && fetchResult.data.id) {
        const personalId = fetchResult.data.id;
        console.log('🟢 SUCCESS: Retrieved personal_id after creation:', personalId);
        
        setPersonalId(personalId);
        setDataExists(true);
        
        // Also update the form with the fetched data to ensure consistency
        if (fetchResult.data) {
          const data = fetchResult.data;
          const expiryDate = formatDateForDisplay(data.expiry_date);
          const dobDate = formatDateForDisplay(data.dob);
          const issueDate = formatDateForDisplay(data.issue_date);

          setFormData(prev => ({
            ...prev,
            name: data.name || '',
            fname: data.fname || '',
            phone: data.phone_no || '',
            mobile: data.mobile || '',
            address: data.paddress || '',
            caddress: data.caddress || '',
            email: data.email || '',
            cnic: data.cnic || '',
            datee: expiryDate,
            dateb: dobDate,
            datei: issueDate,
            disability: data.disability || '',
            disabilityDetails: data.disability_details || '',
          }));
          
          setselectedplaceoi(data.Place_issue || '');
          setMaritalStatus(data.marital_status || '');
          
          if (data.disability === 'Yes') {
            setShowDisabilityDetailsInput(true);
          }
          
          if (data.profile_url) {
            setCapturedImage(data.profile_url);
          }
        }
        
        return personalId;
      } else {
        console.log('🔴 Failed to fetch personal_id after creation');
        return null;
      }
    } else {
      console.log('🔴 Personal record creation failed:', result.message);
      return null;
    }
  } catch (error) {
    console.error('🔴 Error creating personal record:', error);
    return null;
  } finally {
    console.log('🟠 END createPersonalRecord');
  }
};

// Also update the getOrCreatePersonalId function to be more robust
const getOrCreatePersonalId = async (userId) => {
  console.log('🟠 START getOrCreatePersonalId - User ID:', userId);
  try {
    // First, try to get existing personal data to get the personal_id
    console.log('🟠 Checking for existing personal data...');
    const response = await fetch(`https://wwh.punjab.gov.pk/api/getPersonal/${userId}`);
    const result = await response.json();
    console.log('🟠 Existing personal data check result:', result);
    
    if (result.success && result.data && result.data.id) {
      // If personal record exists, return the personal_id
      console.log('🟢 Existing personal record found, ID:', result.data.id);
      return result.data.id;
    } else {
      // If no personal record exists, create one and get the ID
      console.log('🟠 No existing personal record, creating new one...');
      const personalId = await createPersonalRecord(userId);
      return personalId;
    }
  } catch (error) {
    console.error('🔴 Error getting personal ID:', error);
    return null;
  } finally {
    console.log('🟠 END getOrCreatePersonalId');
  }
};

  // Submit guardian information using personal_id
  const submitGuardianInformation = async (personalId) => {
    console.log('🟣 START submitGuardianInformation - Personal ID:', personalId);
    
    const guardianData = {
      personal_id: personalId,
      gname: formData.gname || '',
      relationship: relationship || '',
      gaddress: formData.gaddress || '',
      gmobile: formData.gmobile || '',
      goccupation: formData.goccupation || '',
      gemail: formData.gemail || '',
      ename: formData.ename || '',
      erelationship: formData.erelationship || '',
      eaddress: formData.eaddress || '',
      emobile: formData.emobile || '',
    };

    console.log('🟣 Guardian data being sent:', JSON.stringify(guardianData, null, 2));
    console.log('🟣 Making POST request to guardian API...');
    
    try {
      const response = await fetch('https://wwh.punjab.gov.pk/api/guardian', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guardianData),
      });

      console.log('🟣 Guardian API response status:', response.status);
      const result = await response.json();
      console.log('🟣 Guardian API FULL RESPONSE:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('🟢 SUCCESS: Guardian data submitted successfully');
      } else {
        console.log('🔴 Guardian data submission failed:', result.message);
      }
      
      return result;
    } catch (error) {
      console.error('🔴 Error submitting guardian data:', error);
      return { success: false };
    } finally {
      console.log('🟣 END submitGuardianInformation');
    }
  };

  // Handle initial form submission
  const handleSubmit = async () => {
    console.log('🟢 START handleSubmit');
    
    if (!validateForm()) {
      console.log('🔴 Form validation failed');
      return;
    }

    console.log('🟢 Form validation passed');

    try {
      setLoading(true);
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user?.id;

      console.log('🟢 User ID for submission:', userId);

      if (!userId) {
        ToastAndroid.show('User not found. Please login again.', ToastAndroid.LONG);
        return;
      }

      // Get or create personal_id from personal_information table
      console.log('🟢 Getting or creating personal ID...');
      const personalId = await getOrCreatePersonalId(userId);
      
      console.log('🟢 Received personalId:', personalId);
      
      if (personalId) {
        console.log('🟢 Using personal_id for guardian submission:', personalId);
        
        // Now submit guardian information using the personal_id
        console.log('🟢 Submitting guardian information...');
        const guardianResult = await submitGuardianInformation(personalId);
        
        console.log('🟢 Guardian submission result:', guardianResult);
        
        if (guardianResult.success) {
          ToastAndroid.show('All information saved successfully!', ToastAndroid.LONG);
          setDataExists(true); // Data now exists
          console.log('🟢 ALL DATA SAVED SUCCESSFULLY');
        } else {
          ToastAndroid.show('Personal info saved but guardian info failed.', ToastAndroid.LONG);
          console.log('🔴 Guardian submission failed but personal was saved');
        }
      } else {
        ToastAndroid.show('Failed to create or get personal record.', ToastAndroid.LONG);
        console.log('🔴 Failed to get personalId');
      }
    } catch (error) {
      console.error('🔴 Error in handleSubmit:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
      console.log('🟢 END handleSubmit');
    }
  };

  // Modified handleNextPress to handle navigation to Employment screen
  const handleNextPress = async () => {
    console.log('🔵 START handleNextPress - dataExists:', dataExists);
    
    // If data doesn't exist, validate and submit first
    if (!dataExists) {
      console.log('🔵 No data exists, validating and submitting...');
      if (!validateForm()) {
        console.log('🔴 Form validation failed in handleNextPress');
        return;
      }

      try {
        setLoading(true);
        const user = JSON.parse(syncStorage.get('user'));
        const userId = user?.id;

        if (!userId) {
          ToastAndroid.show('User not found. Please login again.', ToastAndroid.LONG);
          return;
        }

        // Get or create personal_id from personal_information table
        const personalId = await getOrCreatePersonalId(userId);
        
        if (personalId) {
          console.log('🔵 Using personal_id for guardian submission:', personalId);
          
          // Now submit guardian information using the personal_id
          const guardianResult = await submitGuardianInformation(personalId);
          
          if (guardianResult.success) {
            ToastAndroid.show('All information saved successfully!', ToastAndroid.LONG);
            setDataExists(true); // Data now exists
            console.log('🔵 All data saved, navigating to Employment');
            navigation.navigate('Employment'); // Navigate to Employment screen
          } else {
            ToastAndroid.show('Personal info saved but guardian info failed.', ToastAndroid.LONG);
          }
        } else {
          ToastAndroid.show('Failed to create or get personal record.', ToastAndroid.LONG);
        }
      } catch (error) {
        console.error('🔴 Error in handleNextPress:', error);
        ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
      } finally {
        setLoading(false);
      }
    } else {
      // If data exists, directly navigate to Employment screen
      console.log('🔵 Data exists, directly navigating to Employment');
      navigation.navigate('Employment');
    }
    console.log('🔵 END handleNextPress');
  };

  // ... (rest of your component code remains the same - styles, render method, etc.)
const openCamera = async () => {
    setModalVisible(false);
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 2000,
        maxWidth: 2000,
      };

      launchCamera(options, response => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.error) {
          console.log('Camera Error: ', response.error);
        } else {
          const fileName = response.assets[0].fileName;
          const imageUri = response.assets[0].uri;

          setCapturedImage(imageUri);
          setStateFunctions(prev => ({
            ...prev,
            [selectedAttachment]: {
              Name: fileName,
              URI: imageUri,
              Type: 'image',
            },
          }));
        }
      });
    }
  };

  const openGallery = async () => {
    try {
      const response = await DocumentPicker.pick({
        allowMultiSelection: false,
        type: [DocumentPicker.types.images],
      });

      const fileType = response[0].type;
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      if (allowedTypes.includes(fileType)) {
        setStateFunctions(prev => ({
          ...prev,
          [selectedAttachment]: {
            Name: response[0].name,
            URI: response[0].uri,
            Type: fileType,
          },
        }));
      } else {
        alert('Only PNG, JPG, and JPEG files are allowed.');
      }

      setModalVisible(false);
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User canceled the file selection');
      } else {
        console.error('Document picking error:', error);
      }
    }
  };


  const handleUploadClick = attachmentName => {
    setSelectedAttachment(attachmentName);
    setModalVisible(true);
  };
  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user?.id;

      if (!userId) {
        ToastAndroid.show('User not found. Please login again.', ToastAndroid.LONG);
        return;
      }

      // Update personal information
      const personalResult = await updatePersonalInformation(userId);
      
      if (personalResult.success) {
        // Update guardian information
        const guardianResult = await updateGuardianInformation(personalId);
        
        if (guardianResult.success) {
          ToastAndroid.show('Information updated successfully!', ToastAndroid.LONG);
        } else {
          ToastAndroid.show('Personal info updated but guardian info failed.', ToastAndroid.LONG);
        }
      } else {
        ToastAndroid.show('Failed to update personal information.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error updating forms:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  // Update personal information
  const updatePersonalInformation = async (userId) => {
    const formDataToSend = new FormData();
    formDataToSend.append('user_id', userId);
    formDataToSend.append('name', formData.name || '');
    formDataToSend.append('fname', formData.fname || '');
    formDataToSend.append('paddress', formData.address || '');
    formDataToSend.append('caddress', formData.caddress || '');
    formDataToSend.append('phone_no', formData.phone || '');
    formDataToSend.append('mobile', formData.mobile || '');
    formDataToSend.append('email', formData.email || '');
    formDataToSend.append('cnic', formData.cnic || '');
    formDataToSend.append('expiry_date', formatDateForAPI(formData.datee));
    formDataToSend.append('issue_date', formatDateForAPI(formData.datei));
    formDataToSend.append('dob', formatDateForAPI(formData.dateb));
    formDataToSend.append('disability', formData.disability || '');
    formDataToSend.append('disability_details', formData.disabilityDetails || '');
    formDataToSend.append('Place_issue', selectedplaceoi || '');
    formDataToSend.append('marital_status', maritalStatus || '');

    // Append profile image if exists
    if (stateFunctions[selectedAttachment]?.URI) {
      formDataToSend.append('profile', {
        uri: stateFunctions[selectedAttachment]?.URI,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }

    console.log('Updating personal record...');
    try {
      const response = await fetch('https://wwh.punjab.gov.pk/api/personal', {
        method: 'POST', // Your API should handle updates with POST
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Update Personal API Response:', result);
      return result;
    } catch (error) {
      console.error('Error updating personal record:', error);
      return { success: false };
    }
  };

  // Update guardian information
  const updateGuardianInformation = async (personalId) => {
    const guardianData = {
      personal_id: personalId,
      gname: formData.gname || '',
      relationship: relationship || '',
      gaddress: formData.gaddress || '',
      gmobile: formData.gmobile || '',
      goccupation: formData.goccupation || '',
      gemail: formData.gemail || '',
      ename: formData.ename || '',
      erelationship: formData.erelationship || '',
      eaddress: formData.eaddress || '',
      emobile: formData.emobile || '',
    };

    console.log('Updating guardian data with personal_id:', personalId, guardianData);
    try {
      const response = await fetch('https://wwh.punjab.gov.pk/api/guardian', {
        method: 'POST', // Your API should handle updates with POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guardianData),
      });

      const result = await response.json();
      console.log('Update Guardian API Response:', result);
      return result;
    } catch (error) {
      console.error('Error updating guardian data:', error);
      return { success: false };
    }
  };

const validateForm = () => {
    // Validate personal information fields
    if (!capturedImage && !stateFunctions[selectedAttachment]?.URI) {
      ToastAndroid.show('Please capture or upload your profile image.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.name) {
      ToastAndroid.show('Please enter your name.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.address) {
      ToastAndroid.show('Please enter your address.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.phone || formData.phone.length !== 11) {
      ToastAndroid.show('Please enter a valid 11-digit phone number.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.cnic.trim() || formData.cnic.length !== 13) {
      ToastAndroid.show('Please enter a valid 13-digit CNIC number.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.datee) {
      ToastAndroid.show('Please select expiry date.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.dateb) {
      ToastAndroid.show('Please select date of birth.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.datei) {
      ToastAndroid.show('Please select issue date.', ToastAndroid.LONG);
      return false;
    }
    if (!selectedplaceoi) {
      ToastAndroid.show('Please select place of issue.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.disability) {
      ToastAndroid.show('Please select disability status.', ToastAndroid.LONG);
      return false;
    }
    if (!maritalStatus) {
      ToastAndroid.show('Please select marital status.', ToastAndroid.LONG);
      return false;
    }

    // Validate guardian information
    if (!formData.gname) {
      ToastAndroid.show('Please enter guardian name.', ToastAndroid.LONG);
      return false;
    }
    if (!relationship) {
      ToastAndroid.show('Please select relationship.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.ename) {
      ToastAndroid.show('Please enter emergency contact name.', ToastAndroid.LONG);
      return false;
    }

    return true;
  };


  // Modified handleNextPress to handle navigation to Employment screen
  
  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Text style={styles.header}>Application Form</Text>
      <ProgressBar step={1} />

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Personal Information</Text>
        <View style={styles.divider} />

        {/* Display image or upload icon based on capturedImage */}
        {!capturedImage && !stateFunctions[selectedAttachment]?.URI ? (
          <View style={styles.iconWrapper}>
            <Text style={styles.iconText}>Choose or Upload Profile Image</Text>
            <TouchableOpacity
              onPress={() => handleUploadClick('profileImage')}
              style={styles.iconWrapper}>
              <Icon name="upload" size={30} color="black" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: capturedImage || stateFunctions[selectedAttachment]?.URI,
              }}
              style={styles.image}
            />
          </View>
        )}

        <Text style={styles.text}>Applicant's Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Applicant Name"
          placeholderTextColor="grey"
          value={formData.name}
          onChangeText={text => handleInputChange('name', text)}
        />
        <Text style={styles.text}>Father's/Husband's Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Father's/Husband's Name"
          placeholderTextColor="grey"
          value={formData.fname}
          onChangeText={text => handleInputChange('fname', text)}
        />
        <Text style={styles.text}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone Number"
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={formData.phone}
          onChangeText={text => handleInputChange('phone', text)}
        />
        <Text style={styles.text}>Mobile Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile Number"
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={formData.mobile}
          onChangeText={text => handleInputChange('mobile', text)}
        />
        <Text style={styles.text}>Permanent Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          placeholderTextColor="grey"
          value={formData.address}
          onChangeText={text => handleInputChange('address', text)}
        />
        <Text style={styles.text}>Current Residential Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          placeholderTextColor="grey"
          value={formData.caddress}
          onChangeText={text => handleInputChange('caddress', text)}
        />
        <Text style={styles.text}>Email Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          placeholderTextColor="grey"
          value={formData.email}
          onChangeText={text => handleInputChange('email', text)}
        />
      </View>

      {/* CNIC Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>CNIC Information</Text>
        <View style={styles.divider} />
        <Text style={styles.text}>CNIC:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter CNIC"
          keyboardType="numeric"
          placeholderTextColor="grey"
          maxLength={13}
          value={formData.cnic}
          onChangeText={text => handleInputChange('cnic', text)}
        />
     
        <Text style={[styles.text, {marginTop: '5%'}]}>Issuance Date:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label=""
            value={formData.datei}
            onChange={datei => setFormData(prev => ({...prev, datei}))}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>   
        <Text style={[styles.text, {marginTop: '5%'}]}>Expiry Date:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label=""
            value={formData.datee}
            onChange={datee => setFormData(prev => ({...prev, datee}))}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>
        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Birth (As per CNIC):</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label=""
            value={formData.dateb}
            onChange={dateb => setFormData(prev => ({...prev, dateb}))}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>
        <Text style={[styles.text, {marginTop: '10%'}]}>Place of Issue:</Text>
        <Dropdown
          style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          search
          searchPlaceholder="Search..."
          data={placesOfIssue}
          labelField="name"
          valueField="name"
          placeholder="Select an option"
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          value={selectedplaceoi}
          onChange={item => setselectedplaceoi(item.name)}
        />

        <Text style={[styles.text, {marginTop: 20}]}>Any Physical Disability:</Text>
        <Dropdown
          style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          data={yesNoOptions}
          labelField="label"
          valueField="value"
          placeholder="Select Yes or No"
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          value={formData.disability}
          onChange={(item) => handledisabilityInputChange('disability', item.value)}
        />

        {showDisabilityDetailsInput && (
          <>
            <Text style={[styles.text, { marginTop: 20 }]}>Please provide details:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter details about the disability"
              value={formData.disabilityDetails}
              onChangeText={(text) => handleInputChange('disabilityDetails', text)}
            />
          </>
        )}
        
        <Text style={styles.text}>Marital Status:</Text>
        <Dropdown
          style={[styles.input, isFocus && {borderColor: '#1E577C'}]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          search
          searchPlaceholder="Search..."
          data={maritalstatus}
          labelField="name"
          valueField="name"
          placeholder="Select an option"
          onFocus={() => setIsFocus(true)}
          value={maritalStatus}
          onChange={(item) => setMaritalStatus(item.name)}
        />
      </View>

      {/* Guardian Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Guardian Information</Text>
        <View style={styles.divider} />

        <Text style={styles.text}>Father/Husband/Guardian Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Name"
          placeholderTextColor="grey"
          value={formData.gname}
          onChangeText={text => handleInputChange('gname', text)}
        />
        
        <Text style={styles.text}>Relationship:</Text>
        <Dropdown
          style={[styles.input, isFocus && {borderColor: '#1E577C'}]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          search
          searchPlaceholder="Search..."
          data={relationtype}
          labelField="name"
          valueField="name"
          placeholder="Select an option"
          onFocus={() => setIsFocus(true)}
          value={relationship}
          onChange={(item) => setRelationship(item.name)}
        />
        
        <Text style={styles.text}>Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          placeholderTextColor="grey"
          value={formData.gaddress}
          onChangeText={text => handleInputChange('gaddress', text)}
        />
        
        <Text style={styles.text}>Mobile No:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Mobile No"
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={formData.gmobile}
          onChangeText={text => handleInputChange('gmobile', text)}
        />
        
        <Text style={styles.text}>Occupation:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Occupation"
          placeholderTextColor="grey"
          value={formData.goccupation}
          onChangeText={text => handleInputChange('goccupation', text)}
        />
        
        <Text style={styles.text}>Email Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email Address"
          placeholderTextColor="grey"
          value={formData.gemail}
          onChangeText={text => handleInputChange('gemail', text)}
        />
      </View>

      {/* Emergency Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Person to be informed in case of emergency</Text>
        <View style={styles.divider} />
        
        <Text style={styles.text}>Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Name"
          placeholderTextColor="grey"
          value={formData.ename}
          onChangeText={text => handleInputChange('ename', text)}
        />
        
        <Text style={styles.text}>Relationship:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Relationship"
          placeholderTextColor="grey"
          value={formData.erelationship}
          onChangeText={text => handleInputChange('erelationship', text)}
        />
        
        <Text style={styles.text}>Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          placeholderTextColor="grey"
          value={formData.eaddress}
          onChangeText={text => handleInputChange('eaddress', text)}
        />
        
        <Text style={styles.text}>Mobile No:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Mobile No"
          placeholderTextColor="grey"
          keyboardType="numeric"
          maxLength={11}
          value={formData.emobile}
          onChangeText={text => handleInputChange('emobile', text)}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Choose an option</Text>
                <View style={styles.modalOptionsRow}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={openCamera}>
                    <Icon name="camera" size={30} color="black" />
                    <Text style={styles.modalButtonText}>Capture Image</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={openGallery}>
                    <Icon name="file" size={30} color="black" />
                    <Text style={styles.modalButtonText}>Upload File</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      
      <Loader loading={loading} />
      
      {/* Button Container */}
      <View style={styles.buttonContainer}>
        {dataExists ? (
          // Show Update and Next buttons when data exists
          <>
            <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNextPress}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Show Submit button when no data exists
          <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};



// Updated styles with new button styles
const styles = StyleSheet.create({
  screenContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    flexGrow: 1,
  },
  divider: {
    height: 0.2,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  iconWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    marginVertical: 20,
  },
  iconText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
    padding: 10,
  },
  calenderstyle: {
    height: 50,
    backgroundColor: '#fff',
  },
  detail: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#010048',
  },
  sectionHead: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#010048',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 5,
    color: 'black',
  },
  textt: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 5,
    color: 'black',
  },
  input: {
    flex: 1,
    color: 'black',
    backgroundColor: 'white',
    borderRadius: 4,
    height: 40,
    borderWidth: 0.2,
    borderColor: 'grey',
    marginBottom: 8,
    paddingLeft: 10,
    fontSize: 12,
    justifyContent: 'center',
  },
  placeholderStyle: {
    color: 'grey',
    paddingHorizontal: 5,
    fontSize: 12,
  },
  selectedTextStyle: {
    color: 'black',
    fontSize: 13,
  },
  inputSearchStyle: {
    color: 'black',
    backgroundColor: 'white',
    borderRadius: 4,
    height: 35,
    borderWidth: 0.2,
    marginBottom: 8,
    marginTop: 8,
    paddingLeft: 10,
    fontSize: 12,
  },
  itemTextStyle: {
    color: 'black',
    borderColor: 'grey',
    marginBottom: 2,
    paddingLeft: 10,
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitButton: {
    backgroundColor: '#12311aff', // Green color for submit
  },
  updateButton: {
    backgroundColor: '#9c9274ff', // Yellow color for update
  },
  nextButton: {
    backgroundColor: '#203b58ff', // Blue color for next
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  datePickerWrapper: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  modalButtonText: {
    color: '#010048',
    fontSize: 16,
    marginLeft: 10,
    marginTop: 10,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderRadius: 50,
    width: 100,
    height: 100,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 50,
  },
});

export default Personal;