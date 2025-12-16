import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Modal, TouchableOpacity, TouchableWithoutFeedback, ToastAndroid, Alert, Image } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { useNavigation, useRoute } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader';

const CompletedFormD = ({route, navigation}) => {
  const [p_id, setP_id] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    address: '',
    phone: '',
    email: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState('');
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const initialState = {
    URI: '',
    Type: '',
    Name: '',
  };
  const [stateFunctions, setStateFunctions] = useState({
    attachdeclaration: initialState,
  });

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  // Fetch p_id first
  useEffect(() => {
    const fetchPersonalId = async () => {
      setLoading(true);
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

  // Fetch form data once p_id is available
  useEffect(() => {
    const fetchData = async () => {
      if (!p_id) return;

      setLoading(true);
      try {
        const response = await fetch(`https://wwh.punjab.gov.pk/api/getDdetail-check/${p_id}`);
        if (response.ok) {
          const result = await response.json();
          const data = result.data[0];

          // Set profile image
          const profileImageUrl = data.declaration
            ? `https://wwh.punjab.gov.pk/uploads/declaration/${data.declaration}`
            : null;
          setProfileImage(profileImageUrl);

          // Set form data
          setFormData({
            name: data.em_name || '',
            designation: data.designation || '',
            department: data.department || '',
            address: data.em_address || '',
            phone: data.em_mobile || '',
            email: data.em_email || '',
          });
        } else {
          console.error('Failed to fetch form data');
          navigation.navigate('FormD'); 
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [p_id]); // Depend on p_id to fetch form data

  const handleSavePress = async () => {
    console.log('handleSavePress triggered');

    // Validate form data
    if (!formData.name) {
      console.log('Validation failed: Name is missing');
      ToastAndroid.show('Please enter your name.', ToastAndroid.LONG);
      return;
    }
    if (!formData.designation) {
      console.log('Validation failed: Designation is missing');
      ToastAndroid.show('Please enter your designation.', ToastAndroid.LONG);
      return;
    }
    if (!formData.department) {
      console.log('Validation failed: Department is missing');
      ToastAndroid.show('Please enter your department.', ToastAndroid.LONG);
      return;
    }
    if (!formData.address) {
      console.log('Validation failed: Address is missing');
      ToastAndroid.show('Please enter your address.', ToastAndroid.LONG);
      return;
    }
    if (!formData.phone || formData.phone.length !== 11) {
      console.log('Validation failed: Phone number is invalid');
      ToastAndroid.show('Please enter a valid 11-digit phone number.', ToastAndroid.LONG);
      return;
    }
    if (!formData.email) {
      console.log('Validation failed: Email is missing');
      ToastAndroid.show('Please enter your email address.', ToastAndroid.LONG);
      return;
    }

    const newProfileImageUri = stateFunctions[selectedAttachment]?.URI;
    const existingProfileImageUri = profileImage;

    console.log('Profile image URIs:', { newProfileImageUri, existingProfileImageUri });

    if (!newProfileImageUri && !existingProfileImageUri) {
      console.log('Validation failed: No profile image provided');
      ToastAndroid.show('Please capture or upload your profile image.', ToastAndroid.LONG);
      return;
    }

    const user = JSON.parse(syncStorage.get('user'));
    const userId = user.id;

    console.log('User ID:', userId);
    console.log('Personal ID:', p_id);

    // Prepare FormData
    const formDataToSend = new FormData();
    formDataToSend.append('personal_id', p_id);
    formDataToSend.append('em_name', formData.name);
    formDataToSend.append('designation', formData.designation);
    formDataToSend.append('department', formData.department);
    formDataToSend.append('em_address', formData.address);
    formDataToSend.append('em_mobile', formData.phone);
    formDataToSend.append('em_email', formData.email);

    if (capturedImage) {
      console.log('Captured image being uploaded:', capturedImage);
      formDataToSend.append('declaration', {
        uri: capturedImage,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    } else if (profileImage) {
      console.log('Keeping existing profile image');
      formDataToSend.append('keep_existing_image', 'true');
    }

    try {
      setLoading(true);
      console.log('Sending POST request to server...');
      const response = await fetch('https://wwh.punjab.gov.pk/api/declaration', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Server response:', result);

      if (response.ok) {
        setIsEditing(false);
        ToastAndroid.show('Form updated successfully!', ToastAndroid.LONG);
      } else {
        console.error('Failed to submit the form:', result.message);
        ToastAndroid.show('Failed to submit the form. Please try again.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
      console.log('handleSavePress finished');
    }
  };

  const handleNextPress = () => {
    navigation.navigate('Dashboard');
  };

  const handlePrevPress = () => {
    navigation.navigate('CompletedFormA');
  };

  const openGallery = async () => {
    try {
      const response = await DocumentPicker.pick({
        allowMultiSelection: false,
        type: [DocumentPicker.types.allFiles],
      });

      setStateFunctions(prev => ({
        ...prev,
        [selectedAttachment]: { ...prev[selectedAttachment], Name: response[0].name, URI: response[0].uri, Type: response[0].type },
      }));
      setIsFileSelected(true);
      setModalVisible(false);
    } catch (error) {
      console.error('Document picking error:', error);
      setIsFileSelected(false);
    }
  };

  const handleUploadClick = (attachmentName) => {
    setSelectedAttachment(attachmentName);
    setModalVisible(true);
  };

  const renderAttachment = (label, attachmentName) => (
    <View style={styles.attachmentWrapper}>
      <View style={styles.mainWrapper}>
        <TouchableOpacity onPress={() => handleUploadClick(attachmentName)} style={styles.iconWrapper}>
          <FontAwesomeIcon
            icon={faPlusCircle}
            size={30}
            color={stateFunctions[attachmentName]?.Name ? 'green' : 'black'}
            marginLeft={10}
          />
        </TouchableOpacity>
        {stateFunctions[attachmentName]?.Name ? (
          <View style={styles.fileNameWrapper}>
            {stateFunctions[attachmentName].Type === 'image' ? (
              <Image
                source={{ uri: stateFunctions[attachmentName].URI }}
                style={styles.previewImage}
              />
            ) : (
              <Text style={styles.fileNameText}>{stateFunctions[attachmentName].Name}</Text>
            )}
          </View>
        ) : null}
      </View>
      <View style={styles.divider} />
    </View>
  );

  const handleEditPress = () => {
    setIsEditing(true);
    Alert.alert(
      'Form Editable',
      'Your form is now editable. You can make changes as needed.',
      [{ text: 'OK' }]
    );
  };

  const [isEditing, setIsEditing] = useState(false);

  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Application Form</Text>
        <ProgressBar step={4} />

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Employer Information</Text>
          <Text style={styles.text}>Name/Organization Name:</Text>
          {isEditing ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditAppointment', { em_name: formData.name })}
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
                  editable={false}
                  placeholderTextColor="grey"
                  value={formData.name}
                />
              )}
         
          <Text style={styles.text}>Designation/Place of Posting:</Text>
          {isEditing ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditAppointment', { designation: formData.designation })}
                >
                  <TextInput
                    style={styles.input}
                    value={formData.designation}
                    editable={false}
                    placeholderTextColor="grey"
                  />
                </TouchableOpacity>
              ) : (
                <TextInput
                  style={styles.input}
                  editable={false}
                  placeholderTextColor="grey"
                  value={formData.designation}
                />
              )}
        
          <Text style={styles.text}>Department/Organization:</Text>
          {isEditing ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditAppointment', { department: formData.department })}
                >
                  <TextInput
                    style={styles.input}
                    value={formData.department}
                    editable={false}
                    placeholderTextColor="grey"
                  />
                </TouchableOpacity>
              ) : (
                <TextInput
                  style={styles.input}
                  editable={false}
                  placeholderTextColor="grey"
                  value={formData.department}
                />
              )}
        
          <Text style={styles.text}>Address:</Text>
          {isEditing ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditAppointment', { em_address: formData.address })}
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
                  editable={false}
                  placeholderTextColor="grey"
                  value={formData.address}
                />
              )}
  
          <Text style={styles.text}>Mobile No/Office No:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter applicant phone number"
            placeholderTextColor="grey"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
            keyboardType="numeric"
            maxLength={11}
            editable={isEditing}
          />
          <Text style={styles.text}>Email/Official Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter applicant email"
            placeholderTextColor="grey"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
            keyboardType="email-address"
            editable={isEditing}
          />
        </View>

        {!capturedImage && !stateFunctions[selectedAttachment]?.URI && profileImage ? (
          <TouchableOpacity onPress={isEditing ? handleUploadClick : null} style={styles.imageContainer}>
            <Image
              source={{
                uri: profileImage,
              }}
              style={styles.image}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: capturedImage || stateFunctions[selectedAttachment]?.URI,
              }}
              style={styles.image}
            />
          </View>
        )}

        <View style={styles.buttonContainerN}>
          <TouchableOpacity style={styles.buttonN} onPress={handlePrevPress}>
            <Text style={styles.buttonTextN}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonN} onPress={handleNextPress}>
            <Text style={styles.buttonTextN}>Done</Text>
          </TouchableOpacity>
        </View>

        <Loader loading={loading} />

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Choose an option</Text>
                  <View style={styles.modalOptionsRow}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={openGallery}>
                      <Icon name="file" size={30} color="black" />
                      <Text style={styles.modalButtonText}>Upload File</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
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
    </View>
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
  declare: {
    fontSize: 17,
    fontWeight: 'bold',
    // marginBottom: 2,
    color: 'black',
  },
  subtext: {
    fontSize: 12,
    // fontWeight: 'bold',
    marginBottom: 10,
    color: 'grey',
  },
  Nametext: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
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
  divider: {
    height: 0.4,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '100%',
  },
  divider1: {
    height: 1,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '45%',
    marginTop: 2,
  },
  divider2: {
    height: 1,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '100%',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',

  },
  modalButton: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  modalButtonText: {
    color: '#010048',
    fontSize: 16,
    // fontWeight: 'bold',
    marginLeft: 10,
    marginTop: 10
  },
  mainWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentWrapper: {
    marginBottom: 20,
  },
  iconWrapper: {
    marginTop: 5,
    marginBottom: 5,
  },
  line: {
    width: 200,
    height: 2,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderRadius: 10,
    width: '80%',
    height: 100,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 10, // Ensure the image is circular
  },
  fileNameText: {
    fontSize: 14,
    marginTop: 10,
    color: 'black',
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

export default CompletedFormD;
