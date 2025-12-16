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
import {useNavigation} from '@react-navigation/native';
import syncStorage from 'react-native-sync-storage';
import DocumentPicker from 'react-native-document-picker';
import {launchCamera} from 'react-native-image-picker';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const Employment = ({route, navigation}) => {
  const [personalId, setPersonalId] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  
  // Main form data state
  const [formData, setFormData] = useState({
    // Educational Information
    education: '',
    discipline: '',
    
    // Employment Information
    em_name: '',
    designation: '',
    em_address: '',
    em_email: '',
    department: '',
    em_mobile: '',
    salary: '',
    Job_joining: '',
    jobheld: '',
    
    // Job Details
    job_type: '',
    bps: '',
    private_job_type: '',
    other_details: '',
    job_routine: 'normal',
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
  const [loading, setLoading] = useState(false);
  const [jobTypeOption, setJobTypeOption] = useState(null);
  const [bpsOption, setBpsOption] = useState(null);
  const [showBPSDropdown, setShowBPSDropdown] = useState(false);
  const [showPrivateJobTypeDropdown, setShowPrivateJobTypeDropdown] = useState(false);
  const [privateJobTypeOption, setPrivateJobTypeOption] = useState(null);
  const [showOtherTextInput, setShowOtherTextInput] = useState(false);
  const [otherDetails, setOtherDetails] = useState('');

  // Data options
  const jobtype = [
    {id: 1, name: 'Punjab Government'},
    {id: 2, name: 'Federal Government'},
    {id: 3, name: 'Private Employee'},
  ];

  const privateJobTypeOptions = [
    { label: 'Adhoc', value: 'Adhoc' },
    { label: 'Government Contract', value: 'Government Contract' },
    { label: 'Private Contract', value: 'Private Contract' },
    { label: 'Daily Wages', value: 'Daily Wages' },
    { label: 'Other', value: 'Other' },
  ];

  const [bpsOptions, setBpsOptions] = useState([]);

  // Initialize BPS options
  useEffect(() => {
    const newOptions = [];
    for (let i = 1; i <= 20; i++) {
      newOptions.push({id: i, name: `BPS-${i}`});
    }
    setBpsOptions(newOptions);
  }, []);

  // Fetch user data on component mount
  useEffect(() => {
    const user = JSON.parse(syncStorage.get('user'));
    console.log('User from syncStorage:', user);

    if (user) {
      // Fetch existing personal data using user_id to get personal_id
      fetchPersonalData(user.id);
    }
  }, []);

  // Fetch existing personal data using user_id
  const fetchPersonalData = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://wwh.punjab.gov.pk/api/getPersonal/${userId}`);
      const result = await response.json();
      
      console.log('Personal data API response:', result);
      
      if (result.success && result.data) {
        const data = result.data;
        
        // Set the personal_id from personal_information.id
        if (data.id) {
          setPersonalId(data.id);
          setDataExists(true);
          
          // Populate employment data from personal table
          setFormData(prev => ({
            ...prev,
            education: data.education || '',
            discipline: data.discipline || '',
            salary: data.sallary || '',
            jobheld: data.post_held || '',
            Job_joining: data.job_joining || '',
            job_type: data.job_type || '',
            bps: data.bps || '',
            job_routine: data.job_routine || 'normal',
            starttimes: data.ss_time || '',
            endtimes: data.se_time || '',
            starttimew: data.ws_time || '',
            endtimew: data.we_time || '',
          }));
          
          // Set job type dropdown values
          setJobTypeOption(data.job_type || '');
          setBpsOption(data.bps || '');
          setPrivateJobTypeOption(data.job_details || '');
          setOtherDetails(data.addjob_details || '');
          
          // Handle job type specific dropdowns
          if (data.job_type === 'Punjab Government' || data.job_type === 'Federal Government') {
            setShowBPSDropdown(true);
          } else if (data.job_type === 'Private Employee') {
            setShowPrivateJobTypeDropdown(true);
            if (data.job_details === 'Other') {
              setShowOtherTextInput(true);
            }
          }
          
          // Fetch declaration data using personal_id
          fetchDeclarationData(data.id);
        }
      } else {
        setDataExists(false);
      }
    } catch (error) {
      console.error('Error fetching personal data:', error);
      setDataExists(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch existing declaration data using personal_id
  const fetchDeclarationData = async (personalId) => {
    try {
      const response = await fetch(`https://wwh.punjab.gov.pk/api/getDdetail-check/${personalId}`);
      const result = await response.json();
      
      console.log('Declaration data API response:', result);
      
      if (result.success && result.data && result.data.length > 0) {
        const declarationData = result.data[0];
        setFormData(prev => ({
          ...prev,
          em_name: declarationData.em_name || '',
          designation: declarationData.designation || '',
          em_address: declarationData.em_address || '',
          em_email: declarationData.em_email || '',
          department: declarationData.department || '',
          em_mobile: declarationData.em_mobile || '',
        }));
        
        // Set declaration image if exists
        if (declarationData.declaration_url) {
          setCapturedImage(declarationData.declaration_url);
        }
      }
    } catch (error) {
      console.error('Error fetching declaration data:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({...formData, [name]: value});
  };

  const handleJobTypeChange = (item) => {
    setJobTypeOption(item.name);
    setFormData(prev => ({...prev, job_type: item.name}));
    
    if (item.name === 'Punjab Government' || item.name === 'Federal Government') {
      setShowBPSDropdown(true);
      setShowPrivateJobTypeDropdown(false);
      setShowOtherTextInput(false);
      setPrivateJobTypeOption(null);
      setOtherDetails('');
    } else if (item.name === 'Private Employee') {
      setShowPrivateJobTypeDropdown(true);
      setShowBPSDropdown(false);
      setBpsOption(null);
    } else {
      setShowBPSDropdown(false);
      setShowPrivateJobTypeDropdown(false);
      setShowOtherTextInput(false);
      setBpsOption(null);
      setPrivateJobTypeOption(null);
      setOtherDetails('');
    }
  };

  const handlePrivateJobTypeChange = (item) => {
    setPrivateJobTypeOption(item.value);
    setFormData(prev => ({...prev, private_job_type: item.value}));
    
    if (item.value === 'Other') {
      setShowOtherTextInput(true);
    } else {
      setShowOtherTextInput(false);
      setOtherDetails('');
    }
  };

  const handleJobRoutineChange = (value) => {
    setFormData(prev => ({...prev, job_routine: value}));
  };

  const handleUploadClick = attachmentName => {
    setSelectedAttachment(attachmentName);
    setModalVisible(true);
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

  // Validate form data
  const validateForm = () => {
    // Validate educational information
    if (!formData.education) {
      ToastAndroid.show('Please enter highest educational qualification.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.discipline) {
      ToastAndroid.show('Please enter discipline.', ToastAndroid.LONG);
      return false;
    }

    // Validate employment information
    if (!formData.em_name) {
      ToastAndroid.show('Please enter organization name.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.designation) {
      ToastAndroid.show('Please enter designation.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.em_address) {
      ToastAndroid.show('Please enter organization address.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.department) {
      ToastAndroid.show('Please enter department.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.jobheld) {
      ToastAndroid.show('Please enter post held.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.Job_joining) {
      ToastAndroid.show('Please enter tenure on present job.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.salary) {
      ToastAndroid.show('Please enter salary.', ToastAndroid.LONG);
      return false;
    }

    // Validate job type
    if (!jobTypeOption) {
      ToastAndroid.show('Please select job type.', ToastAndroid.LONG);
      return false;
    }

    if (showBPSDropdown && !bpsOption) {
      ToastAndroid.show('Please select BPS.', ToastAndroid.LONG);
      return false;
    }

    if (showPrivateJobTypeDropdown && !privateJobTypeOption) {
      ToastAndroid.show('Please select private job type.', ToastAndroid.LONG);
      return false;
    }

    if (showOtherTextInput && !otherDetails) {
      ToastAndroid.show('Please provide other job details.', ToastAndroid.LONG);
      return false;
    }

    // Validate duty hours
    if (!formData.starttimes || !formData.endtimes) {
      ToastAndroid.show('Please enter summer/day duty hours.', ToastAndroid.LONG);
      return false;
    }

    if (!formData.starttimew || !formData.endtimew) {
      ToastAndroid.show('Please enter winter/night duty hours.', ToastAndroid.LONG);
      return false;
    }

    return true;
  };

  // Update existing data
  const handleUpdate = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user?.id;

      if (!userId) {
        ToastAndroid.show('User not found. Please login again.', ToastAndroid.LONG);
        return;
      }

      // Update personal information (employment data)
      const personalResult = await updatePersonalInformation(userId);
      
      if (personalResult.success) {
        // Update declaration information
        const declarationResult = await updateDeclarationInformation(personalId);
        
        if (declarationResult.success) {
          ToastAndroid.show('Employment information saved successfully!', ToastAndroid.LONG);
        } else {
          ToastAndroid.show('Personal info updated but declaration info failed.', ToastAndroid.LONG);
        }
      } else {
        ToastAndroid.show('Failed to update employment information.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error updating forms:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  // Update personal information (employment data)
  const updatePersonalInformation = async (userId) => {
    const formDataToSend = new FormData();
    formDataToSend.append('user_id', userId);
    formDataToSend.append('education', formData.education || '');
    formDataToSend.append('discipline', formData.discipline || '');
    formDataToSend.append('sallary', formData.salary || '');
    formDataToSend.append('post_held', formData.jobheld || '');
    formDataToSend.append('job_joining', formData.Job_joining || '');
    formDataToSend.append('job_type', jobTypeOption || '');
    formDataToSend.append('bps', bpsOption || '');
    formDataToSend.append('job_details', privateJobTypeOption || '');
    formDataToSend.append('addjob_details', otherDetails || '');
    formDataToSend.append('job_routine', formData.job_routine || 'normal');
    formDataToSend.append('ss_time', formData.starttimes || '');
    formDataToSend.append('se_time', formData.endtimes || '');
    formDataToSend.append('ws_time', formData.starttimew || '');
    formDataToSend.append('we_time', formData.endtimew || '');

    console.log('Updating personal employment record...');
    try {
      const response = await fetch('https://wwh.punjab.gov.pk/api/personal', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Update Personal Employment API Response:', result);
      return result;
    } catch (error) {
      console.error('Error updating personal employment record:', error);
      return { success: false };
    }
  };

  // Update declaration information
  const updateDeclarationInformation = async (personalId) => {
    const declarationData = {
      personal_id: personalId,
      em_name: formData.em_name || '',
      designation: formData.designation || '',
      em_address: formData.em_address || '',
      em_email: formData.em_email || '',
      department: formData.department || '',
      em_mobile: formData.em_mobile || '',
    };

    console.log('Updating declaration data with personal_id:', personalId, declarationData);
    try {
      const response = await fetch('https://wwh.punjab.gov.pk/api/declaration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(declarationData),
      });

      const result = await response.json();
      console.log('Update Declaration API Response:', result);
      return result;
    } catch (error) {
      console.error('Error updating declaration data:', error);
      return { success: false };
    }
  };

  // Submit declaration information
  const submitDeclarationInformation = async (personalId) => {
    const declarationData = {
      personal_id: personalId,
      em_name: formData.em_name || '',
      designation: formData.designation || '',
      em_address: formData.em_address || '',
      em_email: formData.em_email || '',
      department: formData.department || '',
      em_mobile: formData.em_mobile || '',
    };

    console.log('Submitting declaration data with personal_id:', personalId, declarationData);
    try {
      const response = await fetch('https://wwh.punjab.gov.pk/api/declaration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(declarationData),
      });

      const result = await response.json();
      console.log('Declaration API Response:', result);
      return result;
    } catch (error) {
      console.error('Error submitting declaration data:', error);
      return { success: false };
    }
  };

  // Handle initial form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user?.id;

      if (!userId) {
        ToastAndroid.show('User not found. Please login again.', ToastAndroid.LONG);
        return;
      }

      // Update personal information (employment data)
      const personalResult = await updatePersonalInformation(userId);
      
      if (personalResult.success) {
        // Submit declaration information
        const declarationResult = await submitDeclarationInformation(personalId);
        
        if (declarationResult.success) {
          ToastAndroid.show('Employment information saved successfully!', ToastAndroid.LONG);
          setDataExists(true);
        } else {
          ToastAndroid.show('Personal info saved but declaration info failed.', ToastAndroid.LONG);
        }
      } else {
        ToastAndroid.show('Failed to save employment information.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error submitting forms:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  // Modified handleNextPress to handle navigation to Hostel screen
  const handleNextPress = async () => {
    // If data doesn't exist, validate and submit first
    if (!dataExists) {
      if (!validateForm()) {
        return;
      }

      try {
        setLoading(true);
        const user = JSON.parse(syncStorage.get('user'));
        const userId = user?.id;

        if (!userId) {
          ToastAndroid.show('User not found. Please login again.', ToastAndroid.LONG);
          return;
        }

        // Update personal information (employment data)
        const personalResult = await updatePersonalInformation(userId);
        
        if (personalResult.success) {
          // Submit declaration information
          const declarationResult = await submitDeclarationInformation(personalId);
          
          if (declarationResult.success) {
            ToastAndroid.show('Employment information saved successfully!', ToastAndroid.LONG);
            setDataExists(true);
            navigation.navigate('Hostel'); // Navigate to Hostel screen
          } else {
            ToastAndroid.show('Personal info saved but declaration info failed.', ToastAndroid.LONG);
          }
        } else {
          ToastAndroid.show('Failed to save employment information.', ToastAndroid.LONG);
        }
      } catch (error) {
        console.error('Error submitting forms:', error);
        ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
      } finally {
        setLoading(false);
      }
    } else {
      // If data exists, directly navigate to Hostel screen
      navigation.navigate('Hostel');
    }
  };

  // Handle back navigation
  const handleBackPress = () => {
    navigation.navigate('Personal');
  };

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Text style={styles.header}>Application Form</Text>
      <ProgressBar step={2} />

      {/* Educational Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Educational & Employment Details</Text>
       
 <Text style={styles.sectionHeader}>Educational Details</Text>
        <View style={styles.divider} />
         <View style={styles.divider} />
        <Text style={styles.text}>Highest Educational Qualification:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Highest Educational Qualification"
          placeholderTextColor="grey"
          value={formData.education}
          onChangeText={text => handleInputChange('education', text)}
        />
        
        <Text style={styles.text}>Discipline:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Discipline"
          placeholderTextColor="grey"
          value={formData.discipline}
          onChangeText={text => handleInputChange('discipline', text)}
        />
      </View>

      {/* Employment Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Employment Details</Text>
        <View style={styles.divider} />
 <View style={styles.divider} />
        <Text style={styles.text}>Name of Office/Organization/Department/Institute:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Organization Name"
          placeholderTextColor="grey"
          value={formData.em_name}
          onChangeText={text => handleInputChange('em_name', text)}
        />
        
        <Text style={styles.text}>Occupation/Designation:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Designation"
          placeholderTextColor="grey"
          value={formData.designation}
          onChangeText={text => handleInputChange('designation', text)}
        />
        
        <Text style={styles.text}>Organization Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Organization Address"
          placeholderTextColor="grey"
          value={formData.em_address}
          onChangeText={text => handleInputChange('em_address', text)}
        />
        
        <Text style={styles.text}>Official Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Official Email"
          placeholderTextColor="grey"
          value={formData.em_email}
          onChangeText={text => handleInputChange('em_email', text)}
          keyboardType="email-address"
        />
        
        <Text style={styles.text}>Office Contact Number (Landline):</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Landline Number"
          placeholderTextColor="grey"
          value={formData.department}
             maxLength={11}
          onChangeText={text => handleInputChange('department', text)}
          keyboardType="phone-pad"
        />
        
        <Text style={styles.text}>Office Contact Number (Mobile):</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Mobile Number"
          placeholderTextColor="grey"
             maxLength={11}
          value={formData.em_mobile}
          onChangeText={text => handleInputChange('em_mobile', text)}
          keyboardType="phone-pad"
        />
        
        <Text style={styles.text}>Net Salary (Rs):</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Salary"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.salary}
          onChangeText={text => handleInputChange('salary', text)}
        />
        
        <Text style={styles.text}>Tenure on Present Job:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Tenure"
          placeholderTextColor="grey"
          value={formData.Job_joining}
          onChangeText={text => handleInputChange('Job_joining', text)}
        />
        
        <Text style={styles.text}>Post Held:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Post Held"
          placeholderTextColor="grey"
          value={formData.jobheld}
          onChangeText={text => handleInputChange('jobheld', text)}
        />
      </View>

      {/* Job Type Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Job Type Details</Text>
        <View style={styles.divider} />

        <Text style={styles.text}>Job Type:</Text>
        <Dropdown
          style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          search
          searchPlaceholder="Search..."
          data={jobtype}
          labelField="name"
          valueField="name"
          placeholder="Select Job Type"
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          value={jobTypeOption}
          onChange={handleJobTypeChange}
        />

        {/* BPS Dropdown */}
        {showBPSDropdown && (
          <>
            <Text style={styles.text}>BPS:</Text>
            <Dropdown
              style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              itemTextStyle={styles.itemTextStyle}
              search
              searchPlaceholder="Search..."
              data={bpsOptions}
              labelField="name"
              valueField="id"
              placeholder="Select BPS"
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              value={bpsOption}
              onChange={(item) => setBpsOption(item.id)}
            />
          </>
        )}

        {/* Private Job Type Dropdown */}
        {showPrivateJobTypeDropdown && (
          <>
            <Text style={styles.text}>Private Job Type:</Text>
            <Dropdown
              style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              itemTextStyle={styles.itemTextStyle}
              search
              searchPlaceholder="Search..."
              data={privateJobTypeOptions}
              labelField="label"
              valueField="value"
              placeholder="Select Private Job Type"
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              value={privateJobTypeOption}
              onChange={handlePrivateJobTypeChange}
            />
          </>
        )}

        {/* Text Input for "Other" */}
        {showOtherTextInput && (
          <>
            <Text style={styles.text}>Other Job Details:</Text>
            <TextInput
              style={styles.input}
              placeholder="Please provide details"
              value={otherDetails}
              onChangeText={setOtherDetails}
            />
          </>
        )}
      </View>

      {/* Job Routine Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Job Routine & Duty Hours</Text>
        <View style={styles.divider} />

        <Text style={styles.text}>Job Routine:</Text>
        
        {/* Normal Option */}
        <TouchableOpacity
          style={[
            styles.radioContainer,
            formData.job_routine === 'normal' && styles.radioContainerSelected,
          ]}
          onPress={() => handleJobRoutineChange('normal')}
        >
          <View
            style={[
              styles.radioCircle,
              formData.job_routine === 'normal' && styles.radioCircleSelected,
            ]}
          />
          <Text style={styles.radioText}>Normal</Text>
        </TouchableOpacity>

        {/* In Shift Option */}
        <TouchableOpacity
          style={[
            styles.radioContainer,
            formData.job_routine === 'in_shift' && styles.radioContainerSelected,
          ]}
          onPress={() => handleJobRoutineChange('in_shift')}
        >
          <View
            style={[
              styles.radioCircle,
              formData.job_routine === 'in_shift' && styles.radioCircleSelected,
            ]}
          />
          <Text style={styles.radioText}>In Shift</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionHead, { marginTop: 10 }]}>
          {formData.job_routine === 'normal' ? 'Duty Hours in Summer' : 'Day Time Hours'}
        </Text>
        <View style={styles.divider} />

        <Text style={styles.text}>Start Time:</Text>
        <TouchableOpacity onPress={() => showTimePicker('starttimes')}>
          <TextInput
            style={styles.input}
            placeholder="Select Start Time"
            placeholderTextColor="grey"
            value={formData.starttimes}
            onChangeText={text => handleInputChange('starttimes', text)}
            editable={false}
          />
        </TouchableOpacity>

        <Text style={styles.text}>End Time:</Text>
        <TouchableOpacity onPress={() => showTimePicker('endtimes')}>
          <TextInput
            style={styles.input}
            placeholder="Select End Time"
            placeholderTextColor="grey"
            value={formData.endtimes}
            onChangeText={text => handleInputChange('endtimes', text)}
            editable={false}
          />
        </TouchableOpacity>

        <Text style={[styles.sectionHead, { marginTop: 10 }]}>
          {formData.job_routine === 'normal' ? 'Duty Hours in Winter' : 'Night Time Hours'}
        </Text>
        <View style={styles.divider} />

        <Text style={styles.text}>Start Time:</Text>
        <TouchableOpacity onPress={() => showTimePicker('starttimew')}>
          <TextInput
            style={styles.input}
            placeholder="Select Start Time"
            placeholderTextColor="grey"
            value={formData.starttimew}
            onChangeText={text => handleInputChange('starttimew', text)}
            editable={false}
          />
        </TouchableOpacity>

        <Text style={styles.text}>End Time:</Text>
        <TouchableOpacity onPress={() => showTimePicker('endtimew')}>
          <TextInput
            style={styles.input}
            placeholder="Select End Time"
            placeholderTextColor="grey"
            value={formData.endtimew}
            onChangeText={text => handleInputChange('endtimew', text)}
            editable={false}
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
      
      {/* Button Container */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={handleBackPress}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        
        {dataExists ? (
          // Show Update and Next buttons when data exists
          <>
            <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={handleUpdate}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNextPress}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Show Submit button when no data exists
          <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

// Styles (same as previous screen with minor adjustments)
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
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000',
    padding: 10,
    paddingTop: 30,
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
    justifyContent: 'center',
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
    justifyContent: 'space-around',
    marginTop: 20,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  backButton: {
    backgroundColor: '#6c757d', // Gray color for back
  },
  submitButton: {
    backgroundColor: '#28a745', // Green color for submit
  },
  updateButton: {
    backgroundColor: '#bcad80ff', // Yellow color for update
  },
  nextButton: {
    backgroundColor: '#1d4169ff', // Blue color for next
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
    marginTop: 10,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderWidth: 0.5,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  radioContainerSelected: {
    borderColor: 'gray',
    backgroundColor: '#D3D3D3',
  },
  radioCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#010048',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#010048',
    backgroundColor: '#010048',
  },
  radioText: {
    fontSize: 12,
    color: 'gray',
  },
});

export default Employment;