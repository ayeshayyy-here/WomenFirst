import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { useNavigation } from '@react-navigation/native';

const FormD = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cnic: '',
    datee: '',
    dateb: '',
    jobTitle: '',
    jobStartDate: '',
    salary: '',
  });

  const navigation = useNavigation();

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };
  const handleNextPress = () => {
    navigation.navigate('FormA');
  };
  const handlePrevPress = () => {
    navigation.navigate('FormA');
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Application Form</Text>
      <ProgressBar step={4} />

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Employer Information</Text>
        <Text style={styles.text}>Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter applicant name"
          placeholderTextColor="grey"
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
        />
        <Text style={styles.text}>Designation:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Designation"
          placeholderTextColor="grey"
          value={formData.address}
          onChangeText={(text) => handleInputChange('address', text)}
        />
        <Text style={styles.text}>Department/Organization:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Department/Organization"
          placeholderTextColor="grey"
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
        />
            <Text style={styles.text}>Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          placeholderTextColor="grey"
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
        />
        <Text style={styles.text}>Mobile No:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile no"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.mobile}
          onChangeText={(text) => handleInputChange('mobile', text)}
        />
          <Text style={styles.text}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          placeholderTextColor="grey"
          value={formData.mobile} 
          onChangeText={(text) => handleInputChange('mobile', text)}
        />
      </View>
      <Text style={styles.declare}>Personal Declaration</Text>
      <Text style={styles.declare}>Guardian/Father/Husband Declaration</Text>
    

      <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={handlePrevPress}>
          <Text style={styles.buttonText}>Back  </Text>
        </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
     
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
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
    fontSize: 14,
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
  declare: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#010048',
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

export default FormD;
