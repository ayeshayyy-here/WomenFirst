import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Loader from '../components/Loader'; // Assuming you're using a custom Loader component
import syncStorage from 'react-native-sync-storage';

const EditRooms = ({ navigation }) => {
  const [roomsData, setRoomsData] = useState([]);
  const [userStatus, setUserStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedBeds, setAppliedBeds] = useState([]); // Track applied beds

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(syncStorage.get('user'));
        const userId = user.id; // Assuming user.id exists
        const districtId = user.district; // Assuming user.district exists

        // Fetch instituteId using userId
        const instituteResponse = await fetch(`https://wwh.punjab.gov.pk/api/userinstitute/${userId}`);
        const instituteData = await instituteResponse.json();
        const instituteId = instituteData.institute[0].institute; // Correctly accessing institute ID

        // Fetch room data with dynamic URL using districtId, instituteId, and userId
        const roomResponse = await fetch(`https://wwh.punjab.gov.pk/api/newroomsStatusUserEnd/${userId}`);
        const roomData = await roomResponse.json();

        // Track which beds the user has applied for
        const applied = roomData.data.flatMap(room => room.beds.filter(bed => bed.status.startsWith('Your application is pending')));
        setAppliedBeds(applied.map(bed => bed.bed_id)); // Store the applied bed IDs

        setRoomsData(roomData.data);
        setUserStatus(roomData.user_status);
      } catch (err) {
        console.error('Error fetching data:', err.message); // Log error if any
        setError(err.message);
        ToastAndroid.show('Failed to fetch room data. Please try again.', ToastAndroid.LONG);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Trigger data fetching on component mount
  }, []);

  const hideUserStatus = () => {
    setUserStatus('');
  };

  const handleApply = async (bedId) => {
    setLoading(true);
    try {
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user.id;
  

      // Fetch room_id based on bed_id
      const roomResponse = await fetch(`https://wwh.punjab.gov.pk/api/bedbyroom/${bedId}`);
      const roomResult = await roomResponse.json();

      let roomId = null;
      if (roomResult.success) {
        roomId = roomResult.room_id;
      } else {
        console.error('Error fetching room_id:', roomResult.message);
        throw new Error('Failed to retrieve room information');
      }

      // Fetch institute_id based on user_id
      const instituteResponse = await fetch(`https://wwh.punjab.gov.pk/api/userinstitute/${userId}`);
      const instituteResult = await instituteResponse.json();

      let instituteId = null;
      if (instituteResult.success && instituteResult.institute.length > 0) {
        instituteId = instituteResult.institute[0].institute;
      } else {
        console.error('Error fetching institute_id:', instituteResult.message);
        throw new Error('Failed to retrieve institute information');
      }
 // Fetch district_id based on user_id
 const districtResponse = await fetch(`https://wwh.punjab.gov.pk/api/userdistrict/${userId}`);
 const districtResult = await districtResponse.json();

 let districtId = null;
 if (districtResult.success && districtResult.district.length > 0) {
   districtId = districtResult.district[0].applied_district;
 } else {
   console.error('Error fetching district_id:', districtResult.message);
   throw new Error('Failed to retrieve district information');
 }
      // Submit the application
      const response = await fetch('https://wwh.punjab.gov.pk/api/edituserbedapplication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          bed_id: bedId,
          district_id: districtId,
          institute_id: instituteId,
          user_id: userId,
        }),
      });

      const result = await response.json();
      console.log('Application response:', result);

      if (result.success) {
        ToastAndroid.show('Your request for the room has been edited successfully!', ToastAndroid.LONG);
        navigation.navigate('Dashboard');
      } else {
        ToastAndroid.show('Failed to edit room request. Please try again.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  const renderBedItem = ({ item }) => {
    const isApplied = appliedBeds.includes(item.bed_id);

    // Function to determine text color based on status
    const getStatusTextColor = (status) => {
      if (status === 'Available') return 'green';
      if (status.includes('rejected')) return 'gray';
      if (status.startsWith('Alloted to')) return 'maroon';
      if (status.startsWith('Your application is pending')) return 'red';
      if (status.startsWith('Your application is accepted')) return '#C06C84';
      return '#777'; // Default color for unspecified statuses
    };

    return (
      <LinearGradient
        colors={['#ffff', '#C06C84']}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={styles.bedItemContainer}
      >
        <View style={styles.bedInfo}>
          <Icon name="bed" size={24} color="#C06C84" />
          <View style={styles.bedDetails}>
            <Text style={styles.bedName}>{item.bed_name}</Text>
            <Text style={[styles.bedStatus, { color: getStatusTextColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>

        {!isApplied && (item.status === 'Available' || item.status.includes('rejected')) ? (
          <TouchableOpacity style={styles.applyButton} onPress={() => handleApply(item.bed_id)}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        ) : item.status.startsWith('Alloted to') ? (
          <View style={styles.allottedContainer}>
            <Icon name="check-circle" size={15} color="maroon" />
            <Text style={styles.reservedText}>Reserved</Text>
          </View>
        ) : item.status.startsWith('Your application is accepted') ? (
          <View style={styles.allottedContainer}>
            <Icon name="check-circle" size={10} color="green" />
            <Text style={styles.allottedText}>Accepted</Text>
          </View>
        ) : null}
      </LinearGradient>
    );
  };

  const renderRoomItem = ({ item }) => (
    <LinearGradient
      colors={['#C06C84', '#6C5B7B', '#ffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0.2, 0.6, 1]}
      style={styles.outerContainer}
    >
      <View style={styles.roomInfo}>
        <View style={styles.roomNameContainer}>
          <Text style={styles.roomName}>{item.room_name}</Text>
        </View>
        <Text style={styles.roomType}>Room Type: {item.room_type}</Text>
        <Text style={styles.roomStatus}>Room Status: {item.room_status}</Text>
      </View>

      <FlatList
        data={item.beds}
        renderItem={renderBedItem}
        keyExtractor={(bed) => bed.bed_id.toString()}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </LinearGradient>
  );

  if (loading) {
    return <Loader loading={loading} />;
  }

  if (error) {
    return <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>Error: {error}</Text>;
  }

  return (
    <View style={styles.mainBody}>
      <Text style={styles.headerTitle}>Edit Room Request</Text>
      {userStatus ? (
        <View style={styles.userStatusContainer}>
          <Text style={styles.userStatusText}>{userStatus}</Text>
          <TouchableOpacity onPress={hideUserStatus}>
            <Icon name="times-circle" size={20} color="maroon" />
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={roomsData}
        renderItem={renderRoomItem}
        keyExtractor={(room) => room.room_id.toString()}
        ItemSeparatorComponent={() => <View style={styles.roomSeparator} />}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'maroon',
    marginBottom: 20,
  },
  userStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8e8e8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#C06C84',
  },
  userStatusText: {
    fontSize: 10,
    color: '#C06C84',
    fontWeight: 'bold',
    flex: 1,
  },
  outerContainer: {
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    marginBottom: 15,
    marginTop: 15,
  },
  roomInfo: {
    marginBottom: 20,
    position: 'relative',
  },
  roomNameContainer: {
    position: 'absolute',
    top: -30,
    left: 10,
    backgroundColor: '#6C5B7B',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 25,
  },
  roomName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  roomType: {
    marginTop: 20,
    fontSize: 10,
    color: '#fff',
  },
  roomStatus: {
    position: 'absolute',
    top: 20,
    right: 0,
    fontSize: 10,
    color: '#fff',
  },
  bedItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#F3E5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bedDetails: {
    marginLeft: 15,
  },
  bedName: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 10,
  },
  bedStatus: {
    color: '#777',
    fontSize: 8,
  },
  applyButton: {
    backgroundColor: '#C06C84',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  applyText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 10,
  },
  allottedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allottedText: {
    marginLeft: 5,
    color: 'green',
    fontWeight: 'bold',
    fontSize: 8,
  },
  reservedText: {
    marginLeft: 5,
    color: 'maroon',
    fontWeight: 'bold',
    fontSize: 10,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#ddd',
    marginVertical: 5,
  },
  roomSeparator: {
    height: 15,
  },
});

export default EditRooms;