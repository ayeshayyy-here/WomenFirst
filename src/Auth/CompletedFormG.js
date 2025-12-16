import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, ToastAndroid, TouchableOpacity, Alert } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { useNavigation } from '@react-navigation/native';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader';
import Icon from 'react-native-vector-icons/FontAwesome'; 

const CompletedFormG = ({ route }) => {
  const [p_id, setP_id] = useState(null);
  const [date, setDate] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    occupation: '',
    gmobile: '',
    relationship: '',
    ename: '',
    eaddress: '',
    eemail: '',
    erelationship: '',
    emobile: '',
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const navigation = useNavigation();


  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };


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
        console.log('Fetched p_id:', personalId);
      } catch (error) {
        console.error('Error fetching p_id:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalId();
  }, [route.params]);

  useEffect(() => {
    const fetchData = async () => {
      if (!p_id) return;

      try {
        setLoading(true);
        const response = await fetch(`https://wwh.punjab.gov.pk/api/getGdetail-check/${p_id}`);
        if (response.ok) {
          const result = await response.json();
          const data = result.data[0];

          setFormData({
            name: data.gname || '',
            address: data.gaddress || '',
            gmobile: data.gmobile || '',
            email: data.gemail || '',
            occupation: data.goccupation || '',
            relationship: data.relationship || '',
            ename: data.ename || '',
            erelationship: data.erelationship || '',
            eaddress: data.eaddress || '',
            emobile: data.emobile || '',
          });

          console.log('Fetched form data:', data);
        } else {
          console.error('Failed to fetch form data:', await response.text());
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [p_id]);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSavePress = async () => {
    if (!formData.name) {
      ToastAndroid.show('Please enter your name.', ToastAndroid.LONG);
      return;
    }
    if (!formData.address) {
      ToastAndroid.show('Please enter your address.', ToastAndroid.LONG);
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
      ToastAndroid.show('Please enter emergency contact name.', ToastAndroid.LONG);
      return;
    }
    if (!formData.eaddress) {
      ToastAndroid.show('Please enter emergency contact address.', ToastAndroid.LONG);
      return;
    }
    if (!formData.erelationship) {
      ToastAndroid.show('Please enter emergency contact relationship.', ToastAndroid.LONG);
      return;
    }

    const user = JSON.parse(syncStorage.get('user'));
    const userId = user.id;

    console.log('Retrieved user:', user);
    console.log('Retrieved user ID:', userId);

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

    console.log('FormData prepared:', formDataToSend);

    try {
      setLoading(true);
      const response = await fetch('https://wwh.punjab.gov.pk/api/guardian', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (response.ok) {
        ToastAndroid.show('Form updated successfully!', ToastAndroid.LONG);
        setIsEditing(false);
      } else {
        ToastAndroid.show('Failed to submit the form. Please try again.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPress = () => {
    navigation.navigate('CompletedFormP');
  };

  const handleEditPress = () => {
    setIsEditing(true);
    Alert.alert(
      'Form Editable',
      'You can make changes as needed.',
      [{ text: 'OK' }]
    );
  };

  useEffect(() => {
    console.log('Received formA:', route.params?.formA);
  }, [route.params]);
  
  const handleNextPress = () => {
    if (route.params?.formA) {
      console.log('route.params.formA found:', route.params.formA);
      navigation.navigate('FormA', { formA: route.params.formA });
    } else {
      console.log('route.params.formG not found. Navigating to CompletedFormG');
      navigation.navigate('CompletedFormA');
    }
  };
  return (
    <View style={styles.container}>
         <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false} // Hide scrollbar
      >
        <Text style={styles.header}>Guardian Details</Text>
        <ProgressBar step={4} />

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Guardian Information</Text>
          <View style={styles.divider} />

          <Text style={styles.text}>Father/Husband/Guardian Name:</Text>
              {isEditing ? (
                  <TouchableOpacity
              
          
                    onPress={() => navigation.navigate('Editgcnic', { gname: formData.name })}
                  >
                    <TextInput
                        style={styles.input}
                      value={formData.name}
                      editable={false}
                     placeholderTextColor="grey"
                    />
                  </TouchableOpacity>
                ) : (
                  <TextInput
                  style={styles.input}
                  editable= {false} 
                  placeholderTextColor="grey"
                  value={formData.name}
                
                />
                )}
        
          <Text style={styles.text}>Address:</Text>
          {isEditing ? (
                  <TouchableOpacity
              
          
                    onPress={() => navigation.navigate('Editgcnic', { gaddress: formData.address })}
                  >
                    <TextInput
                        style={styles.input}
                      value={formData.address}
                      editable={false}
                     placeholderTextColor="grey"
                    />
                  </TouchableOpacity>
                ) : (
                  <TextInput
                  style={styles.input}
                  editable= {false} 
                  placeholderTextColor="grey"
                  value={formData.address}
                
                />
                )}
        
          <Text style={styles.text}>Email Address:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email Address"
            placeholderTextColor="grey"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            editable={isEditing}
          />
          <Text style={styles.text}>Occupation:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Occupation"
            placeholderTextColor="grey"
            value={formData.occupation}
            onChangeText={(text) => handleInputChange('occupation', text)}
            editable={isEditing}
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
            editable={isEditing}
          />
          <Text style={styles.text}>Relationship:</Text>
          {isEditing ? (
                  <TouchableOpacity
              
          
                    onPress={() => navigation.navigate('Editgcnic', { relationship: formData.relationship })}
                  >
                    <TextInput
                        style={styles.input}
                      value={formData.relationship}
                      editable={false}
                     placeholderTextColor="grey"
                    />
                  </TouchableOpacity>
                ) : (
                  <TextInput
                  style={styles.input}
                  editable= {false} 
                  placeholderTextColor="grey"
                  value={formData.relationship}
                
                />
                )}
        
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Person to be informed in case of emergency</Text>
          <View style={styles.divider} />
          <Text style={styles.text}>Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            placeholderTextColor="grey"
            value={formData.ename}
            onChangeText={(text) => handleInputChange('ename', text)}
            editable={isEditing}
          />
          <Text style={styles.text}>Address:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Address"
            placeholderTextColor="grey"
            value={formData.eaddress}
            onChangeText={(text) => handleInputChange('eaddress', text)}
            editable={isEditing}
          />
          <Text style={styles.text}>Mobile No:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile No"
            placeholderTextColor="grey"
            keyboardType="numeric"
            maxLength={11}
            value={formData.emobile}
            onChangeText={(text) => handleInputChange('emobile', text)}
            editable={isEditing}
          />
          <Text style={styles.text}>Relationship:</Text>
          <TextInput
            style={styles.input}
            placeholder="Select Relationship"
            placeholderTextColor="grey"
            value={formData.erelationship}
            onChangeText={(text) => handleInputChange('erelationship', text)}
            editable={isEditing}
          />
        </View>

        <View style={styles.buttonContainerN}>
          <TouchableOpacity style={styles.buttonN} onPress={handlePrevPress}>
            <Text style={styles.buttonTextN}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonN} onPress={handleNextPress}>
  <Text style={styles.buttonTextN}>Next</Text>
  </TouchableOpacity>
        </View>
        <Loader loading={loading} />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button} 
          onPress={isEditing ? handleSavePress : handleEditPress}
        >
          <Icon 
            name={isEditing ? 'save' : 'pencil'} 
            size={20} 
            color="#fff" 
          />
        </TouchableOpacity>
        <Text style={styles.buttonText}>
          {isEditing ? 'Save' : 'Edit'}
        </Text>
      </View>
    </View>
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
    justifyContent: 'center',
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
  
  footer: {
    position: 'absolute',
    bottom: '10%', // Adjust as needed to fit the design
    right: '5%',  // Adjust as needed to fit the design
    zIndex: 1000, // Ensures it appears above other components
  },
  buttonContainer: {
    alignItems: 'center', // Centers the button and text horizontally
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#010048',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#010048',
    marginTop: 3, // Spacing between button and text
    fontSize: 12, // Font size for better readability
    textAlign: 'center', // Center text below the button
    fontStyle: 'italic', // Italicize the text
  },
  buttonContainerN: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 22,
  
  },
  buttonN: {
    backgroundColor: '#010048',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 5,
    marginHorizontal: 10,
  },
  buttonTextN: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CompletedFormG;
