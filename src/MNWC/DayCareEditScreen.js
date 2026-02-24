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
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// ============ API CONFIGURATION ============
const API_BASE_URL = 'https://karma-roots-rankings-handhelds.trycloudflare.com/api';

// ============ THEME CONSTANTS ============
const COLORS = {
  primary: '#940775',
  primaryLight: '#940775',
  primaryDark: '#6d0557',
  primarySoft: '#f9e6f5',
  secondary: '#f3e5f5',
  background: '#faf5fb',
  surface: '#ffffff',
  text: '#1a1a1a',
  textLight: '#666666',
  textLighter: '#999999',
  border: '#e0d0e8',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  white: '#ffffff',
  black: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
};

const DayCareEditScreen = ({ route, navigation }) => {
  const { record_id, user_id, user, isEditMode } = route.params || {};
  
  // ============ STATE MANAGEMENT ============
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showHelperFields, setShowHelperFields] = useState(false);
  const [showHealthFields, setShowHealthFields] = useState(false);
  const [activeImagePicker, setActiveImagePicker] = useState(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    parent: true,
    auth: true,
    child: true,
    helper: true,
    health: true,
    booking: true,
  });

  // Form state
  const [formData, setFormData] = useState({
    parent_name: '',
    parent_cnic: '',
    parent_contact: '',
    parent_address: '',
    parent_cnic_pic: null,
    auth_name: '',
    auth_cnic: '',
    auth_contact: '',
    relationship: '',
    auth_cnic_pic: null,
    child_name: '',
    child_gender: '',
    child_years: '',
    child_months: '',
    child_pic: null,
    has_helper: 'no',
    helper_name: '',
    helper_cnic: '',
    helper_contact: '',
    helper_pic: null,
    has_allergies: 'no',
    health_details: '',
    hours_required: '',
    require_services: '',
    consent: true,
  });

  // Image preview states
  const [imagePreviews, setImagePreviews] = useState({});
  const [originalImages, setOriginalImages] = useState({});

  // Fetch booking data on mount
  useEffect(() => {
    console.log('Edit Screen - Record ID:', record_id);
    console.log('Edit Screen - User ID:', user_id);
    
    if (!record_id) {
      Alert.alert('Error', 'No booking record found', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    
    fetchBookingData();
  }, []);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/daycare-booking/${record_id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Fetched booking data:', data);

      if (data.success) {
        const booking = data.data;
        
        // Set form data
        setFormData({
          parent_name: booking.parent_name || '',
          parent_cnic: booking.parent_cnic || '',
          parent_contact: booking.parent_contact || '',
          parent_address: booking.parent_address || '',
          parent_cnic_pic: booking.parent_cnic_pic ? { uri: getFullImageUrl(booking.parent_cnic_pic) } : null,
          auth_name: booking.auth_name || '',
          auth_cnic: booking.auth_cnic || '',
          auth_contact: booking.auth_contact || '',
          relationship: booking.relationship || '',
          auth_cnic_pic: booking.auth_cnic_pic ? { uri: getFullImageUrl(booking.auth_cnic_pic) } : null,
          child_name: booking.child_name || '',
          child_gender: booking.child_gender || '',
          child_years: booking.child_years?.toString() || '',
          child_months: booking.child_months?.toString() || '0',
          child_pic: booking.child_pic ? { uri: getFullImageUrl(booking.child_pic) } : null,
          has_helper: booking.has_helper ? 'yes' : 'no',
          helper_name: booking.helper_name || '',
          helper_cnic: booking.helper_cnic || '',
          helper_contact: booking.helper_contact || '',
          helper_pic: booking.helper_pic ? { uri: getFullImageUrl(booking.helper_pic) } : null,
          has_allergies: booking.has_allergies ? 'yes' : 'no',
          health_details: booking.health_details || '',
          hours_required: booking.hours_required?.toString() || '',
          require_services: booking.require_services || '',
          consent: true,
        });

        // Set image previews
        const previews = {};
        if (booking.parent_cnic_pic) previews.parent_cnic_pic = getFullImageUrl(booking.parent_cnic_pic);
        if (booking.auth_cnic_pic) previews.auth_cnic_pic = getFullImageUrl(booking.auth_cnic_pic);
        if (booking.child_pic) previews.child_pic = getFullImageUrl(booking.child_pic);
        if (booking.helper_pic) previews.helper_pic = getFullImageUrl(booking.helper_pic);
        
        setImagePreviews(previews);
        setOriginalImages(previews);
        
        // Set conditional fields visibility
        setShowHelperFields(booking.has_helper === 1);
        setShowHealthFields(booking.has_allergies === 1);
      } else {
        Alert.alert('Error', data.message || 'Failed to load booking data');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      Alert.alert('Error', 'Failed to load booking data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (path) => {
    if (!path) return null;
    // Assuming images are stored in public storage
    return `${API_BASE_URL.replace('/api', '')}/storage/${path}`;
  };

  // ============ INFO BAR COMPONENT ============
  const renderInfoBar = () => (
    <LinearGradient
      colors={['#f9e6f5', '#f3e5f5']}
      style={styles.infoBar}
    >
      <View style={styles.infoItem}>
        <Icon name="clock-outline" size={12} color={COLORS.primary} />
        <Text style={styles.infoText}>
          <Text style={styles.infoTextBold}>Hours:</Text> 9:00 AM – 5:00 PM
        </Text>
      </View>
      <View style={styles.infoDivider} />
      <View style={styles.infoItem}>
        <Icon name="timer-outline" size={12} color={COLORS.primary} />
        <Text style={styles.infoText}>
          <Text style={styles.infoTextBold}>Slot Duration:</Text> 30 minutes
        </Text>
      </View>
      <View style={styles.infoDivider} />
      <View style={styles.infoItem}>
        <Icon name="calendar-multiple" size={12} color={COLORS.primary} />
        <Text style={styles.infoText}>
          <Text style={styles.infoTextBold}>Multiple Slots:</Text> Available
        </Text>
      </View>
    </LinearGradient>
  );

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
        quality: 0.7,
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
        quality: 0.7,
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

  // ============ FORM HANDLERS ============
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'has_helper') {
        setShowHelperFields(value === 'yes');
        if (value === 'no') {
          newData.helper_name = '';
          newData.helper_cnic = '';
          newData.helper_contact = '';
          newData.helper_pic = null;
          setImagePreviews(prev => ({ ...prev, helper_pic: null }));
        }
      }
      if (field === 'has_allergies') {
        setShowHealthFields(value === 'yes');
        if (value === 'no') {
          newData.health_details = '';
        }
      }
      
      return newData;
    });
  };

  const handleMonthsChange = (text) => {
    let value = parseInt(text) || '';
    if (value > 11) {
      value = 11;
      Alert.alert('Validation', 'Months cannot exceed 11');
    }
    handleInputChange('child_months', value.toString());
  };

  const handleYearsChange = (text) => {
    let value = parseInt(text) || '';
    if (value > 18) {
      value = 18;
      Alert.alert('Validation', 'Age cannot exceed 18 years');
    }
    handleInputChange('child_years', value.toString());
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ============ FORM VALIDATION ============
  const validateForm = () => {
    // Parent Information
    if (!formData.parent_name?.trim()) {
      Alert.alert('Validation Error', 'Parent full name is required');
      return false;
    }
    if (!formData.parent_cnic?.trim()) {
      Alert.alert('Validation Error', 'Parent CNIC number is required');
      return false;
    }
    if (!/^\d{13}$/.test(formData.parent_cnic)) {
      Alert.alert('Validation Error', 'Parent CNIC must be exactly 13 digits');
      return false;
    }
    if (!formData.parent_contact?.trim()) {
      Alert.alert('Validation Error', 'Parent contact number is required');
      return false;
    }
    if (!/^03\d{9}$/.test(formData.parent_contact)) {
      Alert.alert('Validation Error', 'Parent contact must be a valid Pakistani mobile number (03XXXXXXXXX)');
      return false;
    }
    if (!formData.parent_address?.trim()) {
      Alert.alert('Validation Error', 'Parent address is required');
      return false;
    }

    // Authorized Person Information
    if (!formData.auth_name?.trim()) {
      Alert.alert('Validation Error', 'Authorized person name is required');
      return false;
    }
    if (!formData.auth_cnic?.trim()) {
      Alert.alert('Validation Error', 'Authorized person CNIC is required');
      return false;
    }
    if (!/^\d{13}$/.test(formData.auth_cnic)) {
      Alert.alert('Validation Error', 'Authorized person CNIC must be exactly 13 digits');
      return false;
    }
    if (!formData.auth_contact?.trim()) {
      Alert.alert('Validation Error', 'Authorized person contact is required');
      return false;
    }
    if (!/^03\d{9}$/.test(formData.auth_contact)) {
      Alert.alert('Validation Error', 'Authorized person contact must be a valid Pakistani mobile number');
      return false;
    }
    if (!formData.relationship) {
      Alert.alert('Validation Error', 'Please select relationship with child');
      return false;
    }

    // Child Information
    if (!formData.child_name?.trim()) {
      Alert.alert('Validation Error', 'Child name is required');
      return false;
    }
    if (!formData.child_gender) {
      Alert.alert('Validation Error', 'Please select child gender');
      return false;
    }
    if (!formData.child_years) {
      Alert.alert('Validation Error', 'Child age (years) is required');
      return false;
    }

    // Helper Information
    if (formData.has_helper === 'yes') {
      if (!formData.helper_name?.trim()) {
        Alert.alert('Validation Error', 'Helper name is required');
        return false;
      }
      if (!formData.helper_cnic?.trim()) {
        Alert.alert('Validation Error', 'Helper CNIC/B-Form is required');
        return false;
      }
      if (formData.helper_cnic && !/^\d{13}$/.test(formData.helper_cnic)) {
        Alert.alert('Validation Error', 'Helper CNIC must be exactly 13 digits');
        return false;
      }
    }

    // Health Information
    if (formData.has_allergies === 'yes' && !formData.health_details?.trim()) {
      Alert.alert('Validation Error', 'Please specify medical conditions');
      return false;
    }

    // Booking Details
    if (!formData.hours_required) {
      Alert.alert('Validation Error', 'Please select required hours');
      return false;
    }
    if (!formData.require_services) {
      Alert.alert('Validation Error', 'Please select caretaker service option');
      return false;
    }

    return true;
  };

  // ============ API SUBMISSION ============
  const updateBooking = async () => {
    try {
      const apiFormData = new FormData();
      
      // Add booking ID
      apiFormData.append('booking_id', record_id);
      apiFormData.append('user_id', user_id);
      
      // Append all text fields
      const textFields = {
        parent_name: formData.parent_name,
        parent_cnic: formData.parent_cnic,
        parent_contact: formData.parent_contact,
        parent_address: formData.parent_address,
        auth_name: formData.auth_name,
        auth_cnic: formData.auth_cnic,
        auth_contact: formData.auth_contact,
        relationship: formData.relationship,
        child_name: formData.child_name,
        child_gender: formData.child_gender,
        child_years: formData.child_years,
        child_months: formData.child_months || '0',
        has_helper: formData.has_helper,
        has_allergies: formData.has_allergies,
        hours_required: formData.hours_required,
        require_services: formData.require_services,
        consent: '1',
      };

      // Add helper fields if enabled
      if (formData.has_helper === 'yes') {
        textFields.helper_name = formData.helper_name;
        textFields.helper_cnic = formData.helper_cnic;
        textFields.helper_contact = formData.helper_contact;
      }

      // Add health details if enabled
      if (formData.has_allergies === 'yes') {
        textFields.health_details = formData.health_details;
      }

      // Append all text fields
      Object.entries(textFields).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          apiFormData.append(key, value.toString());
        }
      });

      // Append new image files (only if changed)
      const imageFields = [
        { key: 'parent_cnic_pic', value: formData.parent_cnic_pic },
        { key: 'auth_cnic_pic', value: formData.auth_cnic_pic },
        { key: 'child_pic', value: formData.child_pic },
        { key: 'helper_pic', value: formData.helper_pic }
      ];

      imageFields.forEach(({ key, value }) => {
        // Check if this is a new image (has uri and is not from original preview)
        if (value && value.uri && !originalImages[key]?.includes(value.uri)) {
          apiFormData.append(key, {
            uri: value.uri,
            type: value.type || 'image/jpeg',
            name: value.name || `${key}_${Date.now()}.jpg`,
          });
        }
      });

      // Add flags for images to keep/delete
      const imagesToKeep = {};
      imageFields.forEach(({ key }) => {
        imagesToKeep[`keep_${key}`] = imagePreviews[key] ? '1' : '0';
      });
      
      Object.entries(imagesToKeep).forEach(([key, value]) => {
        apiFormData.append(key, value);
      });

      console.log('Updating booking with ID:', record_id);

      const response = await fetch(`${API_BASE_URL}/daycare-booking/${record_id}`, {
        method: 'POST', // Using POST with _method=PUT for Laravel
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: apiFormData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update booking');
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
      const response = await updateBooking();
      Alert.alert(
        'Success',
        'Booking updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to update booking. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============ RENDER FUNCTIONS ============
  const renderSectionHeader = (title, icon, section, required = false) => (
    <TouchableOpacity 
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
      activeOpacity={0.7}
    >
      <View style={styles.sectionHeaderLeft}>
        <View style={styles.sectionIconContainer}>
          <Icon name={icon} size={18} color={COLORS.primary} />
        </View>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>
            {title} {required && <Text style={styles.required}>*</Text>}
          </Text>
        </View>
      </View>
      <View style={styles.sectionToggleContainer}>
        <Text style={styles.sectionToggle}>
          {expandedSections[section] ? '−' : '+'}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.input, options.multiline && styles.textArea]}
          placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor="#999"
          value={formData[field]}
          onChangeText={(text) => {
            if (field === 'child_months') {
              handleMonthsChange(text);
            } else if (field === 'child_years') {
              handleYearsChange(text);
            } else {
              handleInputChange(field, text);
            }
          }}
          keyboardType={options.keyboardType || 'default'}
          maxLength={options.maxLength}
          multiline={options.multiline}
          numberOfLines={options.numberOfLines}
          editable={!options.disabled}
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
        activeOpacity={0.8}
      >
        {imagePreviews[field] || formData[field]?.uri ? (
          <View style={styles.imagePreviewContainer}>
            <Image 
              source={{ uri: imagePreviews[field] || formData[field]?.uri }} 
              style={styles.previewImage} 
            />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => removeImage(field)}
            >
              <Icon name="close-circle" size={24} color={COLORS.error} />
            </TouchableOpacity>
            {originalImages[field] && (
              <View style={styles.imageBadge}>
                <Icon name="check-decagram" size={16} color={COLORS.success} />
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <View style={styles.placeholderIconContainer}>
              <Icon name="camera-plus" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.placeholderText}>Tap to upload {label}</Text>
            <Text style={styles.placeholderSubtext}>PNG, JPG (Max 10MB)</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderPicker = (label, field, items, required = false) => (
    <View style={styles.inputGroup}>
      {renderLabel(label, required)}
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={formData[field]}
          onValueChange={(value) => handleInputChange(field, value)}
          style={styles.picker}
          dropdownIconColor={COLORS.primary}
        >
          <Picker.Item label={`Select ${label}`} value="" />
          {items.map((item, index) => (
            <Picker.Item 
              key={index} 
              label={item.label} 
              value={item.value} 
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
            onPress={() => handleInputChange(field, option.value)}
          >
            <View style={[
              styles.radioCircle,
              formData[field] === option.value && styles.radioCircleSelected
            ]}>
              {formData[field] === option.value && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading booking data...</Text>
      </View>
    );
  }

  // ============ MAIN RENDER ============
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#940775', '#391130']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Edit Day Care Booking
            </Text>
            <Text style={styles.headerSubtitle}>Booking #{record_id}</Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Bar */}
        {renderInfoBar()}

        {/* Parent Section */}
        <View style={styles.section}>
          {renderSectionHeader('Parent Information', 'account', 'parent', true)}
          
          {expandedSections.parent && (
            <View style={styles.sectionContent}>
              {renderInput('Full Name', 'parent_name', { required: true })}
              {renderInput('CNIC Number', 'parent_cnic', { 
                keyboardType: 'numeric', 
                maxLength: 13,
                placeholder: '13-digit CNIC number',
                required: true,
                helper: 'Format: 1234512345671'
              })}
              {renderInput('Contact Number', 'parent_contact', { 
                keyboardType: 'phone-pad',
                maxLength: 11,
                placeholder: '03XXXXXXXXX',
                required: true,
                helper: 'Pakistani mobile number'
              })}
              {renderInput('Residential Address', 'parent_address', { 
                multiline: true, 
                numberOfLines: 2,
                required: true 
              })}
              {renderImagePicker('parent_cnic_pic', 'CNIC Picture', false, 'Front & back copy')}
            </View>
          )}
        </View>

        {/* Authorized Person Section */}
        <View style={styles.section}>
          {renderSectionHeader('Authorized Person', 'account-check', 'auth', true)}
          
          {expandedSections.auth && (
            <View style={styles.sectionContent}>
              {renderInput('Full Name', 'auth_name', { required: true })}
              {renderInput('CNIC Number', 'auth_cnic', { 
                keyboardType: 'numeric', 
                maxLength: 13,
                placeholder: '13-digit CNIC number',
                required: true,
                helper: 'Format: 1234512345671'
              })}
              {renderInput('Contact Number', 'auth_contact', { 
                keyboardType: 'phone-pad',
                maxLength: 11,
                placeholder: '03XXXXXXXXX',
                required: true,
                helper: 'Pakistani mobile number'
              })}
              {renderPicker('Relationship with Child', 'relationship', [
                { label: 'Mother', value: 'mother' },
                { label: 'Father', value: 'father' },
                { label: 'Sibling', value: 'sibling' },
                { label: 'Grandparent', value: 'grandparent' },
                { label: 'Other', value: 'other' },
              ], true)}
              {renderImagePicker('auth_cnic_pic', 'CNIC Picture', false, 'Front & back copy')}
            </View>
          )}
        </View>

        {/* Child Section */}
        <View style={styles.section}>
          {renderSectionHeader('Child Information', 'human-child', 'child', true)}
          
          {expandedSections.child && (
            <View style={styles.sectionContent}>
              {renderInput("Child's Full Name", 'child_name', { required: true })}
              
              {renderRadioGroup('Gender', 'child_gender', [
                { label: 'Male', value: 'male' },
                { label: 'Female', value: 'female' },
              ], true)}

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  {renderInput('Age (Years)', 'child_years', { 
                    keyboardType: 'numeric',
                    required: true,
                    placeholder: '0-18'
                  })}
                </View>
                <View style={styles.halfWidth}>
                  {renderInput('Months', 'child_months', { 
                    keyboardType: 'numeric',
                    placeholder: '0-11',
                    helper: 'Optional'
                  })}
                </View>
              </View>

              {renderImagePicker('child_pic', 'Child Photo', false, 'Recent photograph')}
            </View>
          )}
        </View>

        {/* Helper Section */}
        <View style={styles.section}>
          {renderSectionHeader('Helper Information', 'account-group', 'helper')}
          
          {expandedSections.helper && (
            <View style={styles.sectionContent}>
              {renderRadioGroup('Will a helper accompany?', 'has_helper', [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ])}

              <View style={styles.noteContainer}>
                <Icon name="information" size={14} color={COLORS.primary} />
                <Text style={styles.noteText}>Only female helpers are permitted</Text>
              </View>

              {showHelperFields && (
                <View style={styles.conditionalFields}>
                  {renderInput('Helper Full Name', 'helper_name')}
                  {renderInput('CNIC/B-Form Number', 'helper_cnic', { 
                    keyboardType: 'numeric', 
                    maxLength: 13,
                    placeholder: '13-digit CNIC or B-Form',
                    helper: '13 digits required'
                  })}
                  {renderInput('Contact Number', 'helper_contact', { 
                    keyboardType: 'phone-pad',
                    maxLength: 11,
                    placeholder: '03XXXXXXXXX',
                    helper: 'Pakistani mobile number'
                  })}
                  {renderImagePicker('helper_pic', 'Helper Photo', false, 'Optional')}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Health Section */}
        <View style={styles.section}>
          {renderSectionHeader('Health Information', 'heart', 'health')}
          
          {expandedSections.health && (
            <View style={styles.sectionContent}>
              {renderRadioGroup('Any allergies/conditions?', 'has_allergies', [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ])}

              {showHealthFields && (
                <View style={styles.conditionalFields}>
                  {renderInput('Medical Details', 'health_details', { 
                    multiline: true, 
                    numberOfLines: 3,
                    placeholder: 'Please specify any allergies or medical conditions'
                  })}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Booking Section */}
        <View style={styles.section}>
          {renderSectionHeader('Booking Details', 'calendar-clock', 'booking', true)}
          
          {expandedSections.booking && (
            <View style={styles.sectionContent}>
              {renderPicker('Duration Required', 'hours_required', [
                { label: '0.5 hours (1 slot)', value: '0.5' },
                { label: '1 hour (2 slots)', value: '1' },
                { label: '1.5 hours (3 slots)', value: '1.5' },
                { label: '2 hours (4 slots)', value: '2' },
                { label: '2.5 hours (5 slots)', value: '2.5' },
                { label: '3 hours (6 slots)', value: '3' },
                { label: '4 hours (8 slots)', value: '4' },
                { label: '5 hours (10 slots)', value: '5' },
                { label: '6 hours (12 slots)', value: '6' },
                { label: '7 hours (14 slots)', value: '7' },
                { label: '8 hours (16 slots)', value: '8' },
              ], true)}

              {renderRadioGroup('Need Caretaker Services?', 'require_services', [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ], true)}
            </View>
          )}
        </View>

        {/* Guidelines */}
        <LinearGradient colors={['#f9e6f5', '#f3e5f5']} style={styles.guidelinesContainer}>
          <View style={styles.guidelinesHeader}>
            <Icon name="clipboard-text" size={16} color={COLORS.primary} />
            <Text style={styles.guidelinesTitle}>Important Guidelines</Text>
          </View>
          {[
            'MNWC does not provide meals. Please arrange meals for your child.',
            'Only caretaking services are available at the facility.',
            'All cleanliness and safety SOPs must be followed.',
            'Child will be released only to the authorized person listed above.',
          ].map((text, index) => (
            <View key={index} style={styles.guidelineItem}>
              <View style={styles.guidelineBullet} />
              <Text style={styles.guidelineText}>{text}</Text>
            </View>
          ))}
        </LinearGradient>

        {/* Note about user_id (read-only) */}
        {/* <View style={styles.noteBox}>
          <Icon name="information" size={16} color={COLORS.info} />
          <Text style={styles.noteBoxText}>
            User ID: {user_id} (cannot be changed)
          </Text>
        </View> */}
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <LinearGradient
            colors={submitting ? ['#999', '#777'] : ['#940775', '#130111']}
            style={styles.submitButtonGradient}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  Update Booking
                </Text>
                <Text style={styles.submitButtonSubtext}>
                  Save changes to booking #{record_id}
                </Text>
              </>
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
                  >
                    <LinearGradient colors={['#f9e6f5', '#f3e5f5']} style={styles.modalOptionIcon}>
                      <Icon name="camera" size={24} color={COLORS.primary} />
                    </LinearGradient>
                    <Text style={styles.modalOptionText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={openGallery}
                  >
                    <LinearGradient colors={['#f9e6f5', '#f3e5f5']} style={styles.modalOptionIcon}>
                      <Icon name="image" size={24} color={COLORS.primary} />
                    </LinearGradient>
                    <Text style={styles.modalOptionText}>Choose from Gallery</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={() => setShowImagePickerModal(false)}
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
    backgroundColor: '#faf5fb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 50,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#940775',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerRight: {
    width: 36,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.2)',
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 8,
    color: COLORS.text,
  },
  infoTextBold: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(148, 7, 117, 0.2)',
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#940775',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(148, 7, 117, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 7, 117, 0.1)',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 7, 117, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#940775',
  },
  required: {
    color: '#ef4444',
    fontSize: 12,
  },
  sectionToggleContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(148, 7, 117, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionToggle: {
    fontSize: 16,
    color: '#940775',
    fontWeight: '600',
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
    fontSize: 11,
    fontWeight: '500',
    color: '#666',
  },
  requiredStar: {
    color: '#ef4444',
    marginLeft: 2,
    fontSize: 11,
  },
  helperText: {
    fontSize: 10,
    color: '#999',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.15)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  input: {
    padding: 10,
    fontSize: 12,
    color: '#1a1a1a',
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
  pickerWrapper: {
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.15)',
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  picker: {
    height: 42,
    color: '#1a1a1a',
    fontSize: 12,
  },
  radioGroupContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.1)',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#940775',
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    backgroundColor: '#940775',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  radioText: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(148, 7, 117, 0.05)',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  noteText: {
    fontSize: 11,
    color: '#940775',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.infoLight,
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 8,
  },
  noteBoxText: {
    fontSize: 11,
    color: '#0c4a6e',
    flex: 1,
  },
  conditionalFields: {
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 7, 117, 0.1)',
  },
  imagePickerGroup: {
    marginBottom: 14,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: 'rgba(148, 7, 117, 0.15)',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: 'rgba(148, 7, 117, 0.02)',
    minHeight: 100,
    overflow: 'hidden',
  },
  imagePreviewContainer: {
    position: 'relative',
  },
  placeholderContainer: {
    alignItems: 'center',
    padding: 16,
  },
  placeholderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#940775',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderText: {
    fontSize: 11,
    color: '#940775',
    fontWeight: '500',
    marginBottom: 2,
  },
  placeholderSubtext: {
    fontSize: 9,
    color: '#999',
  },
  previewImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  imageBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  guidelinesContainer: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  guidelinesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#940775',
    marginLeft: 6,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  guidelineBullet: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#940775',
    marginTop: 5,
    marginRight: 6,
  },
  guidelineText: {
    flex: 1,
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 7, 117, 0.1)',
    shadowColor: '#940775',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  submitButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#940775',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonGradient: {
    padding: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#940775',
    marginBottom: 20,
  },
  modalOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  modalOption: {
    alignItems: 'center',
  },
  modalOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.2)',
  },
  modalOptionText: {
    fontSize: 12,
    color: '#940775',
    fontWeight: '500',
  },
  modalCancel: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fee2e2',
    width: '100%',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    color: '#ef4444',
    fontWeight: '600',
  },
});

export default DayCareEditScreen;