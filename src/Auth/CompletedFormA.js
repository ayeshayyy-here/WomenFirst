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
import Loader from '../components/Loader';
import Rendercomponent from '../components/Rendercomponet';
const CompletedFormA = ({ route }) => {
  const [p_id, setP_id] = useState(null);
  const [progress, setProgress] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState('');
  const [stateFunctions, setStateFunctions] = useState({});
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const initialState = {
    URI: '',
    Type: '',
    Name: '',
    isUploaded: false,
  };
  const handleNextPress = async () => {
    navigation.navigate('Declarations');
  };

  const handlePrevPress = () => {
    navigation.navigate('Hostel');
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
      } catch (error) {
        console.error('Error fetching p_id:', error);
      }
    };
    fetchPersonalId();
  }, [route.params]);

  useEffect(() => {
    const fetchData = async () => {
      if (!p_id) return;

      setLoading(true);
      try {
        const fetchUrl = `https://wwh.punjab.gov.pk/api/getAdetail-check/${p_id}`;
        const response = await fetch(fetchUrl);
        if (response.ok) {
          const result = await response.json();
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            const data = result.data[0];
            const updatedState = {
              domicile: { URI: data.domicile ? `https://wwh.punjab.gov.pk/uploads/domicile/${data.domicile}` : '', Name: 'Domicile of Applicant', Type: 'image' },
              permission: { URI: data.permission ? `https://wwh.punjab.gov.pk/uploads/permission/${data.permission}` : '', Name: 'Permission letter from parents/guardians/husband', Type: 'image' },
              idcard_front: { URI: data.idcard_front ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.idcard_front}` : '', Name: 'ID Card (front) of Applicant', Type: 'image' },
              idcard_back: { URI: data.idcard_back ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.idcard_back}` : '', Name: 'ID Card (back) of Applicant', Type: 'image' },
              app_letter: { URI: data.app_letter ? `https://wwh.punjab.gov.pk/uploads/appointment/${data.app_letter}` : '', Name: 'Certificate of Employment', Type: 'image' },
              char_certificate: { URI: data.char_certificate ? `https://wwh.punjab.gov.pk/uploads/certificate/${data.char_certificate}` : '', Name: 'Character Certificate From Employers', Type: 'image' },
              app_certificate: { URI: data.app_certificate ? `https://wwh.punjab.gov.pk/uploads/certificate/${data.app_certificate}` : '', Name: 'Character certificate From Police', Type: 'image' },
              affidavit: { URI: data.affidavit ? `https://wwh.punjab.gov.pk/uploads/affidavit/${data.affidavit}` : '', Name: 'Affidavit (attested 1st class gazette Officer)', Type: 'image' },
             marital: { URI: data.marital ? `https://wwh.punjab.gov.pk/uploads/marital/${data.marital}` : '', Name: 'Upload Marital Status Attachement(Married/Widow/Divorced)', Type: 'image' },
              medical: { URI: data.medical ? `https://wwh.punjab.gov.pk/uploads/medical/${data.medical}` : '', Name: 'Medical Certificate Counter Signed by M.S (Government Hospital)', Type: 'image' },
              guardianf_id: { URI: data.guardianf_id ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.guardianf_id}` : '', Name: 'ID card of Guardian/Father/Husband (front)', Type: 'image' },
              guardianb_id: { URI: data.guardianb_id ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.guardianb_id}` : '', Name: 'ID card of Guardian/Father/Husband (back)', Type: 'image' },
               first_guarantee: { URI: data.first_guarantee ? `https://wwh.punjab.gov.pk/uploads/guarantee/${data.first_guarantee}` : '', Name: 'Letter of Refrence/Guarantee', Type: 'image' },
              first_id: { URI: data.first_id ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.first_id}` : '', Name: 'Id Card photo (1st person)', Type: 'image' },
               second_guarantee: { URI: data.second_guarantee ? `https://wwh.punjab.gov.pk/uploads/guarantee/${data.second_guarantee}` : '', Name: 'Second Guarantee', Type: 'image' },
              second_id: { URI: data.second_id ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.second_id}` : '', Name: 'Id Card photo (2nd person)', Type: 'image' },
             
             
              
              
            };
            setStateFunctions(updatedState);
          } else {
            navigation.navigate('CompletedFormA'); 
          }
        } else {
          navigation.navigate('CompletedFormA'); 
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [p_id]);

  const uploadImage = async (attachmentName, fileData) => {
    const formDataToSend = new FormData();
    formDataToSend.append('personal_id', p_id);
    formDataToSend.append(attachmentName, { uri: fileData.URI, type: fileData.Type, name: fileData.Name });
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://wwh.punjab.gov.pk/api/attachemnettt', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded * 100) / event.total);
        setProgress((prevProgress) => ({ ...prevProgress, [attachmentName]: percentage }));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.success) {
          setStateFunctions((prev) => ({ ...prev, [attachmentName]: { ...prev[attachmentName], isUploaded: true } }));
          ToastAndroid.show(`${attachmentName} uploaded successfully!`, ToastAndroid.LONG);
        } else {
          ToastAndroid.show(`Failed to upload ${attachmentName}. Please try again.`, ToastAndroid.LONG);
        }
      } else {
        ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
      }
    };

    xhr.onerror = () => {
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    };

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    xhr.send(formDataToSend);
  };

  const openCamera = async () => {
    setModalVisible(false);
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      const options = { mediaType: 'photo', includeBase64: false, maxHeight: 2000, maxWidth: 2000 };
      launchCamera(options, (response) => {
        if (response.assets && response.assets.length > 0) {
          const { uri, fileName, type } = response.assets[0];
          setStateFunctions((prev) => ({
            ...prev,
            [selectedAttachment]: { URI: uri, Name: fileName || uri.split('/').pop(), Type: type || 'image/jpeg', isUploaded: false },
          }));
          uploadImage(selectedAttachment, { URI: uri, Name: fileName || uri.split('/').pop(), Type: type || 'image/jpeg' });
        }
      });
    }
  };

  const openGallery = async () => {
    try {
      const response = await DocumentPicker.pick({ allowMultiSelection: false, type: [DocumentPicker.types.images] });
      setStateFunctions((prev) => ({ ...prev, [selectedAttachment]: { URI: response[0].uri, Name: response[0].name, Type: response[0].type, isUploaded: false } }));
      setModalVisible(false);
      uploadImage(selectedAttachment, { URI: response[0].uri, Name: response[0].name, Type: response[0].type });
    } catch (error) {
      console.error('Document picking error:', error);
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
          <FontAwesomeIcon icon={faPlusCircle} size={30} color={stateFunctions[attachmentName]?.isUploaded ? 'green' : 'black'} />
        </TouchableOpacity>
        {stateFunctions[attachmentName]?.URI ? (
          <View style={styles.fileNameWrapper}>
            {stateFunctions[attachmentName]?.Type.includes('image') ? (
              <Image source={{ uri: stateFunctions[attachmentName]?.URI }} style={styles.previewImage} />
            ) : (
              <Text style={styles.fileNameText}>{stateFunctions[attachmentName]?.Name}</Text>
            )}
          </View>
        ) : null}
      </View>
      <View style={styles.progressWrapper}>
        {stateFunctions[attachmentName]?.isUploaded ? (
               <View style={styles.tickContainer}>
               <FontAwesomeIcon icon={faCheck} size={14} color="#4CAF50" style={styles.firstTick} />
               <FontAwesomeIcon icon={faCheck} size={14} color="#4CAF50" style={styles.secondTick} />
             </View>
        ) : (
          progress[attachmentName] &&      <ProgressBarAndroid
          styleAttr="Horizontal"
          progress={progress[attachmentName] / 100}
          color="#4CAF50"
          style={styles.progressBar}
        />
        )}
      </View>
    </View>
  );

  return loading ? (
    <Loader loading={loading} />
  ) : (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Documents</Text>
        <ProgressBar step={4} />
        <View style={styles.section}>
          <Text style={styles.sectionHeader}> Attach Documents</Text>
       {renderAttachment("Domicile of Applicant", "domicile")}
          {renderAttachment("Permission letter from parents/guardians/husband", "permission")}
          {renderAttachment("ID Card (front) of Applicant", "idcard_front")}
          {renderAttachment("ID Card (back) of Applicant", "idcard_back")}
          {renderAttachment("Certificate of Employment", "app_letter")}
          {renderAttachment("Character Certificate From Employers", "char_certificate")}
          {renderAttachment("Character certificate From Police", "app_certificate")}
          {renderAttachment("Affidavit (attested 1st class gazette Officer)", "affidavit")}
          {renderAttachment("Upload Marital Status Attachement(Married/Widow/Divorced)", "marital")}
          {renderAttachment("Medical Certificate Counter Signed by M.S (Government Hospital)", "medical")}
          {renderAttachment("ID card of Guardian/Father/Husband (front)", "guardianf_id")}
          {renderAttachment("ID card of Guardian/Father/Husband (back)", "guardianb_id")}
          {renderAttachment("Letter of Refrence/Guarantee", "first_guarantee")}
          {renderAttachment("Id Card photo (1st person)", "first_id")}
          {renderAttachment("Guarantee Letter (2nd person)", "second_guarantee")}
          {renderAttachment("Id Card photo (2nd person)", "second_id")}
          
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
    fontSize: 12,
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
    borderRadius: 10,
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
    shadowRadius: 2,
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

export default CompletedFormA;

                 
                 
                 
                 
                 
                 
                 
           