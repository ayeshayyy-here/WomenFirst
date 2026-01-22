import React, { useState, useEffect } from 'react';
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
  Modal,
  Alert,
  ToastAndroid,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import syncStorage from 'react-native-sync-storage';

const AmbassadorHomeScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ambassadorData, setAmbassadorData] = useState(null);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [contactModalVisible, setContactModalVisible] = useState(false);

  useEffect(() => {
    loadUserProfile();
    fetchAmbassadorData();
  }, []);

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

  const fetchAmbassadorData = async () => {
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

      const response = await axios.get(
        'https://fa-wdd.punjab.gov.pk/api/ambassador',
        {
          params: { cnic_bform: cnic },
          headers: { 'Accept': 'application/json' },
          timeout: 15000,
        }
      );

      if (response.data.status && response.data.data) {
        setAmbassadorData(response.data.data);
      } else {
        setAmbassadorData(null);
      }
    } catch (error) {
      console.error('Error fetching ambassador data:', error);
      if (error.response?.status === 404) {
        setAmbassadorData(null);
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
    fetchAmbassadorData();
  };

  const handleApplyNow = () => {
    const wddstatus = ambassadorData?.wddstatus?.toLowerCase() || '';
    
    // Check if user has wddstatus = "yes"
    if (wddstatus === 'yes') {
      ToastAndroid.show(
        'You cannot apply for Phase 2 as you are already selected!',
        ToastAndroid.LONG
      );
      Alert.alert(
        'Cannot Apply',
        'You are already selected as an ambassador. You cannot apply for Phase 2.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    navigation.navigate('WomenAmbassadorRegistrationScreen');
  };

  const handleTrackApplication = () => {
    const wddstatus = ambassadorData?.wddstatus?.toLowerCase() || '';
    const phase = ambassadorData?.phase || '';
    
    // Check if user has phase = 2 or wddstatus = yes
    if (phase !== '2' && wddstatus !== 'yes') {
      ToastAndroid.show(
        'Apply for Phase 2 first to access tracking!',
        ToastAndroid.LONG
      );
      Alert.alert(
        'Access Restricted',
        'You need to apply for Phase 2 first or be an already selected ambassador to access tracking.',
        [
          { text: 'Apply Now', onPress: () => navigation.navigate('WomenAmbassadorRegistrationScreen') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }
    
    navigation.navigate('AmbassadorTrackingScreen');
  };

  const handleHelpPress = () => {
    setContactModalVisible(true);
  };

  const openWebsite = () => {
    Linking.openURL('https://wdd.punjab.gov.pk').catch(err => {
      Alert.alert('Error', 'Could not open website');
    });
  };

  const callPhone = () => {
    Linking.openURL('tel:+924236447500').catch(err => {
      Alert.alert('Error', 'Could not make phone call');
    });
  };

  const DetailItem = ({ icon, label, value, color = 'white' }) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIconContainer}>
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
        <Icon name={icon} size={24} color="#2196F3" />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );

  const ContactUsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={contactModalVisible}
      onRequestClose={() => setContactModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#7C2B5E', '#412F63']}
            style={styles.modalHeader}
          >
            <Text style={styles.modalTitle}>CONTACT US</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setContactModalVisible(false)}
            >
              <Icon name="close" size={24} color="white" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.modalBody}>
            <View style={styles.contactHeader}>
              <Icon name="office-building" size={60} color="#7C2B5E" />
              <Text style={styles.departmentTitle}>WOMEN DEVELOPMENT DEPARTMENT</Text>
              <Text style={styles.departmentUrdu}>محکمہ ترقی نسواں</Text>
            </View>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Icon name="map-marker" size={24} color="#7C2B5E" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Address</Text>
                  <Text style={styles.contactValue}>
                    Civic Center G-Block Sabzazar, Lahore, Pakistan
                  </Text>
                  <Text style={styles.contactValueUrdu}>
                    سول سینٹر جی بلاک سبزازار، لاہور، پاکستان
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.contactItem, styles.clickableItem]}
                onPress={openWebsite}
              >
                <Icon name="web" size={24} color="#2196F3" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Website</Text>
                  <Text style={[styles.contactValue, styles.linkText]}>
                    https://wdd.punjab.gov.pk
                  </Text>
                  <Text style={styles.linkHint}>Tap to open</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.contactItem, styles.clickableItem]}
                onPress={callPhone}
              >
                <Icon name="phone" size={24} color="#4CAF50" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={[styles.contactValue, styles.linkText]}>
                    +92-42-36447500
                  </Text>
                  <Text style={styles.linkHint}>Tap to call</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.contactItem}>
                <Icon name="clock-outline" size={24} color="#FF9800" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Office Hours</Text>
                  <Text style={styles.contactValue}>
                    Monday to Friday: 9:00 AM - 5:00 PM
                  </Text>
                  <Text style={styles.contactValueUrdu}>
                    پیر سے جمعہ: صبح 9 بجے سے شام 5 بجے تک
                  </Text>
                </View>
              </View>

              <View style={styles.contactItem}>
                <Icon name="email" size={24} color="#9C27B0" />
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>
                    info@wdd.punjab.gov.pk
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.noteSection}>
              <Icon name="information" size={20} color="#FF9800" />
              <Text style={styles.noteText}>
                For ambassador program specific queries, please contact during office hours or email with your CNIC number.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setContactModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#7C2B5E" />
          <Text style={styles.loadingText}>Checking your ambassador status...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={60} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Error Loading Data</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchAmbassadorData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const wddstatus = ambassadorData?.wddstatus?.toLowerCase() || '';
    const phase = ambassadorData?.phase || '';

    // CONDITION 1: Already selected as ambassador (wddstatus = "Yes" or "yes")
    // This user is already selected - they can only view tracking
    if (wddstatus === 'yes') {
      return (
        <View style={styles.statusCard}>
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statusHeader}>
              <Icon name="trophy" size={40} color="white" />
              <Text style={styles.statusTitle}>Congratulations! 🏆</Text>
            </View>
            
            <Text style={styles.statusMessage}>
              You have been SELECTED as an Ambassador!
            </Text>
            <Text style={styles.statusUrdu}>
              آپ کو سفیر کے طور پر منتخب کیا گیا ہے!
            </Text>

            <View style={styles.detailsContainer}>
              <DetailItem
                icon="account-star"
                label="Status"
                value="SELECTED"
              />
              <DetailItem
                icon="crown"
                label="Achievement"
                value="Ambassador"
              />
              <DetailItem
                icon="calendar-star"
                label="Selection Date"
                value={ambassadorData.updated_at ? new Date(ambassadorData.updated_at).toLocaleDateString() : 'Recently'}
              />
            </View>

            <Text style={styles.noteText}>
              You are already selected. You cannot apply for Phase 2.
            </Text>
            <Text style={styles.noteTextUrdu}>
              آپ پہلے ہی منتخب ہو چکے ہیں۔ آپ فیز 2 کے لیے درخواست نہیں دے سکتے۔
            </Text>

            <TouchableOpacity 
              style={[styles.actionButton, styles.trackingButton]}
              onPress={handleTrackApplication}
            >
              <Icon name="chart-timeline-variant" size={20} color="white" />
              <Text style={[styles.actionButtonText, {color: 'white'}]}>View Tracking</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }

    // CONDITION 2: Already Ambassador for Phase 1 (wddstatus = 'yes' with lowercase y)
    if (wddstatus === 'yes' && (!phase || phase === '')) {
      return (
        <View style={styles.statusCard}>
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statusHeader}>
              <Icon name="check-circle" size={40} color="white" />
              <Text style={styles.statusTitle}>Congratulations! 🎉</Text>
            </View>
            
            <Text style={styles.statusMessage}>
              You are already an Ambassador for Phase 1!
            </Text>
            <Text style={styles.statusUrdu}>
              آپ پہلے مرحلے کے لیے پہلے سے ہی سفیر ہیں!
            </Text>

            <View style={styles.detailsContainer}>
              <DetailItem
                icon="account-check"
                label="Status"
                value="Active Ambassador"
              />
              <DetailItem
                icon="calendar-check"
                label="Phase"
                value="Phase 1"
              />
              <DetailItem
                icon="clock-outline"
                label="Since"
                value={new Date(ambassadorData.created_at).toLocaleDateString()}
              />
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleTrackApplication}
            >
              <Icon name="chart-timeline-variant" size={20} color="#2E7D32" />
              <Text style={styles.actionButtonText}>Track Application</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }

    // CONDITION 3: No data found - Apply for Phase 1
    if (!ambassadorData) {
      return (
        <View style={styles.statusCard}>
          <LinearGradient
            colors={['#2196F3', '#1976D2']}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statusHeader}>
              <Icon name="star-outline" size={40} color="white" />
              <Text style={styles.statusTitle}>Become an Ambassador! 🌟</Text>
            </View>
            
            <Text style={styles.statusMessage}>
              Join our ambassador program and make a difference!
            </Text>
            <Text style={styles.statusUrdu}>
              ہمارے سفیر پروگرام میں شامل ہوں اور تبدیلی لائیں!
            </Text>

            <View style={styles.featuresContainer}>
              <FeatureItem
                icon="school"
                title="University Leadership"
                description="Represent your university and lead initiatives"
              />
              <FeatureItem
                icon="account-group"
                title="Community Building"
                description="Connect with like-minded students"
              />
              <FeatureItem
                icon="certificate"
                title="Certification"
                description="Get recognized with official certification"
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

    // CONDITION 4: Previous record exists (wddstatus not 'yes'/'Yes' and phase null/empty)
    if (wddstatus !== 'yes' && (!phase || phase === '')) {
      return (
        <View style={styles.statusCard}>
          <LinearGradient
            colors={['#FF9800', '#F57C00']}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statusHeader}>
              <Icon name="history" size={40} color="white" />
              <Text style={styles.statusTitle}>Previous Record Found 📝</Text>
            </View>
            
            <Text style={styles.statusMessage}>
              Your previous application exists. Would you like to apply for Phase 2?
            </Text>
            <Text style={styles.statusUrdu}>
              آپ کی پچھلی درخواست موجود ہے۔ کیا آپ فیز 2 کے لیے درخواست دینا چاہیں گے؟
            </Text>

            <View style={styles.detailsContainer}>
              <DetailItem
                icon="clipboard-text-outline"
                label="Previous Status"
                value={ambassadorData.wddstatus || 'Pending'}
              />
              <DetailItem
                icon="calendar-alert"
                label="Application Date"
                value={new Date(ambassadorData.created_at).toLocaleDateString()}
              />
              <DetailItem
                icon="information-outline"
                label="Note"
                value="You can update and resubmit for Phase 2"
              />
            </View>

            <TouchableOpacity 
              style={[styles.actionButton, styles.applyButton]}
              onPress={handleApplyNow}
            >
              <Icon name="refresh" size={20} color="white" />
              <Text style={styles.applyButtonText}>Apply for Phase 2</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }

    // CONDITION 5: Already in Phase 2 - Show tracking
    if (phase === '2') {
      return (
        <View style={styles.statusCard}>
          <LinearGradient
            colors={['#9C27B0', '#7B1FA2']}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statusHeader}>
              <Icon name="rocket-launch" size={40} color="white" />
              <Text style={styles.statusTitle}>Phase 2 Ambassador 🚀</Text>
            </View>
            
            <Text style={styles.statusMessage}>
              You have successfully applied for phase 2 Ambassador Program!
              You will be notified prompltly, regarding your application processing.
            </Text>
            <Text style={styles.statusUrdu}>
              ایمبیسیڈر پروگرام کے دوسرے مرحلے میں خوش آمدید!
            </Text>

            <View style={styles.detailsContainer}>
              <DetailItem
                icon="check-decagram"
                label="Phase"
                value="Phase 2"
                color="#9C27B0"
              />
              <DetailItem
                icon="progress-check"
                label="Current Status"
                value={ambassadorData.wddstatus || 'Processing'}
              />
              <DetailItem
                icon="update"
                label="Last Updated"
                value={new Date(ambassadorData.updated_at).toLocaleDateString()}
              />
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleTrackApplication}
            >
              <Icon name="chart-line" size={20} color="#9C27B0" />
              <Text style={styles.actionButtonText}>Track Application Status</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      );
    }

    // Default fallback
    return (
      <View style={styles.statusCard}>
        <LinearGradient
          colors={['#607D8B', '#455A64']}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statusHeader}>
            <Icon name="help-circle" size={40} color="white" />
            <Text style={styles.statusTitle}>Status Unknown</Text>
          </View>
          
          <Text style={styles.statusMessage}>
            Please contact support for assistance with your application.
          </Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleHelpPress}
          >
            <Icon name="email" size={20} color="#455A64" />
            <Text style={styles.actionButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  };

  return (
    <ImageBackground
      source={{uri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'}}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar backgroundColor="#7C2B5E" barStyle="light-content" />
      <LinearGradient
        colors={['rgba(124, 43, 94, 0.9)', 'rgba(65, 47, 99, 0.9)']}
        style={styles.overlay}
      >
        <ScrollView
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#7C2B5E']}
              tintColor="#7C2B5E"
            />
          }
        >
          <View style={styles.header}>
            <LinearGradient
              colors={['#7C2B5E', '#412F63']}
              style={styles.headerGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.headerContent}>
                <Icon name="account-star" size={32} color="white" />
                <Text style={styles.headerTitle}>Ambassador Dashboard</Text>
                <Text style={styles.headerUrdu}>سفیر ڈیش بورڈ</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.welcomeCard}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.95)']}
              style={styles.welcomeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.welcomeContent}>
                <Icon name="account-circle" size={50} color="#7C2B5E" />
                <View style={styles.welcomeTextContainer}>
                  <Text style={styles.welcomeGreeting}>Welcome back!</Text>
                  <Text style={styles.welcomeName}>
                    {userProfile?.name || 'Ambassador Candidate'}
                  </Text>
                  <Text style={styles.welcomeId}>
                    CNIC: {userProfile?.cnic || 'N/A'}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {renderContent()}

          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={handleTrackApplication}
              >
                <LinearGradient
                  colors={['#4CAF50', '#2E7D32']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Icon name="chart-timeline-variant" size={30} color="white" />
                  <Text style={styles.actionCardText}>Track</Text>
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
                  end={{ x: 1, y: 0 }}
                >
                  <Icon name="file-document-edit" size={30} color="white" />
                  <Text style={styles.actionCardText}>Apply</Text>
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
                  end={{ x: 1, y: 0 }}
                >
                  <Icon name="account-settings" size={30} color="white" />
                  <Text style={styles.actionCardText}>Profile</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={handleHelpPress}
              >
                <LinearGradient
                  colors={['#9C27B0', '#7B1FA2']}
                  style={styles.actionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Icon name="help-circle" size={30} color="white" />
                  <Text style={styles.actionCardText}>Help</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Ambassador Program Information</Text>
            <View style={styles.infoCards}>
              <View style={styles.infoCard}>
                <Icon name="calendar-range" size={24} color="#7C2B5E" />
                <Text style={styles.infoCardTitle}>Duration</Text>
                <Text style={styles.infoCardText}>6-12 months commitment</Text>
              </View>
              <View style={styles.infoCard}>
                <Icon name="school" size={24} color="#412F63" />
                <Text style={styles.infoCardTitle}>Eligibility</Text>
                <Text style={styles.infoCardText}>Female university students</Text>
              </View>
              <View style={styles.infoCard}>
                <Icon name="certificate" size={24} color="#2196F3" />
                <Text style={styles.infoCardTitle}>Benefits</Text>
                <Text style={styles.infoCardText}>Certification & Recognition</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Women Development Department, Government of Punjab
            </Text>
            <Text style={styles.footerUrdu}>
              محکمہ ترقی نسواں، حکومت پنجاب
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
      
      <ContactUsModal />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
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
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  headerUrdu: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
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
  welcomeTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: 12,
    color: '#666',
  },
  welcomeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C2B5E',
  },
  welcomeId: {
    fontSize: 10,
    color: '#888',
    marginTop: 2,
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
    fontSize: 18,
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
  noteText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 10,
    borderRadius: 10,
  },
  noteTextUrdu: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
    textAlign: 'center',
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginTop: 2,
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
    width: 50,
    height: 50,
    borderRadius: 25,
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
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#7C2B5E',
  },
  trackingButton: {
    backgroundColor: '#2E7D32',
  },
  applyButton: {
    backgroundColor: '#2196F3',
  },
  applyButtonText: {
    color: 'white',
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
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
    color: '#7C2B5E',
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
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
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
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  infoCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    width: '31%',
    alignItems: 'center',
    elevation: 2,
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  footerUrdu: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingVertical: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  contactHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  departmentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7C2B5E',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  departmentUrdu: {
    fontSize: 14,
    color: '#412F63',
    textAlign: 'center',
  },
  contactInfo: {
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    backgroundColor: 'rgba(124, 43, 94, 0.05)',
    padding: 15,
    borderRadius: 15,
  },
  clickableItem: {
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  contactTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7C2B5E',
    marginBottom: 5,
  },
  contactValue: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  contactValueUrdu: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  linkText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  linkHint: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  noteSection: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 12,
    color: '#F57C00',
    lineHeight: 18,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 15,
  },
  modalButton: {
    backgroundColor: '#7C2B5E',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AmbassadorHomeScreen;