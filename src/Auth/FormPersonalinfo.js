import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ToastAndroid,
  TouchableWithoutFeedback,
  PermissionsAndroid,
  Image,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProgressBar from '../components/ProgressBar';
import {useNavigation} from '@react-navigation/native';
import {DatePickerInput} from 'react-native-paper-dates';
import syncStorage from 'react-native-sync-storage';
import DocumentPicker from 'react-native-document-picker';
import {launchCamera} from 'react-native-image-picker';

const FormP = ({route, navigation}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cnic: '',
    datee: '',
    dateb: '',
    datei: '',
    jobheld: '',
    serving: '',
    jobStartDate: '',
    salary: '',
    address: '',
    mobile: '',
    disability: '',
    applieddate: '',
    placeofissue: '',
    starttimes: '',
    endtimes: '',
    starttimew: '',
    endtimew: '',
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [stateFunctions, setStateFunctions] = useState({});
  const [isFocus, setIsFocus] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [districtOption, setDistrictOption] = useState(null); // For District dropdown
  const [institutes, setInstitutes] = useState([]); // Holds the list of institutes
  const [selectedInstitute, setSelectedInstitute] = useState(null); // Holds the selected institute
  const [jobTypeOption, setJobTypeOption] = useState(null); // For Job Type dropdown
  const [bpsOption, setBpsOption] = useState(null); // For BPS dropdown
  const [userName, setUserName] = useState('');
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await fetch(
          'https://wwh.punjab.gov.pk/api/get-institutes',
        );
        const data = await response.json();

        if (data && Array.isArray(data.institutes)) {
          console.log('Institutes Array:', data.institutes); // Log the array to the console
          setInstitutes(data.institutes);
        } else {
          console.error('Expected an array but got:', data);
        }
      } catch (error) {
        console.error('Error fetching institutes:', error);
      }
    };

    fetchInstitutes();
  }, []);
  useEffect(() => {
    fetch('https://wwh.punjab.gov.pk/api/districts')
      .then(response => response.json())
      .then(data => {
        setDistricts(data.districts); // Assuming the data structure
      })
      .catch(error => {
        console.error('Error fetching districts:', error);
      });
  }, []);
  useEffect(() => {
    const {user} = route.params || {};

    // console.log('User from route.params:', user); // Logs user from route.params

    if (user) {
      setUserName(user.name);
    } else {
      const getUserDetails = async () => {
        try {
          const storedUser = await syncStorage.get('user');
          console.log('User from syncStorage:', storedUser); // Logs user from syncStorage

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser.name) {
              setUserName(parsedUser.name);
            }
          }
        } catch (error) {
          console.error('Error retrieving user details:', error);
        }
      };

      getUserDetails();
    }
  }, []);

  const handleInputChange = (name, value) => {
    setFormData({...formData, [name]: value});
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
            [selectedAttachment]: {
              Name: fileName,
              URI: imageUri,
              Type: 'image',
            },
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
  const handleNextPress = () => {
    // if (!capturedImage && !stateFunctions[selectedAttachment]?.URI) {
    //   ToastAndroid.show('Please capture or upload your profile image.', ToastAndroid.LONG);
    //   return;
    // }
    // if (!formData.name) {
    //   ToastAndroid.show('Please enter your name.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Permanent Address
    // if (!formData.address) {
    //   ToastAndroid.show('Please enter your address.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Phone Number
    // if (!formData.phone || formData.phone.length !== 11) {
    //   ToastAndroid.show('Please enter a valid 11-digit phone number.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Mobile Number
    // if (!formData.mobile || formData.mobile.length !== 11) {
    //   ToastAndroid.show('Please enter a valid 11-digit mobile number.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate District
    // if (!districtOption) {
    //   ToastAndroid.show('Please select a district.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Institute
    // if (!instituteOption) {
    //   ToastAndroid.show('Please select an institute.', ToastAndroid.LONG);
    //   return;
    // }

    // //validate Applied date
    // if (!formData.applieddate) {
    //   ToastAndroid.show('Please select the date of Apllied.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate CNIC
    // if (!formData.cnic.trim() || formData.cnic.length !== 13) {
    //   ToastAndroid.show('Please enter a valid 13-digit CNIC number.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Date of Expiry
    // if (!formData.datee) {
    //   ToastAndroid.show('Please select the date of expiry.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Date of Birth
    // if (!formData.dateb) {
    //   ToastAndroid.show('Please select your date of birth.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Date of Issue
    // if (!formData.datei) {
    //   ToastAndroid.show('Please select the date of issue.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Date of Issue
    // if (!formData.placeofissue) {
    //   ToastAndroid.show('Please enter the CNIC issue place.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Date of Issue
    // if (!formData.disability) {
    //   ToastAndroid.show('Please enter the disability(if you have).', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Job Information
    // if (!formData.jobheld) {
    //   ToastAndroid.show('Please enter the post you currently hold.', ToastAndroid.LONG);
    //   return;
    // }

    // if (!formData.serving) {
    //   ToastAndroid.show('Please enter the duration you have been serving in your current job.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Job Start Date
    // if (!formData.jobStartDate) {
    //   ToastAndroid.show('Please select the job start date.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Salary
    // if (!formData.salary || isNaN(formData.salary)) {
    //   ToastAndroid.show('Please enter a valid salary.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Job Type
    // if (!jobTypeOption) {
    //   ToastAndroid.show('Please select a job type.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate BPS
    // if (!bpsOption) {
    //   ToastAndroid.show('Please select your BPS.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate Start time in Summer
    // if (!formData.starttimes) {
    //   ToastAndroid.show('Please enter the post you currently hold.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate End time in Summer
    // if (!formData.endtimes) {
    //   ToastAndroid.show('Please enter the post you currently hold.', ToastAndroid.LONG);
    //   return;
    // }

    // //Validate Start time in Winter
    //  if (!formData.starttimew) {
    //   ToastAndroid.show('Please enter the post you currently hold.', ToastAndroid.LONG);
    //   return;
    // }

    // // Validate End time in Winter
    // if (!formData.endtimew) {
    //   ToastAndroid.show('Please enter the post you currently hold.', ToastAndroid.LONG);
    //   return;
    // }

    // // If all validations pass, save the form data and navigate to the next screen
    // console.log('Form Data before navigation:', formData);
    // syncStorage.set('formData', formData);
    navigation.navigate('FormG');
  };

  const jobtype = [
    {id: 1, name: 'Punjab Government Employee'},
    {id: 2, name: 'Federal Government Employee'},
    {id: 3, name: 'Private Employee'},
    {id: 4, name: 'Adhoc'},
    {id: 5, name: 'Government Contract'},
  ];
  const [options, setOptions] = useState([]);

  // Initialize options with BPS-1 to BPS-20
  React.useEffect(() => {
    const newOptions = [];
    for (let i = 1; i <= 20; i++) {
      newOptions.push({id: i, name: `BPS-${i}`});
    }
    setOptions(newOptions);
  }, []);
  const handleUploadClick = attachmentName => {
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
              source={{
                uri: capturedImage || stateFunctions[selectedAttachment]?.URI,
              }}
              style={styles.image}
            />
          </View>
        )}

        <Text style={styles.text}>Applicant's Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Applicant Name"
          placeholderTextColor="grey"
          value={userName}
          onChangeText={text => handleInputChange('name', text)}
          editable={false}
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
            data={districts}
            labelField="name"
            valueField="id"
            placeholder="Select an option"
            onFocus={() => setIsFocus(true)}
            value={districtOption} // State for selected option
            onChange={item => setDistrictOption(item.id)} // Update selected state
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
            data={institutes} // Updated state
            labelField="iname" // Change according to your API response
            valueField="id"
            placeholder="Select an option"
            onFocus={() => setIsFocus(true)}
            value={selectedInstitute} // Updated state
            onChange={value => setSelectedInstitute(value)}
          />
        </View>
        <Text style={[styles.text, {marginTop: '5%'}]}>Applied Date:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label="" // No value provided for label
            value={formData.applieddate}
            onChange={applieddate => {
              setFormData(prev => ({...prev, applieddate}));
            }}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>
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
        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Expiry:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label="" // No value provided for label
            value={formData.datee}
            onChange={datee => {
              setFormData(prev => ({...prev, datee}));
            }}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>
        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Birth:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label="" // No value provided for label
            value={formData.dateb}
            onChange={dateb => {
              setFormData(prev => ({...prev, dateb}));
            }}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>
        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Issue:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label="" // No value provided for label
            value={formData.datei}
            onChange={datei => {
              setFormData(prev => ({...prev, datei}));
            }}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>

        <Text style={[styles.text, {marginTop: '10%'}]}>Place of Issue:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter place where CNIC issue"
          placeholderTextColor="grey"
          value={formData.placeofissue}
          onChangeText={text => handleInputChange('placeofissue', text)}
        />

        <Text style={[styles.text, {marginTop: 20}]}>
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
          onChangeText={text => handleInputChange('jobheld', text)}
        />
        <Text style={styles.text}>Since When Serving on Current Job:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label="" // No value provided for label
            value={formData.serving}
            onChange={serving => {
              setFormData(prev => ({...prev, serving}));
            }}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>
        <Text style={[styles.text, {marginTop: 20}]}>Job Start Date:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label="" // No value provided for label
            value={formData.jobStartDate}
            onChange={jobStartDate => {
              setFormData(prev => ({...prev, jobStartDate}));
            }}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>
        <Text style={[styles.text, {marginTop: 20}]}>Salary:</Text>
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
            data={jobtype}
            labelField="name"
            valueField="id"
            placeholder="Select an option"
            onFocus={() => setIsFocus(true)}
            value={jobTypeOption}
            onChange={value => setJobTypeOption(value)}
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
            data={options} // Use the generated options
            labelField="name"
            valueField="id"
            placeholder="Select an option"
            onFocus={() => setIsFocus(true)}
            value={selectedOption} // Updated state
            onChange={value => setSelectedOption(value)}
          />
        </View>
        <Text style={[styles.sectionHead, {marginTop: 10}]}>
          Duty Hours in Summer
        </Text>
        <View style={styles.divider} />
        <Text style={styles.textt}>Start Time:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.starttimes}
          onChangeText={text => handleInputChange('starttimes', text)}
        />
        <Text style={styles.textt}>End Time:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.endtimes}
          onChangeText={text => handleInputChange('endtimes', text)}
        />
        <Text style={[styles.sectionHead, {marginTop: 10}]}>
          Duty Hours in Winter
        </Text>
        <View style={styles.divider} />
        <Text style={styles.textt}>Start Time:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.starttimew}
          onChangeText={text => handleInputChange('starttimew', text)}
        />
        <Text style={styles.textt}>End Time:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.endtimew}
          onChangeText={text => handleInputChange('endtimew', text)}
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
