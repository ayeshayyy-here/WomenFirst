import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import syncStorage from 'react-native-sync-storage';

const VisitorGuestM = ({ navigation }) => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionType, setActionType] = useState('');
  const [remarks, setRemarks] = useState('');

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch data from API
  const fetchData = async () => {
    try {
      const user = JSON.parse(syncStorage.get('user'));
      const district_id = user.district;
      const institute_id = user.institute;

      const apiUrl = `https://wwh.punjab.gov.pk/api/getresidentsVisitorsguestslogs/${district_id}/${institute_id}`;
      const response = await fetch(apiUrl);
      const json = await response.json();

      if (response.ok) {
        setVisitors(json.visitors);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle approval/disapproval
  const handleStatusUpdate = async () => {
    if (!selectedItem) {
      Alert.alert('Error', 'No item selected.');
      return;
    }

    try {
      const payload = {
        id: selectedItem.id,
        status: actionType,
        remarks: remarks || '',
      };

      const response = await fetch(
        'https://wwh.punjab.gov.pk/api/updateVisitorStatus',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        Alert.alert('Success', 'Status updated successfully.');
        // Update local state
        const updatedVisitors = visitors.map((visitor) =>
          visitor.id === selectedItem.id ? { ...visitor, status: actionType } : visitor
        );
        setVisitors(updatedVisitors);
      } else {
        Alert.alert('Error', result.message || 'Failed to update status.');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setModalVisible(false);
      setRemarks('');
      setSelectedItem(null);
    }
  };

  // Render each visitor item
  const renderItem = ({ item }) => (
    <View style={styles.card}>
        <Text style={styles.rname}>Resident Name: {item.resident_name}</Text>
      <View style={styles.row}>
        
        <LinearGradient
          colors={['#020035', '#015B7f', '#020035']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0.2, 0.6, 1]}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>
            {item.type === 'guest' ? 'Guest' : 'Visitor'}
          </Text>
        </LinearGradient>
        <Text style={styles.name}>Name: {item.name}</Text>
      </View>

      <Text style={styles.relation}>Relation: {item.relation}</Text>

      {item.type === 'guest' ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Stay Duration:</Text> {item.stay_duration} days
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Date:</Text> {item.date}
          </Text>
          <View style={styles.row}>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Status: </Text>
              <Text
                style={{
                  color:
                    item.status === null || item.status === 'pending'
                      ? '#FF6B6B' // Red for pending/null
                      : item.status === 'approved'
                      ? '#4CAF50' // Green for approved
                      : '#FF5252', // Red for disapproved
                  fontWeight: 'bold',
                  fontSize: 14,
                }}
              >
                {item.status || 'pending'}
              </Text>
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Start Time:</Text> {item.start_time}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>End Time:</Text> {item.end_time}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Date:</Text> {item.date}
          </Text>
          <View style={styles.row}>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Status: </Text>
              <Text
                style={{
                  color:
                    item.status === null || item.status === 'pending'
                      ? '#FF6B6B' // Red for pending/null
                      : item.status === 'approved'
                      ? '#4CAF50' // Green for approved
                      : '#FF5252', // Red for disapproved
                  fontWeight: 'bold',
                  fontSize: 14,
                }}
              >
                {item.status || 'pending'}
              </Text>
            </Text>
          </View>
        </View>
      )}

      {/* Approve/Disapprove Buttons */}
      {(item.status === 'pending' || item.status === null) && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => {
              setSelectedItem(item);
              setActionType('approved');
              setModalVisible(true);
            }}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.disapproveButton}
            onPress={() => {
              setSelectedItem(item);
              setActionType('disapproved');
              setModalVisible(true);
            }}
          >
            <Text style={styles.buttonText}>Disapprove</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Visitors & Guests Logs</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#010048" style={styles.loader} />
      ) : visitors.length === 0 ? (
        <Text style={styles.emptyText}>No visitors found.</Text>
      ) : (
        <FlatList
          data={visitors}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Modal for Remarks */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Remarks</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter remarks..."
              value={remarks}
              onChangeText={setRemarks}
              multiline
            />
            <TouchableOpacity style={styles.submitButton} onPress={handleStatusUpdate}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rname: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#010048',
    marginBottom: 20,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'gray',
  },
  badge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  relation: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  infoContainer: {
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    color: '#010048',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  approveButton: {
    backgroundColor: '#010048',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  disapproveButton: {
    backgroundColor: 'maroon',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
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
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 80,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#010048',
    padding: 10,
    borderRadius: 5,
    width: '100%',
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#010048',
    fontSize: 16,
  },
});

export default VisitorGuestM;