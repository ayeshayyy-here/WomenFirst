// screens/FacilityBookingsScreen.js
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
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faArrowLeft,
  faCalendarAlt,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
  faUser,
  faEye,
  faEdit,
  faTrash,
  faDumbbell,
  faBook,
  faChair,
  faChalkboardTeacher,
  faTheaterMasks,
  faMusic,
  faUserPlus,
  faPhone,
  faIdCard,
  faEnvelope,
  faMapMarkerAlt,
  faChild,
  faHeart,
  faUsers,
  faCoffee,
  faHourglass,
  faCalendarCheck,
  faTag,
} from '@fortawesome/free-solid-svg-icons';

const API_BASE_URL = 'https://karma-roots-rankings-handhelds.trycloudflare.com/api';

// Configuration for each facility type
const FACILITY_CONFIG = {
  daycare: {
    title: 'Day Care',
    color: '#940775',
    gradient: ['#940775', '#6d0557'],
    editScreen: 'DayCareEditScreen',
    displayFields: [
      { key: 'child_name', label: 'Child', icon: faChild },
      { key: 'parent_name', label: 'Parent', icon: faUser },
      { key: 'hours_required', label: 'Hours', icon: faHourglass },
      { key: 'created_at', label: 'Booked', icon: faCalendarAlt, type: 'date' },
    ],
    deleteEndpoint: 'daycare-bookings',
  },
  gym: {
    title: 'Gym',
    color: '#ae6c09',
    gradient: ['#ae6c09', '#8a5207'],
    editScreen: 'GymEditScreen',
    displayFields: [
      { key: 'applicant_name', label: 'Applicant', icon: faUser },
      { key: 'service_type', label: 'Type', icon: faDumbbell },
      { key: 'hours_required', label: 'Hours', icon: faHourglass },
      { key: 'created_at', label: 'Booked', icon: faCalendarAlt, type: 'date' },
    ],
    deleteEndpoint: 'gym-bookings',
  },
  library: {
    title: 'Library',
    color: '#51217b',
    gradient: ['#51217b', '#3a1959'],
    editScreen: 'LibraryEditScreen',
    displayFields: [
      { key: 'applicant_name', label: 'Applicant', icon: faUser },
      { key: 'access_type', label: 'Access', icon: faBook },
      { key: 'purpose', label: 'Purpose', icon: faTag },
      { key: 'created_at', label: 'Booked', icon: faCalendarAlt, type: 'date' },
    ],
    deleteEndpoint: 'library-accesses',
  },
  office: {
    title: 'Office Space',
    color: '#0f551c',
    gradient: ['#0f551c', '#0a3b14'],
    editScreen: 'OfficeEditScreen',
    displayFields: [
      { key: 'applicant_name', label: 'Applicant', icon: faUser },
      { key: 'purpose', label: 'Purpose', icon: faChair },
      { key: 'num_persons', label: 'Persons', icon: faUsers },
      { key: 'created_at', label: 'Booked', icon: faCalendarAlt, type: 'date' },
    ],
    deleteEndpoint: 'office-bookings',
  },
  training: {
    title: 'Training Room',
    color: '#6b0606',
    gradient: ['#6b0606', '#4d0404'],
    editScreen: 'TrainingEditScreen',
    displayFields: [
      { key: 'applicant_name', label: 'Applicant', icon: faUser },
      { key: 'training_title', label: 'Title', icon: faChalkboardTeacher },
      { key: 'num_participants', label: 'Participants', icon: faUsers },
      { key: 'created_at', label: 'Booked', icon: faCalendarAlt, type: 'date' },
    ],
    deleteEndpoint: 'training-bookings',
  },
  seminar: {
    title: 'Seminar Room',
    color: '#0891b2',
    gradient: ['#0891b2', '#066884'],
    editScreen: 'SeminarEditScreen',
    displayFields: [
      { key: 'applicant_name', label: 'Applicant', icon: faUser },
      { key: 'seminar_title', label: 'Title', icon: faTheaterMasks },
      { key: 'num_participants', label: 'Participants', icon: faUsers },
      { key: 'created_at', label: 'Booked', icon: faCalendarAlt, type: 'date' },
    ],
    deleteEndpoint: 'seminar-bookings',
  },
  auditorium: {
    title: 'Auditorium',
    color: '#560101',
    gradient: ['#560101', '#3d0101'],
    editScreen: 'AuditoriumEditScreen',
    displayFields: [
      { key: 'applicant_name', label: 'Applicant', icon: faUser },
      { key: 'event_title', label: 'Event', icon: faMusic },
      { key: 'num_participants', label: 'Participants', icon: faUsers },
      { key: 'created_at', label: 'Booked', icon: faCalendarAlt, type: 'date' },
    ],
    deleteEndpoint: 'auditorium-bookings',
  },
};

const FacilityBookingsScreen = ({ route, navigation }) => {
  const { facility, user_id, user } = route.params || {};
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0 });

  const config = FACILITY_CONFIG[facility];
  const facilityColor = config?.color || '#6B7280';
  const facilityTitle = config?.title || facility;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      console.log(`Fetching ${facility} bookings for user:`, user_id);
      
      const response = await fetch(`${API_BASE_URL}/user/bookings/${facility}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          user_id,
          per_page: 100 
        }),
      });

      const data = await response.json();
      console.log(`${facility} bookings response:`, data);
      
      if (data.success) {
        setBookings(data.data.data || []);
        calculateStats(data.data.data || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to load bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'Failed to load bookings. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (bookingsData) => {
    const total = bookingsData.length;
    const pending = bookingsData.filter(b => b.status === 'pending').length;
    const approved = bookingsData.filter(b => b.status === 'approved').length;
    setStats({ total, pending, approved });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const handleViewBooking = (booking) => {
    // Navigate to view screen (we'll create this later)
    Alert.alert('Info', 'View functionality coming soon!');
  };

  const handleEditBooking = (booking) => {
    // Navigate to the specific edit screen with the record ID
    const editScreen = config?.editScreen;
    if (editScreen) {
      console.log(`Navigating to ${editScreen} with ID:`, booking.id);
      navigation.navigate(editScreen, {
        record_id: booking.id,  // Pass the specific record ID
        user_id: user_id,
        user: user,
        isEditMode: true
      });
    } else {
      Alert.alert('Error', 'Edit screen not configured for this facility');
    }
  };

  const handleDeleteBooking = (booking) => {
    Alert.alert(
      'Delete Booking',
      `Are you sure you want to delete this booking?\n\nID: ${booking.id}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteBooking(booking.id)
        }
      ]
    );
  };

  const deleteBooking = async (bookingId) => {
    try {
      console.log(`Deleting ${facility} booking ID:`, bookingId);
      
      const response = await fetch(`${API_BASE_URL}/booking/${config.deleteEndpoint}/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          user_id,
          booking_id: bookingId 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Booking deleted successfully');
        fetchBookings(); // Refresh the list
      } else {
        Alert.alert('Error', data.message || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      Alert.alert('Error', 'Failed to delete booking. Please try again.');
    }
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
        <FontAwesomeIcon icon={config.icon} size={10} color={config.color} />
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFieldValue = (value, type) => {
    if (!value) return 'N/A';
    if (type === 'date') return formatDate(value);
    if (typeof value === 'object') return JSON.stringify(value);
    return value.toString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={facilityColor} />
        <Text style={styles.loadingText}>Loading {facilityTitle} bookings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={facilityColor} barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient 
        colors={config.gradient || [facilityColor, facilityColor]} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} size={18} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {facilityTitle} Bookings
            </Text>
            <Text style={styles.headerSubtitle}>
              {stats.total} total booking{stats.total !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.headerRight} />
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#D97706' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#059669' }]}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </View>
      </View>

      {/* Bookings List */}
      <ScrollView
        style={styles.bookingsList}
        contentContainerStyle={styles.bookingsListContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesomeIcon icon={faCalendarAlt} size={48} color="#E5E7EB" />
            <Text style={styles.emptyStateTitle}>No Bookings Found</Text>
            <Text style={styles.emptyStateText}>
              You haven't made any {facilityTitle} bookings yet.
            </Text>
          </View>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              {/* Header with ID and Status */}
              <View style={styles.bookingHeader}>
                <View>
                  <Text style={styles.bookingId}>Booking</Text>
                  {getStatusBadge(booking.status)}
                </View>
                <Text style={styles.bookingDate}>
                  {formatDate(booking.created_at)}
                </Text>
              </View>

              {/* Dynamic Fields based on facility */}
              <View style={styles.bookingDetails}>
                {config.displayFields.map((field, index) => {
                  if (field.key === 'created_at') return null; // Skip as we show in header
                  
                  const value = booking[field.key];
                  if (!value) return null;

                  return (
                    <View key={index} style={styles.detailRow}>
                      <View style={[styles.detailIcon, { backgroundColor: facilityColor + '20' }]}>
                        <FontAwesomeIcon icon={field.icon} size={12} color={facilityColor} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>{field.label}</Text>
                        <Text style={styles.detailValue}>
                          {formatFieldValue(value, field.type)}
                        </Text>
                      </View>
                    </View>
                  );
                })}

                {/* Show time slots if available */}
                {booking.time_slots && (
                  <View style={styles.timeSlotsPreview}>
                    <Text style={styles.timeSlotsLabel}>Time Slots:</Text>
                    <View style={styles.timeSlotsList}>
                      {(typeof booking.time_slots === 'string' 
                        ? JSON.parse(booking.time_slots) 
                        : booking.time_slots
                      ).slice(0, 2).map((slot, idx) => (
                        <View key={idx} style={styles.timeSlotChip}>
                          <FontAwesomeIcon icon={faClock} size={8} color={facilityColor} />
                          <Text style={styles.timeSlotChipText}>{slot}</Text>
                        </View>
                      ))}
                      {booking.time_slots.length > 2 && (
                        <Text style={styles.moreText}>+{booking.time_slots.length - 2} more</Text>
                      )}
                    </View>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionItem, styles.viewAction]}
                  onPress={() => handleViewBooking(booking)}
                >
                  <FontAwesomeIcon icon={faEye} size={14} color="#3B82F6" />
                  <Text style={styles.viewText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionItem, styles.editAction]}
                  onPress={() => handleEditBooking(booking)}
                >
                  <FontAwesomeIcon icon={faEdit} size={14} color="#10B981" />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionItem, styles.deleteAction]}
                  onPress={() => handleDeleteBooking(booking)}
                >
                  <FontAwesomeIcon icon={faTrash} size={14} color="#EF4444" />
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerRight: {
    width: 36,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    marginHorizontal: 16,
    marginTop: -10,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 2,
  },
  bookingsList: {
    flex: 1,
    marginTop: 16,
  },
  bookingsListContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  bookingDate: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 1,
  },
  detailValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '500',
  },
  timeSlotsPreview: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  timeSlotsLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  timeSlotsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  timeSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timeSlotChipText: {
    fontSize: 9,
    color: '#4B5563',
  },
  moreText: {
    fontSize: 9,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewAction: {
    backgroundColor: '#EFF6FF',
  },
  viewText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  editAction: {
    backgroundColor: '#D1FAE5',
  },
  editText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  deleteAction: {
    backgroundColor: '#FEE2E2',
  },
  deleteText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
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

export default FacilityBookingsScreen;