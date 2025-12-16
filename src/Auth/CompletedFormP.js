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
  Alert,
} from 'react-native';
import Loader from '../components/Loader';
import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProgressBar from '../components/ProgressBar';
import {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
import syncStorage from 'react-native-sync-storage';
import DocumentPicker from 'react-native-document-picker';
import {launchCamera} from 'react-native-image-picker';

const CompletedFormP = ({route, navigation}) => {
  const { formG } = route.params || {};

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
  const [selectedOption, setSelectedOption] = useState(null); // For BPS
  const [districtOption, setDistrictOption] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

  const [bpsOption, setBpsOption] = useState(null);
  const [userName, setUserName] = useState('');
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTimeField, setSelectedTimeField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [jobTypeOption, setJobTypeOption] = useState(null); // For Job Type
  const jobtype = [
    {id: 1, name: 'Punjab Government'},
    {id: 2, name: 'Federal Government'},
    {id: 3, name: 'Private Employee'},
  
  ];

  const [options, setOptions] = useState([]);

  useEffect(() => {
    const newOptions = [];
    for (let i = 1; i <= 20; i++) {
      newOptions.push({id: i, name: `BPS-${i}`});
    }
    setOptions(newOptions);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(syncStorage.get('user'));
        const userId = user?.id;
        if (userId) {
          setLoading(true);
          const response = await fetch(`https://wwh.punjab.gov.pk/api/getPdetail-check/${userId}`);
          if (response.ok) {
            const result = await response.json();
            const data = result.data[0];

            // Set profile image
            const profileImageUrl = data.profile
              ? `https://wwh.punjab.gov.pk/uploads/image/${data.profile}`
              : null;
            setProfileImage(profileImageUrl);

            // Set form data
            setFormData({
              name: data.name || '',
              phone: data.phone_no || '',
              cnic: data.cnic || '',
              datee: data.expiry_date || '',
              dateb: data.dob || '',
              datei: data.issue_date || '',
              jobheld: data.post_held || '',
              serving: data.job_joining || '',
              jobStartDate: '',
              salary: data.sallary || '',
              address: data.paddress || '',
              mobile: data.mobile || '',
              disability: data.disability || '',
              applieddate: data.applied_date || '',
              placeofissue: data.Place_issue || '',
              starttimes: data.ss_time || '',
              endtimes: data.se_time || '',
              starttimew: data.ws_time || '',
              endtimew: data.we_time || '',
              jobtype: data.job_type || '',
              bps: data.bps || '',
              jobdetails: data.job_details || '',
              addjobdetails: data.addjob_details || '',
            });

            // Set dropdown values
            setSelectedInstitute(data.institute);
            setDistrictOption(data.applied_district);
          
          }
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
      }finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData({...formData, [name]: value});
  };

  
useEffect(() => {
  fetch('https://wwh.punjab.gov.pk/api/hdistricts')
    .then(response => response.json())
    .then(data => {
      setDistricts(data.districts);
    })
    .catch(error => {
      console.error('Error fetching districts:', error);
    });
}, []);

// Fetch institutes whenever a district is selected
useEffect(() => {
  if (districtOption) {
    fetch(`https://wwh.punjab.gov.pk/api/institutes/by-district/${districtOption}`)
      .then(response => response.json())
      .then(data => {
        setInstitutes(data.districts); // Adjust according to your API response structure
      })
      .catch(error => {
        console.error('Error fetching institutes:', error);
      });
  }
}, [districtOption]);
  


  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null; // Handle invalid dates
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const handleSavePress = async () => {
    try {
      // Retrieve user data from storage
      const user = JSON.parse(syncStorage.get('user'));
      const userId = user?.id;
  
      console.log('User ID:', userId);
  
      // Retrieve and check profile image URIs
      const newProfileImageUri = stateFunctions[selectedAttachment]?.URI;
      const existingProfileImageUri = profileImage;
      
      console.log('New Profile Image URI:', newProfileImageUri);
      console.log('Existing Profile Image URI:', existingProfileImageUri);
    
      if (!newProfileImageUri && !existingProfileImageUri) {
        ToastAndroid.show('Please capture or upload your profile image.', ToastAndroid.LONG);
        console.log('No profile image found. Exiting function.');
        return;
      }
    
      console.log('Preparing form data for submission...');
    
      // Function to format datesss
      const formatDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        if (isNaN(d.getTime())) return null; // Handle invalid dates
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
    
      // Format dates from formData
      const formattedDate = formatDate(formData.applieddate);
      const formattedDatee = formatDate(formData.datee);
      const formattedDatei = formatDate(formData.datei);
      const formattedDateb = formatDate(formData.dateb);
      const formattedserving = formatDate(formData.serving);
    
      console.log('Formatted Dates:', {
        appliedDate: formattedDate,
        expiryDate: formattedDatee,
        issueDate: formattedDatei,
        dob: formattedDateb,
        servingDate: formattedserving,
      });
    
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append('user_id', userId);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('paddress', formData.address);
      formDataToSend.append('phone_no', formData.phone);
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('cnic', formData.cnic);
      formDataToSend.append('expiry_date', formattedDatee);
      formDataToSend.append('issue_date', formattedDatei);
    
      formDataToSend.append('dob', formattedDateb);
      formDataToSend.append('disability', formData.disability);
      formDataToSend.append('disability_details', formData.disabilityDetails);
      formDataToSend.append('addjob_details', otherDetails); // Use otherDetails directly
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
      formDataToSend.append('job_details', privateJobTypeOption); 
      formDataToSend.append('bps', selectedOption);
  
      formDataToSend.append('job_routine', jobRoutine);
      formDataToSend.append('chk', 1);
    
      // Append profile image data if available
      if (newProfileImageUri) {
        formDataToSend.append('profile', {
          uri: newProfileImageUri,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      } else if (existingProfileImageUri) {
        formDataToSend.append('keep_existing_image', 'true'); // Flag to tell the backend to keep the existing image
      }
    
      console.log('FormData prepared:', formDataToSend);
    
      // Send data to API
      setLoading(true);
      const response = await fetch('https://wwh.punjab.gov.pk/api/personalinformation', {
        method: 'POST',
        body: formDataToSend,
      });
    
      console.log('API Response Status:', response.status);
      const result = await response.json();
    
      if (response.ok) {
        ToastAndroid.show('Form updated successfully!', ToastAndroid.LONG);
        setIsEditing(false);
      } else {
        ToastAndroid.show('Failed to submit the form. Please try again.', ToastAndroid.LONG);
        console.error('Failed to submit the form:', result.message || response.statusText);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
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
    Alert.alert(
      'Form Editable',
      'You can make changes as needed.',
      [{ text: 'OK' }]
    );
  }; 
  
  const showDatePicker = (field) => {
    DateTimePickerAndroid.open({
      mode: 'date',
      value: new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          const date = selectedDate.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
          setFormData((prevData) => ({ ...prevData, [field]: date }));
        }
      },
    });
  };
  

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


  useEffect(() => {
    console.log('Received formG:', route.params?.formG);
  }, [route.params]);
  
  const handleNextPress = () => {
    if (route.params?.formG) {

      navigation.navigate('FormG', { formG: route.params.formG });
    } else {
      console.log('route.params.formG not found. Navigating to CompletedFormG');
      navigation.navigate('CompletedFormG');
    }
  };
  
    const [showDisabilityDetailsInput, setShowDisabilityDetailsInput] = useState(false);
  
    const yesNoOptions = [
      { label: 'Yes', value: 'Yes' },
      { label: 'No', value: 'No' },
    ];
  
    const handledisabilityInputChange = (field, value) => {
      setFormData({ ...formData, [field]: value });
      if (field === 'disability' && value === 'Yes') {
        setShowDisabilityDetailsInput(true); // Show text input for "Yes"
      } else if (field === 'disability' && value === 'No') {
        setShowDisabilityDetailsInput(false); // Hide text input for "No"
        setFormData((prevData) => ({ ...prevData, disabilityDetails: '' })); // Clear the details field
      }
    };
     
    const privateJobTypeOptions = [
      { label: 'Adhoc', value: 'Adhoc' },
      { label: 'Government Contract', value: 'Government Contract' },
      { label: 'Private Contract', value: 'Private Contract' },
      { label: 'Daily Wages', value: 'Daily Wages' },
      { label: 'Other', value: 'Other' },
    ];
  
    const [showPrivateJobTypeDropdown, setShowPrivateJobTypeDropdown] = useState(false);
    const [privateJobTypeOption, setPrivateJobTypeOption] = useState(null);
    const [showOtherTextInput, setShowOtherTextInput] = useState(false);
    const [otherDetails, setOtherDetails] = useState('');
    const [jobRoutine, setJobRoutine] = useState('normal'); // Default value
   const [showBPSDropdown, setShowBPSDropdown] = useState(false);
    const handleJobRoutineChange = (value) => {
      setJobRoutine(value);
    };
  
  return (
    <View>
        <ScrollView
        contentContainerStyle={styles.screenContainer}
        showsVerticalScrollIndicator={false} // Hide scrollbar
      >
      <Text style={styles.header}>Profile</Text>
      <ProgressBar step={4} />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Personal Information</Text>
        <View style={styles.divider} />

        {!capturedImage && !stateFunctions[selectedAttachment]?.URI && profileImage ? (
          <TouchableOpacity onPress={isEditing ? handleUploadClick : null} style={styles.imageContainer}>
            <Image
              source={{
                uri: profileImage,
              }}
              style={styles.image}
            />
          </TouchableOpacity>
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
        {isEditing ? (
        <TouchableOpacity
    

          onPress={() => navigation.navigate('Edit', { name: formData.name })}
        >
          <TextInput
              style={styles.input}
            value={formData.name}
            editable={false}
           placeholderTextColor="grey"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
        value={formData.name}
      
        editable= {false} 
        style={styles.input}
      />
      )}
      

        <Text style={styles.text}>Permanent Address:</Text>
        {isEditing ? (
        <TouchableOpacity
    

          onPress={() => navigation.navigate('Edit', { paddress: formData.address })}
        >
          <TextInput
              style={styles.input}
            value={formData.address}
            editable={false}
           placeholderTextColor="grey"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
        style={styles.input}
        editable= {false} 
        placeholderTextColor="grey"
        value={formData.address}
      
      />
      )}
      
        

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
     <Text style={styles.text}>Choose District to Apply</Text>
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
          onChange={item => setDistrictOption(item.id)} // Update selected district
          editable={isEditing}
        />
      </View>

      <Text style={styles.text}>Choose Institute</Text>
      <View>
        <Dropdown
          style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          search
          searchPlaceholder="Search..."
          data={institutes} // Fetched institutes
          labelField="iname" // Adjust according to your API response
          valueField="id"
          placeholder="Select an option"
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          value={selectedInstitute}
          onChange={item => setSelectedInstitute(item.id)} // Update selected institute
          editable={isEditing}
        />

      </View>
        <Text style={[styles.text, { marginTop: '5%' }]}>Applied Date:</Text>
<TouchableOpacity onPress={() => isEditing && showDatePicker('applieddate')}>
  <TextInput
    style={styles.input}
    placeholder="Enter applied date"
    placeholderTextColor="grey"
    value={formData.applieddate}
    onChangeText={(text) => handleInputChange('applieddate', text)}
    editable={false} // Prevent direct typing, use date picker instead
  />
</TouchableOpacity>
</View>
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>CNIC Information</Text>
        <View style={styles.divider} />
        <Text style={styles.text}>CNIC:</Text>
        {isEditing ? (
        <TouchableOpacity
    

          onPress={() => navigation.navigate('Edit', { cnic: formData.cnic })}
        >
          <TextInput
              style={styles.input}
            value={formData.cnic}
            editable={false}
           placeholderTextColor="grey"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
        style={styles.input}
           maxLength={11}
          placeholderTextColor="grey"
       
          value={formData.cnic}
          editable={false}
        />
      )}

<Text style={[styles.text, { marginTop: '5%' }]}>Date of Expiry:</Text>
{isEditing ? (
        <TouchableOpacity
    

          onPress={() => navigation.navigate('Edit', { expiry_date: formData.datee })}
        >
          <TextInput
              style={styles.input}
            value={formData.datee}
            editable={false}
           placeholderTextColor="grey"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
        style={styles.input}
        editable= {false} 
        placeholderTextColor="grey"
        value={formData.datee}
      
      />
      )}

       
       

        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Birth:</Text>
        {isEditing ? (
        <TouchableOpacity
    

          onPress={() => navigation.navigate('Edit', { dob: formData.dateb })}
        >
          <TextInput
              style={styles.input}
            value={formData.dateb}
            editable={false}
           placeholderTextColor="grey"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
        style={styles.input}
        editable= {false} 
        placeholderTextColor="grey"
        value={formData.dateb}
      
      />
      )}

       
       

        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Issue:</Text>
        {isEditing ? (
        <TouchableOpacity
    

          onPress={() => navigation.navigate('Edit', { issue_date: formData.datei })}
        >
          <TextInput
              style={styles.input}
            value={formData.datei}
            editable={false}
           placeholderTextColor="grey"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
        style={styles.input}
        editable= {false} 
        placeholderTextColor="grey"
        value={formData.datei}
      
      />
      )}

       
     

        <Text style={[styles.text, {marginTop: '10%'}]}>Place of Issue:</Text>
        {isEditing ? (
        <TouchableOpacity
    

          onPress={() => navigation.navigate('Edit', { Place_issue: formData.placeofissue })}
        >
          <TextInput
              style={styles.input}
            value={formData.placeofissue}
            editable={false}
           placeholderTextColor="grey"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
        style={styles.input}
        editable= {false} 
        placeholderTextColor="grey"
        value={formData.placeofissue}
      
      />
      )}

      
        <Text style={[styles.text, {marginTop: 20}]}>
          Any Physical Disability:
        </Text>
        {isEditing ? (
        <TouchableOpacity
    

          onPress={() => navigation.navigate('EditDis', { disability: formData.disability })}
        >
          <TextInput
              style={styles.input}
            value={formData.disability}
            editable={false}
           placeholderTextColor="grey"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
        style={styles.input}
           maxLength={11}
          placeholderTextColor="grey"
              placeholder="Enter mobile Number"
          value={formData.disability}
          editable={false}
        />
      )}

         {/* Conditional text input for details */}
   {/* Conditional text input for details */}
{formData.disability.toLowerCase() === 'yes' && (
  <>
    <Text style={[styles.text, { marginTop: 20 }]}> 
      Please provide details:
    </Text>
    <TextInput
      style={styles.input}
      placeholder="Enter details about the disability"
      value={formData.disabilityDetails}
      onChangeText={(text) => handleInputChange('disabilityDetails', text)}
    />
  </>
)}


      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Job Information</Text>
        <View style={styles.divider} />
        <Text style={styles.text}>Post Held:</Text>
        {isEditing ? (
        <TouchableOpacity
    

          onPress={() => navigation.navigate('EditAppointment', { post_held: formData.jobheld })}
        >
          <TextInput
              style={styles.input}
            value={formData.jobheld}
            editable={false}
           placeholderTextColor="grey"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
        style={styles.input}
        editable= {false} 
        placeholderTextColor="grey"
        value={formData.jobheld}
      
      />
      )}
     

        <Text style={styles.text}>Since When Serving on Current Job:</Text>
        {isEditing ? (
        <TouchableOpacity
    

          onPress={() => navigation.navigate('EditAppointment', { job_joining: formData.serving })}
        >
          <TextInput
              style={styles.input}
            value={formData.serving}
            editable={false}
           placeholderTextColor="grey"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
        style={styles.input}
        editable= {false} 
        placeholderTextColor="grey"
        value={formData.serving}
      
      />
      )}
       
    
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
{isEditing ? (
        <TouchableOpacity
    

          onPress={() => navigation.navigate('EditAppointment', { job_type: formData.jobtype })}
        >
          <TextInput
              style={styles.input}
            value={formData.jobtype}
            editable={false}
           placeholderTextColor="grey"
          />
        </TouchableOpacity>
      ) : (
        <TextInput
        style={styles.input}
        editable= {false} 
        placeholderTextColor="grey"
        value={formData.jobtype}
      
      />
      )}
 {formData.bps && (
  <>
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
        </>
      )}
  {formData.jobdetails !== null && formData.jobdetails !== undefined && (
  <>
    <Text style={styles.text}>Additional Private Options</Text>
    {isEditing ? (
      <TouchableOpacity
        onPress={() => navigation.navigate('EditAppointment', { job_details: formData.jobdetails })}
      >
        <TextInput
          style={styles.input}
          value={formData.jobdetails}
          editable={false}
          placeholderTextColor="grey"
        />
      </TouchableOpacity>
    ) : (
      <TextInput
        style={styles.input}
        editable={false}
        placeholderTextColor="grey"
        value={formData.jobdetails}
      />
    )}
  </>
)}

   {formData.addjobdetails && (
  <>
    <Text style={styles.text}>Other Details</Text>
    {isEditing ? (
      <TouchableOpacity
        onPress={() => navigation.navigate('EditAppointment', { addjob_details: formData.addjobdetails })}
      >
        <TextInput
          style={styles.input}
          value={formData.addjobdetails}
          editable={false}
          placeholderTextColor="grey"
        />
      </TouchableOpacity>
    ) : (
      <TextInput
        style={styles.input}
        editable={false}
        placeholderTextColor="grey"
        value={formData.addjobdetails}
      />
    )}
  </>
)}

        {/* <Text style={styles.text}>Job Type</Text>
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
            valueField="name"
            placeholder="Select an option"
            onFocus={() => setIsFocus(true)}
            value={jobTypeOption}
            onChange={item => setJobTypeOption(item.name)}
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
        </View> */}
    <Text style={[styles.text, { marginBottom: 10 }]}>Job Routine:</Text>
    
    {/* Normal Option */}
    <TouchableOpacity
      style={[
        styles.radioContainer,
        jobRoutine === 'normal' && styles.radioContainerSelected,
      ]}
      onPress={() => handleJobRoutineChange('normal')}
    >
      <View
        style={[
          styles.radioCircle,
          jobRoutine === 'normal' && styles.radioCircleSelected,
        ]}
      />
      <Text style={styles.radioText}>Normal</Text>
    </TouchableOpacity>
    
    {/* In Shift Option */}
    <TouchableOpacity
      style={[
        styles.radioContainer,
        jobRoutine === 'in_shift' && styles.radioContainerSelected,
      ]}
      onPress={() => handleJobRoutineChange('in_shift')}
    >
      <View
        style={[
          styles.radioCircle,
          jobRoutine === 'in_shift' && styles.radioCircleSelected,
        ]}
      />
      <Text style={styles.radioText}>In Shift</Text>
    </TouchableOpacity>
      <Text style={[styles.sectionHead, { marginTop: 10 }]}>
      {jobRoutine === 'normal' ? 'Duty Hours in Summer' : 'Day Time Hours'}
      </Text>

    
  <View style={styles.divider} />

  <Text style={styles.textt}>Start Time:</Text>
      <TouchableOpacity onPress={() => isEditing && showTimePicker('starttimes')}>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.starttimes}
          onChangeText={text => handleInputChange('starttimes', text)}
          editable={false} // Prevent direct typing, use time picker instead
        />
      </TouchableOpacity>

      <Text style={styles.textt}>End Time:</Text>
      <TouchableOpacity onPress={() => isEditing && showTimePicker('endtimes')}>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.endtimes}
          onChangeText={text => handleInputChange('endtimes', text)}
          editable={false} // Prevent direct typing, use time picker instead
        />
      </TouchableOpacity>

      <Text style={[styles.sectionHead, { marginTop: 10 }]}>
         {jobRoutine === 'normal' ? 'Duty Hours in Winter' : 'Night Time Hours'}
       </Text>
      <View style={styles.divider} />

      <Text style={styles.textt}>Start Time:</Text>
      <TouchableOpacity onPress={() => isEditing && showTimePicker('starttimew')}>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.starttimew}
          onChangeText={text => handleInputChange('starttimew', text)}
          editable={false} // Prevent direct typing, use time picker instead
        />
      </TouchableOpacity>

      <Text style={styles.textt}>End Time:</Text>
      <TouchableOpacity onPress={() => isEditing && showTimePicker('endtimew')}>
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.endtimew}
          onChangeText={text => handleInputChange('endtimew', text)}
          editable={false} // Prevent direct typing, use time picker instead
        />
      </TouchableOpacity>
    </View>
    <View style={styles.buttonContainerN}>
    <TouchableOpacity 
    style={styles.buttonN} 
    onPress={handleNextPress}
  >
  <Text style={styles.buttonTextN}>Next</Text>
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
   
    </ScrollView>
    <View style={styles.footer}>
  <View style={styles.buttonContainer}>
    <TouchableOpacity 
      style={styles.button} 
      onPress={isEditing ? handleSavePress : handleEditPress}
    >
      <Icon 
        name={isEditing ? 'save' : 'pencil'} 
        size={20} 
        color="#fff" 
      />
    </TouchableOpacity>
    <Text style={styles.buttonText}>
      {isEditing ? 'Save' : 'Edit'}
    </Text>
  </View>
</View>

  
     </View>
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
    color: '#010048',
    textAlign: 'center',
    marginBottom: 10,
   
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
    bottom: '5%', // Adjust as needed to fit the design
    right: '5%',  // Adjust as needed to fit the design
    zIndex: 1000, // Ensures it appears above other components
  },
  buttonContainer: {
    alignItems: 'center', // Centers the button and text horizontally
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#010048',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#010048',
    marginTop: 3, // Spacing between button and text
    fontSize: 12, // Font size for better readability
    textAlign: 'center', // Center text below the button
    fontStyle: 'italic', // Italicize the text
  },
  buttonContainerN: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonN: {
    backgroundColor: '#010048',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 5,
  },
  buttonTextN: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
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

export default CompletedFormP;
