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

const Documents = ({ route }) => {
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
    console.log('🔵 handleNextPress - Navigating to CompletedFormD');
    navigation.navigate('Declarations');
  };

  const handlePrevPress = () => {
    console.log('🔵 handlePrevPress - Navigating to Hostel');
    navigation.navigate('Hostel');
  };

  // Enhanced getOrCreatePersonalId function
  const getOrCreatePersonalId = async (userId) => {
    console.log('🟠 START getOrCreatePersonalId - User ID:', userId);
    try {
      // First, try to get existing personal data to get the personal_id
      console.log('🟠 Checking for existing personal data...');
      const response = await fetch(`https://wwh.punjab.gov.pk/api/getPersonal/${userId}`);
      console.log('🟠 getPersonal API response status:', response.status);
      
      const result = await response.json();
      console.log('🟠 getPersonal API FULL RESPONSE:', JSON.stringify(result, null, 2));
      
      if (result.success && result.data && result.data.id) {
        // If personal record exists, return the personal_id
        console.log('🟢 SUCCESS: Existing personal record found, ID:', result.data.id);
        return result.data.id;
      } else {
        // If no personal record exists, try alternative endpoint
        console.log('🟠 No data from getPersonal, trying alternative endpoint...');
        const altResponse = await fetch(`https://wwh.punjab.gov.pk/api/get-personal-id/${userId}`);
        console.log('🟠 Alternative endpoint response status:', altResponse.status);
        
        const altResult = await altResponse.json();
        console.log('🟠 Alternative endpoint FULL RESPONSE:', JSON.stringify(altResult, null, 2));
        
        if (altResult.status === 'success' && altResult.p_id) {
          console.log('🟢 SUCCESS: Found p_id from alternative endpoint:', altResult.p_id);
          return altResult.p_id;
        } else {
          console.log('🔴 No personal record found in any endpoint');
          return null;
        }
      }
    } catch (error) {
      console.error('🔴 Error getting personal ID:', error);
      return null;
    } finally {
      console.log('🟠 END getOrCreatePersonalId');
    }
  };

  useEffect(() => {
    console.log('🔵 START useEffect for p_id');
    const fetchPersonalId = async () => {
      try {
        console.log('🟡 Checking route.params for p_id:', route.params);
        let personalId = route.params?.p_id;
        
        if (personalId) {
          console.log('🟢 p_id found in route.params:', personalId);
          setP_id(personalId);
          return;
        }

        console.log('🟡 No p_id in route.params, fetching from API...');
        const user = JSON.parse(syncStorage.get('user'));
        console.log('🟡 User from syncStorage:', user);
        
        if (!user || !user.id) {
          console.log('🔴 No user found in syncStorage');
          ToastAndroid.show('User not found. Please login again.', ToastAndroid.LONG);
          return;
        }

        const userId = user.id;
        console.log('🟡 Fetching personal_id for user ID:', userId);

        // Use the enhanced getOrCreatePersonalId function
        personalId = await getOrCreatePersonalId(userId);
        
        console.log('🟡 Received personalId from getOrCreatePersonalId:', personalId);
        
        if (personalId) {
          console.log('🟢 SUCCESS: Setting p_id:', personalId);
          setP_id(personalId);
        } else {
          console.log('🔴 Failed to fetch p_id from all sources');
          ToastAndroid.show('Failed to load personal data. Please complete personal information first.', ToastAndroid.LONG);
          // Optionally navigate back to personal form
          // navigation.navigate('Personal');
        }
      } catch (error) {
        console.error('🔴 Error fetching p_id:', error);
        ToastAndroid.show('Error loading data. Please try again.', ToastAndroid.LONG);
      }
    };
    
    fetchPersonalId();
    console.log('🔵 END useEffect for p_id');
  }, [route.params]);

  useEffect(() => {
    console.log('🔵 START useEffect for fetchData - p_id:', p_id);
    
    const fetchData = async () => {
      if (!p_id) {
        console.log('🟡 No p_id available, skipping fetchData');
        return;
      }

      console.log('🟡 fetchData - p_id available:', p_id);
      setLoading(true);
      
      try {
        const fetchUrl = `https://wwh.punjab.gov.pk/api/getAdetail-check/${p_id}`;
        console.log('🟡 Making API call to:', fetchUrl);
        
        const response = await fetch(fetchUrl);
        console.log('🟡 getAdetail-check API response status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('🟡 getAdetail-check API FULL RESPONSE:', JSON.stringify(result, null, 2));
          
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            const data = result.data[0];
            console.log('🟢 SUCCESS: Data found for p_id:', p_id, 'Data:', data);
            
            const updatedState = {
              originalApplication: { URI: data.originalApplication ? `https://wwh.punjab.gov.pk/uploads/image/${data.originalApplication}` : '', Name: 'Original Application', Type: 'image' },
              permission: { URI: data.permission ? `https://wwh.punjab.gov.pk/uploads/permission/${data.permission}` : '', Name: 'Permission', Type: 'image' },
              idcard: { URI: data.idcard ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.idcard}` : '', Name: 'ID Card', Type: 'image' },
              app_letter: { URI: data.app_letter ? `https://wwh.punjab.gov.pk/uploads/appointment/${data.app_letter}` : '', Name: 'Appointment Letter', Type: 'image' },
              char_certificate: { URI: data.char_certificate ? `https://wwh.punjab.gov.pk/uploads/certificate/${data.char_certificate}` : '', Name: 'Character Certificate', Type: 'image' },
              app_certificate: { URI: data.app_certificate ? `https://wwh.punjab.gov.pk/uploads/certificate/${data.app_certificate}` : '', Name: 'Appointment Certificate', Type: 'image' },
              affidavit: { URI: data.affidavit ? `https://wwh.punjab.gov.pk/uploads/affidavit/${data.affidavit}` : '', Name: 'Affidavit', Type: 'image' },
              medical: { URI: data.medical ? `https://wwh.punjab.gov.pk/uploads/medical/${data.medical}` : '', Name: 'Medical', Type: 'image' },
              guardian_id: { URI: data.guardian_id ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.guardian_id}` : '', Name: 'Guardian ID', Type: 'image' },
              first_id: { URI: data.first_id ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.first_id}` : '', Name: 'First ID', Type: 'image' },
              second_id: { URI: data.second_id ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.second_id}` : '', Name: 'Second ID', Type: 'image' },
              first_guarantee: { URI: data.first_guarantee ? `https://wwh.punjab.gov.pk/uploads/guarantee/${data.first_guarantee}` : '', Name: 'First Guarantee', Type: 'image' },
              second_guarantee: { URI: data.second_guarantee ? `https://wwh.punjab.gov.pk/uploads/guarantee/${data.second_guarantee}` : '', Name: 'Second Guarantee', Type: 'image' },
              domicile: { URI: data.domicile ? `https://wwh.punjab.gov.pk/uploads/domicile/${data.domicile}` : '', Name: 'Domicile', Type: 'image' },
              marital: { URI: data.marital ? `https://wwh.punjab.gov.pk/uploads/marital/${data.marital}` : '', Name: 'Marital', Type: 'image' },
            };
            
            console.log('🟡 Setting stateFunctions with fetched data');
            setStateFunctions(updatedState);
          } else {
            console.log('🟡 No data found or empty array, navigating to FormA');
            // navigation.navigate('FormA'); 
          }
        } else {
          console.log('🔴 API response not OK, status:', response.status);
          // navigation.navigate('FormA'); 
        }
      } catch (error) {
        console.error('🔴 Error fetching form data:', error);
      } finally {
        setLoading(false);
        console.log('🟡 fetchData completed, loading set to false');
      }
    };
    
    fetchData();
    console.log('🔵 END useEffect for fetchData');
  }, [p_id]);

  const uploadImage = async (attachmentName, fileData) => {
    console.log('🟣 START uploadImage - Attachment:', attachmentName, 'p_id:', p_id);
    
    if (!p_id) {
      console.log('🔴 No p_id available for upload');
      ToastAndroid.show('Personal ID not found. Please complete personal information first.', ToastAndroid.LONG);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('personal_id', p_id);
    formDataToSend.append(attachmentName, { 
      uri: fileData.URI, 
      type: fileData.Type, 
      name: fileData.Name 
    });
    
    console.log('🟣 FormData prepared for upload:', {
      personal_id: p_id,
      attachmentName: attachmentName,
      fileData: fileData
    });

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://wwh.punjab.gov.pk/api/attachemnettt', true);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded * 100) / event.total);
        console.log(`🟣 Upload progress for ${attachmentName}: ${percentage}%`);
        setProgress((prevProgress) => ({ ...prevProgress, [attachmentName]: percentage }));
      }
    };

    xhr.onload = () => {
      console.log(`🟣 Upload completed for ${attachmentName}, status:`, xhr.status);
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log(`🟣 Upload response for ${attachmentName}:`, JSON.stringify(response, null, 2));
        
        if (response.success) {
          setStateFunctions((prev) => ({ 
            ...prev, 
            [attachmentName]: { ...prev[attachmentName], isUploaded: true } 
          }));
          ToastAndroid.show(`${attachmentName} uploaded successfully!`, ToastAndroid.LONG);
          console.log(`🟢 SUCCESS: ${attachmentName} uploaded`);
        } else {
          ToastAndroid.show(`Failed to upload ${attachmentName}. Please try again.`, ToastAndroid.LONG);
          console.log(`🔴 Upload failed for ${attachmentName}:`, response.message);
        }
      } else {
        ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
        console.log(`🔴 Upload HTTP error for ${attachmentName}:`, xhr.status);
      }
    };

    xhr.onerror = () => {
      console.log(`🔴 Upload XHR error for ${attachmentName}`);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    };

    xhr.setRequestHeader('Accept', 'application/json');
    xhr.setRequestHeader('Content-Type', 'multipart/form-data');
    
    console.log('🟣 Starting upload...');
    xhr.send(formDataToSend);
    console.log('🟣 END uploadImage');
  };

  const openCamera = async () => {
    console.log('📷 START openCamera for:', selectedAttachment);
    setModalVisible(false);
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('📷 Camera permission granted');
      const options = { mediaType: 'photo', includeBase64: false, maxHeight: 2000, maxWidth: 2000 };
      
      launchCamera(options, (response) => {
        console.log('📷 Camera response:', response);
        
        if (response.assets && response.assets.length > 0) {
          const { uri, fileName, type } = response.assets[0];
          console.log('📷 Image captured:', { uri, fileName, type });
          
          setStateFunctions((prev) => ({
            ...prev,
            [selectedAttachment]: { 
              URI: uri, 
              Name: fileName || uri.split('/').pop(), 
              Type: type || 'image/jpeg', 
              isUploaded: false 
            },
          }));
          uploadImage(selectedAttachment, { 
            URI: uri, 
            Name: fileName || uri.split('/').pop(), 
            Type: type || 'image/jpeg' 
          });
        } else {
          console.log('📷 Camera cancelled or error:', response.error);
        }
      });
    } else {
      console.log('🔴 Camera permission denied');
    }
    console.log('📷 END openCamera');
  };

  const openGallery = async () => {
    console.log('🖼️ START openGallery for:', selectedAttachment);
    try {
      const response = await DocumentPicker.pick({ 
        allowMultiSelection: false, 
        type: [DocumentPicker.types.images] 
      });
      
      console.log('🖼️ Document picker response:', response);
      
      setStateFunctions((prev) => ({ 
        ...prev, 
        [selectedAttachment]: { 
          URI: response[0].uri, 
          Name: response[0].name, 
          Type: response[0].type, 
          isUploaded: false 
        } 
      }));
      
      setModalVisible(false);
      uploadImage(selectedAttachment, { 
        URI: response[0].uri, 
        Name: response[0].name, 
        Type: response[0].type 
      });
      
    } catch (error) {
      console.error('🔴 Document picking error:', error);
    }
    console.log('🖼️ END openGallery');
  };

  const handleUploadClick = (attachmentName) => {
    console.log('🟡 handleUploadClick - Attachment:', attachmentName, 'p_id:', p_id);
    
    if (!p_id) {
      console.log('🔴 No p_id available, cannot upload');
      ToastAndroid.show('Personal ID not found. Please complete personal information first.', ToastAndroid.LONG);
      return;
    }
    
    setSelectedAttachment(attachmentName);
    setModalVisible(true);
    console.log('🟡 Modal opened for:', attachmentName);
  };

  const renderAttachment = (label, attachmentName) => (
    <View style={styles.attachmentWrapper}>
      <Text style={styles.text}>{label}</Text>
      <View style={styles.mainWrapper}>
        <TouchableOpacity 
          onPress={() => handleUploadClick(attachmentName)} 
          style={styles.iconWrapper}
        >
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
              <Text style={styles.fileNameText}>
                {stateFunctions[attachmentName]?.Name}
              </Text>
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
          progress[attachmentName] && (
            <ProgressBarAndroid
              styleAttr="Horizontal"
              progress={progress[attachmentName] / 100}
              color="#4CAF50"
              style={styles.progressBar}
            />
          )
        )}
      </View>
    </View>
  );

  console.log('🔵 RENDER - p_id:', p_id, 'loading:', loading);

  return loading ? (
    <View style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading documents...</Text>
      <ActivityIndicator size="large" color="#010048" />
      <Text style={styles.loadingSubText}>p_id: {p_id || 'Not available'}</Text>
    </View>
  ) : (
    <View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Documents</Text>
        <ProgressBar step={4} />
        
        {/* Debug Info */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Debug Info - p_id: {p_id || 'NOT FOUND'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Attach Documents</Text>
         
          
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
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#010048',
    marginBottom: 20,
  },
  loadingSubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  debugContainer: {
    backgroundColor: '#fff',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  debugText: {
    fontSize: 12,
    color: '#333',
    fontWeight: 'bold',
  },
});

export default Documents;

                 
                 
                 
                 
                 
                 
                 
           