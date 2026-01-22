import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Loader from '../components/Loader'; // Assuming you're using a custom Loader component
import syncStorage from 'react-native-sync-storage';

const Rooms = ({ navigation }) => {
  const [roomsData, setRoomsData] = useState([]);
  const [userStatus, setUserStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedBeds, setAppliedBeds] = useState([]); // Track applied beds

  // Fetch data from API
  const fetchData = useCallback(async () => {
    console.log('Fetching data...');
    try {
      const user = JSON.parse(syncStorage.get('user'));
      if (!user || !user.id || !user.district) {
        throw new Error('User data is incomplete or missing.');
      }
  
      const userId = user.id;
      const districtId = user.district;
  
      console.log('Fetching institute data...');
      const instituteResponse = await fetch(`https://wwh.punjab.gov.pk/api/userinstitute/${userId}`);
      const instituteText = await instituteResponse.text(); // Get raw response text
      console.log('Institute API Response:', instituteText); // Log raw response
      const instituteData = JSON.parse(instituteText); // Parse as JSON
      if (!instituteData || !instituteData.institute || !instituteData.institute[0]) {
        throw new Error('Institute data is missing or invalid.');
      }
      const instituteId = instituteData.institute[0].institute;
      console.log('Institute ID:', instituteId);
  
      console.log('Fetching room data...');
      const roomResponse = await fetch(`https://wwh.punjab.gov.pk/api/dischargenewroomsStatusUserEnd/${userId}`);
      const roomText = await roomResponse.text(); // Get raw response text
      console.log('Room API Response:', roomText); // Log raw response
      const roomData = JSON.parse(roomText); // Parse as JSON
      if (!roomData || !roomData.data) {
        throw new Error('Room data is missing or invalid.');
      }
      console.log('Room data:', roomData);
  
      const applied = roomData.data.flatMap(room => room.beds.filter(bed => bed.status.startsWith('Your application is pending')));
      setAppliedBeds(applied.map(bed => bed.bed_id));
      console.log('Applied beds:', applied);
  
      setRoomsData(roomData.data);
      setUserStatus(roomData.user_status || '');
      setLoading(false);
    } catch (err) {
      console.error('Error:', err.message);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // Trigger data fetching on component mount
  }, [fetchData]);

  const hideUserStatus = () => {
    console.log('Hiding user status...');
    setUserStatus('');
  };

  const handleApply = (roomId, bedId) => {
    console.log(`Applying for Bed ID: ${bedId} in Room ID: ${roomId}`);
    navigation.navigate('ConfirmationScreen', { bedId });
  };

  // Function to determine text color based on status
  const getStatusTextColor = useCallback((status) => {
    if (status === 'Available') return 'green';
    if (status.includes('rejected')) return 'gray';
    if (status.startsWith('Alloted to')) return 'maroon';
    if (status.startsWith('Your application is pending')) return 'red';
    if (status.startsWith('Your application is accepted')) return '#C06C84';
    return '#777'; // Default color for unspecified statuses
  }, []);

  // Render individual bed item
  const renderBedItem = useCallback(({ item }) => {
    const isApplied = appliedBeds.includes(item.bed_id);
    console.log(`Rendering bed item: ${item.bed_name}, Status: ${item.status}`);

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
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => handleApply(item.room_id, item.bed_id)}
            accessible={true}
            accessibilityLabel={`Apply for bed ${item.bed_name}`}
            accessibilityRole="button"
          >
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
  }, [appliedBeds, getStatusTextColor]);

  // Render individual room item
  const renderRoomItem = useCallback(({ item }) => {
    console.log(`Rendering room item: ${item.room_name}`);
    return (
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
          keyExtractor={(bed) => bed.bed_id}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      </LinearGradient>
    );
  }, [renderBedItem]);

  if (loading) {
    console.log('Loading...');
    return <Loader loading={loading} />;
  }

  if (error) {
    console.log('Error:', error);
    return <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>Error: {error}</Text>;
  }

  console.log('Rendering Rooms screen...');
  return (
    <View style={styles.mainBody}>
      <Text style={styles.headerTitle}>Rooms</Text>
      {userStatus ? (
        <View style={styles.userStatusContainer}>
          {/* <Text style={styles.userStatusText}>{userStatus}</Text> */}
          <Text style={styles.userStatusText}> Room allotment status will display here</Text>
          <TouchableOpacity onPress={hideUserStatus}>
            <Icon name="times-circle" size={20} color="maroon" />
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={roomsData}
        renderItem={renderRoomItem}
        keyExtractor={(room) => room.room_id}
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

export default Rooms;