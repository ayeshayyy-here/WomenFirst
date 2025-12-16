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

const { width } = Dimensions.get('window');

const LoginDetails = ({ route }) => {
  const { userId, name } = route.params; // Get userId and name from navigation params
  const [loading, setLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState([]);

  useEffect(() => {
    fetchLoginAttempts();
  }, []);

  const fetchLoginAttempts = async () => {
    try {
      const apiUrl = `https://wwh.punjab.gov.pk/api/loginattemptsofuser/${userId}`;
      const response = await fetch(apiUrl);
      const json = await response.json();

      if (response.ok) {
        setLoginAttempts(json);
      } else {
        console.error('Failed to fetch login attempts:', json);
      }
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
          colors={['#020035', '#015B7f', '#020035']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0.2, 0.6, 1]}
    style={styles.listItem}
  >
     <LinearGradient
          colors={['#ffff', '#020035']}
          start={{ x: 1, y: 0.5 }}
          end={{ x: 0, y: 1 }}
          style={styles.listItem}
          >
      <Icon name={item.platform === 'app' ? 'mobile' : 'desktop'} size={24} color="white" />
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
        <Text style={styles.headerTitle}>Login Tracking of {name}</Text>
      </View>

      {/* List of Login Attempts */}
      {loading ? (
        <ActivityIndicator size="large" color="#FFF" style={styles.loader} />
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
    color: '#020035',
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

export default LoginDetails;