import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Image, Alert, StyleSheet, ScrollView 
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader';

const EditDis = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { disability } = route.params;
  const [disabilityStatus, setDisabilityStatus] = useState(disability || 'No');
  const [disabilityCertificate, setDisabilityCertificate] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        Alert.alert('Cancelled', 'You cancelled image selection.');
      } else if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
      } else {
        setDisabilityCertificate(response.assets[0].uri);
      }
    });
  };

  const handleSubmitRequest = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user?.id;
      if (!userId) throw new Error('User ID not found. Please log in again.');

      const requestData = {
        user_id: userId,
        column_name: 'disability',
        new_value: disabilityStatus,
      };

      const formData = new FormData();
      for (const [key, value] of Object.entries(requestData)) {
        formData.append(key, value);
      }

      if (disabilityStatus === 'Yes') {
        if (!disabilityCertificate) {
          throw new Error('Disability certificate is required.');
        }
        formData.append('appoint_letter', {
          uri: disabilityCertificate,
          name: 'disability_certi.jpg',
          type: 'image/jpeg',
        });
      }

      const response = await fetch('https://wwh.punjab.gov.pk/api/updateinformation', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'updation request submitted successfully.');
        navigation.goBack();
      } else {
        Alert.alert('Error', result.message || 'Failed to submit disability details.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToHistory = () => {
    navigation.navigate('UpdationHistory', { editType: 'disability' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit Disability Details</Text>
      <Text style={styles.label}>Disability:</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => setDisabilityStatus('Yes')}
          style={[styles.toggleButton, disabilityStatus === 'Yes' && styles.activeButton]}
        >
          <Text style={styles.toggleText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setDisabilityStatus('No')}
          style={[styles.toggleButton, disabilityStatus === 'No' && styles.activeButton]}
        >
          <Text style={styles.toggleText}>No</Text>
        </TouchableOpacity>
      </View>
      {disabilityStatus === 'Yes' && (
        <>
          <Text style={styles.label}>Upload Disability Certificate:</Text>
          <TouchableOpacity onPress={pickImage} style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>Select Certificate</Text>
          </TouchableOpacity>
          {disabilityCertificate && (
            <Image source={{ uri: disabilityCertificate }} style={styles.image} />
          )}
        </>
      )}
      <TouchableOpacity onPress={handleSubmitRequest} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={navigateToHistory} style={styles.historyButton}>
        <Text style={styles.historyButtonText}>View History</Text>
      </TouchableOpacity>
      {loading && <Loader />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F8F9FA', paddingBottom: 80 },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#000' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: 'black' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
  toggleButton: { padding: 10, borderWidth: 1, borderRadius: 5, borderColor: '#010048', width: '40%', alignItems: 'center' },
  activeButton: { backgroundColor: 'gray' },
  toggleText: { color: '#010048', fontWeight: 'bold' },
  uploadButton: { backgroundColor: '#010048', padding: 10, borderRadius: 5, alignItems: 'center' },
  uploadButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  image: { width: 100, height: 100, marginTop: 10, borderRadius: 8 },
  submitButton: { backgroundColor: '#010048', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  submitButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  historyButton: {position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#010048', padding: 15, alignItems: 'center',borderTopLeftRadius: 20,borderTopRightRadius: 20, },
  historyButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default EditDis;