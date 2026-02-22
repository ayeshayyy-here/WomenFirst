import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  StatusBar,
  Dimensions,
  SafeAreaView,
  Platform
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faTable,
  faPlusCircle,
  faChevronDown,
  faSignOutAlt,
  faSignInAlt,
  faArrowRight,
  faBuilding,
  faInfoCircle,
  faClock,
  faHourglass,
  faCheckCircle,
  faArrowRightCircle,
  faClockHistory,
  faUsers,
  faMicrophone,
  faExclamationTriangle,
  faVideo,
  faHeadphones,
  faListCheck,
  faCalendarAlt,
  faUserPlus,
  faDumbbell,
  faBook,
  faChair,
  faChalkboardTeacher,
  faTheaterMasks,
  faMusic,
  faChevronRight,
  faShieldAlt,
  faWifi,
  faCoffee,
  faParking,
  faAccessibleIcon
} from '@fortawesome/free-solid-svg-icons';
import AutoRegistrationMNWC from './components/AutoRegistrationMNWC';
const { width, height } = Dimensions.get('window');

const DashboardMNWC = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Facility Icons Mapping
  const getFacilityIcon = (id) => {
    const icons = {
      daycare: faUserPlus,
      gym: faDumbbell,
      library: faBook,
      office: faChair,
      training: faChalkboardTeacher,
      seminar: faTheaterMasks,
      auditorium: faMusic,
      creative: faMicrophone
    };
    return icons[id] || faBuilding;
  };

  const facilities = [
    {
      id: 'daycare',
      title: 'Day Care Facility',
      description: 'Register and reserve slots for childcare services with flexible scheduling.',
      badge: 'Registration & Booking',
      gradient: ['#fdf2f8', '#fbcfe8'],
      titleColor: '#940775',
      icon: faUserPlus,
      stats: { bookings: 0, available: 0 },
      modalData: {
        about: 'Professional childcare services providing a safe and nurturing environment for children while parents focus on their work and development.',
        hours: '9:00 AM – 5:00 PM',
        slotUnit: '30 minutes per slot',
        amenities: ['Safe Environment', 'Professional Staff', 'Age-appropriate Activities', 'Play Area', 'Nap Room'],
        features: [
          'Multiple slots can be booked to cover required hours',
          'Safe and secure environment',
          'Professional childcare staff',
          'Age-appropriate activities',
          'Nutritious meals provided',
          'Indoor and outdoor play areas'
        ]
      }
    },
    {
      id: 'gym',
      title: 'Gym Facility',
      description: 'Sign up for membership and book workout sessions or classes.',
      badge: 'Registration & Booking',
      gradient: ['#f9faeb', '#ddf176'],
      titleColor: '#ae6c09',
      icon: faDumbbell,
      stats: { bookings: 0, available: 0 },
      modalData: {
        about: 'State-of-the-art fitness center equipped with modern equipment and professional trainers to support your health and wellness journey.',
        hours: '6:00 AM – 10:00 PM',
        slotUnit: '60 minutes per session',
        amenities: ['Modern Equipment', 'Personal Trainers', 'Steam Room', 'Locker Rooms', 'Supplements Bar'],
        serviceTypes: [
          { type: 'Temporary Gym Booking', desc: 'Pay-per-use access to gym facilities' },
          { type: 'Gym Membership Card Request', desc: 'Regular membership subject to approval' }
        ],
        features: [
          'Modern fitness equipment',
          'Certified trainers available',
          'Fitness classes and programs',
          'Flexible booking options',
          'Cardio and strength zones',
          'Group exercise classes'
        ]
      }
    },
    {
      id: 'library',
      title: 'Library Access',
      description: 'Apply for access and reserve reading rooms or resources.',
      badge: 'Registration & Booking',
      gradient: ['#f3e8ff', '#ddd6fe'],
      titleColor: '#51217b',
      icon: faBook,
      stats: { bookings: 0, available: 0 },
      modalData: {
        about: 'Comprehensive library with extensive collection of books, journals, and digital resources to support learning and research.',
        hours: '8:00 AM – 8:00 PM',
        slotUnit: '2 hours per session',
        amenities: ['Quiet Zones', 'Digital Resources', 'Study Rooms', 'Printing Services', 'Café'],
        serviceTypes: [
          { type: 'Temporary Library Use', desc: 'Day pass for library access' },
          { type: 'Library Membership Request', desc: 'Regular membership for frequent users' }
        ],
        features: [
          'Extensive book collection',
          'Quiet study areas',
          'Research materials and journals',
          'Professional assistance available',
          'Digital library access',
          'Inter-library loan service'
        ]
      }
    },
    {
      id: 'office',
      title: 'Office Space',
      description: 'Book shared desks or private rooms for focused work.',
      badge: 'Registration & Booking',
      gradient: ['#f1f7f0', '#e9f1eb'],
      titleColor: '#0f551c',
      icon: faChair,
      stats: { bookings: 0, available: 0 },
      modalData: {
        about: 'The office space is intended for one-to-one meetings or small professional discussions. A maximum of 4 additional persons can be accommodated along with the applicant.',
        hours: '9:00 AM – 6:00 PM',
        slotUnit: '1 hour minimum',
        capacity: 'Maximum: 5 persons total (including applicant)',
        amenities: ['High-speed WiFi', 'Conference Phone', 'Whiteboard', 'Printer', 'Coffee Machine'],
        features: [
          'Multiple slots may be booked consecutively',
          'Professional meeting environment',
          'Equipped with necessary amenities',
          'Private and secure space',
          'Video conferencing facilities',
          'Business support services'
        ]
      }
    },
    {
      id: 'training',
      title: 'Training Room',
      description: 'Schedule workshops and capacity-building sessions.',
      badge: 'Capacity: 30',
       gradient: ['#fdf7f7', '#dedada'],
      titleColor: '#6b0606',
      icon: faChalkboardTeacher,
      stats: { bookings: 0, available: 0 },
      modalData: {
        about: 'The training room is intended for workshops, trainings, and capacity-building sessions.',
        capacity: 'Maximum Capacity: 30 participants',
        hours: '8:00 AM – 8:00 PM',
        slotUnit: '2 hours minimum',
        amenities: ['Projector', 'Whiteboard', 'Sound System', 'Training Materials', 'Breakout Areas'],
        features: [
          'Multiple slots may be booked consecutively',
          'Includes trainer/facilitator in capacity count',
          'Equipped with presentation facilities',
          'Audio-visual equipment available',
          'Suitable for workshops and training sessions',
          'Flexible seating arrangements'
        ]
      }
    },
    {
      id: 'seminar',
      title: 'Seminar Room',
      description: 'Host seminars and talks with mid-size audiences.',
      badge: 'Capacity: 70',
       gradient: ['#cffafe', '#67e8f9'],
      titleColor: '#0891b2',
      icon: faTheaterMasks,
      stats: { bookings: 0, available: 0 },
      modalData: {
        about: 'The seminar room is intended for seminars, panel discussions, lectures, and professional knowledge-sharing sessions.',
        capacity: 'Maximum Capacity: 70 participants',
        hours: '9:00 AM – 9:00 PM',
        slotUnit: '3 hours minimum',
        amenities: ['Stage', 'PA System', 'Projector Screen', 'Recording Equipment', 'Green Room'],
        features: [
          'Multiple slots may be booked consecutively',
          'Includes speakers and organizers in capacity count',
          'Professional audio-visual setup',
          'Theater-style seating arrangement',
          'Ideal for seminars and panel discussions',
          'Live streaming capabilities'
        ]
      }
    },
    {
      id: 'auditorium',
      title: 'Auditorium',
      description: 'Plan large events with full auditorium facilities.',
      badge: 'Capacity: 400',
      gradient: ['#f9f1f1', '#f7f4f4'],
      titleColor: '#560101',
      icon: faMusic,
      stats: { bookings: 0, available: 0 },
      modalData: {
        about: 'The auditorium is intended for conferences, conventions, large seminars, cultural programs, and official events.',
        capacity: 'Maximum Capacity: 400 participants',
        hours: '8:00 AM – 10:00 PM',
        slotUnit: '4 hours minimum',
        amenities: ['Professional Stage', 'Lighting System', 'Sound System', 'Dressing Rooms', 'VIP Lounge'],
        features: [
          'Multiple slots may be booked consecutively',
          'Includes speakers, organizers, and staff in capacity count',
          'State-of-the-art audio-visual equipment',
          'Professional stage and lighting',
          'Suitable for large-scale events and conferences',
          'Cultural programs and official ceremonies'
        ]
      }
    },
    {
      id: 'creative',
      title: 'Creative Studio / Podcast',
      description: 'Professional recording studio for podcasts, voiceovers, and creative content production.',
      badge: 'Coming Soon',
      gradient: ['#F3E8FF', '#EDE9FE'],
      titleColor: '#372359',
      icon: faMicrophone,
      stats: { bookings: 0, available: 0 },
      modalData: {
        about: 'State-of-the-art creative studio equipped with professional recording equipment for podcasts, voiceovers, interviews, and creative content production.',
        hours: 'Coming Soon',
        amenities: ['Sound Proofing', 'Professional Mics', 'Mixing Console', 'Isolation Booths', 'Video Recording'],
        features: [
          'Professional podcast recording equipment',
          'Sound-proof acoustic treatment',
          'Video recording capabilities',
          'Professional audio mixing and monitoring',
          'Live streaming capabilities',
          'Technical support staff'
        ]
      }
    }
  ];

  const openModal = (facility) => {
    setSelectedFacility(facility);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedFacility(null);
  };

 const handleDirectNavigation = (facilityId) => {
  closeModal();
  // Demo screen names with comments
  
  switch(facilityId) {
    case 'daycare':
      console.log('Navigating to DayCare Booking Screen');
      navigation.navigate('DayCareBookingScreen');
      break;
      
    case 'gym':
      console.log('Navigating to Gym Membership Screen');
      navigation.navigate('GymBookingScreen');
      break;
      
    case 'library':
      console.log('Navigating to Library Access Screen');
      navigation.navigate('LibraryAccessBookingScreen');
      break;
      
    case 'office':
      console.log('Navigating to Office Space Screen');
      navigation.navigate('OfficeBookingScreen');
      break;
      
    case 'training':
      console.log('Navigating to Training Room Screen');
      navigation.navigate('TrainingBookingScreen');
      break;
      
    case 'seminar':
      console.log('Navigating to Seminar Hall Screen');
      navigation.navigate('SeminarBookingScreen');
      break;
      
    case 'auditorium':
      console.log('Navigating to Auditorium Screen');
      navigation.navigate('AuditoriumBookingScreen');
      break;
      
    case 'creative':
      console.log('Navigating to Creative Studio Screen');
      navigation.navigate('StudioBookingScreen');
      break;
      
    default:
      console.log(`No screen found for ${facilityId}`);
  }
  
  closeModal(); // Close modal after navigation
};

  const handleTapForDetails = (facility) => {
    // This opens the modal for details
    openModal(facility);
  };

  const renderFacilityCard = (facility) => (
    <View key={facility.id} style={[styles.card, { backgroundColor: facility.gradient[0] }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.2)']}
        style={styles.cardGradient}
      >
        <View style={[styles.cardBorder, { borderColor: facility.gradient[1] }]}>
          {/* Make the entire top section tappable for direct navigation */}
          <TouchableOpacity 
            onPress={() => handleDirectNavigation(facility.id)}
            activeOpacity={0.7}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardBadgeContainer}>
                <View style={[styles.cardBadge, { backgroundColor: facility.titleColor }]}>
                  <Text style={styles.cardBadgeText}>{facility.badge}</Text>
                </View>
                {facility.stats.available > 0 && (
                  <View style={styles.availableBadge}>
                    <Text style={styles.availableText}>{facility.stats.available} slots</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.cardTitleSection}>
                <FontAwesomeIcon icon={facility.icon} size={24} color={facility.titleColor} />
                <View style={styles.cardTitleContent}>
                  <Text style={[styles.cardTitle, { color: facility.titleColor }]}>
                    {facility.title}
                  </Text>
                  <Text style={styles.cardDescription}>{facility.description}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.tapToOpenContainer}
              onPress={() => handleTapForDetails(facility)}
              activeOpacity={0.7}
            >
              <FontAwesomeIcon icon={faArrowRight} size={10} color="#64748b" />
              <Text style={styles.tapToOpen}>Tap for details</Text>
            </TouchableOpacity>
            
            {/* Open button now navigates directly */}
            <TouchableOpacity 
              style={[styles.openButton, { backgroundColor: facility.titleColor }]}
              onPress={() => handleDirectNavigation(facility.id)}
            >
              <Text style={styles.openButtonText}>Tap to Open Form</Text>
              <FontAwesomeIcon icon={faChevronRight} size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderModal = () => {
    if (!selectedFacility) return null;

    const isCreative = selectedFacility.id === 'creative';
    const modalGradient = isCreative ? ['#8B5CF6', '#7C3AED'] : ['#06B6D4', '#0891B2'];

    return (
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={modalGradient}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <View style={styles.modalIconContainer}>
                  <FontAwesomeIcon icon={getFacilityIcon(selectedFacility.id)} size={14} color="#fff" />
                </View>
                <View style={styles.modalHeaderTextContainer}>
                  <Text style={styles.modalHeaderText}>
                    {selectedFacility.title}
                  </Text>
                  <Text style={styles.modalHeaderSubtext}>
                    {selectedFacility.badge}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={closeModal} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView 
              style={styles.modalBody} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalBodyContent}
            >
              {/* About Section */}
              <View style={styles.modalSection}>
                <View style={styles.sectionTitle}>
                  <FontAwesomeIcon icon={faInfoCircle} size={18} color="#1F2937" />
                  <Text style={styles.sectionTitleText}>About</Text>
                </View>
                <Text style={styles.sectionText}>{selectedFacility.modalData.about}</Text>
                
                {isCreative && (
                  <View style={styles.comingSoonAlert}>
                    <FontAwesomeIcon icon={faExclamationTriangle} size={20} color="#F59E0B" />
                    <Text style={styles.comingSoonText}>
                      This facility is coming soon and will be available for bookings in the near future.
                    </Text>
                  </View>
                )}
              </View>

              {/* Amenities */}
              <View style={styles.modalSection}>
                <View style={styles.sectionTitle}>
                  <FontAwesomeIcon icon={faShieldAlt} size={18} color="#1F2937" />
                  <Text style={styles.sectionTitleText}>Amenities</Text>
                </View>
                <View style={styles.amenitiesGrid}>
                  {selectedFacility.modalData.amenities?.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <FontAwesomeIcon 
                        icon={faCheckCircle} 
                        size={12} 
                        color={isCreative ? "#8B5CF6" : "#06B6D4"} 
                      />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Operating Information */}
              {!isCreative && (
                <View style={styles.modalSection}>
                  <View style={styles.sectionTitle}>
                    <FontAwesomeIcon icon={faClock} size={18} color="#1F2937" />
                    <Text style={styles.sectionTitleText}>Operating Information</Text>
                  </View>
                  
                  <View style={styles.infoGrid}>
                    {selectedFacility.modalData.hours && (
                      <View style={styles.infoCard}>
                        <FontAwesomeIcon icon={faClock} size={14} color="#06B6D4" />
                        <Text style={styles.infoLabel}>Hours</Text>
                        <Text style={styles.infoValue}>{selectedFacility.modalData.hours}</Text>
                      </View>
                    )}
                    
                    {selectedFacility.modalData.slotUnit && (
                      <View style={styles.infoCard}>
                        <FontAwesomeIcon icon={faHourglass} size={14} color="#10B981" />
                        <Text style={styles.infoLabel}>Duration</Text>
                        <Text style={styles.infoValue}>{selectedFacility.modalData.slotUnit}</Text>
                      </View>
                    )}
                    
                    {selectedFacility.modalData.capacity && (
                      <View style={styles.infoCard}>
                        <FontAwesomeIcon icon={faUsers} size={20} color="#F59E0B" />
                        <Text style={styles.infoLabel}>Capacity</Text>
                        <Text style={styles.infoValue}>{selectedFacility.modalData.capacity}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {/* Service Types */}
              {selectedFacility.modalData.serviceTypes && (
                <View style={styles.modalSection}>
                  <View style={styles.sectionTitle}>
                    <FontAwesomeIcon icon={faListCheck} size={18} color="#1F2937" />
                    <Text style={styles.sectionTitleText}>Service Types</Text>
                  </View>
                  {selectedFacility.modalData.serviceTypes.map((service, index) => (
                    <View key={index} style={styles.serviceCard}>
                      <FontAwesomeIcon 
                        icon={faArrowRightCircle} 
                        size={16} 
                        color="#06B6D4" 
                      />
                      <View style={styles.serviceContent}>
                        <Text style={styles.serviceType}>{service.type}</Text>
                        <Text style={styles.serviceDesc}>{service.desc}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Features */}
              <View style={styles.modalSection}>
                <View style={styles.sectionTitle}>
                  <FontAwesomeIcon icon={faCheckCircle} size={18} color="#1F2937" />
                  <Text style={styles.sectionTitleText}>Key Features</Text>
                </View>
                {selectedFacility.modalData.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <FontAwesomeIcon
                      icon={faArrowRightCircle}
                      size={14}
                      color={isCreative ? "#8B5CF6" : "#06B6D4"}
                    />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.primaryButton, isCreative && styles.disabledButton]}
                  onPress={() => handleDirectNavigation(selectedFacility.id)}
                  disabled={isCreative}
                >
                  <LinearGradient
                    colors={modalGradient}
                    style={styles.buttonGradient}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} size={18} color="#fff" />
                    <Text style={styles.buttonText}>
                      {isCreative ? 'Coming Soon' : 'Tap to open Form'}
                    </Text>
                    <FontAwesomeIcon icon={faArrowRight} size={16} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={closeModal}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    
    <SafeAreaView style={styles.container}>
       <AutoRegistration 
      onUserReady={handleUserReady}
      showCredentialsModal={true}
      autoCloseDelay={5000}
    ></AutoRegistration>
      <StatusBar backgroundColor="#036677" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#036677', '#076c86']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoText}>MN</Text>
            </View>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Maryam Nawaz Women Complex</Text>
            </View>
          </View>

          <View style={styles.headerNav}>
            {isLoggedIn ? (
              <>
                <TouchableOpacity style={styles.profileButton}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.profileGradient}
                  >
                    <Text style={styles.profileInitials}>JD</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.loginButton}>
                <FontAwesomeIcon icon={faSignInAlt} size={16} color="#036677" />
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView 
        style={styles.mainContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainContentContainer}
      >
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Facility Dashboard</Text>
            <Text style={styles.pageSubtitle}>
              Quickly access registration and booking for all facilities.
            </Text>
          </View>
          <View style={styles.statsBadge}>
            <FontAwesomeIcon icon={faBuilding} size={8} color="#06B6D4" />
            <Text style={styles.statsBadgeText}>8 Facilities</Text>
          </View>
        </View>

        <View style={styles.facilitiesGrid}>
          {facilities.map(renderFacilityCard)}
        </View>
      </ScrollView>

      {/* Footer */}
      <LinearGradient colors={['#036677', '#076c86']} style={styles.footer}>
        <Text style={styles.footerText}>
          © {new Date().getFullYear()} Maryam Nawaz Women Complex
        </Text>
      </LinearGradient>

      {/* Modal */}
      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 16,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#fff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#06B6D4',
  },
  headerTitleContainer: {
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.8)',
  },
  headerNav: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  loginText: {
    color: '#036677',
    fontSize: 15,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  mainContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statsBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#036677',
  },
  facilitiesGrid: {
    gap: 16,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 1,
  },
  cardBorder: {
    borderWidth: 1,
    borderRadius: 19,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardBadgeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cardBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  availableBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  availableText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#10B981',
  },
  cardTitleSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  cardTitleContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 24,
  },
  cardDescription: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  tapToOpenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tapToOpen: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  footerText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.9,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  modalIconContainer: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderTextContainer: {
    flex: 1,
  },
  modalHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalHeaderSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  modalCloseButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
  modalBody: {
    maxHeight: height * 0.7,
  },
  modalBodyContent: {
    padding: 24,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionText: {
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  amenityText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 10,
    color: '#1F2937',
    fontWeight: '600',
    textAlign: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceContent: {
    flex: 1,
  },
  serviceType: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceDesc: {
    fontSize: 10,
    color: '#6B7280',
    lineHeight: 18,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 10,
    color: '#4B5563',
    lineHeight: 20,
  },
  comingSoonAlert: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  comingSoonText: {
    flex: 1,
    color: '#92400E',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
  },
  modalActions: {
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 10,
    fontWeight: '600',
  },
});

export default DashboardMNWC;