import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, ToastAndroid, TouchableOpacity , SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Loader from '../components/Loader'; // Assuming the Loader component exists
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Sidebar from '../components/Sidebar';

const HostelRegistration = () => {
    const [collapsedStates, setCollapsedStates] = useState([]);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    const toggleSidebar = () => {
      setIsSidebarVisible(!isSidebarVisible);
    };
  const [formData, setFormData] = useState({
    inchargeName: '',
    inchargeMobile: '',
    inchargeEmail: '',
    officialContact: '',
    hostelLocation: '',
    totalCapacity: '',
    currentResidents: '',
    computerLab: '',
    computerSystems: '',
    shortCourses: '',
    duesCollection: '',
  });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = async () => {
    // Validate form data
    if (!formData.inchargeName) {
      ToastAndroid.show('Please enter the name of the hostel incharge.', ToastAndroid.LONG);
      return;
    }
    if (!formData.inchargeMobile || formData.inchargeMobile.length !== 11) {
      ToastAndroid.show('Please enter a valid 11-digit mobile number.', ToastAndroid.LONG);
      return;
    }
    if (!formData.inchargeEmail) {
      ToastAndroid.show('Please enter the email of the hostel incharge.', ToastAndroid.LONG);
      return;
    }
    if (!formData.officialContact) {
      ToastAndroid.show('Please enter the official contact number.', ToastAndroid.LONG);
      return;
    }
    if (!formData.hostelLocation) {
      ToastAndroid.show('Please enter the location of the hostel.', ToastAndroid.LONG);
      return;
    }
    if (!formData.totalCapacity) {
      ToastAndroid.show('Please enter the total capacity of the hostel.', ToastAndroid.LONG);
      return;
    }
    if (!formData.currentResidents) {
      ToastAndroid.show('Please enter the current number of residents.', ToastAndroid.LONG);
      return;
    }
    if (!formData.computerLab) {
      ToastAndroid.show('Please specify if there is a computer lab facility.', ToastAndroid.LONG);
      return;
    }
    if (!formData.computerSystems) {
      ToastAndroid.show('Please enter the number of computer systems available.', ToastAndroid.LONG);
      return;
    }
    if (!formData.shortCourses) {
      ToastAndroid.show('Please specify if there are short courses available.', ToastAndroid.LONG);
      return;
    }
    if (!formData.duesCollection) {
      ToastAndroid.show('Please specify the method of dues collection.', ToastAndroid.LONG);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('incharge_name', formData.inchargeName);
    formDataToSend.append('incharge_mobile', formData.inchargeMobile);
    formDataToSend.append('incharge_email', formData.inchargeEmail);
    formDataToSend.append('official_contact', formData.officialContact);
    formDataToSend.append('hostel_location', formData.hostelLocation);
    formDataToSend.append('total_capacity', formData.totalCapacity);
    formDataToSend.append('current_residents', formData.currentResidents);
    formDataToSend.append('computer_lab', formData.computerLab);
    formDataToSend.append('computer_systems', formData.computerSystems);
    formDataToSend.append('short_courses', formData.shortCourses);
    formDataToSend.append('dues_collection', formData.duesCollection);

    try {
      setLoading(true); // Show loader
      const response = await fetch('https://your-api-endpoint.com/hostel_registration', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (response.ok) {
        ToastAndroid.show('Form submitted successfully!', ToastAndroid.LONG);
        navigation.navigate('NextScreen'); // Replace 'NextScreen' with the actual next screen
      } else {
        ToastAndroid.show('Failed to submit the form. Please try again.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false); // Hide loader
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    <LinearGradient
colors={['#010048', '#020035', '#030022']} // Updated dark blue gradient colors
locations={[0, 0.5, 1]} // Adjust the location for a smooth gradient
start={{ x: 0, y: 0 }}
end={{ x: 0, y: 1 }} // Change to vertical gradient (top to bottom)
>
<View style={styles.header}>
{/* Three Dashes Icon */}
<TouchableOpacity onPress={toggleSidebar}>
<Icon name="bars" size={24} color="#fff" style={styles.icon} />
</TouchableOpacity>

{/* Applications Text */}
<Text style={styles.headerText}>Hostel Registration Form</Text>


</View>
</LinearGradient>
    <ScrollView>
      <View style={styles.section}>
        <Text style={styles.text}>Hostel Incharge Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Name"
          placeholderTextColor="grey"
          value={formData.inchargeName}
          onChangeText={(value) => handleInputChange('inchargeName', value)}
        />
        <Text style={styles.text}>Incharge Mobile Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Mobile No"
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={formData.inchargeMobile}
          onChangeText={(value) => handleInputChange('inchargeMobile', value)}
        />
        <Text style={styles.text}>Incharge Email Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email Address"
          placeholderTextColor="grey"
          value={formData.inchargeEmail}
          onChangeText={(value) => handleInputChange('inchargeEmail', value)}
        />
        <Text style={styles.text}>Official Contact No.:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Official Contact"
          placeholderTextColor="grey"
          value={formData.officialContact}
          onChangeText={(value) => handleInputChange('officialContact', value)}
        />
        <Text style={styles.text}>Location of Hostel:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Location"
          placeholderTextColor="grey"
          value={formData.hostelLocation}
          onChangeText={(value) => handleInputChange('hostelLocation', value)}
        />
        <Text style={styles.text}>Total Capacity of Residents:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Total Capacity of Residents"
          placeholderTextColor="grey"
          value={formData.totalCapacity}
          onChangeText={(value) => handleInputChange('totalCapacity', value)}
        />
        <Text style={styles.text}>Current No. of Residents:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Current No. of Residents"
          placeholderTextColor="grey"
          value={formData.currentResidents}
          onChangeText={(value) => handleInputChange('currentResidents', value)}
        />
        <Text style={styles.text}>How many Computer systems are available?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter No. of Systems"
          placeholderTextColor="grey"
          value={formData.computerSystems}
          onChangeText={(value) => handleInputChange('computerSystems', value)}
        />
        <Text style={styles.text}>Is there any facility of Computer lab for residents in the hostel?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Details"
          placeholderTextColor="grey"
          value={formData.computerLab}
          onChangeText={(value) => handleInputChange('computerLab', value)}
        />
        <Text style={styles.text}>Is there any facility of short courses available in the hostel?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Details"
          placeholderTextColor="grey"
          value={formData.shortCourses}
          onChangeText={(value) => handleInputChange('shortCourses', value)}
        />
        <Text style={styles.text}>Hosteldues are collected through bank or cash?</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Collection Method"
          placeholderTextColor="grey"
          value={formData.duesCollection}
          onChangeText={(value) => handleInputChange('duesCollection', value)}
        />
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
        justifyContent: 'space-between', // Space between icons and text
        alignItems: 'center',
        paddingHorizontal: 10, // Horizontal padding for spacing
        paddingVertical: 15,   // Vertical padding for spacing
        backgroundColor: '#000', // Optional: background color for the header
      },
      headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,              // Make the text take the remaining space
        textAlign: 'center',   // Center the text
        marginRight: '15%',   
        marginLeft: '3%',      // Optional: ensure space between text and the three dashes icon
      },
      icon: {
        padding: 10, // Optional: padding around the icon for a better touch target
      },
    
  divider: {
    height: 0.2,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '90%',  // Set the width of the divider (e.g., 80% of the container's width)
    alignSelf: 'center',  // Center the divider within its container
  }, 
  
  section: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20, 
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,  // Adjust this value to control the space between text and TextInput
    marginTop: 5,
    color: 'black',
  },
  input: {
    flex: 1,
    color: 'black',
    backgroundColor: 'white',
    borderRadius: 4,
    height: 40,
    borderWidth: 0.2,
    borderColor: 'grey',
    marginBottom: 8,  // Adds space between each TextInput
    paddingLeft: 10,
    fontSize: 12,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#010048',
    paddingVertical: 10,
    marginVertical: 10,
    paddingHorizontal: 22,
    marginHorizontal: 8,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default HostelRegistration;
