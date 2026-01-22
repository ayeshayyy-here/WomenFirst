import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
  SafeAreaView,
  Easing,
  Image,
  ToastAndroid,
  AppState
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon3 from 'react-native-vector-icons/MaterialCommunityIcons';
import syncStorage from 'react-native-sync-storage';
import Women from '../../assets/images/women.png';
import Wepx from '../../assets/images/wepx.png';
import Pitch from '../../assets/images/pitch.jpg';
import Ambassador from '../../assets/images/ambassador.jpg';
import SEHR_LOGO from '../../assets/images/SEHR_LOGO.png';
import Hostel from '../../assets/images/hostel.png';
import FloatingButton from '../components/FloatingButton';
import notifee, { AndroidImportance } from '@notifee/react-native';
import NotificationsScreen from '../components/NotificationsScreen';


const { width, height } = Dimensions.get('window');

const DashboardWDD = ({ navigation, notifications }) => {
  const [userName, setUserName] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const spinValue = new Animated.Value(0);
  const headerScrollY = new Animated.Value(0);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Start animations
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const storedProfile = syncStorage.get('user_profile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          const name = profile.name;
          setUserName(name);
          
      // Start 5 seconds after component mounts
        }
      } catch (error) {
        console.error('Error retrieving user details:', error);
      }
    };

    fetchUserData();



    // Cleanup on component unmount
    return () => {
     
      // Don't stop monitoring completely as it should work in background
      // notificationService.stopMonitoring();
    };
  }, []);
  const projects = [
    { 
      title: "Working Women Hostel", 
     image: Hostel,
      screen: "WorkingWomenHostelScreen",
      colors: ['#ffffff', '#ffffff'],
      shadow: '#5c6bc0'
    },
   
    { 
      title: "WEPX", 
      image: Wepx,
      // image: {uri: 'https://cmp.punjab.gov.pk/img/wepx.jpg'},
      screen: "WomenEntrepreneurshipRegistrationScreen",
      colors: ['#ffffff', '#ffffff'],
      shadow: '#ab47bc'
    },
    { 
      title: "Female Ambassador Program", 
      image: Ambassador,
      // screen: "AmbassadorTrackingScreen",
      screen: "AmbassadorHomeScreen",
      colors: ['#ffffff', '#ffffff'],
      shadow: '#ec407a'
    },
    { 
      title: "Youth Pitch", 
      image: Pitch, 
      screen: "YPCHomeScreen",
      colors: ['#ffffff', '#ffffff'],
      shadow: '#42a5f5'
    },
      { 
      title: "SEHR", 
      image: SEHR_LOGO,
      screen: "SEHRHomeScreen",
      colors: ['#ffffff', '#ffffff'],
      shadow: '#ef5350'
    },
    { 
      title: "Day Care", 
      icon: <Icon3 name="baby-carriage" size={28} color="#7e57c2" />,
      screen: "DayCareScreen",
      colors: ['#ffffff', '#ffffff'],
      shadow: '#7e57c2'
    },
   
    { 
      title: "Empowerment", 
      icon: <Icon3 name="account-cash" size={28} color="#26a69a" />,
      screen: "ProjectDateScreen",
      colors: ['#ffffff', '#ffffff'],
      shadow: '#26a69a'
    },
   
    { 
      title: "Skill Dev", 
      icon: <Icon3 name="tools" size={28} color="#66bb6a" />,
      screen: "SkillDevelopmentScreen",
      colors: ['#ffffff', '#ffffff'],
      shadow: '#66bb6a'
    }
  ];

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();

    const fetchUserData = async () => {
      try {
        const storedProfile = syncStorage.get('user_profile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          const name = profile.name
          setUserName(name);
        }
      } catch (error) {
        console.error('Error retrieving user details:', error);
      }
    };

    fetchUserData();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const headerHeight = headerScrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [240, 140],
    extrapolate: 'clamp'
  });

  const headerOpacity = headerScrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp'
  });

  const headerTitleScale = headerScrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp'
  });

  const headerTitleTranslateY = headerScrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -10],
    extrapolate: 'clamp'
  });

 const handleProjectPress = (project) => {
    // Check if the project is WEPX or Women Hostel
    if (project.title === "WEPX" || project.title === "Working Women Hostel" || project.title === "Female Ambassador Program" || project.title === "Youth Pitch" || project.title === "SEHR") {
      navigation.navigate(project.screen);
    } else {
      // Show "Coming Soon" toast for all other projects
      ToastAndroid.show('Coming Soon', ToastAndroid.SHORT);
    }
  };

  const renderProjectCard = (project, index) => (
    <TouchableOpacity 
      key={index}
      onPress={() => handleProjectPress(project)}
      activeOpacity={0.8}
      style={styles.projectCardContainer}
    >
      <View style={[
        styles.projectCard,
        { shadowColor: project.shadow }
      ]}>
        <View style={styles.projectIconContainer}>
          {project.icon ? project.icon : (
            <Image 
              source={project.image} 
              style={styles.projectImage}
              resizeMode="contain"
            />
          )}
        </View>
        <Text style={styles.projectTitle}>
          {project.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        scrollEventThrottle={16}
       
      >
        {/* Animated Header Section */}
        <Animated.View style={[styles.header, { height: headerHeight }]}>
          <LinearGradient
            colors={['#8e44ad', '#9b59b6']}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={[
              styles.headerContent,
              { 
                opacity: headerOpacity,
                transform: [
                  { scale: headerTitleScale },
                  { translateY: headerTitleTranslateY }
                ]
              }
            ]}>
              <Text style={styles.headerTitle}>Women Development Department</Text>
              <Text style={styles.headerSubtitle}>Government Of The Punjab</Text>
            </Animated.View>
            
            <View style={styles.profileHeader}>
              <TouchableOpacity style={styles.profileContainer}>
                <Animated.View style={[styles.profilePlaceholder, { transform: [{ rotate: spin }] }]}>
                   <LinearGradient
                    colors={['#7e57c2', '#b39ddb']}
                    style={styles.profileGradient}
                  >
                    <Icon name="person" size={20} color="#ffffff" />
                  </LinearGradient>
                </Animated.View>
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeText}>Welcome,</Text>
                  <Text style={styles.userName}>{userName || 'User'}</Text>
                 
                </View>
              </TouchableOpacity>
           
              {/* Enhanced Notification Button */}
              <View style={styles.notificationContainer}>
          
<TouchableOpacity 
  style={[
    styles.notificationButton,
    isMonitoring && styles.monitoringActive
  ]}
  onPress={() => navigation.navigate('NotificationsScreen')}
      >

  <Icon 
    name="notifications" 
    size={24} 
    color={isMonitoring ? "#4CAF50" : "#ffffff"} 
  />

</TouchableOpacity>
                <Text style={styles.notificationHint}>
             
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Projects Grid */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Initiatives</Text>
            <Text style={styles.sectionSubtitle}>Empowering women through various programs</Text>
          </View>
          <View style={styles.projectsGrid}>
            {projects.map((project, index) => renderProjectCard(project, index))}
          </View>
 <View style={styles.statsContainer}>
        
            
          
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Program Statistics</Text>
              <Text style={styles.sectionSubtitle}>Impactful numbers from our initiatives</Text>
            </View>
            <View style={styles.statsRow}>
              <LinearGradient 
                colors={['#8e44ad', '#9b59b6']} 
                style={styles.statCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>1,250+</Text>
                  <Text style={styles.statLabel}>Women Empowered</Text>
                </View>
                <Icon3 name="account-heart" size={24} color="rgba(255,255,255,0.3)" style={styles.statIcon} />
              </LinearGradient>
              <LinearGradient 
                colors={['#3498db', '#2980b9']} 
                style={styles.statCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>17</Text>
                  <Text style={styles.statLabel}>Hostels</Text>
                </View>
                <Icon3 name="home-group" size={24} color="rgba(255,255,255,0.3)" style={styles.statIcon} />
              </LinearGradient>
            </View>
            <View style={styles.statsRow}>
              <LinearGradient 
                colors={['#2ecc71', '#27ae60']} 
                style={styles.statCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>320</Text>
                  <Text style={styles.statLabel}>Day Cares</Text>
                </View>
                <Icon3 name="baby-face" size={24} color="rgba(255,255,255,0.3)" style={styles.statIcon} />
              </LinearGradient>
              <LinearGradient 
                colors={['#e74c3c', '#c0392b']} 
                style={styles.statCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>5,000+</Text>
                  <Text style={styles.statLabel}>Trained</Text>
                </View>
                <Icon3 name="school" size={24} color="rgba(255,255,255,0.3)" style={styles.statIcon} />
              </LinearGradient>
            </View>
          </View>
        </View>
       
      </ScrollView>

      {/* Enhanced Footer with Logos */}
      <View style={styles.footer}>
        <LinearGradient
          colors={['#8e44ad', '#9b59b6', '#8e44ad']}
          style={styles.footerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://cmp.punjab.gov.pk/img/maryam.png' }} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.footerText}>Empowering Women in Punjab</Text>
            <Image 
              source={Women}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </View>
       <FloatingButton/> 
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#9b59b6'
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  header: {
    width: '100%',
    paddingBottom: 20,
    marginBottom: 10,
    overflow: 'hidden',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerGradient: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    justifyContent: 'space-between',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 15,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeContainer: {
    marginLeft: 15,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontFamily: 'Roboto-Medium',
    letterSpacing: 0.5,
  },
  userName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    fontFamily: 'Roboto-Bold',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  notificationButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 12,
    borderRadius: 20,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff1744',
  },
  profilePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'Roboto-Black',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Roboto-Medium',
    letterSpacing: 0.3,
  },
  contentContainer: {
    padding: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: '#ffffff',
    marginTop: -30,
    overflow: 'hidden',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#2c3e50',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    color: '#7f8c8d',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Roboto-Medium',
    marginTop: 4,
  },
  projectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  projectCardContainer: {
    width: '48%',
    marginBottom: 16,
  },
  projectCard: {
    height: 140,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(245,245,245,0.9)',
  },
  projectImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Roboto-Condensed-Bolds',
    letterSpacing: 0.5,
    color: '#707a84ff',
    textAlign: 'center',
  },
  statsContainer: {
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  statCard: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
    height: 100,
  },
  statContent: {
    flex: 1,
    justifyContent: 'center',
  },
  statIcon: {
    position: 'absolute',
    right: 15,
    bottom: 15,
  },
  statNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'Roboto-Black',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Roboto-Medium',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  footerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
 
  },
  logo: {
    width: 60,
    height: 60,
  },
  footerText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Roboto-Bold',
    letterSpacing: 0.5,
  },
notificationContainer: {
    alignItems: 'center',
  },
  monitoringActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  monitoringDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  notificationHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 12,
  },
  monitoringStatus: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  monitoringToggle: {
    borderRadius: 16,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  monitoringToggleActive: {
    shadowColor: '#4CAF50',
  },
  monitoringGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
  },
  monitoringTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  monitoringToggleText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Roboto-Bold',
    marginBottom: 4,
  },
  monitoringToggleSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Roboto-Medium',
  },
});

export default DashboardWDD;