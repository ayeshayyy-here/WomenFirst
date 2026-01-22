import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import SyncStorage from 'react-native-sync-storage';
import OperationExectiveTrackingScreen from '../WomenAmbassador/OperationExectiveTrackingScreen';
import Loader from '../components/Loader';
import AutoRegisterBadge from '../components/AutoRegisterBadge';

const { width } = Dimensions.get('window');

const AmbassadorTrackingScreen = ({ navigation }) => {


   const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [userCnic, setUserCnic] = useState('');
  const [storageLoaded, setStorageLoaded] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    console.log('[INIT] 🚀 AmbassadorTrackingScreen mounted');
    initializeStorage();
  }, []);

  const initializeStorage = async () => {
    try {
      console.log('[INIT] 🔧 Initializing sync storage...');
      
      // Initialize sync storage if needed
      // Some versions require initialization
      if (typeof SyncStorage.init === 'function') {
        await SyncStorage.init();
        console.log('[INIT] ✅ Sync storage initialized');
      }
      
      loadCnicFromStorage();
    } catch (error) {
      console.error('[ERROR] 💥 Failed to initialize storage:', error);
      loadCnicFromStorage(); // Still try to load even if init fails
    }
  };

  useEffect(() => {
    if (storageLoaded && userCnic) {
      console.log('[SUCCESS] ✅ CNIC loaded from storage, fetching tracking data...');
      fetchTrackingData(userCnic);
    } else if (storageLoaded && !userCnic) {
      console.log('[ERROR] ❌ No CNIC found after storage load');
      setLoading(false);
      Alert.alert(
        'Profile Not Found', 
        'Unable to find your profile information. Please make sure you are logged in.',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.goBack() 
          }
        ]
      );
    }
  }, [storageLoaded, userCnic]);


  const loadCnicFromStorage = async () => {
    try {
      console.log('[STEP 1] 🔍 Starting CNIC extraction from syncStorage...');
      
      // Give a small delay to ensure storage is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('[STEP 1] 📱 Accessing syncStorage for user_profile...');
      
      // Use SyncStorage directly (not syncStorage.get)
      const userProfile = SyncStorage.get('user_profile');
      console.log('[STEP 1] 📊 Raw user_profile from SyncStorage:', userProfile);

      if (userProfile) {
        console.log('[STEP 1] 🔄 Parsing user_profile JSON...');
        const profileData = JSON.parse(userProfile);
        console.log('[STEP 1] 📋 Complete parsed profile data:', profileData);
        
        // Try all possible CNIC field names based on your login screen
        const cnic = profileData.cnic || profileData.CNIC || profileData.cnic_bform || profileData.cnicNumber;
        console.log('[STEP 1] 🔑 CNIC extraction result:', cnic);
        
        if (cnic && cnic !== 'null' && cnic !== 'undefined' && cnic.length > 5) {
          const cleanCnic = cnic.toString().trim();
          console.log('[SUCCESS] ✅ Valid CNIC found:', cleanCnic);
          console.log('[SUCCESS] ✅ CNIC length:', cleanCnic.length);
          setUserCnic(cleanCnic);
          setStorageLoaded(true);
        } else {
          console.log('[ERROR] ❌ Invalid or empty CNIC:', cnic);
          console.log('[ERROR] ❌ CNIC type:', typeof cnic);
          console.log('[ERROR] ❌ CNIC length:', cnic?.length);
          setStorageLoaded(true);
        }
      } else {
        console.log('[ERROR] ❌ No user_profile found in SyncStorage');
        
        // Debug: Check all available keys in storage
        try {
          const allKeys = SyncStorage.getAllKeys();
          console.log('[DEBUG] 🔍 All available keys in SyncStorage:', allKeys);
          
          if (allKeys && allKeys.length > 0) {
            const allData = {};
            allKeys.forEach(key => {
              allData[key] = SyncStorage.get(key);
            });
            console.log('[DEBUG] 📋 All data in SyncStorage:', allData);
          }
        } catch (debugError) {
          console.error('[DEBUG] ❌ Could not read SyncStorage keys:', debugError);
        }
        
        setStorageLoaded(true);
      }
    } catch (error) {
      console.error('[ERROR] 💥 Failed to load CNIC from storage:', error);
      console.error('[ERROR] 💥 Error details:', error.message);
      console.error('[ERROR] 💥 Error stack:', error.stack);
      setStorageLoaded(true);
    }
  };

  const fetchTrackingData = async (cnic) => {
    try {
      setLoading(true);
      console.log('[STEP 2] 🌐 Starting API call with CNIC:', cnic);
      console.log('[STEP 2] 📏 CNIC length for validation:', cnic.length);

      // Validate CNIC one more time
      if (!cnic || cnic.length < 10) {
        console.log('[ERROR] ❌ Invalid CNIC length before API call:', cnic?.length);
        throw new Error('Invalid CNIC length');
      }

      const API_URL = 'https://fa-wdd.punjab.gov.pk/api/ambassador-tracking-by-cnic';
      
      const requestBody = {
        cnic: cnic
      };
      
      console.log('[STEP 2] 📦 Sending request to:', API_URL);
      console.log('[STEP 2] 📦 Request body:', JSON.stringify(requestBody));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[STEP 2] 📡 Response status:', response.status);
      console.log('[STEP 2] 📡 Response headers:', response.headers);
      
      if (!response.ok) {
        console.log('[ERROR] ❌ HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[STEP 2] ✅ API response received successfully');
      console.log('[STEP 2] ✅ API success status:', data.success);
      console.log('[STEP 2] 📊 Full API response data:', data);

      if (data.success) {
        console.log('[SUCCESS] 🎉 Tracking data loaded successfully');
        console.log('[SUCCESS] 📋 Tracking data structure:', Object.keys(data.data || {}));
        setTrackingData(data.data);
        
        // Animate everything
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(progressAnim, {
            toValue: data.data.trackingSteps.progress,
            duration: 1500,
            useNativeDriver: false,
          })
        ]).start();
      } else {
        console.log('[ERROR] ❌ API returned success: false');
        console.log('[ERROR] ❌ API message:', data.message);
        Alert.alert('Not Found', data.message || 'No application found with this CNIC');
      }
    } catch (error) {
      console.error('[ERROR] 💥 API call failed:', error);
      console.error('[ERROR] 💥 Error message:', error.message);
      console.error('[ERROR] 💥 Error stack:', error.stack);
      Alert.alert(
        'Connection Error', 
        'Failed to fetch registered data. Your data does not exists in our records ',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      console.log('[STEP 2] 🏁 API call completed, loading set to false');
    }
  };

  const handleRetry = () => {
    console.log('[ACTION] 🔄 Retry button pressed');
    setLoading(true);
    if (userCnic) {
      console.log('[ACTION] 🔄 Retrying with existing CNIC:', userCnic);
      fetchTrackingData(userCnic);
    } else {
      console.log('[ACTION] 🔄 Retrying CNIC load from storage');
      loadCnicFromStorage();
    }
  };

  const renderTrackingCircles = () => {
    if (!trackingData) return null;

    const { trackingSteps, registration, totalApplications } = trackingData;
    const icons = ['eye', 'search', 'microphone', 'star', 'check-circle'];
    const circleSize = width * 0.14;

    return (
        <View style={styles.trackingContainerr}>
          <Text style={styles.trackingHeading}>Application Tracking</Text>
      <View style={styles.trackingContainer}>
          <Text style={styles.trackingHeadingw}>Ambassador Application Tracking</Text>
           <AutoRegisterBadge role="ambassador" />
        
        {/* Progress Line Container */}
        <View style={styles.trackingLineContainer}>
          <View style={styles.trackingLineBackground} />
          <Animated.View 
            style={[
              styles.trackingLineProgress,
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                })
              }
            ]} 
          />
          
          {/* Tracking Circles */}
          <View style={styles.circlesContainer}>
            {trackingSteps.steps.map((step, index) => (
              <View key={index} style={styles.circleWrapper}>
                <View 
                  style={[
                    styles.trackingCircle,
                    { 
                      width: circleSize,
                      height: circleSize,
                      backgroundColor: step.color,
                    },
                    step.completed && styles.completedCircle
                  ]}
                >
                  <Icon 
                    name={icons[index]} 
                    size={circleSize * 0.3} 
                    color={step.completed ? '#fff' : '#333'} 
                  />
                  {step.completed && (
                    <View style={styles.pulseEffect} />
                  )}
                </View>
                <Text style={styles.circleLabel}>{step.name}</Text>
              
              </View>
            ))}
          </View>
        </View>

        {/* Online Test Button */}
        {registration.status === 'Approved' && totalApplications > 50 && (
          <TouchableOpacity 
            style={styles.onlineTestButton}
            onPress={() => Alert.alert('Online Test', 'Test functionality would go here')}
          >
            <Icon name="pencil-square" size={20} color="#6B2D5C" />
            <Text style={styles.onlineTestText}>Online Test Available</Text>
          </TouchableOpacity>
        )}

    
      </View>
       <OperationExectiveTrackingScreen 
            userCnic={trackingData.registration.cnic_bform || userCnic}
          />
      </View>
    );
  };

  const renderProfileDetails = () => {
    if (!trackingData || !showProfile) return null;

    const { registration, currentStatus } = trackingData;

    return (
      <Animated.View style={[styles.profileCard, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#6B2D5C', '#3E2A5D']}
          style={styles.profileHeader}
        >
          <Text style={styles.profileName}>
            {registration.full_name || 'Applicant'}
          </Text>
          <Text style={styles.profileRole}>Youth Ambassador Participant</Text>
          <Text style={styles.currentStatus}>Status: {currentStatus}</Text>
        </LinearGradient>

        <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
          
          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionTitle}>
              <Icon name="user" size={16} color="#6B2D5C" />
              <Text style={styles.sectionTitleText}>Personal Information</Text>
            </View>
            <View style={styles.sectionContent}>
              <InfoRow label="Full Name" value={registration.full_name} />
              <InfoRow label="Father's Name" value={registration.father_name} />
              <InfoRow label="CNIC/B-Form" value={registration.cnic_bform} />
              <InfoRow label="Contact Number" value={registration.contact_number} />
              <InfoRow label="Email" value={registration.email} />
              <InfoRow label="Date of Birth" value={registration.dob ? new Date(registration.dob).toLocaleDateString() : 'N/A'} />
              <InfoRow label="Present Address" value={registration.present_address} />
            </View>
          </View>

          {/* Educational Information */}
          <View style={styles.section}>
            <View style={styles.sectionTitle}>
              <Icon name="graduation-cap" size={16} color="#6B2D5C" />
              <Text style={styles.sectionTitleText}>Educational Information</Text>
            </View>
            <View style={styles.sectionContent}>
              <InfoRow label="University" value={registration.university?.name} />
              <InfoRow label="Department" value={registration.department?.department_name} />
              <InfoRow label="Education Level" value={registration.education_level} />
              <InfoRow label="Current Semester" value={registration.current_semester} />
              <InfoRow label="Registration Number" value={registration.student_id} />
            </View>
          </View>

          {/* Application Details */}
          <View style={styles.section}>
            <View style={styles.sectionTitle}>
              <Icon name="lightbulb-o" size={16} color="#6B2D5C" />
              <Text style={styles.sectionTitleText}>Application Details</Text>
            </View>
            <View style={styles.sectionContent}>
              <InfoRow label="Current Status" value={currentStatus} />
              <InfoRow label="Motivation" value={registration.motivation} />
              <InfoRow label="Past Involvement" value={registration.past_involvement} />
              <InfoRow label="Organize Events" value={registration.organize_events} />
              <InfoRow label="Hours Per Week" value={registration.hours_per_week} />
            </View>
          </View>

          {/* Social Media */}
          <View style={styles.section}>
            <View style={styles.sectionTitle}>
              <Icon name="share-alt" size={16} color="#6B2D5C" />
              <Text style={styles.sectionTitleText}>Social Media</Text>
            </View>
            <View style={styles.sectionContent}>
              <InfoRow label="Instagram Followers" value={registration.followers_instagram} />
              <InfoRow label="Facebook Followers" value={registration.followers_facebook} />
              <InfoRow label="Twitter Followers" value={registration.followers_twitter} />
              <InfoRow label="YouTube Followers" value={registration.followers_youtube} />
            </View>
          </View>

        </ScrollView>
      </Animated.View>
    );
  };

  // Loading Screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#6B2D5C" barStyle="light-content" />
       <Loader/>
        <Text style={styles.loadingText}>
          {userCnic ? 'Loading Your Application Status...' : 'Loading Your Profile...'}
        </Text>
        <Text style={styles.debugText}>
          CNIC: {userCnic || 'Loading from storage...'}
        </Text>
        
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Icon name="refresh" size={16} color="#fff" />
          <Text style={styles.retryButtonText}>Retry Loading</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main Tracking Screen
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B2D5C" barStyle="light-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderTrackingCircles()}
        
        {/* Toggle Profile Button */}
        <TouchableOpacity 
          style={styles.toggleProfileButton}
          onPress={() => setShowProfile(!showProfile)}
        >
          <Icon 
            name={showProfile ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.toggleProfileText}>
            {showProfile ? 'Hide Profile Details' : 'Show Profile Details'}
          </Text>
        </TouchableOpacity>

        {renderProfileDetails()}
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleRetry}
          >
            <Icon name="refresh" size={16} color="#6B2D5C" />
            <Text style={styles.refreshText}>Refresh Status</Text>
          </TouchableOpacity>
        </View>
      

      </ScrollView>
           <View>

  {/* YOUR SCREEN CONTENT */}
  {/*<BottomFPButton navigation={navigation} /> */}
</View>
    </View>
   
  );
};

// Helper Component
const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
    color: '#6B2D5C',
    textAlign: 'center',
    fontWeight: '500',
  },
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B2D5C',
    padding: 10,
    borderRadius: 6,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 6,
  },
   trackingContainerr: {
    backgroundColor: '#f4f1f3ff',
    marginTop: 12,
    padding: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  trackingContainer: {
    backgroundColor: '#6B2D5C',
    margin: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  trackingHeading: {
    textAlign: 'center',
    color: '#6B2D5C',
   fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    marginTop: 25,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  trackingHeadingw: {
   textAlign: 'center',
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  trackingLineContainer: {
    height: 4,
    marginVertical: 80,
    position: 'relative',
  },
  trackingLineBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#D2ECFF',
    borderRadius: 2,
    opacity: 0.3,
  },
  trackingLineProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: -22,
    left: 0,
    right: 0,
  },
  circleWrapper: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
  },
  trackingCircle: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    position: 'relative',
    width: 36,
    height: 36,
  },
  completedCircle: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  pulseEffect: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 25,
    opacity: 0.6,
  },
  circleLabel: {
    marginTop: 8,
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    lineHeight: 12,
  },
  circleDescription: {
    marginTop: 2,
    color: '#D2ECFF',
    fontSize: 8,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 10,
  },
  onlineTestButton: {
    flexDirection: 'row',
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: 8,
  },
  onlineTestText: {
    color: '#6B2D5C',
    fontSize: 13,
    fontWeight: '600',
  },
  progressSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  progressPercent: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '700',
  },
  toggleProfileButton: {
    flexDirection: 'row',
    backgroundColor: '#3E2A5D',
    padding: 12,
    marginHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleProfileText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  profileCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    marginHorizontal: 12,
    marginBottom: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    maxHeight: 350,
  },
  profileHeader: {
    padding: 16,
    alignItems: 'center',
  },
  profileName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  profileRole: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
    marginBottom: 6,
  },
  currentStatus: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  profileContent: {
    maxHeight: 280,
  },
  section: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitleText: {
    color: '#6B2D5C',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionContent: {
    // Content styles
  },
  infoRow: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3E2A5D',
    flex: 1,
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
    flex: 2,
    textAlign: 'right',
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 20,
    gap: 8,
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6B2D5C',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  refreshText: {
    color: '#6B2D5C',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default AmbassadorTrackingScreen;