// File: AddRooms.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, ToastAndroid, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Loader from '../components/Loader';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Sidebar from '../components/Sidebar';
import syncStorage from 'react-native-sync-storage';
import { RadioButton } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown'; 
import VisitorIcon from '../../assets/images/location.png';

const AddRooms = () => {
  const [collapsedStates, setCollapsedStates] = useState([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [formData, setFormData] = useState({
    roomName: '',
    selectedOption: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Guest');
  const navigation = useNavigation();

  const options = [
    { id: 'single', name: 'Single' },
    { id: 'double', name: 'Double' },
    { id: 'triple', name: 'Triple' },
    { id: 'fourth', name: 'Fourth' },
    { id: 'fifth', name: 'Fifth' }
  ];

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.roomName || !formData.selectedOption) {
      ToastAndroid.show('Please fill out all fields.', ToastAndroid.LONG);
      return;
    }
  
    setLoading(true);
  
    try {
      const user = JSON.parse(syncStorage.get('user'));
      const requestData = {
        room_name: formData.roomName,
        room_type: formData.selectedOption,
        status: formData.status,
        district_id: user.district,
        institute_id: user.institute,
      };
  
      console.log('Form Data to be submitted:', requestData);
  
      // Setting up a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
  
      const response = await fetch('https://wwh.punjab.gov.pk/api/addroombym', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
  
      clearTimeout(timeoutId); // Clear the timeout when the request completes
  
      // Debugging: Log the response status and headers
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
  
      const result = await response.json();
      console.log('Server response:', result);
  
      if (response.ok) {
        ToastAndroid.show('Room added successfully!', ToastAndroid.LONG);
        // Reset form data to clear the fields
        setFormData({
          roomName: '',
          selectedOption: '',
          status: '',
        });
      } else {
        ToastAndroid.show('Failed to submit the form. Please try again.', ToastAndroid.LONG);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Error: Request timed out');
        ToastAndroid.show('Request timed out. Please try again.', ToastAndroid.LONG);
      } else {
        console.error('Error submitting form:', error.message);
        ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  
  useEffect(() => {
    const user = JSON.parse(syncStorage.get('user'));
    const storedUserId = user?.id;
    const storedUserName = user?.institute || 'Guest';
    setUserId(storedUserId);
    setUserName(storedUserName);

    const interval = setInterval(() => {
      const date = new Date();
      const hours = date.getHours() % 12 || 12;
      const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
      const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
      const formattedTime = `${hours}:${minutes} ${ampm}`;
      const formattedDate = date.toDateString();
      setCurrentTime(formattedTime);
      setCurrentDate(formattedDate);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#010048', '#020035', '#030022']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity  onPress={() => navigation.navigate('DashboardM')}>
            <Icon name="arrow-left" size={24} color="#fff" style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.headerText}>Add Rooms</Text>
        </View>
      </LinearGradient>

      {/* Card View */}
      <View style={styles.cardContainer}>
        <LinearGradient
          colors={['#010048', '#015B7B', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0.2, 0.6, 1]}
          style={styles.card}
        >
          <View style={styles.cardLeft}>
            <Image
              source={VisitorIcon}
              style={{ width: 60, height: 60, marginRight: 20 }}
            />
            <Text style={styles.cardText}>Working Women Hostel</Text>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.dateText}>{currentDate}</Text>
            <Text style={styles.timeText}>{currentTime}</Text>
          </View>
        </LinearGradient>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.text}>Room Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            placeholderTextColor="grey"
            value={formData.roomName}
            onChangeText={(value) => handleInputChange('roomName', value)}
          />

          <Text style={styles.text}>Room Type</Text>
          <Dropdown
            style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            itemTextStyle={styles.itemTextStyle}
            search
            searchPlaceholder="Search..."
            data={options}
            labelField="name"
            valueField="id"
            placeholder="Select an option"
            value={selectedOption}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={(item) => {
              setSelectedOption(item.id);
              handleInputChange('selectedOption', item.id);
            }}
          />

          <Text style={styles.text}>Status</Text>
          <View style={styles.radioContainer}>
            <View style={styles.radioItem}>
              <RadioButton
                value="active"
                status={formData.status === 'active' ? 'checked' : 'unchecked'}
                onPress={() => handleInputChange('status', 'active')}
              />
              <Text>Active</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton
                value="disabled"
                status={formData.status === 'disabled' ? 'checked' : 'unchecked'}
                onPress={() => handleInputChange('status', 'disabled')}
              />
              <Text>Disabled</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <Loader loading={loading} />
      </ScrollView>
      <Sidebar isVisible={isSidebarVisible} onClose={toggleSidebar} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#000',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: '15%',
    marginLeft: '3%',
  },
  icon: {
    padding: 10,
  },
  cardContainer: {
    margin: 20,
    borderRadius: 10,
    elevation: 5,
  },
  card: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
  },
  cardLeft: {
    flex: 1,
  },
  cardText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  timeText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '700',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: 'black',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 4,
    height: 40,
    borderWidth: 0.2,
    borderColor: 'grey',
    marginBottom: 8,
    paddingLeft: 10,
    fontSize: 12,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 30, // Added margin for better placement at the bottom
  },
  button: {
    backgroundColor: '#010048',
    paddingVertical: 10,
    paddingHorizontal: 80,
  
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  placeholderStyle: {
    color: 'grey',
    paddingHorizontal: 5,
    fontSize: 12,
  },
  selectedTextStyle: {
    color: 'black',
    fontSize: 13,
  },
  inputSearchStyle: {
    color: 'black',
    backgroundColor: 'white',
    borderRadius: 4,
    height: 35,
    borderWidth: 0.2,
    marginBottom: 8,
    marginTop: 8,
    paddingLeft: 10,
    fontSize: 12,
  },
  itemTextStyle: {
    color: 'black',
    borderColor: 'grey',
    marginBottom: 2,
    paddingLeft: 10,
    fontSize: 12,
  },
  scrollContent: {
    paddingVertical: 20,
    justifyContent: 'space-between', // This helps place content at the bottom
    flexGrow: 1,
  },
});

export default AddRooms;
