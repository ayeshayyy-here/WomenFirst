import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FloatingButton from '../components/FloatingButton';
import syncStorage from 'react-native-sync-storage';
import * as Animatable from 'react-native-animatable';

// Importing images
import Attendence from '../../assets/images/attendence.png';
import Payment from '../../assets/images/payment.png';
import Registration from '../../assets/images/registration.png';
import Request from '../../assets/images/requests.png';
import Status from '../../assets/images/status.png';
import Bell from '../../assets/images/bell.png';

const {width} = Dimensions.get('window');

const Dashboard = ({route, navigation}) => {
  const [userName, setUserName] = useState('');

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

  return (
    <View style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.topLine} />

        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Dashboard</Text>
            <TouchableOpacity>
            <Animatable.Image
              source={Bell}
              style={styles.bellIcon}
              animation="swing" // Use the shake animation
              iterationCount="infinite" // Repeat the animation indefinitely
              duration={3000} // Increase duration to slow down the animation (3 seconds)
            />
            </TouchableOpacity>
          </View>

          <LinearGradient
            colors={['#352E64', '#412E63', '#632D61', '#982B5D', '#C82A59']}
            locations={[0, 0.14, 0.39, 0.73, 1]}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.gradientBar}>
            <View style={styles.gradientContent}>
              <Icon
                name="person"
                size={24}
                color="#fff"
                style={styles.userIcon}
              />
              <Text style={styles.userText}>{userName}</Text>
            </View>
          </LinearGradient>

          <View style={styles.row1}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('FormP')}>
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
          </View>
        </View>
      </ScrollView>

      <FloatingButton />
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    marginTop: '10%',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: 'medium',
    color: '#000',
    fontFamily: 'Dubai-Regular',
  },
  bellIcon: {
    width: 70,
    height: 70,
  },
  topLine: {
    position: 'absolute',
    top: '5%',
    left: 0,
    width: '100%',
    height: 1,
    backgroundColor: '#000',
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
  },
  userIcon: {
    marginRight: 8,
  },
  userText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Dubai-Regular',
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '20%',
    marginBottom: 24,
    paddingLeft:'5%',
    paddingRight:'5%'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingLeft:'5%',
    paddingRight:'5%'
  },
  card: {
    backgroundColor: '#302F65',
    width: '40%',
    height: 110,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    borderColor: '#fff',
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardIcon: {
    width: '80%',
    height: '60%',
  },
  cardText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default Dashboard;
