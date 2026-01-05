
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  StatusBar,
  RefreshControl,
  Linking,
  FlatList,
  Image,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

const ActivitiesMonitoringScreen = ({ route, navigation }) => {
  const { userCnic, registrationId } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFillModal, setShowFillModal] = useState(false);
  const [activityDetails, setActivityDetails] = useState(null);
  
  // Complete form state matching web form
  const [formData, setFormData] = useState({
    application_id: registrationId,
    orientactivity_id: '',
    activity_title: '',
    activity_date: '',
    mode: '', // 'university_in_person' or 'online'
    type: '', // Activity type
    type_other: '', // Other type text
    audience: [], // Array of selected audience
    audience_other: '', // Other audience text
    male: '0',
    female: '0',
    description: '',
    attendance_sheet: null,
    photos: [],
    video: null,
    supporting_material: [],
    social: {
      linkedin: { enabled: false, url: '' },
      facebook: { enabled: false, url: '' },
      instagram: { enabled: false, url: '' },
      twitter: { enabled: false, url: '' },
      whatsapp: { enabled: false, url: '' },
      others: { enabled: false, url: '' },
    },
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Activity types (same as web)
  const activityTypes = [
    'Orientation Session',
    'Training Workshop',
    'Awareness Campaign',
    'Community Service',
    'Networking Event',
    'Fundraising Activity',
    'Educational Session',
    'Sports Activity',
    'Cultural Event',
    'Research Activity',
    'other'
  ];

  // Audience options (same as web)
  const audienceOptions = [
    'students',
    'faculty',
    'general_public',
    'ngos_cbos',
    'media_persons',
    'guest_speaker',
    'other'
  ];

  const API_BASE_URL = 'https://fa-wdd.punjab.gov.pk/api';

  useEffect(() => {
    console.log('[INIT] 🚀 ActivitiesMonitoringScreen mounted');
    console.log('[INIT] 📋 Registration ID:', registrationId);
    
    if (registrationId) {
      fetchActivities();
    } else {
      Alert.alert('Error', 'Registration ID not available');
      navigation.goBack();
    }
  }, [registrationId]);

  // Fetch activities list
  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      console.log('[API] 📦 Fetching activities for registration:', registrationId);
      
      const response = await fetch(
        `${API_BASE_URL}/ambassador/${registrationId}/activities`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('[API] ✅ Activities data received:', data);
      
      if (data.success) {
        setActivities(data.data || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to load activities');
      }
    } catch (error) {
      console.error('[ERROR] 💥 Fetch activities failed:', error);
      Alert.alert('Connection Error', 'Failed to fetch activities. Please check your internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch activity details
  const fetchActivityDetails = async (activityId) => {
    try {
      setLoading(true);
      
      console.log('[API] 📦 Fetching activity details:', activityId);
      
      const response = await fetch(
        `${API_BASE_URL}/ambassador/${registrationId}/activities/${activityId}/details`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('[API] ✅ Activity details received:', data);
      
      if (data.success) {
        const formattedDetails = {
          id: data.data.id,
          activity_title: data.data.activity_title,
          activity_date: data.data.activity_date,
          mode: data.data.mode,
          venue: data.data.venue,
          university_name: data.data.university_name,
          is_filled: data.data.is_filled,
          details: data.data.data || {},
        };
        
        setActivityDetails(formattedDetails);
        setShowDetailsModal(true);
      } else {
        if (data.redirect) {
          Alert.alert(
            'Activity Not Filled',
            data.message || 'This activity has not been filled yet.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Fill Activity', 
                onPress: () => {
                  handleFillActivity(activityId);
                }
              }
            ]
          );
        } else {
          Alert.alert('Error', data.message || 'Failed to load activity details');
        }
      }
    } catch (error) {
      console.error('[ERROR] 💥 Fetch details failed:', error);
      Alert.alert('Error', 'Please first fill the activity.');
    } finally {
      setLoading(false);
    }
  };

  // Handle fill activity button
  const handleFillActivity = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setSelectedActivity(activity);
      
      // Determine mode from web data
      let mode = '';
      if (activity.mode === 'Physical') {
        mode = 'university_in_person';
      } else if (activity.mode === 'Online') {
        mode = 'online';
      }
      
      setFormData(prev => ({
        ...prev,
        orientactivity_id: activityId,
        activity_title: activity.activity_title,
        activity_date: moment(activity.activity_date, 'DD-MM-YYYY').format('YYYY-MM-DD'),
        mode: mode,
      }));
      
      setShowFillModal(true);
    }
  };

  // Handle view details
  const handleViewDetails = (activityId) => {
    fetchActivityDetails(activityId);
  };

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      application_id: registrationId,
      orientactivity_id: '',
      activity_title: '',
      activity_date: '',
      mode: '',
      type: '',
      type_other: '',
      audience: [],
      audience_other: '',
      male: '0',
      female: '0',
      description: '',
      attendance_sheet: null,
      photos: [],
      video: null,
      supporting_material: [],
      social: {
        linkedin: { enabled: false, url: '' },
        facebook: { enabled: false, url: '' },
        instagram: { enabled: false, url: '' },
        twitter: { enabled: false, url: '' },
        whatsapp: { enabled: false, url: '' },
        others: { enabled: false, url: '' },
      },
    });
    setFormErrors({});
  };

  // Validate form (matching web validation)
  const validateForm = () => {
    const errors = {};
    
    console.log('[VALIDATION] Starting form validation...');
    
    // Activity title
    if (!formData.activity_title.trim()) {
      errors.activity_title = 'Activity Title is required';
      console.log('[VALIDATION] ❌ Activity title missing');
    }
    
    // Mode
    if (!formData.mode) {
      errors.mode = 'Venue/Mode is required';
      console.log('[VALIDATION] ❌ Mode missing');
    }
    
    // Type
    if (!formData.type) {
      errors.type = 'Type of Activity is required';
      console.log('[VALIDATION] ❌ Type missing');
    }
    
    // Type other (if type is 'other')
    if (formData.type === 'other' && !formData.type_other.trim()) {
      errors.type_other = 'Please specify other type';
      console.log('[VALIDATION] ❌ Type other missing');
    }
    
    // Audience
    if (formData.audience.length === 0) {
      errors.audience = 'Target Audience is required';
      console.log('[VALIDATION] ❌ Audience missing');
    }
    
    // Audience other (if 'other' is selected)
    if (formData.audience.includes('other') && !formData.audience_other.trim()) {
      errors.audience_other = 'Please specify other audience';
      console.log('[VALIDATION] ❌ Audience other missing');
    }
    
    // Male participants
    if (!formData.male || isNaN(formData.male) || parseInt(formData.male) < 0) {
      errors.male = 'Enter valid number of male participants';
      console.log('[VALIDATION] ❌ Male participants invalid:', formData.male);
    }
    
    // Female participants
    if (!formData.female || isNaN(formData.female) || parseInt(formData.female) < 0) {
      errors.female = 'Enter valid number of female participants';
      console.log('[VALIDATION] ❌ Female participants invalid:', formData.female);
    }
    
    // Description
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
      console.log('[VALIDATION] ❌ Description missing');
    }
    
    // Word count check
    const wordCount = formData.description.trim().split(/\s+/).length;
    if (wordCount > 300) {
      errors.description = 'Description must be 300 words or less';
      console.log('[VALIDATION] ❌ Description too long:', wordCount);
    }
    
    // Attendance sheet
    if (!formData.attendance_sheet) {
      errors.attendance_sheet = 'Attendance sheet is required';
      console.log('[VALIDATION] ❌ Attendance sheet missing');
    }
    
    // Photos (3-6 required)
    if (formData.photos.length < 3 || formData.photos.length > 6) {
      errors.photos = '3-6 photos are required';
      console.log('[VALIDATION] ❌ Photos count invalid:', formData.photos.length);
    }
    
    // Social media validation - at least one required
    const hasSocialMedia = Object.values(formData.social).some(
      platform => platform.enabled && platform.url.trim()
    );
    
    if (!hasSocialMedia) {
      errors.social = 'At least one social media link is required';
      console.log('[VALIDATION] ❌ Social media missing');
    } else {
      // Validate URLs for enabled platforms
      Object.entries(formData.social).forEach(([platform, data]) => {
        if (data.enabled && data.url.trim()) {
          const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          if (!urlRegex.test(data.url)) {
            errors[`social_${platform}`] = `Invalid ${platform} URL`;
            console.log(`[VALIDATION] ❌ Invalid ${platform} URL:`, data.url);
          }
        }
      });
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    console.log('[VALIDATION] Validation errors:', errors);
    return errors;
  };

  // Submit activity form
  const submitActivityForm = async () => {
    console.log('[SUBMIT] Starting form submission...');
    console.log('[SUBMIT] Form data:', JSON.stringify(formData, null, 2));
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const data = new FormData();
      
      // Basic fields
      data.append('application_id', formData.application_id.toString());
      data.append('orientactivity_id', formData.orientactivity_id.toString());
      data.append('activity_title', formData.activity_title);
      data.append('activity_date', formData.activity_date);
      data.append('mode', formData.mode);
      data.append('type', formData.type);
      
      if (formData.type === 'other') {
        data.append('type_other', formData.type_other);
      }
      
      // Audience (array)
      formData.audience.forEach((item, index) => {
        data.append(`audience[${index}]`, item);
      });
      
      if (formData.audience.includes('other') && formData.audience_other) {
        data.append('audience_other', formData.audience_other);
      }
      
      data.append('male', formData.male);
      data.append('female', formData.female);
      data.append('description', formData.description);
      
      // Attendance sheet
      if (formData.attendance_sheet) {
        data.append('attendance_sheet', {
          uri: formData.attendance_sheet.uri,
          type: formData.attendance_sheet.type,
          name: formData.attendance_sheet.name,
        });
      }
      
      // Photos (3-6)
      formData.photos.forEach((photo, index) => {
        data.append(`photos[${index}]`, {
          uri: photo.uri,
          type: photo.type,
          name: photo.name,
        });
      });
      
      // Video (optional)
      if (formData.video) {
        data.append('video', {
          uri: formData.video.uri,
          type: formData.video.type,
          name: formData.video.name,
        });
      }
      
      // Supporting files (optional)
      formData.supporting_material.forEach((file, index) => {
        data.append(`supporting_material[${index}]`, {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      });
      
      // Social media links
      Object.entries(formData.social).forEach(([platform, platformData]) => {
        if (platformData.enabled && platformData.url.trim()) {
          data.append(`social.${platform}.enabled`, '1');
          data.append(`social.${platform}.url`, platformData.url.trim());
        }
      });

      console.log('[API] 📦 Submitting activity form. ');
      
      const response = await fetch(
        `${API_BASE_URL}/activityform/submit`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          body: data,
        }
      );

      const result = await response.json();
      console.log('[API] ✅ Submit response:', result);
      
      if (result.success) {
        Alert.alert('Success!', 'Activity submitted successfully!', [
          { 
            text: 'OK', 
            onPress: () => {
              setShowFillModal(false);
              resetForm();
              fetchActivities();
            }
          }
        ]);
      } else {
        let errorMessage = result.message || 'Failed to submit activity';
        if (result.errors) {
          errorMessage = Object.values(result.errors).flat().join('\n');
        }
        Alert.alert('Error', errorMessage);
      }
    } catch (error) {
      console.error('[ERROR] 💥 Submit failed:', error);
      Alert.alert('Error', 'Failed to submit activity. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // File picker functions
  const pickPhotos = async () => {
    try {
      console.log('[FILE] Picking photos...');
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 6 - formData.photos.length, // Max 6 total
      });
      
      if (result.assets && result.assets.length > 0) {
        const newPhotos = result.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `photo_${Date.now()}.jpg`,
        }));
        
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, ...newPhotos]
        }));
        
        if (formErrors.photos) {
          setFormErrors(prev => ({ ...prev, photos: '' }));
        }
        
        console.log('[FILE] Photos selected:', newPhotos.length);
      }
    } catch (error) {
      console.error('[FILE] Photo picker error:', error);
      Alert.alert('Error', 'Failed to pick photos');
    }
  };

  const takePhoto = async () => {
    try {
      console.log('[FILE] Taking photo...');
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });
      
      if (result.assets && result.assets.length > 0) {
        const newPhoto = {
          uri: result.assets[0].uri,
          type: result.assets[0].type || 'image/jpeg',
          name: result.assets[0].fileName || `camera_${Date.now()}.jpg`,
        };
        
        if (formData.photos.length < 6) {
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, newPhoto]
          }));
          
          if (formErrors.photos) {
            setFormErrors(prev => ({ ...prev, photos: '' }));
          }
          
          console.log('[FILE] Photo taken successfully');
        } else {
          Alert.alert('Limit Reached', 'Maximum 6 photos allowed');
        }
      }
    } catch (error) {
      console.error('[FILE] Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickVideo = async () => {
    try {
      console.log('[FILE] Picking video...');
      const result = await launchImageLibrary({
        mediaType: 'video',
        quality: 0.8,
      });
      
      if (result.assets && result.assets.length > 0) {
        const video = {
          uri: result.assets[0].uri,
          type: result.assets[0].type || 'video/mp4',
          name: result.assets[0].fileName || `video_${Date.now()}.mp4`,
        };
        
        setFormData(prev => ({
          ...prev,
          video: video
        }));
        
        console.log('[FILE] Video selected:', video.name);
      }
    } catch (error) {
      console.error('[FILE] Video picker error:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const pickAttendanceSheet = async () => {
    try {
      console.log('[FILE] Picking attendance sheet...');
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.images],
      });
      
      const file = {
        uri: result[0].uri,
        type: result[0].type,
        name: result[0].name,
        size: result[0].size,
      };
      
      setFormData(prev => ({
        ...prev,
        attendance_sheet: file
      }));
      
      if (formErrors.attendance_sheet) {
        setFormErrors(prev => ({ ...prev, attendance_sheet: '' }));
      }
      
      console.log('[FILE] Attendance sheet selected:', file.name);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('[FILE] Document picker error:', error);
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const pickSupportingFiles = async () => {
    try {
      console.log('[FILE] Picking supporting files...');
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.images,
       
        ],
      });
      
      const newFiles = result.map(file => ({
        uri: file.uri,
        type: file.type,
        name: file.name,
        size: file.size,
      }));
      
      setFormData(prev => ({
        ...prev,
        supporting_material: [...prev.supporting_material, ...newFiles]
      }));
      
      console.log('[FILE] Supporting files selected:', newFiles.length);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('[FILE] Document picker error:', error);
        Alert.alert('Error', 'Failed to pick files');
      }
    }
  };

  // Remove functions
  const removePhoto = (index) => {
    console.log('[FILE] Removing photo at index:', index);
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const removeSupportingFile = (index) => {
    console.log('[FILE] Removing supporting file at index:', index);
    setFormData(prev => ({
      ...prev,
      supporting_material: prev.supporting_material.filter((_, i) => i !== index)
    }));
  };

  // Handle audience selection
  const toggleAudience = (audienceItem) => {
    console.log('[FORM] Toggling audience:', audienceItem);
    setFormData(prev => {
      const newAudience = prev.audience.includes(audienceItem)
        ? prev.audience.filter(item => item !== audienceItem)
        : [...prev.audience, audienceItem];
      
      if (formErrors.audience) {
        setFormErrors(prevErrors => ({ ...prevErrors, audience: '' }));
      }
      
      if (audienceItem === 'other' && !newAudience.includes('other')) {
        return { ...prev, audience: newAudience, audience_other: '' };
      }
      
      return { ...prev, audience: newAudience };
    });
  };

  // Handle social media toggles
  const toggleSocialMedia = (platform) => {
    console.log('[FORM] Toggling social media:', platform);
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: {
          ...prev.social[platform],
          enabled: !prev.social[platform].enabled
        }
      }
    }));
    
    if (formErrors.social || formErrors[`social_${platform}`]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.social;
        delete newErrors[`social_${platform}`];
        return newErrors;
      });
    }
  };

  // Update social media URL
  const updateSocialUrl = (platform, url) => {
    console.log('[FORM] Updating social URL:', platform, url);
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: {
          ...prev.social[platform],
          url: url
        }
      }
    }));
    
    if (formErrors[`social_${platform}`]) {
      setFormErrors(prev => ({ ...prev, [`social_${platform}`]: '' }));
    }
  };

  // Calculate word count
  const getWordCount = () => {
    return formData.description.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Render activity item
  const renderActivityItem = ({ item, index }) => {
    const isFilled = item.is_filled || false;
    const activityDate = item.activity_date || '—';
    const universityName = item.university_name || 'University';
    
    return (
      <TouchableOpacity 
        style={[
          styles.activityCard,
          index === 0 && styles.firstCard,
        ]}
        onPress={() => handleViewDetails(item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.activityNumber}>
            <Text style={styles.activityNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.activityInfo}>
            <Text style={styles.activityTitle} numberOfLines={2}>
              {item.activity_title || 'Activity'}
            </Text>
            <Text style={styles.activityDate}>
              <Icon name="calendar" size={10} color="#666" /> {activityDate}
            </Text>
          </View>
          <View style={styles.activityStatus}>
            {isFilled ? (
              <View style={styles.completedBadge}>
                <Icon name="check-circle" size={12} color="#fff" />
                <Text style={styles.completedText}>Completed</Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.fillButton}
                onPress={() => handleFillActivity(item.id)}
              >
                <Icon name="edit" size={12} color="#fff" />
                <Text style={styles.fillButtonText}>Fill Activity</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="map-marker" size={10} color="#6B2D5C" />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.mode === 'Physical' 
                  ? (item.venue || 'Physical Venue')
                  : '🌐 Online Session'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="university" size={10} color="#6B2D5C" />
              <Text style={styles.detailText} numberOfLines={1}>
                {universityName}
              </Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.viewDetailsButton}
          onPress={() => handleViewDetails(item.id)}
        >
          <Text style={styles.viewDetailsText}>
            {isFilled ? 'View Details' : 'View & Fill'}
          </Text>
          <Icon name="chevron-right" size={10} color="#6B2D5C" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render activity list
  const renderActivityList = () => {
    if (activities.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="tasks" size={40} color="#D2ECFF" />
          <Text style={styles.emptyStateTitle}>No Activities Found</Text>
          <Text style={styles.emptyStateText}>
            You don't have any activities scheduled yet.{'\n'}
            Go to Activity Calendar to schedule activities first.
          </Text>
          <TouchableOpacity 
            style={styles.goToCalendarButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="calendar" size={14} color="#fff" />
            <Text style={styles.goToCalendarText}>Go to Activity Calendar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderActivityItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Activities & Monitoring</Text>
            <Text style={styles.listSubtitle}>
              Total Activities: {activities.length}
            </Text>
          </View>
        )}
      />
    );
  };

  // Render details modal
  const renderDetailsModal = () => {
    if (!activityDetails) return null;
    
    const activity = activityDetails;
    const details = activity.details || {};
    
    return (
   <Modal
  visible={showDetailsModal}
  animationType="slide"
  transparent={true}
  onRequestClose={() => setShowDetailsModal(false)}
>
  <SafeAreaView style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <LinearGradient
        colors={['#6B2D5C', '#3E2A5D']}
        style={styles.modalHeader}
      >
        <View style={styles.modalHeaderContent}>
          <Icon name="tasks" size={18} color="#fff" />
          <Text style={styles.modalTitle} numberOfLines={2}>
            {activity.activity_title}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => setShowDetailsModal(false)}
        >
          <Icon name="times" size={18} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
      
      <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Activity Information</Text>
            <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Title:</Text>
            <Text style={styles.detailValue}> {activity.activity_title}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{activity.activity_date}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mode:</Text>
            <View style={[
              styles.modeBadge,
              { backgroundColor: activity.mode === 'Physical' ? '#4CAF50' : '#2196F3' }
            ]}>
              <Text style={styles.modeBadgeText}>{activity.mode}</Text>
            </View>
          </View>
          
          {activity.venue && activity.venue !== '—' && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Venue:</Text>
              <Text style={styles.detailValue}>{activity.venue}</Text>
            </View>
          )}
          
          {activity.university_name && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>University:</Text>
              <Text style={styles.detailValue}>{activity.university_name}</Text>
            </View>
          )}
        </View>
        
        {activity.is_filled && (
          <>
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Attendance</Text>
              
              <View style={styles.attendanceRow}>
                <View style={styles.attendanceItem}>
                  <Icon name="male" size={16} color="#2196F3" />
                  <Text style={styles.attendanceLabel}>Male</Text>
                  <Text style={styles.attendanceValue}>
                    {details.male || 0}
                  </Text>
                </View>
                
                <View style={styles.attendanceItem}>
                  <Icon name="female" size={16} color="#E91E63" />
                  <Text style={styles.attendanceLabel}>Female</Text>
                  <Text style={styles.attendanceValue}>
                    {details.female || 0}
                  </Text>
                </View>
                
                <View style={styles.attendanceItem}>
                  <Icon name="users" size={16} color="#4CAF50" />
                  <Text style={styles.attendanceLabel}>Total</Text>
                  <Text style={styles.attendanceValue}>
                    {(parseInt(details.male) || 0) + (parseInt(details.female) || 0)}
                  </Text>
                </View>
              </View>
            </View>
            
            {details.description && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>
                  {details.description}
                </Text>
              </View>
            )}
            
            {/* FIXED: Photos Section - remove /storage/ from path */}
            {details.photos && details.photos.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Photos ({details.photos.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {details.photos.map((photo, index) => {
                    // Construct URL: Remove /storage/ prefix and use correct base
                    let photoUrl = photo;
                    if (!photo.startsWith('http')) {
                      // Remove /storage/ from the beginning of the path
                      const cleanPath = photo.replace(/^\/storage\//, '');
                      photoUrl = `https://fa-wdd.punjab.gov.pk/${cleanPath}`;
                    }
                    
                    return (
                      <TouchableOpacity 
                        key={index}
                        style={styles.photoItem}
                        onPress={() => Linking.openURL(photoUrl)}
                      >
                        <Icon name="eye" size={20} color="#6B2D5C" />
                        <Text style={styles.photoText}>Photo {index + 1}</Text>
                         <Text style={styles.photoTextt}>click to view</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}
            
            {/* FIXED: Video Section - remove /storage/ from path */}
            {details.video && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Video</Text>
                <TouchableOpacity 
                  style={styles.videoItem}
                  onPress={() => {
                    // Construct URL: Remove /storage/ prefix
                    let videoUrl = details.video;
                    if (!videoUrl.startsWith('http')) {
                      // Remove /storage/ from the beginning of the path
                      const cleanPath = videoUrl.replace(/^\/storage\//, '');
                      videoUrl = `https://fa-wdd.punjab.gov.pk/${cleanPath}`;
                    }
                    Linking.openURL(videoUrl);
                  }}
                >
                  <Icon name="play-circle" size={20} color="#FF5722" />
                  <Text style={styles.videoText}>View Video</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {/* FIXED: Supporting Materials Section - remove /storage/ from path */}
            {details.supporting_material && details.supporting_material.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>
                  Supporting Files ({details.supporting_material.length})
                </Text>
                {details.supporting_material.map((file, index) => {
                  // Construct URL: Remove /storage/ prefix
                  let fileUrl = file;
                  if (!fileUrl.startsWith('http')) {
                    // Remove /storage/ from the beginning of the path
                    const cleanPath = fileUrl.replace(/^\/storage\//, '');
                    fileUrl = `https://fa-wdd.punjab.gov.pk/${cleanPath}`;
                  }
                  
                  // Extract filename from path
                  const fileName = file.split('/').pop() || `File ${index + 1}`;
                  
                  return (
                    <TouchableOpacity 
                      key={index}
                      style={styles.fileItem}
                      onPress={() => Linking.openURL(fileUrl)}
                    >
                      <Icon 
                        name={file.includes('.pdf') ? "file-pdf" : "file"} 
                        size={16} 
                        color={file.includes('.pdf') ? "#F44336" : "#9C27B0"} 
                      />
                      <Text style={styles.fileText} numberOfLines={1}>
                        {fileName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            
            {details.social_links && details.social_links.length > 0 && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Social Media Links</Text>
                {details.social_links.map((link, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.linkItem}
                    onPress={() => Linking.openURL(link.startsWith('http') ? link : `https://${link}`)}
                  >
                    <Icon name="external-link" size={14} color="#2196F3" />
                    <Text style={styles.linkText} numberOfLines={1}>
                      {link.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {/* FIXED: Attendance Sheet - remove /storage/ from path */}
            {details.attendance_sheet && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Attendance Sheet</Text>
                <TouchableOpacity 
                  style={styles.attendanceSheetItem}
                  onPress={() => {
                    // Construct URL: Remove /storage/ prefix
                    let sheetUrl = details.attendance_sheet;
                    if (!sheetUrl.startsWith('http')) {
                      // Remove /storage/ from the beginning of the path
                      const cleanPath = sheetUrl.replace(/^\/storage\//, '');
                      sheetUrl = `https://fa-wdd.punjab.gov.pk/${cleanPath}`;
                    }
                    Linking.openURL(sheetUrl);
                  }}
                >
                  <Icon name="file" size={18} color="#F44336" />
                  <Text style={styles.attendanceSheetText}>View Attendance Sheet</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
        
        <View style={styles.actionButtons}>
          {!activity.is_filled && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.fillButtonLarge]}
              onPress={() => {
                setShowDetailsModal(false);
                handleFillActivity(activity.id);
              }}
            >
              <Icon name="edit" size={14} color="#fff" />
              <Text style={styles.actionButtonText}>Fill Activity</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.closeButtonLarge]}
            onPress={() => setShowDetailsModal(false)}
          >
            <Icon name="check" size={14} color="#fff" />
            <Text style={styles.actionButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  </SafeAreaView>
</Modal>
    );
  };

  // Render fill modal - COMPLETE WEB FORM
  const renderFillModal = () => {
    if (!selectedActivity) return null;
    
    const wordCount = getWordCount();
    
    return (
      <Modal
        visible={showFillModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowFillModal(false);
          resetForm();
        }}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <ScrollView 
            style={styles.fillModalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <LinearGradient
              colors={['#6B2D5C', '#3E2A5D']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <Icon name="edit" size={18} color="#fff" />
                <Text style={styles.modalTitle} numberOfLines={2}>
                  Fill Activity: {selectedActivity.activity_title}
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowFillModal(false);
                  resetForm();
                }}
              >
                <Icon name="times" size={18} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <View style={styles.fillForm}>
              {/* Activity Section Header */}
              <View style={styles.sectionHeader}>
                <Icon2 name="event" size={16} color="#6B2D5C" />
                <Text style={styles.sectionHeaderText}>Activity Section</Text>
              </View>
              
              {/* Activity Title */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Activity Title <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formErrors.activity_title && styles.inputError
                  ]}
                  placeholder="Enter activity title"
                  placeholderTextColor="#999"
                  value={formData.activity_title}
                  onChangeText={(text) => {
                    console.log('[FORM] Activity title changed:', text);
                    setFormData(prev => ({ ...prev, activity_title: text }));
                    if (formErrors.activity_title) setFormErrors(prev => ({ ...prev, activity_title: '' }));
                  }}
                />
                {formErrors.activity_title && (
                  <Text style={styles.errorText}>{formErrors.activity_title}</Text>
                )}
              </View>
              
              {/* Date (read-only) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Date of Activity</Text>
                <View style={[styles.input, styles.readOnlyInput]}>
                  <Text style={styles.readOnlyText}>
                    {moment(selectedActivity.activity_date, 'DD-MM-YYYY').format('DD/MM/YYYY')}
                  </Text>
                </View>
              </View>
              
              {/* Venue/Mode Radio Buttons */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Venue/Mode of Activity <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => {
                      console.log('[FORM] Mode selected: university_in_person');
                      setFormData(prev => ({ ...prev, mode: 'university_in_person' }));
                      if (formErrors.mode) setFormErrors(prev => ({ ...prev, mode: '' }));
                    }}
                  >
                    <View style={styles.radioCircle}>
                      {formData.mode === 'university_in_person' && <View style={styles.selectedRadio} />}
                    </View>
                    <Text style={styles.radioLabel}>University (In-Person)</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => {
                      console.log('[FORM] Mode selected: online');
                      setFormData(prev => ({ ...prev, mode: 'online' }));
                      if (formErrors.mode) setFormErrors(prev => ({ ...prev, mode: '' }));
                    }}
                  >
                    <View style={styles.radioCircle}>
                      {formData.mode === 'online' && <View style={styles.selectedRadio} />}
                    </View>
                    <Text style={styles.radioLabel}>Online</Text>
                  </TouchableOpacity>
                </View>
                {formErrors.mode && (
                  <Text style={styles.errorText}>{formErrors.mode}</Text>
                )}
              </View>
              
              {/* Type of Activity Dropdown */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Type of Activity <Text style={styles.requiredStar}>*</Text>
                </Text>
                <ScrollView 
                  style={styles.typeDropdown}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                >
                  {activityTypes.map((type, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.typeOption,
                        formData.type === type && styles.typeOptionSelected
                      ]}
                      onPress={() => {
                        console.log('[FORM] Type selected:', type);
                        setFormData(prev => ({ 
                          ...prev, 
                          type: type,
                          type_other: type === 'other' ? prev.type_other : ''
                        }));
                        if (formErrors.type) setFormErrors(prev => ({ ...prev, type: '' }));
                        if (formErrors.type_other) setFormErrors(prev => ({ ...prev, type_other: '' }));
                      }}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        formData.type === type && styles.typeOptionTextSelected
                      ]}>
                        {type === 'other' ? 'Other' : type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                {formErrors.type && (
                  <Text style={styles.errorText}>{formErrors.type}</Text>
                )}
                
                {/* Other Type Input */}
                {formData.type === 'other' && (
                  <View style={styles.otherInputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        formErrors.type_other && styles.inputError
                      ]}
                      placeholder="Specify other type"
                      placeholderTextColor="#999"
                      value={formData.type_other}
                      onChangeText={(text) => {
                        console.log('[FORM] Type other changed:', text);
                        setFormData(prev => ({ ...prev, type_other: text }));
                        if (formErrors.type_other) setFormErrors(prev => ({ ...prev, type_other: '' }));
                      }}
                    />
                    {formErrors.type_other && (
                      <Text style={styles.errorText}>{formErrors.type_other}</Text>
                    )}
                  </View>
                )}
              </View>
              
              {/* Target Audience Checkboxes */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Target Audience (Click to select multiple) <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.audienceGrid}>
                  {audienceOptions.map((audience, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.audienceOption,
                        formData.audience.includes(audience) && styles.audienceOptionSelected
                      ]}
                      onPress={() => toggleAudience(audience)}
                    >
                      <Text style={[
                        styles.audienceText,
                        formData.audience.includes(audience) && styles.audienceTextSelected
                      ]}>
                        {audience.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {formErrors.audience && (
                  <Text style={styles.errorText}>{formErrors.audience}</Text>
                )}
                
                {/* Other Audience Input */}
                {formData.audience.includes('other') && (
                  <View style={styles.otherInputContainer}>
                    <TextInput
                      style={[
                        styles.input,
                        formErrors.audience_other && styles.inputError
                      ]}
                      placeholder="Specify other audience type(s)"
                      placeholderTextColor="#999"
                      value={formData.audience_other}
                      onChangeText={(text) => {
                        console.log('[FORM] Audience other changed:', text);
                        setFormData(prev => ({ ...prev, audience_other: text }));
                        if (formErrors.audience_other) setFormErrors(prev => ({ ...prev, audience_other: '' }));
                      }}
                    />
                    {formErrors.audience_other && (
                      <Text style={styles.errorText}>{formErrors.audience_other}</Text>
                    )}
                  </View>
                )}
              </View>
              
              {/* Number of Participants */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Number of Participants</Text>
                <View style={styles.participantsRow}>
                  <View style={styles.participantInput}>
                    <Text style={styles.participantLabel}>Male:</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.smallInput,
                        formErrors.male && styles.inputError
                      ]}
                      placeholder="e.g., 35"
                      placeholderTextColor="#999"
                      value={formData.male}
                      onChangeText={(text) => {
                        console.log('[FORM] Male participants changed:', text);
                        setFormData(prev => ({ ...prev, male: text.replace(/[^0-9]/g, '') }));
                        if (formErrors.male) setFormErrors(prev => ({ ...prev, male: '' }));
                      }}
                      keyboardType="numeric"
                    />
                    {formErrors.male && (
                      <Text style={styles.errorText}>{formErrors.male}</Text>
                    )}
                  </View>
                  
                  <View style={styles.participantInput}>
                    <Text style={styles.participantLabel}>Female:</Text>
                    <TextInput
                      style={[
                        styles.input,
                        styles.smallInput,
                        formErrors.female && styles.inputError
                      ]}
                      placeholder="e.g., 42"
                      placeholderTextColor="#999"
                      value={formData.female}
                      onChangeText={(text) => {
                        console.log('[FORM] Female participants changed:', text);
                        setFormData(prev => ({ ...prev, female: text.replace(/[^0-9]/g, '') }));
                        if (formErrors.female) setFormErrors(prev => ({ ...prev, female: '' }));
                      }}
                      keyboardType="numeric"
                    />
                    {formErrors.female && (
                      <Text style={styles.errorText}>{formErrors.female}</Text>
                    )}
                  </View>
                </View>
              </View>
              
              {/* Description with Word Count */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Description of Activity (Max 300 words) <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    formErrors.description && styles.inputError
                  ]}
                  placeholder="Provide a detailed description..."
                  placeholderTextColor="#999"
                  value={formData.description}
                  onChangeText={(text) => {
                    console.log('[FORM] Description changed, word count:', getWordCount());
                    setFormData(prev => ({ ...prev, description: text }));
                    if (formErrors.description) setFormErrors(prev => ({ ...prev, description: '' }));
                  }}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
                <View style={styles.wordCountContainer}>
                  <Text style={[
                    styles.wordCountText,
                    wordCount > 300 && styles.wordCountError
                  ]}>
                    Word count: {wordCount}/300
                  </Text>
                </View>
                {formErrors.description && (
                  <Text style={styles.errorText}>{formErrors.description}</Text>
                )}
              </View>
              
              {/* Evidence Upload Section */}
              <View style={styles.sectionHeader}>
                <Icon2 name="cloud-upload" size={16} color="#6B2D5C" />
                <Text style={styles.sectionHeaderText}>Evidence Upload</Text>
              </View>
              
              {/* Attendance Sheet */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Upload Attendance Sheet (PDF/JPG) <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.filePickerButton,
                    formErrors.attendance_sheet && styles.inputError
                  ]}
                  onPress={pickAttendanceSheet}
                >
                  <Icon name="tasks" size={16} color="#6B2D5C" />
                  <Text style={styles.filePickerText}>
                    {formData.attendance_sheet 
                      ? formData.attendance_sheet.name 
                      : 'No file chosen'}
                  </Text>
                </TouchableOpacity>
                {formErrors.attendance_sheet && (
                  <Text style={styles.errorText}>{formErrors.attendance_sheet}</Text>
                )}
              </View>
              
              {/* Photos (3-6) */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Upload Photos (High Resolution, Min 3, Max 6) <Text style={styles.requiredStar}>*</Text>
                </Text>
                <Text style={styles.fileNote}>
                  Select 3–6 high-resolution images (JPG/PNG). {formData.photos.length} selected.
                </Text>
                
                <View style={styles.photoButtons}>
                  <TouchableOpacity 
                    style={styles.photoButton}
                    onPress={pickPhotos}
                  >
                    <Icon name="photo" size={14} color="#6B2D5C" />
                    <Text style={styles.photoButtonText}>Add Photo</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.photoButton}
                    onPress={takePhoto}
                  >
                    <Icon name="camera" size={14} color="#6B2D5C" />
                    <Text style={styles.photoButtonText}>Take Photo</Text>
                  </TouchableOpacity>
                </View>
                
                {formData.photos.length > 0 && (
                  <View style={styles.photosPreview}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {formData.photos.map((photo, index) => (
                        <View key={index} style={styles.photoPreviewItem}>
                          <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                          <TouchableOpacity 
                            style={styles.removePhotoButton}
                            onPress={() => removePhoto(index)}
                          >
                            <Icon name="times" size={10} color="#fff" />
                          </TouchableOpacity>
                          <Text style={styles.photoNumber}>{index + 1}</Text>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {formErrors.photos && (
                  <Text style={styles.errorText}>{formErrors.photos}</Text>
                )}
              </View>
              
              {/* Video */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Upload Short Video Clip (Optional)</Text>
                <Text style={styles.fileNote}>
                  Edited, 1–3 minutes, 100–150 MB, 720p/1080p recommended. Max 3 minutes, high quality, edited.
                </Text>
                <TouchableOpacity 
                  style={styles.filePickerButton}
                  onPress={pickVideo}
                >
                  <Icon name="video-camera" size={16} color="#6B2D5C" />
                  <Text style={styles.filePickerText}>
                    {formData.video 
                      ? formData.video.name 
                      : 'No file chosen'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Supporting Material */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Upload Supporting Material (Optional)</Text>
                <Text style={styles.fileNote}>
                  Poster, banner, presentation, etc.
                </Text>
                <TouchableOpacity 
                  style={styles.filePickerButton}
                  onPress={pickSupportingFiles}
                >
                  <Icon name="file" size={16} color="#6B2D5C" />
                  <Text style={styles.filePickerText}>
                    Choose Supporting Files
                  </Text>
                </TouchableOpacity>
                
                {formData.supporting_material.length > 0 && (
                  <View style={styles.filesList}>
                    <Text style={styles.filesCount}>
                      {formData.supporting_material.length} file(s) selected
                    </Text>
                    {formData.supporting_material.map((file, index) => (
                      <View key={index} style={styles.fileItemRow}>
                        <Icon name="file" size={12} color="#666" />
                        <Text style={styles.fileName} numberOfLines={1}>
                          {file.name}
                        </Text>
                        <TouchableOpacity onPress={() => removeSupportingFile(index)}>
                          <Icon name="times" size={12} color="#dc3545" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
              
              {/* Social Media Links */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Place Social Media Links (where you posted) <Text style={styles.requiredStar}>*</Text>
                </Text>
                {formErrors.social && (
                  <Text style={styles.errorText}>{formErrors.social}</Text>
                )}
                
                {/* LinkedIn */}
                <View style={styles.socialMediaRow}>
                  <TouchableOpacity 
                    style={styles.socialCheckbox}
                    onPress={() => toggleSocialMedia('linkedin')}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.social.linkedin.enabled && styles.checkboxChecked
                    ]}>
                      {formData.social.linkedin.enabled && (
                        <Icon name="check" size={10} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.socialLabel}>Linkedin</Text>
                  </TouchableOpacity>
                  
                  {formData.social.linkedin.enabled && (
                    <TextInput
                      style={[
                        styles.input,
                        styles.socialInput,
                        formErrors.social_linkedin && styles.inputError
                      ]}
                      placeholder="https://linkedin.com/..."
                      placeholderTextColor="#999"
                      value={formData.social.linkedin.url}
                      onChangeText={(text) => updateSocialUrl('linkedin', text)}
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  )}
                </View>
                {formErrors.social_linkedin && (
                  <Text style={styles.errorText}>{formErrors.social_linkedin}</Text>
                )}
                
                {/* Facebook */}
                <View style={styles.socialMediaRow}>
                  <TouchableOpacity 
                    style={styles.socialCheckbox}
                    onPress={() => toggleSocialMedia('facebook')}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.social.facebook.enabled && styles.checkboxChecked
                    ]}>
                      {formData.social.facebook.enabled && (
                        <Icon name="check" size={10} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.socialLabel}>Facebook</Text>
                  </TouchableOpacity>
                  
                  {formData.social.facebook.enabled && (
                    <TextInput
                      style={[
                        styles.input,
                        styles.socialInput,
                        formErrors.social_facebook && styles.inputError
                      ]}
                      placeholder="https://facebook.com/..."
                      placeholderTextColor="#999"
                      value={formData.social.facebook.url}
                      onChangeText={(text) => updateSocialUrl('facebook', text)}
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  )}
                </View>
                
                {/* Instagram */}
                <View style={styles.socialMediaRow}>
                  <TouchableOpacity 
                    style={styles.socialCheckbox}
                    onPress={() => toggleSocialMedia('instagram')}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.social.instagram.enabled && styles.checkboxChecked
                    ]}>
                      {formData.social.instagram.enabled && (
                        <Icon name="check" size={10} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.socialLabel}>Instagram</Text>
                  </TouchableOpacity>
                  
                  {formData.social.instagram.enabled && (
                    <TextInput
                      style={[
                        styles.input,
                        styles.socialInput,
                        formErrors.social_instagram && styles.inputError
                      ]}
                      placeholder="https://instagram.com/..."
                      placeholderTextColor="#999"
                      value={formData.social.instagram.url}
                      onChangeText={(text) => updateSocialUrl('instagram', text)}
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  )}
                </View>
                
                {/* Twitter */}
                <View style={styles.socialMediaRow}>
                  <TouchableOpacity 
                    style={styles.socialCheckbox}
                    onPress={() => toggleSocialMedia('twitter')}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.social.twitter.enabled && styles.checkboxChecked
                    ]}>
                      {formData.social.twitter.enabled && (
                        <Icon name="check" size={10} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.socialLabel}>Twitter</Text>
                  </TouchableOpacity>
                  
                  {formData.social.twitter.enabled && (
                    <TextInput
                      style={[
                        styles.input,
                        styles.socialInput,
                        formErrors.social_twitter && styles.inputError
                      ]}
                      placeholder="https://twitter.com/..."
                      placeholderTextColor="#999"
                      value={formData.social.twitter.url}
                      onChangeText={(text) => updateSocialUrl('twitter', text)}
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  )}
                </View>
                
                {/* WhatsApp */}
                <View style={styles.socialMediaRow}>
                  <TouchableOpacity 
                    style={styles.socialCheckbox}
                    onPress={() => toggleSocialMedia('whatsapp')}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.social.whatsapp.enabled && styles.checkboxChecked
                    ]}>
                      {formData.social.whatsapp.enabled && (
                        <Icon name="check" size={10} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.socialLabel}>Whatsapp</Text>
                  </TouchableOpacity>
                  
                  {formData.social.whatsapp.enabled && (
                    <TextInput
                      style={[
                        styles.input,
                        styles.socialInput,
                        formErrors.social_whatsapp && styles.inputError
                      ]}
                      placeholder="https://whatsapp.com/..."
                      placeholderTextColor="#999"
                      value={formData.social.whatsapp.url}
                      onChangeText={(text) => updateSocialUrl('whatsapp', text)}
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  )}
                </View>
                
                {/* Others */}
                <View style={styles.socialMediaRow}>
                  <TouchableOpacity 
                    style={styles.socialCheckbox}
                    onPress={() => toggleSocialMedia('others')}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.social.others.enabled && styles.checkboxChecked
                    ]}>
                      {formData.social.others.enabled && (
                        <Icon name="check" size={10} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.socialLabel}>Others</Text>
                  </TouchableOpacity>
                  
                  {formData.social.others.enabled && (
                    <TextInput
                      style={[
                        styles.input,
                        styles.socialInput,
                        formErrors.social_others && styles.inputError
                      ]}
                      placeholder="https://..."
                      placeholderTextColor="#999"
                      value={formData.social.others.url}
                      onChangeText={(text) => updateSocialUrl('others', text)}
                      keyboardType="url"
                      autoCapitalize="none"
                    />
                  )}
                </View>
              </View>
              
              {/* Submit Button */}
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled
                ]}
                onPress={submitActivityForm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="paper-plane" size={14} color="#fff" />
                    <Text style={styles.submitButtonText}>
                      Submit Activity
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowFillModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // Loading Screen
  if (loading && activities.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#6B2D5C" barStyle="light-content" />
        <LinearGradient
          colors={['#6B2D5C', '#3E2A5D']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading Activities...</Text>
          <Text style={styles.loadingSubtext}>
            Fetching your scheduled activities
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // Main Screen
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B2D5C" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6B2D5C', '#3E2A5D']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={18} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Activities & Monitoring</Text>
          <Text style={styles.headerSubtitle}>
            Fill and track your orientation activities
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="refresh" size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </LinearGradient>
      
      {/* Main Content */}
      <View style={styles.content}>
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6B2D5C']}
              tintColor="#6B2D5C"
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {renderActivityList()}
          
          {activities.length > 0 && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Icon name="tasks" size={16} color="#6B2D5C" />
                <Text style={styles.statNumber}>{activities.length}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              
              <View style={styles.statCard}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.statNumber}>
                  {activities.filter(a => a.is_filled).length}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              
              <View style={styles.statCard}>
                <Icon name="edit" size={16} color="#FFC107" />
                <Text style={styles.statNumber}>
                  {activities.filter(a => !a.is_filled).length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          )}
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>📝 How to Use</Text>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Tap on any activity</Text> to view details
              </Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Click "Fill Activity"</Text> to submit reports and evidence
              </Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Upload photos, video,</Text> attendance sheet and supporting files
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
      
      {/* Modals */}
      {renderDetailsModal()}
      {renderFillModal()}
    </View>
  );
};


const styles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Loading Screen
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#D2ECFF',
    textAlign: 'center',
    marginTop: 8,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#D2ECFF',
    marginTop: 2,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Main Content
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // Activity List
  listHeader: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B2D5C',
    marginBottom: 4,
  },
  listSubtitle: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },

  // Activity Card
  activityCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6B2D5C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  firstCard: {
    marginTop: 15,
    borderLeftColor: '#4CAF50',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityNumberText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B2D5C',
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
    lineHeight: 14,
  },
  activityDate: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  activityStatus: {
    marginLeft: 8,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  completedText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '700',
  },
  fillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFC107',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  fillButtonText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '700',
  },
  cardDetails: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 9,
    color: '#555',
    flex: 1,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 8,
    color: '#6B2D5C',
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
  },
  emptyStateTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B2D5C',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 9,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 14,
  },
  goToCalendarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B2D5C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  goToCalendarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 9,
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 9,
    color: '#666',
    marginTop: 3,
    fontWeight: '600',
  },

  // Instructions
  instructionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 20,
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B2D5C',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  stepIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#6B2D5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 8,
  },
  stepText: {
    flex: 1,
    fontSize: 10,
    color: '#555',
    lineHeight: 14,
  },
  stepBold: {
    fontWeight: '700',
    color: '#333',
  },

  // Details Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 12,
    marginTop: StatusBar.currentHeight + 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  detailSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B2D5C',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    width: 80,
  },
  detailValue: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modeBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '700',
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  attendanceItem: {
    alignItems: 'center',
  },
  attendanceLabel: {
    fontSize: 9,
    color: '#666',
    marginTop: 4,
  },
  attendanceValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 10,
    color: '#555',
    lineHeight: 16,
  },
  photoItem: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  photoText: {
    fontSize: 9,
    color: '#666',
    marginTop: 4,
  },
  photoTextt: {
    fontSize: 6,
    color: '#6e2727ff',
    marginTop: 4,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  videoText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 6,
    gap: 8,
  },
  fileText: {
    fontSize: 10,
    color: '#333',
    flex: 1,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 6,
    gap: 8,
  },
  linkText: {
    fontSize: 10,
    color: '#2196F3',
    flex: 1,
  },
  attendanceSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  attendanceSheetText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 40,
    borderRadius: 8,
    gap: 6,
  },
  fillButtonLarge: {
    backgroundColor: '#FFC107',
  },
  closeButtonLarge: {
    backgroundColor: '#6B2D5C',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 9,
  
  },

  // Fill Activity Modal
  fillModalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fillForm: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B2D5C',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requiredStar: {
    color: '#dc3545',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 11,
    color: '#333',
  },
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
  },
  readOnlyText: {
    fontSize: 11,
    color: '#666',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 9,
    color: '#dc3545',
    marginTop: 4,
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#6B2D5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B2D5C',
  },
  radioLabel: {
    fontSize: 11,
    color: '#333',
  },
  typeDropdown: {
    maxHeight: 150,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginTop: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  typeOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  typeOptionText: {
    fontSize: 11,
    color: '#333',
  },
  typeOptionTextSelected: {
    color: '#1976D2',
    fontWeight: '600',
  },
  otherInputContainer: {
    marginTop: 10,
  },
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  audienceOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  audienceOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#1976D2',
  },
  audienceText: {
    fontSize: 10,
    color: '#666',
  },
  audienceTextSelected: {
    color: '#1976D2',
    fontWeight: '600',
  },
  participantsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  participantInput: {
    flex: 1,
  },
  participantLabel: {
    fontSize: 11,
    color: '#333',
    marginBottom: 4,
  },
  smallInput: {
    paddingVertical: 8,
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 11,
    color: '#333',
    height: 100,
    textAlignVertical: 'top',
  },
  wordCountContainer: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  wordCountText: {
    fontSize: 9,
    color: '#666',
  },
  wordCountError: {
    color: '#dc3545',
    fontWeight: '600',
  },
  fileNote: {
    fontSize: 9,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  filePickerText: {
    fontSize: 11,
    color: '#333',
    flex: 1,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#6B2D5C',
    backgroundColor: '#fff',
    gap: 6,
  },
  photoButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B2D5C',
  },
  photosPreview: {
    marginTop: 12,
  },
  photoPreviewItem: {
    position: 'relative',
    marginRight: 8,
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNumber: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: '#fff',
    fontSize: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  filesList: {
    marginTop: 12,
  },
  filesCount: {
    fontSize: 10,
    color: '#666',
    marginBottom: 6,
  },
  fileItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 6,
    gap: 6,
  },
  fileName: {
    fontSize: 10,
    color: '#333',
    flex: 1,
  },
  socialMediaRow: {
    marginBottom: 10,
  },
  socialCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: '#6B2D5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6B2D5C',
  },
  socialLabel: {
    fontSize: 11,
    color: '#333',
    fontWeight: '500',
  },
  socialInput: {
    marginTop: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B2D5C',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
   
  },
  cancelButtonText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
});

export default ActivitiesMonitoringScreen;




