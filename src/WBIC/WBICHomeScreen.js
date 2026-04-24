// HomeScreen.js - Enhanced Version with Logo Header and Fixed Progress Footer
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Image,
  Animated,
  RefreshControl,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import SyncStorage from 'react-native-sync-storage';
import { useFocusEffect } from '@react-navigation/native';

// Import the logo
import WBIC_LOGO from '../../assets/images/WBIC_LOGO.png';

const { width, height } = Dimensions.get('window');

// Enhanced Color Scheme - More vibrant and modern
const COLORS = {
  primary: '#932479',
  primaryDark: '#c0478d',
  primaryLight: '#c644b2',
  primarySoft: '#F0ECFF',
  primaryGradient: ['#6d1d51', '#bd38a4', '#d348c1'],
  secondary: '#FF6B4E',
  secondaryGradient: ['#491d14', '#FF8C42'],
  success: '#00C48C',
  successLight: '#E0F9F0',
  warning: '#FFB946',
  warningLight: '#FFF4E5',
  error: '#FF4D4F',
  errorLight: '#FFE5E5',
  text: '#1A1A2E',
  textLight: '#6C6C8A',
  textLighter: '#B8B8D0',
  border: '#E8ECF0',
  background: '#F8F9FE',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  shadow: '#1A1A2E',
  stepCompleted: '#d861dc',
  stepIncomplete: '#E8ECF0',
  stepCurrent: '#FFB946',
  darkOverlay: 'rgba(0,0,0,0.3)',
};

const API_BASE_URL = 'https://wbic-wdd.punjab.gov.pk/api/v1';

const WBICHomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState(null);
  const [cnic, setCnic] = useState(null);
  const [userName, setUserName] = useState('');
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.95)).current;

  useFocusEffect(
    React.useCallback(() => {
      checkUserStatus();
      return () => {};
    }, [])
  );

  useEffect(() => {
    if (registrationStatus) {
      // Animate in content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(headerScale, {
          toValue: 1,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Animate progress bar
      const progressValue = getProgressPercentage() / 100;
      Animated.timing(progressAnim, {
        toValue: progressValue,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [registrationStatus]);

  const getCnicFromStorage = async () => {
    try {
      const storedProfile = await SyncStorage.get('user_profile');
      if (storedProfile) {
        let profile = typeof storedProfile === 'string' ? JSON.parse(storedProfile) : storedProfile;
        if (profile && profile.cnic) {
          const cleanCnic = profile.cnic.replace(/-/g, '');
          setCnic(cleanCnic);
          setUserName(profile.name || '');
          return cleanCnic;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting CNIC:', error);
      return null;
    }
  };

  const checkRegistrationStatus = async (cnicNumber) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/registration/status`, { 
        cnic: cnicNumber 
      });
      
      if (response.data.success) {
        setRegistrationStatus(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error('Error checking status:', error);
      if (error.response?.status === 404) {
        setRegistrationStatus({
          step1_completed: false,
          step2_completed: false,
          step3_completed: false,
          registration_completed: false,
          current_step: 1,
          next_step: 1,
          status: 'not_started',
          status_text: 'Registration not started'
        });
      }
      return null;
    }
  };

  const checkUserStatus = async () => {
    setLoading(true);
    const userCnic = await getCnicFromStorage();
    if (userCnic) {
      await checkRegistrationStatus(userCnic);
    } else {
      setRegistrationStatus({
        step1_completed: false,
        step2_completed: false,
        step3_completed: false,
        registration_completed: false,
        current_step: 1,
        next_step: 1,
        status: 'not_started',
        status_text: 'Registration not started'
      });
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await checkUserStatus();
    setRefreshing(false);
  };

  const getProgressPercentage = () => {
    if (!registrationStatus) return 0;
    const { step1_completed, step2_completed, step3_completed, registration_completed } = registrationStatus;
    
    if (registration_completed) return 100;
    if (step1_completed && step2_completed && step3_completed) return 100;
    if (step1_completed && step2_completed) return 66;
    if (step1_completed) return 33;
    return 0;
  };

  const getCurrentStepText = () => {
    if (!registrationStatus) return '';
    const { step1_completed, step2_completed, step3_completed, registration_completed, status_text } = registrationStatus;
    
    if (registration_completed) return 'Registration Complete! 🎉';
    if (step1_completed && step2_completed && !step3_completed) return 'Step 3: Learning Needs Assessment';
    if (step1_completed && !step2_completed) return 'Step 2: Business Information';
    if (!step1_completed) return 'Step 1: Personal Information';
    return status_text;
  };

  const getActionButton = () => {
    if (!registrationStatus) return null;
    
    const { step1_completed, step2_completed, step3_completed, registration_completed, current_step } = registrationStatus;
    
    if (registration_completed) {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('WBICProfile')}
          activeOpacity={0.9}
        >
          <LinearGradient colors={COLORS.primaryGradient} style={styles.actionButtonGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <Icon name="visibility" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>View Profile</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    
    if (!step1_completed) {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Step1Form')}
          activeOpacity={0.9}
        >
          <LinearGradient colors={COLORS.primaryGradient} style={styles.actionButtonGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <Icon name="app-registration" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Start Registration</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    
    if (step1_completed && !step2_completed) {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Step2Form')}
          activeOpacity={0.9}
        >
          <LinearGradient colors={COLORS.primaryGradient} style={styles.actionButtonGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <Icon name="business-center" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Complete Registration</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    
    if (step1_completed && step2_completed && !step3_completed) {
      return (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Step3Form')}
          activeOpacity={0.9}
        >
          <LinearGradient colors={COLORS.primaryGradient} style={styles.actionButtonGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <Icon name="school" size={24} color={COLORS.white} />
            <Text style={styles.actionButtonText}>Complete Assessment</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    
    return null;
  };

  const renderStepIcon = (stepNumber, isCompleted, isCurrent) => {
    if (isCompleted) {
      return (
        <LinearGradient colors={COLORS.primaryGradient} style={styles.stepIconCompleted} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          <Icon name="check" size={20} color={COLORS.white} />
        </LinearGradient>
      );
    }
    
    if (isCurrent) {
      return (
        <LinearGradient colors={['#FFB946', '#FF8C00']} style={styles.stepIconCurrent} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          <Text style={styles.stepIconText}>{stepNumber}</Text>
        </LinearGradient>
      );
    }
    
    return (
      <View style={styles.stepIconIncomplete}>
        <Text style={styles.stepIconTextIncomplete}>{stepNumber}</Text>
      </View>
    );
  };

  const renderProgressSteps = () => {
    if (!registrationStatus) return null;
    
    const { step1_completed, step2_completed, step3_completed, registration_completed, current_step } = registrationStatus;
    
    return (
      <View style={styles.progressStepsContainer}>
        <View style={styles.stepsRow}>
          <View style={styles.stepItem}>
            {renderStepIcon(1, step1_completed, current_step === 1 && !registration_completed)}
            <Text style={[
              styles.stepLabel,
              step1_completed && styles.stepLabelCompleted,
              current_step === 1 && !registration_completed && styles.stepLabelCurrent
            ]}>
              Personal
            </Text>
          </View>
          
          <View style={[styles.stepLine, step1_completed && styles.stepLineActive]} />
          
          <View style={styles.stepItem}>
            {renderStepIcon(2, step2_completed, current_step === 2 && !registration_completed)}
            <Text style={[
              styles.stepLabel,
              step2_completed && styles.stepLabelCompleted,
              current_step === 2 && !registration_completed && styles.stepLabelCurrent
            ]}>
              Business
            </Text>
          </View>
          
          <View style={[styles.stepLine, step2_completed && styles.stepLineActive]} />
          
          <View style={styles.stepItem}>
            {renderStepIcon(3, step3_completed, current_step === 3 && !registration_completed)}
            <Text style={[
              styles.stepLabel,
              step3_completed && styles.stepLabelCompleted,
              current_step === 3 && !registration_completed && styles.stepLabelCurrent
            ]}>
              Learning
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Header Component with Logo
  const renderHeader = () => {
    return (
      <Animated.View style={[styles.header, { transform: [{ scale: headerScale }] }]}>
        <LinearGradient colors={COLORS.primaryGradient} style={styles.headerGradient} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
          <View style={styles.headerContent}>
            <Image source={WBIC_LOGO} style={styles.headerLogo} resizeMode="contain" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>EMPOWERING WOMEN</Text>
              <Text style={styles.headerSubtitle}>BUILDING FUTURE</Text>
            </View>
          </View>
          <Text style={styles.headerTagline}>Join the largest network of women entrepreneurs in Punjab.</Text>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderWelcomeCard = () => {
    const progressPercentage = getProgressPercentage();
    const currentStepText = getCurrentStepText();
    
    return (
      <LinearGradient colors={COLORS.primaryGradient} style={styles.welcomeCard} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeHeader}>
            <View style={styles.welcomeIcon}>
              <Icon name="emoji-emotions" size={32} color={COLORS.primary} />
            </View>
            <View style={styles.welcomeTextContainer}>
           
              <Text style={styles.welcomeName}>{userName || 'Entrepreneur'}</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Registration Progress</Text>
              <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
            </View>
            
            <View style={styles.progressBarBackground}>
              <Animated.View 
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
            
            <Text style={styles.currentStepText}>{currentStepText}</Text>
          </View>
          
          {renderProgressSteps()}
        </View>
      </LinearGradient>
    );
  };

  const renderStatsCard = () => {
    if (!registrationStatus) return null;
    
    const stats = [
      { label: 'Step 1', completed: registrationStatus.step1_completed, icon: 'person' },
      { label: 'Step 2', completed: registrationStatus.step2_completed, icon: 'business' },
      { label: 'Step 3', completed: registrationStatus.step3_completed, icon: 'school' },
    ];
    
    return (
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Registration Status</Text>
        <View style={styles.statsRow}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statItem}>
              <View style={[styles.statIcon, stat.completed && styles.statIconCompleted]}>
                <Icon name={stat.icon} size={20} color={stat.completed ? COLORS.white : COLORS.textLight} />
              </View>
              <Text style={[styles.statLabel, stat.completed && styles.statLabelCompleted]}>{stat.label}</Text>
              <Text style={[styles.statStatus, stat.completed && styles.statStatusCompleted]}>
                {stat.completed ? 'Completed' : 'Pending'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderAboutUs = () => {
    return (
      <View style={styles.aboutSection}>
        <LinearGradient colors={['#FFFFFF', '#F8F9FE']} style={styles.aboutCard}>
          <Text style={styles.sectionTitle}>ABOUT US</Text>
          <Text style={styles.aboutDescription}>
            The Women Business Incubation Center (WBIC) Punjab is a pioneering initiative dedicated to fostering women entrepreneurship across the province. We provide comprehensive support to help women transform their business ideas into successful ventures.
          </Text>
          <Text style={styles.aboutDescription}>
            Our ecosystem includes mentorship, training, funding access, networking opportunities, and state-of-the-art facilities designed specifically for women entrepreneurs.
          </Text>
          <Text style={styles.aboutDescription}>
            With centers in major cities across Punjab, we're building a community where women can collaborate, innovate, and drive economic growth.
          </Text>
          
          <View style={styles.statsRowContainer}>
            <View style={styles.statBox}>
              <LinearGradient colors={COLORS.primaryGradient} style={styles.statBoxGradient}>
                <Text style={styles.statBoxNumber}>85%</Text>
                <Text style={styles.statBoxLabel}>Success Rate</Text>
              </LinearGradient>
            </View>
            <View style={styles.statBox}>
              <LinearGradient colors={COLORS.secondaryGradient} style={styles.statBoxGradient}>
                <Text style={styles.statBoxNumber}>92%</Text>
                <Text style={styles.statBoxLabel}>Resource Access</Text>
              </LinearGradient>
            </View>
            <View style={styles.statBox}>
              <LinearGradient colors={COLORS.primaryGradient} style={styles.statBoxGradient}>
                <Text style={styles.statBoxNumber}>78%</Text>
                <Text style={styles.statBoxLabel}>Capacity Growth</Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderMissionVision = () => {
    return (
      <View style={styles.missionVisionSection}>
        <Text style={styles.sectionTitle}>Our Mission & Vision</Text>
        <Text style={styles.missionVisionSubtitle}>
          Building an inclusive and future-ready ecosystem that empowers women entrepreneurs across Punjab
        </Text>
        
        <View style={styles.missionCard}>
          <LinearGradient colors={['#6B4EFF10', '#6B4EFF05']} style={styles.missionInner}>
            <View style={styles.missionIcon}>
              <Icon name="flag" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.missionTitle}>Our Mission</Text>
            <Text style={styles.missionText}>
              • Provide comprehensive business incubation services tailored for women.
              {'\n'}• Foster innovation and entrepreneurship through mentorship and training.
              {'\n'}• Create networking opportunities with industry leaders and investors.
              {'\n'}• Offer access to funding, resources, and market linkages.
            </Text>
          </LinearGradient>
        </View>
        
        <View style={styles.visionCard}>
          <LinearGradient colors={['#FF6B4E10', '#FF6B4E05']} style={styles.missionInner}>
            <View style={[styles.missionIcon, { backgroundColor: '#FF6B4E20' }]}>
              <Icon name="visibility" size={28} color={COLORS.secondary} />
            </View>
            <Text style={[styles.missionTitle, { color: COLORS.secondary }]}>Our Vision</Text>
            <Text style={styles.missionText}>
              To build a vibrant and inclusive ecosystem across Punjab where women entrepreneurs are empowered to launch, grow and scale high-impact businesses that shape the future of Pakistan's economy.
            </Text>
            <Text style={[styles.missionText, { marginTop: 12 }]}>
              We envision a Punjab where women-led businesses thrive across all sectors, contributing significantly to economic growth, job creation, and social development.
            </Text>
          </LinearGradient>
        </View>
      </View>
    );
  };

  const renderServicesSection = () => {
    const services = [
      { icon: 'analytics', title: 'Learning Need Assessment', color: '#6B4EFF', bgColor: '#F0ECFF' },
      { icon: 'app-registration', title: 'Registration', color: '#00C48C', bgColor: '#E0F9F0' },
      { icon: 'menu-book', title: 'LMS Portal', color: '#FFB946', bgColor: '#FFF4E5' },
      { icon: 'people', title: 'Mentorship', color: '#FF4D4F', bgColor: '#FFE5E5' },
      { icon: 'groups', title: 'Alumni Network', color: '#6B4EFF', bgColor: '#F0ECFF' },
      { icon: 'attach-money', title: 'Funding Support', color: '#00C48C', bgColor: '#E0F9F0' },
    ];
    
    return (
      <View style={styles.servicesSection}>
        <Text style={styles.sectionTitle}>Our Programs & Services</Text>
        <Text style={styles.sectionSubtitle}>
          Providing comprehensive, end-to-end support for women at every stage of their entrepreneurial journey
        </Text>
        
        <View style={styles.servicesGrid}>
          {services.map((service, index) => (
            <TouchableOpacity key={index} style={styles.serviceCard} activeOpacity={0.8}>
              <View style={[styles.serviceIconContainer, { backgroundColor: service.bgColor }]}>
                <Icon name={service.icon} size={24} color={service.color} />
              </View>
              <Text style={styles.serviceTitle}>{service.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderCentersSection = () => {
    const centers = [
      { name: 'Lahore Center', description: 'Our flagship center in the heart of Punjab, offering state-of-the-art facilities and access to a vibrant business ecosystem.' },
      { name: 'Faisalabad Center', description: 'Located in the textile hub of Pakistan, this center focuses on supporting women in manufacturing and export businesses.' },
      { name: 'Rawalpindi Center', description: 'Connecting women entrepreneurs with opportunities in the federal capital region and defense industries.' },
      { name: 'Bahawalpur Center', description: 'Transparency That Builds Trust. Expanding opportunities in South Punjab.' },
    ];
    
    return (
      <View style={styles.centersSection}>
        <Text style={styles.sectionTitle}>EXPANDING WOMEN'S OPPORTUNITIES</Text>
        <Text style={styles.sectionSubtitle}>
          Our Centers Across Punjab
        </Text>
        <Text style={styles.centersSubtitle}>
          Bringing entrepreneurial opportunities to women across the province...
        </Text>
        
        {centers.map((center, index) => (
          <View key={index} style={styles.centerCard}>
            <View style={styles.centerHeader}>
              <LinearGradient colors={COLORS.primaryGradient} style={styles.centerIcon} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                <Icon name="location-on" size={20} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.centerName}>{center.name}</Text>
            </View>
            <Text style={styles.centerDescription}>{center.description}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F9FAFC', '#FFFFFF']} style={styles.loadingContainer} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}>
          {renderHeader()}
         
          {renderAboutUs()}
          {renderMissionVision()}
          {renderServicesSection()}
          {renderCentersSection()}
           {renderWelcomeCard()}
        
          {/* Extra bottom padding to prevent footer overlap */}
          <View style={{ height: 100 }} />
        </Animated.View>
      </ScrollView>
      
      {/* Sticky Footer with Progress Bar and Action Button */}
      <View style={styles.footer}>
        <LinearGradient colors={['#FFFFFF', '#F8F9FE']} style={styles.footerGradient}>
          <View style={styles.footerProgressContainer}>
            <View style={styles.footerProgressHeader}>
              <Text style={styles.footerProgressTitle}>Registration Progress</Text>
              <Text style={styles.footerProgressPercent}>{getProgressPercentage()}%</Text>
            </View>
            <View style={styles.footerProgressBarBackground}>
              <Animated.View 
                style={[
                  styles.footerProgressBarFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]}
              />
            </View>
            <Text style={styles.footerCurrentStep}>{getCurrentStepText()}</Text>
          </View>
          <View style={styles.footerContent}>
            {getActionButton()}
          </View>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Header Styles
  header: {
    marginHorizontal: 16,
    marginTop: 30,
    marginBottom: 8,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLogo: {
    width: 80,
    height: 80,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: COLORS.white,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  headerTagline: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.85,
    fontStyle: 'italic',
    marginTop: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Welcome Card
  welcomeCard: {
    margin: 16,
   
    marginBottom: 80,
    borderRadius: 24,
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  welcomeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Progress Container
  progressContainer: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.stepIncomplete,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  currentStepText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Progress Steps
  progressStepsContainer: {
    marginTop: 8,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepIconCompleted: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepIconCurrent: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepIconIncomplete: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.stepIncomplete,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepIconText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  stepIconTextIncomplete: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textLighter,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  stepLabel: {
    fontSize: 10,
    color: COLORS.textLighter,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  stepLabelCompleted: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  stepLabelCurrent: {
    color: COLORS.warning,
    fontWeight: '600',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.stepIncomplete,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  
  // Stats Card
  statsCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIconCompleted: {
    backgroundColor: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statLabelCompleted: {
    color: COLORS.primary,
  },
  statStatus: {
    fontSize: 10,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statStatusCompleted: {
    color: COLORS.success,
    fontWeight: '600',
  },
  
  // About Section
  aboutSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  aboutCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aboutDescription: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statsRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statBoxGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  statBoxNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statBoxLabel: {
    fontSize: 10,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Mission & Vision Section
  missionVisionSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  missionVisionSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  missionCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  visionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  missionInner: {
    padding: 20,
  },
  missionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6B4EFF20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  missionText: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Services Section
  servicesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceCard: {
    width: (width - 40) / 2,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Centers Section
  centersSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  centersSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  centerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  centerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  centerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  centerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  centerDescription: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 18,
    marginLeft: 42,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Footer - Fixed with Progress Bar
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 15,
  },
  footerGradient: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  footerProgressContainer: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  footerProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  footerProgressTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  footerProgressPercent: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  footerProgressBarBackground: {
    height: 6,
    backgroundColor: COLORS.stepIncomplete,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  footerProgressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  footerCurrentStep: {
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  footerContent: {},
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});

export default WBICHomeScreen;