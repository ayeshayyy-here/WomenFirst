import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
  ProgressBarAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlusCircle, faCheck } from '@fortawesome/free-solid-svg-icons';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchCamera } from 'react-native-image-picker';
import syncStorage from 'react-native-sync-storage';
import ProgressBar from '../components/ProgressBar';
import Rendercomponent from '../components/Rendercomponet';
const FormA = ({ route }) => {
  const [p_id, setP_id] = useState(null);  // personal_id state
  const [progress, setProgress] = useState({});  // Track progress for each attachment
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState('');
  const navigation = useNavigation();

  // Initial state for each attachment
  const initialState = {
    URI: '',
    Type: '',
    Name: '',
    isUploaded: false,  // Track if the file has been successfully uploaded
  };

  // State to handle all file attachments
  const [stateFunctions, setStateFunctions] = useState({
    originalApplication: initialState,
    permission: initialState,
    idcard: initialState,
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

  // Fetch personal_id once the component is mounted
  useEffect(() => {
    const fetchPersonalId = async () => {
      try {
        let personalId = route.params?.p_id;
        if (!personalId) {
          const user = JSON.parse(syncStorage.get('user'));
          const userId = user.id;
          const response = await fetch(`https://cef0d8f99798.ngrok-free.app/api/get-personal-id/${userId}`);
          const data = await response.json();
          if (data.status === 'success') {
            personalId = data.p_id;
          } else {
            console.error('Failed to fetch p_id:', data.message);
          }
        }
        setP_id(personalId);
      } catch (error) {
        console.error('Error fetching p_id:', error);
      }
    };
    fetchPersonalId();
  }, [route.params]);

  // Function to handle file uploads
  const uploadImage = async (attachmentName, fileData) => {
    console.log(`Starting upload for ${attachmentName}`, fileData);  // Debugging log

    const formDataToSend = new FormData();
    formDataToSend.append('personal_id', p_id);  // Always send personal_id
    formDataToSend.append(attachmentName, {
      uri: fileData.URI,
      type: fileData.Type,
      name: fileData.Name,
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://cef0d8f99798.ngrok-free.app/api/attachemnettt', true);

    // Handle progress of the upload
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded * 100) / event.total);
        setProgress(prevProgress => ({
          ...prevProgress,
          [attachmentName]: percentage,
        }));
        console.log(`${attachmentName} is ${percentage}% uploaded`);  // Debugging log
      }
    };

    // On upload complete
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.success) {
          console.log(`${attachmentName} upload successful:`, response);  // Debugging log
          setStateFunctions(prev => ({
            ...prev,
            [attachmentName]: { 
              ...prev[attachmentName], 
              isUploaded: true,
            }
          }));
          ToastAndroid.show(`${attachmentName} uploaded successfully!`, ToastAndroid.LONG);
        } else {
          console.log(`${attachmentName} upload failed:`, response);  // Debugging log
          ToastAndroid.show(`Failed to upload ${attachmentName}. Please try again.`, ToastAndroid.LONG);
        }
      } else {
        console.log(`${attachmentName} upload failed with status: ${xhr.status}`);  // Debugging log
        ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
      }
    };

    // On upload error
    xhr.onerror = () => {
      console.error(`Error uploading ${attachmentName}`);  // Debugging log
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    };

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.send(formDataToSend);  // Send the FormData
  };

  const openCamera = async () => {
    setModalVisible(false);
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
      };

      launchCamera(options, response => {
        if (response.assets && response.assets.length > 0) {
          const { uri, fileName, type } = response.assets[0];
          const imageType = type || 'image/jpeg';
          const imageName = fileName || uri.split('/').pop();

          setStateFunctions(prev => ({
            ...prev,
            [selectedAttachment]: { 
              ...prev[selectedAttachment], 
              URI: uri, 
              Name: imageName, 
              Type: imageType,
              isUploaded: false
            },
          }));

          uploadImage(selectedAttachment, { URI: uri, Name: imageName, Type: imageType });
        }
      });
    }
  };

  const openGallery = async () => {
    try {
      const response = await DocumentPicker.pick({
        allowMultiSelection: false,
        type: [DocumentPicker.types.images],
      });

      const fileData = {
        URI: response[0].uri,
        Name: response[0].name,
        Type: response[0].type,
        isUploaded: false
      };

      setStateFunctions(prev => ({
        ...prev,
        [selectedAttachment]: fileData,
      }));

      setModalVisible(false);
      uploadImage(selectedAttachment, fileData);
    } catch (error) {
      console.error('Document picking error:', error);
    }
  };

  const handleUploadClick = (attachmentName) => {
    setSelectedAttachment(attachmentName);
    setModalVisible(true);
  };
  const handleNextPress = async () => {
    navigation.navigate('FormD');
  };

  const handlePrevPress = () => {
    // Assuming `formGData` contains your FormG data
    navigation.navigate('CompletedFormG', {
      formA: 'FormA',
    });
  };
  const renderAttachment = (label, attachmentName) => (
    <View style={styles.attachmentWrapper}>
      <Text style={styles.text}>{label}</Text>
      <View style={styles.mainWrapper}>
        <TouchableOpacity onPress={() => handleUploadClick(attachmentName)} style={styles.iconWrapper}>
          <FontAwesomeIcon
            icon={faPlusCircle}
            size={30}
            color={stateFunctions[attachmentName]?.isUploaded ? 'green' : 'black'}
          />
        </TouchableOpacity>
        {stateFunctions[attachmentName]?.URI ? (
          <View style={styles.fileNameWrapper}>
            {stateFunctions[attachmentName]?.Type.includes('image') ? (
              <Image
                source={{ uri: stateFunctions[attachmentName]?.URI }}
                style={styles.previewImage}
              />
            ) : (
              <Text style={styles.fileNameText}>{stateFunctions[attachmentName]?.Name}</Text>
            )}
          </View>
        ) : null}
      </View>
  
      {/* Cute progress bar or tick icons */}
      <View style={styles.progressWrapper}>
        {stateFunctions[attachmentName]?.isUploaded ? (
          <View style={styles.tickContainer}>
            <FontAwesomeIcon icon={faCheck} size={14} color="#4CAF50" style={styles.firstTick} />
            <FontAwesomeIcon icon={faCheck} size={14} color="#4CAF50" style={styles.secondTick} />
          </View>
        ) : (
          progress[attachmentName] ? (
            <ProgressBarAndroid
              styleAttr="Horizontal"
              progress={progress[attachmentName] / 100}
              color="#4CAF50"
              style={styles.progressBar}
            />
          ) : null
        )}
      </View>
  
      <View style={styles.divider} />
    </View>
  );
  
  
  return (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Attachments</Text>
        <ProgressBar step={4} />
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Upload Attachments</Text>
          <View style={styles.divider} />
          {renderAttachment("Permission From Parents", "permission")}
          {renderAttachment("ID Card (attested)", "idcard")}
          {renderAttachment("Appointment Letter (attested)", "app_letter")}
          {renderAttachment("Character Certificate From Employers", "char_certificate")}
          {renderAttachment("Police Character Certificate", "app_certificate")}
          {renderAttachment("Affidavit (attested 1st class gazette Officer)", "affidavit")}
          {renderAttachment("Medical Certificate Counter Signed by M.S (Government Hospital)", "medical")}
          {renderAttachment("Attested Copy of ID card of Guardian/Father/Husband", "guardian_id")}
          {renderAttachment("Id Card photo (1st person)", "first_id")}
          {renderAttachment("Id Card photo (2nd person)", "second_id")}
          {renderAttachment("Guarantee Letter (1st person)", "first_guarantee")}
          {renderAttachment("Guarantee Letter (2nd person)", "second_guarantee")}
          {renderAttachment("Domicile", "domicile")}
        

          {renderAttachment("Marital Certificate", "marital")}
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
      </ScrollView>
    </View>
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

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black overlay
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensures it is above other components
},
centeredContainer: {
    height: 120, // Increased height for better visibility
    width: 250, // Increased width for a more balanced appearance
    borderRadius: 15, // Slightly more rounded corners
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Lighter background for better contrast
    shadowColor: '#000', // Adding shadow for depth
    shadowOffset: {
        width: 0,
        height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Elevation for Android
    padding: 20, // Added padding for inner spacing
},
loader: {
    marginBottom: 10,
},
progressWrapper: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center', // Center the progress bar
  marginVertical: 8,
},
progressBar: {
  width: '70%',          // Width set for centered display
  height: 8,
  borderRadius: 10,      // Rounded corners for a cute effect
  backgroundColor: '#d3d3d3', // Light background color for unfilled section
  overflow: 'hidden',
  shadowColor: '#000',   // Soft shadow for depth
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},
tickContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 5,
},
firstTick: {
  marginRight: -9, // Slight overlap for a cute double-tick effect
},
secondTick: {
  zIndex: 1, // Ensures second tick is above the first
},
});

export default FormA;
