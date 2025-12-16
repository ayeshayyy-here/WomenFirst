import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import syncStorage from 'react-native-sync-storage';
import axios from 'axios';

const ChangeRooms = ({ navigation, route }) => {
  const { status } = route.params || { status: 'pending' };
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(syncStorage.get('user'));

  useEffect(() => {
    fetchRoomRequests();
  }, [status]);

  const fetchRoomRequests = async () => {
    setLoading(true);
    console.log('Fetching room requests for status:', status);
    console.log('User ID:', user.id);
    try {
      const response = await axios.post(
        'https://wwh.punjab.gov.pk/api/changeroomlist',
        { user_id: user.id, status }
      );
      console.log('API Response:', response.data);
      setData(response.data);
    } catch (error) {
      console.log('API Error:', error);
      Alert.alert('Error', 'Failed to fetch room requests');
    }
    setLoading(false);
  };
  const handleAction = async (requestId, action) => {
    const url = `https://wwh.punjab.gov.pk/api/updateRoomRequestStatus/${requestId}`;
    const payload = {
      status: action,
      date: new Date().toISOString().split('T')[0],
      manager_id: user.id,
    };
  
    console.log('Submitting Action:', { url, payload });
  
    try {
      const response = await axios.post(url, payload);
      console.log('Action Response:', response.data);
  
      Alert.alert('Success', response.data.message);
      fetchRoomRequests(); // Refresh data after update
    } catch (error) {
      console.error('Error updating request:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update request. Please try again.');
    }
  };
  
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.details}>CNIC: {item.cnic}</Text>
      <Text style={styles.details}>Job Type: {item.job_type}</Text>
      <Text style={styles.details}>Phone: {item.phone_no}</Text>
      <Text style={styles.details}>Room: {item.room_name}</Text>
      <Text style={styles.details}>Bed: {item.bed_name}</Text>
  
      {status === 'pending' && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#010048' }]}
            onPress={() => handleAction(item.room_id, 'accept')}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
  
          <TouchableOpacity
            style={[styles.button, { backgroundColor: 'maroon' }]}
            onPress={() => handleAction(item.room_id, 'reject')}
          >
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
  
      {status === 'accepted' && <Text style={styles.acceptedText}>Accepted</Text>}
      {status === 'rejected' && <Text style={styles.rejectedText}>Rejected</Text>}
    </View>
  );
  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Change Room Requests ({status})</Text>
      
      <View style={styles.iconContainer}>
        {['pending', 'accepted', 'rejected'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => navigation.navigate('ChangeRooms', { status: item })}
            style={styles.iconWrapper}
          >
            <Icon
              name="list"
              size={18}
              color="white"
              style={status === item ? styles.activeIcon : styles.icon}
            />
            <Text style={status === item ? styles.activeIconText : styles.iconText}>
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#010048" />
      ) : data.length > 0 ? (
        <FlatList
          data={data}
          keyExtractor={(item) => item.room_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noDataText}>No requests found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  header: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#010048',
    marginBottom: 25,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  iconWrapper: {
    alignItems: 'center',
  },
  icon: {
    backgroundColor: 'gray',
    paddingHorizontal: 40,
    paddingVertical: 8,
    borderRadius: 30,
  },
  activeIcon: {
    backgroundColor: '#010048',
    paddingHorizontal: 40,
    paddingVertical: 8,
    borderRadius: 30,
  },
  iconText: {
    color: 'gray',
    marginTop: 4,
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeIconText: {
    color: '#010048',
    fontWeight: 'bold',
    fontSize: 12,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#010048',
    textAlign: 'center',
  },
  details: {
    fontSize: 12,
    color: 'gray',
    marginVertical: 2,
    fontWeight: 'bold',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  acceptedText: {
    color: 'green',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
  rejectedText: {
    color: 'maroon',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ChangeRooms;
