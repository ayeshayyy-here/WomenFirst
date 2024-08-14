import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  Image,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProgressBar from '../components/ProgressBar';
import { useNavigation } from '@react-navigation/native';
import { DatePickerInput } from 'react-native-paper-dates';
import syncStorage from 'react-native-sync-storage';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';

const FormP = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cnic: '',
    datee: '',
    dateb: '',
    datei: '',
    jobheld: '',
    serving:'',
    jobStartDate: '',
    salary: '',
    address: '',
    mobile: '',
    disability: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [stateFunctions, setStateFunctions] = useState({});
  const [isFocus, setIsFocus] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const savedData = syncStorage.get('formData');
    if (savedData) {
      setFormData(savedData);
    }
  }, []);

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleNextPress = () => {
    console.log('Form Data before navigation:', formData);
    syncStorage.set('formData', formData);
    navigation.navigate('FormG');
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
          const imageUri = response.assets[0].uri;

          setCapturedImage(imageUri);
          setStateFunctions(prev => ({
            ...prev,
            [selectedAttachment]: { Name: fileName, URI: imageUri, Type: 'image' },
          }));
        }
      });
    }
  };

  const openGallery = async () => {
    try {
      const response = await DocumentPicker.pick({
        allowMultiSelection: false,
        type: [DocumentPicker.types.images], // This filters to only allow images (PNG, JPG, JPEG)
      });
  
      const fileType = response[0].type;
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  
      if (allowedTypes.includes(fileType)) {
        setStateFunctions(prev => ({
          ...prev,
          [selectedAttachment]: {
            Name: response[0].name,
            URI: response[0].uri,
            Type: fileType,
          },
        }));
      } else {
        alert('Only PNG, JPG, and JPEG files are allowed.');
      }
  
      setModalVisible(false);
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('User canceled the file selection');
      } else {
        console.error('Document picking error:', error);
      }
    }
  };
  
  const options = [
    {id: 1, name: 'Complaint'},
    {id: 2, name: 'General Query'},
    {id: 3, name: 'Advice / Suggestion'},
  ];

  const handleUploadClick = (attachmentName) => {
    setSelectedAttachment(attachmentName);
    setModalVisible(true);
  };

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Text style={styles.header}>Application Form</Text>
      <ProgressBar step={1} />

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Personal Information</Text>
        <View style={styles.divider} />
        
        {/* Display image or upload icon based on capturedImage */}
        {!capturedImage && !stateFunctions[selectedAttachment]?.URI ? (
          <View style={styles.iconWrapper}>
            <Text style={styles.iconText}>Choose or Upload Profile Image</Text>
            <TouchableOpacity
              onPress={() => handleUploadClick('profileImage')}
              style={styles.iconWrapper}>
              <Icon name="upload" size={30} color="black" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: capturedImage || stateFunctions[selectedAttachment]?.URI }}
              style={styles.image}
            />
          </View>
        )}
        
        <Text style={styles.text}>Applicant's Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Applicant Name"
          placeholderTextColor="grey"
          value={formData.name}
          onChangeText={text => handleInputChange('name', text)}
        />
        <Text style={styles.text}>Permanent Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          placeholderTextColor="grey"
          value={formData.address}
          onChangeText={text => handleInputChange('address', text)}
        />
        <Text style={styles.text}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone Number"
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={formData.phone}
          onChangeText={text => handleInputChange('phone', text)}
        />
        <Text style={styles.text}>Mobile Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile Number"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.mobile}
          onChangeText={text => handleInputChange('mobile', text)}
        />
          <Text style={styles.text}>Choose District to Apply </Text>
            <View>
              <Dropdown
                style={[styles.input, isFocus && {borderColor: '#1E577C'}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                search
                searchPlaceholder="Search..."
                data={options}
                labelField="name"
                valueField="id"
                placeholder="Select an option"
                onFocus={() => setIsFocus(true)}
                value={selectedOption}
                onChange={value => setSelectedOption(value)}
              />
            </View>
            <Text style={styles.text}>Choose Institute </Text>
            <View>
              <Dropdown
                style={[styles.input, isFocus && {borderColor: '#1E577C'}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                search
                searchPlaceholder="Search..."
                data={options}
                labelField="name"
                valueField="id"
                placeholder="Select an option"
                onFocus={() => setIsFocus(true)}
                value={selectedOption}
                onChange={value => setSelectedOption(value)}
              />
            </View>
      </View>

      {/* CNIC Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>CNIC Information</Text>
        <View style={styles.divider} />
        <Text style={styles.text}>CNIC:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter CNIC"
          keyboardType="numeric"
          placeholderTextColor="grey"
          maxLength={13}
          value={formData.cnic}
          onChangeText={text => handleInputChange('cnic', text)}
        />
        <Text style={[styles.text, { marginTop: '5%' }]}>Date of Expiry:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label="" // No value provided for label
            value={formData.datee}
            onChange={datee => {
              setFormData(prev => ({ ...prev, datee }));
            }}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>
        <Text style={[styles.text, { marginTop: '5%' }]}>Date of Birth:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label="" // No value provided for label
            value={formData.dateb}
            onChange={dateb => {
              setFormData(prev => ({ ...prev, dateb }));
            }}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>
        <Text style={[styles.text, { marginTop: '5%' }]}>Date of Issue:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label="" // No value provided for label
            value={formData.datei}
            onChange={datei => {
              setFormData(prev => ({ ...prev, datei }));
            }}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>
        <Text style={[styles.text, { marginTop: 20 }]}>
          Any Physical Disability:
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Specify disability (if any)"
          placeholderTextColor="grey"
          value={formData.disability}
          onChangeText={text => handleInputChange('disability', text)}
        />
        
      </View>

      {/* Job Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Job Information</Text>
        <View style={styles.divider} />
        <Text style={styles.text}>Post Held:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Post"
          placeholderTextColor="grey"
          value={formData.jobheld}
          onChangeText={text => handleInputChange('jobTitle', text)}
        />
         <Text style={styles.text}>Since When Serving on Current Job:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Current Job"
          placeholderTextColor="grey"
          value={formData.serving}
          onChangeText={text => handleInputChange('jobTitle', text)}
        />
        <Text style={styles.text}>Job Start Date:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label="" // No value provided for label
            value={formData.jobStartDate}
            onChange={jobStartDate => {
              setFormData(prev => ({ ...prev, jobStartDate }));
            }}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>
        <Text style={[styles.text, { marginTop: 20 }]}>Salary:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Salary"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.salary}
          onChangeText={text => handleInputChange('salary', text)}
        />
        <Text style={styles.text}>Job Type</Text>
            <View>
              <Dropdown
                style={[styles.input, isFocus && {borderColor: '#1E577C'}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                search
                searchPlaceholder="Search..."
                data={options}
                labelField="name"
                valueField="id"
                placeholder="Select an option"
                onFocus={() => setIsFocus(true)}
                value={selectedOption}
                onChange={value => setSelectedOption(value)}
              />
            </View>
            <Text style={styles.text}>BPS</Text>
            <View>
              <Dropdown
                style={[styles.input, isFocus && {borderColor: '#1E577C'}]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.itemTextStyle}
                search
                searchPlaceholder="Search..."
                data={options}
                labelField="name"
                valueField="id"
                placeholder="Select an option"
                onFocus={() => setIsFocus(true)}
                value={selectedOption}
                onChange={value => setSelectedOption(value)}
              />
            </View>
         <Text style={[styles.sectionHead,{marginTop:10}]}>Duty Hours in Summer</Text>
         <View style={styles.divider} />
         <Text style={styles.textt}>Start Time:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.salary}
          onChangeText={text => handleInputChange('salary', text)}
        />
                  <Text style={styles.textt}>End Time:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.salary}
          onChangeText={text => handleInputChange('salary', text)}
        />
            <Text style={[styles.sectionHead,{marginTop:10}]}>Duty Hours in Winter</Text>
            <View style={styles.divider} />
          <Text style={styles.textt}>Start Time:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.salary}
          onChangeText={text => handleInputChange('salary', text)}
        />
                  <Text style={styles.textt}>End Time:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.salary}
          onChangeText={text => handleInputChange('salary', text)}
        />
      </View>

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
                    onPress={openCamera}>
                    <Icon name="camera" size={30} color="black" />
                    <Text style={styles.modalButtonText}>Capture Image</Text>
                  </TouchableOpacity>
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

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleNextPress}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    flexGrow: 1,
  },
  divider: {
    height: 0.2,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '90%',
    alignSelf: 'center',
  },
  iconWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 10,
    marginVertical: 20,
  },
  iconText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
    padding: 10,
  },
  calenderstyle: {
    height: 50,
    backgroundColor: '#fff',
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
  sectionHead: {
    fontSize: 12,
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
  textt: {
    fontSize: 10,
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
  placeholderStyle: {
   color: 'grey',
   paddingHorizontal: 5,
    fontSize: 12,
  },
  inputSearchStyle:{
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
    color: 'grey',
    borderColor: 'grey',
    marginBottom: 2,
    paddingLeft: 10,
    fontSize: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#010048',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  datePickerWrapper: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    height: 40,
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
    marginTop: 10,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    borderRadius: 50,
    width: 100,
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
    borderRadius: 50, // Ensure the image is circular
  },
  fileNameText: {
    fontSize: 14,
    marginTop: 10,
    color: 'black',
    textAlign: 'center',
  },
});

export default FormP;