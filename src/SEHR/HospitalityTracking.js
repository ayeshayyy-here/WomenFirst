import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Modal,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import syncStorage from 'react-native-sync-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://sehr-wdd.punjab.gov.pk';
const API_URL = `${API_BASE_URL}/api/check-registration-hospitality/`;

const HospitalityTracking = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  
  const [trackingSteps, setTrackingSteps] = useState([
    { 
      id: 1, 
      title: 'Submitted', 
      count: '260',
      status: 'completed', 
      date: null, 
      icon: 'account-check',
      description: 'Application submitted successfully'
    },
    { 
      id: 2, 
      title: 'Shortlisted', 
      count: '0',
      status: 'pending', 
      date: null, 
      icon: 'account-check',
      description: 'You\'ll be notified when shortlisted'
    },
    { 
      id: 3, 
      title: 'Assessments', 
      count: '0',
      status: 'pending', 
      date: null, 
      icon: 'clipboard-text',
      description: 'Assessment details will appear here'
    },
    { 
      id: 4, 
      title: 'Certification', 
      count: '0',
      status: 'pending', 
      date: null, 
      icon: 'certificate',
      description: 'Certificate will be available here'
    },
  ]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchRegistrationData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 0.25, // 25% for first step completed
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, []);

  const fetchRegistrationData = async () => {
    try {
      setLoading(true);
      
      // Check if data was passed from registration form
      if (route.params?.registrationData) {
        setRegistrationData(route.params.registrationData);
        updateTrackingData(route.params.registrationData);
        setLoading(false);
        return;
      }

      // Fetch from API using CNIC from syncStorage
      const userProfile = syncStorage.get('user_profile');
      if (userProfile) {
        let syncStorageData = null;
        try {
          syncStorageData = typeof userProfile === 'string' ? JSON.parse(userProfile) : userProfile;
        } catch (e) {
          console.log('Error parsing syncStorage data:', e);
        }

        if (syncStorageData?.cnic) {
          const cnic = syncStorageData.cnic.replace(/-/g, '');
          const response = await axios.get(`${API_URL}${cnic}`, {
            timeout: 10000,
          });
          
          if (response.data.success && response.data.data) {
            setRegistrationData(response.data.data);
            updateTrackingData(response.data.data);
          } else {
            Alert.alert('No Registration Found', 'You have not submitted any registration yet.');
            navigation.goBack();
          }
        } else {
          Alert.alert('CNIC Not Found', 'Please complete registration first.');
          navigation.goBack();
        }
      } else {
        Alert.alert('No Profile Found', 'Please complete registration first.');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching registration data:', error);
      Alert.alert('Error', 'Failed to fetch registration data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateTrackingData = (data) => {
    const updatedSteps = [...trackingSteps];
    updatedSteps[0] = {
      ...updatedSteps[0],
      count: '1',
      date: moment(data.created_at).format('DD MMM'),
      description: 'Your application has been submitted',
    };
    setTrackingSteps(updatedSteps);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRegistrationData();
    setRefreshing(false);
  };

  const formatCNIC = (cnic) => {
    if (!cnic) return '';
    const cleaned = cnic.replace(/\D/g, '');
    if (cleaned.length !== 13) return cnic;
    return `${cleaned.substring(0, 5)}-${cleaned.substring(5, 12)}-${cleaned.substring(12)}`;
  };

  const getDocumentUrl = (path) => {
    if (!path) return null;
    // Remove storage/ if present and clean path
    const cleanPath = path.replace(/^storage\//, '').replace(/\\/g, '/');
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  const openDocument = (path, title) => {
    const url = getDocumentUrl(path);
    if (url) {
      setSelectedDocument({ url, title });
      setModalVisible(true);
    } else {
      Alert.alert('Document Unavailable', 'Document URL is not available.');
    }
  };

  const viewDocumentInBrowser = (url) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not open document. Please try again.');
    });
  };

 const renderTrackingBar = () => {
  const totalSteps = trackingSteps.length;
  const completedSteps = trackingSteps.filter(step => step.status === 'completed').length;
  const progressWidth = (completedSteps / totalSteps) * 100;

  return (
    <Animatable.View 
      animation="fadeInUp" 
      duration={800}
      delay={200}
      style={styles.trackingContainer}
    >
      <LinearGradient
        colors={['rgba(56, 142, 60, 0.1)', 'rgba(76, 175, 80, 0.1)']}
        style={styles.trackingGradient}
      >
        <View style={styles.trackingHeader}>
          <Icon name="progress-check" size={22} color="#388E3C" />
          <Text style={styles.trackingTitle}>Application Status</Text>
          <View style={styles.trackingStatus}>
            <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.statusText}>Submitted</Text>
          </View>
        </View>

        {/* Progress Steps with Circles */}
        <View style={styles.progressStepsContainer}>
          {trackingSteps.map((step, index) => (
            <View key={step.id} style={styles.stepWrapper}>
              {/* Circle Step */}
              <TouchableOpacity
                style={styles.stepCircleTouchable}
                onPress={() => {
                  if (step.status === 'pending') {
                    Alert.alert(
                      step.title.replace('\n', ' '),
                      step.description || 'You will be notified when this step is updated.',
                      [{ text: 'OK' }]
                    );
                  }
                }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    step.status === 'completed'
                      ? ['#4CAF50', '#2E7D32']
                      : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']
                  }
                  style={[
                    styles.stepCircle,
                    step.status === 'completed' && styles.stepCircleCompleted,
                  ]}
                >
                  {step.status === 'completed' ? (
                    <Icon name="check" size={18} color="white" />
                  ) : (
                    <Text style={styles.stepNumber}>{step.id}</Text>
                  )}
                </LinearGradient>
                
                {/* Step Icon */}
                <View style={[
                  styles.stepIconCircle,
                  step.status === 'completed' && styles.stepIconCircleCompleted,
                ]}>
                  <Icon 
                    name={step.icon} 
                    size={16} 
                    color={step.status === 'completed' ? 'white' : '#388E3C'} 
                  />
                </View>
              </TouchableOpacity>

              {/* Step Label */}
              <View style={styles.stepLabelContainer}>
                <Text style={[
                  styles.stepLabel,
                  step.status === 'completed' && styles.stepLabelCompleted,
                ]}>
                  {step.title.split('\n')[0]}
                </Text>
                {step.title.includes('\n') && (
                  <Text style={[
                    styles.stepLabel,
                    step.status === 'completed' && styles.stepLabelCompleted,
                  ]}>
                    {step.title.split('\n')[1]}
                  </Text>
                )}
              </View>

              {/* Step Count */}
              <Text style={[
                styles.stepCount,
                step.status === 'completed' && styles.stepCountCompleted,
              ]}>
                {step.count}
              </Text>

              {/* Status Badge */}
              <View style={styles.stepStatusBadge}>
                <View style={[
                  styles.statusBadge,
                  step.status === 'completed' 
                    ? styles.statusBadgeCompleted 
                    : styles.statusBadgePending,
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {step.status === 'completed' ? '✓' : '○'}
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text style={styles.stepDescription}>
                {step.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Connecting Line */}
        <View style={styles.connectingLineContainer}>
          <View style={styles.connectingLineBackground}>
            <Animated.View 
              style={[
                styles.connectingLineFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', `${progressWidth}%`],
                  }),
                },
              ]}
            />
          </View>
        </View>

        {/* Progress Info */}
        <View style={styles.progressInfoContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressInfoText}>
              {completedSteps} of {totalSteps} steps completed
            </Text>
            <Text style={styles.progressInfoPercent}>
              {Math.round(progressWidth)}%
            </Text>
          </View>
          <View style={styles.progressNote}>
            <Icon name="information-outline" size={14} color="#388E3C" />
            <Text style={styles.progressNoteText}>
              {completedSteps === totalSteps 
                ? 'All steps completed! Your application is finalized.'
                : 'Click on any step to see more details about your application status.'
              }
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Animatable.View>
  );
};

  const renderPersonalInformation = () => {
    if (!registrationData) return null;

    // Add course-specific fields from hospitality data
    const courseFields = [
      { label: 'Preferred Course', value: registrationData.preferred_course, icon: 'book-open-variant' },
      { label: 'Training Place', value: registrationData.preferred_training_place, icon: 'map-marker-radius' },
      { label: 'Session Timing', value: registrationData.preferred_session_timing, icon: 'calendar-clock' },
      { label: 'Class Timing', value: registrationData.preferred_classes_timing, icon: 'clock' },
    ];

    const personalFields = [
      { label: 'Full Name', value: registrationData.full_name, icon: 'account' },
      { label: "Father's Name", value: registrationData.father_name, icon: 'account-group' },
      { label: 'Date of Birth', value: moment(registrationData.date_of_birth).format('DD MMM YYYY'), icon: 'calendar' },
      { label: 'Age', value: registrationData.age, icon: 'numeric' },
      { label: 'Marital Status', value: registrationData.marital_status, icon: 'heart' },
      { label: 'CNIC Number', value: formatCNIC(registrationData.cnic_no), icon: 'card-account-details' },
      { label: 'Email', value: registrationData.email || 'Not provided', icon: 'email' },
      { label: 'Present Address', value: registrationData.present_address, icon: 'map-marker', multiline: true },
      { label: 'Phone Number', value: registrationData.cell_no, icon: 'phone' },
      { label: 'Emergency Contact', value: registrationData.emergency_cell_no, icon: 'phone-alert' },
    ];

    const academicFields = [
      { label: 'Employment Status', value: registrationData.employment_status, icon: 'briefcase' },
      { label: 'Educational Level', value: registrationData.educational_level, icon: 'school' },
      { label: 'Other Education', value: registrationData.other_education_name || 'N/A', icon: 'pencil' },
      { label: 'Has Disability', value: registrationData.has_disability ? 'Yes' : 'No', icon: 'wheelchair-accessibility' },
      { label: 'Disability Type', value: registrationData.disability_type || 'N/A', icon: 'account-wrench' },
      { label: 'Special Condition', value: registrationData.special_condition || 'None', icon: 'alert-circle', multiline: true },
    ];

    return (
      <Animatable.View 
        animation="fadeInUp" 
        duration={800}
        delay={400}
        style={styles.infoContainer}
      >
        <LinearGradient
          colors={['rgba(56, 142, 60, 0.15)', 'rgba(76, 175, 80, 0.15)']}
          style={styles.infoGradient}
        >
          <View style={styles.infoHeader}>
            <Icon name="briefcase-account" size={24} color="#388E3C" />
            <Text style={styles.infoTitle}>Registration Details</Text>
            <Text style={styles.infoSubtitle}>All submitted information</Text>
          </View>

          {/* Course Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="book-education" size={18} color="#388E3C" />
              <Text style={styles.sectionTitle}>Course Information</Text>
            </View>
            <View style={styles.fieldsGrid}>
              {courseFields.map((field, index) => (
                <Animatable.View 
                  key={index}
                  animation="fadeInLeft"
                  duration={500}
                  delay={index * 50}
                  style={styles.fieldItem}
                >
                  <View style={styles.fieldHeader}>
                    <Icon name={field.icon} size={14} color="#388E3C" />
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                  </View>
                  <Text 
                    style={[
                      styles.fieldValue,
                      field.multiline && styles.fieldValueMultiline,
                    ]}
                    numberOfLines={field.multiline ? 2 : 1}
                  >
                    {field.value}
                  </Text>
                </Animatable.View>
              ))}
            </View>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="account-circle" size={18} color="#2196F3" />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            <View style={styles.fieldsGrid}>
              {personalFields.map((field, index) => (
                <Animatable.View 
                  key={index}
                  animation="fadeInRight"
                  duration={500}
                  delay={index * 50}
                  style={styles.fieldItem}
                >
                  <View style={styles.fieldHeader}>
                    <Icon name={field.icon} size={14} color="#2196F3" />
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                  </View>
                  <Text 
                    style={[
                      styles.fieldValue,
                      field.multiline && styles.fieldValueMultiline,
                    ]}
                    numberOfLines={field.multiline ? 2 : 1}
                  >
                    {field.value}
                  </Text>
                </Animatable.View>
              ))}
            </View>
          </View>

          {/* Academic Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="school" size={18} color="#FF9800" />
              <Text style={styles.sectionTitle}>Academic & Preferences</Text>
            </View>
            <View style={styles.fieldsGrid}>
              {academicFields.map((field, index) => (
                <Animatable.View 
                  key={index}
                  animation="fadeInLeft"
                  duration={500}
                  delay={index * 50}
                  style={styles.fieldItem}
                >
                  <View style={styles.fieldHeader}>
                    <Icon name={field.icon} size={14} color="#FF9800" />
                    <Text style={styles.fieldLabel}>{field.label}</Text>
                  </View>
                  <Text 
                    style={[
                      styles.fieldValue,
                      field.multiline && styles.fieldValueMultiline,
                    ]}
                    numberOfLines={field.multiline ? 2 : 1}
                  >
                    {field.value}
                  </Text>
                </Animatable.View>
              ))}
            </View>
          </View>

          {/* Documents Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="file-document" size={18} color="#9C27B0" />
              <Text style={styles.sectionTitle}>Submitted Documents</Text>
            </View>
            <View style={styles.documentsContainer}>
              {registrationData.cnic_front_path && (
                <TouchableOpacity 
                  style={styles.documentCard}
                  onPress={() => openDocument(registrationData.cnic_front_path, 'CNIC Front')}
                >
                  <LinearGradient
                    colors={['rgba(56, 142, 60, 0.2)', 'rgba(76, 175, 80, 0.2)']}
                    style={styles.documentGradient}
                  >
                    <Icon name="card-bulleted" size={24} color="#388E3C" />
                    <Text style={styles.documentTitle}>CNIC Front</Text>
                    <View style={styles.documentStatus}>
                      <Icon name="check-circle" size={12} color="#4CAF50" />
                      <Text style={styles.documentStatusText}>Uploaded</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => openDocument(registrationData.cnic_front_path, 'CNIC Front')}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {registrationData.cnic_back_path && (
                <TouchableOpacity 
                  style={styles.documentCard}
                  onPress={() => openDocument(registrationData.cnic_back_path, 'CNIC Back')}
                >
                  <LinearGradient
                    colors={['rgba(33, 150, 243, 0.2)', 'rgba(13, 71, 161, 0.2)']}
                    style={styles.documentGradient}
                  >
                    <Icon name="card-bulleted-outline" size={24} color="#2196F3" />
                    <Text style={styles.documentTitle}>CNIC Back</Text>
                    <View style={styles.documentStatus}>
                      <Icon name="check-circle" size={12} color="#4CAF50" />
                      <Text style={styles.documentStatusText}>Uploaded</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => openDocument(registrationData.cnic_back_path, 'CNIC Back')}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {registrationData.domicile_path && (
                <TouchableOpacity 
                  style={styles.documentCard}
                  onPress={() => openDocument(registrationData.domicile_path, 'Domicile')}
                >
                  <LinearGradient
                    colors={['rgba(255, 152, 0, 0.2)', 'rgba(245, 124, 0, 0.2)']}
                    style={styles.documentGradient}
                  >
                    <Icon name="home-city" size={24} color="#FF9800" />
                    <Text style={styles.documentTitle}>Domicile</Text>
                    <View style={styles.documentStatus}>
                      <Icon name="check-circle" size={12} color="#4CAF50" />
                      <Text style={styles.documentStatusText}>Uploaded</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => openDocument(registrationData.domicile_path, 'Domicile')}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              {registrationData.disability_certificate_path && (
                <TouchableOpacity 
                  style={styles.documentCard}
                  onPress={() => openDocument(registrationData.disability_certificate_path, 'Disability Certificate')}
                >
                  <LinearGradient
                    colors={['rgba(156, 39, 176, 0.2)', 'rgba(123, 31, 162, 0.2)']}
                    style={styles.documentGradient}
                  >
                    <Icon name="file-certificate" size={24} color="#9C27B0" />
                    <Text style={styles.documentTitle}>Disability Certificate</Text>
                    <View style={styles.documentStatus}>
                      <Icon name="check-circle" size={12} color="#4CAF50" />
                      <Text style={styles.documentStatusText}>Uploaded</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewButton}
                      onPress={() => openDocument(registrationData.disability_certificate_path, 'Disability Certificate')}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Registration Metadata */}
          <View style={styles.metadataContainer}>
            <View style={styles.metadataItem}>
              <Icon name="calendar-plus" size={14} color="#388E3C" />
              <Text style={styles.metadataLabel}>Registered On</Text>
              <Text style={styles.metadataValue}>
                {moment(registrationData.created_at).format('DD MMM YYYY, hh:mm A')}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Icon name="update" size={14} color="#2196F3" />
              <Text style={styles.metadataLabel}>Last Updated</Text>
              <Text style={styles.metadataValue}>
                {moment(registrationData.updated_at).format('DD MMM YYYY, hh:mm A')}
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Icon name="identifier" size={14} color="#FF9800" />
              <Text style={styles.metadataLabel}>Registration ID</Text>
              <Text style={styles.metadataValue}>#{registrationData.id}</Text>
            </View>
          </View>
        </LinearGradient>
      </Animatable.View>
    );
  };

  const renderDocumentModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <LinearGradient
          colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.8)']}
          style={styles.modalBackground}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedDocument?.title}</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            {imageLoading ? (
              <ActivityIndicator size="large" color="#388E3C" />
            ) : (
              <Image
                source={{ uri: selectedDocument?.url }}
                style={styles.documentImage}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                  setImageLoading(false);
                  Alert.alert('Error', 'Could not load document image');
                }}
              />
            )}
          </View>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => viewDocumentInBrowser(selectedDocument?.url)}
            >
              <LinearGradient
                colors={['#388E3C', '#2E7D32']}
                style={styles.modalButtonGradient}
              >
                <Icon name="open-in-new" size={18} color="white" />
                <Text style={styles.modalButtonText}>Open in Browser</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, styles.closeModalButton]}
              onPress={() => setModalVisible(false)}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                style={styles.modalButtonGradient}
              >
                <Icon name="close-circle" size={18} color="white" />
                <Text style={styles.modalButtonText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#0d1f0e', '#388E3C', '#2c5b2f']}
        style={styles.loadingContainer}
      >
        <StatusBar barStyle="light-content" backgroundColor="#388E3C" />
        <Animatable.View 
          animation="pulse" 
          iterationCount="infinite" 
          style={styles.loadingContent}
        >
          <Icon name="briefcase-clock" size={60} color="white" />
          <Text style={styles.loadingTitle}>Loading Your Status</Text>
          <Text style={styles.loadingSubtitle}>Fetching your application details...</Text>
          <ActivityIndicator size="large" color="white" style={styles.loadingSpinner} />
        </Animatable.View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0a120a', '#2c3e2c', '#050905']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#388E3C" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
          <LinearGradient
            colors={['rgba(56, 142, 60, 0.95)', 'rgba(76, 175, 80, 0.95)']}
            style={styles.headerGradient}
          >
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Icon name="arrow-left" size={20} color="white" />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Icon name="briefcase-account" size={28} color="white" />
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Hospitality Application Tracking</Text>
                <Text style={styles.headerSubtitle}>Real-time status updates</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.refreshHeaderButton}
              onPress={onRefresh}
              disabled={refreshing}
            >
              <Icon 
                name={refreshing ? "refresh" : "refresh"} 
                size={20} 
                color={refreshing ? '#388E3C' : 'white'} 
              />
            </TouchableOpacity>
          </LinearGradient>
        </Animatable.View>

        <Animated.ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#388E3C']}
              tintColor="#388E3C"
            />
          }
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {renderTrackingBar()}
            {renderPersonalInformation()}
          </Animated.View>
        </Animated.ScrollView>

        {renderDocumentModal()}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 30,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 30,
  },
  loadingSpinner: {
    marginTop: 30,
    marginBottom: 20,
  },
  header: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 15,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    paddingTop: Platform.OS === 'ios' ? 10 : 25,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  refreshHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },

  trackingContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(56, 142, 60, 0.2)',
  },
  trackingGradient: {
    padding: 20,
  },
  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  trackingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
    flex: 1,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 142, 60, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  progressStepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    position: 'relative',
    zIndex: 1,
  },
  stepWrapper: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  stepCircleTouchable: {
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  stepCircleCompleted: {
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  stepIconCircle: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 142, 60, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 142, 60, 0.5)',
  },
  stepIconCircleCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.5)',
    borderColor: '#4CAF50',
  },
  stepLabelContainer: {
    alignItems: 'center',
    marginBottom: 5,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 12,
  },
  stepLabelCompleted: {
    color: 'white',
  },
  stepCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 5,
  },
  stepCountCompleted: {
    color: '#4CAF50',
  },
  stepStatusBadge: {
    marginBottom: 6,
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadgeCompleted: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(255, 152, 0, 0.3)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  stepDescription: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 11,
  },
  connectingLineContainer: {
    position: 'absolute',
    top: 80, // Adjust this based on your circle position
    left: 30,
    right: 30,
    height: 2,
    zIndex: 0,
  },
  connectingLineBackground: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 1,
  },
  connectingLineFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 1,
  },
  progressInfoContainer: {
    marginTop: 30,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressInfoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  progressInfoPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(56, 142, 60, 0.15)',
    padding: 10,
    borderRadius: 8,
  },
  progressNoteText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 14,
  },


  trackingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 142, 60, 0.2)',
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  trackingInfoText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 10,
    flex: 1,
    fontStyle: 'italic',
  },
  infoContainer: {
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  infoGradient: {
    padding: 20,
  },
  infoHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  infoSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  fieldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  fieldItem: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 15,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 6,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    paddingLeft: 20,
  },
  fieldValueMultiline: {
    lineHeight: 18,
  },
  documentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  documentCard: {
    width: '50%',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  documentGradient: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  documentTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  documentStatusText: {
    fontSize: 10,
    color: '#4CAF50',
    marginLeft: 4,
  },
  viewButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  metadataContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    padding: 15,
    marginTop: 10,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metadataLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 8,
    marginRight: 10,
    width: 90,
  },
  metadataValue: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  modalContent: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  documentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  closeModalButton: {
    backgroundColor: 'rgba(255,59,48,0.2)',
  },
});

export default HospitalityTracking;