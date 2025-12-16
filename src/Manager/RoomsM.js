import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Loader from '../components/Loader';
import syncStorage from 'react-native-sync-storage';
const RoomsM  = ({ route, navigation }) => {
  const [roomsData, setRoomsData] = useState([]); // State to hold rooms and beds data
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null); // State for error handling
  const user = JSON.parse(syncStorage.get('user')); // Assuming user data contains district and institute
    
    // Log district and institute from syncStorage
    console.log('User district:', user.district);
    console.log('User institute:', user.institute);
  // Fetch rooms and beds data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`https://wwh.punjab.gov.pk/api/dischargeroomsstatusmanagerend/${user.district}/${user.institute}`);
        const json = await response.json();
        console.log('API Response:', json); // Log the API response
        setRoomsData(json.data); // Update state with the API response
        setLoading(false); // Disable loading state
      } catch (err) {
        console.error('API Error:', err.message); // Log the error if any
        setError(err.message); // Handle any errors
        setLoading(false); // Disable loading state
      }
      
    };
  
    fetchData(); // Call the function to fetch data on component mount
  }, []);
  
  const handleApply = (roomId, bedId) => {
    console.log(`Applying for Bed ID: ${bedId} in Room ID: ${roomId}`);
    navigation.navigate('RequestDetails', { bedId });
  };


  const handleTakeAction = (pendingIds, rejectedIds) => {
    if (pendingIds && pendingIds.length > 0) {
      console.log("Pending Room IDs:", pendingIds);
      // Add functionality to handle pending IDs
      navigation.navigate('RequestDetails', { roomIds: pendingIds });
    }
    if (rejectedIds && rejectedIds.length > 0) {
      console.log("Rejected Room IDs:", rejectedIds);
      // Add functionality to handle rejected IDs
      navigation.navigate('RequestDetails', { roomIds: rejectedIds });
    }
  };
  
  // Updated renderBedItem function
  const renderBedItem = ({ item }) => {
      // Extract pending and rejected IDs from itemr
  const pendingIds = item.pending_rooms_booked_ids;
  const rejectedIds = item.rejected_rooms_booked_ids;
    return (
      <LinearGradient
        colors={['#ffff', '#020035']}
        start={{ x: 0.5, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={styles.bedItemContainer}
      >
        <View style={styles.bedInfo}>
          <Icon name="bed" size={24} color="#020035" />
          <View style={styles.bedDetails}>
            <Text style={styles.bedName}>{item.bed_name}</Text>
  
          
            {item.status === 'accepted' ? (
            <Text style={[styles.bedStatus, { color: 'green', fontWeight: 'bold' }]}>
              Resident Name: {item.user} 
            </Text>
          ) : (
            <Text style={styles.bedStatus}>{item.status}</Text> 
          )}
        </View>
      </View>

      {/* Conditional rendering for the action button or allotted text */}
      {item.status === 'accepted' ? (
        // Green circle with tick icon for accepted beds
        <View style={styles.allottedContainer}>
          <Icon name="check-circle" size={15} color="white" /> 
          <Text style={styles.allottedText}>Allotted</Text>
        </View>
      ) : (
        // Take Action button for other statuses (pending/rejected)
        <TouchableOpacity 
          style={styles.applyButton} 
          // onPress={() => handleApply(item.room_id, item.bed_id)}
        >
          <Text style={styles.applyText}></Text>
        </TouchableOpacity>
      )}
      </LinearGradient>
    );
  };
  

  // Render each room along with its beds
  const renderRoomItem = ({ item }) => (
    <View style={styles.body}>
    <LinearGradient
      colors={['#020035', '#015B7f', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0.2, 0.6, 1]}
      style={styles.outerContainer}
    >
      {/* Room Info */}
      <View style={styles.roomInfo}>
        <View style={styles.roomNameContainer}>
          <Text style={styles.roomName}>Name: {item.room_name}</Text>
        </View>
        <Text style={styles.roomType}>Room Type: {item.room_type}</Text>
        <Text style={styles.roomStatus}>Room Status: {item.room_status}</Text>
      </View>

      {/* Bed List within the Room */}
      <FlatList
        data={item.beds} // Passing the beds of the current room
        renderItem={renderBedItem} // Render each bed item
        keyExtractor={(bed) => bed.bed_id.toString()} // Unique key for each bed
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </LinearGradient>
    </View>
  );

  // If loading, show spinners
  if (loading) {
    return <Loader loading={loading} />;
  }

  // If there’s an error, show error message
  if (error) {
    return <Text style={{ color: 'red', textAlign: 'center', marginTop: 20 }}>Error: {error}</Text>;
  }

  return (
    <View style={styles.mainBody}>
      {/* Header */}
      <Text style={styles.headerTitle}>Rooms</Text>
      <View style={styles.Body}>
      {/* Room List */}
      <FlatList
        data={roomsData} // Data from the API
        renderItem={renderRoomItem} // Render each room item
        keyExtractor={(room) => room.room_id.toString()} // Unique key for each room
        ItemSeparatorComponent={() => <View style={styles.divider} />}
      />
    </View>
    </View>
  );
};


const styles = StyleSheet.create({
    mainBody: {
      flex: 1,
      padding: 20,
      backgroundColor: '#F5F5F5',
    },
    body: {
      
        paddingTop: 20,
        paddingBottom: 20,
      },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#020035',
      marginBottom: 10,
  
    },
 
    outerContainer: {
      padding: 20,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    roomInfo: {
      marginBottom: 20,
      position: 'relative',
    },
    roomNameContainer: {
      position: 'absolute',
      top: -30,
      left: 10,
      backgroundColor: 'gray',
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
    applyText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 10,
    },
    divider: {
      height: 0.5,
      backgroundColor: '#ddd',
      marginVertical: 5,
    },
    allottedContainer: {
        flexDirection: 'row', // Align the tick icon and text in a row
        alignItems: 'center', // Center them vertically
        backgroundColor: 'green',
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 15, 
      },
      allottedText: {
        color: 'white', // Green color for the allotted text
        fontWeight: 'bold', // Bold text
        marginLeft: 5, // Small space between the tick icon and text
        fontSize: 10, // Adjust font size to make it visible and clear
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
  });
  
  export default RoomsM;