import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  FlatList,
  Animated,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Calendar } from 'react-native-calendars';
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';

const { width, height } = Dimensions.get('window');

const ActivityCalendarScreen = ({ route, navigation }) => {
  const { userCnic, userUniversityId } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [calendarData, setCalendarData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [markedDates, setMarkedDates] = useState({});
  const [open, setOpen] = useState(false);
  const [universityItems, setUniversityItems] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(moment().format('MMMM YYYY'));
  
  const [formData, setFormData] = useState({
    title: '',
    activity_date: moment().format('YYYY-MM-DD'),
    activity_mode: 'Physical',
    venue: '',
    university_id: userUniversityId || '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    console.log('[INIT] 🚀 ActivityCalendarScreen mounted');
    console.log('[INIT] 🔑 CNIC:', userCnic);
    console.log('[INIT] 🏛️ University ID:', userUniversityId);
    
    if (userCnic && userCnic.length > 5) {
      fetchCalendarData();
      fetchUniversities();
    } else {
      Alert.alert('Error', 'CNIC not available. Please go back and try again.');
      navigation.goBack();
    }
  }, [userCnic]);

  useEffect(() => {
    if (calendarData && calendarData.activities) {
      prepareMarkedDates();
    }
  }, [calendarData]);

  useEffect(() => {
    // Pre-select user's university when universities are loaded
    if (universities.length > 0 && userUniversityId) {
      const userUni = universities.find(uni => uni.id == userUniversityId);
      if (userUni) {
        setFormData(prev => ({
          ...prev,
          university_id: userUniversityId.toString(),
        }));
        console.log('[INIT] ✅ User university pre-selected:', userUni.name);
      }
    }
  }, [universities, userUniversityId]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      
      const API_URL = 'https://b00886286dc4.ngrok-free.app/api/activity-calendar/scheduled-activities';
      
      const requestBody = {
        cnic: userCnic,
        year: moment().year(),
        month: moment().month() + 1,
      };
      
      console.log('[API] 📦 Fetching calendar data...');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('[API] ✅ Calendar data received:', data.success);
      
      if (data.success) {
        setCalendarData(data.data);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } else {
        Alert.alert('Error', data.message || 'Failed to load calendar data');
      }
    } catch (error) {
      console.error('[ERROR] 💥 API call failed:', error);
      Alert.alert('Connection Error', 'Failed to fetch calendar data. Please check your internet.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const API_URL = 'https://b00886286dc4.ngrok-free.app/api/activity-calendar/universitiess';
      
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const data = await response.json();
      
      if (data.success) {
        const uniData = data.data || [];
        setUniversities(uniData);
        
        // Format for dropdown
        const formattedItems = uniData.map(uni => ({
          label: uni.name,
          value: uni.id.toString(),
          ...uni
        }));
        
        setUniversityItems(formattedItems);
      }
    } catch (error) {
      console.error('[ERROR] 💥 Failed to fetch universities:', error);
    }
  };

  const prepareMarkedDates = () => {
    const marks = {};
    
    // Today's date
    const today = moment().format('YYYY-MM-DD');
    marks[today] = {
      selected: true,
      selectedColor: '#6B2D5C',
      selectedTextColor: '#fff',
      customStyles: {
        container: {
          backgroundColor: '#6B2D5C',
          borderRadius: 20,
        },
        text: {
          color: 'white',
          fontWeight: 'bold',
        }
      }
    };

    // Mark dates with activities
    if (calendarData.booked_dates) {
      calendarData.booked_dates.forEach(date => {
        const activity = calendarData.activities.find(a => a.start === date);
        const isPast = moment(date).isBefore(moment(), 'day');
        
        marks[date] = {
          selected: true,
          selectedColor: isPast ? '#4CAF50' : '#FF5722',
          selectedTextColor: '#fff',
          dotColor: '#fff',
          marked: true,
          customStyles: {
            container: {
              backgroundColor: isPast ? '#4CAF50' : '#FF5722',
              borderRadius: 20,
              elevation: 3,
            },
            text: {
              color: 'white',
              fontWeight: 'bold',
            }
          },
          activity: activity,
        };
      });
    }

    // Mark selected date
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: '#9C27B0',
        selectedTextColor: '#fff',
        customStyles: {
          container: {
            backgroundColor: '#9C27B0',
            borderRadius: 20,
            borderWidth: 2,
            borderColor: '#fff',
            elevation: 5,
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
            fontSize: 16,
          }
        },
      };
    }

    setMarkedDates(marks);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCalendarData();
  };

  const handleDateSelect = (day) => {
    console.log('[ACTION] 📅 Date selected:', day.dateString);
    setSelectedDate(day.dateString);
    
    const activity = calendarData?.activities?.find(a => a.start === day.dateString);
    if (activity) {
      setSelectedActivity(activity);
      setShowActivityModal(true);
    } else if (moment(day.dateString).isSameOrAfter(moment(), 'day')) {
      // Allow scheduling for today or future dates
      setFormData(prev => ({
        ...prev,
        activity_date: day.dateString,
      }));
      setShowScheduleModal(true);
    } else {
      Alert.alert('Past Date', 'Cannot schedule activities for past dates.');
    }
  };

  const handleMonthChange = (month) => {
    console.log('[CALENDAR] 📅 Month changed to:', month.month, month.year);
    const newMonth = moment(`${month.year}-${month.month}-01`).format('MMMM YYYY');
    setCurrentMonth(newMonth);
  };

  const handleScheduleActivity = async () => {
    // Validate form
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.activity_date) errors.activity_date = 'Date is required';
    if (!formData.activity_mode) errors.activity_mode = 'Mode is required';
    
    // Venue is required only for Physical mode, optional for Online
    if (formData.activity_mode === 'Physical' && !formData.venue.trim()) {
      errors.venue = 'Venue is required for Physical mode';
    }
    
    if (!formData.university_id) errors.university_id = 'University is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Prepare data for API
    const requestData = {
      cnic: userCnic,
      title: formData.title,
      activity_date: formData.activity_date,
      activity_mode: formData.activity_mode,
      university_id: formData.university_id,
    };
    
    // Add venue only if provided
    if (formData.venue.trim()) {
      requestData.venue = formData.venue;
    }

    try {
      setIsSubmitting(true);
      
      const API_URL = 'https://b00886286dc4.ngrok-free.app/api/activity-calendar/schedule';
      
      console.log('[API] 📦 Scheduling activity...');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();
      console.log('[API] ✅ Schedule response:', data.success);
      
      if (data.success) {
        Alert.alert('Success!', 'Activity scheduled successfully!', [
          { 
            text: 'OK', 
            onPress: () => {
              setShowScheduleModal(false);
              resetForm();
              fetchCalendarData();
            }
          }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to schedule activity');
      }
    } catch (error) {
      console.error('[ERROR] 💥 Schedule failed:', error);
      Alert.alert('Error', 'Failed to schedule activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteActivity = (activityId) => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteActivity(activityId)
        }
      ]
    );
  };

  const deleteActivity = async (activityId) => {
    try {
      const API_URL = `https://b00886286dc4.ngrok-free.app/api/activity-calendar/activity/${activityId}`;
      
      const requestBody = {
        cnic: userCnic,
      };
      
      const response = await fetch(API_URL, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', 'Activity deleted successfully!');
        setShowActivityModal(false);
        fetchCalendarData();
      } else {
        Alert.alert('Error', data.message || 'Failed to delete activity');
      }
    } catch (error) {
      console.error('[ERROR] 💥 Delete failed:', error);
      Alert.alert('Error', 'Failed to delete activity. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      activity_date: moment().format('YYYY-MM-DD'),
      activity_mode: 'Physical',
      venue: '',
      university_id: userUniversityId || '',
    });
    setFormErrors({});
    setOpen(false);
  };

  const renderCalendar = () => {
    return (
      <View style={styles.calendarContainer}>
        {/* Custom Calendar Header */}
        <View style={styles.calendarHeader}>
          <Text style={styles.calendarHeaderText}>
            {currentMonth}
          </Text>
        </View>
        
        <Calendar
          current={selectedDate}
          minDate={moment().format('YYYY-MM-DD')}
          maxDate={moment().add(6, 'months').format('YYYY-MM-DD')}
          onDayPress={handleDateSelect}
          onMonthChange={handleMonthChange}
          markedDates={markedDates}
          hideExtraDays={true}
          enableSwipeMonths={true}
          theme={{
            textSectionTitleColor: '#6B2D5C',
            textMonthFontWeight: 'bold',
            textMonthFontSize: 0,
            monthTextColor: 'transparent',
            calendarBackground: '#ffffff',
            selectedDayBackgroundColor: '#9C27B0',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#6B2D5C',
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: '#6B2D5C',
            selectedDotColor: '#ffffff',
            arrowColor: '#6B2D5C',
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontWeight: '500',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
            'stylesheet.calendar.header': {
              week: {
                marginTop: 5,
                marginBottom: 5,
                flexDirection: 'row',
                justifyContent: 'space-around',
                backgroundColor: '#f8f9fa',
                paddingVertical: 8,
                borderRadius: 10,
                marginHorizontal: 5,
              },
              dayHeader: {
                color: '#6B2D5C',
                fontWeight: '600',
                fontSize: 12,
              }
            }
          }}
          dayComponent={({date, state, marking}) => {
            const isToday = date.dateString === moment().format('YYYY-MM-DD');
            const isSelected = date.dateString === selectedDate;
            const hasActivity = marking?.marked;
            
            return (
              <TouchableOpacity
                style={[
                  styles.dayContainer,
                  isToday && styles.todayContainer,
                  isSelected && styles.selectedContainer,
                  hasActivity && styles.activityDayContainer,
                  state === 'disabled' && styles.disabledDay,
                ]}
                onPress={() => handleDateSelect(date)}
                disabled={state === 'disabled'}
              >
                <Text style={[
                  styles.dayText,
                  isToday && styles.todayText,
                  isSelected && styles.selectedText,
                  state === 'disabled' && styles.disabledText,
                  hasActivity && styles.activityDayText,
                ]}>
                  {date.day}
                </Text>
                {hasActivity && (
                  <View style={[
                    styles.activityDot,
                    { backgroundColor: marking.selectedColor }
                  ]} />
                )}
              </TouchableOpacity>
            );
          }}
        />
        
      
      </View>
    );
  };

  const renderActivityList = () => {
    const activities = calendarData?.activities || [];
    
    if (activities.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="calendar-plus" size={40} color="#D2ECFF" />
          <Text style={styles.emptyStateTitle}>No Activities Scheduled Yet</Text>
          <Text style={styles.emptyStateText}>
            Tap on any future date to schedule your first orientation activity
          </Text>
          <TouchableOpacity 
            style={styles.scheduleButton}
            onPress={() => {
              setFormData(prev => ({
                ...prev,
                activity_date: moment().format('YYYY-MM-DD'),
              }));
              setShowScheduleModal(true);
            }}
          >
            <Icon name="plus-circle" size={14} color="#fff" />
            <Text style={styles.scheduleButtonText}>Schedule First Activity</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.activityListContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Scheduled Activities</Text>
          <Text style={styles.activityCount}>
            {activities.length}
          </Text>
        </View>
        
        <FlatList
          data={activities.sort((a, b) => new Date(a.start) - new Date(b.start))}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={[
                styles.activityCard,
                index === 0 && styles.firstActivityCard,
              ]}
              onPress={() => {
                setSelectedActivity(item);
                setShowActivityModal(true);
              }}
            >
              <View style={styles.activityCardHeader}>
                <View style={[
                  styles.activityIcon,
                  { backgroundColor: item.backgroundColor }
                ]}>
                  <Icon 
                    name={moment(item.start).isBefore(moment(), 'day') ? 'check-circle' : 'calendar'} 
                    size={14} 
                    color="#fff" 
                  />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.activityDate}>
                    <Icon name="calendar" size={8} color="#666" />{' '}
                    {moment(item.start).format('ddd, MMM D, YYYY')}
                  </Text>
                </View>
                <View style={styles.activityStatusBadge}>
                  <Text style={[
                    styles.statusText,
                    { color: moment(item.start).isBefore(moment(), 'day') ? '#4CAF50' : '#FF5722' }
                  ]}>
                    {moment(item.start).isBefore(moment(), 'day') ? 'Completed' : 'Upcoming'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.activityDetails}>
                <View style={styles.detailItem}>
                  <Icon name="map-marker" size={10} color="#6B2D5C" />
                  <Text style={styles.detailText}>
                    {item.extendedProps.mode === 'Physical' 
                      ? item.extendedProps.venue || 'Venue TBD'
                      : '🌐 Online Session'}
                  </Text>
                </View>
                
                <View style={styles.detailItem}>
                  <Icon name="university" size={10} color="#6B2D5C" />
                  <Text style={styles.detailText}>
                    {item.extendedProps.university_name || 'University'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => {
                  setSelectedActivity(item);
                  setShowActivityModal(true);
                }}
              >
                <Text style={styles.viewDetailsText}>View Details</Text>
                <Icon name="chevron-right" size={10} color="#6B2D5C" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderScheduleModal = () => {
    return (
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setShowScheduleModal(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#6B2D5C', '#3E2A5D']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <Icon name="calendar" size={12} color="#fff" />
                <Text style={styles.modalTitle}>Schedule New Activity</Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowScheduleModal(false);
                  resetForm();
                }}
              >
                <Icon name="times" size={10} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <ScrollView 
              style={styles.modalBody} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>Activity Information</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Activity Title <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, formErrors.title && styles.inputError]}
                    placeholder="e.g., Orientation Session, Workshop, Training"
                    placeholderTextColor="#999"
                    value={formData.title}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, title: text }));
                      if (formErrors.title) setFormErrors(prev => ({ ...prev, title: '' }));
                    }}
                  />
                  {formErrors.title && (
                    <Text style={styles.errorText}>{formErrors.title}</Text>
                  )}
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Date <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={[styles.input, styles.dateInput]}>
                    <Icon name="calendar" size={14} color="#6B2D5C" style={styles.inputIcon} />
                    <Text style={styles.dateText}>
                      {moment(formData.activity_date).format('dddd, MMMM D, YYYY')}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Activity Mode <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={styles.modeSelector}>
                    <TouchableOpacity
                      style={[
                        styles.modeButton,
                        formData.activity_mode === 'Physical' && styles.modeButtonActive
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, activity_mode: 'Physical' }));
                        if (formErrors.activity_mode) setFormErrors(prev => ({ ...prev, activity_mode: '' }));
                      }}
                    >
                      <Icon 
                        name="map-marker" 
                        size={12} 
                        color={formData.activity_mode === 'Physical' ? '#fff' : '#6B2D5C'} 
                      />
                      <Text style={[
                        styles.modeButtonText,
                        formData.activity_mode === 'Physical' && styles.modeButtonTextActive
                      ]}>
                        Physical
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.modeButton,
                        formData.activity_mode === 'Online' && styles.modeButtonActive
                      ]}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, activity_mode: 'Online' }));
                        if (formErrors.activity_mode) setFormErrors(prev => ({ ...prev, activity_mode: '' }));
                      }}
                    >
                      <Icon 
                        name="video-camera" 
                        size={12} 
                        color={formData.activity_mode === 'Online' ? '#fff' : '#6B2D5C'} 
                      />
                      <Text style={[
                        styles.modeButtonText,
                        formData.activity_mode === 'Online' && styles.modeButtonTextActive
                      ]}>
                        Online
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {formErrors.activity_mode && (
                    <Text style={styles.errorText}>{formErrors.activity_mode}</Text>
                  )}
                </View>
                
                {/* Venue Field - Show for both modes but optional for Online */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    Venue {formData.activity_mode === 'Physical' && <Text style={styles.requiredStar}>*</Text>}
                    {formData.activity_mode === 'Online' && (
                      <Text style={styles.optionalText}> (Optional)</Text>
                    )}
                  </Text>
                  <TextInput
                    style={[styles.input, formData.activity_mode === 'Physical' && formErrors.venue && styles.inputError]}
                    placeholder={
                      formData.activity_mode === 'Physical' 
                        ? 'Enter venue address or location' 
                        : 'Enter online meeting link (optional)'
                    }
                    placeholderTextColor="#999"
                    value={formData.venue}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, venue: text }));
                      if (formErrors.venue) setFormErrors(prev => ({ ...prev, venue: '' }));
                    }}
                  />
                  {formData.activity_mode === 'Physical' && formErrors.venue && (
                    <Text style={styles.errorText}>{formErrors.venue}</Text>
                  )}
                </View>
              </View>
              
              <View style={styles.formSection}>
                <Text style={styles.sectionLabel}>University Details</Text>
                
                <View style={styles.formGroup}>
                  <Text style={styles.label}>
                    University <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View style={[styles.dropdownContainer, formErrors.university_id && styles.inputError]}>
                    <DropDownPicker
                      open={open}
                      value={formData.university_id}
                      items={universityItems}
                      setOpen={setOpen}
                      setValue={(callback) => {
                        const value = callback(formData.university_id);
                        setFormData(prev => ({ ...prev, university_id: value }));
                        if (formErrors.university_id) {
                          setFormErrors(prev => ({ ...prev, university_id: '' }));
                        }
                      }}
                      setItems={setUniversityItems}
                      placeholder="Select your university"
                      searchable={true}
                      searchPlaceholder="Search universities..."
                      style={styles.dropdown}
                      dropDownContainerStyle={styles.dropdownList}
                      listMode="MODAL"
                      modalTitle="Select University"
                      modalAnimationType="slide"
                      modalProps={{
                        animationType: 'slide'
                      }}
                      listItemLabelStyle={styles.dropdownItem}
                      selectedItemLabelStyle={styles.dropdownItemSelected}
                      searchTextInputStyle={styles.dropdownSearch}
                      showArrowIcon={true}
                      ArrowUpIconComponent={() => <Icon name="chevron-up" size={14} color="#6B2D5C" />}
                      ArrowDownIconComponent={() => <Icon name="chevron-down" size={14} color="#6B2D5C" />}
                      TickIconComponent={() => <Icon name="check" size={12} color="#6B2D5C" />}
                      closeOnBackPressed={true}
                      closeAfterSelecting={true}
                      zIndex={5000}
                      zIndexInverse={5000}
                    />
                  </View>
                  {formErrors.university_id && (
                    <Text style={styles.errorText}>{formErrors.university_id}</Text>
                  )}
                  {formData.university_id && (
                    <Text style={styles.selectedUniversityNote}>
                      Selected: {universityItems.find(item => item.value === formData.university_id)?.label}
                    </Text>
                  )}
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setShowScheduleModal(false);
                  resetForm();
                }}
              >
                <Icon name="times" size={14} color="#6B2D5C" />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={handleScheduleActivity}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="calendar" size={14} color="#fff" />
                    <Text style={styles.submitButtonText}>Schedule Activity</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderActivityModal = () => {
    if (!selectedActivity) return null;
    
    const activity = selectedActivity;
    const isPast = moment(activity.start).isBefore(moment(), 'day');
    
    return (
      <Modal
        visible={showActivityModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowActivityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.activityModalContent}>
            <LinearGradient
              colors={[isPast ? '#4CAF50' : '#FF5722', isPast ? '#388E3C' : '#D84315']}
              style={styles.activityModalHeader}
            >
              <View style={styles.activityModalHeaderContent}>
                <Icon 
                  name={isPast ? 'check-circle' : 'calendar'} 
                  size={18} 
                  color="#fff" 
                />
                <Text style={styles.activityModalTitle} numberOfLines={2}>
                  Orientation Activity Details
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowActivityModal(false)}
              >
                <Icon name="times" size={18} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <ScrollView style={styles.activityModalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.activityDetailSection}>
                <Text style={styles.detailSectionTitle}>Activity Details</Text>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Icon name="tasks" size={14} color="#6B2D5C" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Activity Title</Text>
                    <Text style={styles.detailValue}>
                      {activity.title}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Icon name="calendar" size={14} color="#6B2D5C" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>
                      {moment(activity.start).format('dddd, MMMM D, YYYY')}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Icon name="clock-o" size={14} color="#6B2D5C" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: isPast ? '#4CAF50' : '#FF5722' }
                    ]}>
                      <Text style={styles.statusBadgeText}>
                        {isPast ? 'Completed' : 'Upcoming'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Icon name="map-marker" size={14} color="#6B2D5C" />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>Mode</Text>
                    <Text style={styles.detailValue}>
                      {activity.extendedProps.mode}
                    </Text>
                  </View>
                </View>
                
                {activity.extendedProps.venue && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="location-arrow" size={14} color="#6B2D5C" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>
                        {activity.extendedProps.mode === 'Physical' ? 'Venue' : 'Online Link'}
                      </Text>
                      <Text style={styles.detailValue}>
                        {activity.extendedProps.venue}
                      </Text>
                    </View>
                  </View>
                )}
                
                {activity.extendedProps.university_name && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="university" size={14} color="#6B2D5C" />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>University</Text>
                      <Text style={styles.detailValue}>
                        {activity.extendedProps.university_name}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              
              {/* Action Buttons */}
              <View style={styles.activityActionButtons}>
                {!isPast && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteActivity(activity.id)}
                  >
                    <Icon name="trash" size={14} color="#fff" />
                    <Text style={styles.actionButtonText}>Delete Activity</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.closeDetailButton]}
                  onPress={() => setShowActivityModal(false)}
                >
                  <Icon name="check" size={14} color="#fff" />
                  <Text style={styles.actionButtonText}>Close Details</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  // Loading Screen
  if (loading && !calendarData) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar backgroundColor="#6B2D5C" barStyle="light-content" />
        <LinearGradient
          colors={['#6B2D5C', '#3E2A5D']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading Activity Calendar...</Text>
          <Text style={styles.loadingSubtext}>
            Preparing your schedule dashboard
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // Main Screen
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B2D5C" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6B2D5C', '#3E2A5D']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={18} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Activity Calendar</Text>
          <Text style={styles.headerSubtitle}>
            Schedule and manage orientation activities
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerIconButton}
            onPress={() => {
              Alert.alert('Info', 'Tap on future dates to schedule activities or use the + button below');
            }}
          >
            <Icon name="info-circle" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.scheduleButtonHeader}
            onPress={() => {
              setFormData(prev => ({
                ...prev,
                activity_date: moment().format('YYYY-MM-DD'),
                university_id: userUniversityId || '',
              }));
              setShowScheduleModal(true);
            }}
          >
            <Icon name="plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6B2D5C']}
            tintColor="#6B2D5C"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          
          {/* Calendar Section */}
          {renderCalendar()}
          
          {/* Activities List Section */}
          {renderActivityList()}
          
          {/* Quick Stats */}
          {calendarData && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Icon name="tasks" size={16} color="#6B2D5C" />
                <Text style={styles.statNumber}>
                  {calendarData.total_activities || 0}
                </Text>
                <Text style={styles.statLabel}>Total Activities</Text>
              </View>
              
              <View style={styles.statCard}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.statNumber}>
                  {calendarData.activities?.filter(a => moment(a.start).isBefore(moment(), 'day')).length || 0}
                </Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
              
              <View style={styles.statCard}>
                <Icon name="calendar" size={16} color="#FF5722" />
                <Text style={styles.statNumber}>
                  {calendarData.activities?.filter(a => moment(a.start).isSameOrAfter(moment(), 'day')).length || 0}
                </Text>
                <Text style={styles.statLabel}>Upcoming</Text>
              </View>
            </View>
          )}
          
          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>📅 How to Use Calendar</Text>
            <View style={styles.instructionStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Tap any future date</Text> to schedule a new activity
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Click on colored dates</Text> to view activity details
              </Text>
            </View>
            <View style={styles.instructionStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Swipe left/right</Text> to navigate between months
              </Text>
            </View>
          </View>
          
        </Animated.View>
      </ScrollView>
      
      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => {
          setFormData(prev => ({
            ...prev,
            activity_date: moment().format('YYYY-MM-DD'),
            university_id: userUniversityId || '',
          }));
          setShowScheduleModal(true);
        }}
      >
        <Icon name="plus" size={20} color="#fff" />
      </TouchableOpacity>
      
      {/* Modals */}
      {renderScheduleModal()}
      {renderActivityModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#D2ECFF',
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#D2ECFF',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleButtonHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  calendarHeaderText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B2D5C',
  },
  dayContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginVertical: 2,
  },
  todayContainer: {
    backgroundColor: '#6B2D5C',
  },
  selectedContainer: {
    backgroundColor: '#9C27B0',
    borderWidth: 2,
    borderColor: '#fff',
  },
  activityDayContainer: {
    elevation: 2,
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  disabledText: {
    color: '#ccc',
  },
  activityDayText: {
    fontWeight: '700',
  },
  activityDot: {
    position: 'absolute',
    bottom: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1.5,
    borderTopColor: '#f0f0f0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '600',
  },
  activityListContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B2D5C',
  },
  activityCount: {
    fontSize: 8,
    color: '#FF5722',
    fontWeight: '700',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activityCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#6B2D5C',
  },
  firstActivityCard: {
    borderLeftColor: '#4CAF50',
  },
  activityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
    lineHeight: 14,
  },
  activityDate: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
  },
  activityStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 7,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  activityDetails: {
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  detailText: {
    fontSize: 9,
    color: '#555',
    flex: 1,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 8,
    color: '#6B2D5C',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyStateTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B2D5C',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 9,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 14,
  },
  scheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B2D5C',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  scheduleButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 9,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#333',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 9,
    color: '#666',
    marginTop: 3,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 20,
    padding: 15,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B2D5C',
    marginBottom: 15,
    textAlign: 'center',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  stepIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#6B2D5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 8,
  },
  stepText: {
    flex: 1,
    fontSize: 10,
    color: '#555',
    lineHeight: 14,
  },
  stepBold: {
    fontWeight: '700',
    color: '#333',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6B2D5C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: height * 0.8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
    maxHeight: height * 0.5,
  },
  formSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B2D5C',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1.5,
    borderBottomColor: '#f0f0f0',
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#dc3545',
  },
  optionalText: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 11,
    color: '#333',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 9,
    color: '#dc3545',
    marginTop: 4,
    fontWeight: '500',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 9,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    gap: 6,
  },
  modeButtonActive: {
    backgroundColor: '#6B2D5C',
    borderColor: '#6B2D5C',
  },
  modeButtonText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#6B2D5C',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  dropdownContainer: {
    marginTop: 4,
    zIndex: 5000,
  },
  dropdown: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    minHeight: 42,
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginTop: 4,
  },
  dropdownItem: {
    fontSize: 11,
    color: '#333',
  },
  dropdownItemSelected: {
    fontWeight: '600',
    color: '#6B2D5C',
  },
  dropdownSearch: {
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 11,
  },
  selectedUniversityNote: {
    fontSize: 9,
    color: '#4CAF50',
    marginTop: 6,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#6B2D5C',
    backgroundColor: '#fff',
    gap: 6,
  },
  cancelButtonText: {
    color: '#6B2D5C',
    fontWeight: '700',
    fontSize: 10,
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#6B2D5C',
    gap: 6,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 10,
  },
  activityModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: height * 0.7,
    overflow: 'hidden',
  },
  activityModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  activityModalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  activityModalTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
  },
  activityModalBody: {
    padding: 16,
  },
  activityDetailSection: {
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B2D5C',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    color: '#777',
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 10,
    color: '#333',
    fontWeight: '500',
    lineHeight: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 2,
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 8,
  },
  activityActionButtons: {
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },
  closeDetailButton: {
    backgroundColor: '#6B2D5C',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 9,
  },
});

export default ActivityCalendarScreen;