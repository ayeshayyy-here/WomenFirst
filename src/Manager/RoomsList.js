import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Sidebar from '../components/Sidebar';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader';
import VisitorIcon from '../../assets/images/location.png';

const RoomsList = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [userName, setUserName] = useState('Guest');
  const [rooms, setRooms] = useState([]);
  const navigation = useNavigation();

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const fetchRoomData = async (district, institute) => {
    try {
      setLoading(true);
      const user = JSON.parse(syncStorage.get('user')); 
      const apiUrl = `https://wwh.punjab.gov.pk/api/roomlistbym/${user.district}/${user.institute}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success) {
        setRooms(data.rooms);
      } else {
        Alert.alert('Error', 'Failed to fetch rooms');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching room data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(syncStorage.get('user'));
    const storedUserName = user?.institute || 'Guest';
    setUserName(storedUserName);

    if (user?.district && user?.institute) {
      fetchRoomData(user.district, user.institute);
    }

    const interval = setInterval(() => {
      const date = new Date();
      const hours = date.getHours() % 12 || 12;
      const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      const formattedTime = `${hours}:${minutes} ${ampm}`;
      const formattedDate = date.toDateString();
      setCurrentTime(formattedTime);
      setCurrentDate(formattedDate);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleEditPress = (roomId) => {
    Alert.alert('Edit Room', `Edit functionality for room ID: ${roomId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
       <LinearGradient
        colors={['#010048', '#020035', '#030022']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity   onPress={() => navigation.navigate('DashboardM')}>
                        <Icon name="arrow-left" size={20} color="#fff" style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Rooms List</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <Loader loading={loading} />
        ) : (
          rooms.map((room) => (
            <View key={room.id} style={styles.cardContainer}>
             <LinearGradient
  colors={['#020035', '#015B7B', '#ffffff']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.card}
>
  <View style={styles.cardLeft}>
    <Icon name="bed" size={20} color="#fff" style={styles.cardIcon} />
    <Text style={styles.cardTitle}>Name: {room.name}</Text>
    <Text style={styles.cardSubtitle}>{room.type} room</Text>
    <Text style={styles.cardStatus}>
      Status: {room.status === 'active' ? 'Active' : 'Disabled'}
    </Text>
  </View>
  <View style={styles.cardRight}>
    <View style={styles.instituteContainer}>
      <Image
        source={VisitorIcon}
        style={styles.locationIcon}
      />
      <Text style={styles.instituteText}>{room.institute_name}</Text>
    </View>
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => handleEditPress(room.id)}
    >
      <Text style={styles.editButtonText}>
      <Icon name="bed" size={10} color="#fff" style={styles.cardIcon} />
      </Text>
    </TouchableOpacity>
  </View>
</LinearGradient>

            </View>
          ))
        )}
      </ScrollView>
      <Sidebar isVisible={isSidebarVisible} onClose={toggleSidebar} />
      <TouchableOpacity style={styles.footerbutton}
        onPress={() => navigation.navigate('AddRooms')}>
        <Icon name="plus" size={20} color="#020035" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  icon: {
    padding: 10,
  },
  scrollContent: {
    paddingVertical: 20,
    flexGrow: 1,
  },
  cardContainer: {
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
 
  cardIcon: {
    marginBottom: 10,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 5,
  },
  cardSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 5,
  },
  cardStatus: {
    color: '#F1FBFF',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 5,
  },
 
  card: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 15,
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  instituteContainer: {
    flexDirection: 'row',  // Align icon and text in the same row
    alignItems: 'center',  // Center the content vertically
    marginBottom: 50,       // Position at the top of the card
  },
  locationIcon: {
    width: 20,
    height: 20,
    marginRight: 5,        // Space between icon and text
  },
  instituteText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#010048',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  footerbutton: {
    width: 60,
    height: 60,
    borderRadius: 30, // 50% of width and height for circular shape
    backgroundColor: '#E0E0E0', // your desired color
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    right: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, // for Android shadow
  },
});

export default RoomsList;
