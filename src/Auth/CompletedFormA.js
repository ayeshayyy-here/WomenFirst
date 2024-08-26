import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PermissionsAndroid,
  Image,
  Modal,
  TouchableWithoutFeedback,
  ToastAndroid,
} from 'react-native';
import Loader from '../components/Loader'; // Import the custom Loader component
import ProgressBar from '../components/ProgressBar';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchCamera } from 'react-native-image-picker';
import syncStorage from 'react-native-sync-storage';
const CompletedFormA = () => {
  const initialState = {
    URI: '',
    Type: '',
    Name: '',
  };

  const [stateFunctions, setStateFunctions] = useState({
    originalApplication: initialState,
    permission: initialState,
    idcard: initialState,
    applicantPhotoAttested: initialState,
    app_letter: initialState,
    char_certificate: initialState,
    app_certificate: initialState,
    affidavit: initialState,
    medical: initialState,
    guardian_id: initialState,
    first_id: initialState,
    second_id: initialState,
    first_guarantee: initialState,
    second_guarantee: initialState,
    domicile: initialState,
  });

  const [isFileSelected, setIsFileSelected] = useState(false);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState('');
  const [loading, setLoading] = useState(false);
  // const handleNextPress = () => {
  //   // Define the required attachments
  //   // const requiredAttachments = [
  //   //   'originalApplication',
  //   //   'permissionFromParents',
  //   //   'idCardAttested',
  //   //   'applicantPhotoAttested',
  //   //   'appointmentLetterAttested',
  //   //   'characterCertificate',
  //   //   'certificateOfAppointment',
  //   //   'affidavit',
  //   //   'medicalCertificate',
  //   //   'guardianIdCard',
  //   //   'idCardPhoto1',
  //   //   'idCardPhoto2',
  //   //   'guaranteeLetter1',
  //   //   'guaranteeLetter2',
  //   //   'domicile',
  //   // ];

  //   // // Check if all required attachments have been uploaded
  //   // const missingAttachments = requiredAttachments.filter(
  //   //   attachment => !stateFunctions[attachment].URI
  //   // );

  //   // if (missingAttachments.length > 0) {
  //   //   // Show a toast with the name of the first missing attachment
  //   //   ToastAndroid.show(
  //   //     `Please upload the ${missingAttachments[0].replace(/([A-Z])/g, ' $1').trim()}`,
  //   //     ToastAndroid.LONG
  //   //   );
  //   //   return;
  //   // }

  //   navigation.navigate('FormD');
  // };


  const handleNextPress = async () => {

    const user = JSON.parse(syncStorage.get('user'));
    const userId = user.id;
    
    console.log('Retrieved user:', user); // Logs the entire user object
    console.log('Retrieved user ID:', userId); // Logs the user ID
    
  
    // Prepare FormData
    const formDataToSend = new FormData();
  
    formDataToSend.append('personal_id', userId);
  
    // Check if all required attachments are uploaded
    const requiredAttachments = [
      'originalApplication',
      'permission',
      'idcard',
      'app_letter',
      'char_certificate',
      'app_certificate',
      'affidavit',
      'medical',
      'guardian_id',
      'first_id',
      'second_id',
      'first_guarantee',
      'second_guarantee',
      'domicile',
    ];
  
    const missingAttachments = requiredAttachments.filter(
      attachment => !stateFunctions[attachment]?.URI
    );
  
    if (missingAttachments.length > 0) {
      // Show a toast with the name of the first missing attachment
      ToastAndroid.show(
        `Please upload the ${missingAttachments[0].replace(/([A-Z])/g, ' $1').trim()}`,
        ToastAndroid.LONG
      );
      return;
    }
  
    // Append files to FormData
    Object.keys(stateFunctions).forEach(attachment => {
      const { URI, Name, Type } = stateFunctions[attachment];
      
      if (URI) {
        formDataToSend.append(attachment, {
          uri: URI,
          type: Type,
          name: Name,
        });
      }
    });
  
    // Log the data being sent
    console.log('Data to be sent:', formDataToSend);
  
    try {
      setLoading(true); 
      const response = await fetch('https://wwh.punjab.gov.pk/api/attachemnet', {
        method: 'POST',
        body: formDataToSend,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });
  
      const result = await response.json();
      
      // Log the server response
      console.log('Server response:', result);
  
      if (response.ok) {
        ToastAndroid.show('Form submitted successfully!', ToastAndroid.LONG);
        navigation.navigate('CompletedFormD');
      } else {
        ToastAndroid.show('Failed to submit the form. Please try again.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false); // Hide loader
    }
  };
  
  
  const handlePrevPress = () => {
    navigation.navigate('CompletedFormG');
  };

  const openCamera = async () => {
    setModalVisible(false);
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const options = {
        mediaType: 'photo',
        includeBase64: true,
        maxHeight: 2000,
        maxWidth: 2000,
      };

      launchCamera(options, response => {
        if (response.didCancel) {
          console.log('User cancelled camera');
        } else if (response.error) {
          console.log('Camera Error: ', response.error);
        } else {
          const fileName = response.assets[0].fileName;
          const fileBase64 = response.assets[0].base64;
          let imageUri = response.uri || response.assets?.[0]?.uri;

          setCapturedImage(imageUri);
          setStateFunctions(prev => ({
            ...prev,
            [selectedAttachment]: { ...prev[selectedAttachment], Name: fileName, URI: imageUri, Type: 'image' },
          }));
          setIsFileSelected(true);
        }
      });
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

  const renderAttachment = (label, attachmentName) => (
    <View style={styles.attachmentWrapper}>
      <Text style={styles.text}>{label}</Text>
      <View style={styles.mainWrapper}>
        <TouchableOpacity onPress={() => handleUploadClick(attachmentName)} style={styles.iconWrapper}>
          <FontAwesomeIcon
            icon={faPlusCircle}
            size={30}
            color={stateFunctions[attachmentName].Name ? 'green' : 'black'}
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
      <Text style={styles.header}>Attachments</Text>
      <ProgressBar step={3} />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Upload Attachments</Text>
        <View style={styles.divider} />
        {renderAttachment("Original Application on Stamp Paper", "originalApplication")}
        {renderAttachment("Permission From Parents", "permission")}
        {renderAttachment("ID Card (attested)", "idcard")}
        {renderAttachment("Appointment Letter (attested)", "app_letter")}
        {renderAttachment("Character Certificate From Employers", "char_certificate")}
        {renderAttachment("Certificate of Appointment", "app_certificate")}
        {renderAttachment("Affidavit (attested 1st class gazette Officer)", "affidavit")}
        {renderAttachment("Medical Certificate Counter Signed by M.S (Government Hospital)", "medical")}
        {renderAttachment("Attested Copy of ID card of Guardian/Father/Husband", "guardian_id")}
        {renderAttachment("Id Card photo (1st person)", "first_id")}
        {renderAttachment("Id Card photo (2nd person)", "second_id")}
        {renderAttachment("Guarantee Letter (1st person)", "first_guarantee")}
        {renderAttachment("Guarantee Letter (2nd person)", "second_guarantee")}
        {renderAttachment("Domicile", "domicile")}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Choose an option</Text>
                <View style={styles.modalOptionsRow}>
                  <TouchableOpacity style={styles.modalButton} onPress={openCamera}>
                    <Icon name="camera" size={30} color="black" />
                    <Text style={styles.modalButtonText}>Capture Image</Text>
                  </TouchableOpacity>
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePrevPress}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNextPress}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
      <Loader loading={loading} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  attachmentWrapper: {
    marginBottom: 20,
  },
  divider: {
    height: 0.4,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '100%',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#010048',
    padding: 10,
  },
  mainWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapper: {
    marginTop: '5%',
  },
  fileNameWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  fileNameText: {
    color: 'black',
    textAlign: 'center',
  },
  previewImage: {
    marginTop: 10,
    width: 300,
    height: 150,
    resizeMode: 'cover',
    borderRadius: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'black',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 5,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  modalButtonText: {
    color: '#010048',
    fontSize: 16,
    marginLeft: 10,
    marginTop:10
  },
});

export default CompletedFormA;
