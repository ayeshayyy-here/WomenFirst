import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Button
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import syncStorage from 'react-native-sync-storage';
import axios from 'axios';

const RoomRequest = ({ navigation, route }) => {
  const { status } = route.params || { status: 'pending' };
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [action, setAction] = useState('accept');
  const [remarks, setRemarks] = useState('');
  const user = JSON.parse(syncStorage.get('user'));

  useEffect(() => {
    fetchRoomRequests();
  }, [status]);

  const fetchRoomRequests = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://wwh.punjab.gov.pk/api/getRoomapprovalListmanagernew',
        { user_id: user.id, status }
      );
      console.log('Fetched Room Requests:', response.data);
      setData(response.data.roomsRequested);
    } catch (error) {
      console.error('Error fetching room requests:', error);
      Alert.alert('Error', 'Failed to fetch room requests');
    }
    setLoading(false);
  };

  const handleTakeAction = async () => {
    if (!selectedRequest) {
      console.log('No request selected.');
      return;
    }
  
    const payload = {
      action,
      remarks: remarks.trim() || '',
      date: new Date().toISOString().split('T')[0],
      manager_id: user.id,
    };
  
    const url = `https://wwh.punjab.gov.pk/api/roomacceptreject/${selectedRequest.id}`;
  
    console.log('Submitting Action:', { url, payload });
  
    try {
      const response = await axios.post(url, payload);
      console.log('Action Response:', response.data);
  
      Alert.alert('Success', response.data.message);
      setModalVisible(false);
      fetchRoomRequests();
    } catch (error) {
      console.error('Error updating request:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to update request. Please try again.');
    }
  };
  
  const handleRejectBooking = async (bookingId) => {
    if (!bookingId) return;
  
    const url = `https://wwh.punjab.gov.pk/api/editRoomStatus/${bookingId}`;
  
    console.log('Submitting Reject Request:', { url });
  
    try {
      const response = await axios.post(url);
      console.log('Reject Response:', response.data);
  
      Alert.alert('Success', response.data.message);
      fetchRoomRequests(); // Refresh room requests after update
    } catch (error) {
      console.error('Error rejecting booking:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to reject booking. Please try again.');
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
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setSelectedRequest(item);
            setModalVisible(true);
          }}>
          <Text style={styles.buttonText}>Take Action</Text>
        </TouchableOpacity>
      )}
      {status === 'accepted' && (
        <TouchableOpacity
          style={styles.rbutton}
          onPress={() => handleRejectBooking(item.id)}>
          <Text style={styles.buttonText}>Reject Room Application</Text>
        </TouchableOpacity>
      )}
      {status === 'rejected' && (
        <Text style={styles.rejectedText}>Rejected</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Room Approval ({status})</Text>
      <View style={styles.iconContainer}>
        {['pending', 'accepted', 'rejected'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => navigation.navigate('RoomRequests', { status: item })}
            style={[styles.iconWrapper, status === item && styles.activeIconWrapper]}
          >
            <Icon
              name="list"
              size={18}
              color={status === item ? 'white' : 'black'}
              style={styles.icon}
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
        <Text style={styles.noDataText}>No room requests found</Text>
      )}

      {/* Action Modal */}
      <Modal visible={modalVisible} animationType="fade" transparent>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Take Action</Text>

      <TouchableOpacity
        style={[styles.modalButton, action === 'accept' && styles.activeModalButton]}
        onPress={() => setAction('accept')}
      >
        <Text style={styles.modalButtonText}>Accept</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.modalButton, action === 'reject' && styles.activeModalButton]}
        onPress={() => setAction('reject')}
      >
        <Text style={styles.modalButtonText}>Reject</Text>
      </TouchableOpacity>
      <Text style={styles.remarks}>Enter Remarks</Text>
      <TextInput
        placeholder="Enter remarks..."
        value={remarks}
        onChangeText={setRemarks}
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.submitButton} onPress={handleTakeAction}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
  button: { backgroundColor: '#010048', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 12, },
  rbutton: { backgroundColor: 'gray', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  rejectedText: { color: 'maroon', fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#010048',
  },
  remarks: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    color: 'gray',
  },
  modalButton: {
    width: '80%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  activeModalButton: {
    backgroundColor: 'gray',
  },
  modalButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'black',
  },
  input: {
    width: '80%',
    borderWidth: 0.8,
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderColor: '#ccc',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#010048',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginRight: 5,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'maroon',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  noDataText: { textAlign: 'center', marginTop: 20, fontSize: 16, color: '#666' }
});

export default RoomRequest;
