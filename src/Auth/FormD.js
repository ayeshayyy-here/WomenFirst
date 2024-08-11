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
          placeholderTextColor="white"
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
        />
        <Text style={styles.text}>designation:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter address"
          placeholderTextColor="white"
          value={formData.address}
          onChangeText={(text) => handleInputChange('address', text)}
        />
        <Text style={styles.text}>Department/Organization:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone no"
          placeholderTextColor="white"
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
        />
            <Text style={styles.text}>Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone no"
          placeholderTextColor="white"
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
        />
        <Text style={styles.text}>Mobile No:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile no"
          placeholderTextColor="white"
          value={formData.mobile}
          onChangeText={(text) => handleInputChange('mobile', text)}
        />
          <Text style={styles.text}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile no"
          placeholderTextColor="white"
          value={formData.mobile}
          onChangeText={(text) => handleInputChange('mobile', text)}
        />
      </View>
      <Text style={styles.declare}>Personal Declaration</Text>
      <Text style={styles.declare}>Guardian/Father/Husband Declaration</Text>
    

      <View style={styles.buttonContainer}>
      <TouchableOpacity style={styles.button} onPress={handlePrevPress}>
          <Text style={styles.buttonText}>Prev  </Text>
        </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Done </Text>
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
    marginBottom: 5,
    marginTop: 5,
    color: '#010048',
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
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: 'gray',
    fontSize: 10,
  
  },
  declare: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#010048',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
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
