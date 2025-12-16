import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import syncStorage from 'react-native-sync-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

const { width, height } = Dimensions.get('window');

const WorkingWomenHostelScreen = ({ navigation }) => {
  // State variables
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Starting verification...');
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [districts, setDistricts] = useState([]);
  const [animationProgress] = useState(new Animated.Value(0));
  const storedDataRef = useRef(null);

  // Animation config
  const spinValue = new Animated.Value(0);
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true
    })
  ).start();

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Step information
  const stepInfo = {
    1: { title: 'Initializing', icon: 'info-circle', color: '#4A90E2' },
    2: { title: 'Verifying', icon: 'search', color: '#F5A623' },
    3: { title: 'Registering', icon: 'user-plus', color: '#7ED321' },
    4: { title: 'Success!', icon: 'check-circle', color: '#50E3C2' }
  };

  useEffect(() => {
    initializeProcess();
  }, []);

  const initializeProcess = async () => {
    try {
      updateProgress(10, 'Loading your data...');
      console.log('[DEBUG] Starting initialization process');
      
      // Clear module-specific SyncStorage
      syncStorage.remove('user');
      syncStorage.remove('user_profile');
      
      // Get fresh data from EncryptedStorage
      console.log('[DEBUG] Reading EncryptedStorage');
      const encryptedSession = await EncryptedStorage.getItem('user_session');
      
      if (!encryptedSession) {
        console.error('[DEBUG] No session found');
        throw new Error('Please login first');
      }

      let session;
      try {
        session = JSON.parse(encryptedSession);
        console.log('[DEBUG] Parsed session:', session);
      } catch (e) {
        console.error('[DEBUG] Parse error:', e);
        throw new Error('Invalid session data');
      }

      if (!session?.user) {
        console.error('[DEBUG] No user in session');
        throw new Error('Invalid user data');
      }

      const profileData = {
        name: session.user.Name,
        cnic: session.user.CNIC,
        dob: session.user.D_O_B,
        contact: session.user.Contact,
        email: session.user.Email,
        district: session.user.District,
        tehsil: session.user.Tehsil
      };

      console.log('[DEBUG] Profile data:', profileData);
      storedDataRef.current = profileData;
      updateProgress(30, `Welcome ${profileData.name.substring(0, 12)}...`);
      
      await fetchDistricts();
      updateProgress(50, 'Checking module access...');
      await verifyCNIC(profileData.cnic);
    } catch (error) {
      console.error('[DEBUG] Initialization error:', error);
      handleFailure(error.message);
    }
  };

  const fetchDistricts = async () => {
    try {
      console.log('[DEBUG] Fetching districts');
      const response = await fetch('https://wwh.punjab.gov.pk/api/districts');
      const data = await response.json();
      
      if (!data.success || !data.districts) {
        throw new Error('Failed to load districts');
      }
      
      setDistricts(data.districts);
      syncStorage.set('districts', data.districts);
    } catch (error) {
      console.error('[DEBUG] District fetch error:', error);
      throw error;
    }
  };

  const findDistrictId = (districtName) => {
    if (!districtName) {
      console.log('[DEBUG] No district name provided');
      return 0;
    }
    
    const foundDistrict = districts.find(d => 
      d.name.toLowerCase().includes(districtName.toLowerCase())
    );
    
    const districtId = foundDistrict ? foundDistrict.id : 0;
    console.log(`[DEBUG] District "${districtName}" → ID: ${districtId}`);
    return districtId;
  };

  const verifyCNIC = async (cnic) => {
    setLoading(true);
    setStep(2);
    updateProgress(60, 'Verifying your access...');

    try {
      console.log('[DEBUG] Verifying CNIC:', cnic);
      const response = await fetch('https://wwh.punjab.gov.pk/api/userdatathroughcnic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cnic }),
      });

      const data = await response.json();
      console.log('[DEBUG] Verification response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.success && data.user) {
        updateProgress(90, 'Access granted!');
        await handleVerificationSuccess(data.user);
      } else {
        updateProgress(70, 'Creating your account...');
        await registerUser();
      }
    } catch (error) {
      console.error('[DEBUG] Verification error:', error);
      if (error.message.includes('No user found')) {
        await registerUser();
      } else {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async () => {
    setStep(3);
    setLoading(true);
    updateProgress(75, 'Setting up your account...');

    try {
      if (!storedDataRef.current) {
        throw new Error('No user data available');
      }

      const userData = storedDataRef.current;
      console.log('[DEBUG] Registering with:', userData);

      // Prepare registration data with fallbacks
      const registrationData = {
        name: userData.name || `User-${userData.cnic.substring(9)}`,
        email: userData.email || `${userData.cnic}@auto.wwh.pk`,
        cnic: userData.cnic,
        phone_no: userData.contact || '03000000000',
        district: findDistrictId(userData.district),
        dob: formatDOB(userData.dob),
        password: generatePassword(),
        password_confirmation: generatePassword(),
        chk: '1',
      };

      console.log('[DEBUG] Registration payload:', registrationData);
      const response = await fetch('https://wwh.punjab.gov.pk/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();
      console.log('[DEBUG] Registration response:', data);
      updateProgress(85, 'Account created!');

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      updateProgress(90, 'Finalizing access...');
      await verifyCNIC(userData.cnic);
    } catch (error) {
      console.error('[DEBUG] Registration error:', error);
      throw error;
    }
  };

const generatePassword = () => {
  return '12345678';
};

  const formatDOB = (dobString) => {
    try {
      if (!dobString) return '1990-01-01';
      const dobDate = new Date(dobString);
      return dobDate.toISOString().split('T')[0];
    } catch {
      return '1990-01-01';
    }
  };

  const handleVerificationSuccess = async (user) => {
    try {
      updateProgress(95, 'Almost there...');
      
      // Store in SyncStorage
      syncStorage.set('user', JSON.stringify(user));
      syncStorage.set('user_profile', JSON.stringify({
        name: user.name,
        cnic: user.cnic,
        dob: user.dob,
        contact: user.phone_no,
        email: user.email,
        district: user.district,
        tehsil: user.tehsil || ''
      }));

      updateProgress(100, 'Ready to go!');
      setStep(4);
      
      setTimeout(() => {
        navigation.replace('Dashboard');
      }, 1500);
    } catch (error) {
      console.error('[DEBUG] Finalization error:', error);
      throw error;
    }
  };

  const handleFailure = (message) => {
    console.error('[DEBUG] Process failed:', message);
    setLoading(false);
    
    Alert.alert(
      'Process Incomplete',
      message,
      [
        { text: 'Try Again', onPress: initializeProcess },
        { text: 'Go Back', onPress: () => navigation.goBack() }
      ]
    );
  };

  const updateProgress = (value, message) => {
    setProgress(Math.min(Math.max(value, 0), 100));
    if (message) setStatus(message);
    
    Animated.timing(animationProgress, {
      toValue: value / 100,
      duration: 500,
      useNativeDriver: false
    }).start();
  };

  const renderStepIcon = () => {
    if (loading && step !== 4) {
      return (
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Icon name="spinner" size={60} color={stepInfo[step].color} />
        </Animated.View>
      );
    }
    return <Icon name={stepInfo[step].icon} size={60} color={stepInfo[step].color} />;
  };

  const interpolatedProgress = animationProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <ImageBackground 
      source={{uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}}
      style={styles.container}
      blurRadius={2}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          {renderStepIcon()}
          
          <Text style={[styles.title, { color: stepInfo[step].color }]}>
            {stepInfo[step].title}
          </Text>
          
          <Text style={styles.statusText}>{status}</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground} />
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  width: interpolatedProgress,
                  backgroundColor: stepInfo[step].color
                }
              ]} 
            />
          </View>
          
          <Text style={styles.stepText}>
            Step {step} of 4 • {progress}% complete
          </Text>
          
          {loading && step !== 4 && (
            <ActivityIndicator size="large" color={stepInfo[step].color} />
          )}

          {step === 4 && (
            <View style={styles.successContainer}>
              <Icon name="check-circle" size={80} color="#50E3C2" />
              <Text style={styles.successText}>You're all set!</Text>
            </View>
          )}
        </View>
        
        <View style={styles.infoBox}>
          <Icon name="info-circle" size={20} color="#4A90E2" />
          <Text style={styles.infoText}>
            {step === 1 && 'Checking your account information...'}
            {step === 2 && 'Verifying module access...'}
            {step === 3 && 'Creating module account...'}
            {step === 4 && 'Access granted to all features!'}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  card: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24
  },
  progressContainer: {
    height: 10,
    width: '100%',
    borderRadius: 5,
    marginBottom: 15,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0'
  },
  progressBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f0f0'
  },
  progressBar: {
    height: '100%',
    borderRadius: 5
  },
  stepText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%'
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1
  },
  successContainer: {
    alignItems: 'center',
    marginTop: 20
  },
  successText: {
    fontSize: 20,
    color: '#50E3C2',
    fontWeight: 'bold',
    marginTop: 10
  }
});

export default WorkingWomenHostelScreen;