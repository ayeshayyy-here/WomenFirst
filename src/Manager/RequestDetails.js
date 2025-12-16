import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Loader from '../components/Loader';
import Collapsible from 'react-native-collapsible';
import syncStorage from 'react-native-sync-storage';
import LinearGradient from 'react-native-linear-gradient';

const RequestDetails = ({ route, navigation }) => {
  const [bedId, setBedId ] = useState('');
  const [ roomId, setRoomId ] = useState('');
  // const { bedId, roomId } = route.params;
  // const { bedId, roomId } = route.params.bedId;
  // const { pending, setPendigStatus } = route.params.pending;
  // const { reject, setRejectStatus } = route.params.reject;
  // const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [userDetails, setUserDetails] = useState({
    name: '',
    cnic: '',
    phoneNumber: '',
    jobType: '',
  });

  const toggleCollapse = () => setCollapsed(!collapsed);

  const getStatusColor = (status) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case 'pending': return 'blue';
      case 'reject': return 'red';
      default: return 'green';
    }
  };

  const getUserRequested = async () => {
    try {
      fetch('https://wwh.punjab.gov.pk/api/getRoomBookingDetailsById/(route.param)', {
        method: 'POST',
        // headers: { 'Content-Type': 'application/json' },
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({bed_id: bedId }),
      }).then(data=>data.json())
      .then(res=>{
        let data =res.data[0];
        console.log('getUserRequested refs ', res.data[0]);
        setUserDetails({
              name: data.name || '',
              cnic: data.cnic || '',
              phoneNumber: data.phone_number || '',
              jobType: data.job_type || '',
              bed_id: bedId || '',
              room_id: data.room_id || '',
              status: data.status || '',
            });
            setRoomId(data.room_id);

      }).catch(error=>{
        console.log('error ',error);
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const takeAction = async (action) => {
    console.log('takeAction ',action);
    try {
      const response = await fetch('https://wwh.punjab.gov.pk/api/takeAction', {
      // const response = await fetch('https://wwh.punjab.gov.pk/api/takeAction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room_id: roomId, bed_id: bedId, action }),
      });

      const json = await response.json();
      if (json.status === 'success') {
        Alert.alert('Success', json.message);
        navigation.goBack();  // Navigate back or refresh as needed
      } else {
        throw new Error(json.message);
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  useEffect(() => {
  setBedId(route.params.bedId);
    const initialize = async () => {
      setLoading(true);
      try {
        await getUserRequested();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (bedId) {
      initialize();
    } else {
      setError('No bed ID provided');
      setLoading(false);
    }
  }, [bedId]);

  if (loading) return <Loader loading={loading} />;
  // if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  return (
    <LinearGradient
      colors={['#020035', '#015B7f', '#ffffff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      locations={[0.2, 0.6, 5]}
      style={styles.outerContainer}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* <View style={styles.headerContainer}>
          <Text style={styles.header}>Request Detail</Text>
        </View>
        <View style={styles.cardWrapper}>

            <TouchableOpacity onPress={toggleCollapse} style={styles.collapsibleHeader}>
              <View style={styles.collapheaderItem}>
                <View style={styles.userIconContainer}>
                  <Icon name="user" size={20} color="black" />
                </View>
                <View style={styles.userInfoContainer}>
                  <Text style={styles.collapheaderText}>
                    {userDetails.name} {'  '}
                    <Text style={{ fontSize: 12, color: 'black' }}>Status |&nbsp;</Text>
                    {userDetails.status?
                    <Text style={{ color: getStatusColor(userDetails?.status), fontSize: 12 }}>
                      {userDetails?.status}
                    </Text>:null}
                  </Text>
                </View>
                <Icon
                  name={collapsed ? 'chevron-down' : 'chevron-up'}
                  size={10}
                  color="black"
                  style={styles.dropdownIcon}
                />
              </View>
              <Collapsible collapsed={collapsed}>
                <View style={styles.collapsibleContent}>
                  <View style={styles.rowContainer}>
                    <Text style={styles.labelText}>Name: <Text style={{ color: 'gray' }}>{userDetails.name}</Text></Text>
                  </View>
                  <View style={styles.rowContainer}>
                    <Text style={styles.labelText}>CNIC: <Text style={{ color: 'gray' }}>{userDetails.cnic}</Text></Text>
                  </View>
                  <View style={styles.rowContainer}>
                    <Text style={styles.labelText}>Phone Number: <Text style={{ color: 'gray' }}>{userDetails.phoneNumber}</Text></Text>
                  </View>
                  <View style={styles.rowContainer}>
                    <Text style={styles.labelText}>Job Type: <Text style={{ color: 'gray' }}>{userDetails.jobType}</Text></Text>
                  </View>
                  <View style={styles.rowContainer}>
                    <Text style={styles.labelText}>Bed: <Text style={{ color: 'gray' }}>{userDetails.bed_id}</Text></Text>
                  </View>
                  <View style={styles.rowContainer}>
                    <Text style={styles.labelText}>Room: <Text style={{ color: 'gray' }}>{userDetails.room_id}</Text></Text>
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => takeAction('accept')}>
                      <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button1} onPress={() => takeAction('reject')}>
                      <Text style={styles.buttonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Collapsible>
            </TouchableOpacity>
        </View> */}
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No Requests found against this bed.</Text>
              </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: 'white',
  },
  outerContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    paddingLeft: 10,
    backgroundColor: 'transparent',
  },
  header: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Semi-transparent white
    borderTopLeftRadius: 30,
    borderTopRightRadius: 0,
    flex: 1,
    paddingRight: 10,
    paddingLeft: 10,
    paddingTop: 30,
    // paddingHorizontal: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  collapsibleHeader: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10
  },
  collapheaderItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  userIconContainer: {
    marginRight: 10
  },
  userInfoContainer: {
    flex: 1
  },
  collapheaderText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  dropdownIcon: {
    marginLeft: 10
  },
  collapsibleContent: {
    paddingVertical: 10
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5
  },
  labelText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  buttonContainer: {
    padding: 20,
    borderRadius: 10,
    marginTop: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20
  },
  button: {
    padding: 10,
    backgroundColor: '#010048',
    borderRadius: 5
  },
  button1: {
    padding: 10,
    backgroundColor: '#010048',
    borderRadius: 5,
    marginLeft: 15
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  errorText: {
    color: 'red',
    fontSize: 16
  },
});

export default RequestDetails;
