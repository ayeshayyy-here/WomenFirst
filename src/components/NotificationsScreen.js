import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import syncStorage from 'react-native-sync-storage';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUserAndNotifications();
  }, []);

  const fetchUserAndNotifications = () => {
    const storedProfile = syncStorage.get('user_profile');
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile);
        const cnic = profile.cnic || profile.cnic_bform; // depends on what key you store
        if (cnic) {
          fetchNotifications(cnic);
        } else {
          Alert.alert('Error', 'CNIC not found in profile data.');
          setLoading(false);
        }
      } catch (err) {
        console.log('Error parsing stored profile:', err);
        Alert.alert('Error', 'Invalid user data in storage.');
        setLoading(false);
      }
    } else {
      Alert.alert('Error', 'User profile not found in storage.');
      setLoading(false);
    }
  };

  const fetchNotifications = async (cnicValue) => {
    try {
      setLoading(true);

      const [fapResponse, ypcResponse] = await Promise.all([
        fetch(`https://fa-wdd.punjab.gov.pk/api/fapnotification/${cnicValue}`),
        fetch(`https://ypc-wdd.punjab.gov.pk/api/ypcnotification/${cnicValue}`),
      ]);

      const fapData = await fapResponse.json();
      const ypcData = await ypcResponse.json();

      const combined = [
        {
          header: fapData.header || 'Female Ambassador Program',
          message: fapData.message || 'No message available.',
          source: 'Female Ambassador Program',
        },
        {
          header: ypcData.header || 'Youth Pitch Initiative',
          message: ypcData.message || 'No message available.',
          source: 'Youth Pitch Initiative',
        },
      ];

      setNotifications(combined);
    } catch (error) {
      console.error('Notification fetch error:', error);
      Alert.alert('Error', 'Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserAndNotifications();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <Text style={styles.title}>Your Notifications</Text>
      {notifications.map((item, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.headerRow}>
            <Icon name="notifications" size={24} color="#007bff" />
            <Text style={styles.headerText}>{item.header}</Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.source}>Source: {item.source}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#007bff',
  },
  message: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
  },
  source: {
    fontSize: 13,
    color: '#777',
    fontStyle: 'italic',
  },
});

























