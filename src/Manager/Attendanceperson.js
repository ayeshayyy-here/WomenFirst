import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../components/Loader';
import VisitorIcon from '../../assets/images/location.png';
import syncStorage from 'react-native-sync-storage';

const { width } = Dimensions.get('window');

const Attendanceperson = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set current time and date every second
    const interval = setInterval(() => {
      const date = new Date();
      const hours = date.getHours() % 12 || 12; // 12-hour format
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
      setCurrentDate(date.toDateString());
    }, 1000);

    fetchAttendanceData();
    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  // Add 5 hours to a given datetime string
  const addFiveHours = (datetime) => {
    if (!datetime || datetime === 'none') return null;
    const date = new Date(datetime);
    date.setHours(date.getHours() + 5);
    return date;
  };

  // Format the datetime for display
  const formatPrettyDate = (date) => {
    if (!date) return 'N/A';
  
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
  
    const timeString = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true, // Ensure AM/PM format
    });
  
    if (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    ) {
      return `Today at ${timeString}`;
    } else if (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    ) {
      return `Yesterday at ${timeString}`;
    } else {
      return `${date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })} at ${timeString}`;
    }
  };
  

  const fetchAttendanceData = async () => {
    try {
      const user = JSON.parse(syncStorage.get('user'));
     const apiUrl = `https://wwh.punjab.gov.pk/api/attendancedisplaymanager/${user.district}/${user.institute}`;
   // const apiUrl = `https://wwh.punjab.gov.pk/api/attendancedisplaymanager/1/7`;
      // Log district, institute, and API URL for debugging
      console.log('District:', user.district);
      console.log('Institute:', user.institute);
      console.log('Fetching API:', apiUrl);

      const response = await fetch(apiUrl);
      const json = await response.json();

      if (response.ok) {
        setAttendanceData(
          json.map((item) => ({
            user_id: item.user_id,
            user_name: item.user_name,
            lastActivity:
              item.last_checked_out_at && addFiveHours(item.last_checked_out_at) > addFiveHours(item.last_checked_in_at)
                ? { type: 'Checked Out', time: addFiveHours(item.last_checked_out_at) }
                : item.last_checked_in_at
                ? { type: 'Checked In', time: addFiveHours(item.last_checked_in_at) }
                : { type: 'No Activity', time: null },
          }))
        );
      } else {
        Alert.alert('Error', 'Failed to fetch attendance data.');
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      Alert.alert('Error', 'Unable to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePress = (userId, name) => {
    navigation.navigate('Attendancereport', { userId, name });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.container} onPress={() => handlePress(item.user_id, item.user_name)}>
      <View style={styles.iconContainer}>
        <Icon name="user" size={20} color="#020035" />
      </View>
      <Text style={styles.userName}>{item.user_name}</Text>
      <View style={styles.activityContainer}>
        <Text style={styles.activityLabel}>Last Activity:</Text>
        <Text
          style={[
            styles.activityText,
            item.lastActivity.type === 'Checked In'
              ? styles.checkedInText
              : item.lastActivity.type === 'Checked Out'
              ? styles.checkedOutText
              : styles.noActivityText,
          ]}
        >
          {item.lastActivity.type} {item.lastActivity.time ? formatPrettyDate(item.lastActivity.time) : ''}
        </Text>
      </View>
      <Icon name="chevron-right" size={10} color="gray" style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainBody}>
    <Loader loading={loading} />
    <View style={styles.section1}>
     <LinearGradient
         colors={['#020035', '#015B7f', '#020035']}
         start={{ x: 0, y: 0 }}
         end={{ x: 1, y: 1 }}
         locations={[0.2, 0.6, 1]}
        style={styles.headerContainer}
      >
        {/* Left Side: Image and Header Text */}
        <View style={styles.leftContainer}>
          <Image source={VisitorIcon} style={styles.image} />
          <Text style={styles.headerText}>Residents Attendance Tracker</Text>
        </View>
  
        {/* Right Side: Date and Time */}
        <View style={styles.rightContainer}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.timeText}>{currentTime}</Text>
        </View>
      </LinearGradient>
    </View>

      <FlatList
        data={attendanceData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.user_id}-${index}`}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  mainBody: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  section1: {
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    padding: 20,
  },
  leftContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  image: {
    width: 60,
    height: 60,
    marginBottom: 10, // Space between image and header text
  },
  headerText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center', // Align text to the left
  },
  dateText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
  },
  container: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 16,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  userName: {
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
  },
  activityContainer: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 12,
    color: '#020035',
    fontWeight: 'bold',
  },
  activityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  checkedInText: {
    color: 'green',
  },
  checkedOutText: {
    color: 'maroon',
  },
  noActivityText: {
    color: 'orange',
  },
  chevron: {
    marginLeft: 'auto',
  },
});

export default Attendanceperson;
