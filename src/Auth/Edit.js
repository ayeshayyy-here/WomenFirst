import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet, ScrollView 
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader';

const Edit = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const params = route.params;
  const keys = Object.keys(params);

  const [inputValue, setInputValue] = useState(params[keys[0]] || '');
  const [cnicFront, setCnicFront] = useState(null);
  const [cnicBack, setCnicBack] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async (setImage) => {
    const options = { mediaType: 'photo', quality: 1 };
    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        Alert.alert('Cancelled', 'Image selection cancelled.');
      } else if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
      } else {
        setImage(response.assets[0].uri);
      }
    });
  };

  const handleSubmitRequest = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(syncStorage.get('user'));
      if (!user?.id) throw new Error('User ID not found. Please log in again.');
      
      const requestData = { user_id: user.id, column_name: keys[0], new_value: inputValue };
      
      if (!cnicFront || !cnicBack) throw new Error('Both CNIC attachments are required.');
      
      const formData = new FormData();
      for (const [key, value] of Object.entries(requestData)) {
        formData.append(key, value);
      }
      formData.append('cnicf_attach', { uri: cnicFront, name: 'cnic_front.jpg', type: 'image/jpeg' });
      formData.append('cnicb_attach', { uri: cnicBack, name: 'cnic_back.jpg', type: 'image/jpeg' });
      
      const response = await fetch('https://wwh.punjab.gov.pk/api/updateinformation', {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Details updated successfully.');
        navigation.goBack();
      } else {
        Alert.alert('Error', result.message || 'Failed to update details.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToHistory = () => {
    navigation.navigate('UpdationHistory', { editType: keys[0] });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Edit {keys[0]}</Text>
      <Text style={styles.label}>{keys[0].replace('_', ' ')}:</Text>
      <TextInput value={inputValue} onChangeText={setInputValue} style={styles.input} />
      <ImageUpload label="CNIC Front" image={cnicFront} onPick={() => pickImage(setCnicFront)} />
      <ImageUpload label="CNIC Back" image={cnicBack} onPick={() => pickImage(setCnicBack)} />
      <Loader loading={loading} />
      <TouchableOpacity onPress={handleSubmitRequest} style={styles.submitButton}>
        <Text style={styles.submitText}>Submit Edit Request</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={navigateToHistory} style={styles.footerButton}>
        <Text style={styles.footerButtonText}>View History</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const ImageUpload = ({ label, image, onPick }) => (
  <View style={{ marginBottom: 15 }}>
    <Text style={styles.label}>{label}:</Text>
    {image ? (
      <Image source={{ uri: image }} style={styles.imagePreview} />
    ) : (
      <TouchableOpacity onPress={onPick} style={styles.uploadButton}>
        <Text style={styles.uploadText}>Upload Image</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#F8F9FA', paddingBottom: 80 },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#000' },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: 'black' },
  input: { backgroundColor: 'white', borderRadius: 4, height: 40, borderWidth: 0.2, borderColor: 'grey', marginBottom: 8, paddingLeft: 10 },
  uploadButton: { padding: 10, backgroundColor: 'gray', borderRadius: 8, alignItems: 'center' },
  uploadText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  imagePreview: { width: 100, height: 100, marginVertical: 5, borderRadius: 8 },
  submitButton: { backgroundColor: '#010048', padding: 15, borderRadius: 10, alignItems: 'center' },
  submitText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  footerButton: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#010048', 
    padding: 15, 
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footerButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default Edit;