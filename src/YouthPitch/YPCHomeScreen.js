import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import syncStorage from 'react-native-sync-storage';

const YPCHomeScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ypcData, setYpcData] = useState(null);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  
  const API_BASE_URL = 'https://ypc-wdd.punjab.gov.pk/api';

  useEffect(() => {
    loadUserProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchYPCData();
    }, [])
  );

  const loadUserProfile = () => {
    try {
      const profile = syncStorage.get('user_profile');
      if (profile) {
        setUserProfile(JSON.parse(profile));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const fetchYPCData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userProfile = syncStorage.get('user_profile');
      if (!userProfile) {
        setError('User profile not found. Please login again.');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userProfile);
      const cnic = userData.cnic;

      if (!cnic) {
        setError('CNIC not found in profile.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/registration/${cnic}`,
        {
          headers: { 'Accept': 'application/json' },
          timeout: 15000,
        }
      );

      if (response.data.success && response.data.data) {
        setYpcData(response.data.data);
      } else {
        setYpcData(null);
      }
    } catch (error) {
      console.error('Error fetching YPC data:', error);
      if (error.response?.status === 404) {
        setYpcData(null);
      } else {
        setError('Failed to load data. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchYPCData();
  };

  const handleApplyNow = () => {
    navigation.navigate('YouthPitchRegistrationScreen');
  };

  const handleTrackApplication = () => {
    navigation.navigate('ProfileTrackingScreenYPC');
  };

  const openWebsite = () => {
    Linking.openURL('https://wdd.punjab.gov.pk');
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#cf69e1" />
          <Text style={styles.loadingText}>Checking your YPC application status...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#FF5252']}
            style={styles.errorGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name="alert-circle-outline" size={60} color="white" />
            <Text style={styles.errorTitle}>Error Loading Data</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchYPCData}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }

    // No data found - Apply for the program
    if (!ypcData) {
      return (
        <View style={styles.statusCard}>
          <LinearGradient
            colors={['#2d1032', '#7B1FA2']}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statusHeader}>
              <Icon name="rocket-launch" size={20} color="white" />
              <Text style={styles.statusTitle}>Welcome to Youth Pitch Challenge! 🚀</Text>
            </View>
            
            <Text style={styles.statusMessage}>
              Transform your innovative ideas into reality. Apply now for the Youth Pitch Challenge!
            </Text>
            <Text style={styles.statusUrdu}>
              اپنے اختراعی خیالات کو حقیقت میں بدلیں۔ یوتھ پچ چیلنج کے لیے ابھی درخواست دیں!
            </Text>

            <View style={styles.featuresContainer}>
              <FeatureItem
                icon="lightbulb-on"
                title="Innovation Platform"
                description="Showcase your startup ideas"
              />
              <FeatureItem
                icon="trophy"
                title="Competition"
                description="Compete with the best minds"
              />
              <FeatureItem
                icon="handshake"
                title="Networking"
                description="Connect with mentors & investors"
              />
            </View>

            <TouchableOpacity 
              style={[styles.actionButton, styles.applyButton]}
              onPress={handleApplyNow}
            >
              <Icon name="send" size={20} color="white" />
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }

    // Data exists - Show tracking and update options
    return (
      <View style={styles.statusCard}>
        <LinearGradient
          colors={['#252e25', '#480648']}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statusHeader}>
            <Icon name="check-circle" size={20} color="white" />
            <Text style={styles.statusTitle}>Application Submitted! ✅</Text>
          </View>
          
          <Text style={styles.statusMessage}>
            Your Youth Pitch Challenge application has been submitted successfully!
          </Text>
          <Text style={styles.statusUrdu}>
            آپ کی یوتھ پچ چیلنج درخواست کامیابی کے ساتھ جمع کرائی گئی ہے!
          </Text>

          <View style={styles.detailsContainer}>
            <DetailItem
              icon="file-document"
              label="Application ID"
              value={ypcData.id || 'N/A'}
            />
            <DetailItem
              icon="calendar-check"
              label="Submitted On"
              value={new Date(ypcData.created_at).toLocaleDateString()}
            />
            <DetailItem
              icon="update"
              label="Last Updated"
              value={new Date(ypcData.updated_at).toLocaleDateString()}
            />
            <DetailItem
              icon="clipboard-check"
              label="Status"
              value={ypcData.status || 'Under Review'}
            />
          </View>

          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.trackButton]}
              onPress={handleTrackApplication}
            >
              <Icon name="chart-timeline-variant" size={20} color="white" />
              <Text style={styles.trackButtonText}>Track Application</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.updateButton]}
              onPress={handleApplyNow}
            >
              <Icon name="pencil" size={20} color="#2E7D32" />
              <Text style={styles.updateButtonText}>Update Record</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const DetailItem = ({ icon, label, value, color = 'white' }) => (
    <View style={styles.detailItem}>
      <View style={[styles.detailIconContainer, { backgroundColor: `${color}20` }]}>
        <Icon name={icon} size={20} color={color} />
      </View>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, { color }]}>{value}</Text>
      </View>
    </View>
  );

  const FeatureItem = ({ icon, title, description }) => (
    <View style={styles.featureItem}>
      <View style={styles.featureIconContainer}>
        <Icon name={icon} size={20} color="#9C27B0" />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  const StatCard = ({ icon, number, label, gradientColors }) => (
    <TouchableOpacity style={styles.statCard}>
      <LinearGradient
        colors={gradientColors}
        style={styles.statGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Icon name={icon} size={20} color="white" />
        <Text style={styles.statNumber}>{number}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={{uri: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar backgroundColor="#200c22" barStyle="light-content" />
      <LinearGradient
        colors={['rgba(56, 48, 58, 0.9)', 'rgba(29, 4, 40, 0.9)']}
        style={styles.overlay}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4c3d4f']}
              tintColor="#352538"
            />
          }
        >
          {/* Header Section */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#443f46', '#230430']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.headerContent}>
                <View style={styles.headerIconContainer}>
                  <Icon name="lightning-bolt" size={20} color="white" />
                </View>
                <View>
                  <Text style={styles.headerTitle}>Youth Pitch Challenge</Text>
                  <Text style={styles.headerUrdu}>یوتھ پچ چیلنج</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>
                Empowering Young Entrepreneurs with Innovative Ideas
              </Text>
              <Icon name="dots-horizontal" size={100} color="rgba(255,255,255,0.1)" style={styles.headerPattern} />
            </LinearGradient>
          </View>

          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <LinearGradient
              colors={['rgba(231, 223, 223, 0.95)', 'rgba(218, 209, 209, 0.98)']}
              style={styles.welcomeGradient}
            >
              <View style={styles.welcomeContent}>
                <View style={styles.welcomeIconContainer}>
                  <Icon name="account-circle" size={20} color="#1a071e" />
                </View>
                <View style={styles.welcomeTextContainer}>
                  <Text style={styles.welcomeGreeting}>Hello Innovator!</Text>
                  <Text style={styles.welcomeName}>
                    {userProfile?.name || 'Youth Entrepreneur'}
                  </Text>
                  <Text style={styles.welcomeId}>
                    CNIC: {userProfile?.cnic ? `${userProfile.cnic.substring(0, 13)}` : 'N/A'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Main Content */}
          {renderContent()}

          {/* Stats Section */}
          {ypcData && (
            <View style={styles.statsSection}>
              <Text style={styles.statsTitle}>Your Application Stats</Text>
              <View style={styles.statsGrid}>
                <StatCard
                  icon="file-check"
                  number="Submitted"
                  label="Application"
                  gradientColors={['#4CAF50', '#2E7D32']}
                />
                <StatCard
                  icon="calendar-clock"
                  number={new Date(ypcData.created_at).getDate()}
                  label={new Date(ypcData.created_at).toLocaleDateString('en-US', { month: 'short' })}
                  gradientColors={['#2196F3', '#1976D2']}
                />
                <StatCard
                  icon="clock-outline"
                  number="Active"
                  label="Status"
                  gradientColors={['#FF9800', '#F57C00']}
                />
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => ypcData ? handleTrackApplication() : handleApplyNow()}
              >
                <LinearGradient
                  colors={ypcData ? ['#4CAF50', '#2E7D32'] : ['#9C27B0', '#7B1FA2']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon 
                    name={ypcData ? "chart-timeline-variant" : "send"} 
                    size={20} 
                    color="white" 
                  />
                  <Text style={styles.actionCardText}>
                    {ypcData ? 'Track' : 'Apply'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={handleApplyNow}
              >
                <LinearGradient
                  colors={['#2196F3', '#1976D2']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name="pencil" size={30} color="white" />
                  <Text style={styles.actionCardText}>
                    {ypcData ? 'Update' : 'Register'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('ProfileScreen')}
              >
                <LinearGradient
                  colors={['#FF9800', '#F57C00']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name="account-details" size={30} color="white" />
                  <Text style={styles.actionCardText}>Profile</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={openWebsite}
              >
                <LinearGradient
                  colors={['#607D8B', '#455A64']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Icon name="information" size={30} color="white" />
                  <Text style={styles.actionCardText}>Info</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Program Info */}
          <View style={styles.infoSection}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']}
              style={styles.infoCard}
            >
              <View style={styles.infoHeader}>
                <Icon name="trophy" size={20} color="#9C27B0" />
                <Text style={styles.infoTitle}>About Youth Pitch Challenge</Text>
              </View>
              <Text style={styles.infoText}>
                A platform for young entrepreneurs to showcase innovative ideas, 
                receive mentorship, and compete for funding opportunities to 
                transform their startups into successful businesses.
              </Text>
              <View style={styles.infoPoints}>
                <View style={styles.infoPoint}>
                  <Icon name="check-circle" size={18} color="#4CAF50" />
                  <Text style={styles.infoPointText}>Open to all university students</Text>
                </View>
                <View style={styles.infoPoint}>
                  <Icon name="check-circle" size={18} color="#4CAF50" />
                  <Text style={styles.infoPointText}>Multiple prize categories</Text>
                </View>
                <View style={styles.infoPoint}>
                  <Icon name="check-circle" size={18} color="#4CAF50" />
                  <Text style={styles.infoPointText}>Mentorship from industry experts</Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <LinearGradient
              colors={['rgba(100, 89, 103, 0.9)', 'rgba(73, 12, 99, 0.9)']}
              style={styles.footerGradient}
            >
              <TouchableOpacity onPress={openWebsite} style={styles.websiteButton}>
                <Icon name="web" size={20} color="white" />
                <Text style={styles.websiteLink}>wdd.punjab.gov.pk/YPC</Text>
              </TouchableOpacity>
              
              <Text style={styles.footerText}>
                Empowering Youth Entrepreneurship in Punjab
              </Text>
              
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="facebook" size={20} color="#1877F2" />
                  <Text style={styles.socialText}>Facebook</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="twitter" size={20} color="#1DA1F2" />
                  <Text style={styles.socialText}>Twitter</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton}>
                  <Icon name="email" size={20} color="#EA4335" />
                  <Text style={styles.socialText}>Email</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.copyright}>
                © Women Development Department, Government of Punjab
              </Text>
              <Text style={styles.poweredBy}>
                Youth Empowerment Initiative
              </Text>
            </LinearGradient>
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  headerGradient: {
    padding: 25,
    paddingTop: 60,
    paddingBottom: 25,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'serif',
  },
  headerUrdu: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  headerPattern: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    opacity: 0.3,
  },
  welcomeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  welcomeGradient: {
    padding: 20,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 12,
    color: '#666',
     fontWeight: 'bold',
  },
  welcomeName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2f0836',
  },
  welcomeId: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
     fontWeight: 'bold',
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  gradientCard: {
    padding: 25,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 15,
    flex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusMessage: {
    fontSize: 12,
    color: 'white',
    lineHeight: 24,
    marginBottom: 8,
    fontWeight: '500',
  },
  statusUrdu: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'right',
  },
  featuresContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  featureIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  detailsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  applyButton: {
    backgroundColor: '#9C27B0',
  },
  trackButton: {
    backgroundColor: '#4CAF50',
  },
  updateButton: {
    backgroundColor: 'white',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  trackButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  updateButtonText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  errorContainer: {
    marginHorizontal: 20,
    borderRadius: 25,
    overflow: 'hidden',
  },
  errorGradient: {
    padding: 30,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5252',
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    fontFamily: 'serif',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  statNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  quickActions: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    fontFamily: 'serif',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  infoSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    borderRadius: 20,
    padding: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginLeft: 10,
    fontFamily: 'serif',
  },
  infoText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoPoints: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  infoPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoPointText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  footer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  footerGradient: {
    padding: 30,
    alignItems: 'center',
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 20,
  },
  websiteLink: {
    fontSize: 12,
    color: 'white',
    marginLeft: 10,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
    fontFamily: 'serif',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 25,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
  },
  socialText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 10,
    fontWeight: '600',
  },
  copyright: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 5,
  },
  poweredBy: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});

export default YPCHomeScreen;