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
import Loader from '../components/Loader';

const UpdateInformation = ({ navigation, route }) => {
  const { status } = route.params || { status: 'pending' };
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(syncStorage.get('user'));

  const fetchData = async () => {
    if (!user || !user.id) {
      Alert.alert('Error', 'User not found in storage');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`https://wwh.punjab.gov.pk/api/get-update-info-all-residents?user_id=${user.id}&status=${status}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Parsed JSON:', result);
      setData(result);
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Network Error', 'Please check your connection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [status]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.details}>CNIC: {item.cnic}</Text>
      <Text style={styles.details}>Job Type: {item.job_type}</Text>
      <Text style={styles.details}>Status: {item.approval === 0 ? 'Pending' : item.approval === 1 ? 'Accepted' : 'Rejected'}</Text>
    
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('UpdateAction', { personal_id: item.personal_id , name: item.name  })}
        >
          <Text style={styles.buttonText}>View Detail</Text>
        </TouchableOpacity>
  
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Update Information ({status})</Text>

      <View style={styles.iconContainer}>
        {['pending', 'accepted', 'rejected'].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => navigation.navigate('UpdateInformation', { status: item })}
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
        <Loader />
      ) : data.length === 0 ? (
        <Text style={styles.noDataText}>No data found</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.personal_id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
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
    color: '#333',
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
    backgroundColor: '#010048',
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default UpdateInformation;
