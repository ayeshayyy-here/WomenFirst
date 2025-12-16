import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../components/Loader';
import VisitorIcon from '../../assets/images/location.png';
import syncStorage from 'react-native-sync-storage';

const { width } = Dimensions.get('window');

const Loginperson = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [loginData, setLoginData] = useState([]);
  const [loginCounts, setLoginCounts] = useState({ app_login_count: 0, web_login_count: 0 });
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      const hours = date.getHours() % 12 || 12;
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
      setCurrentDate(date.toDateString());
    }, 1000);

    fetchLoginData();
    fetchLoginCounts();

    return () => clearInterval(interval);
  }, []);

  const formatPrettyDate = (datetime) => {
    if (!datetime) return 'No activity found';

    const date = new Date(datetime);
    date.setHours(date.getHours() + 5);

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const timeString = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    if (date.toDateString() === now.toDateString()) {
      return `Today at ${timeString}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${timeString}`;
    } else {
      return `${date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })} at ${timeString}`;
    }
  };

  const fetchLoginData = async () => {
    try {
      const user = JSON.parse(syncStorage.get('user'));
      const apiUrl = `https://wwh.punjab.gov.pk/api/loginattemptsdisplaymanager/${user.district}/${user.institute}`;

      const response = await fetch(apiUrl);
      const json = await response.json();

      if (response.ok) {
        setLoginData(json);
      } else {
        Alert.alert('Error', 'Failed to fetch login data.');
      }
    } catch (error) {
      console.error('Error fetching login data:', error);
      Alert.alert('Error', 'Unable to fetch data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoginCounts = async () => {
    try {
      const user = JSON.parse(syncStorage.get('user'));
      const apiUrl = `https://wwh.punjab.gov.pk/api/webapplogincount/${user.district}/${user.institute}`;
      const response = await fetch(apiUrl);
      const json = await response.json();

      if (response.ok) {
        setLoginCounts({
          app_login_count: json.app_login_count || 0,
          web_login_count: json.web_login_count || 0,
        });
      } else {
        Alert.alert('Error', 'Failed to fetch login counts.');
      }
    } catch (error) {
      console.error('Error fetching login counts:', error);
      Alert.alert('Error', 'Unable to fetch login counts. Please try again later.');
    }
  };

  const handlePress = (userId, name) => {
    navigation.navigate('LoginDetails', { userId, name });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.container} onPress={() => handlePress(item.user_id, item.user_name)}>
      <View style={styles.iconContainer}>
        <Icon name="user" size={20} color="#020035" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.userName}>{item.user_name}</Text>
        <Text style={styles.activityText}>Last Login: {formatPrettyDate(item.last_login_time)}</Text>
        <Text style={styles.platformText}>{item.platform ? `via ${item.platform === 'app' ? 'Mobile App' : 'Web'}` : ''}</Text>
      </View>
      <Icon name="chevron-right" size={10} color="gray" style={styles.chevron} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainBody}>
      <Loader loading={loading} />
      <LinearGradient colors={["#020035", "#015B7f", "#020035"]} style={styles.headerContainer}>
        <View style={styles.leftContainer}>
          <Image source={VisitorIcon} style={styles.image} />
          <Text style={styles.headerText}>Residents Application Login Tracker</Text>
        </View>
        <View style={styles.rightContainer}>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.timeText}>{currentTime}</Text>
        </View>
      </LinearGradient>

      <View style={styles.loginCountsContainer}>
      
        <View style={styles.loginCountBox}>
          <Text style={styles.loginCountLabel}>Mobile App Logins</Text>
          <Text style={styles.loginCountValue}>{loginCounts.app_login_count}</Text>
        </View>
        <View style={styles.loginCountBox}>
          <Text style={styles.loginCountLabel}>Web App Logins</Text>
          <Text style={styles.loginCountValue}>{loginCounts.web_login_count}</Text>
        </View>
      </View>

      <FlatList
        data={loginData}
        renderItem={renderItem}
        keyExtractor={(item) => item.user_id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainBody: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
  },
  leftContainer: {
    alignItems: 'flex-start',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  image: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
  },
  loginCountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  loginCountBox: {
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginCountLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#020035',
  },
  loginCountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#015B7f',
    marginTop: 5,
  },
  container: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 16,
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  infoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activityText: {
    fontSize: 10,
    color: 'green',
    fontWeight: 'bold',
  },
  platformText: {
    fontSize: 8,
    fontStyle: 'italic',
    color: '#666',
  },
  chevron: {
    marginLeft: 'auto',
  },
  adText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default Loginperson;
