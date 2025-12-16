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
import Loader from '../components/Loader'; // Import the custom Loader component
import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProgressBar from '../components/ProgressBar';
import {useNavigation} from '@react-navigation/native';
import {DatePickerInput} from 'react-native-paper-dates';
import syncStorage from 'react-native-sync-storage';
import DocumentPicker from 'react-native-document-picker';
import {launchCamera} from 'react-native-image-picker';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
const FormP = ({route, navigation}) => {
  const [showBPSDropdown, setShowBPSDropdown] = useState(false);
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
    disabilityDetails: '',
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
  const [selectedOption, setSelectedOption] = useState(0); // Default to 0
  const [districtOption, setDistrictOption] = useState(null); // For District dropdown
  const [institutes, setInstitutes] = useState([]); // Holds the list of institutes
  const [selectedInstitute, setSelectedInstitute] = useState(null); // Holds the selected institute
  const [jobTypeOption, setJobTypeOption] = useState(null); // For Job Type dropdown
  const [bpsOption, setBpsOption] = useState(null); // For BPS dropdown
  const [userName, setUserName] = useState('');
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [selectedTimeField, setSelectedTimeField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [placesOfIssue, setPlacesOfIssue] = useState([]); // Updated state name
  const [selectedplaceoi, setselectedplaceoi] = useState([]);
    // Fetch places of issue when the component mounts
    useEffect(() => {
      fetch('https://wwh.punjab.gov.pk/api/districts')
        .then(response => response.json())
        .then(data => {
          setPlacesOfIssue(data.districts); // Assuming 'districts' is the correct key in the response
        })
        .catch(error => {
          console.error('Error fetching places of issue:', error);
        });
    }, []);


  useEffect(() => {
    // Fetch user data from syncStorage
    const user = JSON.parse(syncStorage.get('user'));
    console.log('User from syncStorage:', user);

    // Set the form data using the user data from syncStorage
    setFormData({
      name: user.name || '',
      cnic: user.cnic || '',
      email: user.email || '',
      phone: user.phone_no || '',
    });
  }, []);

  // useEffect(() => {
  //   fetch('https://5ea8-202-142-167-226.ngrok-free.app/api/districts')
  //     .then(response => response.json())
  //     .then(data => {
  //       setPlaceoi(data.placeoi); // Assuming 'placeoi' is the correct key in the response
  //     })
  //     .catch(error => {
  //       console.error('Error fetching districts:', error);
  //     });
  // }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        // Retrieve user's district ID from syncStorage
        const user = JSON.parse(syncStorage.get('user'));
        const userDistrictId = user?.district; // User's home district ID
  
        // Fetch all districts to map the user's district ID to its name
        const allDistrictsResponse = await fetch('https://wwh.punjab.gov.pk/api/districts');
        const allDistrictsData = await allDistrictsResponse.json();
  
        // Find the user's home district name
        const userDistrict = allDistrictsData.districts.find(
          district => district.id === userDistrictId
        )?.name;
  
        if (!userDistrict) {
          console.error('User district not found in all districts.');
          return;
        }
  
        // Fetch application districts
        const applicationDistrictsResponse = await fetch('https://wwh.punjab.gov.pk/api/hdistricts');
        const applicationDistrictsData = await applicationDistrictsResponse.json();
  
        // Filter out the user's home district from application districts
        const filteredDistricts = applicationDistrictsData.districts.filter(
          district => district.name !== userDistrict
        );
  
        // Set the filtered districts for the dropdown
        setDistricts(filteredDistricts);
      } catch (error) {
        console.error('Error fetching or filtering districts:', error);
      }
    };
  
    fetchDistricts();
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
  const handleNextPress = async () => {
    // Validate form data
    if (!capturedImage && !stateFunctions[selectedAttachment]?.URI) {
      ToastAndroid.show('Please capture or upload your profile image.', ToastAndroid.LONG);
      return;
    }
    if (!formData.name) {
      ToastAndroid.show('Please enter your name.', ToastAndroid.LONG);
      return;
    }
    if (!formData.address) {
      ToastAndroid.show('Please enter your address.', ToastAndroid.LONG);
      return;
    }
    if (!formData.phone || formData.phone.length !== 11) {
      ToastAndroid.show('Please enter a valid 11-digit phone number.', ToastAndroid.LONG);
      return;
    }
    if (!formData.mobile || formData.mobile.length !== 11) {
      ToastAndroid.show('Please enter a valid 11-digit mobile number.', ToastAndroid.LONG);
      return;
    }
    if (!districtOption) {
      ToastAndroid.show('Please select a district.', ToastAndroid.LONG);
      return;
    }
    if (!selectedInstitute) {
      ToastAndroid.show('Please select an institute.', ToastAndroid.LONG);
      return;
    }
    if (!formData.applieddate) {
      ToastAndroid.show('Please select the date of application.', ToastAndroid.LONG);
      return;
    }
    if (!formData.cnic.trim() || formData.cnic.length !== 13) {
      ToastAndroid.show('Please enter a valid 13-digit CNIC number.', ToastAndroid.LONG);
      return;
    }
    if (!formData.datee) {
      ToastAndroid.show('Please select the date of expiry.', ToastAndroid.LONG);
      return;
    }
    if (!formData.dateb) {
      ToastAndroid.show('Please select your date of birth.', ToastAndroid.LONG);
      return;
    }
    if (!formData.datei) {
      ToastAndroid.show('Please select the date of issue.', ToastAndroid.LONG);
      return;
    }
    if (!formData.disability) {
      ToastAndroid.show('Please enter any disability (if you have).', ToastAndroid.LONG);
      return;
    }
    if (!formData.jobheld) {
      ToastAndroid.show('Please enter the post you currently hold.', ToastAndroid.LONG);
      return;
    }
    if (!formData.serving) {
      ToastAndroid.show('Please enter the duration you have been serving in your current job.', ToastAndroid.LONG);
      return;
    }

    if (!formData.salary || isNaN(formData.salary)) {
      ToastAndroid.show('Please enter a valid salary.', ToastAndroid.LONG);
      return;
    }
    if (!selectedplaceoi) {
      ToastAndroid.show('Please select the CNIC issue place..', ToastAndroid.LONG);
      return;
    }
    if (!jobTypeOption) {
      ToastAndroid.show('Please select a job type.', ToastAndroid.LONG);
      return;
    }
    // if (!bpsOption) {
    //   ToastAndroid.show('Please select your BPS.', ToastAndroid.LONG);
    //   return;
    // }
    if (!formData.starttimes) {
      ToastAndroid.show('Please enter the start time for summer duty.', ToastAndroid.LONG);
      return;
    }
    if (!formData.endtimes) {
      ToastAndroid.show('Please enter the end time for summer duty.', ToastAndroid.LONG);
      return;
    }
    if (!formData.starttimew) {
      ToastAndroid.show('Please enter the start time for winter duty.', ToastAndroid.LONG);
      return;
    }
    if (!formData.endtimew) {
      ToastAndroid.show('Please enter the end time for winter duty.', ToastAndroid.LONG);
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
  
    const formattedDate = formatDate(formData.applieddate);
    const formattedDatee = formatDate(formData.datee);
    const formattedDatei = formatDate(formData.datei);
    const formattedDateb = formatDate(formData.dateb);
    const formattedserving = formatDate(formData.serving);
    const user = JSON.parse(syncStorage.get('user'));
    const userId = user?.id;
  
    // Prepare FormData for submission
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
    formDataToSend.append('Place_issue', selectedplaceoi);
    formDataToSend.append('job_routine', jobRoutine);
    formDataToSend.append('chk', 1);
    // Append profile image if exists
    if (stateFunctions[selectedAttachment]?.URI) {
      formDataToSend.append('profile', {
        uri: stateFunctions[selectedAttachment]?.URI,
        type: 'image/jpeg', // adjust type based on your file
        name: 'profile.jpg', // name of the file
      });
    }
  
    // Log the data being sent
    console.log('Data to be sent:', formDataToSend);
  
    try {
      setLoading(true); // Show loader
      const response = await fetch('https://wwh.punjab.gov.pk/api/personalinformation', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      
      // Log the server response
      console.log('Server response:', result);

      if (response.ok) {
        ToastAndroid.show('Personal Details saved successfully!', ToastAndroid.LONG);
        navigation.navigate('FormG');
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


  const jobtype = [
    {id: 1, name: 'Punjab Government'},
    {id: 2, name: 'Federal Government'},
    {id: 3, name: 'Private Employee'},
  ];
  const [options, setOptions] = useState([]);

  // Initialize options with BPS-1 to BPS-20
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
      is24Hour: false,  // Set this to false to use 12-hour format with AM/PM
      value: new Date(),
      onChange: (event, selectedDate) => {
        if (event.type === "set" && selectedDate) {
          const time = selectedDate.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,  // This enables AM/PM format
          });
          setFormData((prevData) => ({ ...prevData, [field]: time }));
        }
      },
    });
  };
  
  // Handle time change
  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || formData[selectedTimeField];
    setTimePickerVisible(Platform.OS === 'ios');
    setFormData({
      ...formData,
      [selectedTimeField]: currentTime.toLocaleTimeString(),
    });
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

  const handleJobRoutineChange = (value) => {
    setJobRoutine(value);
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
          maxLength={11}
          placeholderTextColor="grey"
          value={formData.mobile}
          onChangeText={text => handleInputChange('mobile', text)}
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
    data={districts} // Filtered districts
    labelField="name"
    valueField="id"
    placeholder="Select an option"
    onFocus={() => setIsFocus(true)}
    onBlur={() => setIsFocus(false)}
    value={districtOption}
    onChange={item => setDistrictOption(item.id)} // Update selected district
  />
</View>



      <Text style={styles.text}>Choose Hostel</Text>
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
        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Birth (As per CNIC):</Text>
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
        <Text style={[styles.text, {marginTop: '10%'}]}>Place of Issue:</Text>
        <View>
        <Dropdown
          style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          search
          searchPlaceholder="Search..."
          data={placesOfIssue}
          labelField="name"
          valueField="name"
          placeholder="Select an option"
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          value={selectedplaceoi}
          onChange={item => setselectedplaceoi(item.name)} // Update selected district
        />
      </View> 

        <Text style={[styles.text, {marginTop: 20}]}>
          Any Physical Disability:
        </Text>
        <Dropdown
        style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        inputSearchStyle={styles.inputSearchStyle}
        itemTextStyle={styles.itemTextStyle}
        data={yesNoOptions}
        labelField="label"
        valueField="value"
        placeholder="Select Yes or No"
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        value={formData.disability}
        onChange={(item) => handledisabilityInputChange('disability', item.value)}
      />

      {/* Conditional text input for details */}
      {showDisabilityDetailsInput && (
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
        placeholder="Select an option"
        onFocus={() => setIsFocus(true)}
        value={jobTypeOption}
        onChange={(item) => {
          setJobTypeOption(item.name);

          if (item.name === 'Punjab Government' || item.name === 'Federal Government') {
            setShowBPSDropdown(true);
            setShowPrivateJobTypeDropdown(false);
          } else if (item.name === 'Private Employee') {
            setShowPrivateJobTypeDropdown(true);
            setShowBPSDropdown(false);
          } else {
            setShowBPSDropdown(false);
            setShowPrivateJobTypeDropdown(false);
            setSelectedOption(0);
          }
        }}
      />

      {/* BPS Dropdown */}
      {showBPSDropdown && (
        <>
          <Text style={styles.text}>BPS</Text>
          <Dropdown
            style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
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
            onChange={(item) => setSelectedOption(item.id)}
          />
        </>
      )}

      {/* Private Job Type Dropdown */}
      {showPrivateJobTypeDropdown && (
        <>
          <Text style={styles.text}>Select additional Private options</Text>
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
            placeholder="Select an option"
            onFocus={() => setIsFocus(true)}
            value={privateJobTypeOption}
            onChange={(item) => {
              setPrivateJobTypeOption(item.value);
              setShowOtherTextInput(item.value === 'Other');
            }}
          />
        </>
      )}

      {/* Text Input for "Other" */}
      {showOtherTextInput && (
        <>
          <Text style={styles.text}>Please provide details:</Text>
          <TextInput
            style={styles.input}
            placeholder="Please provide details"
            value={otherDetails}
            onChangeText={(text) => setOtherDetails(text)}
         
          />
        </>
      )}
    </View>
    
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
  <TouchableOpacity onPress={() => showTimePicker('starttimes')}>
    <TextInput
      style={styles.input}
      placeholder="Enter Time"
      keyboardType="numeric"
      placeholderTextColor="grey"
      value={formData.starttimes}
      onChangeText={text => handleInputChange('starttimes', text)}
      editable={false}  // To prevent direct typing, use time picker instead
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
      editable={false}
    />
  </TouchableOpacity>

 

  <Text style={[styles.sectionHead, { marginTop: 10 }]}>
    {jobRoutine === 'normal' ? 'Duty Hours in Winter' : 'Night Time Hours'}
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
      editable={false}
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

export default FormP;
