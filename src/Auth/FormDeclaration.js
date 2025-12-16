import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Modal, TouchableOpacity, TouchableWithoutFeedback, ToastAndroid } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { useNavigation } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader';
import ViewShot from 'react-native-view-shot'; // Import ViewShot
import RNFS from 'react-native-fs'; // Import FS to handle the file system

const FormD = ({ route }) => {
  const [p_id, setP_id] = useState(null);
  const [personalData, setPersonalData] = useState(null);
  const [guardianData, setGuardianData] = useState(null);
  const [loading, setLoading] = useState(false);

  const viewShotRef = useRef(null); // Ref to capture screenshot

  useEffect(() => {
    const fetchPersonalData = async () => {
      try {
        const user = JSON.parse(syncStorage.get('user'));
        const userId = user?.id;
        
        if (userId) {
          const response = await fetch(`https://wwh.punjab.gov.pk/api/getPdetail-check/${userId}`);
          const data = await response.json();
          setPersonalData(data);
        }
      } catch (error) {
        console.error("Error fetching personal data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalData();
  }, []);

  useEffect(() => {
    const fetchPersonalAndGuardianData = async () => {
      try {
        console.log("Starting data fetch...");
        setLoading(true);
  
        let personalId = route.params?.p_id;
        console.log("Initial p_id from route params:", personalId);
  
        if (!personalId) {
          console.log("p_id not found in route params, fetching from syncStorage...");
          const user = JSON.parse(syncStorage.get('user'));
          console.log("User data from syncStorage:", user);
  
          const userId = user.id;
          const response = await fetch(`https://wwh.punjab.gov.pk/api/get-personal-id/${userId}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch p_id: ${response.status}`);
          }
          
          const data = await response.json();
          console.log("Response from get-personal-id API:", data);
  
          if (data.status === 'success') {
            personalId = data.p_id;
            console.log("Fetched personalId:", personalId);
          } else {
            console.error('Failed to fetch p_id:', data.message);
          }
        }
  
        setP_id(personalId);
  
        // Fetch guardian details
        console.log(`Fetching guardian details for p_id: ${personalId}`);
        const guardianResponse = await fetch(`https://wwh.punjab.gov.pk/api/getGdetail-check/${personalId}`);
  
        if (!guardianResponse.ok) {
          const errorText = await guardianResponse.text();
          throw new Error(`Failed to fetch guardian details: ${guardianResponse.status} - ${errorText}`);
        }
  
        const guardianData = await guardianResponse.json();
        console.log("Fetched guardian data:", guardianData);
        setGuardianData(guardianData);
  
      } catch (error) {
        console.error('Error fetching personal/guardian data:', error);
        console.error('Error details:', error.message, error.stack);
        ToastAndroid.show(`Error: ${error.message}`, ToastAndroid.LONG);
      } finally {
        console.log("Data fetch completed. Loading state will be set to false.");
        setLoading(false);
      }
    };
  
    fetchPersonalAndGuardianData();
  }, [route.params]);
  

  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    address: '',
    phone: '',
    email: '',
  });

  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState('');
  const [isFileSelected, setIsFileSelected] = useState(false);
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

  const takeScreenshot = async () => {
    try {
      const uri = await viewShotRef.current.capture(); // Capture screenshot
      const fileName = `declaration_${new Date().getTime()}.jpg`;
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      await RNFS.moveFile(uri, path); // Move screenshot to the app's document directory

      setStateFunctions(prev => ({
        ...prev,
        attachdeclaration: {
          URI: `file://${path}`,
          Type: 'image/jpeg',
          Name: fileName,
        },
      }));
      ToastAndroid.show('Screenshot taken and attached!', ToastAndroid.LONG);
    } catch (error) {
      console.error('Error taking screenshot:', error);
      ToastAndroid.show('Failed to take screenshot.', ToastAndroid.LONG);
    }
  };

  const handleNextPress = async () => {
    if (!formData.name) {
      ToastAndroid.show('Please enter your name.', ToastAndroid.LONG);
      return;
    }
    if (!formData.designation) {
      ToastAndroid.show('Please enter your designation.', ToastAndroid.LONG);
      return;
    }
    if (!formData.department) {
      ToastAndroid.show('Please enter your department.', ToastAndroid.LONG);
      return;
    }
    if (!formData.address) {
      ToastAndroid.show('Please enter your address.', ToastAndroid.LONG);
      return;
    }
    if (!formData.phone || formData.phone.length !== 11) {
      ToastAndroid.show('Please enter a valid 11-digit phone number.', ToastAndroid.LONG);
      return;
    }
    if (!formData.email) {
      ToastAndroid.show('Please enter your email address.', ToastAndroid.LONG);
      return;
    }
  
    const formDataToSend = new FormData();
    formDataToSend.append('personal_id', p_id);
    formDataToSend.append('em_name', formData.name);
    formDataToSend.append('designation', formData.designation);
    formDataToSend.append('department', formData.department);
    formDataToSend.append('em_address', formData.address);
    formDataToSend.append('em_mobile', formData.phone);
    formDataToSend.append('em_email', formData.email);
  
    const attachment = stateFunctions.attachdeclaration;
    if (attachment?.URI) {
      formDataToSend.append('declaration', {
        uri: attachment.URI,
        type: attachment.Type,
        name: attachment.Name,
      });
    }
  
    console.log('Data to be sent:', formDataToSend);
  
    try {
      setLoading(true); 
      const response = await fetch('https://wwh.punjab.gov.pk/api/declaration', {
        method: 'POST',
        body: formDataToSend,
      });
  
      const result = await response.json();
      console.log('Server response:', result);
  
      if (response.ok) {
        ToastAndroid.show('Provided Data saved successfully!', ToastAndroid.LONG);
        navigation.navigate('Dashboard');
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

  const handlePrevPress = () => {
    // Assuming `formGData` contains your FormG data
    navigation.navigate('FormA');
  };


  const renderAttachment = (label, attachmentName) => (
    <View style={styles.attachmentWrapper}>
      <View style={styles.mainWrapper}>
        <TouchableOpacity onPress={() => takeScreenshot()} style={styles.iconWrapper}>
          <FontAwesomeIcon
            icon={faPlusCircle}
            size={30}
            color={stateFunctions[attachmentName].Name ? 'green' : 'black'}
            marginLeft={10}
          />
        </TouchableOpacity>
        {stateFunctions[attachmentName].Name ? (
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

  return (

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Application Form</Text>
        <ProgressBar step={5} />

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Employer Information</Text>
          <Text style={styles.text}>Name/Organization Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter applicant name"
            placeholderTextColor="grey"
            value={formData.name}
            onChangeText={(text) => handleInputChange('name', text)}
          />
          <Text style={styles.text}>Designation/Place of Posting</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Designation"
            placeholderTextColor="grey"
            value={formData.designation}
            onChangeText={(text) => handleInputChange('designation', text)}
          />
          <Text style={styles.text}>Department/Organization</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Department/Organization"
            placeholderTextColor="grey"
            value={formData.department}
            onChangeText={(text) => handleInputChange('department', text)}
          />
          <Text style={styles.text}>Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Address"
            placeholderTextColor="grey"
            value={formData.address}
            onChangeText={(text) => handleInputChange('address', text)}
          />
          <Text style={styles.text}>Mobile No/Office No</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter mobile no"
            keyboardType="numeric"
            maxLength={11}
            placeholderTextColor="grey"
            value={formData.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
          />
          <Text style={styles.text}>Email/Official Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            placeholderTextColor="grey"
            value={formData.email}
            onChangeText={(text) => handleInputChange('email', text)}
          />
        </View>
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }}>
        {/* Personal Declaration */}
        <Text style={styles.declare}>Personal Declaration :</Text>
        <View style={styles.divider2} />
          {personalData && personalData.data && personalData.data.length > 0 ? (
          <>
            <Text style={styles.subtext}>
              I, {personalData.data[0].name} hereby apply for admission in the Working Women Hostel and undertake to abide by the Rules & Regulations notified from time to time of the Hostel, which I have thoroughly read and also undertaken to pay all charges regularly.
            </Text>
            <Text style={styles.Nametext}>Name:
              <Text style={styles.subtext}> {personalData.data[0].name}</Text>
            </Text>
            <Text style={styles.Nametext}>Date:
              <Text style={styles.subtext}> {new Date().toLocaleDateString()}</Text>
            </Text>
          </>
        ) : (
          <Text>...</Text>
        )}

        {/* Guardian Declaration */}
        <Text style={styles.declare}>Guardian Declaration :</Text>
        <View style={styles.divider2} />
        {guardianData && guardianData.data && guardianData.data.length > 0 ? (
        <>
          <Text style={styles.subtext}>
            I {guardianData.data[0].gname}, Guardian of Miss/Mrs {guardianData.data[0].ename} (the Applicant) request that she may be allowed to get admission in the hostel under prescribed terms and conditions as well the rules & regulations.
          </Text>
          <Text style={styles.Nametext}>Name:
            <Text style={styles.subtext}> {guardianData.data[0].ename}</Text>
          </Text>
          <Text style={styles.Nametext}>Relationship:
            <Text style={styles.subtext}> {guardianData.data[0].erelationship}</Text>
          </Text>
          <Text style={styles.Nametext}>Address:
            <Text style={styles.subtext}> {guardianData.data[0].eaddress}</Text>
          </Text>
          <Text style={styles.Nametext}>Mobile:
            <Text style={styles.subtext}> {guardianData.data[0].emobile}</Text>
          </Text>
          <Text style={styles.Nametext}>Date:
            <Text style={styles.subtext}> {new Date().toLocaleDateString()}</Text>
          </Text>
        </>
        ) : (
        <Text>Loading guardian data...</Text>
        )}

        <Text style={styles.declare}>Attach Declaration :</Text>
        <View style={styles.divider2} />
        <Text style={styles.Nametext}>Note:
          <Text style={styles.subtext}>Please take a snapshot of Declaration and it will be Attached here.</Text>
        </Text>
        </ViewShot>
        <View style={styles.divider} />
        {renderAttachment("Attach Declaration", "attachdeclaration")}
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
                    <TouchableOpacity style={styles.modalButton} onPress={openGallery}>
                      <Icon name="file" size={30} color="black" />
                      <Text style={styles.modalButtonText}>Upload File</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        <Loader loading={loading} />
        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePrevPress}>
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleNextPress}>
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

});

export default FormD;
