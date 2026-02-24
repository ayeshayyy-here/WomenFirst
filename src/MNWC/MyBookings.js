// screens/MyBookings.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faChartLine,
  faChevronRight,
  faCalendarAlt,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faArrowLeft,
  faUserPlus,
  faDumbbell,
  faBook,
  faChair,
  faChalkboardTeacher,
  faTheaterMasks,
  faMusic,
  faMicrophone,
  faBuilding,
  faHistory,
  faFilter,
  faEye,
  faEdit,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://karma-roots-rankings-handhelds.trycloudflare.com/api';

// Facility configuration
const FACILITY_CONFIG = {
  daycare: {
    name: 'Day Care',
    color: '#940775',
    gradient: ['#940775', '#6d0557'],
    icon: faUserPlus,
  },
  gym: {
    name: 'Gym',
    color: '#ae6c09',
    gradient: ['#ae6c09', '#8a5207'],
    icon: faDumbbell,
  },
  library: {
    name: 'Library',
    color: '#51217b',
    gradient: ['#51217b', '#3a1959'],
    icon: faBook,
  },
  office: {
    name: 'Office Space',
    color: '#0f551c',
    gradient: ['#0f551c', '#0a3b14'],
    icon: faChair,
  },
  training: {
    name: 'Training Room',
    color: '#6b0606',
    gradient: ['#6b0606', '#4d0404'],
    icon: faChalkboardTeacher,
  },
  seminar: {
    name: 'Seminar Room',
    color: '#0891b2',
    gradient: ['#0891b2', '#066884'],
    icon: faTheaterMasks,
  },
  auditorium: {
    name: 'Auditorium',
    color: '#560101',
    gradient: ['#560101', '#3d0101'],
    icon: faMusic,
  },
  creative: {
    name: 'Creative Studio',
    color: '#372359',
    gradient: ['#372359', '#25193d'],
    icon: faMicrophone,
  },
};

const MyBookings = ({ navigation, route }) => {
  const { user_id, user } = route.params || {};
  const [bookingStats, setBookingStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, pending, approved

  useEffect(() => {
    if (user_id) {
      fetchBookingStats();
      fetchRecentBookings();
    }
  }, [user_id]);

  const fetchBookingStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/booking-counts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ user_id }),
      });

      const data = await response.json();
      
      if (data.success) {
        setBookingStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
  };

  const fetchRecentBookings = async () => {
    try {
      // Fetch recent bookings from all facilities (limit 5 each)
      const facilities = Object.keys(FACILITY_CONFIG);
      let allBookings = [];

      for (const facility of facilities) {
        if (facility === 'creative') continue; // Skip creative studio as it's coming soon
        
        const response = await fetch(`${API_BASE_URL}/user/bookings/${facility}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ 
            user_id,
            per_page: 3 // Get 3 most recent from each
          }),
        });

        const data = await response.json();
        
        if (data.success && data.data.data) {
          const bookingsWithFacility = data.data.data.map(booking => ({
            ...booking,
            facility_type: facility,
            facility_name: FACILITY_CONFIG[facility].name,
            facility_color: FACILITY_CONFIG[facility].color,
          }));
          allBookings = [...allBookings, ...bookingsWithFacility];
        }
      }

      // Sort by created_at date (most recent first) and take top 10
      allBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentBookings(allBookings.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchBookingStats(), fetchRecentBookings()]);
  };

  const viewFacilityBookings = (facility) => {
    navigation.navigate('FacilityBookingsScreen', {
      facility,
      user_id,
      user,
    });
  };

  const viewAllBookings = () => {
    // Navigate to a screen that shows all bookings grouped by facility
    // You can create this screen later
    Alert.alert('Info', 'All Bookings view coming soon!');
  };

  const getFacilityIcon = (facilityId) => {
    return FACILITY_CONFIG[facilityId]?.icon || faBuilding;
  };

  const getFacilityColor = (facilityId) => {
    return FACILITY_CONFIG[facilityId]?.color || '#6B7280';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: '#D97706', bg: '#FEF3C7', icon: faSpinner, label: 'Pending' },
      approved: { color: '#059669', bg: '#D1FAE5', icon: faCheckCircle, label: 'Approved' },
      rejected: { color: '#DC2626', bg: '#FEE2E2', icon: faTimesCircle, label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
        <FontAwesomeIcon icon={config.icon} size={8} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getBookingTitle = (booking) => {
    switch (booking.facility_type) {
      case 'daycare':
        return booking.child_name || 'Day Care Booking';
      case 'gym':
        return booking.applicant_name || 'Gym Booking';
      case 'library':
        return booking.applicant_name || 'Library Access';
      case 'office':
        return booking.purpose || 'Office Booking';
      case 'training':
        return booking.training_title || 'Training Booking';
      case 'seminar':
        return booking.seminar_title || 'Seminar Booking';
      case 'auditorium':
        return booking.event_title || 'Auditorium Booking';
      default:
        return `Booking #${booking.id}`;
    }
  };

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
            <View style={styles.titleIcon}>
              <FontAwesomeIcon icon={faChartLine} size={16} color="#036677" />
            </View>
            <Text style={styles.trackingTitle}>Your Bookings Overview</Text>
          </View>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={viewAllBookings}
          >
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#E0F2FE' }]}>
            <Text style={styles.statNumber}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statNumber, { color: '#D97706' }]}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={[styles.statNumber, { color: '#059669' }]}>{approved}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
        </View>

        {/* Facility-wise counts */}
        <Text style={styles.facilitySectionTitle}>Bookings by Facility</Text>
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
              <LinearGradient
                colors={FACILITY_CONFIG[key]?.gradient || ['#6B7280', '#4B5563']}
                style={styles.facilityStatGradient}
              >
                <View style={styles.facilityStatContent}>
                  <FontAwesomeIcon 
                    icon={getFacilityIcon(key)} 
                    size={20} 
                    color="#fff" 
                  />
                  <Text style={styles.facilityStatCount}>{count}</Text>
                </View>
                <Text style={styles.facilityStatLabel}>
                  {FACILITY_CONFIG[key]?.name || key}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
    );
  };

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      <TouchableOpacity
        style={[styles.filterTab, selectedFilter === 'all' && styles.filterTabActive]}
        onPress={() => setSelectedFilter('all')}
      >
        <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
          All
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, selectedFilter === 'pending' && styles.filterTabActive]}
        onPress={() => setSelectedFilter('pending')}
      >
        <Text style={[styles.filterText, selectedFilter === 'pending' && styles.filterTextActive]}>
          Pending
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterTab, selectedFilter === 'approved' && styles.filterTabActive]}
        onPress={() => setSelectedFilter('approved')}
      >
        <Text style={[styles.filterText, selectedFilter === 'approved' && styles.filterTextActive]}>
          Approved
        </Text>
      </TouchableOpacity>
    </View>
  );

  const filteredBookings = recentBookings.filter(booking => {
    if (selectedFilter === 'all') return true;
    return booking.status === selectedFilter;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#036677" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#036677" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#036677', '#076c86']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>My Bookings</Text>
            <Text style={styles.headerSubtitle}>
              {user?.name?.split(' ')[0] || 'User'}'s booking history
            </Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <FontAwesomeIcon icon={faFilter} size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Tracking Bar */}
        {renderTrackingBar()}

        {/* Recent Bookings Section */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <FontAwesomeIcon icon={faHistory} size={16} color="#1F2937" />
              <Text style={styles.sectionTitle}>Recent Bookings</Text>
            </View>
            <Text style={styles.sectionCount}>{filteredBookings.length} items</Text>
          </View>

          {renderFilterTabs()}

          {filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesomeIcon icon={faCalendarAlt} size={48} color="#E5E7EB" />
              <Text style={styles.emptyStateTitle}>No Bookings Found</Text>
              <Text style={styles.emptyStateText}>
                {selectedFilter === 'all' 
                  ? "You haven't made any bookings yet."
                  : `You don't have any ${selectedFilter} bookings.`}
              </Text>
            </View>
          ) : (
            filteredBookings.map((booking) => (
              <TouchableOpacity
                key={`${booking.facility_type}-${booking.id}`}
                style={styles.bookingCard}
                onPress={() => viewFacilityBookings(booking.facility_type)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#ffffff', '#f9fafb']}
                  style={styles.bookingCardGradient}
                >
                  <View style={styles.bookingHeader}>
                    <View style={styles.bookingTypeContainer}>
                      <View style={[styles.bookingTypeIcon, { backgroundColor: booking.facility_color + '20' }]}>
                        <FontAwesomeIcon 
                          icon={getFacilityIcon(booking.facility_type)} 
                          size={14} 
                          color={booking.facility_color} 
                        />
                      </View>
                      <View>
                        <Text style={styles.bookingFacility}>{booking.facility_name}</Text>
                        <Text style={styles.bookingTitle}>{getBookingTitle(booking)}</Text>
                      </View>
                    </View>
                    {getStatusBadge(booking.status)}
                  </View>

                  <View style={styles.bookingMeta}>
                    <View style={styles.metaItem}>
                      <FontAwesomeIcon icon={faCalendarAlt} size={10} color="#9CA3AF" />
                      <Text style={styles.metaText}>{formatDate(booking.created_at)}</Text>
                    </View>
                    {booking.hours_required && (
                      <View style={styles.metaItem}>
                        <FontAwesomeIcon icon={faClock} size={10} color="#9CA3AF" />
                        <Text style={styles.metaText}>{booking.hours_required} hours</Text>
                      </View>
                    )}
                  </View>

              
                </LinearGradient>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 45,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  trackingBar: {
    borderRadius: 20,
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
    marginBottom: 16,
  },
  trackingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  viewAllText: {
    fontSize: 11,
    color: '#036677',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#4B5563',
    marginTop: 2,
  },
  facilitySectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  facilityStatsScroll: {
    flexGrow: 0,
  },
  facilityStatItem: {
    width: 100,
    marginRight: 10,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  facilityStatGradient: {
    padding: 12,
  },
  facilityStatContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityStatCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  facilityStatLabel: {
    fontSize: 10,
    color: '#fff',
    opacity: 0.9,
  },
  recentSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionCount: {
    fontSize: 11,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#036677',
  },
  filterText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
  },
  bookingCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bookingCardGradient: {
    padding: 14,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bookingTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  bookingTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingFacility: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 2,
  },
  bookingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '600',
  },
  bookingMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    color: '#6B7280',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bookingId: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  actionIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    padding: 4,
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
});

export default MyBookings;