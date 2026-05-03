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
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

// ============ API CONFIGURATION ============
const API_BASE_URL = 'https://mnwc-wdd.punjab.gov.pk/api';

// ============ THEME CONSTANTS ============
const COLORS = {
  primary: '#e68a00',
  primaryLight: '#f5a623',
  primaryDark: '#cc7a00',
  primarySoft: '#fff8eb',
  secondary: '#fef9ec',
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

const ProductDisplayEditScreen = ({ route, navigation }) => {
  const { record_id, user_id } = route.params || {};
  
  // ============ STATE MANAGEMENT ============
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeImagePicker, setActiveImagePicker] = useState(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    business: true,
    product: true,
    display: true,
    availability: true,
    declaration: true,
  });

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    business_name: '',
    city: '',
    contact_number: '',
    email: '',
    business_type: '',
    business_type_other: '',
    business_description: '',
    social_media: '',
    product_names: '',
    price_range: '',
    product_description: '',
    product_unique: '',
    product_image_1: null,
    product_image_2: null,
    product_image_3: null,
    display_type: '',
    display_type_other: '',
    handling_instructions: '',
    preferred_start_date: '',
    preferred_end_date: '',
    business_cards: '',
    consent: false,
  });

  // Image preview states
  const [imagePreviews, setImagePreviews] = useState({
    product_image_1: null,
    product_image_2: null,
    product_image_3: null,
  });
  const [originalImages, setOriginalImages] = useState({});
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Fetch application data on mount
  useEffect(() => {
    if (!record_id) {
      Alert.alert('Error', 'No application record found', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    fetchApplicationData();
  }, []);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/product-display/${record_id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        const application = data.data;
        
        // Parse preferred dates
        let startDate = '';
        let endDate = '';
        if (application.preferred_dates) {
          const dates = typeof application.preferred_dates === 'string' 
            ? JSON.parse(application.preferred_dates) 
            : application.preferred_dates;
          startDate = dates[0] || '';
          endDate = dates[1] || '';
        }
        
        // Parse product images
        let productImages = [];
        if (application.product_images) {
          productImages = typeof application.product_images === 'string'
            ? JSON.parse(application.product_images)
            : application.product_images;
        }
        
        setFormData({
          full_name: application.full_name || '',
          business_name: application.business_name || '',
          city: application.city || '',
          contact_number: application.contact_number || '',
          email: application.email || '',
          business_type: application.business_type || '',
          business_type_other: application.business_type_other || '',
          business_description: application.business_description || '',
          social_media: application.social_media || '',
          product_names: application.product_names || '',
          price_range: application.price_range || '',
          product_description: application.product_description || '',
          product_unique: application.product_unique || '',
          product_image_1: productImages[0] ? { uri: getFullImageUrl(productImages[0]), path: productImages[0] } : null,
          product_image_2: productImages[1] ? { uri: getFullImageUrl(productImages[1]), path: productImages[1] } : null,
          product_image_3: productImages[2] ? { uri: getFullImageUrl(productImages[2]), path: productImages[2] } : null,
          display_type: application.display_type || '',
          display_type_other: application.display_type_other || '',
          handling_instructions: application.handling_instructions || '',
          preferred_start_date: startDate,
          preferred_end_date: endDate,
          business_cards: application.business_cards ? 'yes' : 'no',
          consent: application.consent === 1,
        });

        // Set image previews
        const previews = {};
        if (productImages[0]) previews.product_image_1 = getFullImageUrl(productImages[0]);
        if (productImages[1]) previews.product_image_2 = getFullImageUrl(productImages[1]);
        if (productImages[2]) previews.product_image_3 = getFullImageUrl(productImages[2]);
        
        setImagePreviews(previews);
        setOriginalImages(previews);
      } else {
        Alert.alert('Error', data.message || 'Failed to load application data');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      Alert.alert('Error', 'Failed to load application data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/^\/+/, '');
    return `${API_BASE_URL.replace('/api', '')}/${cleanPath}`;
  };

  // ============ BUSINESS TYPE HANDLERS ============
  const handleBusinessTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      business_type: value,
      business_type_other: value === 'other' ? prev.business_type_other : '',
    }));
  };

  const handleDisplayTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      display_type: value,
      display_type_other: value === 'other' ? prev.display_type_other : '',
    }));
  };

  // ============ DATE HANDLERS ============
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, preferred_start_date: formattedDate }));
      
      if (formData.preferred_end_date && formData.preferred_end_date < formattedDate) {
        setFormData(prev => ({ ...prev, preferred_end_date: '' }));
      }
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, preferred_end_date: formattedDate }));
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today;
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
          };

          setImagePreviews(prev => ({
            ...prev,
            [activeImagePicker]: asset.uri
          }));

          setFormData(prev => ({ ...prev, [activeImagePicker]: imageFile }));
          
          // If this image was previously marked for deletion, remove from delete list
          const fieldName = activeImagePicker;
          setImagesToDelete(prev => prev.filter(img => img !== fieldName));
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
          };

          setImagePreviews(prev => ({
            ...prev,
            [activeImagePicker]: asset.uri
          }));

          setFormData(prev => ({ ...prev, [activeImagePicker]: imageFile }));
          
          // If this image was previously marked for deletion, remove from delete list
          const fieldName = activeImagePicker;
          setImagesToDelete(prev => prev.filter(img => img !== fieldName));
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
            setFormData(prev => ({ ...prev, [field]: null }));
            
            // Mark this image for deletion if it was an existing image
            if (originalImages[field]) {
              setImagesToDelete(prev => [...prev, field]);
            }
          }
        }
      ]
    );
  };

  // ============ FORM VALIDATION ============
  const validateForm = () => {
    if (!formData.full_name?.trim()) {
      Alert.alert('Validation Error', 'Full name is required');
      return false;
    }
    if (!formData.business_name?.trim()) {
      Alert.alert('Validation Error', 'Business name is required');
      return false;
    }
    if (!formData.city?.trim()) {
      Alert.alert('Validation Error', 'City is required');
      return false;
    }
    if (!formData.contact_number?.trim()) {
      Alert.alert('Validation Error', 'Contact number is required');
      return false;
    }
    if (!/^03\d{9}$/.test(formData.contact_number)) {
      Alert.alert('Validation Error', 'Contact must be a valid Pakistani mobile number (03XXXXXXXXX)');
      return false;
    }
    if (!formData.business_type) {
      Alert.alert('Validation Error', 'Please select business type');
      return false;
    }
    if (formData.business_type === 'other' && !formData.business_type_other?.trim()) {
      Alert.alert('Validation Error', 'Please specify your business type');
      return false;
    }
    if (!formData.business_description?.trim()) {
      Alert.alert('Validation Error', 'Business description is required');
      return false;
    }
    if (!formData.product_names?.trim()) {
      Alert.alert('Validation Error', 'Product names are required');
      return false;
    }
    if (!formData.price_range?.trim()) {
      Alert.alert('Validation Error', 'Price range is required');
      return false;
    }
    if (!formData.product_description?.trim()) {
      Alert.alert('Validation Error', 'Product description is required');
      return false;
    }
    if (!formData.product_unique?.trim()) {
      Alert.alert('Validation Error', 'Please explain what makes your product unique');
      return false;
    }
    if (!formData.display_type) {
      Alert.alert('Validation Error', 'Please select display type');
      return false;
    }
    if (formData.display_type === 'other' && !formData.display_type_other?.trim()) {
      Alert.alert('Validation Error', 'Please specify display type');
      return false;
    }
    if (!formData.preferred_start_date) {
      Alert.alert('Validation Error', 'Please select preferred start date');
      return false;
    }
    if (!formData.preferred_end_date) {
      Alert.alert('Validation Error', 'Please select preferred end date');
      return false;
    }
    if (formData.preferred_end_date < formData.preferred_start_date) {
      Alert.alert('Validation Error', 'End date cannot be before start date');
      return false;
    }
    if (!formData.business_cards) {
      Alert.alert('Validation Error', 'Please specify if you have business cards');
      return false;
    }
    if (!formData.consent) {
      Alert.alert('Validation Error', 'You must agree to the terms and conditions');
      return false;
    }

    return true;
  };

  // ============ API SUBMISSION ============
  const updateApplication = async () => {
    try {
      const apiFormData = new FormData();
      
      apiFormData.append('user_id', user_id);
      apiFormData.append('_method', 'POST');
      
      // Basic Information
      apiFormData.append('full_name', formData.full_name);
      apiFormData.append('business_name', formData.business_name);
      apiFormData.append('city', formData.city);
      apiFormData.append('contact_number', formData.contact_number);
      if (formData.email) apiFormData.append('email', formData.email);
      
      // Business Details
      apiFormData.append('business_type', formData.business_type);
      if (formData.business_type_other) {
        apiFormData.append('business_type_other', formData.business_type_other);
      }
      apiFormData.append('business_description', formData.business_description);
      if (formData.social_media) apiFormData.append('social_media', formData.social_media);
      
      // Product Information
      apiFormData.append('product_names', formData.product_names);
      apiFormData.append('price_range', formData.price_range);
      apiFormData.append('product_description', formData.product_description);
      apiFormData.append('product_unique', formData.product_unique);
      
      // Product Images - only send new ones
      if (formData.product_image_1 && formData.product_image_1.uri && !originalImages.product_image_1) {
        apiFormData.append('product_image_1', {
          uri: formData.product_image_1.uri,
          type: formData.product_image_1.type || 'image/jpeg',
          name: formData.product_image_1.name || 'product_image_1.jpg',
        });
      }
      if (formData.product_image_2 && formData.product_image_2.uri && !originalImages.product_image_2) {
        apiFormData.append('product_image_2', {
          uri: formData.product_image_2.uri,
          type: formData.product_image_2.type || 'image/jpeg',
          name: formData.product_image_2.name || 'product_image_2.jpg',
        });
      }
      if (formData.product_image_3 && formData.product_image_3.uri && !originalImages.product_image_3) {
        apiFormData.append('product_image_3', {
          uri: formData.product_image_3.uri,
          type: formData.product_image_3.type || 'image/jpeg',
          name: formData.product_image_3.name || 'product_image_3.jpg',
        });
      }
      
      // Images to delete
      if (imagesToDelete.length > 0) {
        apiFormData.append('delete_images', JSON.stringify(imagesToDelete));
      }
      
      // Display Requirements
      apiFormData.append('display_type', formData.display_type);
      if (formData.display_type_other) {
        apiFormData.append('display_type_other', formData.display_type_other);
      }
      if (formData.handling_instructions) {
        apiFormData.append('handling_instructions', formData.handling_instructions);
      }
      
      // Availability
      apiFormData.append('preferred_dates[0]', formData.preferred_start_date);
      apiFormData.append('preferred_dates[1]', formData.preferred_end_date);
      apiFormData.append('business_cards', formData.business_cards);
      
      // Consent
      apiFormData.append('consent', formData.consent ? '1' : '0');
      apiFormData.append('source', 'app');

      const response = await fetch(`${API_BASE_URL}/product-display/${record_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: apiFormData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update application');
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
      await updateApplication();
      Alert.alert(
        'Success',
        'Product display application updated successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to update application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
          onChangeText={(text) => setFormData(prev => ({ ...prev, [field]: text }))}
          keyboardType={options.keyboardType || 'default'}
          maxLength={options.maxLength}
          multiline={options.multiline}
          numberOfLines={options.numberOfLines}
          editable={!options.disabled}
        />
      </View>
    </View>
  );

  const renderDatePicker = (label, field, required = false) => (
    <View style={styles.inputGroup}>
      {renderLabel(label, required)}
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => field === 'start' ? setShowStartDatePicker(true) : setShowEndDatePicker(true)}
      >
        <Icon name="calendar" size={18} color={COLORS.primary} />
        <Text style={[styles.datePickerText, formData[field === 'start' ? 'preferred_start_date' : 'preferred_end_date'] ? styles.datePickerTextSelected : null]}>
          {formData[field === 'start' ? 'preferred_start_date' : 'preferred_end_date'] || `Select ${label}`}
        </Text>
      </TouchableOpacity>
      
      {(field === 'start' && showStartDatePicker) && (
        <DateTimePicker
          value={formData.preferred_start_date ? new Date(formData.preferred_start_date) : getMinDate()}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          minimumDate={getMinDate()}
        />
      )}
      
      {(field === 'end' && showEndDatePicker) && (
        <DateTimePicker
          value={formData.preferred_end_date ? new Date(formData.preferred_end_date) : (formData.preferred_start_date ? new Date(formData.preferred_start_date) : getMinDate())}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          minimumDate={formData.preferred_start_date ? new Date(formData.preferred_start_date) : getMinDate()}
        />
      )}
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
            onPress={() => setFormData(prev => ({ ...prev, [field]: option.value }))}
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

  const renderBusinessTypeRadio = () => (
    <View style={styles.inputGroup}>
      {renderLabel('Type of Business', true)}
      <View style={styles.radioGroupContainer}>
        {[
          { label: 'Fashion & Apparel', value: 'fashion_apparel' },
          { label: 'Beauty & Personal Care', value: 'beauty_personal_care' },
          { label: 'Handicrafts', value: 'handicrafts' },
          { label: 'Home Décor', value: 'home_decor' },
          { label: 'Other', value: 'other' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.radioItem}
            onPress={() => handleBusinessTypeChange(option.value)}
          >
            <View style={[
              styles.radioCircle,
              formData.business_type === option.value && styles.radioCircleSelected
            ]}>
              {formData.business_type === option.value && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {formData.business_type === 'other' && (
        <View style={styles.conditionalField}>
          <TextInput
            style={styles.input}
            placeholder="Please specify your business type"
            value={formData.business_type_other}
            onChangeText={(text) => setFormData(prev => ({ ...prev, business_type_other: text }))}
          />
        </View>
      )}
    </View>
  );

  const renderDisplayTypeRadio = () => (
    <View style={styles.inputGroup}>
      {renderLabel('Type of Display Needed', true)}
      <View style={styles.radioGroupContainer}>
        {[
          { label: 'Tabletop', value: 'tabletop' },
          { label: 'Shelf', value: 'shelf' },
          { label: 'Stand', value: 'stand' },
          { label: 'Other', value: 'other' },
        ].map((option) => (
          <TouchableOpacity
            key={option.value}
            style={styles.radioItem}
            onPress={() => handleDisplayTypeChange(option.value)}
          >
            <View style={[
              styles.radioCircle,
              formData.display_type === option.value && styles.radioCircleSelected
            ]}>
              {formData.display_type === option.value && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={styles.radioText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {formData.display_type === 'other' && (
        <View style={styles.conditionalField}>
          <TextInput
            style={styles.input}
            placeholder="Please specify display type"
            value={formData.display_type_other}
            onChangeText={(text) => setFormData(prev => ({ ...prev, display_type_other: text }))}
          />
        </View>
      )}
    </View>
  );

  const renderImagePicker = (field, label, required = false, index = '') => (
    <View style={styles.imagePickerGroup}>
      {renderLabel(`${label} ${index}`, required)}
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

  const renderInfoBar = () => (
    <LinearGradient
      colors={[COLORS.primarySoft, COLORS.secondary]}
      style={styles.infoBar}
    >
      <View style={styles.infoItem}>
        <Icon name="camera" size={12} color={COLORS.primary} />
        <Text style={styles.infoText}>
          <Text style={styles.infoTextBold}>Photos Required:</Text> 2–3 high-quality images
        </Text>
      </View>
      <View style={styles.infoDivider} />
      <View style={styles.infoItem}>
        <Icon name="account-group" size={12} color={COLORS.primary} />
        <Text style={styles.infoText}>
          <Text style={styles.infoTextBold}>For:</Text> Women Entrepreneurs
        </Text>
      </View>
      <View style={styles.infoDivider} />
      <View style={styles.infoItem}>
        <Icon name="shield-check" size={12} color={COLORS.primary} />
        <Text style={styles.infoText}>
          <Text style={styles.infoTextBold}>Selection:</Text> Subject to MNWC approval
        </Text>
      </View>
    </LinearGradient>
  );

  const renderPurposeBanner = () => (
    <LinearGradient colors={['#fff7ed', '#fef9ec']} style={styles.purposeBanner}>
      <Icon name="information" size={16} color={COLORS.primary} />
      <Text style={styles.purposeText}>
        This initiative showcases selected products of women entrepreneurs at the Maryam Nawaz Women Complex.
        The display provides visibility to businesses during official visits and delegations, facilitating
        networking and potential opportunities.
      </Text>
    </LinearGradient>
  );

  const renderGuidelines = () => (
    <LinearGradient colors={[COLORS.primarySoft, COLORS.secondary]} style={styles.guidelinesContainer}>
      <View style={styles.guidelinesHeader}>
        <Icon name="clipboard-text" size={16} color={COLORS.primary} />
        <Text style={styles.guidelinesTitle}>Important Notes</Text>
      </View>
      {[
        'Submission does not guarantee selection for display.',
        'Selected entrepreneurs will be notified via email/contact number.',
        'MNWC reserves the right to remove any product from display without prior notice.',
        'The entrepreneur is responsible for the delivery and collection of products.',
        'This display is not for sale purposes.',
        'MNWC is not responsible in case of damage.',
      ].map((text, index) => (
        <View key={index} style={styles.guidelineItem}>
          <View style={styles.guidelineBullet} />
          <Text style={styles.guidelineText}>{text}</Text>
        </View>
      ))}
    </LinearGradient>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading application data...</Text>
      </View>
    );
  }

  // ============ MAIN RENDER ============
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Icon name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Edit Product Display
            </Text>
            <Text style={styles.headerSubtitle}>Application #{record_id}</Text>
          </View>
          
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderInfoBar()}
        {renderPurposeBanner()}

        {/* Section A: Basic Information */}
        <View style={styles.section}>
          {renderSectionHeader('Basic Information', 'account-circle', 'basic', true)}
          
          {expandedSections.basic && (
            <View style={styles.sectionContent}>
              {renderInput('Full Name', 'full_name', { required: true })}
              {renderInput('Business Name', 'business_name', { required: true })}
              {renderInput('City', 'city', { required: true })}
              {renderInput('Contact Number', 'contact_number', { 
                keyboardType: 'phone-pad',
                maxLength: 11,
                placeholder: '03XXXXXXXXX',
                required: true,
                helper: 'Pakistani mobile number'
              })}
              {renderInput('Email Address', 'email', { 
                keyboardType: 'email-address',
                placeholder: 'example@email.com'
              })}
            </View>
          )}
        </View>

        {/* Section B: Business Details */}
        <View style={styles.section}>
          {renderSectionHeader('Business Details', 'briefcase', 'business', true)}
          
          {expandedSections.business && (
            <View style={styles.sectionContent}>
              {renderBusinessTypeRadio()}
              {renderInput('Brief Description of Your Business', 'business_description', { 
                multiline: true, 
                numberOfLines: 3,
                required: true,
                placeholder: 'Briefly describe your business, products or services...'
              })}
              {renderInput('Social Media Handles / Website', 'social_media', { 
                placeholder: 'e.g. instagram.com/mybusiness or @mybusiness'
              })}
            </View>
          )}
        </View>

        {/* Section C: Product Information */}
        <View style={styles.section}>
          {renderSectionHeader('Product Information', 'package-variant', 'product', true)}
          
          {expandedSections.product && (
            <View style={styles.sectionContent}>
              {renderInput('Product Name(s) for Display', 'product_names', { 
                required: true,
                placeholder: 'e.g. Handmade Jewelry, Embroidered Shawls'
              })}
              {renderInput('Price Range of Product(s)', 'price_range', { 
                required: true,
                placeholder: 'e.g. PKR 500 – PKR 5,000'
              })}
              {renderInput('Brief Description of Product(s)', 'product_description', { 
                multiline: true, 
                numberOfLines: 3,
                required: true,
                placeholder: 'Describe the products you wish to display...'
              })}
              {renderInput('What Makes Your Product Unique?', 'product_unique', { 
                multiline: true, 
                numberOfLines: 3,
                required: true,
                placeholder: 'Highlight what sets your product apart...'
              })}
              
              <Text style={styles.sectionSubtitle}>Product Images</Text>
              {renderImagePicker('product_image_1', 'Photo 1', true, '(Required)')}
              {renderImagePicker('product_image_2', 'Photo 2', false, '(Optional)')}
              {renderImagePicker('product_image_3', 'Photo 3', false, '(Optional)')}
            </View>
          )}
        </View>

        {/* Section D: Display Requirements */}
        <View style={styles.section}>
          {renderSectionHeader('Display Requirements', 'view-dashboard', 'display', true)}
          
          {expandedSections.display && (
            <View style={styles.sectionContent}>
              {renderDisplayTypeRadio()}
              {renderInput('Any Special Handling Instructions', 'handling_instructions', { 
                multiline: true, 
                numberOfLines: 2,
                placeholder: 'Mention if your products need extra care, specific lighting, etc.'
              })}
            </View>
          )}
        </View>

        {/* Section E: Availability & Misc */}
        <View style={styles.section}>
          {renderSectionHeader('Availability & Misc', 'calendar-clock', 'availability', true)}
          
          {expandedSections.availability && (
            <View style={styles.sectionContent}>
              <Text style={styles.sectionSubtitle}>Preferred Dates for Display</Text>
              {renderDatePicker('From Date', 'start', true)}
              {renderDatePicker('To Date', 'end', true)}
              {renderRadioGroup('Do You Have Business Cards Available?', 'business_cards', [
                { label: 'Yes', value: 'yes' },
                { label: 'No', value: 'no' },
              ], true)}
            </View>
          )}
        </View>

        {/* Section F: Declaration */}
        <View style={styles.section}>
          {renderSectionHeader('Declaration', 'shield-check', 'declaration', true)}
          
          {expandedSections.declaration && (
            <View style={styles.sectionContent}>
              {renderGuidelines()}
              
              <TouchableOpacity
                style={[styles.consentContainer, formData.consent && styles.consentContainerChecked]}
                onPress={() => setFormData(prev => ({ ...prev, consent: !prev.consent }))}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, formData.consent && styles.checkboxChecked]}>
                  {formData.consent && <Icon name="check" size={12} color="#fff" />}
                </View>
                <Text style={[styles.consentText, formData.consent && styles.consentTextChecked]}>
                  I hereby declare that the information provided above is true and correct. I have read and agree to the terms and conditions regarding the product display initiative at MNWC.
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <LinearGradient
            colors={submitting ? ['#999', '#777'] : [COLORS.primary, COLORS.primaryDark]}
            style={styles.submitButtonGradient}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  Update Application
                </Text>
                <Text style={styles.submitButtonSubtext}>
                  Save changes to application #{record_id}
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
                    <LinearGradient colors={[COLORS.primarySoft, COLORS.secondary]} style={styles.modalOptionIcon}>
                      <Icon name="camera" size={24} color={COLORS.primary} />
                    </LinearGradient>
                    <Text style={styles.modalOptionText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={openGallery}
                  >
                    <LinearGradient colors={[COLORS.primarySoft, COLORS.secondary]} style={styles.modalOptionIcon}>
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
    shadowColor: COLORS.primary,
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
  scrollContent: {
    padding: 12,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(230, 138, 0, 0.1)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'rgba(230, 138, 0, 0.02)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(230, 138, 0, 0.1)',
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
    backgroundColor: 'rgba(230, 138, 0, 0.1)',
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
    color: COLORS.primary,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 8,
    marginBottom: 12,
  },
  required: {
    color: '#ef4444',
    fontSize: 12,
  },
  sectionToggleContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(230, 138, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionToggle: {
    fontSize: 16,
    color: COLORS.primary,
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
    borderColor: 'rgba(230, 138, 0, 0.15)',
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
  conditionalField: {
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
  },
  radioGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(230, 138, 0, 0.1)',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  radioText: {
    fontSize: 12,
    color: '#1a1a1a',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(230, 138, 0, 0.15)',
    borderRadius: 10,
    backgroundColor: '#fff',
    gap: 10,
  },
  datePickerText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
  datePickerTextSelected: {
    color: '#1a1a1a',
  },
  imagePickerGroup: {
    marginBottom: 14,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: 'rgba(230, 138, 0, 0.15)',
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: 'rgba(230, 138, 0, 0.02)',
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
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderText: {
    fontSize: 11,
    color: COLORS.primary,
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
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(230, 138, 0, 0.2)',
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
    backgroundColor: 'rgba(230, 138, 0, 0.2)',
  },
  purposeBanner: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  purposeText: {
    flex: 1,
    fontSize: 11,
    color: '#92400e',
    lineHeight: 16,
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
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    marginTop: 5,
    marginRight: 6,
  },
  guidelineText: {
    flex: 1,
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  consentContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
  },
  consentContainerChecked: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#10b981',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
  },
  consentText: {
    flex: 1,
    fontSize: 11,
    color: '#666',
    lineHeight: 16,
  },
  consentTextChecked: {
    color: '#065f46',
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
    borderTopColor: 'rgba(230, 138, 0, 0.1)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  submitButton: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
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
    color: COLORS.primary,
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
    borderColor: 'rgba(230, 138, 0, 0.2)',
  },
  modalOptionText: {
    fontSize: 12,
    color: COLORS.primary,
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

export default ProductDisplayEditScreen;