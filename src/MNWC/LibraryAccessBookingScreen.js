import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  PermissionsAndroid,
  Modal,
  TouchableWithoutFeedback,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import SyncStorage from 'react-native-sync-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// ============ API CONFIGURATION ============
const API_BASE_URL = 'https://mnwc-wdd.punjab.gov.pk/api';

// ============ THEME CONSTANTS ============
const COLORS = {
  primary: '#120221',
  primaryLight: '#9d44f1',
  primaryDark: '#4c0f80',
  primaryGradient: ['#291d34', '#461a6d', '#402f2f'],
  primarySoft: '#f5f3ff',
  secondary: '#f8f9fa',
  background: '#f4f7fb',
  surface: '#ffffff',
  text: '#2c3e50',
  textLight: '#5e6f8d',
  textLighter: '#8a9bb5',
  border: '#e2e8f0',
  borderFocus: '#9333ea',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  white: '#ffffff',
  black: '#1e293b',
  overlay: 'rgba(0,0,0,0.5)',
  shadow: '#000000',
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a5',
    900: '#581c87',
  }
};

const LibraryAccessBookingScreen = ({ route, navigation }) => {
     const { user_id, user } = route.params || {};
  // ============ STATE MANAGEMENT ============
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [accessType, setAccessType] = useState('temporary');
  const [showUsageSection, setShowUsageSection] = useState(false);
  const [showOtherPurpose, setShowOtherPurpose] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [activeImagePicker, setActiveImagePicker] = useState(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  
  const booking = route.params?.booking || null;
  const isEditMode = !!booking;

  // Form state
  const [formData, setFormData] = useState({
    applicant_name: '',
    cnic: '',
    contact: '',
    email: '',
    applicant_pic: null,
    cnic_pic: null,
    access_type: 'temporary',
    hours_required: '',
    purpose: '',
    other_purpose: '',
    consent: false,
  });

  // Image preview states
  const [imagePreviews, setImagePreviews] = useState({
    applicant_pic: null,
    cnic_pic: null,
  });

  // Load user profile from sync storage
  useEffect(() => {
    loadUserProfile();
    if (booking) {
      loadBookingData();
    }
  }, []);

  useEffect(() => {
    setShowUsageSection(accessType === 'temporary');
  }, [accessType]);

  const loadUserProfile = () => {
    try {
      const userProfile = SyncStorage.get('user_profile');
      if (userProfile) {
        const userData = JSON.parse(userProfile);
        setFormData(prev => ({
          ...prev,
          applicant_name: userData.name || '',
          cnic: userData.cnic || '',
          contact: userData.contact || '',
          email: userData.email || '',
        }));
      }
    } catch (error) {
      console.log('Error loading user profile:', error);
    }
  };

  const loadBookingData = () => {
    if (booking) {
      setFormData({
        ...booking,
        applicant_pic: booking.applicant_pic ? { uri: booking.applicant_pic } : null,
        cnic_pic: booking.cnic_pic ? { uri: booking.cnic_pic } : null,
      });
      setImagePreviews({
        applicant_pic: booking.applicant_pic || null,
        cnic_pic: booking.cnic_pic || null,
      });
      setAccessType(booking.access_type || 'temporary');
      setShowOtherPurpose(booking.purpose === 'other');
      if (booking.time_slots) {
        setSelectedTimeSlots(booking.time_slots);
      }
    }
  };

  // ============ PERMISSION HANDLING ============
  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            {
              title: 'Photos Access Permission',
              message: 'App needs access to your photos to upload images.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            {
              title: 'Storage Access Permission',
              message: 'App needs access to your storage to upload images.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera access to take photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Camera permission error:', err);
        return false;
      }
    }
    return true;
  };

  // ============ IMAGE PICKER FUNCTIONS ============
  const openCamera = async () => {
    setShowImagePickerModal(false);
    
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera permission is required to take photos');
        return;
      }

      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 1000,
        maxWidth: 1000,
        quality: 0.8,
        saveToPhotos: false,
      };

      launchCamera(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.error) {
          Alert.alert('Error', 'Failed to capture image. Please try again.');
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          
          if (asset.fileSize > 10 * 1024 * 1024) {
            Alert.alert('Error', 'Image size should be less than 10MB');
            return;
          }

          const imageFile = {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `camera_${Date.now()}.jpg`,
            fileSize: asset.fileSize,
          };

          setImagePreviews(prev => ({
            ...prev,
            [activeImagePicker]: asset.uri
          }));

          handleInputChange(activeImagePicker, imageFile);
        }
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to access camera');
    }
  };

  const openGallery = async () => {
    setShowImagePickerModal(false);
    
    try {
      const hasPermission = await requestGalleryPermission();
 
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 1000,
        maxWidth: 1000,
        quality: 0.8,
        selectionLimit: 1,
      };

      launchImageLibrary(options, (response) => {
        if (response.didCancel) {
          console.log('User cancelled gallery');
        } else if (response.error) {
          Alert.alert('Error', 'Failed to open gallery. Please try again.');
        } else if (response.assets && response.assets[0]) {
          const asset = response.assets[0];
          
          const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
          if (!allowedTypes.includes(asset.type)) {
            Alert.alert('Error', 'Only PNG, JPG, and JPEG files are allowed.');
            return;
          }

          if (asset.fileSize > 10 * 1024 * 1024) {
            Alert.alert('Error', 'Image size should be less than 10MB');
            return;
          }

          const imageFile = {
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `gallery_${Date.now()}.jpg`,
            fileSize: asset.fileSize,
          };

          setImagePreviews(prev => ({
            ...prev,
            [activeImagePicker]: asset.uri
          }));

          handleInputChange(activeImagePicker, imageFile);
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const handleImagePick = (field) => {
    setActiveImagePicker(field);
    setShowImagePickerModal(true);
  };

  const removeImage = (field) => {
    Alert.alert(
      'Remove Image',
      'Are you sure you want to remove this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setImagePreviews(prev => ({
              ...prev,
              [field]: null
            }));
            handleInputChange(field, null);
          }
        }
      ]
    );
  };

  // ============ TIME SLOT GENERATION ============
  const generateTimeSlots = (hours) => {
    if (!hours) {
      setTimeSlots([]);
      return;
    }

    const numSlots = parseFloat(hours) * 2;
    const slots = [];
    const startHour = 9;

    for (let i = 0; i < numSlots; i++) {
      const hour = startHour + Math.floor(i / 2);
      const minutes = (i % 2) * 30;
      const endMinutes = (minutes + 30) % 60;
      const endHour = hour + (minutes + 30 >= 60 ? 1 : 0);

      const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} – ${endHour.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      
      slots.push({
        id: `slot_${i}`,
        label: timeString,
        value: timeString,
      });
    }

    setTimeSlots(slots);
    setSelectedTimeSlots([]);
  };

  const toggleTimeSlot = (slotValue) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(slotValue)) {
        return prev.filter(s => s !== slotValue);
      } else {
        return [...prev, slotValue];
      }
    });
  };

  // ============ FORM HANDLERS ============
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'hours_required') {
        generateTimeSlots(value);
      }
      
      if (field === 'purpose') {
        setShowOtherPurpose(value === 'other');
        if (value !== 'other') {
          newData.other_purpose = '';
        }
      }
      
      return newData;
    });
  };

  const handleAccessTypeChange = (type) => {
    setAccessType(type);
    handleInputChange('access_type', type);
    if (type === 'membership') {
      handleInputChange('hours_required', '');
      setSelectedTimeSlots([]);
    }
  };

  // ============ FORM VALIDATION ============
  const validateForm = () => {
    if (!formData.applicant_name?.trim()) {
      Alert.alert('Validation Error', 'Name of applicant is required');
      return false;
    }
    if (!formData.cnic?.trim()) {
      Alert.alert('Validation Error', 'CNIC number is required');
      return false;
    }
    if (!/^\d{13}$/.test(formData.cnic)) {
      Alert.alert('Validation Error', 'CNIC must be exactly 13 digits');
      return false;
    }
    if (!formData.contact?.trim()) {
      Alert.alert('Validation Error', 'Contact number is required');
      return false;
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (!formData.access_type) {
      Alert.alert('Validation Error', 'Please select access type');
      return false;
    }

    if (formData.access_type === 'temporary') {
      if (!formData.hours_required) {
        Alert.alert('Validation Error', 'Please select number of hours/slots required');
        return false;
      }
      if (selectedTimeSlots.length === 0) {
        Alert.alert('Validation Error', 'Please select at least one time slot');
        return false;
      }
      if (selectedTimeSlots.length !== parseFloat(formData.hours_required) * 2) {
        Alert.alert('Validation Error', `Please select ${parseFloat(formData.hours_required) * 2} time slots`);
        return false;
      }
    }

    if (!formData.purpose) {
      Alert.alert('Validation Error', 'Please select purpose of visit');
      return false;
    }

    if (formData.purpose === 'other' && !formData.other_purpose?.trim()) {
      Alert.alert('Validation Error', 'Please specify your purpose');
      return false;
    }

    if (!isEditMode) {
      if (!formData.applicant_pic) {
        Alert.alert('Validation Error', 'Applicant picture is required');
        return false;
      }
      if (!formData.cnic_pic) {
        Alert.alert('Validation Error', 'CNIC picture is required');
        return false;
      }
    }

    if (!formData.consent) {
      Alert.alert('Validation Error', 'You must agree to the terms and conditions');
      return false;
    }

    return true;
  };

  // ============ API SUBMISSION ============
  const submitBooking = async () => {
    try {
      const apiFormData = new FormData();
      
      const textFields = {
         user_id: user_id, 
        applicant_name: formData.applicant_name,
        cnic: formData.cnic,
        contact: formData.contact,
        email: formData.email || '',
        access_type: formData.access_type,
        purpose: formData.purpose,
        other_purpose: formData.other_purpose || '',
        consent: formData.consent ? '1' : '0',
      };

      if (formData.access_type === 'temporary') {
        textFields.hours_required = formData.hours_required;
      }

      Object.entries(textFields).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          apiFormData.append(key, value.toString());
        }
      });

      if (selectedTimeSlots.length > 0) {
        selectedTimeSlots.forEach(slot => {
          apiFormData.append('time_slots[]', slot);
        });
      }

      const imageFields = [
        { key: 'applicant_pic', value: formData.applicant_pic },
        { key: 'cnic_pic', value: formData.cnic_pic },
      ];

      imageFields.forEach(({ key, value }) => {
        if (value && value.uri) {
          apiFormData.append(key, {
            uri: value.uri,
            type: value.type || 'image/jpeg',
            name: value.name || `${key}_${Date.now()}.jpg`,
          });
        }
      });

      const response = await fetch(`${API_BASE_URL}/library-access`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: apiFormData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit request');
      }

      return responseData;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const response = await submitBooking();
      Alert.alert(
        'Success',
        response.message || 'Library access request submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to submit request. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============ RENDER FUNCTIONS ============
  const renderLabel = (text, required = false, helper = '') => (
    <View style={styles.labelContainer}>
      <Text style={styles.labelText}>{text}</Text>
      {required && <Text style={styles.requiredStar}>*</Text>}
      {helper ? <Text style={styles.helperText}>{helper}</Text> : null}
    </View>
  );

  const renderInput = (label, field, options = {}) => (
    <View style={styles.inputGroup}>
      {renderLabel(label, options.required, options.helper)}
      <View style={[
        styles.inputWrapper,
        focusedInput === field && styles.inputWrapperFocused
      ]}>
        <TextInput
          style={[styles.input, options.multiline && styles.textArea]}
          placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor={COLORS.textLighter}
          value={formData[field]}
          onChangeText={(text) => handleInputChange(field, text)}
          keyboardType={options.keyboardType || 'default'}
          maxLength={options.maxLength}
          multiline={options.multiline}
          numberOfLines={options.numberOfLines}
          editable={!options.disabled}
          onFocus={() => setFocusedInput(field)}
          onBlur={() => setFocusedInput(null)}
        />
      </View>
    </View>
  );

  const renderImagePicker = (field, label, required = false, helper = '') => (
    <View style={styles.imagePickerGroup}>
      {renderLabel(label, required, helper)}
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={() => handleImagePick(field)}
        activeOpacity={0.9}
      >
        {imagePreviews[field] || formData[field]?.uri ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: imagePreviews[field] || formData[field]?.uri }} 
              style={styles.previewImage} 
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.previewOverlay}
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => removeImage(field)}
            >
              <Icon name="close-circle" size={22} color={COLORS.error} />
            </TouchableOpacity>
            <View style={styles.previewBadge}>
              <Icon name="check-decagram" size={16} color={COLORS.success} />
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <LinearGradient
              colors={[COLORS.primarySoft, '#fff']}
              style={styles.placeholderIconContainer}
            >
              <Icon name="camera-plus" size={24} color={COLORS.primary} />
            </LinearGradient>
            <Text style={styles.placeholderText}>Tap to upload {label}</Text>
            <Text style={styles.placeholderSubtext}>PNG, JPG • Max 10MB</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPicker = (label, field, items, required = false) => (
    <View style={styles.inputGroup}>
      {renderLabel(label, required)}
      <View style={[
        styles.pickerWrapper,
        focusedInput === field && styles.pickerWrapperFocused
      ]}>
        <Picker
          selectedValue={formData[field]}
          onValueChange={(value) => handleInputChange(field, value)}
          style={styles.picker}
          dropdownIconColor={COLORS.primary}
          onFocus={() => setFocusedInput(field)}
          onBlur={() => setFocusedInput(null)}
        >
          <Picker.Item 
            label={`Select ${label}`} 
            value="" 
            color={COLORS.textLighter}
          />
          {items.map((item, index) => (
            <Picker.Item 
              key={index} 
              label={item.label} 
              value={item.value} 
              color={COLORS.text}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  const renderRadioGroup = (label, field, options, required = false) => (
    <View style={styles.inputGroup}>
      {renderLabel(label, required)}
      <View style={styles.radioGroupContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.radioItem}
            onPress={() => handleAccessTypeChange(option.value)}
          >
            <View style={[
              styles.radioCircle,
              accessType === option.value && styles.radioCircleSelected
            ]}>
              {accessType === option.value && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={[
              styles.radioText,
              accessType === option.value && styles.radioTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderInfoBar = () => (
    <LinearGradient 
      colors={['#fff', COLORS.primarySoft]} 
      style={styles.infoBar}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.infoItem}>
        <View style={styles.infoIconContainer}>
          <Icon name="clock-outline" size={12} color={COLORS.primary} />
        </View>
        <Text style={styles.infoText}>
          <Text style={styles.infoTextBold}>9:00 AM – 5:00 PM</Text>
        </Text>
      </View>
      <View style={styles.infoDivider} />
      <View style={styles.infoItem}>
        <View style={styles.infoIconContainer}>
          <Icon name="timer-outline" size={12} color={COLORS.primary} />
        </View>
        <Text style={styles.infoText}>
          <Text style={styles.infoTextBold}>30 min slots</Text>
        </Text>
      </View>
      <View style={styles.infoDivider} />
      <View style={styles.infoItem}>
        <View style={styles.infoIconContainer}>
          <Icon name="book-open-page-variant" size={12} color={COLORS.primary} />
        </View>
        <Text style={styles.infoText}>
          <Text style={styles.infoTextBold}>E-Library: Coming Soon</Text>
        </Text>
      </View>
    </LinearGradient>
  );

  const renderImportantNotes = () => (
    <LinearGradient 
      colors={['#fffbeb', '#fef3c7']} 
      style={styles.notesContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.notesHeader}>
        <View style={styles.notesIconContainer}>
          <Icon name="alert-circle-outline" size={14} color="#b45309" />
        </View>
        <Text style={styles.notesTitle}>Important Instructions</Text>
      </View>
      {[
        'Quiet study and reading only',
        'Maintain silence and cleanliness',
        'Handle books and furniture with care',
        'E-Library services coming soon',
      ].map((text, index) => (
        <View key={index} style={styles.noteItem}>
          <View style={styles.noteBullet} />
          <Text style={styles.noteText}>{text}</Text>
        </View>
      ))}
    </LinearGradient>
  );

  const renderInfoBox = () => (
    <LinearGradient 
      colors={['#e0f2fe', '#bae6fd']} 
      style={styles.infoBox}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <Icon name="information" size={14} color="#0284c7" />
      <Text style={styles.infoBoxText}>
        Library Members may access the facility as per MNWC library policies.
      </Text>
    </LinearGradient>
  );

  const renderTimeSlots = () => {
    if (timeSlots.length === 0) return null;

    return (
      <View style={styles.timeSlotsContainer}>
        <Text style={styles.timeSlotsLabel}>Select your preferred time slots:</Text>
        <View style={styles.timeSlotsGrid}>
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlotItem,
                selectedTimeSlots.includes(slot.value) && styles.timeSlotItemSelected
              ]}
              onPress={() => toggleTimeSlot(slot.value)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.timeSlotText,
                selectedTimeSlots.includes(slot.value) && styles.timeSlotTextSelected
              ]}>
                {slot.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {selectedTimeSlots.length > 0 && (
          <View style={styles.selectedCountContainer}>
            <Icon name="check-circle" size={12} color={COLORS.success} />
            <Text style={styles.selectedCount}>
              {selectedTimeSlots.length} slot(s) selected
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ============ MAIN RENDER ============
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient 
        colors={COLORS.primaryGradient} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={18} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Library Access Registration
            </Text>
            <Text style={styles.headerSubtitle}>Complete the form below</Text>
          </View>
          
          <View style={styles.headerRight}>
            <Icon name="book" size={20} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Bar */}
        {renderInfoBar()}

        {/* Step 1: Access Type Selection */}
        <View style={styles.section}>
          <LinearGradient
            colors={['transparent', COLORS.primarySoft]}
            style={styles.sectionHeaderGradient}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Icon name="format-list-checks" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Step 1: Select Access Type</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            {renderRadioGroup('Type of Request', 'access_type', [
              { label: 'Temporary Library Use', value: 'temporary' },
              { label: 'Library Membership', value: 'membership' },
            ], true)}
            <Text style={styles.sectionDescription}>
              <Icon name="information-outline" size={10} color={COLORS.textLight} />
              {' '}E-Library services coming soon
            </Text>
          </View>
        </View>

        {/* Section A: Applicant Information */}
        <View style={styles.section}>
          <LinearGradient
            colors={['transparent', COLORS.primarySoft]}
            style={styles.sectionHeaderGradient}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Icon name="card-account-details" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Section A: Applicant Information</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            {renderInput('Name of Women Applicant', 'applicant_name', { 
              required: true,
              placeholder: 'Enter your full name'
            })}
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                {renderInput('CNIC Number', 'cnic', { 
                  keyboardType: 'numeric', 
                  maxLength: 13,
                  placeholder: '1234512345671',
                  required: true,
                  helper: '13 digits'
                })}
              </View>
              <View style={styles.halfWidth}>
                {renderInput('Contact', 'contact', { 
                  keyboardType: 'phone-pad',
                  placeholder: '03XXXXXXXXX',
                  required: true,
                })}
              </View>
            </View>
            
            {renderInput('Email Address', 'email', { 
              keyboardType: 'email-address',
              placeholder: 'your.email@example.com',
              helper: 'Optional'
            })}

            <View style={styles.uploadsRow}>
              <View style={styles.halfWidth}>
                {renderImagePicker('applicant_pic', 'Applicant Photo', !isEditMode, 'JPG, PNG')}
              </View>
              <View style={styles.halfWidth}>
                {renderImagePicker('cnic_pic', 'CNIC Photo', !isEditMode, 'JPG, PNG')}
              </View>
            </View>
          </View>
        </View>

        {/* Section B: Library Usage Details */}
        {showUsageSection && (
          <View style={styles.section}>
            <LinearGradient
              colors={['transparent', COLORS.primarySoft]}
              style={styles.sectionHeaderGradient}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Icon name="calendar-check" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Section B: Library Usage Details</Text>
              </View>
            </LinearGradient>
            
            <View style={styles.sectionContent}>
              {renderInfoBox()}
              
              {renderPicker('Duration Required', 'hours_required', [
                { label: '0.5 hours (1 slot)', value: '0.5' },
                { label: '1 hour (2 slots)', value: '1' },
                { label: '1.5 hours (3 slots)', value: '1.5' },
                { label: '2 hours (4 slots)', value: '2' },
                { label: '2.5 hours (5 slots)', value: '2.5' },
                { label: '3 hours (6 slots)', value: '3' },
                { label: '3.5 hours (7 slots)', value: '3.5' },
                { label: '4 hours (8 slots)', value: '4' },
              ], true)}

              {renderTimeSlots()}
            </View>
          </View>
        )}

        {/* Section C: Purpose of Library Use */}
        <View style={styles.section}>
          <LinearGradient
            colors={['transparent', COLORS.primarySoft]}
            style={styles.sectionHeaderGradient}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Icon name="help-circle" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Section C: Purpose of Library Use</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            {renderPicker('Purpose of Visit', 'purpose', [
              { label: 'Study / Research', value: 'study' },
              { label: 'Reading', value: 'reading' },
              { label: 'Exam Preparation', value: 'exam' },
              { label: 'Professional Work', value: 'work' },
              { label: 'Other (Specify)', value: 'other' },
            ], true)}

            {showOtherPurpose && (
              <View style={styles.conditionalFields}>
                {renderInput('Please Specify', 'other_purpose', { 
                  required: true,
                  placeholder: 'Enter your specific purpose'
                })}
              </View>
            )}
          </View>
        </View>

        {/* Section D: Rules, SOPs & Declaration */}
        <View style={styles.section}>
          <LinearGradient
            colors={['transparent', COLORS.primarySoft]}
            style={styles.sectionHeaderGradient}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Icon name="shield-check" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Section D: Rules & Declaration</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            {renderImportantNotes()}

            <TouchableOpacity
              style={[styles.consentContainer, formData.consent && styles.consentContainerChecked]}
              onPress={() => handleInputChange('consent', !formData.consent)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, formData.consent && styles.checkboxChecked]}>
                {formData.consent && <Icon name="check" size={10} color="#fff" />}
              </View>
              <Text style={[styles.consentText, formData.consent && styles.consentTextChecked]}>
                I confirm that the information provided is correct. I agree to comply with all rules, SOPs, and instructions.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={submitting ? ['#94a3b8', '#64748b'] : COLORS.primaryGradient}
            style={styles.submitButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <View style={styles.submitButtonContent}>
                <Icon name="check-circle" size={16} color="#fff" />
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'Update Request' : 'Submit Request'}
                </Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowImagePickerModal(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Choose Image Source</Text>
                
                <View style={styles.modalOptions}>
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={openCamera}
                    activeOpacity={0.8}
                  >
                    <LinearGradient 
                      colors={[COLORS.primarySoft, '#fff']} 
                      style={styles.modalOptionIcon}
                    >
                      <Icon name="camera" size={22} color={COLORS.primary} />
                    </LinearGradient>
                    <Text style={styles.modalOptionText}>Camera</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={openGallery}
                    activeOpacity={0.8}
                  >
                    <LinearGradient 
                      colors={[COLORS.primarySoft, '#fff']} 
                      style={styles.modalOptionIcon}
                    >
                      <Icon name="image" size={22} color={COLORS.primary} />
                    </LinearGradient>
                    <Text style={styles.modalOptionText}>Gallery</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setShowImagePickerModal(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

// ============ STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 45,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
    fontWeight: '400',
  },
  headerRight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 90,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 8,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.1)',
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  infoText: {
    fontSize: 10,
    color: COLORS.text,
  },
  infoTextBold: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(147, 51, 234, 0.2)',
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.1)',
    overflow: 'hidden',
  },
  sectionHeaderGradient: {
    padding: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(147, 51, 234, 0.1)',
  },
  sectionIconContainer: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
  sectionDescription: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
  },
  sectionContent: {
    padding: 12,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.textLight,
    letterSpacing: 0.2,
  },
  requiredStar: {
    color: COLORS.error,
    marginLeft: 2,
    fontSize: 10,
  },
  helperText: {
    fontSize: 8,
    color: COLORS.textLighter,
    marginLeft: 6,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputWrapper: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    padding: 10,
    fontSize: 11,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  uploadsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  pickerWrapperFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    height: 38,
    color: COLORS.text,
    fontSize: 11,
  },
  radioGroupContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: COLORS.primary,
  },
  radioInner: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.white,
  },
  radioText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  radioTextSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  imagePickerGroup: {
    marginBottom: 0,
  },
  imagePicker: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 16,
    backgroundColor: COLORS.white,
    minHeight: 90,
    overflow: 'hidden',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 90,
    resizeMode: 'cover',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  previewBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 2,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 12,
  },
  placeholderIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  placeholderText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  placeholderSubtext: {
    fontSize: 8,
    color: COLORS.textLighter,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  infoBoxText: {
    flex: 1,
    fontSize: 10,
    color: '#0284c7',
    marginLeft: 6,
    fontWeight: '500',
  },
  timeSlotsContainer: {
    marginTop: 8,
  },
  timeSlotsLabel: {
    fontSize: 10,
    color: COLORS.text,
    marginBottom: 6,
    fontWeight: '500',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  timeSlotItem: {
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    minWidth: '48%',
  },
  timeSlotItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  timeSlotText: {
    fontSize: 9,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '400',
  },
  timeSlotTextSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  selectedCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    justifyContent: 'flex-end',
  },
  selectedCount: {
    fontSize: 9,
    color: COLORS.success,
    marginLeft: 4,
    fontWeight: '500',
  },
  conditionalFields: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(147, 51, 234, 0.1)',
  },
  notesContainer: {
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  notesIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  notesTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#b45309',
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  noteBullet: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#92400e',
    marginTop: 4,
    marginRight: 6,
  },
  noteText: {
    flex: 1,
    fontSize: 9,
    color: '#92400e',
    lineHeight: 13,
  },
  consentContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.successLight,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    alignItems: 'center',
  },
  consentContainerChecked: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.success,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
  },
  consentText: {
    flex: 1,
    fontSize: 9,
    color: '#065f46',
    lineHeight: 14,
  },
  consentTextChecked: {
    color: '#065f46',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(147, 51, 234, 0.1)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
    paddingBottom: 20,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonGradient: {
    padding: 12,
    alignItems: 'center',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 18,
    width: '75%',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 16,
  },
  modalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 14,
  },
  modalOption: {
    alignItems: 'center',
  },
  modalOptionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  modalOptionText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
  modalCancel: {
    padding: 8,
    borderRadius: 14,
    backgroundColor: COLORS.errorLight,
    width: '100%',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
});

export default LibraryAccessBookingScreen;