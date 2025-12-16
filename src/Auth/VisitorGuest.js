
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, FlatList, ToastAndroid, } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { RadioButton, Provider } from 'react-native-paper';
import syncStorage from 'react-native-sync-storage';
import LinearGradient from 'react-native-linear-gradient';

const VisitorGuest = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Visitor');
  const [selectedValueguest, setSelectedValueguest] = useState('');
  const [selectedValuevisit, setSelectedValuevisit] = useState('');
  const [selectedValuee, setSelectedValuee] = useState(null);
  const [amount, setAmount] = useState('');

  const [visitorData, setVisitorData] = useState({
    residentName: '',
    visitorName: '',
    cnic: '',
    contact: '',
    relationship: '',
    stayDate: '',
    startTime: '',
    endTime: ''
  });
  
  const [guestData, setGuestData] = useState({
    residentName: '',
    guestName: '',
    cnic: '',
    contact: '',
    relationship: '',
    stayDate: '',
    stayDuration: '',
    amount: ''
  });




  const handleSubmitVisitor = async () => {
    const user = JSON.parse(syncStorage.get('user'));
    const userId = user?.id;
    const username = user?.name;
  
    // Helper function to format time as 'H:i' (24-hour format)
    const formatTime = (time) => {
      if (!time) return null; // Return null if time is not provided or invalid
      const timeParts = time.split(':'); // Assuming the time is in HH:mm format
      if (timeParts.length !== 2) return null; // If the format is incorrect, return null
      let [hours, minutes] = timeParts;
      if (hours.length < 2) hours = `0${hours}`; // Add leading zero if necessary
      if (minutes.length < 2) minutes = `0${minutes}`; // Add leading zero if necessary
      return `${hours}:${minutes}`;
    };
  
    console.log("Raw startTime:", visitorData.startTime);
    console.log("Raw endTime:", visitorData.endTime);
  
    // Ensure start and end times are valid before formatting
    const formattedStartTime = formatTime(visitorData.startTime);
    const formattedEndTime = formatTime(visitorData.endTime);
  
    // Log the formatted times to check if they are correct
    console.log("Formatted startTime:", formattedStartTime);
    console.log("Formatted endTime:", formattedEndTime);
  
    // Validate required fields and show toast messages for missing fields
    if (!userId) {
      ToastAndroid.show('User ID is missing. Please log in again.', ToastAndroid.LONG);
      return;
    }
    if (!username) {
      ToastAndroid.show('Username is missing.', ToastAndroid.LONG);
      return;
    }
    if (!visitorData.visitorName) {
      ToastAndroid.show('Visitor name is required.', ToastAndroid.LONG);
      return;
    }
    if (!visitorData.cnic) {
      ToastAndroid.show('Visitor CNIC is required.', ToastAndroid.LONG);
      return;
    }
    if (!visitorData.contact) {
      ToastAndroid.show('Visitor contact is required.', ToastAndroid.LONG);
      return;
    }
    if (!selectedValuevisit) {
      ToastAndroid.show('Visitor relationship is required.', ToastAndroid.LONG);
      return;
    }
    if (!visitorData.stayDate) {
      ToastAndroid.show('Visit date is required.', ToastAndroid.LONG);
      return;
    }
    if (!formattedStartTime || !formattedEndTime) {
      ToastAndroid.show('Invalid or missing start or end time.', ToastAndroid.LONG);
      return;
    }
  
    const payload = {
      user_id: userId,
      type: 'visitor',
      resident_name: username,
      visitor_name: visitorData.visitorName,
      visitor_cnic: visitorData.cnic,
      visitor_contact: visitorData.contact,
      visitor_relation: selectedValuevisit,
      visit_date: visitorData.stayDate,
      visit_time_start: formattedStartTime, // Use formatted time
      visit_time_end: formattedEndTime, // Use formatted time
    };
  
    console.log("Visitor Data Sent:", payload); // Log the data being sent
  
    try {
      const response = await fetch('https://wwh.punjab.gov.pk/api/storeVisitorOrGuest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      // Log the server's response
      const responseData = await response.json();
      console.log("Visitor Response:", responseData);
  
      if (response.ok) {
        ToastAndroid.show('Visitor data submitted successfully!', ToastAndroid.LONG);
        setVisitorData({
          residentName: '',
          visitorName: '',
          cnic: '',
          contact: '',
          relationship: selectedValuevisit,
          stayDate: '',
          startTime: '',
          endTime: ''
        });
      } else {
        ToastAndroid.show('Failed to submit visitor data.', ToastAndroid.LONG);
      }
    } catch (error) {
      ToastAndroid.show('Error submitting visitor data.', ToastAndroid.LONG);
      console.error('Error submitting visitor data:', error);
    }
  };
  
  
  

  // Function to handle guest form submission


  const handleSubmitGuest = async () => {
    const user = JSON.parse(syncStorage.get('user'));
    const userId = user?.id;
    const username = user?.name;
  
    // Validate required fields and show toast messages for missing fields
    if (!userId) {
      ToastAndroid.show('User ID is missing. Please log in again.', ToastAndroid.LONG);
      return;
    }
    if (!username) {
      ToastAndroid.show('Username is missing.', ToastAndroid.LONG);
      return;
    }
    if (!guestData.guestName) {
      ToastAndroid.show('Guest name is required.', ToastAndroid.LONG);
      return;
    }
    if (!guestData.cnic) {
      ToastAndroid.show('Guest CNIC is required.', ToastAndroid.LONG);
      return;
    }
    if (!guestData.contact) {
      ToastAndroid.show('Guest contact is required.', ToastAndroid.LONG);
      return;
    }
    if (!selectedValueguest) {
      ToastAndroid.show('Guest relationship is required.', ToastAndroid.LONG);
      return;
    }
    if (!guestData.stayDate) {
      ToastAndroid.show('Stay date is required.', ToastAndroid.LONG);
      return;
    }
    if (!selectedValuee) {
      ToastAndroid.show('Stay duration is required.', ToastAndroid.LONG);
      return;
    }
    if (!amount) {
      ToastAndroid.show('Amount is required.', ToastAndroid.LONG);
      return;
    }
  
    const payload = {
      user_id: userId,
      type: 'guest',
      resident_name: username,
      guest_name: guestData.guestName,
      guest_cnic: guestData.cnic,
      guest_contact: guestData.contact,
      guest_relation: selectedValueguest,
      guest_stay_date: guestData.stayDate,
      stay_duration_guest: selectedValuee === '1day' ? 1 : selectedValuee === '2day' ? 2 : null,
      amount: amount,
    };
  
    try {
      const response = await fetch('https://wwh.punjab.gov.pk/api/storeVisitorOrGuest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (response.ok) {
        ToastAndroid.show('Guest data submitted successfully!', ToastAndroid.LONG);
        setGuestData({
          residentName: '',
          guestName: '',
          cnic: '',
          contact: '',
          relationship: selectedValueguest,
          stayDate: '',
          stayDuration: '',
          amount: '',
        });
      } else {
        ToastAndroid.show('Failed to submit guest data.', ToastAndroid.LONG);
      }
    } catch (error) {
      ToastAndroid.show('Error submitting guest data.', ToastAndroid.LONG);
      console.error('Error submitting guest data:', error);
    }
  };
  
  // Functions to show date and time pickers
  const showDatePicker = (field) => {
    DateTimePickerAndroid.open({
      mode: 'date',
      value: new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          const date = selectedDate.toLocaleDateString();
          if (activeTab === 'Visitor') {
            setVisitorData((prevData) => ({ ...prevData, [field]: date }));
          } else {
            setGuestData((prevData) => ({ ...prevData, [field]: date }));
          }
        }
      },
    });
  };

  const showTimePicker = (field) => {
    DateTimePickerAndroid.open({
      mode: 'time',
      is24Hour: false,
      value: new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          const time = selectedDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          if (activeTab === 'Visitor') {
            setVisitorData((prevData) => ({ ...prevData, [field]: time }));
          }
        }
      },
    });
  };

  const handleDaySelection = (newValue) => {
    setSelectedValuee(newValue);
    if (newValue === '1day') {
      setAmount('100');
    } else if (newValue === '2day') {
      setAmount('200');
    } else {
      setAmount('');
    }
  };
  const [visitors, setVisitors] = useState([]);

  const fetchVisitors = async () => {
    try {
      const user = JSON.parse(syncStorage.get('user'));
      if (!user || !user.id) {
        console.error('User data not found in storage');
        return;
      }

      const userId = user.id;
      const response = await fetch(
        `https://wwh.punjab.gov.pk/api/getAllVisitors/${userId}`
      );

      if (!response.ok) {
        console.error('Failed to fetch visitors:', response.statusText);
        return;
      }

      const data = await response.json();
      console.log('Visitors Data:', data);

      if (data.success) {
        setVisitors(data.data); // ✅ Store visitors in state
      } else {
        console.error('Error fetching visitors:', data.message);
      }
    } catch (error) {
      console.error('Error fetching visitor data:', error);
    }
  };

  useEffect(() => {
    fetchVisitors(); // ✅ Fetch visitors when the component mounts
  }, []);

  const renderVisitorItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.name}>Name: {item.name}</Text>
        <LinearGradient
               colors={['#020035', '#015B7f', '#020035']}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
               locations={[0.2, 0.6, 1]}
          style={styles.badge}
        >
          <Text style={styles.badgeText}>
            {item.type === 'guest' ? 'Guest' : 'Visitor'}
          </Text>
        </LinearGradient>
      </View>

      <Text style={styles.relation}>Relation: {item.relation}</Text>

      {item.type === 'guest' ? (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Stay Duration:</Text> {item.stay_duration} days
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Date:</Text> {item.date}
          </Text>
          <View style={styles.row}>
          <Text style={styles.infoText}>
  <Text style={styles.label}>status:  </Text>
  <Text style={{ color: item.status === null || item.status === 'pending' ? 'maroon' : 'green' }}>
    {item.status ||    'pending'}
  </Text>
</Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Action:</Text>                     {item.remark}                 
          </Text>
          </View>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Date:</Text> {item.date}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Start Time:</Text> {item.start_time || 'N/A'}
          </Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>End Time:</Text> {item.end_time || 'N/A'}
          </Text>
          <View style={styles.row}>
          <Text style={styles.infoText}>
  <Text style={styles.label}>status:  </Text>
  <Text style={{ color: item.status === null || item.status === 'pending' ? 'maroon' : 'green' }}>
    {item.status ||    'pending'}
  </Text>
</Text>
          <Text style={styles.infoText}>
            <Text style={styles.label}>Action:</Text>                     {item.remark}
          </Text>
          </View>
        </View>
        
      )}
    </View>
  );
  // Render form based on the active tab
  const renderForm = () => {
    if (activeTab === 'Visitor') {
      return (
        <View>
        <Text style={styles.subHeader}>Fill up the Visitor's Information</Text>
        <Text style={styles.text}>Visitor's Name:</Text>

       <TextInput
style={styles.input}
placeholder="Enter Visitor's Name"
placeholderTextColor="grey"
value={visitorData.visitorName}
onChangeText={(text) => setVisitorData({ ...visitorData, visitorName: text })}
/>

        <Text style={styles.text}>Visitor's CNIC:</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter Visitor's CNIC:"
      placeholderTextColor="grey"
      keyboardType="numeric"
      maxLength={13}
      value={visitorData.cnic}
onChangeText={(text) => setVisitorData({ ...visitorData, cnic: text })}
    />
        <Text style={styles.text}>Visitor's Contact Number:</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter Visitor's Contact Number:"
      placeholderTextColor="grey"
      keyboardType="numeric"
      maxLength={11}
      value={visitorData.contact}
onChangeText={(text) => setVisitorData({ ...visitorData, contact: text })}
    
    />
    
   <Provider>
  <View>
  <Text style={styles.text}>Relationship With Resident:</Text>
    <RadioButton.Group
      onValueChange={(newValue) => setSelectedValuevisit(newValue)}
      value={selectedValuevisit}
    >
      <View style={styles.rowContainer}>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Friend" />
          <Text style={styles.radioText}>Female Friend</Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Cousin" />
          <Text style={styles.radioText}>Female Cousin</Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Husband" />
          <Text style={styles.radioText}>Husband</Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Father" />
          <Text style={styles.radioText}>Father</Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Mother" />
          <Text style={styles.radioText}>Mother</Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Sister" />
          <Text style={styles.radioText}>Sister</Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Brother" />
          <Text style={styles.radioText}>Brother</Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Son" />
          <Text style={styles.radioText}>Son</Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Daughter" />
          <Text style={styles.radioText}>Daughter</Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Lawyer" />
          <Text style={styles.radioText}>Niece/Nephew</Text>
        </View>
      </View>
    </RadioButton.Group>
  </View>
</Provider>
          <Text style={styles.text}>Stay Date of Visit:</Text>
          <TouchableOpacity onPress={() => showDatePicker('stayDate')}>
            <TextInput
              style={styles.input}
              placeholder="Enter Date"
              placeholderTextColor="grey"
              value={visitorData.stayDate}  // Show selected date
              editable={false}
            />
          </TouchableOpacity>

          <Text style={styles.text}>Start Time:</Text>
          <TouchableOpacity onPress={() => showTimePicker('startTime')}>
            <TextInput
              style={styles.input}
              placeholder="Enter Time"
              placeholderTextColor="grey"
              value={visitorData.startTime}  // Show selected start time
              editable={false}
            />
          </TouchableOpacity>

          <Text style={styles.text}>End Time:</Text>
          <TouchableOpacity onPress={() => showTimePicker('endTime')}>
            <TextInput
              style={styles.input}
              placeholder="Enter Time"
              placeholderTextColor="grey"
              value={visitorData.endTime}  // Show selected end time
              editable={false}
            />
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSubmitVisitor}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (activeTab === 'Guest') {
      return (
        <View>
        <Text style={styles.subHeader}>Fill up the Guest's Information</Text>
   
          <Text style={styles.text}>Guest's Name:</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter Guest's Name"
      placeholderTextColor="grey"
      value={guestData.guestName}
      onChangeText={(text) => setGuestData({ ...guestData, guestName: text })}
    />
        <Text style={styles.text}>Guest's CNIC:</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter Guest's CNIC"
      placeholderTextColor="grey"
      keyboardType="numeric"
      maxLength={13}
      value={guestData.cnic}
      onChangeText={(text) => setGuestData({ ...guestData, cnic: text })}
    />
        <Text style={styles.text}>Guest's Contact Number:</Text>
    <TextInput
      style={styles.input}
      placeholder="Enter Guest's Contact Number"
      placeholderTextColor="grey"
      keyboardType="numeric"
      maxLength={11}
      value={guestData.contact}
      onChangeText={(text) => setGuestData({ ...guestData, contact: text })}
    />
     <Provider>
  <View>
  <Text style={styles.text}>Relationship With Resident:</Text>
    <RadioButton.Group
      onValueChange={(newValue) => setSelectedValueguest(newValue)}
      value={selectedValueguest}
    >
      <View style={styles.rowContainer}>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Real Mother" />
          <Text style={styles.radioText}>Real Mother</Text>
        </View>
        <View style={styles.radioButtonContainer}>
          <RadioButton value="Real Sister" />
          <Text style={styles.radioText}>Real Sister</Text>
        </View>
        </View>
    </RadioButton.Group>
  </View>
</Provider>
          <Text style={styles.text}>Stay Date:</Text>
          <TouchableOpacity onPress={() => showDatePicker('stayDate')}>
            <TextInput
              style={styles.input}
              placeholder="Enter Date"
              placeholderTextColor="grey"
              value={guestData.stayDate}  // Show selected date
              editable={false}
            />
          </TouchableOpacity>

          <Provider>
            <View>
              <Text style={styles.text}>How Many Days Stay?:</Text>
              <RadioButton.Group onValueChange={handleDaySelection} value={selectedValuee}>
                <View style={styles.rowContainer}>
                  <View style={styles.radioButtonContainer}>
                    <RadioButton value="1day" />
                    <Text style={styles.radioText}>1 Day</Text>
                  </View>
                  <View style={styles.radioButtonContainer}>
                    <RadioButton value="2day" />
                    <Text style={styles.radioText}>2 Day</Text>
                  </View>
                </View>
              </RadioButton.Group>

              <Text style={styles.text}>Amount:</Text>
              <TextInput
                style={styles.input}
                value={amount}
                placeholder="Enter amount"
                placeholderTextColor="grey"
                editable={false} // Make it non-editable if you want the amount to be automatically filled
              />
            </View>
          </Provider>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleSubmitGuest}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    else if (activeTab === 'LOGS') {
      return (
        <View>
        <Text style={styles.subHeader}>Visitors & Guests Logs</Text>
 
      {visitors.length > 0 ? (
           <FlatList
           data={visitors}
           keyExtractor={(item) => item.id.toString()}
           renderItem={renderVisitorItem}
           contentContainerStyle={styles.list}
         />
      ) : (
        <Text>No visitors found for this user.</Text>
      )}
    
      
        </View>
      );
    }
    return null;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Visitors & Guest Registration</Text>
      <View style={styles.iconContainer}>
        <TouchableOpacity onPress={() => setActiveTab('Visitor')} style={styles.iconWrapper}>
          <Icon name="user-plus" size={18} color="white" style={[styles.icon, activeTab === 'Visitor' && styles.activeIcon]} />
          <Text style={[styles.iconText, activeTab === 'Visitor' && styles.activeIconText]}>Visitor Form</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Guest')} style={styles.iconWrapper}>
          <Icon name="users" size={18} color="white" style={[styles.icon, activeTab === 'Guest' && styles.activeIcon]} />
          <Text style={[styles.iconText, activeTab === 'Guest' && styles.activeIconText]}>Guest Form</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('LOGS')} style={styles.iconWrapper}>
          <Icon name="list" size={18} color="white" style={[styles.icon, activeTab === 'LOGS' && styles.activeIcon]} />
          <Text style={[styles.iconText, activeTab === 'lOGS' && styles.activeIconText]}>Logs</Text>
        </TouchableOpacity>
      </View>
      {renderForm()}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  header: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#010048',
    marginBottom: 25,
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  iconWrapper: {
    alignItems: 'center',
  },
  icon: {
    backgroundColor: 'gray',
    paddingHorizontal: 40,
    paddingVertical: 8,
    borderRadius: 30,
  },
  activeIcon: {
    backgroundColor: '#010048',
  },
  iconText: {
    color: 'gray',
    marginTop: 4,
    fontWeight: 'bold',
    fontSize: 12,
  },
  activeIconText: {
    color: '#010048',
    fontWeight: 'bold',
    fontSize: 12,
  },
  subHeader: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#010048',
    marginBottom: 16,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 5,
    color: 'black',
  },
  textt: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 5,
    color: 'black',
  },
  textaount: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 5,
    color: 'gray',
    textAlign: 'center',
  },
  input: {
    flex: 1,
    color: 'black',
    backgroundColor: 'white',
    borderRadius: 4,
    height: 40,
    borderWidth: 0.2,
    borderColor: 'grey',
    marginBottom: 8,
    paddingLeft: 10,
    fontSize: 12,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#010048',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  datePickerWrapper: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    height: 40,
  },
 
 
  rowContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%', // Make each radio button take about half the width
    marginVertical: 5,
    marginHorizontal: 5,
  },
  radioText: { fontSize: 12 },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#010048',
  },
  badge: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  relation: {
    fontSize: 10,
    color: '#555',
    marginTop: 2,
    fontStyle: 'italic',
  },
  infoContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  infoText: {
    fontSize: 10,
    color: '#444',
    marginTop: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#010048',
  },
  bold: {
    

    fontWeight: 'bold',
  },
});
export default VisitorGuest;