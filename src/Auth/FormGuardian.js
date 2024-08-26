import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView,ToastAndroid, TouchableOpacity } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { useNavigation } from '@react-navigation/native';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader'; // Import the custom Loader component
const FormG = ({ route }) => {
  const [p_id, setP_id] = useState(null);


  useEffect(() => {
    const fetchPersonalId = async () => {
      try {
        let personalId = route.params?.p_id;

        if (!personalId) {
          const user = JSON.parse(syncStorage.get('user'));
          const userId = user.id;
          const response = await fetch(`https://wwh.punjab.gov.pk/api/get-personal-id/${userId}`);
          const data = await response.json();

          if (data.status === 'success') {
            personalId = data.p_id;
          } else {
            console.error('Failed to fetch p_id:', data.message);
          }
        }

        setP_id(personalId);
      } catch (error) {
        console.error('Error fetching p_id:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalId();
  }, [route.params]);

  
  const [formData, setFormData] = useState({
    name: '',
    address:'',
    email:'',
    occupation:'',
    gmobile: '',
    relationship: '',
    ename:'',
    eaddress:'',
    eemail:'',
    erelationship: '',
    emobile: '',
  });
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };
  const handleNextPress = async () => {
    // Validate form data
   
    if (!formData.name) {
      ToastAndroid.show('Please enter your name.', ToastAndroid.LONG);
      return;
    }
    if (!formData.address) {
      ToastAndroid.show('Please enter your address.', ToastAndroid.LONG);
      return;
    }
    if (!formData.email) {
      ToastAndroid.show('Please enter email.', ToastAndroid.LONG);
      return;
    }
    if (!formData.occupation) {
      ToastAndroid.show('Please enter occupation.', ToastAndroid.LONG);
      return;
    }
    if (!formData.gmobile || formData.gmobile.length !== 11) {
      ToastAndroid.show('Please enter a valid 11-digit mobile number.', ToastAndroid.LONG);
      return;
    }
    if (!formData.emobile || formData.emobile.length !== 11) {
      ToastAndroid.show('Please enter a valid 11-digit mobile number.', ToastAndroid.LONG);
      return;
    }
    if (!formData.relationship) {
      ToastAndroid.show('Please enter relationship.', ToastAndroid.LONG);
      return;
    }
    if (!formData.ename) {
      ToastAndroid.show('Please enter your name.', ToastAndroid.LONG);
      return;
    }
    if (!formData.eaddress) {
      ToastAndroid.show('Please enter your address.', ToastAndroid.LONG);
      return;
    }
  
  

    if (!formData.erelationship) {
      ToastAndroid.show('Please enter relationship with emergency contact.', ToastAndroid.LONG);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('personal_id', p_id);
    formDataToSend.append('gname', formData.name);
    formDataToSend.append('gaddress', formData.address);
    formDataToSend.append('gmobile', formData.gmobile);
    formDataToSend.append('gemail', formData.email);
    formDataToSend.append('goccupation', formData.occupation);
    formDataToSend.append('relationship', formData.relationship);
    formDataToSend.append('ename', formData.ename);
    formDataToSend.append('erelationship', formData.erelationship);
    formDataToSend.append('eaddress', formData.eaddress);
    formDataToSend.append('emobile', formData.emobile);
    // Log the data being sent
    console.log('Data to be sent:', formDataToSend);
  
    try {
      setLoading(true); // Show loader
      const response = await fetch('https://wwh.punjab.gov.pk/api/guardian', {
        method: 'POST',
        body: formDataToSend,
      });
  
      const result = await response.json();
      
      // Log the server response
      console.log('Server response:', result);
  
      if (response.ok) {
        ToastAndroid.show('Form submitted successfully!', ToastAndroid.LONG);
        navigation.navigate('FormA');
      } else {
        ToastAndroid.show('Failed to submit the form. Please try again.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    }finally {
      setLoading(false); // Hide loader
    }
  };

  const handlePrevPress = () => {
    navigation.navigate('FormP');
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Application Form</Text>
      <ProgressBar step={2} />

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Guardian Information</Text>
        <View style={styles.divider} />

        <Text style={styles.text}>Father/Husband/Guardian Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Name"
          placeholderTextColor="grey"
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
        />
        <Text style={styles.text}>Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          placeholderTextColor="grey"
          value={formData.address}
          onChangeText={(text) => handleInputChange('address', text)}
        />
        <Text style={styles.text}>Email Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email Address"
          placeholderTextColor="grey"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
        />
            <Text style={styles.text}>Occupation:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Occupation"
          placeholderTextColor="grey"
          value={formData.occupation}
          onChangeText={(text) => handleInputChange('occupation', text)}
        />
        <Text style={styles.text}>Mobile No:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Mobile No"
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={formData.gmobile}
          onChangeText={(text) => handleInputChange('gmobile', text)}
        />
          <Text style={styles.text}>Relationship:</Text>
        <TextInput
          style={styles.input}
          placeholder="Select Relationship"
          placeholderTextColor="grey"
          value={formData.relationship}
          onChangeText={(text) => handleInputChange('relationship', text)}
        />
      </View>

      {/* CNIC Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Person to be informed in case of emergency</Text>
        <View style={styles.divider} />
        <Text style={styles.text}>Father/Husband/Guardian Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Name"
          placeholderTextColor="grey"
          value={formData.ename}
          onChangeText={(text) => handleInputChange('ename', text)}
        />
        <Text style={styles.text}>Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          placeholderTextColor="grey"
          value={formData.eaddress}
          onChangeText={(text) => handleInputChange('eaddress', text)}
        />
        {/* <Text style={styles.text}>Email Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email Address"
          placeholderTextColor="grey"
          value={formData.eemail}
          onChangeText={(text) => handleInputChange('eemail', text)}
        /> */}
          <Text style={styles.text}>Mobile No:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Mobile No"
          placeholderTextColor="grey"
          keyboardType="numeric"
          maxLength={11}
          value={formData.emobile}
          onChangeText={(text) => handleInputChange('emobile', text)}
        />
        <Text style={styles.text}>Relationship:</Text>
        <TextInput
          style={styles.input}
          placeholder="Select Relationship"
          placeholderTextColor="grey"
          value={formData.erelationship}
          onChangeText={(text) => handleInputChange('erelationship', text)}
        />
      </View>
    

      <View style={styles.buttonContainer}>
      {/* <TouchableOpacity style={styles.button} onPress={handlePrevPress}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.button} onPress={handleNextPress}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <Loader loading={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  divider: {
    height: 0.2,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '90%',  // Set the width of the divider (e.g., 80% of the container's width)
    alignSelf: 'center',  // Center the divider within its container
  }, 
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#010048',

    padding: 10,
  },
  detail: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#010048',
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
  textInputContainer: {
    marginTop: 8,
   
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
 
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    width: '100%', // Ensures the container takes full width
    paddingHorizontal: 16, // Optional: Adds padding around the container
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

export default FormG;
