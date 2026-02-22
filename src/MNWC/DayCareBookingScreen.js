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
  ActionSheetIOS,
  StatusBar,
  TouchableWithoutFeedback,

} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import SyncStorage from 'react-native-sync-storage';
import LinearGradient from 'react-native-linear-gradient';

// ============ API CONFIGURATION ============
const API_BASE_URL = 'https://regions-jade-beatles-sessions.trycloudflare.com/api';

// ============ THEME CONSTANTS ============
const COLORS = {
  primary: '#940775',
  primaryLight: '#b32b9e',
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
  shadow: '#940775',
};

// ============ GRADIENT COLORS ============
const GRADIENTS = {
  header: ['#940775', '#b32b9e', '#d44bb7'],
  card: ['#ffffff', '#fdf2fa'],
  button: ['#940775', '#b32b9e'],
  success: ['#10b981', '#34d399'],
  accent: ['#f9e6f5', '#f3e5f5'],
};

// ============ DaycareBookingScreen Component ============
const DaycareBookingScreen = ({ route, navigation }) => {
  // ============ STATE MANAGEMENT ============
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showHelperFields, setShowHelperFields] = useState(false);
  const [showHealthFields, setShowHealthFields] = useState(false);
  const [activeImagePicker, setActiveImagePicker] = useState(null);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [stateFunctions, setStateFunctions] = useState({});
  const [selectedAttachment, setSelectedAttachment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    parent: true,
    auth: false,
    child: false,
    helper: false,
    health: false,
    booking: false,
  });

  const booking = route.params?.booking || null;
  const isEditMode = !!booking;

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
    consent: false,
  });

  // Load user profile from sync storage
  useEffect(() => {
    loadUserProfile();
  
    if (booking) {
      loadBookingData();
    }
  }, []);

  const loadUserProfile = () => {
    try {
      const userProfile = SyncStorage.get('user_profile');
      if (userProfile) {
        const userData = JSON.parse(userProfile);
        
        setFormData(prev => ({
          ...prev,
          parent_name: userData.name || '',
          parent_cnic: userData.cnic || '',
          parent_contact: userData.contact || '',
          parent_address: userData.address || '',
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
        parent_cnic_pic: booking.parent_cnic_pic ? { uri: booking.parent_cnic_pic } : null,
        auth_cnic_pic: booking.auth_cnic_pic ? { uri: booking.auth_cnic_pic } : null,
        child_pic: booking.child_pic ? { uri: booking.child_pic } : null,
        helper_pic: booking.helper_pic ? { uri: booking.helper_pic } : null,
      });
      setShowHelperFields(booking.has_helper === 'yes');
      setShowHealthFields(booking.has_allergies === 'yes');
    }
  };

  // ============ FIXED CAMERA AND GALLERY FUNCTIONS ============
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera access to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        if (Platform.Version >= 33) {
          // Android 13+ - use new permissions
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } else {
          // Android 12 and below
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };


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
        type: [DocumentPicker.types.images], // This filters to only allow images (PNG, JPG, JPEG)
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
const handleImagePick = (field) => {
  setActiveImagePicker(field);
  
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 1) {
          openCamera();
        } else if (buttonIndex === 2) {
          openGallery();
        }
      }
    );
  } else {
    setShowImagePickerModal(true);
  }
};

  // ============ FORM HANDLERS ============
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'has_helper') {
        setShowHelperFields(value === 'yes');
      }
      if (field === 'has_allergies') {
        setShowHealthFields(value === 'yes');
      }
      
      return newData;
    });
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ============ FORM VALIDATION ============
  const validateForm = () => {
    const required = [
      'parent_name', 'parent_cnic', 'parent_contact', 'parent_address',
      'auth_name', 'auth_cnic', 'auth_contact', 'relationship',
      'child_name', 'child_gender', 'child_years',
      'hours_required', 'require_services'
    ];

    for (const field of required) {
      if (!formData[field]) {
        Alert.alert('Validation Error', `${field.replace(/_/g, ' ')} is required`);
        return false;
      }
    }

    if (!/^\d{13}$/.test(formData.parent_cnic)) {
      Alert.alert('Validation Error', 'Parent CNIC must be exactly 13 digits');
      return false;
    }

    if (!/^\d{13}$/.test(formData.auth_cnic)) {
      Alert.alert('Validation Error', 'Authorized Person CNIC must be exactly 13 digits');
      return false;
    }

    if (!/^03\d{9}$/.test(formData.parent_contact)) {
      Alert.alert('Validation Error', 'Parent contact must be a valid Pakistani mobile number (03XXXXXXXXX)');
      return false;
    }

    if (!/^03\d{9}$/.test(formData.auth_contact)) {
      Alert.alert('Validation Error', 'Authorized Person contact must be a valid Pakistani mobile number (03XXXXXXXXX)');
      return false;
    }

    if (formData.has_helper === 'yes' && formData.helper_contact) {
      if (!/^03\d{9}$/.test(formData.helper_contact)) {
        Alert.alert('Validation Error', 'Helper contact must be a valid Pakistani mobile number (03XXXXXXXXX)');
        return false;
      }
    }

    if (!isEditMode) {
      if (!formData.parent_cnic_pic) {
        Alert.alert('Validation Error', 'Parent CNIC picture is required');
        return false;
      }
      if (!formData.auth_cnic_pic) {
        Alert.alert('Validation Error', 'Authorized Person CNIC picture is required');
        return false;
      }
      if (!formData.child_pic) {
        Alert.alert('Validation Error', 'Child picture is required');
        return false;
      }
    }

    if (formData.has_helper === 'yes') {
      if (!formData.helper_name || !formData.helper_cnic || !formData.helper_contact) {
        Alert.alert('Validation Error', 'All helper fields are required when helper is selected');
        return false;
      }
      
      if (formData.helper_cnic && !/^\d{13}$/.test(formData.helper_cnic)) {
        Alert.alert('Validation Error', 'Helper CNIC must be exactly 13 digits');
        return false;
      }
    }

    if (formData.has_allergies === 'yes' && !formData.health_details) {
      Alert.alert('Validation Error', 'Please specify medical details');
      return false;
    }

    if (!formData.consent) {
      Alert.alert('Validation Error', 'You must agree to the terms and conditions');
      return false;
    }

    return true;
  };

  // ============ SUBMIT HANDLER ============
  const submitBookingToAPI = async (formData) => {
    try {
      const apiFormData = new FormData();
      
      const appendField = (key, value) => {
        if (value !== null && value !== undefined && value !== '') {
          apiFormData.append(key, value.toString());
        }
      };

      appendField('parent_name', formData.parent_name);
      appendField('parent_cnic', formData.parent_cnic);
      appendField('parent_contact', formData.parent_contact);
      appendField('parent_address', formData.parent_address);
      
      appendField('auth_name', formData.auth_name);
      appendField('auth_cnic', formData.auth_cnic);
      appendField('auth_contact', formData.auth_contact);
      appendField('relationship', formData.relationship);
      
      appendField('child_name', formData.child_name);
      appendField('child_gender', formData.child_gender);
      appendField('child_years', formData.child_years);
      appendField('child_months', formData.child_months || '0');
      
      appendField('has_helper', formData.has_helper);
      if (formData.has_helper === 'yes') {
        appendField('helper_name', formData.helper_name);
        appendField('helper_cnic', formData.helper_cnic);
        appendField('helper_contact', formData.helper_contact);
      }
      
      appendField('has_allergies', formData.has_allergies);
      if (formData.has_allergies === 'yes') {
        appendField('health_details', formData.health_details);
      }
      
      appendField('hours_required', formData.hours_required);
      appendField('require_services', formData.require_services);
      appendField('consent', formData.consent ? '1' : '0');

      const imageFields = [
        { key: 'parent_cnic_pic', value: formData.parent_cnic_pic },
        { key: 'auth_cnic_pic', value: formData.auth_cnic_pic },
        { key: 'child_pic', value: formData.child_pic },
        { key: 'helper_pic', value: formData.helper_pic }
      ];

      imageFields.forEach(({ key, value }) => {
        if (value && value.uri) {
          const fileName = value.name || value.uri.split('/').pop() || `${key}.jpg`;
          const fileType = value.type || 'image/jpeg';
          
          apiFormData.append(key, {
            uri: value.uri,
            type: fileType,
            name: fileName,
          });
        }
      });

      const response = await fetch(`${API_BASE_URL}/daycare-booking`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
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
      const response = await submitBookingToAPI(formData);
      
      Alert.alert(
        'Success',
        response.message || 'Booking submitted successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.log('Submit error:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to submit booking. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!booking) return;
    
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this booking?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Implement delete functionality
              Alert.alert('Success', 'Booking deleted successfully', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete booking');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // ============ RENDER FUNCTIONS ============
  const renderSectionHeader = (title, icon, section) => (
    <TouchableOpacity 
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={GRADIENTS.accent}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sectionHeaderGradient}
      >
        <View style={styles.sectionHeaderLeft}>
          <View style={styles.sectionIconContainer}>
            <Text style={styles.sectionIcon}>{icon}</Text>
          </View>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionToggleContainer}>
          <Text style={styles.sectionToggle}>
            {expandedSections[section] ? '−' : '+'}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderImagePicker = (field, label, required = false) => (
    <View style={styles.imagePickerContainer}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TouchableOpacity
        style={styles.imagePicker}
        onPress={() => handleImagePick(field)}
        activeOpacity={0.8}
      >
        {formData[field] ? (
          <Image source={{ uri: formData[field].uri }} style={styles.previewImage} />
        ) : (
          <LinearGradient
            colors={['#f9e6f5', '#f3e5f5']}
            style={styles.placeholderImage}
          >
            <View style={styles.placeholderIconContainer}>
              <Text style={styles.placeholderIcon}>📸</Text>
            </View>
            <Text style={styles.placeholderText}>Tap to upload {label}</Text>
            <Text style={styles.placeholderSubtext}>JPG, PNG • Max 10MB</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderInput = (placeholder, field, options = {}) => (
    <View style={styles.inputWrapper}>
      <TextInput
        style={[styles.input, options.multiline && styles.textArea]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLighter}
        value={formData[field]}
        onChangeText={(text) => handleInputChange(field, text)}
        keyboardType={options.keyboardType || 'default'}
        maxLength={options.maxLength}
        multiline={options.multiline}
        numberOfLines={options.numberOfLines}
        secureTextEntry={options.secureTextEntry}
      />
    </View>
  );

  // ============ MAIN RENDER ============
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
      
      {/* Custom Header with Gradient */}
      <LinearGradient
        colors={GRADIENTS.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {isEditMode ? 'Update Booking' : 'Day Care Registration'}
            </Text>
            <Text style={styles.headerSubtitle}>Complete all required fields</Text>
          </View>
          
          {isEditMode && (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Text style={styles.deleteIcon}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '35%' }]} />
          </View>
          <Text style={styles.progressText}>Step 1 of 3 • Parent Information</Text>
        </View>
      </LinearGradient>

      {/* Info Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.infoCardsScroll}
        contentContainerStyle={styles.infoCardsContent}
      >
        {[
          { icon: '🕘', text: '9AM-5PM', subtext: 'Operating Hours', color: '#940775' },
          { icon: '⏱️', text: '30min slots', subtext: 'Flexible Timing', color: '#b32b9e' },
          { icon: '📅', text: 'Multi-slot', subtext: 'Book Multiple', color: '#d44bb7' },
          { icon: '📍', text: 'On-site', subtext: 'Facility Based', color: '#940775' },
        ].map((item, index) => (
          <LinearGradient
            key={index}
            colors={['#ffffff', '#fdf2fa']}
            style={styles.infoCard}
          >
            <View style={[styles.infoIconContainer, { backgroundColor: `${item.color}15` }]}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
            </View>
            <View>
              <Text style={styles.infoText}>{item.text}</Text>
              <Text style={styles.infoSubtext}>{item.subtext}</Text>
            </View>
          </LinearGradient>
        ))}
      </ScrollView>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PARENT SECTION */}
        <View style={styles.section}>
          {renderSectionHeader('Parent Information', '👤', 'parent')}
          
          {expandedSections.parent && (
            <LinearGradient
              colors={GRADIENTS.card}
              style={styles.sectionContent}
            >
              {renderInput('Full Name *', 'parent_name')}
              {renderInput('CNIC Number (13 digits) *', 'parent_cnic', { keyboardType: 'numeric', maxLength: 13 })}
              {renderInput('Contact Number (03XX-XXXXXXX) *', 'parent_contact', { keyboardType: 'phone-pad', maxLength: 11   })}
              {renderInput('Residential Address *', 'parent_address', { multiline: true, numberOfLines: 2 })}
              {renderImagePicker('parent_cnic_pic', 'CNIC Picture', !isEditMode)}
            </LinearGradient>
          )}
        </View>

        {/* AUTHORIZED PERSON SECTION */}
        <View style={styles.section}>
          {renderSectionHeader('Authorized Person', '✓', 'auth')}
          
          {expandedSections.auth && (
            <LinearGradient
              colors={GRADIENTS.card}
              style={styles.sectionContent}
            >
              {renderInput('Authorized Person Name *', 'auth_name')}
              {renderInput('CNIC Number (13 digits) *', 'auth_cnic', { keyboardType: 'numeric', maxLength: 13 })}
              {renderInput('Contact Number *', 'auth_contact', { keyboardType: 'phone-pad', maxLength: 11  })}
              
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.relationship}
                  onValueChange={(value) => handleInputChange('relationship', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Relationship *" value="" />
                  <Picker.Item label="Mother" value="mother" />
                  <Picker.Item label="Father" value="father" />
                  <Picker.Item label="Sibling" value="sibling" />
                  <Picker.Item label="Grandparent" value="grandparent" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>

              {renderImagePicker('auth_cnic_pic', 'CNIC Picture', !isEditMode)}
            </LinearGradient>
          )}
        </View>

        {/* CHILD SECTION */}
        <View style={styles.section}>
          {renderSectionHeader('Child Information', '🧒', 'child')}
          
          {expandedSections.child && (
            <LinearGradient
              colors={GRADIENTS.card}
              style={styles.sectionContent}
            >
              {renderInput("Child's Full Name *", 'child_name')}
              
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => handleInputChange('child_gender', 'male')}
                >
                  <View style={[styles.radioCircle, formData.child_gender === 'male' && styles.radioSelected]}>
                    {formData.child_gender === 'male' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Male</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => handleInputChange('child_gender', 'female')}
                >
                  <View style={[styles.radioCircle, formData.child_gender === 'female' && styles.radioSelected]}>
                    {formData.child_gender === 'female' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Female</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Years *</Text>
                  {renderInput('0', 'child_years', { keyboardType: 'numeric' })}
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Months</Text>
                  {renderInput('0', 'child_months', { keyboardType: 'numeric' })}
                </View>
              </View>

              {renderImagePicker('child_pic', 'Child Photo', !isEditMode)}
            </LinearGradient>
          )}
        </View>

        {/* HELPER SECTION */}
        <View style={styles.section}>
          {renderSectionHeader('Helper Information', '👥', 'helper')}
          
          {expandedSections.helper && (
            <LinearGradient
              colors={GRADIENTS.card}
              style={styles.sectionContent}
            >
              <Text style={styles.label}>Will a helper accompany the child? *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => handleInputChange('has_helper', 'yes')}
                >
                  <View style={[styles.radioCircle, formData.has_helper === 'yes' && styles.radioSelected]}>
                    {formData.has_helper === 'yes' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Yes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => handleInputChange('has_helper', 'no')}
                >
                  <View style={[styles.radioCircle, formData.has_helper === 'no' && styles.radioSelected]}>
                    {formData.has_helper === 'no' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>No</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.helperNoteContainer}>
                <Text style={styles.helperNoteIcon}>ℹ️</Text>
                <Text style={styles.helperNote}>Only female helpers are permitted.</Text>
              </View>

              {showHelperFields && (
                <View style={styles.conditionalFields}>
                  {renderInput('Helper Name', 'helper_name')}
                  {renderInput('CNIC or B-Form', 'helper_cnic', { keyboardType: 'numeric', maxLength: 13 })}
                  {renderInput('Contact Number', 'helper_contact', { keyboardType: 'phone-pad', maxLength: 11   })}
                  {renderImagePicker('helper_pic', 'Helper Photo')}
                </View>
              )}
            </LinearGradient>
          )}
        </View>

        {/* HEALTH SECTION */}
        <View style={styles.section}>
          {renderSectionHeader('Health Information', '❤️', 'health')}
          
          {expandedSections.health && (
            <LinearGradient
              colors={GRADIENTS.card}
              style={styles.sectionContent}
            >
              <Text style={styles.label}>Does the child have allergies or medical conditions?</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => handleInputChange('has_allergies', 'yes')}
                >
                  <View style={[styles.radioCircle, formData.has_allergies === 'yes' && styles.radioSelected]}>
                    {formData.has_allergies === 'yes' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Yes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => handleInputChange('has_allergies', 'no')}
                >
                  <View style={[styles.radioCircle, formData.has_allergies === 'no' && styles.radioSelected]}>
                    {formData.has_allergies === 'no' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>No</Text>
                </TouchableOpacity>
              </View>

              {showHealthFields && (
                <View style={styles.conditionalFields}>
                  {renderInput('Please specify medical conditions...', 'health_details', { 
                    multiline: true, 
                    numberOfLines: 3 
                  })}
                </View>
              )}
            </LinearGradient>
          )}
        </View>

        {/* BOOKING SECTION */}
        <View style={styles.section}>
          {renderSectionHeader('Booking Details', '📅', 'booking')}
          
          {expandedSections.booking && (
            <LinearGradient
              colors={GRADIENTS.card}
              style={styles.sectionContent}
            >
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.hours_required}
                  onValueChange={(value) => handleInputChange('hours_required', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Duration *" value="" />
                  <Picker.Item label="0.5 hours (1 slot)" value="0.5" />
                  <Picker.Item label="1 hour (2 slots)" value="1" />
                  <Picker.Item label="1.5 hours (3 slots)" value="1.5" />
                  <Picker.Item label="2 hours (4 slots)" value="2" />
                  <Picker.Item label="2.5 hours (5 slots)" value="2.5" />
                  <Picker.Item label="3 hours (6 slots)" value="3" />
                  <Picker.Item label="4 hours (8 slots)" value="4" />
                  <Picker.Item label="5 hours (10 slots)" value="5" />
                  <Picker.Item label="6 hours (12 slots)" value="6" />
                  <Picker.Item label="7 hours (14 slots)" value="7" />
                  <Picker.Item label="8 hours (16 slots)" value="8" />
                </Picker>
              </View>

              <Text style={styles.label}>MNWC Caretaker Services *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => handleInputChange('require_services', 'yes')}
                >
                  <View style={[styles.radioCircle, formData.require_services === 'yes' && styles.radioSelected]}>
                    {formData.require_services === 'yes' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>Yes</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.radioItem}
                  onPress={() => handleInputChange('require_services', 'no')}
                >
                  <View style={[styles.radioCircle, formData.require_services === 'no' && styles.radioSelected]}>
                    {formData.require_services === 'no' && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioText}>No</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          )}
        </View>

        {/* GUIDELINES */}
        <LinearGradient
          colors={['#f9e6f5', '#f3e5f5']}
          style={styles.guidelinesContainer}
        >
          <View style={styles.guidelinesHeader}>
            <Text style={styles.guidelinesTitle}>📋 Important Guidelines</Text>
          </View>
          {[
            'MNWC does not provide meals. Please arrange meals for your child.',
            'Only caretaking services are available at the facility.',
            'All cleanliness, hygiene, and safety SOPs must be followed.',
            'Child will be released only to the authorized person listed above.',
          ].map((text, index) => (
            <View key={index} style={styles.guidelineItem}>
              <View style={styles.guidelineBulletContainer}>
                <Text style={styles.guidelineBullet}>•</Text>
              </View>
              <Text style={styles.guidelineText}>{text}</Text>
            </View>
          ))}
        </LinearGradient>

        {/* CONSENT */}
        <TouchableOpacity
          style={[styles.consentContainer, formData.consent && styles.consentContainerChecked]}
          onPress={() => handleInputChange('consent', !formData.consent)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, formData.consent && styles.checkboxChecked]}>
            {formData.consent && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={[styles.consentText, formData.consent && styles.consentTextChecked]}>
            I confirm that all information provided is accurate. I agree to comply with the rules and SOPs.
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* SUBMIT BUTTON */}
      <LinearGradient
        colors={['#ffffff', '#fdf2fa']}
        style={styles.footer}
      >
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={submitting ? ['#999999', '#777777'] : GRADIENTS.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButtonGradient}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>
                  {isEditMode ? 'Update Booking' : 'Submit Booking Request'}
                </Text>
                <Text style={styles.submitButtonSubtext}>
                  {isEditMode ? 'Update your booking details' : 'Create new daycare booking'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>

      {/* IMAGE PICKER MODAL */}
    {/* IMAGE PICKER MODAL - Updated to match working screen */}
<Modal
  visible={showImagePickerModal}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setShowImagePickerModal(false)}
>
  <TouchableWithoutFeedback onPress={() => setShowImagePickerModal(false)}>
    <View style={styles.modalOverlay}>
      <TouchableWithoutFeedback>
        <LinearGradient
          colors={['#ffffff', '#fdf2fa']}
          style={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Choose an option</Text>
          <View style={styles.modalOptionsRow}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={openCamera}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#f9e6f5', '#f3e5f5']}
                style={styles.modalButtonGradient}
              >
                <Icon name="camera" size={30} color="#940775" />
              </LinearGradient>
              <Text style={styles.modalButtonText}>Capture Image</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={openGallery}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#f9e6f5', '#f3e5f5']}
                style={styles.modalButtonGradient}
              >
                <Icon name="file" size={30} color="#940775" />
              </LinearGradient>
              <Text style={styles.modalButtonText}>Upload File</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.modalCancel}
            onPress={() => setShowImagePickerModal(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </View>
  </TouchableWithoutFeedback>
</Modal>
    </SafeAreaView>
  );
};

// ============ UPDATED STYLES ============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  deleteIcon: {
    fontSize: 20,
    color: '#fff',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 8,
    fontWeight: '500',
  },
  infoCardsScroll: {
    maxHeight: 90,
    marginTop: 16,
  },
  infoCardsContent: {
    paddingHorizontal: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.1)',
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  infoSubtext: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.1)',
    overflow: 'hidden',
  },
  sectionHeader: {
    overflow: 'hidden',
  },
  sectionHeaderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(148, 7, 117, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  sectionToggleContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 7, 117, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionToggle: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sectionContent: {
    padding: 18,
  },
  inputWrapper: {
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.2)',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    backgroundColor: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    color: COLORS.text,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  halfWidth: {
    width: '48%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
    marginLeft: 6,
  },
  required: {
    color: COLORS.error,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.1)',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 28,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  radioText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  helperNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(148, 7, 117, 0.05)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  helperNoteIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  helperNote: {
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
    flex: 1,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.2)',
    borderRadius: 16,
    marginBottom: 14,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  picker: {
    height: 52,
    color: COLORS.text,
  },
  conditionalFields: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 7, 117, 0.1)',
  },
  imagePickerContainer: {
    marginBottom: 16,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: 'rgba(148, 7, 117, 0.2)',
    borderStyle: 'dashed',
    borderRadius: 20,
    backgroundColor: 'rgba(148, 7, 117, 0.02)',
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholderImage: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  placeholderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderIcon: {
    fontSize: 24,
  },
  placeholderText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginBottom: 4,
  },
  placeholderSubtext: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  previewImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  guidelinesContainer: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  guidelinesHeader: {
    marginBottom: 12,
  },
  guidelinesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  guidelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  guidelineBulletContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(148, 7, 117, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  guidelineBullet: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  guidelineText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
  },
  consentContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  consentContainerChecked: {
    backgroundColor: COLORS.successLight,
    borderColor: COLORS.success,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.success,
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  consentText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.text,
    lineHeight: 18,
    fontWeight: '500',
  },
  consentTextChecked: {
    color: '#065f46',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 7, 117, 0.1)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  submitButtonSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 7, 117, 0.1)',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modalOptionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalOptionIcon: {
    fontSize: 28,
  },
  modalOptionTextContainer: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  modalOptionDescription: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  modalCancel: {
    marginTop: 8,
    padding: 16,
    backgroundColor: COLORS.errorLight,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  modalCancelText: {
    fontSize: 16,
    color: COLORS.error,
    fontWeight: '600',
  },
  // Add these to your StyleSheet
modalOptionsRow: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  width: '100%',
  marginVertical: 20,
},
modalButton: {
  alignItems: 'center',
  justifyContent: 'center',
  padding: 10,
},
modalButtonGradient: {
  width: 70,
  height: 70,
  borderRadius: 35,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 10,
  borderWidth: 1,
  borderColor: 'rgba(148, 7, 117, 0.2)',
},
modalButtonText: {
  color: '#940775',
  fontSize: 14,
  fontWeight: '500',
},
});

export default DaycareBookingScreen;