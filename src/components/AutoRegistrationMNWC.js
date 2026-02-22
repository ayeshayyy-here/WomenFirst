// components/AutoRegistration.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
  Clipboard,
  Alert,
  Platform,
} from 'react-native';
import SyncStorage from 'react-native-sync-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'https://regions-jade-beatles-sessions.trycloudflare.com/api';

const COLORS = {
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  primaryDark: '#1d4ed8',
  primaryGradient: ['#2563eb', '#1e4fd9', '#1d4ed8'],
  primarySoft: '#eff6ff',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  white: '#ffffff',
  black: '#1e293b',
  text: '#334155',
  textLight: '#64748b',
  border: '#e2e8f0',
  overlay: 'rgba(0,0,0,0.5)',
};

const AutoRegistrationMNWC = ({ 
  children, 
  onUserReady, 
  showCredentialsModal = true,
  autoCloseDelay = 5000 
}) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (showModal) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ),
      ]).start();

      // Auto close modal after delay
      if (autoCloseDelay > 0) {
        const timer = setTimeout(() => {
          setShowModal(false);
        }, autoCloseDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [showModal, fadeAnim, scaleAnim, slideAnim, rotateAnim, autoCloseDelay]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const initializeUser = async () => {
    try {
      setLoading(true);
      
      // Get user data from SyncStorage
      const userProfile = await SyncStorage.get('user_profile');
      
      if (!userProfile) {
        console.log('No user profile found in SyncStorage');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userProfile);
      console.log('User profile loaded:', userData);

      // Check if user exists in backend
      const userExists = await checkUserExists(userData.cnic);
      
      if (userExists) {
        // User exists, use existing user
        setUser(userExists);
        setIsNewUser(false);
        setModalData({
          type: 'existing',
          name: userData.name,
          email: userData.email,
          phone: userData.contact,
          cnic: userData.cnic,
          password: userData.contact, // Phone number is password
        });
        
        if (onUserReady) {
          onUserReady(userExists);
        }
      } else {
        // Register new user
        const newUser = await registerUser(userData);
        setUser(newUser);
        setIsNewUser(true);
        setModalData({
          type: 'new',
          name: userData.name,
          email: userData.email,
          phone: userData.contact,
          cnic: userData.cnic,
          password: userData.contact, // Phone number as password
        });
        
        if (onUserReady) {
          onUserReady(newUser);
        }
      }

      // Show credentials modal if enabled
      if (showCredentialsModal) {
        setShowModal(true);
      }

    } catch (error) {
      console.error('Auto-registration error:', error);
      Alert.alert(
        'Error',
        'Failed to initialize user. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const checkUserExists = async (cnic) => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ cnic }),
      });

      const data = await response.json();

      if (response.ok && data.exists) {
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Error checking user:', error);
      return null;
    }
  };

  const registerUser = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          cnic: userData.cnic,
          phone: userData.contact,
          password: userData.contact, // Phone number as password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data.user;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', 'Copied to clipboard');
  };

  const renderModal = () => {
    if (!modalData) return null;

    const isExisting = modalData.type === 'existing';

    return (
      <Modal
        visible={showModal}
        transparent
        animationType="none"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim }
                ],
              },
            ]}
          >
            {/* Success Icon */}
            <Animated.View style={[styles.successIcon, { transform: [{ rotate }] }]}>
              <LinearGradient
                colors={isExisting ? COLORS.primaryGradient : ['#10b981', '#059669']}
                style={styles.iconGradient}
              >
                <Icon 
                  name={isExisting ? 'account-check' : 'account-plus'} 
                  size={40} 
                  color="#fff" 
                />
              </LinearGradient>
            </Animated.View>

            {/* Title */}
            <Text style={styles.modalTitle}>
              {isExisting ? 'Welcome Back!' : 'Account Created!'}
            </Text>

            {/* Message */}
            <Text style={styles.modalMessage}>
              {isExisting 
                ? 'Your credentials have been found in our system.'
                : 'Your account has been automatically created.'}
            </Text>

            {/* Website Info */}
            <View style={styles.websiteInfo}>
              <Icon name="web" size={16} color={COLORS.primary} />
              <Text style={styles.websiteText}>
                mnwc-wdd.punjab.gov.pk
              </Text>
            </View>

            {/* Credentials Card */}
            <LinearGradient
              colors={['#f8fafc', '#f1f5f9']}
              style={styles.credentialsCard}
            >
              <View style={styles.credentialRow}>
                <View style={styles.credentialLabel}>
                  <Icon name="account" size={16} color={COLORS.primary} />
                  <Text style={styles.labelText}>Name:</Text>
                </View>
                <Text style={styles.credentialValue}>{modalData.name}</Text>
              </View>

              <View style={styles.credentialRow}>
                <View style={styles.credentialLabel}>
                  <Icon name="email" size={16} color={COLORS.primary} />
                  <Text style={styles.labelText}>Email:</Text>
                </View>
                <Text style={styles.credentialValue}>{modalData.email}</Text>
              </View>

              <View style={styles.credentialRow}>
                <View style={styles.credentialLabel}>
                  <Icon name="phone" size={16} color={COLORS.primary} />
                  <Text style={styles.labelText}>Phone:</Text>
                </View>
                <Text style={styles.credentialValue}>{modalData.phone}</Text>
              </View>

              <View style={styles.credentialRow}>
                <View style={styles.credentialLabel}>
                  <Icon name="card-account-details" size={16} color={COLORS.primary} />
                  <Text style={styles.labelText}>CNIC:</Text>
                </View>
                <Text style={styles.credentialValue}>{modalData.cnic}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.passwordRow}>
                <View style={styles.credentialLabel}>
                  <Icon name="lock" size={16} color={COLORS.primary} />
                  <Text style={styles.labelText}>Password:</Text>
                </View>
                <View style={styles.passwordValue}>
                  <Text style={styles.passwordText}>{modalData.password}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(modalData.password)}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={16} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Icon name="information" size={18} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {isExisting
                  ? 'You can use your existing credentials to log in to the website.'
                  : 'We have stored your phone number as password. You can use these credentials to log in to the website.'}
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.primaryGradient}
                style={styles.closeButtonGradient}
              >
                <Text style={styles.closeButtonText}>Got It</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Auto Close Indicator */}
            {autoCloseDelay > 0 && (
              <Text style={styles.autoCloseText}>
                This window will auto-close in {autoCloseDelay/1000} seconds
              </Text>
            )}
          </Animated.View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing user...</Text>
      </View>
    );
  }

  return (
    <>
      {children}
      {renderModal()}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: width - 40,
    maxWidth: 400,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  successIcon: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  websiteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    marginBottom: 20,
  },
  websiteText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  credentialsCard: {
    width: '100%',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  credentialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  credentialLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  credentialValue: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  passwordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyButton: {
    padding: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.infoLight,
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.info,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#0c4a6e',
    lineHeight: 18,
  },
  closeButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  closeButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  autoCloseText: {
    fontSize: 11,
    color: COLORS.textLighter,
    textAlign: 'center',
  },
});

export default AutoRegistrationMNWC;