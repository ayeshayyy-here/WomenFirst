import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Modal, TouchableOpacity, TouchableWithoutFeedback, ToastAndroid, Image } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { useNavigation } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';

const Declarations = ({ route }) => {
  const [p_id, setP_id] = useState(null);
  const [personalData, setPersonalData] = useState(null);
  const [guardianData, setGuardianData] = useState(null);
  const [declarationData, setDeclarationData] = useState(null);
  const [loading, setLoading] = useState(false);

  const viewShotRef = useRef(null);

  console.log('Component mounted with route params:', route.params);

  useEffect(() => {
    const fetchPersonalData = async () => {
      try {
        console.log('Fetching personal data...');
        const user = JSON.parse(syncStorage.get('user'));
        const userId = user?.id;
        console.log('User ID from syncStorage:', userId);
        
        if (userId) {
          const response = await fetch(`https://wwh.punjab.gov.pk/api/getPdetail-check/${userId}`);
          console.log('Personal data response status:', response.status);
          const data = await response.json();
          console.log('Personal data received:', data);
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
        console.log("Setting p_id state to:", personalId);

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

        // Fetch existing declaration data
        console.log(`Fetching existing declaration data for p_id: ${personalId}`);
        const declarationResponse = await fetch(`https://wwh.punjab.gov.pk/api/getDdetail-check/${personalId}`);
        
        if (declarationResponse.ok) {
          const declarationData = await declarationResponse.json();
          console.log("Fetched declaration data:", declarationData);
          if (declarationData.success && declarationData.data && declarationData.data.length > 0) {
            setDeclarationData(declarationData.data[0]);
            console.log("Existing declaration found:", declarationData.data[0]);
          } else {
            console.log("No existing declaration found");
          }
        } else {
          console.log("No existing declaration data found or error fetching");
        }
  
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

  // Set existing declaration screenshot if available
  useEffect(() => {
    if (declarationData && declarationData.declaration) {
      console.log('Setting existing declaration screenshot:', declarationData.declaration);
      setStateFunctions(prev => ({
        ...prev,
        attachdeclaration: {
          URI: `https://wwh.punjab.gov.pk/uploads/declaration/${declarationData.declaration}`,
          Type: 'image/jpeg',
          Name: declarationData.declaration,
        },
      }));
    }
  }, [declarationData]);

  const handleInputChange = (name, value) => {
    console.log(`Input changed - ${name}:`, value);
    setFormData({ ...formData, [name]: value });
  };

  const takeScreenshot = async () => {
    try {
      console.log('Taking screenshot...');
      const uri = await viewShotRef.current.capture();
      console.log('Screenshot captured at URI:', uri);
      
      const fileName = `declaration_${new Date().getTime()}.jpg`;
      const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

      console.log('Moving screenshot to:', path);
      await RNFS.moveFile(uri, path);

      setStateFunctions(prev => ({
        ...prev,
        attachdeclaration: {
          URI: `file://${path}`,
          Type: 'image/jpeg',
          Name: fileName,
        },
      }));
      console.log('Screenshot attached successfully');
      ToastAndroid.show('Screenshot taken and attached!', ToastAndroid.LONG);
    } catch (error) {
      console.error('Error taking screenshot:', error);
      ToastAndroid.show('Failed to take screenshot.', ToastAndroid.LONG);
    }
  };

  const handleNextPress = async () => {
    console.log('Submit button pressed');
    console.log('Current p_id:', p_id);
    console.log('Current stateFunctions:', stateFunctions);

    if (!p_id) {
      console.error('No personal ID found');
      ToastAndroid.show('Error: Personal ID not found', ToastAndroid.LONG);
      return;
    }

    const formDataToSend = new FormData();
    
    // Add personal_id to form data
    formDataToSend.append('personal_id', p_id);
    console.log('Added personal_id to form data:', p_id);

    const attachment = stateFunctions.attachdeclaration;
    if (attachment?.URI) {
      console.log('Adding declaration attachment to form data:', attachment);
      formDataToSend.append('declaration', {
        uri: attachment.URI,
        type: attachment.Type,
        name: attachment.Name,
      });
    } else {
      console.log('No declaration attachment found');
    }

    // Log form data entries
    console.log('FormData entries:');
    for (let [key, value] of formDataToSend._parts) {
      console.log(`${key}:`, value);
    }

    try {
      setLoading(true);
      console.log('Sending request to declaration API...');
      
      const response = await fetch('https://wwh.punjab.gov.pk/api/declaration', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Server response:', result);

      if (response.ok) {
        ToastAndroid.show('Declaration saved successfully!', ToastAndroid.LONG);
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
      console.log('Opening gallery for document picker');
      const response = await DocumentPicker.pick({
        allowMultiSelection: false,
        type: [DocumentPicker.types.allFiles],
      });

      console.log('Document picked:', response[0]);
      setStateFunctions(prev => ({
        ...prev,
        [selectedAttachment]: { 
          ...prev[selectedAttachment], 
          Name: response[0].name, 
          URI: response[0].uri, 
          Type: response[0].type 
        },
      }));
      setIsFileSelected(true);
      setModalVisible(false);
    } catch (error) {
      console.error('Document picking error:', error);
      setIsFileSelected(false);
    }
  };

  const handleUploadClick = (attachmentName) => {
    console.log('Upload clicked for:', attachmentName);
    setSelectedAttachment(attachmentName);
    setModalVisible(true);
  };

  const handlePrevPress = () => {
    console.log('Back button pressed');
    navigation.navigate('CompletedFormA');
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
            {stateFunctions[attachmentName].Type && stateFunctions[attachmentName].Type.startsWith('image/') ? (
              <Image
                source={{ uri: stateFunctions[attachmentName].URI }}
                style={styles.previewImage}
                onLoad={() => console.log('Image loaded successfully')}
                onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
              />
            ) : (
              <Text style={styles.fileNameText}>{stateFunctions[attachmentName].Name}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.noFileText}>No screenshot taken</Text>
        )}
      </View>
      <View style={styles.divider} />
    </View>
  );

  console.log('Rendering component with state:', {
    personalData,
    guardianData,
    declarationData,
    stateFunctions,
    loading
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Application Form</Text>
      <ProgressBar step={5} />

      {/* Personal Information */}
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
          <Text>Loading personal data...</Text>
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

      {/* Display existing declaration if available */}
      {declarationData && declarationData.declaration && (
        <View style={styles.existingDeclaration}>
          <Text style={styles.existingTitle}>Existing Declaration:</Text>
          <Image
            source={{ uri: `https://wwh.punjab.gov.pk/uploads/declaration/${declarationData.declaration}` }}
            style={styles.existingImage}
            onLoad={() => console.log('Existing declaration image loaded')}
            onError={(error) => console.log('Existing declaration image load error:', error.nativeEvent.error)}
          />
        </View>
      )}

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
    marginBottom: 8,
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
    marginBottom: 8,
    paddingLeft: 10,
    fontSize: 12,
  },
  declare: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
  },
  subtext: {
    fontSize: 12,
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
    width: '100%',
    paddingHorizontal: 16,
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
  fileNameWrapper: {
    marginTop: 10,
    alignItems: 'center',
  },
  previewImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  fileNameText: {
    fontSize: 12,
    color: 'green',
    marginTop: 5,
  },
  noFileText: {
    fontSize: 12,
    color: 'gray',
    fontStyle: 'italic',
    marginTop: 10,
  },
  existingDeclaration: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  existingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#010048',
  },
  existingImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  line: {
    width: 200,
    height: 2,
    alignItems: 'center',
  },
});

export default Declarations;