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
  Animated,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import DocumentPicker from 'react-native-document-picker';
import ImagePicker from 'react-native-image-picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Video from 'react-native-video';

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
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Form state for filling activity
  const [formData, setFormData] = useState({
    description: '',
    male_participants: '',
    female_participants: '',
    photos: [],
    video: null,
    supporting_material: [],
    social_links: [''],
    attendance_sheet: null,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const API_BASE_URL = 'https://b00886286dc4.ngrok-free.app';

  useEffect(() => {
    console.log('[INIT] 🚀 ActivitiesMonitoringScreen mounted');
    console.log('[INIT] 🔑 CNIC:', userCnic);
    console.log('[INIT] 📋 Registration ID:', registrationId);
    
    if (userCnic && registrationId) {
      fetchActivities();
    } else {
      Alert.alert('Error', 'Required information not available');
      navigation.goBack();
    }
  }, [userCnic, registrationId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      
      const API_URL = `${API_BASE_URL}/api/activities-monitoring/activities/${registrationId}`;
      
      console.log('[API] 📦 Fetching activities...');
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('[API] ✅ Activities data received:', data.success);
      
      if (data.success) {
        setActivities(data.data || []);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
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

  const fetchActivityDetails = async (activityId) => {
    try {
      setLoading(true);
      
      const API_URL = `${API_BASE_URL}/api/activities-monitoring/activity/${registrationId}/${activityId}/details`;
      
      console.log('[API] 📦 Fetching activity details...');
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      console.log('[API] ✅ Activity details received:', data.success);
      
      if (data.success) {
        setActivityDetails(data.data);
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

  const handleFillActivity = (activityId) => {
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      setSelectedActivity(activity);
      resetForm();
      setShowFillModal(true);
    }
  };

  const handleViewDetails = (activityId) => {
    fetchActivityDetails(activityId);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const resetForm = () => {
    setFormData({
      description: '',
      male_participants: '',
      female_participants: '',
      photos: [],
      video: null,
      supporting_material: [],
      social_links: [''],
      attendance_sheet: null,
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.male_participants || isNaN(formData.male_participants) || parseInt(formData.male_participants) < 0) {
      errors.male_participants = 'Enter valid number of male participants';
    }
    
    if (!formData.female_participants || isNaN(formData.female_participants) || parseInt(formData.female_participants) < 0) {
      errors.female_participants = 'Enter valid number of female participants';
    }
    
    // Validate at least one photo
    if (formData.photos.length === 0) {
      errors.photos = 'At least one photo is required';
    }
    
    // Validate attendance sheet
    if (!formData.attendance_sheet) {
      errors.attendance_sheet = 'Attendance sheet is required';
    }
    
    return errors;
  };

  const pickPhotos = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 10, // Allow multiple photos
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
      }
    } catch (error) {
      console.error('Photo picker error:', error);
      Alert.alert('Error', 'Failed to pick photos');
    }
  };

  const takePhoto = async () => {
    try {
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
        
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, newPhoto]
        }));
        
        if (formErrors.photos) {
          setFormErrors(prev => ({ ...prev, photos: '' }));
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickVideo = async () => {
    try {
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
      }
    } catch (error) {
      console.error('Video picker error:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const pickAttendanceSheet = async () => {
    try {
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
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Document picker error:', error);
        Alert.alert('Error', 'Failed to pick document');
      }
    }
  };

  const pickSupportingFiles = async () => {
    try {
      const result = await DocumentPicker.pickMultiple({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.images,
          DocumentPicker.types.docx,
          DocumentPicker.types.ppt,
          DocumentPicker.types.xlsx,
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
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('Document picker error:', error);
        Alert.alert('Error', 'Failed to pick files');
      }
    }
  };

  const addSocialLinkField = () => {
    setFormData(prev => ({
      ...prev,
      social_links: [...prev.social_links, '']
    }));
  };

  const removeSocialLinkField = (index) => {
    setFormData(prev => ({
      ...prev,
      social_links: prev.social_links.filter((_, i) => i !== index)
    }));
  };

  const updateSocialLink = (index, value) => {
    const newLinks = [...formData.social_links];
    newLinks[index] = value;
    setFormData(prev => ({
      ...prev,
      social_links: newLinks
    }));
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const removeSupportingFile = (index) => {
    setFormData(prev => ({
      ...prev,
      supporting_material: prev.supporting_material.filter((_, i) => i !== index)
    }));
  };

  const submitActivityForm = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Alert.alert('Validation Error', 'Please fill all required fields correctly');
      return;
    }

    try {
      setIsSubmitting(true);
      setUploading(true);
      
      const formDataToSend = new FormData();
      
      // Add basic data
      formDataToSend.append('registration_id', registrationId.toString());
      formDataToSend.append('activity_id', selectedActivity.id.toString());
      formDataToSend.append('description', formData.description);
      formDataToSend.append('male_participants', formData.male_participants);
      formDataToSend.append('female_participants', formData.female_participants);
      
      // Add photos
      formData.photos.forEach((photo, index) => {
        formDataToSend.append(`photos[${index}]`, {
          uri: photo.uri,
          type: photo.type,
          name: photo.name,
        });
      });
      
      // Add video if exists
      if (formData.video) {
        formDataToSend.append('video', {
          uri: formData.video.uri,
          type: formData.video.type,
          name: formData.video.name,
        });
      }
      
      // Add supporting files
      formData.supporting_material.forEach((file, index) => {
        formDataToSend.append(`supporting_material[${index}]`, {
          uri: file.uri,
          type: file.type,
          name: file.name,
        });
      });
      
      // Add social links
      formData.social_links.forEach((link, index) => {
        if (link.trim()) {
          formDataToSend.append(`social_links[${index}]`, link.trim());
        }
      });
      
      // Add attendance sheet
      if (formData.attendance_sheet) {
        formDataToSend.append('attendance_sheet', {
          uri: formData.attendance_sheet.uri,
          type: formData.attendance_sheet.type,
          name: formData.attendance_sheet.name,
        });
      }
      
      const API_URL = `${API_BASE_URL}/api/activities-monitoring/submit-activity`;
      
      console.log('[API] 📦 Submitting activity form...');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formDataToSend,
      });

      const data = await response.json();
      console.log('[API] ✅ Submit response:', data.success);
      
      if (data.success) {
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
        Alert.alert('Error', data.message || 'Failed to submit activity');
      }
    } catch (error) {
      console.error('[ERROR] 💥 Submit failed:', error);
      Alert.alert('Error', 'Failed to submit activity. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const renderActivityItem = ({ item, index }) => {
    const isFilled = item.is_filled || false;
    const activityDate = moment(item.activity_date).format('MMM D, YYYY');
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

  const renderDetailsModal = () => {
    if (!activityDetails) return null;
    
    const activity = activityDetails;
    const isFilled = activity.is_filled || false;
    
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
                  Activity Details
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowDetailsModal(false)}
              >
                <Icon name="times" size={18} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <ScrollView 
              style={styles.modalBody} 
              showsVerticalScrollIndicator={false}
            >
              {/* Basic Info */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Activity Information</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Title:</Text>
                  <Text style={styles.detailValue}>{activity.activity_title}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date:</Text>
                  <Text style={styles.detailValue}>
                    {moment(activity.activity_date).format('dddd, MMMM D, YYYY')}
                  </Text>
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
                
                {activity.venue && (
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
              
              {/* Filled Details (if activity is filled) */}
              {isFilled && activity.details && (
                <>
                  {/* Attendance */}
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Attendance</Text>
                    
                    <View style={styles.attendanceRow}>
                      <View style={styles.attendanceItem}>
                        <Icon name="male" size={16} color="#2196F3" />
                        <Text style={styles.attendanceLabel}>Male</Text>
                        <Text style={styles.attendanceValue}>
                          {activity.details.male || 0}
                        </Text>
                      </View>
                      
                      <View style={styles.attendanceItem}>
                        <Icon name="female" size={16} color="#E91E63" />
                        <Text style={styles.attendanceLabel}>Female</Text>
                        <Text style={styles.attendanceValue}>
                          {activity.details.female || 0}
                        </Text>
                      </View>
                      
                      <View style={styles.attendanceItem}>
                        <Icon name="users" size={16} color="#4CAF50" />
                        <Text style={styles.attendanceLabel}>Total</Text>
                        <Text style={styles.attendanceValue}>
                          {(parseInt(activity.details.male) || 0) + (parseInt(activity.details.female) || 0)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Description */}
                  {activity.details.description && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Description</Text>
                      <Text style={styles.descriptionText}>
                        {activity.details.description}
                      </Text>
                    </View>
                  )}
                  
                  {/* Photos */}
                  {activity.details.photos && activity.details.photos.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Photos ({activity.details.photos.length})</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {activity.details.photos.map((photo, index) => (
                          <TouchableOpacity 
                            key={index}
                            style={styles.photoItem}
                            onPress={() => Linking.openURL(photo)}
                          >
                            <Icon name="image" size={20} color="#6B2D5C" />
                            <Text style={styles.photoText}>Photo {index + 1}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  
                  {/* Video */}
                  {activity.details.video && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Video</Text>
                      <TouchableOpacity 
                        style={styles.videoItem}
                        onPress={() => Linking.openURL(activity.details.video)}
                      >
                        <Icon name="play-circle" size={20} color="#FF5722" />
                        <Text style={styles.videoText}>View Video</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Supporting Files */}
                  {activity.details.supporting_material && activity.details.supporting_material.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>
                        Supporting Files ({activity.details.supporting_material.length})
                      </Text>
                      {activity.details.supporting_material.map((file, index) => (
                        <TouchableOpacity 
                          key={index}
                          style={styles.fileItem}
                          onPress={() => Linking.openURL(file)}
                        >
                          <Icon name="file" size={16} color="#9C27B0" />
                          <Text style={styles.fileText}>
                            File {index + 1}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  
                  {/* Social Media Links */}
                  {activity.details.social_links && activity.details.social_links.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Social Media Links</Text>
                      {activity.details.social_links.map((link, index) => (
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
                  
                  {/* Attendance Sheet */}
                  {activity.details.attendance_sheet && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Attendance Sheet</Text>
                      <TouchableOpacity 
                        style={styles.attendanceSheetItem}
                        onPress={() => Linking.openURL(activity.details.attendance_sheet)}
                      >
                        <Icon name="file-pdf" size={18} color="#F44336" />
                        <Text style={styles.attendanceSheetText}>View Attendance Sheet</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
              
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                {!isFilled && (
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

  const renderFillModal = () => {
    if (!selectedActivity) return null;
    
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
              {/* Activity Info Banner */}
              <View style={styles.activityInfoBanner}>
                <Text style={styles.bannerTitle}>
                  {selectedActivity.activity_title}
                </Text>
                <Text style={styles.bannerDate}>
                  {moment(selectedActivity.activity_date).format('ddd, MMM D, YYYY')}
                </Text>
                <Text style={styles.bannerMode}>
                  {selectedActivity.mode} • {selectedActivity.university_name}
                </Text>
              </View>
              
              {/* Required Fields Section */}
              <Text style={styles.formSectionTitle}>Required Information</Text>
              
              {/* Description */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Activity Description <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.textArea,
                    formErrors.description && styles.inputError
                  ]}
                  placeholder="Describe the activity, what was done, outcomes, etc."
                  placeholderTextColor="#999"
                  value={formData.description}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, description: text }));
                    if (formErrors.description) setFormErrors(prev => ({ ...prev, description: '' }));
                  }}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {formErrors.description && (
                  <Text style={styles.errorText}>{formErrors.description}</Text>
                )}
              </View>
              
              {/* Attendance */}
              <View style={styles.formRow}>
                <View style={[styles.formGroup, styles.halfInput]}>
                  <Text style={styles.formLabel}>
                    Male Participants <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      formErrors.male_participants && styles.inputError
                    ]}
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={formData.male_participants}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, male_participants: text.replace(/[^0-9]/g, '') }));
                      if (formErrors.male_participants) setFormErrors(prev => ({ ...prev, male_participants: '' }));
                    }}
                    keyboardType="numeric"
                  />
                  {formErrors.male_participants && (
                    <Text style={styles.errorText}>{formErrors.male_participants}</Text>
                  )}
                </View>
                
                <View style={[styles.formGroup, styles.halfInput]}>
                  <Text style={styles.formLabel}>
                    Female Participants <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      formErrors.female_participants && styles.inputError
                    ]}
                    placeholder="0"
                    placeholderTextColor="#999"
                    value={formData.female_participants}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, female_participants: text.replace(/[^0-9]/g, '') }));
                      if (formErrors.female_participants) setFormErrors(prev => ({ ...prev, female_participants: '' }));
                    }}
                    keyboardType="numeric"
                  />
                  {formErrors.female_participants && (
                    <Text style={styles.errorText}>{formErrors.female_participants}</Text>
                  )}
                </View>
              </View>
              
              {/* Photos */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Activity Photos <Text style={styles.requiredStar}>*</Text>
                  <Text style={styles.optionalText}> (At least one)</Text>
                </Text>
                {formErrors.photos && (
                  <Text style={styles.errorText}>{formErrors.photos}</Text>
                )}
                
                <View style={styles.photoButtons}>
                  <TouchableOpacity 
                    style={styles.photoButton}
                    onPress={pickPhotos}
                  >
                    <Icon name="photo" size={14} color="#6B2D5C" />
                    <Text style={styles.photoButtonText}>Choose Photos</Text>
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
                    <Text style={styles.photosCount}>
                      {formData.photos.length} photo(s) selected
                    </Text>
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
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
              
              {/* Attendance Sheet */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Attendance Sheet <Text style={styles.requiredStar}>*</Text>
                  <Text style={styles.optionalText}> (PDF or Image)</Text>
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.filePickerButton,
                    formErrors.attendance_sheet && styles.inputError
                  ]}
                  onPress={pickAttendanceSheet}
                >
                  <Icon name="file-pdf" size={16} color="#6B2D5C" />
                  <Text style={styles.filePickerText}>
                    {formData.attendance_sheet 
                      ? formData.attendance_sheet.name 
                      : 'Choose Attendance Sheet'}
                  </Text>
                </TouchableOpacity>
                {formErrors.attendance_sheet && (
                  <Text style={styles.errorText}>{formErrors.attendance_sheet}</Text>
                )}
              </View>
              
              {/* Optional Fields Section */}
              <Text style={styles.formSectionTitle}>Optional Information</Text>
              
              {/* Video */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Activity Video</Text>
                <TouchableOpacity 
                  style={styles.filePickerButton}
                  onPress={pickVideo}
                >
                  <Icon name="video-camera" size={16} color="#6B2D5C" />
                  <Text style={styles.filePickerText}>
                    {formData.video 
                      ? formData.video.name 
                      : 'Choose Video File'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {/* Supporting Files */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Supporting Files</Text>
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
                <Text style={styles.formLabel}>Social Media Links</Text>
                {formData.social_links.map((link, index) => (
                  <View key={index} style={styles.linkInputRow}>
                    <TextInput
                      style={[styles.input, styles.linkInput]}
                      placeholder="https://facebook.com/post-url"
                      placeholderTextColor="#999"
                      value={link}
                      onChangeText={(text) => updateSocialLink(index, text)}
                    />
                    {formData.social_links.length > 1 && (
                      <TouchableOpacity 
                        style={styles.removeLinkButton}
                        onPress={() => removeSocialLinkField(index)}
                      >
                        <Icon name="times" size={12} color="#dc3545" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                
                <TouchableOpacity 
                  style={styles.addLinkButton}
                  onPress={addSocialLinkField}
                >
                  <Icon name="plus" size={12} color="#6B2D5C" />
                  <Text style={styles.addLinkText}>Add Another Link</Text>
                </TouchableOpacity>
              </View>
              
              {/* Upload Progress */}
              {uploading && (
                <View style={styles.uploadProgressContainer}>
                  <Text style={styles.uploadProgressText}>
                    Uploading... {uploadProgress}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${uploadProgress}%` }
                      ]} 
                    />
                  </View>
                </View>
              )}
              
              {/* Submit Button */}
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  (isSubmitting || uploading) && styles.submitButtonDisabled
                ]}
                onPress={submitActivityForm}
                disabled={isSubmitting || uploading}
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
          <Animated.View style={{ opacity: fadeAnim }}>
            {renderActivityList()}
            
            {/* Stats */}
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
            
            {/* Instructions */}
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
          </Animated.View>
        </ScrollView>
      </View>
      
      {/* Modals */}
      {renderDetailsModal()}
      {renderFillModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
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
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  listHeader: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#6B2D5C',
  },
  listSubtitle: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
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
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 15,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
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
  instructionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 20,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 15,
    maxHeight: height * 0.8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  fillModalContent: {
    flex: 1,
    backgroundColor: '#fff',
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
    maxHeight: height * 0.6,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B2D5C',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#777',
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
    paddingVertical: 3,
    borderRadius: 4,
  },
  modeBadgeText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: '600',
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  attendanceItem: {
    alignItems: 'center',
    flex: 1,
  },
  attendanceLabel: {
    fontSize: 9,
    color: '#666',
    marginTop: 4,
  },
  attendanceValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#333',
    marginTop: 2,
  },
  descriptionText: {
    fontSize: 10,
    color: '#555',
    lineHeight: 16,
    textAlign: 'justify',
  },
  photoItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 8,
    padding: 8,
  },
  photoText: {
    fontSize: 8,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  videoText: {
    fontSize: 10,
    color: '#FF5722',
    fontWeight: '600',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 6,
    gap: 6,
  },
  fileText: {
    fontSize: 9,
    color: '#333',
    flex: 1,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 6,
    gap: 6,
  },
  linkText: {
    fontSize: 9,
    color: '#1976D2',
    flex: 1,
  },
  attendanceSheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  attendanceSheetText: {
    fontSize: 10,
    color: '#D32F2F',
    fontWeight: '600',
  },
  actionButtons: {
    gap: 8,
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
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
    fontSize: 10,
  },
  fillForm: {
    padding: 16,
  },
  activityInfoBanner: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1976D2',
    marginBottom: 4,
  },
  bannerDate: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  bannerMode: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
  },
  formSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B2D5C',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: '#f0f0f0',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#dc3545',
  },
  optionalText: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
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
  textArea: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 11,
    color: '#333',
    height: 80,
    textAlignVertical: 'top',
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
    fontSize: 9,
    fontWeight: '600',
    color: '#6B2D5C',
  },
  photosPreview: {
    marginTop: 12,
  },
  photosCount: {
    fontSize: 9,
    color: '#666',
    marginBottom: 8,
  },
  photoPreviewItem: {
    position: 'relative',
    marginRight: 8,
  },
  photoPreview: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 10,
    color: '#333',
    flex: 1,
  },
  filesList: {
    marginTop: 12,
  },
  filesCount: {
    fontSize: 9,
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
    fontSize: 9,
    color: '#333',
    flex: 1,
  },
  linkInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  linkInput: {
    flex: 1,
  },
  removeLinkButton: {
    padding: 6,
  },
  addLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#6B2D5C',
    backgroundColor: '#fff',
    gap: 4,
    marginTop: 8,
  },
  addLinkText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6B2D5C',
  },
  uploadProgressContainer: {
    marginVertical: 16,
  },
  uploadProgressText: {
    fontSize: 10,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
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
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 12,
  },
  cancelButtonText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },
});

export default ActivitiesMonitoringScreen;