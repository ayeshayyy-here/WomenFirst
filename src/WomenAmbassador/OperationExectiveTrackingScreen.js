import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Animated
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Loader from '../components/Loader';
const { width } = Dimensions.get('window');
import { useNavigation } from '@react-navigation/native';

const OperationExectiveTrackingScreen = ({ userCnic }) => {
  
  const navigation = useNavigation();
  const [executiveData, setExecutiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const progressAnim = useState(new Animated.Value(0))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    console.log('[INIT] 🚀 OperationExectiveTrackingScreen mounted');
    console.log('[INIT] 🔑 Received CNIC:', userCnic);
    
    if (userCnic && userCnic.length > 5) {
      fetchOperationExecutiveStatus(userCnic);
    } else {
      console.log('[ERROR] ❌ Invalid CNIC received:', userCnic);
      setError('Valid CNIC not available');
      setLoading(false);
    }
  }, [userCnic]);

  const fetchOperationExecutiveStatus = async (cnic) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[STEP 1] 🌐 Checking Operation & Executive status for CNIC:', cnic);

      const API_URL = 'https://b00886286dc4.ngrok-free.app/api/ambassador/operation-executive-status';
      
      const requestBody = {
        cnic: cnic
      };
      
      console.log('[STEP 1] 📦 Sending request to:', API_URL);
      console.log('[STEP 1] 📦 Request body:', JSON.stringify(requestBody));

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[STEP 1] 📡 Response status:', response.status);
      
      const data = await response.json();
      console.log('[STEP 1] ✅ API response received');
      console.log('[STEP 1] ✅ API success status:', data.success);
      console.log('[STEP 1] 📊 Full API response data:', data);

      if (data.success) {
        console.log('[SUCCESS] 🎉 Operation & Executive status loaded successfully');
        console.log('[SUCCESS] 🏛️ University ID from API:', data.data.university_id);
        console.log('[SUCCESS] 📋 Registration data:', data.data.registration_data);
        
        setExecutiveData(data.data);
        
        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: data.data.progress || 0,
          duration: 1500,
          useNativeDriver: false,
        }).start();
        
        // Fade in content
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
        
      } else {
        console.log('[INFO] ℹ️ Ambassador does not qualify for Operation & Executive');
        console.log('[INFO] ℹ️ API message:', data.message);
        setExecutiveData(null);
        setError(data.message || 'You do not qualify for Operation & Executive tracking yet.');
      }
    } catch (error) {
      console.error('[ERROR] 💥 API call failed:', error);
      console.error('[ERROR] 💥 Error message:', error.message);
      setError('Failed to fetch Operation & Executive status. Please check your internet connection.');
    } finally {
      setLoading(false);
      console.log('[STEP 1] 🏁 API call completed');
    }
  };

  const handleRetry = () => {
    console.log('[ACTION] 🔄 Retry button pressed');
    setLoading(true);
    setError(null);
    if (userCnic) {
      console.log('[ACTION] 🔄 Retrying with existing CNIC:', userCnic);
      fetchOperationExecutiveStatus(userCnic);
    }
  };

  const handleStepPress = (step) => {
    console.log('[ACTION] 👆 Step pressed:', step.name);
    
    // Different actions based on step key
    switch (step.key) {
      case 'orientation':
        console.log('[NAVIGATION] 📱 Navigating to ActivityCalendar');
        console.log('[NAVIGATION] 🔑 CNIC:', userCnic);
        console.log('[NAVIGATION] 🏛️ University ID from executiveData:', executiveData?.university_id);
        console.log('[NAVIGATION] 📋 All executiveData:', executiveData);
        
        // Navigate to Activity Calendar with userCnic and university_id
        navigation.navigate('ActivityCalendarScreen', { 
          userCnic: userCnic,
          userUniversityId: executiveData?.university_id || executiveData?.registration_data?.university_id
        });
        break;
        
       case 'activities':
        console.log('[NAVIGATION] 📱 Navigating to ActivitiesMonitoring');
        console.log('[NAVIGATION] 🔑 CNIC:', userCnic);
        console.log('[NAVIGATION] 📋 Registration ID:', executiveData?.registration_id);
        
        // Navigate to Activities & Monitoring with userCnic and registrationId
        navigation.navigate('ActivitiesMonitoringScreen', { 
          userCnic: userCnic,
          registrationId: executiveData?.registration_id
        });
        break;
        
      case 'accounts':
        Alert.alert(
          'Accounts Details',
          'This will open the Accounts Details screen',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open', 
              onPress: () => {
                Alert.alert('Coming Soon', 'Accounts Details screen will be implemented next');
              }
            }
          ]
        );
        break;
        
      case 'award':
        Alert.alert(
          'Award Ceremony',
          'This will open the Award Ceremony screen',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open', 
              onPress: () => {
                Alert.alert('Coming Soon', 'Award Ceremony screen will be implemented next');
              }
            }
          ]
        );
        break;
        
      default:
        Alert.alert(step.name, `This step is ${step.completed ? 'completed' : 'pending'}`);
    }
  };

  const renderTrackingLine = () => {
    if (!executiveData) return null;

    const circleSize = width * 0.14;

    return (
      <View style={styles.trackingContainer}>
        <Text style={styles.trackingHeading}>Operation & Executive</Text>
        
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
            {executiveData.steps.map((step, index) => (
              <View key={index} style={styles.circleWrapper}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleStepPress(step)}
                  style={[
                    styles.trackingCircle,
                    { 
                      width: circleSize,
                      height: circleSize,
                      backgroundColor: step.color,
                    },
                    step.completed && styles.completedCircle,
                    !step.completed && step.key === 'orientation' && styles.clickableCircle
                  ]}
                >
                  <Icon 
                    name={step.icon} 
                    size={circleSize * 0.35} 
                    color={step.completed ? '#fff' : '#333'} 
                  />
                  
                  {step.completed && (
                    <View style={styles.completedCheck}>
                      <Icon name="check" size={circleSize * 0.2} color="#fff" />
                    </View>
                  )}
                  
                  {/* Show tap icon for orientation if not completed */}
                  {!step.completed && step.key === 'orientation' && (
                    <View style={styles.tapIndicator}>
                      <Icon name="hand-pointer-o" size={circleSize * 0.15} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
                
                <Text style={styles.circleLabel}>{step.name}</Text>
                
            
              </View>
            ))}
          </View>
        </View>

    
      </View>
    );
  };

  const renderNotQualified = () => {
    if (loading) return null;
    
    return (
      <Animated.View style={[styles.notQualifiedContainer, { opacity: fadeAnim }]}>
        <Icon name="exclamation-triangle" size={40} color="#FFC107" />
        <Text style={styles.notQualifiedTitle}>Not Qualified Yet</Text>
        <Text style={styles.notQualifiedText}>
          {error || 'You do not qualify for Operation & Executive tracking yet.'}
        </Text>
        <Text style={styles.qualificationCriteria}>
          To qualify, you must have:
        </Text>
        <View style={styles.criteriaList}>
          <View style={styles.criteriaItem}>
            <Icon name="check-circle" size={14} color="#4CAF50" />
            <Text style={styles.criteriaText}>Application Status: Approved</Text>
          </View>
          <View style={styles.criteriaItem}>
            <Icon name="check-circle" size={14} color="#4CAF50" />
            <Text style={styles.criteriaText}>Interview Status: Yes</Text>
          </View>
          <View style={styles.criteriaItem}>
            <Icon name="check-circle" size={14} color="#4CAF50" />
            <Text style={styles.criteriaText}>WDD Status: Yes</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Icon name="refresh" size={14} color="#fff" />
          <Text style={styles.retryButtonText}>Check Again</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Loading Screen
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader/>
        <Text style={styles.loadingText}>
          Checking Operation & Executive Status...
        </Text>
        <Text style={styles.loadingSubText}>
          CNIC: {userCnic ? userCnic.substring(0, 5) + '...' : 'Loading...'}
        </Text>
      </View>
    );
  }

  // Main Component
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {executiveData ? renderTrackingLine() : renderNotQualified()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 14,
    color: '#6B2D5C',
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingSubText: {
    marginTop: 5,
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  trackingContainer: {
    backgroundColor: '#6B2D5C',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  trackingHeading: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
  trackingLineContainer: {
    height: 6,
    marginVertical: 60,
    position: 'relative',
  },
  trackingLineBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#D2ECFF',
    borderRadius: 3,
    opacity: 0.3,
  },
  trackingLineProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 6,
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  circlesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: -30,
    left: 0,
    right: 0,
  },
  circleWrapper: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 3,
  },
  trackingCircle: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    position: 'relative',
  },
  completedCircle: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  clickableCircle: {
    borderColor: '#FFD700',
    borderWidth: 4,
  },
  completedCheck: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  tapIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleLabel: {
    marginTop: 10,
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    lineHeight: 13,
  },
  completedText: {
    marginTop: 4,
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingText: {
    marginTop: 4,
    color: '#FFC107',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  clickableText: {
    marginTop: 4,
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  progressSummary: {
    marginTop: 25,
    paddingTop: 15,
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  progressPercent: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  universityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    alignSelf: 'center',
  },
  universityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  notQualifiedContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginVertical: 10,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  notQualifiedTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFC107',
    marginTop: 15,
    marginBottom: 10,
  },
  notQualifiedText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  qualificationCriteria: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B2D5C',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  criteriaList: {
    width: '100%',
    marginBottom: 25,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 10,
  },
  criteriaText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 10,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B2D5C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default OperationExectiveTrackingScreen;