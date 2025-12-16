import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Image, StyleSheet, ToastAndroid, TextInput } from 'react-native';
import Confirmation from '../../assets/images/confirmation.png';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader';
import LinearGradient from 'react-native-linear-gradient';
const ConfirmationScreen = ({ route, navigation }) => {
  const { bedId } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [instituteId, setInstituteId] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null);

  useEffect(() => {
    const fetchBookingStatus = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(syncStorage.get('user'));
        const userId = user.id;

        console.log('Fetching registration status for user ID:', userId);

        console.log(`Sending request with user ID: ${userId}`); // Added this log statement

        const response = await fetch(`https://wwh.punjab.gov.pk/api/roombookedAccRejnew/${userId}`);
        console.log('Booking status response status:', response.status);

        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const responseText = await response.text();
        let status;
        try {
          status = JSON.parse(responseText);
        } catch (e) {
          status = responseText;
        }

        console.log('Parsed booking status:', status);
        setBookingStatus(status);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching booking status:', error);
        setLoading(false);
      }
    };

    fetchBookingStatus();
  }, []);


  useEffect(() => {
    console.log('Checking bookingStatus:', bookingStatus);
    // Set modalVisible based on the current bookingStatus
    if (bookingStatus === 'Rejected' || bookingStatus === 'Not Found' || bookingStatus === 'Accepted' || bookingStatus === 'pending' || bookingStatus === 'Accepted and Applied') {
      console.log('Setting modalVisible to true');
      setModalVisible(true);
    } else {
      console.log('Setting modalVisible to false');
      setModalVisible(false);
    }
  }, [bookingStatus]);

  const handleEditRequest = () => {
    navigation.navigate('EditRooms');
  };
  const handleApply = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user.id;
  
      // Fetch room_id based on bed_id
      const roomResponse = await fetch(`https://wwh.punjab.gov.pk/api/bedbyroom/${bedId}`);
      const roomResult = await roomResponse.json();
  
      let roomId = null;
      if (roomResult.success) {
        roomId = roomResult.room_id;
      } else {
        console.error('Error fetching room_id:', roomResult.message);
        throw new Error('Failed to retrieve room information');
      }
  
      // Fetch institute_id based on user_id
      const instituteResponse = await fetch(`https://wwh.punjab.gov.pk/api/userinstitute/${userId}`);
      const instituteResult = await instituteResponse.json();
  
      let instituteId = null;
      if (instituteResult.success && instituteResult.institute.length > 0) {
        instituteId = instituteResult.institute[0].institute; // Adjust based on the returned data structure
      } else {
        console.error('Error fetching institute_id:', instituteResult.message);
        throw new Error('Failed to retrieve institute information');
      }
      
         // Fetch district_id based on user_id
 const districtResponse = await fetch(`https://wwh.punjab.gov.pk/api/userdistrict/${userId}`);
 const districtResult = await districtResponse.json();

 let districtId = null;
 if (districtResult.success && districtResult.district.length > 0) {
   districtId = districtResult.district[0].applied_district;
 } else {
   console.error('Error fetching district_id:', districtResult.message);
   throw new Error('Failed to retrieve district information');
 }
   
      // Log data for verification
      console.log('Submitting application with data:', {
        room_id: roomId,
        bed_id: bedId,
        district_id: districtId,
        institute_id: instituteId,
        user_id: userId,
      });
  
      // Submit the application
      const response = await fetch('https://wwh.punjab.gov.pk/api/userbedapplication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          bed_id: bedId,
          district_id: districtId,
          institute_id: instituteId,
          user_id: userId,
          status: 'pending',
        }),
      });
  
      const result = await response.json();
      console.log('Application response:', result);
  
      if (result.success) {
        ToastAndroid.show('Applied for room successfully!', ToastAndroid.LONG);
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };
  const handlechangeroom = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user.id;
    
  
      // Fetch room_id based on bed_id
      const roomResponse = await fetch(`https://wwh.punjab.gov.pk/api/bedbyroom/${bedId}`);
      const roomResult = await roomResponse.json();
  
      let roomId = null;
      if (roomResult.success) {
        roomId = roomResult.room_id;
      } else {
        console.error('Error fetching room_id:', roomResult.message);
        throw new Error('Failed to retrieve room information');
      }
  
      // Fetch institute_id based on user_id
      const instituteResponse = await fetch(`https://wwh.punjab.gov.pk/api/userinstitute/${userId}`);
      const instituteResult = await instituteResponse.json();
  
      let instituteId = null;
      if (instituteResult.success && instituteResult.institute.length > 0) {
        instituteId = instituteResult.institute[0].institute; // Adjust based on the returned data structure
      } else {
        console.error('Error fetching institute_id:', instituteResult.message);
        throw new Error('Failed to retrieve institute information');
      }
   // Fetch district_id based on user_id
 const districtResponse = await fetch(`https://wwh.punjab.gov.pk/api/userdistrict/${userId}`);
 const districtResult = await districtResponse.json();

 let districtId = null;
 if (districtResult.success && districtResult.district.length > 0) {
   districtId = districtResult.district[0].applied_district;
 } else {
   console.error('Error fetching district_id:', districtResult.message);
   throw new Error('Failed to retrieve district information');
 }
      // Log data for verification
      console.log('Submitting application with data:', {
        room_id: roomId,
        bed_id: bedId,
        district_id: districtId,
        institute_id: instituteId,
        user_id: userId,
      });
  
      // Submit the application
      const response = await fetch('https://wwh.punjab.gov.pk/api/changeroomapplication', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: roomId,
          bed_id: bedId,
          district_id: districtId,
          institute_id: instituteId,
          user_id: userId,
          reason: reason,
        }),
      });
  
      const result = await response.json();
      console.log('Application response:', result);
  
      if (result.success) {
        ToastAndroid.show('Applied for room successfully!', ToastAndroid.LONG);
        navigation.navigate('Dashboard');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };
  const [reason, setReason] = useState('');

  const handleRoomChangeRequest = () => {
    if (!reason.trim()) {
      ToastAndroid.show('Please provide a reason for the room change.', ToastAndroid.SHORT);
      return;
    }
    handlechangeroom(reason);
  };
  const renderStatusModal = () => {
    console.log('Rendering status modal with bookingStatus:', bookingStatus);
    switch (bookingStatus) {
      case 'Accepted':
        return (
          <View style={styles.modalView}>
          <Image source={Confirmation} style={styles.image} />
          <Text style={styles.modalText}>
            You have already been assigned a room. Would you like to request a room change?
          </Text>
          <Text style={styles.modalTextroom}>
            Please provide a reason for your request:
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter reason here..."
            placeholderTextColor="#777"
            onChangeText={(text) => setReason(text)}
            value={reason}
            multiline
          />
           <LinearGradient
                colors={['#352E64', '#982B5D', '#632D61', '#982B5D', '#352E64']}
                locations={[0, 0.14, 0.39, 0.73, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalOption}
              >
            <TouchableOpacity style={[styles.button, styles.modalOption]} onPress={handleRoomChangeRequest}>
              <Text style={styles.modalOptionText}>Request Room</Text>
            </TouchableOpacity>
            </LinearGradient>
            <LinearGradient
                colors={['#474241', '#474241', '#474241', '#ae9995', '#474241']}
                locations={[0, 0.14, 0.39, 0.73, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalOption}
              >
            <TouchableOpacity style={[styles.button, styles.modalOption]} onPress={() => navigation.goBack()}>
              <Text style={styles.modalOptionText}>Cancel</Text>
            </TouchableOpacity>
            </LinearGradient>
        
        </View>
        );
        case 'Accepted and Applied':
          return (
            <View style={styles.modalView}>
            <Image source={Confirmation} style={styles.image} />
            <Text style={styles.modalText}>
              Your request for changing room is pending.
            </Text>
           
            <Text style={styles.modalTextroom}>
        You'll be notified once your application gets accepted or rejected
          </Text>
           
              <LinearGradient
                  colors={['#474241', '#474241', '#474241', '#ae9995', '#474241']}
                  locations={[0, 0.14, 0.39, 0.73, 1]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalOption}
                >
              <TouchableOpacity style={[styles.button, styles.modalOption]} onPress={() => navigation.goBack()}>
                <Text style={styles.modalOptionText}>Cancel</Text>
              </TouchableOpacity>
              </LinearGradient>
          
          </View>
          );
      case 'Pending':
        return (
          <View style={styles.modalView}>
            <Image source={Confirmation} style={styles.image} />
            <Text style={styles.modalTitle}>Edit Request</Text>
            <Text style={styles.modalMessage}>Your request for the room is pending. Do you want to edit it?</Text>
            <LinearGradient
                colors={['#352E64', '#982B5D', '#632D61', '#982B5D', '#352E64']}
                locations={[0, 0.14, 0.39, 0.73, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalOption}
              >
            <TouchableOpacity style={[styles.button, styles.modalOption]} onPress={handleEditRequest}>
              <Text style={styles.modalOptionText}>    Edit   </Text>
            </TouchableOpacity>
            </LinearGradient>
            <LinearGradient
                colors={['#474241', '#474241', '#474241', '#ae9995', '#474241']}
                locations={[0, 0.14, 0.39, 0.73, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalOption}
              >
            <TouchableOpacity style={[styles.button, styles.modalOption]} onPress={() => navigation.goBack()}>
              <Text style={styles.modalOptionText}>Cancel</Text>
            </TouchableOpacity>
            </LinearGradient>
          </View>
        );
      case 'Rejected':
      case 'Not Found':
      default:
        return (
          <View style={styles.modalView}>
            <Image source={Confirmation} style={styles.image} />
            <Text style={styles.modalTitlee}>Are you sure you want to apply?</Text>
            <Text style={styles.modalMessage}>
              If you choose to apply, your application will be submitted to the manager and you will have to wait until the manager approves or rejects the application.
            </Text>
            <LinearGradient
                colors={['#352E64', '#412E63', '#632D61', '#982B5D', '#C82A59']}
                locations={[0, 0.14, 0.39, 0.73, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalOption}
              >
            <TouchableOpacity style={[styles.button, styles.buttonApply]} onPress={handleApply}>
              <Text style={styles.modalOptionText}>APPLY</Text>
            </TouchableOpacity>
            </LinearGradient>
            <LinearGradient
                 colors={['#474241', '#474241', '#474241', '#ae9995', '#474241']}
                locations={[0, 0.14, 0.39, 0.73, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalOption}
              >
            <TouchableOpacity style={[styles.button, styles.buttonApply]} onPress={() => navigation.goBack()}>
              <Text style={styles.modalOptionText}>CANCEL</Text>
            </TouchableOpacity>
            </LinearGradient>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {loading && <Loader loading={loading} />}
      {!loading && (

          <View style={styles.centeredView}>
            {renderStatusModal()}
          </View>
    
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 100,
    height: 100,
    position: 'absolute',
    top: -50,
    left: '50%',
    marginLeft: -50,
  },
  modalText: {
    marginTop: 60,
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6C5B7B',
  },
  modalTextroom: {
    marginTop: 5,
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 'bold',
    color: 'gray',
  },
  smallText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 12,
  },
  input: {
    height: 80,
    width: '100%',
    marginVertical: 10,
    textAlignVertical: 'top',
    color: '#333',
    fontSize: 12,
  },
  button: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 80,
    width: '100%',
    marginTop: 5,
  },
  buttonApply: {
  
    alignItems: 'center',
    paddingVertical: 5,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  buttonCancel: {
    backgroundColor: '#6C5B7B',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOption: {
    alignItems: 'center',
    paddingVertical: 5,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  modalOptionText: {
    fontSize: 12,
    color: 'white',
  },

  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 30,
    color: 'black',
  },
  modalTitlee: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 30,
    color: 'black',
  },
});

export default ConfirmationScreen;
