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
  Platform,
  RefreshControl,
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
  faAccessibleIcon,
  faChartLine,
  faHistory,
  faFilter,
  faEye,
  faTimesCircle,
  faCheckDouble,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import AutoRegistrationMNWC from '../components/AutoRegistrationMNWC';

const { width, height } = Dimensions.get('window');
const API_BASE_URL = 'https://karma-roots-rankings-handhelds.trycloudflare.com/api';

const DashboardMNWC = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAutoRegModal, setShowAutoRegModal] = useState(true);
  const [bookingStats, setBookingStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAllBookingsModal, setShowAllBookingsModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');

  // Fetch booking stats when user is ready
  useEffect(() => {
    if (currentUser) {
      fetchBookingStats();
    }
  }, [currentUser]);

  const fetchBookingStats = async () => {
    if (!currentUser) return;
    
    setLoadingStats(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user/booking-counts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ user_id: currentUser.id }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBookingStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchBookingStats().finally(() => setRefreshing(false));
  }, [currentUser]);

  // Handle user ready from AutoRegistration
  const handleUserReady = (user) => {
    console.log('User is ready:', user);
    setCurrentUser(user);
  };

  // const viewAllBookings = () => {
  //   setShowAllBookingsModal(true);
  // };

  const viewAllBookings = () => {
  navigation.navigate('MyBookings', {
    user_id: currentUser.id,
    user: currentUser,
  });
};
  const viewFacilityBookings = (facilityId) => {
    setShowAllBookingsModal(false);
    navigation.navigate('FacilityBookingsScreen', {
      facility: facilityId,
      user_id: currentUser.id,
      user: currentUser,
    });
  };

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
    
    // Check if user is ready
    if (!currentUser) {
      console.log('User not ready yet, waiting...');
      return;
    }

    console.log('Navigating with user_id:', currentUser.id);
    
    switch(facilityId) {
      case 'daycare':
        navigation.navigate('DayCareBookingScreen', { 
          user_id: currentUser.id,
          user: currentUser 
        });
        break;
      case 'gym':
        navigation.navigate('GymBookingScreen', { 
          user_id: currentUser.id,
          user: currentUser 
        });
        break;
      case 'library':
        navigation.navigate('LibraryAccessBookingScreen', { 
          user_id: currentUser.id,
          user: currentUser 
        });
        break;
      case 'office':
        navigation.navigate('OfficeBookingScreen', { 
          user_id: currentUser.id,
          user: currentUser 
        });
        break;
      case 'training':
        navigation.navigate('TrainingBookingScreen', { 
          user_id: currentUser.id,
          user: currentUser 
        });
        break;
      case 'seminar':
        navigation.navigate('SeminarBookingScreen', { 
          user_id: currentUser.id,
          user: currentUser 
        });
        break;
      case 'auditorium':
        navigation.navigate('AuditoriumBookingScreen', { 
          user_id: currentUser.id,
          user: currentUser 
        });
        break;
      case 'creative':
        navigation.navigate('StudioBookingScreen', { 
          user_id: currentUser.id,
          user: currentUser 
        });
        break;
      default:
        console.log(`No screen found for ${facilityId}`);
    }
    
    closeModal();
  };

  const handleTapForDetails = (facility) => {
    openModal(facility);
  };

  // Render Tracking Bar Component
  const renderTrackingBar = () => {
    if (!bookingStats) return null;

    const total = bookingStats.total_bookings || 0;
    const pending = bookingStats.pending || 0;
    const approved = bookingStats.approved || 0;

    return (
      <LinearGradient
        colors={['#ffffff', '#f8f9fa']}
        style={styles.trackingBar}
      >
        <View style={styles.trackingHeader}>
          <View style={styles.trackingTitleContainer}>
            <FontAwesomeIcon icon={faChartLine} size={16} color="#036677" />
            <Text style={styles.trackingTitle}>Your Bookings Overview</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={viewAllBookings}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <FontAwesomeIcon icon={faChevronRight} size={10} color="#036677" />
          </TouchableOpacity>
        </View>

      

        {/* Facility-wise counts */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.facilityStatsScroll}
        >
          {Object.entries(bookingStats.counts).map(([key, count]) => (
            <TouchableOpacity
              key={key}
              style={styles.facilityStatItem}
              onPress={() => viewFacilityBookings(key)}
            >
              <View style={[styles.facilityStatIcon, { backgroundColor: getFacilityColor(key) }]}>
                <FontAwesomeIcon 
                  icon={getFacilityIcon(key)} 
                  size={16} 
                  color="#fff" 
                />
              </View>
              <View>
                <Text style={styles.facilityStatCount}>{count}</Text>
                <Text style={styles.facilityStatLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
    );
  };

  const getFacilityColor = (facilityId) => {
    const colors = {
      daycare: '#940775',
      gym: '#ae6c09',
      library: '#51217b',
      office: '#0f551c',
      training: '#6b0606',
      seminar: '#0891b2',
      auditorium: '#560101',
    };
    return colors[facilityId] || '#6B7280';
  };

  const renderFacilityCard = (facility) => (
    <View key={facility.id} style={[styles.card, { backgroundColor: facility.gradient[0] }]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.2)']}
        style={styles.cardGradient}
      >
        <View style={[styles.cardBorder, { borderColor: facility.gradient[1] }]}>
          <TouchableOpacity 
            onPress={() => handleDirectNavigation(facility.id)}
            activeOpacity={0.7}
            disabled={!currentUser}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardBadgeContainer}>
                <View style={[styles.cardBadge, { backgroundColor: facility.titleColor }]}>
                  <Text style={styles.cardBadgeText}>{facility.badge}</Text>
                </View>
                {bookingStats?.counts[facility.id] > 0 && (
                  <View style={[styles.countBadge, { backgroundColor: facility.titleColor }]}>
                    <Text style={styles.countBadgeText}>
                      {bookingStats.counts[facility.id]}
                    </Text>
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
            
            <TouchableOpacity 
              style={[styles.openButton, { backgroundColor: facility.titleColor }]}
              onPress={() => handleDirectNavigation(facility.id)}
              disabled={!currentUser}
            >
              <Text style={styles.openButtonText}>
                {currentUser ? 'Tap to Open Form' : 'Loading...'}
              </Text>
              <FontAwesomeIcon icon={faChevronRight} size={12} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  // All Bookings Modal
  const renderAllBookingsModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAllBookingsModal}
      onRequestClose={() => setShowAllBookingsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <LinearGradient
            colors={['#036677', '#076c86']}
            style={styles.modalHeader}
          >
            <View style={styles.modalHeaderContent}>
              <FontAwesomeIcon icon={faHistory} size={20} color="#fff" />
              <Text style={styles.modalHeaderText}>All Bookings</Text>
            </View>
            <TouchableOpacity onPress={() => setShowAllBookingsModal(false)} style={styles.modalCloseButton}>
              <FontAwesomeIcon icon={faTimesCircle} size={24} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.modalBody}>
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryNumber}>{bookingStats?.total_bookings || 0}</Text>
                <Text style={styles.summaryLabel}>Total</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNumber, { color: '#D97706' }]}>
                  {bookingStats?.pending || 0}
                </Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryNumber, { color: '#059669' }]}>
                  {bookingStats?.approved || 0}
                </Text>
                <Text style={styles.summaryLabel}>Approved</Text>
              </View>
            </View>

            {/* Facility Tabs */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.tabContainer}
            >
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
                onPress={() => setSelectedTab('all')}
              >
                <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
                  All Facilities
                </Text>
              </TouchableOpacity>
              {Object.keys(bookingStats?.counts || {}).map((facility) => (
                <TouchableOpacity
                  key={facility}
                  style={[styles.tab, selectedTab === facility && styles.activeTab]}
                  onPress={() => setSelectedTab(facility)}
                >
                  <Text style={[styles.tabText, selectedTab === facility && styles.activeTabText]}>
                    {facility.charAt(0).toUpperCase() + facility.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Facility List */}
            <ScrollView style={styles.facilityList}>
              {(selectedTab === 'all' ? Object.keys(bookingStats?.counts || {}) : [selectedTab]).map((facility) => {
                const count = bookingStats?.counts[facility] || 0;
                if (count === 0) return null;

                return (
                  <TouchableOpacity
                    key={facility}
                    style={styles.facilityListItem}
                    onPress={() => viewFacilityBookings(facility)}
                  >
                    <View style={styles.facilityListItemLeft}>
                      <View style={[styles.facilityListIcon, { backgroundColor: getFacilityColor(facility) }]}>
                        <FontAwesomeIcon icon={getFacilityIcon(facility)} size={20} color="#fff" />
                      </View>
                      <View>
                        <Text style={styles.facilityListTitle}>
                          {facility.charAt(0).toUpperCase() + facility.slice(1)}
                        </Text>
                        <Text style={styles.facilityListCount}>{count} booking(s)</Text>
                      </View>
                    </View>
                    <FontAwesomeIcon icon={faChevronRight} size={16} color="#6B7280" />
                  </TouchableOpacity>
                );
              })}

              {bookingStats?.total_bookings === 0 && (
                <View style={styles.emptyState}>
                  <FontAwesomeIcon icon={faHistory} size={48} color="#E5E7EB" />
                  <Text style={styles.emptyStateTitle}>No Bookings Yet</Text>
                  <Text style={styles.emptyStateText}>
                    Start by booking a facility from the dashboard
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
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
                <FontAwesomeIcon icon={faTimesCircle} size={24} color="#fff" />
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
                  disabled={isCreative || !currentUser}
                >
                  <LinearGradient
                    colors={modalGradient}
                    style={styles.buttonGradient}
                  >
                    <FontAwesomeIcon icon={faCalendarAlt} size={18} color="#fff" />
                    <Text style={styles.buttonText}>
                      {isCreative ? 'Coming Soon' : currentUser ? 'Tap to open Form' : 'Loading...'}
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
      <AutoRegistrationMNWC 
        onUserReady={handleUserReady}
        showCredentialsModal={showAutoRegModal}
        autoCloseDelay={5000}
      >
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
                {currentUser && (
                  <Text style={styles.headerUserText}>
                    Welcome, {currentUser.name?.split(' ')[0] || 'User'}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.headerNav}>
              {isLoggedIn && currentUser ? (
                <TouchableOpacity style={styles.profileButton}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.profileGradient}
                  >
                    <Text style={styles.profileInitials}>
                      {currentUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'JD'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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

          {/* Tracking Bar */}
          {bookingStats && renderTrackingBar()}

          {/* Loading Indicator */}
          {loadingStats && !bookingStats && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading your bookings...</Text>
            </View>
          )}

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

        {/* Modals */}
        {renderModal()}
        {renderAllBookingsModal()}
      </AutoRegistrationMNWC>
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
  headerUserText: {
    fontSize: 10,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
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
    marginBottom: 16,
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
  
  // Tracking Bar Styles
  trackingBar: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trackingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trackingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  viewAllText: {
    fontSize: 10,
    color: '#036677',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  facilityStatsScroll: {
    flexGrow: 0,
    marginTop: 4,
  },
  facilityStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  facilityStatIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityStatCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  facilityStatLabel: {
    fontSize: 10,
    color: '#3c4048',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  
  // Card Styles
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
  countBadge: {
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
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
  
  // Footer
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
    gap: 12,
    flex: 1,
  },
  modalHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  
  // All Bookings Modal Styles
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  tabContainer: {
    flexGrow: 0,
    marginBottom: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  activeTab: {
    backgroundColor: '#036677',
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '500',
  },
  facilityList: {
    maxHeight: height * 0.5,
  },
  facilityListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  facilityListItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  facilityListIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  facilityListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  facilityListCount: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  
  // Facility Modal Styles
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
  modalHeaderSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    marginTop: 2,
  },
  modalBodyContent: {
    padding: 24,
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