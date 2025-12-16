import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader';
const { width } = Dimensions.get('window');

const LoginActivity = () => {
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState([]);

  useEffect(() => {
    fetchLoginAttempts();
  }, []);

  const fetchLoginAttempts = async () => {
    try {
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user?.id;
  
      if (!userId) {
        console.error('User ID is not available');
        return;
      }
  
      const apiUrl = `https://wwh.punjab.gov.pk/api/loginattemptsofuser/${userId}`; // Corrected interpolation
      const response = await fetch(apiUrl);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const json = await response.json();
      setLoginAttempts(json);
    } catch (error) {
      console.error('Error fetching login attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Format the date for display
// Add 5 hours to the datetime and format it
const formatDate = (datetime) => {
    if (!datetime) return 'N/A';
  
    // Add 5 hours to the datetime
    const date = new Date(datetime);
    date.setHours(date.getHours() + 5);
  
    // Format the date and time
    return date.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };
  const renderItem = ({ item }) => (
   <LinearGradient
   colors={['#6C5B7B', '#6C5B7B', '#C06C84']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0.2, 0.6, 1]}
    style={styles.listItem}
  >
     <LinearGradient
           colors={['#ffff', '#C06C84']}
          start={{ x: 1, y: 0.6 }}
          end={{ x: 0, y: 1 }}
          style={styles.listItem}
          >
      <Icon name={item.platform === 'app' ? 'mobile' : 'desktop'} size={18} color="white" />
      <View style={styles.itemDetails}>
        <Text style={styles.dateText}>{formatDate(item.login_time)}</Text>
        <Text style={styles.platformText}>via {item.platform === 'app' ? 'Mobile App' : 'Web'}</Text>
      </View>
      </LinearGradient>
    </LinearGradient>
  );

  return (
    <View      style={styles.container}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Login Activity</Text>
      </View>

      {/* List of Login Attempts */}
      {loading ? (
         <Loader loading={loading} />
      ) : (
        <FlatList
          data={loginAttempts}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.login_time}-${index}`}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No login attempts found.</Text>
          }
        />
      )}
</View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    color: '#6C5B7B',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  listItem: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 6,
    paddingHorizontal: 20,
    marginVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  itemDetails: {
    marginLeft: 16,
    flex: 1,
  },
  dateText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  platformText: {
    fontSize: 8,
    color: 'white',
    fontStyle: 'italic',
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});

export default LoginActivity;