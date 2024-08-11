import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { useNavigation } from '@react-navigation/native';

const FormP = () => {
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
    navigation.navigate('FormG');
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Application Form</Text>
      <ProgressBar step={1} />

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Personal Information</Text>
        <Text style={styles.text}>Applicant's Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter applicant name"
          placeholderTextColor="white"
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
        />
        <Text style={styles.text}>Permanent Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter address"
          placeholderTextColor="white"
          value={formData.address}
          onChangeText={(text) => handleInputChange('address', text)}
        />
        <Text style={styles.text}>Phone No:</Text>
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
      </View>

      {/* CNIC Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>CNIC Information</Text>
        <Text style={styles.text}>CNIC:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter CNIC"
          placeholderTextColor="white"
          value={formData.cnic}
          onChangeText={(text) => handleInputChange('cnic', text)}
        />
        <Text style={styles.text}>Date of Expiry:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter date"
          placeholderTextColor="white"
          value={formData.datee}
          onChangeText={(text) => handleInputChange('datee', text)}
        />
        <Text style={styles.text}>Date of Birth:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter date"
          placeholderTextColor="white"
          value={formData.dateb}
          onChangeText={(text) => handleInputChange('dateb', text)}
        />
        <Text style={styles.text}>Date of Issue:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter date"
          placeholderTextColor="white"
          value={formData.dateIssue}
          onChangeText={(text) => handleInputChange('dateIssue', text)}
        />
        <Text style={styles.text}>Any Physical Disability:</Text>
        <TextInput
          style={styles.input}
          placeholder="Specify disability (if any)"
          placeholderTextColor="white"
          value={formData.disability}
          onChangeText={(text) => handleInputChange('disability', text)}
        />
      </View>

      {/* Job Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Job Information</Text>
        <Text style={styles.text}>Post Held:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter post held"
          placeholderTextColor="white"
          value={formData.jobTitle}
          onChangeText={(text) => handleInputChange('jobTitle', text)}
        />
        <Text style={styles.text}>Since When Working on Current Job:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter start date"
          placeholderTextColor="white"
          value={formData.jobStartDate}
          onChangeText={(text) => handleInputChange('jobStartDate', text)}
        />
        <Text style={styles.text}>Salary:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter salary"
          placeholderTextColor="white"
          value={formData.salary}
          onChangeText={(text) => handleInputChange('salary', text)}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNextPress}>
          <Text style={styles.buttonText}>Next</Text>
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
});

export default FormP;
