import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import syncStorage from 'react-native-sync-storage';

const ComplaintLogs = ({ navigation }) => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaintLogs = async () => {
      try {
        const user = JSON.parse(await syncStorage.get('user'));
        const payload = { cnic: user.cnic };
        const response = await fetch(
          'https://complaint-swbm-mis.punjab.gov.pk/api/complaint-history',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) throw new Error('Failed to fetch complaints');
        const result = await response.json();
        setComplaints(result?.complaint || []);
      } catch (error) {
        console.error('Error fetching complaints:', error);
        Alert.alert('Error', 'Failed to load complaint logs.');
      }
    };

    fetchComplaintLogs();
  }, []);

  const handleViewDetails = (id) => {
    navigation.navigate('ComplaintViewDetail', { complaintId: id });
  };

  const renderComplaintItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.title}>Complaint ID: {item.id}</Text>
      <Text style={styles.text}>Registered Date: {item.reg_date}</Text>
      <Text style={styles.text}>Status: {item.status || 'Pending'}</Text>
      <Text style={styles.text}>Details: {item.complaint_details}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => handleViewDetails(item.id)}
      >
        <Text style={styles.buttonText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
            <Text style={styles.header}>Complaint Form & Logs</Text>
                
                    <View style={styles.iconContainer}>
                      <TouchableOpacity  onPress={() => navigation.navigate('ComplaintForm')}style={styles.iconWrapper}>
                        <Icon name="user-plus" size={18} color="white" style={styles.icon} />
                        <Text style={styles.iconText}>Complaint Form</Text>
                      </TouchableOpacity>
                    
                      <TouchableOpacity  onPress={() => navigation.navigate('ComplaintLogs')} style={styles.iconWrapper}>
                        <Icon name="list" size={18} color="white" style={styles.activeIcon} />
                        <Text style={styles.activeIconText}>Complaint Logs</Text>
                      </TouchableOpacity>
                    </View>
      <Text style={styles.headerr}>Complaint Logs</Text>
      {complaints.length === 0 ? (
        <Text style={styles.noDataText}>No complaint logs available.</Text>
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderComplaintItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        backgroundColor: '#f3f4f6',
        marginBottom: 40,
        paddingBottom: 120,
      },
      header: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        color: '#010048',
        marginBottom: 25,
      },
      headerr: {
        textAlign: 'center',
        fontSize: 16,
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
      subHeader: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: '#010048',
        marginBottom: 16,
      },
      text: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 5,
        color: 'black',
      },
  noDataText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'gray',
    marginTop: 20,
  },
  listContainer: {
    paddingBottom: 20,
    marginBottom: 50,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 25,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#010048',
    textAlign: 'center',
  },
 
  button: {
    marginTop: 10,
    backgroundColor: '#010048',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ComplaintLogs;
