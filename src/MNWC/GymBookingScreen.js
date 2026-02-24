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
  primary: '#674006',
  primaryLight: '#ffb347',
  primaryDark: '#b36b00',
  primaryGradient: ['#8b6120', '#775420', '#a46a12'],
  primarySoft: '#fff5e6',
  secondary: '#f8f9fa',
  background: '#f4f7fb',
  surface: '#ffffff',
  text: '#2c3e50',
  textLight: '#5e6f8d',
  textLighter: '#8a9bb5',
  border: '#e2e8f0',
  borderFocus: '#e68a00',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#e68a00',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  white: '#ffffff',
  black: '#1e293b',
  overlay: 'rgba(0,0,0,0.5)',
  shadow: '#000000',
};

const GymBookingScreen = ({ route, navigation }) => {
     const { user_id, user } = route.params || {};
  // ============ STATE MANAGEMENT ============
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serviceType, setServiceType] = useState('temporary');
  const [showBookingSection, setShowBookingSection] = useState(false);
  const [showMembershipSection, setShowMembershipSection] = useState(false);
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
    applicant_pic: null,
    cnic_pic: null,
    service_type: 'temporary',
    hours_required: '',
    membership_duration: '',
    consent: false,
  });

  // Image preview states
  const [imagePreviews, setImagePreviews] = useState({
    applicant_pic: null,
    cnic_pic: null,
  });

  // Load user profile from sync storage
  useEffect(() => {
     console.log('Received user_id in gymform:', user_id);
    console.log('Received user:', user);
    loadUserProfile();
    if (booking) {
      loadBookingData();
    }
  }, []);

  useEffect(() => {
    setShowBookingSection(serviceType === 'temporary');
    setShowMembershipSection(serviceType === 'membership');
  }, [serviceType]);

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
      setServiceType(booking.service_type || 'temporary');
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
      
      return newData;
    });
  };

  const handleServiceTypeChange = (type) => {
    setServiceType(type);
    handleInputChange('service_type', type);
    if (type === 'membership') {
      handleInputChange('hours_required', '');
      setSelectedTimeSlots([]);
    } else {
      handleInputChange('membership_duration', '');
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

    if (!formData.service_type) {
      Alert.alert('Validation Error', 'Please select service type');
      return false;
    }

    if (formData.service_type === 'temporary') {
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

    if (formData.service_type === 'membership') {
      if (!formData.membership_duration) {
        Alert.alert('Validation Error', 'Please select membership duration');
        return false;
      }
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
        service_type: formData.service_type,
        consent: formData.consent ? '1' : '0',
      };

      if (formData.service_type === 'temporary') {
        textFields.hours_required = formData.hours_required;
      } else {
        textFields.membership_duration = formData.membership_duration;
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

      const response = await fetch(`${API_BASE_URL}/gym-booking`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: apiFormData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to submit booking');
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
        response.message || 'Gym booking submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Failed to submit booking. Please try again.'
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
            onPress={() => handleServiceTypeChange(option.value)}
          >
            <View style={[
              styles.radioCircle,
              serviceType === option.value && styles.radioCircleSelected
            ]}>
              {serviceType === option.value && (
                <View style={styles.radioInner} />
              )}
            </View>
            <Text style={[
              styles.radioText,
              serviceType === option.value && styles.radioTextSelected
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
          <Icon name="account-group" size={12} color={COLORS.primary} />
        </View>
        <Text style={styles.infoText}>
          <Text style={styles.infoTextBold}>Max 8 persons</Text>
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
        <Text style={styles.notesTitle}>Important Information</Text>
      </View>
      {[
        'No expert gym trainer provided',
        'Must have prior equipment knowledge',
        'Follow all SOPs and guidelines',
        'Use equipment responsibly',
      ].map((text, index) => (
        <View key={index} style={styles.noteItem}>
          <View style={styles.noteBullet} />
          <Text style={styles.noteText}>{text}</Text>
        </View>
      ))}
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
              Gym Facility Registration
            </Text>
            <Text style={styles.headerSubtitle}>Complete the form below</Text>
          </View>
          
          <View style={styles.headerRight}>
            <Icon name="dumbbell" size={20} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Bar */}
        {renderInfoBar()}

        {/* Step 1: Service Type Selection */}
        <View style={styles.section}>
          <LinearGradient
            colors={['transparent', COLORS.primarySoft]}
            style={styles.sectionHeaderGradient}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Icon name="format-list-checks" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Step 1: Select Service Type</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            {renderRadioGroup('Type of Request', 'service_type', [
              { label: 'Temporary Booking', value: 'temporary' },
              { label: 'Membership Card', value: 'membership' },
            ], true)}
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
            
            {renderInput('CNIC Number', 'cnic', { 
              keyboardType: 'numeric', 
              maxLength: 13,
              placeholder: '1234512345671',
              required: true,
              helper: '13 digits without dashes'
            })}
            
            {renderInput('Contact Number', 'contact', { 
              keyboardType: 'phone-pad',
              placeholder: '03XXXXXXXXX',
              required: true,
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

        {/* Section B: Booking / Usage Details */}
        {showBookingSection && (
          <View style={styles.section}>
            <LinearGradient
              colors={['transparent', COLORS.primarySoft]}
              style={styles.sectionHeaderGradient}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Icon name="calendar-check" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Section B: Booking Details</Text>
              </View>
            </LinearGradient>
            
            <View style={styles.sectionContent}>
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

        {/* Membership Section */}
        {showMembershipSection && (
          <View style={styles.section}>
            <LinearGradient
              colors={['transparent', COLORS.primarySoft]}
              style={styles.sectionHeaderGradient}
            >
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Icon name="card-account-details-star" size={16} color={COLORS.primary} />
                </View>
                <Text style={styles.sectionTitle}>Membership Details</Text>
              </View>
            </LinearGradient>
            
            <View style={styles.sectionContent}>
              <View style={styles.inputGroup}>
                {renderLabel('Membership Duration', true)}
                <View style={styles.membershipOptions}>
                  {[
                    { label: '1 Month', value: '1_month' },
                    { label: '3 Months', value: '3_months' },
                    { label: '6 Months', value: '6_months' },
                  ].map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.membershipCard,
                        formData.membership_duration === option.value && styles.membershipCardSelected
                      ]}
                      onPress={() => handleInputChange('membership_duration', option.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.membershipCardText,
                        formData.membership_duration === option.value && styles.membershipCardTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Important Notes */}
        {renderImportantNotes()}

        {/* Section C: Declaration */}
        <View style={styles.section}>
          <LinearGradient
            colors={['transparent', COLORS.primarySoft]}
            style={styles.sectionHeaderGradient}
          >
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Icon name="shield-check" size={16} color={COLORS.primary} />
              </View>
              <Text style={styles.sectionTitle}>Section C: Declaration</Text>
            </View>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            <TouchableOpacity
              style={[styles.consentContainer, formData.consent && styles.consentContainerChecked]}
              onPress={() => handleInputChange('consent', !formData.consent)}
              activeOpacity={0.8}
            >
              <View style={[styles.checkbox, formData.consent && styles.checkboxChecked]}>
                {formData.consent && <Icon name="check" size={10} color="#fff" />}
              </View>
              <Text style={[styles.consentText, formData.consent && styles.consentTextChecked]}>
                I confirm that I understand and agree to all terms and conditions
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
                  {isEditMode ? 'Update Booking' : 'Submit Request'}
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
    borderColor: 'rgba(230, 138, 0, 0.1)',
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
    backgroundColor: 'rgba(230, 138, 0, 0.2)',
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
    borderColor: 'rgba(230, 138, 0, 0.1)',
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
    borderBottomColor: 'rgba(230, 138, 0, 0.1)',
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
  uploadsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  halfWidth: {
    width: '48%',
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
    borderColor: 'rgba(230, 138, 0, 0.2)',
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
  membershipOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  membershipCard: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  membershipCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  membershipCardText: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  membershipCardTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  notesContainer: {
    borderRadius: 20,
    padding: 12,
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
    borderTopColor: 'rgba(230, 138, 0, 0.1)',
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
    borderColor: 'rgba(230, 138, 0, 0.2)',
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

export default GymBookingScreen;