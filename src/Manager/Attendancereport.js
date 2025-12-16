import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, Linking
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Loader from '../components/Loader';
import syncStorage from 'react-native-sync-storage';
const Attendancereport  = ({ route }) => {
    const { userId, name } = route.params;
  const [attendanceData, setAttendanceData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [locationData, setLocationData] = useState({
    checkInLocation: '',
    checkOutLocation: ''
  });

  const generateMonths = () => {
    const months = [];
    const startMonth = new Date(2024, 10);
    const currentMonth = new Date();
    while (startMonth <= currentMonth) {
      months.push({
        label: startMonth.toLocaleString('default', { month: 'long', year: 'numeric' }),
        month: startMonth.getMonth() + 1,
        year: startMonth.getFullYear(),
      });
      startMonth.setMonth(startMonth.getMonth() + 1);
    }
    return months.reverse();
  };

  const months = generateMonths();

  useEffect(() => {
    fetchAttendanceData(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const fetchAttendanceData = async (month, year) => {
    setLoading(true);
    const user = JSON.parse(syncStorage.get('user'));
    const storedUserId = user?.id;
    const name = user?.name;
    try {
      const response = await fetch(`https://wwh.punjab.gov.pk/api/attendanceChecklocationservices/${userId}/${month}/${year}`);
      const json = await response.json();
      if (json.success) {
        setAttendanceData(json.attendance);
      } else {
        Alert.alert('Error', 'Failed to fetch attendance data.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const showLocationModal = async (checkInLocation, checkOutLocation) => {
    setLoading(true);
    try {
      const checkInAddress = await fetchLocationAddress(checkInLocation.latitude, checkInLocation.longitude);
      const checkOutAddress = checkOutLocation
        ? await fetchLocationAddress(checkOutLocation.latitude, checkOutLocation.longitude)
        : 'N/A';

      setLocationData({ checkInLocation: checkInAddress, checkOutLocation: checkOutAddress });
      setIsModalVisible(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch location details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationAddress = async (latitude, longitude) => {
    if (!latitude || !longitude) {
      return 'Invalid location coordinates';
    }

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'WorkingWomenHostel/1.0 (https://wwh.punjab.gov.pk)',
          'Referer': 'https://wwh.punjab.gov.pk',
          'Accept-Language': 'en-US',
        },
      });
      if (!response.ok) {
        return `Location not available (Error: ${response.status})`;
      }
      const json = await response.json();
      return json.display_name || 'Unknown Location';
    } catch (error) {
      return 'Location not available';
    }
  };

  const renderAttendanceItem = ({ item }) => {
    return (
      <View style={styles.shadowContainer}>
        {/* Date and Day */}
        <LinearGradient
          colors={['#020035', '#015B7f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientContainer}
        >
          <Text style={styles.gradientText}>{new Date(item.date).getDate()}</Text>
          <Text style={styles.gradientValue}>{item.day}</Text>
        </LinearGradient>
  
        {/* Horizontal Scroll for Records */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recordsScroll}>
          {item.records.map((record, index) => (
            <View key={index} style={styles.recordContainer}>
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>
                  {record.type === 'check_in' ? 'CHECK-IN' : 'CHECK-OUT'}
                </Text>
                <Text style={styles.timeValue}>{record.time}</Text>
              </View>
              <TouchableOpacity
                style={styles.locationContainer}
                onPress={() => showLocationModal(record.location, null)}
              >
                <Icon name="map-marker" size={15} color="#020035" />
                <Text style={styles.detail}>    View Location</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.heading}>Attendance Record</Text>
        <View style={styles.userContainer}>
          <Text style={styles.username}>{name}</Text>
          <View style={styles.iconnWrapper}>
            <Icon name="user" size={10} color="#020035" />
          </View>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
        {months.map((month, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.monthContainer,
              month.month === selectedMonth && month.year === selectedYear ? styles.selectedMonth : {},
            ]}
            onPress={() => {
              setSelectedMonth(month.month);
              setSelectedYear(month.year);
              fetchAttendanceData(month.month, month.year);
            }}
          >
            <Text
              style={[
                styles.monthText,
                month.month === selectedMonth && month.year === selectedYear ? styles.selectedMonthText : {},
              ]}
            >
              {month.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <Loader loading={loading} />
      ) : (
        <FlatList
        data={attendanceData}
        renderItem={renderAttendanceItem}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        ListEmptyComponent={<Text style={styles.noDataText}>No Attendance Records Found</Text>}
      />
      
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.iconWrapper}>
              <View style={styles.iconContainer}>
                <Icon name="map-marker" size={40} color="#302F65" />
              </View>
            </View>
            <Text style={styles.modalTitle}>Location</Text>
         
            <Text style={styles.modalMessage}>{locationData.checkInLocation}</Text>
         
            <View style={styles.buttonRow}>
              <LinearGradient
                colors={['#352E64', '#015B7f', '#632D61', '#020035', '#020035']}
                locations={[0, 0.14, 0.39, 0.73, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalOption}
              >
                <TouchableOpacity style={styles.modalOption} onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.modalOptionText}>Close</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
    marginTop: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 10,
    fontWeight: '600',
    color: '#020035',
    marginRight: 5,
  },
  iconnWrapper: {
    padding: 5,
  },
  monthScroll: {
    marginVertical: 10,
  },
  monthContainer: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  monthText: {
    fontSize: 14,
    color: '#333333',
  },
  selectedMonthText: {
    color: '#020035',
    fontWeight: 'bold',
  },
  selectedMonth: {
    borderBottomWidth: 3,
    borderBottomColor: '#020035',
  },
  shadowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  
    marginBottom: 10,
    marginHorizontal: 10,
  
  },
  gradientContainer: {
    borderRadius: 15, // Rounded corners
    paddingVertical: 10, // Vertical padding for space
    paddingHorizontal: 10, // Horizontal padding for symmetry
    marginVertical: 8, // Space between cards
    width: 100, // Fixed width for the card
    alignItems: 'center', // Center the text
    justifyContent: 'center', // Center the text
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dateContainer: {
    alignItems: 'center', // Center align text vertically
  },
  gradientText: {
    fontSize: 18, // Larger font for date
    fontWeight: 'bold', // Bold text
    color: '#FFFFFF', // White color for contrast
  },
  gradientValue: {
    fontSize: 12, // Smaller font for day
    color: '#F0E68C', // Light yellow for better contrast
    marginTop: 5, // Add space between date and day
  },
  
  timeContainer: {
    alignItems: 'center',
    padding: 15,
  },
  timeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#020035',
    marginBottom: 10,
  },
  intimeValue: {
    fontSize: 10,
    color: 'green',
  },
  outtimeValue: {
    fontSize: 10,
    color: 'maroon',
  },
  detail: {
    fontSize: 8,
    color: '#020035',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  iconWrapper: {
    position: 'absolute',
    top: -30,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  iconContainer: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 30,
    color: 'black',
  },
  modalLabel: {
    fontSize: 12,
    marginBottom: 10,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalMessage: {
    fontSize: 10,
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  buttonRow: {
    width: '100%',
  },
  modalOption: {
    alignItems: 'center',
    paddingVertical: 5,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  modalOptionText: {
    fontSize: 16,
    color: 'white',
  },
  modalCancel: {
    alignItems: 'center',
    backgroundColor: 'gray',
    paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  modalCancelText: {
    color: 'white',
    fontSize: 16,
  },
  noDataText: {
    color: 'gray',
    fontSize: 12,
    textAlign: 'center',
  },
  recordsScroll: {
    marginTop: 10,
    paddingVertical: 5,
  },
  recordContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 10,
    width: 120, // Width for each record card
    elevation: 2,
  },
  timeValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  recordsScrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  
});

export default Attendancereport;
