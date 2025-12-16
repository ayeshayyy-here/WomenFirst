import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import syncStorage from 'react-native-sync-storage';
import AudioRecorder from '../components/AudioRecorder';
import Loader from '../components/Loader';
const ComplaintForm = ({navigation}) => {
  const [complaintDetails, setComplaintDetails] = useState('');
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [loading, setLoading] = useState(false); // State for the loader
  const [formData, setFormData] = useState({
    name: '',
    cnic: '',
    contact: '',
    district: '',
    category: null,
    subcategory: null,
  });
  const [categories, setCategories] = useState([{ label: 'Loading...', value: 1 }]);
  const [subcategories, setSubcategories] = useState([]);
  const [stateFunctions, setStateFunctions] = useState({
    URI: '',
    Type: '',
    Name: '',
  });

  const audioRecorderPlayer = new AudioRecorderPlayer();

  useEffect(() => {
    const initializeForm = async () => {
      await fetchUserData();
      await fetchCategories();
    };
    initializeForm();
  }, []);

  const fetchUserData = async () => {
    try {
      const user = JSON.parse(await syncStorage.get('user'));
      setFormData((prev) => ({
        ...prev,
        name: user.name || '',
        cnic: user.cnic || '',
        contact: user.phone_no || '',
        district: user.district || '',
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        'https://complaint-swbm-mis.punjab.gov.pk/api/wcccategory/153'
      );
      const formattedCategories = response.data.category.map((cat) => ({
        label: cat.name,
        value: cat.id,
      }));
      setCategories(formattedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await axios.get(
        `https://complaint-swbm-mis.punjab.gov.pk/api/wccsubcategory/${categoryId}`
      );
      const formattedSubcategories = response.data.subcategory.map((subcat) => ({
        label: subcat.name,
        value: subcat.id,
      }));
      setSubcategories(formattedSubcategories);
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
    }
  };

  const openGallery = async () => {
    try {
      const response = await DocumentPicker.pick({
        allowMultiSelection: false,
        type: [DocumentPicker.types.images], // Allow only images
      });
  
      setStateFunctions((prev) => ({
        ...prev,
        Name: response[0].name,
        Type: response[0].type,
        URI: response[0].uri,
      }));
    } catch (error) {
      console.error('Document picking error:', error);
    }
  };

  const handleAudioRecorded = (audioData) => {
    setRecordedAudio(audioData);
  };
  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`https://wwh.punjab.gov.pk/api/getPdetail-check/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }
      const result = await response.json();
      const data = result.data[0];
      return {
        district: data.applied_district,
        institute: data.institute,
      };
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error; // Propagate the error to the caller
    }
  };
  
  const handleSubmit = async () => {
    setLoading(true); // Start the loader
    try {
      if (!formData.name || !formData.cnic || !formData.contact || !formData.district) {
        Alert.alert('Validation Error', 'Please fill all required fields.');
        setLoading(false); // Stop the loader
        return;
      }
  
      const user = JSON.parse(await syncStorage.get('user'));
      if (!user?.id) {
        Alert.alert('Error', 'User ID not found.');
        setLoading(false); // Stop the loader
        return;
      }
  
      // Fetch district and institute details
      const { district, institute } = await fetchUserDetails(user.id);
  
      // Create FormData
      const formDataToSend = new FormData();
      const currentDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
      formDataToSend.append('user_id', user.id);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('phoneno', formData.contact);
      formDataToSend.append('cnic', formData.cnic);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('complaint_type', 'Complaint');
      formDataToSend.append('system', '7');
      formDataToSend.append('source', '153');
      formDataToSend.append('app_source', '153');
      formDataToSend.append('app_data', 'WWH APP');
      formDataToSend.append('complaint_details', complaintDetails);
      formDataToSend.append('reg_date', currentDate);
      formDataToSend.append('district', district); // Fetched district
      formDataToSend.append('institute', institute); // Fetched institute
      formDataToSend.append('complaint_audio', recordedAudio);
  
      if (stateFunctions.URI) {
        formDataToSend.append('complaint_file', {
          uri: stateFunctions.URI,
          type: stateFunctions.Type,
          name: stateFunctions.Name,
        });
      }
  
      // Submit complaint
      const response = await fetch(
        'https://complaint-swbm-mis.punjab.gov.pk/api/wcchostelcomplains',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            secret: 'w5qOiuGbvehTk0llZAMabt2uGFmPTUFJFwa8ibI96kShKBqOMS2Pgikx0wEbvIx8',
            'Content-Type': 'multipart/form-data',
          },
          body: formDataToSend,
        }
      );
  
      if (response.ok) {
        Alert.alert('Success', 'Complaint submitted successfully!');
        setFormData({
          name: '',
          cnic: '',
          contact: '',
          district: '',
          category: null,
          subcategory: null,
        });
        setComplaintDetails('');
        setRecordedAudio(null);
        setStateFunctions({ URI: '', Type: '', Name: '' });
      } else {
        const responseData = await response.json();
        Alert.alert('Error', `Failed to submit complaint. ${responseData.message || ''}`);
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false); // Stop the loader
    }
  };
  
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Complaint Form & Logs</Text>
        
            <View style={styles.iconContainer}>
              <TouchableOpacity  onPress={() => navigation.navigate('ComplaintForm')}style={styles.iconWrapper}>
                <Icon name="user-plus" size={18} color="white" style={styles.activeIcon} />
                <Text style={styles.activeIconText}>Complaint Form</Text>
              </TouchableOpacity>
            
              <TouchableOpacity  onPress={() => navigation.navigate('ComplaintLogs')} style={styles.iconWrapper}>
                <Icon name="list" size={18} color="white" style={styles.icon} />
                <Text style={styles.iconText}>Complaint Logs</Text>
              </TouchableOpacity>
            </View>
      <Text style={styles.headerr}>Complaint Form</Text>
      <Text style={styles.text}>Name</Text>
      <TextInput
        style={styles.input}
        value={formData.name}
        editable={false}
      />
      <Text style={styles.text}>CNIC</Text>
      <TextInput
        style={styles.input}
        value={formData.cnic}
        editable={false}
      />
      <Text style={styles.text}>Contact</Text>
      <TextInput
        style={styles.input}
        value={formData.contact}
        editable={false}
      />
    
      <Text style={styles.text}>Category</Text>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.value}
          style={styles.radioContainer}
          onPress={() => {
            setFormData({ ...formData, category: category.value, subcategory: null });
            fetchSubcategories(category.value);
          }}
        >
          <View style={styles.radio}>
            {formData.category === category.value && <View style={styles.radioSelected} />}
          </View>
          <Text style={styles.radioLabel}>{category.label}</Text>
        </TouchableOpacity>
      ))}
      {formData.category && (
        <>
          <Text style={styles.text}>Subcategory</Text>
          {subcategories.map((subcategory) => (
            <TouchableOpacity
              key={subcategory.value}
              style={styles.radioContainer}
              onPress={() => setFormData({ ...formData, subcategory: subcategory.value })}
            >
              <View style={styles.radio}>
                {formData.subcategory === subcategory.value && <View style={styles.radioSelected} />}
              </View>
              <Text style={styles.radioLabel}>{subcategory.label}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}
      <Text style={styles.text}>Complaint Details</Text>
      <TextInput
        style={styles.input}
        value={complaintDetails}
        onChangeText={setComplaintDetails}
        multiline
      />
      <Text style={styles.text}>Record Audio</Text>
      <AudioRecorder onAudioRecorded={handleAudioRecorded} />
      <Text style={styles.text}>Choose File</Text>
      <TouchableOpacity onPress={openGallery} style={{alignItems: 'center', marginTop: 16,}}>
        <Icon name="paperclip" size={30}     style={{color: 'black'}}></Icon>
      </TouchableOpacity>
      {stateFunctions.Name ? (
  <Text style={styles.fileName}>{stateFunctions.Name}</Text>
) : (
  <Text style={styles.filePlaceholder}>No file selected</Text>
)}
    <Loader loading={loading} />
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Complaint</Text>
      </TouchableOpacity>
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
  headerr: {
    textAlign: 'center',
    fontSize: 16,
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
    paddingHorizontal: 40,
    paddingVertical: 8,
    borderRadius: 30,
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
  
  inputc: {
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
    minHeight: 80,
  },
  placeholderStyle: {
    color: 'gray',
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
  verticalIconsContainer: {
    flexDirection: 'column', // Align icons vertically
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButton: {
    backgroundColor: '#010048', // Button color
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  submitButtonText: {
    color: '#fff', // Text color for the submit button
    fontSize: 12,
    fontWeight: 'bold',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radio: {
    height: 15,
    width: 15,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#010048',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
  },
  radioSelected: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#010048',
  },
  radioLabel: {
    fontSize: 12,
    color: 'gray',
  },
  listContainer: {
    padding: 10,
},
card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
},
title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#010048',
},

button: {
    marginTop: 10,
    backgroundColor: '#010048',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
},
buttonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
},
fileName: {
  marginTop: 8,
  fontSize: 12,
  color: 'green', // Color to indicate success
  textAlign: 'center',
},
filePlaceholder: {
  marginTop: 8,
  fontSize: 12,
  color: 'gray', // Placeholder color
  textAlign: 'center',
},

});

export default ComplaintForm;

