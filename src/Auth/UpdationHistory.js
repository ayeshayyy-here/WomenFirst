import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader'; // Import the custom Loader component
const UpdationHistory = () => {
  const route = useRoute();
  const { editType } = route.params; // Get editType from route.params
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch history data
  const fetchHistory = async () => {
    try {
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user?.id;

      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }

      const response = await fetch(
        'https://wwh.punjab.gov.pk/api/check-history',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            parameter: editType,
          }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setHistory(result.data);
      } else {
        setError(result.error || 'No history found.');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Render history item
  const renderHistoryItem = (item, index) => {
    const isApproved = item.approval === 1;
    const backgroundColor = isApproved ? '#010048' : 'gray'; // Green for approved, red for unapproved
    const statusText = isApproved ? 'Approved' : 'Pending';
    const statusColor = isApproved ? '#4CAF50' : 'maroon';

    return (
      <View key={index} style={[styles.historyItem, { backgroundColor }]}>
        <Text style={styles.historyText}>
          <Text style={styles.boldText}>Requested Value for updation:</Text> {item.new_value}
        </Text>
        <Text style={styles.historyText}>
          <Text style={styles.boldText}>Request Time:</Text> {new Date(item.created_at).toLocaleString()}
        </Text>
        <Text style={[styles.historyText, { color: statusColor }]}>
          <Text style={styles.boldText}>Status:</Text> {statusText}
        </Text>
        {isApproved && (
          <Text style={styles.historyText}>
            <Text style={styles.boldText}>Remarks from manager:</Text> {item.remarks}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
        <Loader loading={loading} />
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No history found for {editType}.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{editType.toUpperCase()} Update History</Text>
      {history.map((item, index) => renderHistoryItem(item, index))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#010048',
  },
  historyItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  historyText: {
    fontSize: 12,
    marginBottom: 5,
    color: 'white',
  },
  boldText: {
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default UpdationHistory;