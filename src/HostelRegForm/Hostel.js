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
  Image,
} from 'react-native';
import Loader from '../components/Loader';
import {Dropdown} from 'react-native-element-dropdown';
import Icon from 'react-native-vector-icons/FontAwesome';
import ProgressBar from '../components/ProgressBar';
import {useNavigation} from '@react-navigation/native';
import {DatePickerInput} from 'react-native-paper-dates';
import syncStorage from 'react-native-sync-storage';

const Hostel = ({route, navigation}) => {
  const [personalId, setPersonalId] = useState(null);
  const [dataExists, setDataExists] = useState(false);
  
  // Main form data state
  const [formData, setFormData] = useState({
    applied_district: '',
    institute: '',
    applied_date: null,
    room_preference: '',
  });

  const [isFocus, setIsFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [districtOption, setDistrictOption] = useState(null);
  const [selectedInstitute, setSelectedInstitute] = useState(null);

  // Room preference options
  const roompreferenceOptions = [
    {id: 1, name: 'Single'},
    {id: 2, name: 'Double'},
    {id: 3, name: 'Triple'},
    {id: 4, name: 'Quad'},
    {id: 5, name: 'Sharing (5+)'},
  ];

  // Fetch user data on component mount
  useEffect(() => {
    const user = JSON.parse(syncStorage.get('user'));
    console.log('User from syncStorage:', user);

    if (user) {
      // Fetch existing personal data using user_id to get personal_id and hostel data
      fetchPersonalData(user.id);
    }
  }, []);

  // Fetch districts from hdistricts API
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const user = JSON.parse(syncStorage.get('user'));
        const userDistrictId = user?.district;

        // Fetch application districts from hdistricts API
        const applicationDistrictsResponse = await fetch('https://wwh.punjab.gov.pk/api/hdistricts');
        const applicationDistrictsData = await applicationDistrictsResponse.json();

        console.log('hdistricts API response:', applicationDistrictsData);

        if (applicationDistrictsData.districts && applicationDistrictsData.districts.length > 0) {
          // Use the districts directly from hdistricts API
          setDistricts(applicationDistrictsData.districts);
        } else {
          console.error('No districts found in hdistricts API');
          ToastAndroid.show('Failed to load districts. Please try again.', ToastAndroid.LONG);
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
        ToastAndroid.show('Error loading districts. Please try again.', ToastAndroid.LONG);
      }
    };

    fetchDistricts();
  }, []);

  // Fetch institutes when district is selected - FIXED VERSION
  useEffect(() => {
    if (districtOption) {
      console.log('Fetching institutes for district ID:', districtOption);
      fetch(`https://wwh.punjab.gov.pk/api/institutes/by-district/${districtOption}`)
        .then(response => response.json())
        .then(data => {
          console.log('Raw institutes API response:', data);
          
          // Handle different possible response structures
          let institutesData = [];
          
          if (data.districts && Array.isArray(data.districts)) {
            institutesData = data.districts;
          } else if (data.institutes && Array.isArray(data.institutes)) {
            institutesData = data.institutes;
          } else if (Array.isArray(data)) {
            institutesData = data;
          } else if (data.data && Array.isArray(data.data)) {
            institutesData = data.data;
          }
          
          console.log('Processed institutes data:', institutesData);
          
          if (institutesData.length > 0) {
            // Transform the data to ensure consistent structure
            const transformedInstitutes = institutesData.map(institute => ({
              id: institute.id || institute.institute_id,
              name: institute.name || institute.iname || institute.institute_name,
              // Include other fields if needed
              ...institute
            }));
            
            setInstitutes(transformedInstitutes);
          } else {
            console.log('No institutes found for this district');
            setInstitutes([]);
            ToastAndroid.show('No hostels found for selected district.', ToastAndroid.SHORT);
          }
        })
        .catch(error => {
          console.error('Error fetching institutes:', error);
          ToastAndroid.show('Error loading hostels. Please try again.', ToastAndroid.LONG);
          setInstitutes([]);
        });
    } else {
      setInstitutes([]);
      setSelectedInstitute(null);
    }
  }, [districtOption]);

  // Safe date formatting for API
  const formatDateForAPI = (dateValue) => {
    if (!dateValue) return null;
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return null;
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  };

  // Safe date formatting for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return undefined;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return undefined;
      return date;
    } catch (error) {
      console.error('Error parsing date for display:', error);
      return undefined;
    }
  };

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
          
          // Populate hostel data from personal table
          setFormData(prev => ({
            ...prev,
            applied_district: data.applied_district || '',
            institute: data.institute || '',
            applied_date: formatDateForDisplay(data.applied_date),
            room_preference: data.room_preference || '',
          }));
          
          // Set dropdown values
          setDistrictOption(data.applied_district || '');
          setSelectedInstitute(data.institute || '');
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

  const handleInputChange = (name, value) => {
    setFormData({...formData, [name]: value});
  };

  // Validate form data
  const validateForm = () => {
    if (!districtOption) {
      ToastAndroid.show('Please select a district.', ToastAndroid.LONG);
      return false;
    }
    if (!selectedInstitute) {
      ToastAndroid.show('Please select a hostel.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.applied_date) {
      ToastAndroid.show('Please select expected date of admission.', ToastAndroid.LONG);
      return false;
    }
    if (!formData.room_preference) {
      ToastAndroid.show('Please select room preference.', ToastAndroid.LONG);
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

      // Update personal information (hostel data)
      const result = await updatePersonalInformation(userId);
      
      if (result.success) {
        ToastAndroid.show('Hostel information updated successfully!', ToastAndroid.LONG);
      } else {
        ToastAndroid.show('Failed to update hostel information.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error updating form:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  // Update personal information (hostel data)
  const updatePersonalInformation = async (userId) => {
    const formDataToSend = new FormData();
    formDataToSend.append('user_id', userId);
    formDataToSend.append('applied_district', districtOption || '');
    formDataToSend.append('institute', selectedInstitute || '');
    formDataToSend.append('applied_date', formatDateForAPI(formData.applied_date));
    formDataToSend.append('room_preference', formData.room_preference || '');
    formDataToSend.append('chk', 1);

    console.log('Updating personal hostel record...');
    try {
      const response = await fetch('https://wwh.punjab.gov.pk/api/personal', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Update Personal Hostel API Response:', result);
      return result;
    } catch (error) {
      console.error('Error updating personal hostel record:', error);
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

      // Update personal information (hostel data)
      const result = await updatePersonalInformation(userId);
      
      if (result.success) {
        ToastAndroid.show('Hostel information saved successfully!', ToastAndroid.LONG);
        setDataExists(true);
      } else {
        ToastAndroid.show('Failed to save hostel information.', ToastAndroid.LONG);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  // Handle Next button - navigate to Declaration screen
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

        // Update personal information (hostel data)
        const result = await updatePersonalInformation(userId);
        
        if (result.success) {
          ToastAndroid.show('Hostel information saved successfully!', ToastAndroid.LONG);
          setDataExists(true);
          navigation.navigate('Declaration');
        } else {
          ToastAndroid.show('Failed to save hostel information.', ToastAndroid.LONG);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
      } finally {
        setLoading(false);
      }
    } else {
      // If data exists, directly navigate to Declaration screen
      navigation.navigate('CompletedFormA');
    }
  };

  // Handle back navigation
  const handleBackPress = () => {
    navigation.navigate('Employment');
  };

  return (
    <ScrollView contentContainerStyle={styles.screenContainer}>
      <Text style={styles.header}>Application Form</Text>
      <ProgressBar step={3} />

      {/* Accommodation Request Details */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Accommodation Request Details</Text>
        <View style={styles.divider} />

        <Text style={styles.text}>Choose District to Apply:</Text>
        <Dropdown
          style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          search
          searchPlaceholder="Search district..."
          data={districts}
          labelField="name"
          valueField="id"
          placeholder={districts.length === 0 ? "Loading districts..." : "Select District"}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          value={districtOption}
          onChange={item => {
            console.log('Selected district:', item);
            setDistrictOption(item.id);
            setSelectedInstitute(null); // Reset hostel when district changes
          }}
        />

        <Text style={styles.text}>Choose Hostel:</Text>
        <Dropdown
          style={[styles.input, isFocus && { borderColor: '#1E577C' }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          search
          searchPlaceholder="Search hostel..."
          data={institutes}
          labelField="name"
          valueField="id"
          placeholder={!districtOption ? "Select district first" : (institutes.length === 0 ? "Loading hostels..." : "Select Hostel")}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          value={selectedInstitute}
          onChange={item => {
            console.log('Selected hostel:', item);
            setSelectedInstitute(item.id);
          }}
          disabled={!districtOption}
        />

        <Text style={[styles.text, {marginTop: '5%'}]}>Expected Date of Admission:</Text>
        <TouchableOpacity style={styles.datePickerWrapper}>
          <DatePickerInput
            locale="en"
            label=""
            value={formData.applied_date}
            onChange={applied_date => setFormData(prev => ({...prev, applied_date}))}
            mode={'flat'}
            style={styles.calenderstyle}
          />
        </TouchableOpacity>

        <Text style={[styles.text, { marginTop: 20 }]}>Room Preference:</Text>
        <Dropdown
          style={[styles.input, isFocus && {borderColor: '#1E577C'}]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          itemTextStyle={styles.itemTextStyle}
          search
          searchPlaceholder="Search preference..."
          data={roompreferenceOptions}
          labelField="name"
          valueField="name"
          placeholder="Select Room Preference"
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          value={formData.room_preference}
          onChange={(item) => handleInputChange('room_preference', item.name)}
        />
      </View>

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
          // Show Save and Next buttons when no data exists
          <>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={handleNextPress}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

// Styles (keep the same as your original styles)
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
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#28a745',
  },
  updateButton: {
    backgroundColor: '#72602aff',
  },
  nextButton: {
    backgroundColor: '#0e2339ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  datePickerWrapper: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
    height: 40,
  },
  calenderstyle: {
    height: 50,
    backgroundColor: '#fff',
  },
});

export default Hostel;