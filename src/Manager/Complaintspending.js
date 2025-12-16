import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import syncStorage from 'react-native-sync-storage';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../components/Loader';
const ComplaintsPending = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { categoryId } = route.params;
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPendingComplaints = async () => {
    try {
      const user = JSON.parse(syncStorage.get('user'));
      if (!user.institute || !user.district) {
        throw new Error('User institute or district missing');
      }

      const response = await fetch(
        `https://complaint-swbm-mis.punjab.gov.pk/api/pendingcomplaints-hostelcategory/${categoryId}/${user.institute}/${user.district}`,
        {
          headers: {
            'secret': 'w5qOiuGbvehTk0llZAMabt2uGFmPTUFJFwa8ibI96kShKBqOMS2Pgikx0wEbvIx8'
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log('Pending Complaints API Response:', JSON.stringify(data, null, 2));
      
      // Updated to match the correct API response structure
      setComplaints(data.pending_hostel_complaints || data.resolved_hostel_complaints || []);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingComplaints();
  }, [categoryId]);

  const renderComplaintItem = ({ item }) => (
    <View style={styles.complaintCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Icon name="person" size={24} color="#FFF" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || 'Anonymous'}</Text>
          <Text style={styles.userCnic}>CNIC: {item.cnic || 'Not provided'}</Text>
        </View>
      </View>

      <View style={styles.complaintContent}>
        <View style={styles.infoRow}>
          <Icon name="category" size={16} color="#666" />
          <Text style={styles.infoText}>{item.subcategory_name || item.category_name || 'No category'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="calendar-today" size={16} color="#666" />
          <Text style={styles.infoText}>{item.reg_date || 'No date'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Icon name="schedule" size={16} color="#FFA000" />
          <Text style={styles.statusText}>Pending since {item.reg_date}</Text>
        </View>
      </View>

      {item.complaint_file && (
        <View style={styles.attachmentContainer}>
          <Icon name="attachment" size={16} color="#5E35B1" />
          <Text style={styles.attachmentText}>Attachment available</Text>
        </View>
      )}

      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={() => navigation.navigate('ComplaintDetail', { complaint: item })}
      >
        <Text style={styles.detailsButtonText}>View Details</Text>
        <Icon name="chevron-right" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
       <Loader loading={loading} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchPendingComplaints} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#020035', '#015B7f', '#020035']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0.2, 0.6, 1]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Pending Complaints</Text>
        <Text style={styles.headerSubtitle}>{complaints.length} complaints found</Text>
      </LinearGradient>

      {complaints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="hourglass-empty" size={60} color="#020035" />
          <Text style={styles.emptyText}>No pending complaints found</Text>
        </View>
      ) : (
        <FlatList
          data={complaints}
          renderItem={renderComplaintItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#020035',
    fontSize: 14,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#020035',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#E1E1E1',
    marginTop: 4,
  },
  listContainer: {
    padding: 15,
  },
  complaintCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#020035',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  userCnic: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  complaintContent: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 10,
    color: '#444',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#FFA000',
    marginLeft: 8,
    fontWeight: '500',
  },
  attachmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE7F6',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  attachmentText: {
    fontSize: 12,
    color: '#5E35B1',
    marginLeft: 8,
    fontWeight: '500',
  },
  detailsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#020035',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  detailsButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default ComplaintsPending;