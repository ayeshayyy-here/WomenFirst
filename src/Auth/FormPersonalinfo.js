import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { useNavigation } from '@react-navigation/native';
import { DatePickerInput } from 'react-native-paper-dates';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons'; 
import DateTimePickerModal from 'react-native-modal-datetime-picker';
const FormP = () => {
  const [dob, setDOB] = useState('');
  const [expiry, setExpiry] = useState('');
  const [issuance, setIssuance] = useState('');
  const [time, setTime] = useState(new Date());
  const [isDateTimePickerVisible, setIsDateTimePickerVisible] = useState(false);
  const [time1, setTime1] = useState(new Date());
  const [isDateTimePickerVisible1, setIsDateTimePickerVisible1] = useState(false);
  const [time2, setTime2] = useState(new Date());
  const [isDateTimePickerVisible2, setIsDateTimePickerVisible2] = useState(false);
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
  const handleDateTimeConfirm = date => {
    setTime(date);
    setIsDateTimePickerVisible(false);
  };
  const handleDateTimeConfirm1 = date => {
    setTime1(date);
    setIsDateTimePickerVisible1(false);
  };
  const handleDateTimeConfirm2 = date => {
    setTime2(date);
    setIsDateTimePickerVisible2(false);
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Application Form</Text>
      <ProgressBar step={1} />

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Personal Information</Text>
        <View style={styles.divider} />
        <Text style={styles.text}>Applicant's Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Applicant Name"
          placeholderTextColor="grey"
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
        />
        <Text style={styles.text}>Permanent Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          placeholderTextColor="grey"
          value={formData.address}
          onChangeText={(text) => handleInputChange('address', text)}
        />
        <Text style={styles.text}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone Number"
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
        />
        <Text style={styles.text}>Mobile NUmber:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile Number"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.mobile}
          onChangeText={(text) => handleInputChange('mobile', text)}
        />
      </View>

      {/* CNIC Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>CNIC Information</Text>
        <View style={styles.divider} />
        <Text style={styles.text}>CNIC:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter CNIC"
          keyboardType="numeric"
          placeholderTextColor="grey"
          maxLength={13}
          value={formData.cnic}
          onChangeText={(text) => handleInputChange('cnic', text)}
        />
        <Text style={[styles.text, { marginTop: '5%' }]}>Date of Expiry:</Text>
           <TouchableOpacity style={{ marginTop: 5, backgroundColor: '#fff', borderRadius: 5, height: 40 }}  onPress={() => setIsDateTimePickerVisible(true)}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{color: 'black' , marginTop: '3%', marginLeft: '4%', }}>{time.toLocaleString()}</Text>
              <FontAwesomeIcon
  icon={faCalendar}  // Use the 'icon' prop instead of 'name'
  size={20}
  color="black"
  style={{marginLeft: '40%',marginTop: '3%' }}
/>

            </View>
                </TouchableOpacity>
        <Text style={[styles.text, { marginTop: '5%' }]}>Date of Birth:</Text>
        <TouchableOpacity style={{ marginTop: 5, backgroundColor: '#fff', borderRadius: 5, height: 40 }}  onPress={() => setIsDateTimePickerVisible1(true)}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{color: 'black' , marginTop: '3%', marginLeft: '4%', }}>{time.toLocaleString()}</Text>
              <FontAwesomeIcon
  icon={faCalendar}  // Use the 'icon' prop instead of 'name'
  size={20}
  color="black"
  style={{marginLeft: '40%',marginTop: '3%' }}
/>

            </View>
                </TouchableOpacity>
                <Text style={[styles.text, { marginTop: '5%' }]}>Date of Issue:</Text>
                <TouchableOpacity style={{ marginTop: 5, backgroundColor: '#fff', borderRadius: 5, height: 40 }}  onPress={() => setIsDateTimePickerVisible2(true)}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{color: 'black' , marginTop: '3%', marginLeft: '4%', }}>{time.toLocaleString()}</Text>
              <FontAwesomeIcon
  icon={faCalendar}  // Use the 'icon' prop instead of 'name'
  size={20}
  color="black"
  style={{marginLeft: '40%',marginTop: '3%' }}
/>

            </View>
                </TouchableOpacity>
        <Text style={styles.text}>Any Physical Disability:</Text>
        <TextInput
          style={styles.input}
          placeholder="Specify disability (if any)"
          placeholderTextColor="grey"
          value={formData.disability}
          onChangeText={(text) => handleInputChange('disability', text)}
        />
      </View>

      {/* Job Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Job Information</Text>
        <View style={styles.divider} />
        <Text style={styles.text}>Post Held:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter post held"
          placeholderTextColor="grey"
          value={formData.jobTitle}
          onChangeText={(text) => handleInputChange('jobTitle', text)}
        />
        <Text style={styles.text}>Since When Working on Current Job:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter start date"
          placeholderTextColor="grey"
          value={formData.jobStartDate}
          onChangeText={(text) => handleInputChange('jobStartDate', text)}
        />
        <Text style={styles.text}>Salary:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter salary"
          placeholderTextColor="grey"
          value={formData.salary}
          onChangeText={(text) => handleInputChange('salary', text)}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNextPress}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <DateTimePickerModal
        isVisible={isDateTimePickerVisible}
        mode="datetime"
        date={time}
        onConfirm={handleDateTimeConfirm}
        onCancel={() => setIsDateTimePickerVisible(false)}
      />
           <DateTimePickerModal
        isVisible={isDateTimePickerVisible1}
        mode="datetime"
        date={time1}
        onConfirm={handleDateTimeConfirm1}
        onCancel={() => setIsDateTimePickerVisible1(false)}
      />
           <DateTimePickerModal
        isVisible={isDateTimePickerVisible2}
        mode="datetime"
        date={time2}
        onConfirm={handleDateTimeConfirm2}
        onCancel={() => setIsDateTimePickerVisible2(false)}
      />
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
    color: '#000',
    padding: 10,
  },
  calenderstyle:{
 height: 50, backgroundColor: '#fff'
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
