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
import PaymentModal from '../components/PaymentModal';
const GenerateChalan = ({ navigation }) => {
  const [chalans, setChalans] = useState([]);
  const user = JSON.parse(syncStorage.get('user'));

  useEffect(() => {
    fetchChalanList();
  }, []);

  const fetchChalanList = async () => {
    try {
      const response = await fetch(
        `https://wwh.punjab.gov.pk/api/generatePaymentChalanList/${user.district}/${user.institute}`
      );
      const result = await response.json();
      if (result.status === 'success') {
        setChalans(result.data);
      } else {
        Alert.alert('Error', 'Failed to fetch chalans');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while fetching chalans');
    }
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  
  const openModal = (id) => {
    setSelectedId(id);
    setModalVisible(true);
  };
  
  const closeModal = () => {
    setModalVisible(false);
    setSelectedId(null);
  };
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.details}>CNIC: {item.cnic}</Text>
      <Text style={styles.details}>Job Type: {item.job_type}</Text>
      <Text style={styles.details}>Room: {item.room}</Text>
      <Text style={styles.details}>Bed: {item.bed}</Text>

      {item.status === null ? (
          <TouchableOpacity 
          style={styles.singleButton}
          onPress={() => navigation.navigate('GeneratePostChallan', { user_id: item.user_id })}
        >
          
          <Text style={styles.buttonText}>Generate Challan</Text>
        </TouchableOpacity>
      ) : item.status === 'pending' ? (
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.buttonview}
            onPress={() => navigation.navigate('PaymentChallan', { id: item.id })}>
            <Icon name="eye" size={12} color="white" style={styles.iconMargin} />
            <Text style={styles.buttonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonedit}
           onPress={() => navigation.navigate('EditPostedChallan', { id: item.id })}>
            <Icon name="edit" size={12} color="white" style={styles.iconMargin} />
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonPaid} onPress={() => openModal(item.id)}>
  <Icon name="check-circle" size={12} color="white" style={styles.iconMargin} />
  <Text style={styles.buttonText}>Paid</Text>
</TouchableOpacity>
        </View>
      ) : item.status === 'Paid' ? (
        <TouchableOpacity 
        style={styles.paidButton}
        onPress={() => navigation.navigate('PaymentChallan', { id: item.id })}
      >
        
        <Text style={styles.buttonText}>View Paid Challan</Text>
      </TouchableOpacity>
    ):  null}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment Chalans</Text>

      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('GenerateChalan')} style={styles.iconWrapper}>
          <Icon name="user-plus" size={18} color="white" style={styles.activeIcon} />
          <Text style={styles.activeIconText}>Generate Chalan</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('PaidChalan')} style={styles.iconWrapper}>
          <Icon name="list" size={18} color="white" style={styles.icon} />
          <Text style={styles.iconText}>Paid Chalans</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('HistoryChalan')} style={styles.iconWrapper}>
          <Icon name="list" size={18} color="white" style={styles.icon} />
          <Text style={styles.iconText}>History</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.headerr}>Generate Payment Challan</Text>

      <FlatList
        data={chalans}
        keyExtractor={(item) => item.user_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      <PaymentModal visible={modalVisible} onClose={closeModal} id={selectedId} />
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
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#010048',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonPaid: {
    backgroundColor: '#010048',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonedit: {
    backgroundColor: '#010048',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonview: {
    backgroundColor: '#010048',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  singleButton: {
    backgroundColor: '#010048',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',

    marginTop: 10,
  },
  paidButton: {
    backgroundColor: '#013220',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',

    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 12,
  },
  iconMargin: {
    marginRight: 4,
  },
  iconMarginn: {
    marginRight: 8,
  },
});

export default GenerateChalan;
