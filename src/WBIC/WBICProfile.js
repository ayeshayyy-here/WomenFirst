// WBICProfile.js - Complete Profile Screen
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
  Linking,
  Modal,
  Share,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import SyncStorage from 'react-native-sync-storage';

const { width, height } = Dimensions.get('window');

// Color Scheme
const COLORS = {
  primary: '#9f3a89',
  primaryDark: '#bb45b3',
  primaryLight: '#b64187',
  primarySoft: '#F0ECFF',
  primaryGradient: ['#88306e', '#b3579c', '#bd2da8'],
  success: '#00C48C',
  successLight: '#E0F9F0',
  warning: '#FFB946',
  warningLight: '#FFF4E5',
  error: '#FF4D4F',
  errorLight: '#FFE5E5',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  textLighter: '#BDC3C7',
  border: '#E8ECF0',
  background: '#F9FAFC',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  shadow: '#000000',
};

const API_BASE_URL = 'https://wbic-wdd.punjab.gov.pk/api/v1';

const WBICProfile = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
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
      ]).start();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const storedProfile = await SyncStorage.get('user_profile');
      if (storedProfile) {
        let userProfile = typeof storedProfile === 'string' ? JSON.parse(storedProfile) : storedProfile;
        if (userProfile && userProfile.cnic) {
          const cleanCnic = userProfile.cnic.replace(/-/g, '');
          await getCompleteProfile(cleanCnic);
        } else {
          Alert.alert('Error', 'No CNIC found. Please login again.');
          navigation.navigate('Login');
        }
      } else {
        Alert.alert('Error', 'Please login to view your profile.');
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getCompleteProfile = async (cnic) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/profile/complete`, { cnic });
      if (response.data.success) {
        setProfile(response.data.data);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to fetch profile data');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name={i <= rating ? 'star' : 'star-border'}
          size={16}
          color={i <= rating ? COLORS.warning : COLORS.textLighter}
        />
      );
    }
    return <View style={styles.ratingStars}>{stars}</View>;
  };

  const renderSkillCard = (title, rating, remarks) => {
    return (
      <View style={styles.skillCard}>
        <View style={styles.skillHeader}>
          <Text style={styles.skillTitle}>{title}</Text>
          {renderRatingStars(rating)}
        </View>
        {remarks ? (
          <Text style={styles.skillRemarks}>Remarks: {remarks}</Text>
        ) : null}
      </View>
    );
  };

  const renderDocumentViewer = (url, title) => {
    return (
      <Modal
        visible={showDocModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDocModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setShowDocModal(false)}>
              <Icon name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {selectedDoc?.endsWith('.pdf') ? (
              <WebView source={{ uri: selectedDoc }} style={styles.webView} />
            ) : (
              <Image source={{ uri: selectedDoc }} style={styles.modalImage} resizeMode="contain" />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderSectionHeader = (icon, title, sectionKey) => {
    const isActive = activeSection === sectionKey;
    return (
      <TouchableOpacity
        style={[styles.sectionHeader, isActive && styles.sectionHeaderActive]}
        onPress={() => setActiveSection(activeSection === sectionKey ? null : sectionKey)}
        activeOpacity={0.7}
      >
        <LinearGradient colors={COLORS.primaryGradient} style={styles.sectionIcon} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          <Icon name={icon} size={20} color={COLORS.white} />
        </LinearGradient>
        <Text style={styles.sectionHeaderTitle}>{title}</Text>
        <Icon name={isActive ? 'expand-less' : 'expand-more'} size={24} color={COLORS.textLight} />
      </TouchableOpacity>
    );
  };

  const renderPersonalInfo = () => {
    if (!profile?.personal_info) return null;
    const info = profile.personal_info;
    
    return (
      <View style={styles.sectionContent}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{info.full_name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>CNIC Number</Text>
            <Text style={styles.infoValue}>{info.cnic}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Father/Husband</Text>
            <Text style={styles.infoValue}>
              {info.parentage_type === 'do' ? info.father_name : info.husband_name}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>{info.date_of_birth} ({info.age} yrs)</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{info.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Contact Number</Text>
            <Text style={styles.infoValue}>{info.contact_number}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Current Address</Text>
          <Text style={styles.infoValue}>{info.current_address}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Permanent Address</Text>
          <Text style={styles.infoValue}>{info.permanent_address}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Province</Text>
            <Text style={styles.infoValue}>{info.province}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>City/District</Text>
            <Text style={styles.infoValue}>{info.city_district}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Application Via</Text>
            <Text style={styles.infoValue}>{info.application_via}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Application Status</Text>
            <View style={[styles.statusBadge, info.application_status === 'Completed' && styles.statusCompleted]}>
              <Text style={styles.statusText}>{info.application_status}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEducationInfo = () => {
    if (!profile?.education_info) return null;
    const edu = profile.education_info;
    
    return (
      <View style={styles.sectionContent}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Highest Qualification</Text>
            <Text style={styles.infoValue}>{edu.highest_qualification}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Laptop Availability</Text>
            <Text style={styles.infoValue}>{edu.has_laptop}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Current Student</Text>
          <Text style={styles.infoValue}>{edu.is_student}</Text>
        </View>
        
        {edu.is_student === 'Yes' && (
          <>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>University</Text>
              <Text style={styles.infoValue}>{edu.university}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Department</Text>
                <Text style={styles.infoValue}>{edu.department}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Year/Semester</Text>
                <Text style={styles.infoValue}>Year {edu.current_year}, Sem {edu.current_semester}</Text>
              </View>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderBusinessInfo = () => {
    if (!profile?.business_info) {
      return (
        <View style={styles.sectionContent}>
          <View style={styles.emptyState}>
            <Icon name="business" size={48} color={COLORS.textLighter} />
            <Text style={styles.emptyStateText}>No business information found</Text>
          </View>
        </View>
      );
    }
    
    const biz = profile.business_info;
    
    return (
      <View style={styles.sectionContent}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Startup Status</Text>
            <Text style={styles.infoValue}>{biz.startup_status}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Business Name</Text>
            <Text style={styles.infoValue}>{biz.business_name}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Startup Stage</Text>
            <Text style={styles.infoValue}>{biz.startup_stage}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Industry Sector</Text>
            <Text style={styles.infoValue}>{biz.industry_sector}</Text>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Business Description</Text>
          <Text style={styles.infoValue}>{biz.description}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Market Research</Text>
            <Text style={styles.infoValue}>{biz.market_research}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Team Size</Text>
            <Text style={styles.infoValue}>{biz.team_size} people</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Founder Type</Text>
            <Text style={styles.infoValue}>{biz.is_sole_founder}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Monthly Income</Text>
            <Text style={styles.infoValue}>{biz.avg_monthly_income}</Text>
          </View>
        </View>
        
        {biz.cofounder_name && (
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Co-founder Name</Text>
              <Text style={styles.infoValue}>{biz.cofounder_name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Co-founder Contact</Text>
              <Text style={styles.infoValue}>{biz.cofounder_contact}</Text>
            </View>
          </View>
        )}
        
        {biz.software_used && biz.software_used !== 'No' && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Software Used</Text>
            <Text style={styles.infoValue}>{biz.software_name}</Text>
          </View>
        )}
        
        {biz.has_loan === 'Yes' && (
          <View style={styles.loanCard}>
            <Icon name="account-balance" size={20} color={COLORS.warning} />
            <View style={styles.loanInfo}>
              <Text style={styles.loanTitle}>Microfinance Loan</Text>
              <Text style={styles.loanDetails}>
                Amount: {biz.loan_amount} | Provider: {biz.loan_provider} | Duration: {biz.loan_duration}
              </Text>
            </View>
          </View>
        )}
        
        {biz.target_audience && biz.target_audience.length > 0 && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Target Audience</Text>
            {biz.target_audience.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Icon name="check-circle" size={14} color={COLORS.success} />
                <Text style={styles.listItemText}>{item.age_group}: {item.description}</Text>
              </View>
            ))}
          </View>
        )}
        
        {biz.geo_outreach && biz.geo_outreach.length > 0 && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Geographic Outreach</Text>
            {biz.geo_outreach.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Icon name="location-on" size={14} color={COLORS.primary} />
                <Text style={styles.listItemText}>{item.level}: {item.remarks}</Text>
              </View>
            ))}
          </View>
        )}
        
        {Object.keys(biz.social_links || {}).length > 0 && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Social Links</Text>
            <View style={styles.socialLinks}>
              {Object.entries(biz.social_links).map(([platform, url]) => (
                <TouchableOpacity
                  key={platform}
                  style={styles.socialLink}
                  onPress={() => Linking.openURL(url)}
                >
                  <Icon name="link" size={14} color={COLORS.primary} />
                  <Text style={styles.socialLinkText}>{platform}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderAssessmentInfo = () => {
    if (!profile?.assessment_info) {
      return (
        <View style={styles.sectionContent}>
          <View style={styles.emptyState}>
            <Icon name="school" size={48} color={COLORS.textLighter} />
            <Text style={styles.emptyStateText}>No assessment information found</Text>
          </View>
        </View>
      );
    }
    
    const assess = profile.assessment_info;
    
    return (
      <View style={styles.sectionContent}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Training Level</Text>
          <Text style={styles.infoValue}>Level {assess.training_level}</Text>
        </View>
        
        {assess.training_level === '1' && assess.level1_training && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Selected Training</Text>
            <Text style={styles.infoValue}>{assess.level1_training}</Text>
          </View>
        )}
        {assess.training_level === '2' && assess.level2_training && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Selected Training</Text>
            <Text style={styles.infoValue}>{assess.level2_training}</Text>
          </View>
        )}
        {assess.training_level === '3' && assess.level3_training && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Selected Training</Text>
            <Text style={styles.infoValue}>{assess.level3_training}</Text>
          </View>
        )}
        
        <View style={styles.skillsSection}>
          <Text style={styles.subSectionTitle}>Entrepreneurial Skills Assessment</Text>
          {renderSkillCard('Idea Development', assess.skills?.idea_development?.rating, assess.skills?.idea_development?.remarks)}
          {renderSkillCard('Marketing', assess.skills?.marketing?.rating, assess.skills?.marketing?.remarks)}
          {renderSkillCard('Financial Management', assess.skills?.financial_management?.rating, assess.skills?.financial_management?.remarks)}
          {renderSkillCard('Negotiation', assess.skills?.negotiation?.rating, assess.skills?.negotiation?.remarks)}
          {renderSkillCard('Digital Skills', assess.skills?.digital_skills?.rating, assess.skills?.digital_skills?.remarks)}
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Learning Needs & Challenges</Text>
          {assess.learning_needs && Object.entries(assess.learning_needs).map(([need, details]) => (
            <View key={need} style={styles.learningNeedItem}>
              <Text style={styles.learningNeedTitle}>{need}</Text>
              {Array.isArray(details) && details.length > 0 && (
                <View style={styles.learningNeedSubs}>
                  {details.map((sub, idx) => (
                    <View key={idx} style={styles.listItem}>
                      <Icon name="chevron-right" size={12} color={COLORS.primary} />
                      <Text style={styles.listItemText}>{sub}</Text>
                    </View>
                  ))}
                </View>
              )}
              {typeof details === 'string' && (
                <Text style={styles.learningNeedText}>{details}</Text>
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.logisticsSection}>
          <Text style={styles.subSectionTitle}>Logistics & Availability</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Days Available</Text>
              <Text style={styles.infoValue}>{assess.logistics?.days_available}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Weeks Available</Text>
              <Text style={styles.infoValue}>{assess.logistics?.weeks_available}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Training Mode</Text>
              <Text style={styles.infoValue}>{assess.logistics?.training_mode}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Time Slot</Text>
              <Text style={styles.infoValue}>{assess.logistics?.time_slot}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Commute Method</Text>
              <Text style={styles.infoValue}>{assess.logistics?.commute_method}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Daycare Required</Text>
              <Text style={[styles.infoValue, assess.logistics?.needs_daycare === 'Yes' && styles.requiredText]}>
                {assess.logistics?.needs_daycare}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>How did you hear about WBIC?</Text>
          <Text style={styles.infoValue}>{assess.source}</Text>
        </View>
        
        <View style={styles.motivationSection}>
          <Text style={styles.infoLabel}>Motivation Statement</Text>
          <View style={styles.motivationCard}>
            <Icon name="format-quote" size={20} color={COLORS.primary} />
            <Text style={styles.motivationText}>"{assess.motivation}"</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderDocuments = () => {
    if (!profile?.documents) return null;
    const docs = profile.documents;
    
    const documentItems = [
      { title: 'CNIC Front', url: docs.cnic_front, icon: 'credit-card' },
      { title: 'CNIC Back', url: docs.cnic_back, icon: 'credit-card' },
      { title: 'Business Registration', url: docs.business_registration, icon: 'description' },
    ];
    
    const validDocs = documentItems.filter(doc => doc.url);
    
    if (validDocs.length === 0) {
      return (
        <View style={styles.sectionContent}>
          <View style={styles.emptyState}>
            <Icon name="attach-file" size={48} color={COLORS.textLighter} />
            <Text style={styles.emptyStateText}>No documents uploaded</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.sectionContent}>
        <View style={styles.documentsGrid}>
          {validDocs.map((doc, index) => (
            <TouchableOpacity
              key={index}
              style={styles.documentCard}
              onPress={() => {
                setSelectedDoc(doc.url);
                setShowDocModal(true);
              }}
            >
              <LinearGradient colors={COLORS.primaryGradient} style={styles.docIcon} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                <Icon name={doc.icon} size={24} color={COLORS.white} />
              </LinearGradient>
              <Text style={styles.docTitle}>{doc.title}</Text>
              <Text style={styles.docAction}>Tap to view</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#F9FAFC', '#FFFFFF']} style={styles.loadingContainer} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your profile...</Text>
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
          {/* Profile Header */}
          <LinearGradient colors={COLORS.primaryGradient} style={styles.header} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <View style={styles.headerContent}>
              <View style={styles.profileImage}>
                <Text style={styles.profileInitial}>
                  {profile?.personal_info?.full_name?.charAt(0) || 'U'}
                </Text>
              </View>
              <Text style={styles.profileName}>{profile?.personal_info?.full_name}</Text>
              <Text style={styles.profileEmail}>{profile?.personal_info?.email}</Text>
              <View style={styles.profileBadge}>
                <Icon name="verified" size={16} color={COLORS.white} />
                <Text style={styles.profileBadgeText}>
                  {profile?.personal_info?.application_status}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Sections */}
          <View style={styles.sectionsContainer}>
            {renderSectionHeader('person', 'Personal Information', 'personal')}
            {activeSection === 'personal' && renderPersonalInfo()}
            
            {renderSectionHeader('school', 'Education', 'education')}
            {activeSection === 'education' && renderEducationInfo()}
            
            {renderSectionHeader('business', 'Business Profile', 'business')}
            {activeSection === 'business' && renderBusinessInfo()}
            
            {renderSectionHeader('assessment', 'Assessment & Training', 'assessment')}
            {activeSection === 'assessment' && renderAssessmentInfo()}
            
            {renderSectionHeader('attach-file', 'Documents', 'documents')}
            {activeSection === 'documents' && renderDocuments()}
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Document Modal */}
      <Modal
        visible={showDocModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDocModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Document Preview</Text>
            <TouchableOpacity onPress={() => setShowDocModal(false)}>
              <Icon name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {selectedDoc?.endsWith('.pdf') ? (
              <WebView source={{ uri: selectedDoc }} style={styles.webView} />
            ) : (
              <Image source={{ uri: selectedDoc }} style={styles.modalImage} resizeMode="contain" />
            )}
          </View>
        </View>
      </Modal>
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
    paddingTop: Platform.OS === 'ios' ? 40 : 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  profileInitial: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  profileBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Sections Container
  sectionsContainer: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeaderActive: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionHeaderTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  sectionContent: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: COLORS.border,
  },
  
  // Info Styles
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  infoItem: {
    flex: 1,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLighter,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.warningLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: COLORS.successLight,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.warning,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Skills Styles
  skillsSection: {
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  skillCard: {
    backgroundColor: COLORS.primarySoft,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  skillTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 2,
  },
  skillRemarks: {
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Learning Needs
  learningNeedItem: {
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: COLORS.primary,
  },
  learningNeedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  learningNeedText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  learningNeedSubs: {
    marginTop: 4,
  },
  
  // Logistics Section
  logisticsSection: {
    marginBottom: 16,
  },
  motivationSection: {
    marginTop: 8,
  },
  motivationCard: {
    backgroundColor: COLORS.primarySoft,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  motivationText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Loan Card
  loanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warningLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  loanInfo: {
    flex: 1,
  },
  loanTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  loanDetails: {
    fontSize: 11,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // List Items
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  listItemText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Social Links
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  socialLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  socialLinkText: {
    fontSize: 11,
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Documents
  documentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  documentCard: {
    width: (width - 56) / 3,
    alignItems: 'center',
    backgroundColor: COLORS.primarySoft,
    padding: 12,
    borderRadius: 12,
  },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  docTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  docAction: {
    fontSize: 10,
    color: COLORS.primary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.text,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.primary,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: width - 32,
    height: height - 100,
  },
  webView: {
    width: width,
    height: height - 80,
  },
  requiredText: {
    color: COLORS.error,
    fontWeight: '600',
  },
});

export default WBICProfile;