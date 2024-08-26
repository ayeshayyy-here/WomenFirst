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
import Loader from '../components/Loader';
import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProgressBar from '../components/ProgressBar';
import {DatePickerInput} from 'react-native-paper-dates';
import syncStorage from 'react-native-sync-storage';
import DocumentPicker from 'react-native-document-picker';
import {launchCamera} from 'react-native-image-picker';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const CompletedFormP = ({route, navigation}) => {
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
  const [districtOption, setDistrictOption] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [jobTypeOption, setJobTypeOption] = useState(null);
  const [bpsOption, setBpsOption] = useState(null);
  const [userName, setUserName] = useState('');
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTimeField, setSelectedTimeField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await fetch(
          'https://wwh.punjab.gov.pk/api/get-institutes',
        );
        const data = await response.json();
        setInstitutes(data.institutes || []);
      } catch (error) {
        console.error('Error fetching institutes:', error);
      }
    };

    fetchInstitutes();
  }, []);

  useEffect(() => {
    const user = JSON.parse(syncStorage.get('user'));
    const userDistrictId = user?.district;

    fetch('https://wwh.punjab.gov.pk/api/districts')
      .then(response => response.json())
      .then(data => {
        const filteredDistricts = data.districts.filter(
          district => district.id !== userDistrictId
        );
        setDistricts(filteredDistricts);
      })
      .catch(error => {
        console.error('Error fetching districts:', error);
      });
  }, []);

  useEffect(() => {
    const {user} = route.params || {};

    if (user) {
      setUserName(user.name);
    } else {
      const getUserDetails = async () => {
        try {
          const storedUser = await syncStorage.get('user');
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
        type: [DocumentPicker.types.images],
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

  const handleEditPress = () => {
    setIsEditing(true);
  };



  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data...');
  
        const user = JSON.parse(syncStorage.get('user'));
        const userId = user?.id;
        console.log('User ID:', userId);
  
        if (userId) {
          console.log('Fetching user details from API...');
          const response = await fetch(`https://wwh.punjab.gov.pk/api/getPdetail-check/${userId}`);
          
          if (response.ok) {
            console.log('API response OK');
            const result = await response.json();
            console.log('API result:', result);
  
            const data = result.data[0];
            console.log('Fetched data:', data);
  
            // Function to clean up the time strings
            const cleanTimeString = (timeString) => {
              const cleaned = timeString.replace(/\u202f/g, '').trim();
              console.log('Cleaned time string:', cleaned);
              return cleaned;
            };
  
            setFormData({
              name: data.name || '',
              phone: data.phone_no || '',
              cnic: data.cnic || '',
              datee: data.cnic || '',
              dateb: data.dob || '',
              datei: data.cnic || '',
              jobheld: data.post_held || '',
              serving: data.cnic || '',
              jobStartDate: data.cnic || '',
              salary: data.sallary || '',
              address: data.paddress || '',
              mobile: data.mobile || '',
              disability: data.disability || '',
              applieddate: data.cnic || '',
              placeofissue: data.Place_issue || '',
              starttimes: cleanTimeString(data.ss_time) || '',
              endtimes: cleanTimeString(data.se_time) || '',
              starttimew: cleanTimeString(data.ws_time) || '',
              endtimew: cleanTimeString(data.we_time) || '',
            });
  
            setSelectedInstitute(data.institute);
            setDistrictOption(data.applied_district);
            setJobTypeOption(data.job_type);
            setBpsOption(data.bps);
  
            console.log('Form data set:', {
              name: data.name || '',
              phone: data.phone_no || '',
              cnic: data.cnic || '',
              datee: data.cnic || '',
              dateb: data.dob || '',
              datei: data.cnic || '',
              jobheld: data.post_held || '',
              serving: data.cnic || '',
              jobStartDate: data.cnic || '',
              salary: data.sallary || '',
              address: data.paddress || '',
              mobile: data.mobile || '',
              disability: data.disability || '',
              applieddate: data.cnic || '',
              placeofissue: data.Place_issue || '',
              starttimes: cleanTimeString(data.ss_time) || '',
              endtimes: cleanTimeString(data.se_time) || '',
              starttimew: cleanTimeString(data.ws_time) || '',
              endtimew: cleanTimeString(data.we_time) || '',
            });
          } else {
            console.error('API response not OK:', response.statusText);
          }
        } else {
          console.warn('User ID not found');
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };
  
    fetchData();
  }, []);
  
  
  const handleSavePress = async () => {
    if (!capturedImage && !stateFunctions[selectedAttachment]?.URI) {
      ToastAndroid.show('Please capture or upload your profile image.', ToastAndroid.LONG);
      return;
    }
    const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
    const formDataToSend = new FormData();
    const formattedDate = formatDate(formData.applieddate);
    const formattedDatee = formatDate(formData.datee);
    const formattedDatei = formatDate(formData.datei);
    const formattedDateb = formatDate(formData.dateb);
    const formattedserving = formatDate(formData.serving);
    const user = JSON.parse(syncStorage.get('user'));
    const userId = user?.id;

    formDataToSend.append('user_id', userId);
    formDataToSend.append('name', formData.name);
    formDataToSend.append('paddress', formData.address);
    formDataToSend.append('phone_no', formData.phone);
    formDataToSend.append('mobile', formData.mobile);
    formDataToSend.append('cnic', formData.cnic);
    formDataToSend.append('expiry_date', formattedDatee);
    formDataToSend.append('issue_date', formattedDatei);
    formDataToSend.append('Place_issue', formData.placeofissue);
    formDataToSend.append('dob', formattedDateb);
    formDataToSend.append('disability', formData.disability);
    formDataToSend.append('post_held', formData.jobheld);
    formDataToSend.append('job_joining', formattedserving);
    formDataToSend.append('sallary', formData.salary);
    formDataToSend.append('ss_time', formData.starttimes);
    formDataToSend.append('se_time', formData.endtimes);
    formDataToSend.append('ws_time', formData.starttimew);
    formDataToSend.append('we_time', formData.endtimew);
    formDataToSend.append('applied_date', formattedDate);
    formDataToSend.append('institute', selectedInstitute);
    formDataToSend.append('applied_district', districtOption);
    formDataToSend.append('job_type', jobTypeOption);
    formDataToSend.append('bps', selectedOption);

    if (stateFunctions[selectedAttachment]?.URI) {
      formDataToSend.append('profile', {
        uri: stateFunctions[selectedAttachment]?.URI,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });
    }

    try {
      setLoading(true);
      const response = await fetch('https://0053-103-26-82-30.ngrok-free.app/api/personalinformation', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

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

  const handleNextPress = async () => {
    navigation.navigate('CompletedFormG');
  };

  const jobtype = [
    {id: 1, name: 'Punjab Government Employee'},
    {id: 2, name: 'Federal Government Employee'},
    {id: 3, name: 'Private Employee'},
    {id: 4, name: 'Adhoc'},
    {id: 5, name: 'Government Contract'},
  ];

  const [options, setOptions] = useState([]);

  useEffect(() => {
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

  const showTimePicker = (field) => {
    DateTimePickerAndroid.open({
      mode: 'time',
      is24Hour: false,
      value: new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          const time = selectedDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          setFormData((prevData) => ({ ...prevData, [field]: time }));
        }
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Text style={styles.header}>Profile</Text>
      <ProgressBar step={1} />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Personal Information</Text>
        {!isEditing ? (
          <TouchableOpacity style={styles.button} onPress={handleEditPress}>
            <Text style={styles.buttonText}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleSavePress}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        )}

        <View style={styles.divider} />

        {!capturedImage && !stateFunctions[selectedAttachment]?.URI ? (
          <View style={styles.iconWrapper}>
          
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
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
          editable={isEditing}
          style={styles.input}
        />

        <Text style={styles.text}>Permanent Address:</Text>
        <TextInput
          style={styles.input}
          editable={isEditing}
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
          editable={isEditing}
        />

        <Text style={styles.text}>Mobile Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile Number"
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={formData.mobile}
          onChangeText={text => handleInputChange('mobile', text)}
          editable={isEditing}
        />

        <Text style={styles.text}>Choose District to Apply </Text>
        <View>
          <Dropdown
            style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
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
            onBlur={() => setIsFocus(false)}
            value={districtOption}
            onChange={item => setDistrictOption(item.id)}
            editable={isEditing}
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
            data={institutes}
            labelField="iname"
            valueField="id"
            placeholder="Select an option"
            onFocus={() => setIsFocus(true)}
            value={selectedInstitute}
            onChange={item => setSelectedInstitute(item.id)}
            editable={isEditing}
          />
        </View>

        <Text style={[styles.text, { marginTop: '5%' }]}>Applied Date:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter applied date"
        placeholderTextColor="grey"
        value={formData.applieddate}
        onChangeText={(text) => handleInputChange('applieddate', text)}
        editable={isEditing}
      />
</View>
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
          editable={isEditing}
        />

        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Expiry:</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter applied date"
        placeholderTextColor="grey"
        value={formData.datee}
        onChangeText={(text) => handleInputChange('datee', text)}
        editable={isEditing}
      />
       

        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Birth:</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter applied date"
        placeholderTextColor="grey"
        value={formData.dateb}
        onChangeText={(text) => handleInputChange('dateb', text)}
        editable={isEditing}
      />

        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Issue:</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter applied date"
        placeholderTextColor="grey"
        value={formData.datei}
        onChangeText={(text) => handleInputChange('datei', text)}
        editable={isEditing}
      />

        <Text style={[styles.text, {marginTop: '10%'}]}>Place of Issue:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter place where CNIC issue"
          placeholderTextColor="grey"
          value={formData.placeofissue}
          onChangeText={text => handleInputChange('placeofissue', text)}
          editable={isEditing}
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
          editable={isEditing}
        />
      </View>

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
          editable={isEditing}
        />

        <Text style={styles.text}>Since When Serving on Current Job:</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter applied date"
        placeholderTextColor="grey"
        value={formData.serving}
        onChangeText={(text) => handleInputChange('serving', text)}
        editable={isEditing}
      />

        <Text style={[styles.text, {marginTop: 20}]}>Job Start Date:</Text>
        <TextInput
        style={styles.input}
        placeholder="Enter applied date"
        placeholderTextColor="grey"
        value={formData.jobStartDate}
        onChangeText={(text) => handleInputChange('jobstartDate', text)}
        editable={isEditing}
      />

        <Text style={[styles.text, {marginTop: 20}]}>Salary:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Salary"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.salary}
          onChangeText={text => handleInputChange('salary', text)}
          editable={isEditing}
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
            onChange={item => setJobTypeOption(item.id)}
            editable={isEditing}
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
            onChange={item => setSelectedOption(item.id)}
            editable={isEditing}
          />
        </View>
    
        <Text style={[styles.sectionHead, { marginTop: 10 }]}>
    Duty Hours in Summer
  </Text>
  <View style={styles.divider} />

  <Text style={styles.textt}>Start Time:</Text>
  <TouchableOpacity onPress={() => showTimePicker('starttimes')}>
    <TextInput
      style={styles.input}
      placeholder="Enter Time"
      keyboardType="numeric"
      placeholderTextColor="grey"
      value={formData.starttimes}
      onChangeText={text => handleInputChange('starttimes', text)}
      editable={isEditing} // To prevent direct typing, use time picker instead
    />
  </TouchableOpacity>

  <Text style={styles.textt}>End Time:</Text>
  <TouchableOpacity onPress={() => showTimePicker('endtimes')}>
    <TextInput
      style={styles.input}
      placeholder="Enter Time"
      keyboardType="numeric"
      placeholderTextColor="grey"
      value={formData.endtimes}
      onChangeText={text => handleInputChange('endtimes', text)}
      editable={isEditing}
    />
  </TouchableOpacity>

  <Text style={[styles.sectionHead, { marginTop: 10 }]}>
    Duty Hours in Winter
  </Text>
  <View style={styles.divider} />

  <Text style={styles.textt}>Start Time:</Text>
  <TouchableOpacity onPress={() => showTimePicker('starttimew')}>
    <TextInput
      style={styles.input}
      placeholder="Enter Time"
      keyboardType="numeric"
      placeholderTextColor="grey"
      value={formData.starttimew}
      onChangeText={text => handleInputChange('starttimew', text)}
      editable={isEditing}
    />
  </TouchableOpacity>

  <Text style={styles.textt}>End Time:</Text>
  <TouchableOpacity onPress={() => showTimePicker('endtimew')}>
    <TextInput
      style={styles.input}
      placeholder="Enter Time"
      keyboardType="numeric"
      placeholderTextColor="grey"
      value={formData.endtimew}
      onChangeText={text => handleInputChange('endtimew', text)}
      editable={isEditing}
    />
  </TouchableOpacity>
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

      <Loader loading={loading} />
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
          <Text style={styles.buttonText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>
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
    borderRadius: 50,
  },
  fileNameText: {
    fontSize: 14,
    marginTop: 10,
    color: 'black',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#000', // Change this to your preferred background color
    padding: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5, // Adds a shadow on Android
    shadowColor: '#000', // Adds a shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
});

export default CompletedFormP;
