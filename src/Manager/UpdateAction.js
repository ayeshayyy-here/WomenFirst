import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import Loader from '../components/Loader';

const UpdateAction = ({ route, navigation }) => {
  const { personal_id, name } = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Function to get the correct image URL based on field type
  const getImageUrl = (fieldName, fileName) => {
    if (!fileName) return null;
    
    const baseUrl = 'https://wwh.punjab.gov.pk';
    const pathMappings = {
      cnicf_attach: '/uploads/idcard/',
      cnicb_attach: '/uploads/idcard/',
      guardianf_cnic: '/uploads/idcard/',
      guardianb_cnic: '/uploads/idcard/',
      disability_certi: '/uploads/certificate/',
      appoint_letter: '/uploads/appointment/',
    };
    
    return `${baseUrl}${pathMappings[fieldName]}${fileName}`;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://wwh.punjab.gov.pk/api/get-pending-updates?personal_id=${personal_id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log('API Response:', result);
      setData(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproval = async (update_id, status) => {
    const endpoint = status === 1 ? '/approve-update' : `/disapproveUpdate/${update_id}`;
    const body = status === 1 ? JSON.stringify({ id: update_id }) : null;
  
    console.log(`Calling endpoint: ${endpoint} with body: ${body}`);
  
    try {
      const response = await fetch(`https://wwh.punjab.gov.pk/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        return;
      }
  
      const result = await response.json();
      console.log('API Response:', result);
  
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const renderImage = (fieldName, fileName) => {
    const imageUrl = getImageUrl(fieldName, fileName);
    if (!imageUrl) return null;
    
    return (
      <View style={styles.imageContainer}>
        <Text style={styles.imageLabel}>{fieldName.replace('_', ' ').toUpperCase()}:</Text>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.attachment}
          resizeMode="contain"
        />
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.columnName}>Column: {item.column_name}</Text>
      <Text style={styles.details}>Old Value: {item.old_value}</Text>
      <Text style={styles.details}>New Value: {item.new_value}</Text>
      
      {/* Render all possible images */}
      {renderImage('cnicf_attach', item.cnicf_attach)}
      {renderImage('cnicb_attach', item.cnicb_attach)}
      {renderImage('appoint_letter', item.appoint_letter)}
      {renderImage('guardianf_cnic', item.guardianf_cnic)}
      {renderImage('guardianb_cnic', item.guardianb_cnic)}
      {renderImage('disability_certi', item.disability_certi)}
      
      {item.approval === 0 ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.approveButton]}
            onPress={() => handleApproval(item.update_id, 1)}
          >
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.disapproveButton]}
            onPress={() => handleApproval(item.update_id, 2)}
          >
            <Text style={styles.buttonText}>Disapprove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={[styles.status, item.approval === 1 ? styles.approved : styles.disapproved]}>
          {item.approval === 1 ? 'Approved' : 'Disapproved'}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Update Details</Text>
      <Text style={styles.headerr}>( {name} )</Text>
      {loading ? (
        <Loader />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) => `${item.update_id}-${index}`}
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
    marginBottom: 5,
  },
  headerr: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
    marginBottom: 25,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 5,
  },
  columnName: {
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
  imageContainer: {
    marginVertical: 8,
  },
  imageLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 4,
  },
  attachment: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  approveButton: {
    backgroundColor: '#010048',
  },
  disapproveButton: {
    backgroundColor: 'maroon',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  status: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  approved: {
    color: 'green',
  },
  disapproved: {
    color: 'maroon',
  },
});

export default UpdateAction;