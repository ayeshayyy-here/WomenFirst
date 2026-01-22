import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ImageBackground,
  Platform,
  ActivityIndicator,
  Linking,
  ToastAndroid,
  Dimensions,
  SafeAreaView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import Icon6 from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Loader from '../components/Loader';
import axios from 'axios';
import syncStorage from 'react-native-sync-storage';
import AutoRegisterBadge from '../components/AutoRegisterBadge';

const { width, height } = Dimensions.get('window');

const API_BASE_URL = 'https://ypc-wdd.punjab.gov.pk/api';

const ProfileTrackingScreenYPC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Document mapping from database fields to display names
  const documentFields = [
    { field: 'student_card_front', label: 'Student Card Front', icon: 'id-card' },
    { field: 'student_card_back', label: 'Student Card Back', icon: 'id-card' },
    { field: 'student_id_card_front', label: 'Student ID Front', icon: 'address-card' },
    { field: 'student_id_card_back', label: 'Student ID Back', icon: 'address-card' },
    { field: 'bonafide_certificate', label: 'Bonafide Certificate', icon: 'file-pdf' },
    { field: 'business_overview', label: 'Business Overview PDF', icon: 'file-pdf' },
  ];

  // Fetch profile data
const fetchProfileData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);

    const userProfile = syncStorage.get('user_profile');
    console.log('📱 SyncStorage user_profile:', userProfile);
    
    if (!userProfile) {
      setError('User not logged in. Please login first.');
      setLoading(false);
      return;
    }

    const userData = JSON.parse(userProfile);
    console.log('📱 Parsed userData:', userData);
    
    if (!userData.cnic || userData.cnic.length !== 13) {
      setError('Invalid CNIC in user profile');
      setLoading(false);
      return;
    }

    console.log('📱 Fetching profile for CNIC:', userData.cnic);
    console.log('🌐 API URL:', `${API_BASE_URL}/profile/tracking?cnic=${userData.cnic}`);
    
    const response = await axios.get(`${API_BASE_URL}/profile/tracking`, {
      params: { cnic: userData.cnic }
    });

    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('🎯 API Success:', response.data.success);
      
      // Log user data
      const user = response.data.data?.user;
      console.log('👤 User Data:', user);
      console.log('📊 Progress Data:', response.data.data?.progress);
      console.log('📅 Deadline Data:', response.data.data?.deadline);
      
      // Log documents specifically
      console.log('📋 Documents Array:', user?.documents);
      console.log('📋 Documents Count:', user?.documents?.length || 0);
      
      if (user?.documents && user.documents.length > 0) {
        console.log('📋 Document Details:');
        user.documents.forEach((doc, index) => {
          console.log(`  [${index}] ${doc.label}: ${doc.url}`);
        });
      }

      setProfileData(response.data.data);
      const progress = response.data.data.progress.progress_width;
      console.log('📊 Progress Width:', progress);
      animateProgressBar(progress);
      
      setTimeout(() => {
        setShowProfile(true);
        console.log('👁️ Profile shown after delay');
      }, 1000);
    } else {
      console.log('❌ API Error:', response.data.message);
      setError(response.data.message || 'Failed to load profile');
    }
  } catch (error) {
    console.error('❌ Profile fetch error:', error);
    
    if (error.response) {
      console.log('❌ Error response status:', error.response.status);
      console.log('❌ Error response data:', error.response.data);
      
      if (error.response.status === 404) {
        setError('Profile not found for this CNIC');
      } else if (error.response.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(`Error: ${error.response.data.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      console.log('❌ No response received');
      setError('Network error. Please check your internet connection.');
    } else {
      console.log('❌ Other error:', error.message);
      setError(`Error: ${error.message}`);
    }
  } finally {
    console.log('🏁 Fetch completed');
    setLoading(false);
    setRefreshing(false);
  }
}, []);

  // Animate progress bar
  const animateProgressBar = (targetWidth) => {
    const interval = 10;
    const steps = 50;
    const increment = targetWidth / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetWidth) {
        current = targetWidth;
        clearInterval(timer);
      }
      setAnimatedProgress(current);
    }, interval);
  };

  // Get step status
  const getStepStatus = (stepNumber) => {
    if (!profileData) return '';
    
    const { current_step } = profileData.progress;
    const { uni_status, recommendation_status } = profileData.user;
    
    if (stepNumber === 1) return 'completed';
    if (stepNumber === 2) {
      if (uni_status === null) return 'active';
      if (uni_status === 'Approved' || uni_status === 'Declined') return 'completed';
      return '';
    }
    if (stepNumber === 3) {
      if (current_step === 3) return 'active';
      if (uni_status === 'Approved' || uni_status === 'Declined') return 'completed';
      return '';
    }
    if (stepNumber === 4) {
      if (current_step === 4) return 'active';
      if (uni_status === 'Approved' && recommendation_status === 'Recommended') return 'completed';
      if (uni_status === 'Approved' && recommendation_status === 'Not Recommended') return 'rejected';
      return '';
    }
    if (stepNumber === 5) {
      if (current_step === 5) return 'active';
      return '';
    }
    return '';
  };

  // Get step icon
  const getStepIcon = (stepNumber) => {
    const status = getStepStatus(stepNumber);
    const isActive = profileData?.progress?.current_step === stepNumber;
    const isCompleted = status === 'completed';
    const isRejected = status === 'rejected';
    
    const icons = [
      <Icon6 name="eye" size={18} color="#efe1e1ff" key="eye" />,
      <Icon6 name="magnifying-glass" size={18} color="#efe1e1ff" key="file" />,
      <Icon6 name="users" size={18} color="#efe1e1ff" key="users" />,
      <Icon6 name="award" size={18} color="#efe1e1ff" key="award" />,
      <Icon6 name="circle-check" size={18} color="#8e7878ff" key="badge" />,
    ];
    
    return (
      <View style={[
        styles.stepIcon,
        isActive && styles.stepIconActive,
        isCompleted && styles.stepIconCompleted,
        isRejected && styles.stepIconRejected,
      ]}>
        {icons[stepNumber - 1]}
      </View>
    );
  };

  // Get step tooltip message
  const getStepTooltip = (stepNumber) => {
    const { uni_status, recommendation_status } = profileData?.user || {};
    
    switch(stepNumber) {
      case 1: return 'Completed';
      case 2:
        if (uni_status === 'Approved') return 'Your Application has been approved.';
        if (uni_status === 'Declined') return 'Your Application has been rejected.';
        return 'In Progress';
      case 3:
        if (uni_status === 'Approved') return 'Your Application has been recommended.';
        if (uni_status === 'Declined') return 'Your Application has been rejected.';
        return 'Pending';
      case 4:
        if (uni_status === 'Approved' && recommendation_status === 'Recommended') return 'Under Process';
        if (uni_status === 'Approved' && recommendation_status === 'Not Recommended') return 'Your Application has not been recommended.';
        return 'Pending';
      case 5: return 'Pending';
      default: return '';
    }
  };

  // Open document URL - construct from database path
 // Open document URL - construct from database path
// Open document URL
const openDocument = useCallback((documentUrl) => {
  if (!documentUrl) {
    console.log('❌ Document URL is empty');
    ToastAndroid.show('Document not available', ToastAndroid.SHORT);
    return;
  }

  console.log('📄 Opening document URL:', documentUrl);
  
  Linking.openURL(documentUrl).then(() => {
    console.log('✅ Document opened successfully');
  }).catch((err) => {
    console.error('❌ Failed to open document:', err);
    console.error('❌ Document URL was:', documentUrl);
    ToastAndroid.show('Cannot open document. Make sure URL is accessible.', ToastAndroid.SHORT);
  });
}, []);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return dateString.split(' ')[0];
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => {
            syncStorage.remove('user_profile');
            syncStorage.remove('auth_token');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfileData();
  }, [fetchProfileData]);

  // Focus effect to refresh data
  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
      return () => {};
    }, [fetchProfileData])
  );

  // Render progress bar
  const renderProgressBar = () => {
    if (!profileData) return null;

    const progressPercentage = (animatedProgress / 100) * 80;

    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Application Status</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.progressLineBg} />
            <View style={[
              styles.progressLineFill,
              { width: `${progressPercentage}%` },
              profileData.progress.status_color === 'rejected' && styles.progressLineRejected,
            ]} />
            
            {[1, 2, 3, 4, 5].map((step) => (
              <TouchableOpacity
                key={step}
                style={styles.step}
                onPress={() => {
                  if (step === 1) {
                    setShowProfile(!showProfile);
                    if (Platform.OS === 'android') {
                      ToastAndroid.show(
                        showProfile ? 'Profile hidden' : 'Profile shown',
                        ToastAndroid.SHORT
                      );
                    }
                  } else {
                    const tooltip = getStepTooltip(step);
                    if (Platform.OS === 'android') {
                      ToastAndroid.show(tooltip, ToastAndroid.LONG);
                    } else {
                      Alert.alert('Status Info', tooltip);
                    }
                  }
                }}
                activeOpacity={0.7}
              >
                {getStepIcon(step)}
                <Text style={[
                  styles.stepLabel,
                  getStepStatus(step) === 'active' && styles.stepLabelActive,
                  getStepStatus(step) === 'completed' && styles.stepLabelCompleted,
                  getStepStatus(step) === 'rejected' && styles.stepLabelRejected,
                ]}>
                  {['Online Submission', 'Initial Screening', 'Interview', 'Final Selection', 'Confirmed by WDD'][step - 1]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.statusLabels}>
            <View style={styles.statusLabel}>
              <View style={[styles.statusDot, styles.statusSelected]} />
              <Text style={styles.statusText}>Recommended</Text>
            </View>
            <View style={styles.statusLabel}>
              <View style={[styles.statusDot, styles.statusRejected]} />
              <Text style={styles.statusText}>Not Recommended</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // InfoItem Component
  const InfoItem = ({ label, value, fullWidth = false }) => (
    <View style={[styles.infoItem, fullWidth && styles.fullWidthItem]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={fullWidth ? 5 : 3}>
        {value || '-'}
      </Text>
    </View>
  );

  // Render profile details
// Render profile details
const renderProfileDetails = () => {
  if (!profileData || !showProfile) return null;
  
  const { user, deadline } = profileData;
  
  // Check if documents exist in the user data
  const hasDocuments = user.documents && user.documents.length > 0;
  
  console.log('📱 Rendering profile - hasDocuments:', hasDocuments);
  console.log('📱 Documents array:', user.documents);

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <Text style={styles.profileHeaderTitle}>{user.full_name}</Text>
        <Text style={styles.profileHeaderSubtitle}>Youth Pitch Participant</Text>
         <AutoRegisterBadge role="ypc" />
      </View>

      <ScrollView 
        style={styles.profileContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Icon6 name="user-circle" size={14} color="#6B2D5C" />
            <Text style={styles.sectionTitleText}>Personal Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoItem label="Full Name" value={user.full_name} />
            <InfoItem label="Guardian Type" value={user.guardian_type_label} />
            <InfoItem label="Guardian Name" value={user.guardian_name} />
            <InfoItem label="CNIC/B-Form" value={user.cnic_bform} />
            <InfoItem label="DOB" value={formatDate(user.dob)} />
            <InfoItem label="Contact" value={user.contact_number} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Current Address" value={user.current_address} />
            <InfoItem label="Permanent Address" value={user.permanent_address} />
          </View>
        </View>

        {/* Academic Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Icon6 name="graduation-cap" size={14} color="#6B2D5C" />
            <Text style={styles.sectionTitleText}>Academic Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoItem label="District" value={user.district_name || '-'} />
            <InfoItem label="University Type" value={user.university_type} />
            <InfoItem label="University" value={user.university_name || '-'} />
            <InfoItem label="Department" value={user.department_program} />
            <InfoItem label="Program Level" value={user.program_level_label} />
            <InfoItem label="Current Year" value={user.year_level || '-'} />
            <InfoItem label="Semester" value={user.current_semester} />
            <InfoItem label="Student ID" value={user.student_id} />
          </View>
        </View>

        {/* Startup Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Icon6 name="lightbulb" size={14} color="#6B2D5C" />
            <Text style={styles.sectionTitleText}>Startup Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoItem label="Title" value={user.startup_title} />
            <InfoItem label="Status" value={user.idea_status} />
            <InfoItem 
              label="Sector/Industry" 
              value={`${user.sectors?.join(', ') || '-'} ${user.other_sector ? `, ${user.other_sector}` : ''}`}
              fullWidth
            />
            <InfoItem 
              label="Pitch" 
              value={user.elevator_pitch}
              fullWidth
            />
          </View>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <View style={styles.sectionTitle}>
            <Icon6 name="check-circle" size={14} color="#6B2D5C" />
            <Text style={styles.sectionTitleText}>Additional Information</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoItem label="Team Members" value={user.team_members} />
            <InfoItem 
              label="Your Role" 
              value={`${user.role}${user.other_role ? ` (${user.other_role})` : ''}`}
              fullWidth
            />
          </View>
        </View>

        {/* Documents - Using the documents array from API */}
        {hasDocuments && (
          <View style={styles.section}>
            <View style={styles.sectionTitle}>
              <Icon6 name="file-alt" size={14} color="#6B2D5C" />
              <Text style={styles.sectionTitleText}>Documents</Text>
            </View>
            <View style={styles.documentsContainer}>
              {user.documents.map((doc, index) => {
                console.log(`📄 Rendering document ${index}:`, doc.label, doc.url);
                
                // Determine icon based on file type or label
                let iconName = 'file';
                if (doc.label.includes('PDF') || doc.url.toLowerCase().endsWith('.pdf')) {
                  iconName = 'file-pdf';
                } else if (doc.label.includes('Card') || doc.label.includes('ID')) {
                  iconName = 'id-card';
                }
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.documentItem}
                    onPress={() => {
                      console.log('👆 Document clicked:', doc.label);
                      openDocument(doc.url);
                    }}
                  >
                    <View style={styles.documentIcon}>
                      <Icon6 
                        name={iconName} 
                        size={12} 
                        color="#fff" 
                      />
                    </View>
                    <Text style={styles.documentLabel} numberOfLines={1}>
                      {doc.label}
                    </Text>
                    <Icon6 name="link" size={12} color="#6B2D5C" />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Debug info - show if no documents found */}
        {/* {!hasDocuments && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>No documents found in API response</Text>
            <Text style={styles.debugText}>User object keys: {Object.keys(user).join(', ')}</Text>
          </View>
        )} */}

        {/* Actions */}
        {/* <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, !deadline.can_update && styles.actionButtonDisabled]}
            disabled={!deadline.can_update}
            onPress={() => {
              ToastAndroid.show('Update feature coming soon', ToastAndroid.SHORT);
            }}
          >
            <Icon6 name="edit" size={14} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>
              پروفائل اپ ڈیٹ کریں
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.urduText}>
            {deadline.message_urdu}
          </Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Icon6 name="sign-out-alt" size={14} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.actionButtonText}>
              لاگ آؤٹ
            </Text>
          </TouchableOpacity>
        </View> */}
        
        <View style={styles.extraBottomPadding} />
      </ScrollView>
    </View>
  );
};

  // Loading state
  if (loading) {
    return (
      <View style={styles.centered}>
        <Loader />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Icon6 name="exclamation-triangle" size={40} color="#e74c3c" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchProfileData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.retryButton, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <Text style={styles.retryButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#6B2D5C" barStyle="light-content" />
      
      <ImageBackground
        source={require('../../assets/images/women.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.backgroundOverlay} />
        
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#6B2D5C']}
              tintColor="#6B2D5C"
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {renderProgressBar()}
          {renderProfileDetails()}
          
          {!showProfile && profileData && (
            <TouchableOpacity
              style={styles.showProfileButton}
              onPress={() => setShowProfile(true)}
            >
              <Icon6 name="eye" size={14} color="#6B2D5C" style={styles.showProfileIcon} />
              <Text style={styles.showProfileButtonText}>
                Show Profile Details
              </Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.bottomPadding} />
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 14,
    color: '#6B2D5C',
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  errorText: {
    marginTop: 15,
    fontSize: 14,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#6B2D5C',
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  logoutButton: {
    backgroundColor: '#3E2A5D',
  },
  
  progressContainer: {
    paddingHorizontal: 12,
    paddingTop: 15,
    width: '100%',
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 15,
     marginTop: 15,
  },
  progressTitle: {
    color: '#3E2A5D',
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 15,
    letterSpacing: 0.3,
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    position: 'relative',
  },
  progressLineBg: {
    position: 'absolute',
    top: 22,
    left: '10%',
    right: '10%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    zIndex: 1,
  },
  progressLineFill: {
    position: 'absolute',
    top: 22,
    left: '10%',
    height: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    zIndex: 2,
  },
  progressLineRejected: {
    backgroundColor: '#e74c3c',
  },
  step: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 3,
    width: '20%',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  stepIconActive: {
    backgroundColor: '#6B2D5C',
    borderColor: '#6B2D5C',
    transform: [{ scale: 1.08 }],
    shadowColor: '#6B2D5C',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  stepIconCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepIconRejected: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    color: '#777',
    maxWidth: 80,
    lineHeight: 13,
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  stepLabelActive: {
    color: '#6B2D5C',
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: '#4CAF50',
  },
  stepLabelRejected: {
    color: '#e74c3c',
  },
  statusLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 15,
  },
  statusLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusSelected: {
    backgroundColor: '#4CAF50',
  },
  statusRejected: {
    backgroundColor: '#e74c3c',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 10,
    marginHorizontal: 12,
    marginBottom: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#6B2D5C',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  profileHeaderTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  profileHeaderSubtitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  profileContent: {
    maxHeight: height * 0.65,
  },
  
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
    paddingBottom: 6,
    marginBottom: 10,
  },
  sectionTitleText: {
    color: '#6B2D5C',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 10,
  },
  fullWidthItem: {
    width: '100%',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#3E2A5D',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 3,
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  
  documentsContainer: {
    gap: 8,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  documentIcon: {
    width: 26,
    height: 26,
    backgroundColor: '#6B2D5C',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  documentLabel: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  
  actionsContainer: {
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
    paddingBottom: 20,
  },
  actionButton: {
    backgroundColor: '#6B2D5C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 140,
  },
  actionButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  urduText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e74c3c',
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'NotoNastaliqUrdu' : 'Georgia',
    lineHeight: 20,
    marginHorizontal: 10,
  },
  
  showProfileButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  showProfileIcon: {
    marginRight: 6,
  },
  showProfileButtonText: {
    color: '#6B2D5C',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Montserrat' : 'sans-serif',
  },
  
  bottomPadding: {
    height: 20,
  },
  extraBottomPadding: {
    height: 30,
  },
  debugInfo: {
  backgroundColor: '#f0f0f0',
  borderRadius: 6,
  padding: 10,
  marginTop: 10,
  marginBottom: 10,
},
debugText: {
  fontSize: 10,
  color: '#666',
  fontFamily: Platform.OS === 'ios' ? 'Monaco' : 'monospace',
  marginBottom: 4,
},
});

export default ProfileTrackingScreenYPC;