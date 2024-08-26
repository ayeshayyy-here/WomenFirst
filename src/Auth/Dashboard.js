import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FloatingButton from '../components/FloatingButton';
import syncStorage from 'react-native-sync-storage';
import * as Animatable from 'react-native-animatable';
import Loader from '../components/Loader'; // Import the custom Loader component
// Importing images
import Attendence from '../../assets/images/attendence.png';
import Payment from '../../assets/images/payment.png';
import Registration from '../../assets/images/registration.png';
import Request from '../../assets/images/requests.png';
import Status from '../../assets/images/status.png';
import Bell from '../../assets/images/bell.png';
import Complaint from '../../assets/images/complaint.png';

const {width, height} = Dimensions.get('window'); // Get screen dimensions

const Dashboard = ({route, navigation}) => {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const {user} = route.params || {};
    if (user) {
      setUserName(user.name);
    } else {
      const getUserDetails = async () => {
        try {
          const storedUser = await syncStorage.get('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.name) {
              setUserName(parsedUser.name);
            }
          }
        } catch (error) {
          console.error('Error retrieving user details:', error);
        }
      };

      getUserDetails();
    }
  }, [route.params]);

  const handlePress = async () => {
    try {
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user.id;
  
      console.log('Fetching registration status for user ID:', userId);
      setLoading(true); // Show loader
  
      const response = await fetch(`https://wwh.punjab.gov.pk/api/registration-check/${userId}`);
      const data = await response.json();
  
      console.log('API Response:', data);
  
      const { status, step, p_id } = data;
  
      if (status === 'success') {
        switch (step) {
          case 1:
            navigation.navigate('FormG');
            break;
          case 2:
            navigation.navigate('FormA', { p_id });
            break;
          case 3:
            navigation.navigate('FormD', { p_id });
            break;
          case 4:
            navigation.navigate('CompletedFormP', { p_id });
            break;
          default:
            Alert.alert('Unexpected step received');
            console.log('Unexpected step:', step);
        }
      } else {
        navigation.navigate('FormP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch registration status.');
      console.error('Error fetching registration status:', error);
    } finally {
      setLoading(false); // Hide loader
    }
  };
  

  

  return (
    <LinearGradient
      colors={['#775FA8', '#6C5B7B', '#C06C84']}
      start={{x: 1, y: 1}}
      end={{x: 0, y: 0}}
      locations={[0.2, 0.6, 1]}
      style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.topLine} />

        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Dashboard</Text>
            <TouchableOpacity>
              <Animatable.Image
                source={Bell}
                style={styles.bellIcon}
                animation="swing"
                iterationCount="infinite"
                duration={3000}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.gradientBar}>
            <View style={styles.gradientContent}>
              <Icon
                name="person"
                size={24}
                color="#fff"
                style={styles.userIcon}
              />
              <Text style={styles.userText}>{userName}</Text>
            </View>
          </View>

          <View style={styles.cardWrapper}>
            <Image
              source={require('../../assets/images/login.png')} 
              style={styles.backgroundImage}
            />
            <View style={styles.overlay}>
              <View style={styles.row1}>


                <TouchableOpacity
                  style={styles.card}
                  onPress={handlePress}>
                  <Image
                    source={Registration}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardText}>Registration</Text>
                </TouchableOpacity>


                <TouchableOpacity style={styles.card}>
                  <Image
                    source={Status}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardText}>Status</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={styles.card}>
                  <Image
                    source={Attendence}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardText}>Attendance</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card}>
                  <Image
                    source={Payment}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardText}>Payment</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.row}>
                <TouchableOpacity style={styles.card}>
                  <Image
                    source={Request}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardText}>Requests</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.card}>
                  <Image
                    source={Complaint}
                    style={styles.cardIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.cardText}>Complaint</Text>
                </TouchableOpacity>
              </View>
            </View>
            <FloatingButton/>
            <Loader loading={loading} />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#775FA8',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 0,
    marginTop: '10%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: {
    fontSize: 28,
    padding: 10,
    fontWeight: 'medium',
    color: '#fff',
    fontFamily: 'Dubai-Medium',
  },
  bellIcon: {
    marginRight: '7%',
    width: 30,
    height: 30,
  },
  topLine: {
    position: 'absolute',
    top: '5%',
    left: 0,
    width: '100%',
    height: 1,
    backgroundColor: '#fff',
  },
  gradientBar: {
    width: '70%',
    height: 50,
    marginLeft: -16,
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  gradientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  userIcon: {
    marginRight: 8,
  },
  userText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Dubai-Light',
  },
  cardWrapper: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flex: 1,
    paddingVertical: 20,
    overflow: 'hidden', // This ensures the background image does not overflow
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    opacity: 0.1, // Adjust the opacity to your preference
    resizeMode: 'cover', // Ensure the image covers the container
  },
  overlay: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: '7%',
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingLeft: '2%',
    paddingRight: '2%',
    marginTop: '8%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingLeft: '2%',
    paddingRight: '2%',
    marginTop: '2%',
  },
  card: {
    backgroundColor: '#fff',
    width: '45%',
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    borderColor: '#d3d3d3',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  cardIcon: {
    width: '80%',
    height: '70%',
  },
  cardText: {
    color: '#000000',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default Dashboard;
