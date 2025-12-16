import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LinearGradient } from 'react-native-linear-gradient';
import axios from 'axios';
import syncStorage from 'react-native-sync-storage';

const DischargeM = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const user = JSON.parse(syncStorage.get('user'));

  const fetchData = async (status) => {
    try {
      setLoading(true);
      const apiUrl = `https://wwh.punjab.gov.pk/api/discharges/${status}/${user.district}/${user.institute}`;
      const response = await axios.get(apiUrl);
      
      if (response.data.status) {
        setData(response.data.data.map(item => ({
          ...item,
          status: status.charAt(0).toUpperCase() + status.slice(1),
          id: item.id.toString()
        })));
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch data');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatus = async (dischargeId, newStatus) => {
    try {
      setProcessingId(dischargeId);
      const apiUrl = 'https://wwh.punjab.gov.pk/api/update-discharge-status';
      const response = await axios.post(apiUrl, {
        discharge_id: parseInt(dischargeId),
        status: newStatus
      });
      
      if (response.data.status) {
        Alert.alert('Success', response.data.message);
        fetchData(activeTab); // Refresh the current tab data
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update status');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(activeTab);
  };

  const renderItem = ({ item }) => (
    <LinearGradient 
      colors={['#ffffff', '#f0f4ff']}
      style={styles.card}
    >
      <View style={styles.row}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.cnic}>CNIC: {item.cnic}</Text>
        </View>
        <LinearGradient 
          colors={item.status === 'Approved' ? ['#4CAF50', '#2E7D32'] : 
                  item.status === 'Rejected' ? ['#F44336', '#C62828'] : 
                  ['#FF9800', '#EF6C00']}
          style={styles.badge}
          start={{x: 0, y: 0}} end={{x: 1, y: 0}}
        >
          <Text style={styles.badgeText}>{item.status}</Text>
        </LinearGradient>
      </View>
      
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon name="phone" size={14} color="#010048" style={styles.infoIcon} />
          <Text style={styles.infoText}>Contact No:{item.phone_no}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="calendar" size={14} color="#010048" style={styles.infoIcon} />
          <Text style={styles.infoText}>Applied Date: {item.applied_date}</Text>
        </View>
        
        {item.leaving_date && (
          <View style={styles.infoRow}>
            <Icon name="calendar-check-o" size={14} color="#010048" style={styles.infoIcon} />
            <Text style={styles.infoText}>Leaving Date: {item.leaving_date}</Text>
          </View>
        )}
        
        <View style={styles.infoRow}>
          <Icon name="file-text" size={14} color="#010048" style={styles.infoIcon} />
          <Text style={styles.infoText}>Reason: {item.reason}</Text>
        </View>
      </View>
      
      {activeTab === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => updateStatus(item.id, 'approved')}
            disabled={processingId === item.id}
          >
            {processingId === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon name="check" size={16} color="#fff" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
          
   
        </View>
      )}
    </LinearGradient>
  );

  return (
    <View style={styles.container}>
          <LinearGradient
              colors={['#010048', '#020035', '#030022']}
              locations={[0, 0.5, 1]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.headerContainer}
            >
        <Text style={styles.header}>Discharge Management</Text>
      </LinearGradient>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
          onPress={() => setActiveTab('pending')}
        >
          <Icon 
            name="clock-o" 
            size={18} 
            color={activeTab === 'pending' ? '#fff' : '#a0a0ff'} 
          />
          <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>Pending</Text>
          {activeTab === 'pending' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'approved' && styles.activeTab]}
          onPress={() => setActiveTab('approved')}
        >
          <Icon 
            name="check-circle" 
            size={18} 
            color={activeTab === 'approved' ? '#fff' : '#a0a0ff'} 
          />
          <Text style={[styles.tabText, activeTab === 'approved' && styles.activeTabText]}>Approved</Text>
          {activeTab === 'approved' && <View style={styles.activeTabIndicator} />}
        </TouchableOpacity>
        
       
      </View>
      
      {/* Content Area */}
      <View style={styles.content}>
        {loading && !refreshing ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#010048" />
          </View>
        ) : data.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="exclamation-circle" size={40} color="#010048" />
            <Text style={styles.emptyText}>No {activeTab} discharges found</Text>
          </View>
        ) : (
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7ff',
  },
  headerContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    marginHorizontal: 15,
    backgroundColor: '#010048',
    borderRadius: 15,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'rgba(247, 236, 236, 0.1)',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  tabText: {
    marginLeft: 8,
    color: '#a0a0ff',
    fontWeight: '600',
    fontSize: 12,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 14,
    color: '#010048',
    fontWeight: '500',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e0e5ff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#010048',
  },
  cnic: {
    fontSize: 10,
    color: '#555',
    marginTop: 2,
  },
  badge: {
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  infoContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e5ff',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    width: 20,
    marginRight: 8,
  },
  infoText: {
    fontSize: 10,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default DischargeM;