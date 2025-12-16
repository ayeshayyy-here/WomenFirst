import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView
} from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import syncStorage from 'react-native-sync-storage';
import axios from 'axios';

const Discharge = () => {
  const [userId, setUserId] = useState(null);  // Store user ID
  const [fullName, setFullName] = useState(''); // Store user name
  const [reason, setReason] = useState('');
  const [appliedDate, setAppliedDate] = useState(null);
  const [leavingDate, setLeavingDate] = useState(null);
  const [attachment, setAttachment] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(syncStorage.get('user'));
        if (user?.id) {
          setUserId(user.id);  // Set user ID
        }
        if (user?.name) {
          setFullName(user.name);  // Set user name
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const reasons = [
    'Job Completion',
    'Job Transfer',
    'Personal Reasons',
    'Health Issues',
    'Relocation',
    'Other'
  ];

  const showDatePicker = (setDate) => {
    DateTimePickerAndroid.open({
      value: new Date(),
      mode: 'date',
      is24Hour: true,
      onChange: (event, selectedDate) => {
        if (selectedDate) {
          setDate(selectedDate.toISOString().split('T')[0]);
        }
      },
    });
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      setAttachment(result.uri);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        Alert.alert('Cancelled', 'No file selected.');
      } else {
        Alert.alert('Error', 'Something went wrong!');
      }
    }
  };

  const [isLoading, setIsLoading] = useState(false); // Loader state

  const handleSubmit = async () => {
    if (!userId || !reason || !appliedDate || !leavingDate) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }
  
    setIsLoading(true); // Show loader
  
    const dischargeData = {
      user_id: userId,  
      reason,
      applied_date: appliedDate,
      leaving_date: leavingDate,
      attachment,
      status: 'pending',
      remarks: '',
    };
  
    console.log('Discharge Data being sent:', dischargeData);
  
    try {
      const response = await axios.post(
        'https://wwh.punjab.gov.pk/api/discharges',
        dischargeData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log('API Response:', response.data);
      Alert.alert('Success', response.data.message);
  
      // Reset form after successful submission
      setReason('');
      setAppliedDate(null);
      setLeavingDate(null);
      setAttachment(null);
    } catch (error) {
      console.error('API Error:', error);
      Alert.alert('Error', 'Failed to submit the form.');
    } finally {
      setIsLoading(false); // Hide loader
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Discharge Form</Text>

      <Text style={styles.label}>Full Name:</Text>
      <TextInput
        value={fullName}
        style={[styles.input, { backgroundColor: '#e0e0e0' }]}
        editable={false}
      />

      <Text style={styles.label}>Reason for Leaving:</Text>
      {reasons.map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => setReason(item)}
          style={[styles.reasonOption, reason === item && styles.selectedOption]}
        >
          <Text style={{ color: 'black', fontSize: 10 }}>{item}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.label}>Applied Date:</Text>
      <TouchableOpacity onPress={() => showDatePicker(setAppliedDate)} style={styles.datePicker}>
        <Text style={styles.dateText}>{appliedDate || 'Select Date 📅'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Leaving Date:</Text>
      <TouchableOpacity onPress={() => showDatePicker(setLeavingDate)} style={styles.datePicker}>
        <Text style={styles.dateText}>{leavingDate || 'Select Date 📅'}</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Attachment (Optional):</Text>
      <TouchableOpacity onPress={pickDocument} style={styles.attachmentButton}>
        <Text style={styles.attachmentText}>{attachment ? 'File Attached ✅' : 'Attach a File 📎'}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
  onPress={handleSubmit} 
  style={[styles.submitButton, isLoading && { opacity: 0.6 }]}
  disabled={isLoading}
>
  <Text style={styles.submitText}>
    {isLoading ? 'Submitting...' : 'Submit Discharge Form'}
  </Text>
</TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    flexGrow: 1,
  },

  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#010048',
    padding: 15,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 5,
    color: 'black',
  },
  input: {
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
  datePicker: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 10,
    color: 'gray',
  },
  attachmentButton: {
    backgroundColor: 'gray',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  attachmentText: {
    color: 'white',
    fontSize: 10,
  },
  submitButton: {
    backgroundColor: '#010048',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reasonOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: 'gray',
    color: 'white',
  }
});

export default Discharge;
