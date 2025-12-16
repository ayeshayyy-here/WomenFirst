import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, SafeAreaView, ScrollView, ActivityIndicator, TextInput , Dropdown, TouchableOpacity, Modal, Animated, TouchableWithoutFeedback,
  PanResponder, Dimensions, ToastAndroid} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../components/Loader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
const { height } = Dimensions.get('window');
// Main Profile Screen
const ProfileP = ({ route, navigation }) => {
    const { item } = route.params;

    const [profileImage, setProfileImage] = useState(null);
    const [personalFormData, setPersonalFormData] = useState({});
    const [guardianFormData, setGuardianFormData] = useState({});
    const [attachmentData, setAttachmentData] = useState({});
    const [declarationFormData, setDeclarationFormData] = useState({});
    const [declarationImage, setDeclarationImage] = useState(null);
   
  
    
    useEffect(() => {
        const fetchPersonalData = async () => {
            try {
                const response = await fetch(`https://wwh.punjab.gov.pk/api/getPdetail-check/${item.user_id}`);
                if (response.ok) {
                    const result = await response.json();
                    const data = result.data[0];
                    const profileImageUrl = data.profile
                        ? `https://wwh.punjab.gov.pk/uploads/image/${data.profile}`
                        : null;
                    setProfileImage(profileImageUrl);
                    setPersonalFormData({
                      name: data.name || '',
                      phone: data.phone_no || '',
                      cnic: data.cnic || '',
                      dob: data.dob || '',
                      address: data.paddress || '',
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
                      bps: data.bps || '',
                      district: data.applied_district || '',
                      bps: data.bps || '',
                      district: data.applied_district || '',
                        // Other fields...
                    });
                } else {
                    console.error('Failed to fetch personal data');
                }
            } catch (error) {
                console.error('Error fetching personal data:', error);
            }
        };
    
        fetchPersonalData();
    }, [item.user_id]);
    
    useEffect(() => {
        const fetchGuardianData = async () => {
            try {
                const response = await fetch(`https://wwh.punjab.gov.pk/api/getGdetail-check/${item.id}`);
                if (response.ok) {
                    const result = await response.json();
                    const data = result.data[0];
                    setGuardianFormData({
                      gname: data.gname || '',
                      address: data.gaddress || '',
                      gmobile: data.gmobile || '',
                      relationship: data.relationship || '',
                      email: data.gemail || '',
                      occupation: data.goccupation || '',
                      relationship: data.relationship || '',
                      ename: data.ename || '',
                      erelationship: data.erelationship || '',
                      eaddress: data.eaddress || '',
                      emobile: data.emobile || '',
                    });
                } else {
                    console.error('Failed to fetch guardian data');
                }
            } catch (error) {
                console.error('Error fetching guardian data:', error);
            }
        };
    
        fetchGuardianData();
    }, [item.id]);
    
    useEffect(() => {
        const fetchAttachmentData = async () => {
            try {
                const response = await fetch(`https://wwh.punjab.gov.pk/api/getAdetail-check/${item.id}`);
                if (response.ok) {
                    const result = await response.json();
                    const data = result.data[0];
                    const updatedState = {
                        originalApplication: {
                            URI: data.originalApplication
                                ? `https://wwh.punjab.gov.pk/uploads/image/${data.originalApplication}`
                                : '',
                            Name: 'Original Application',
                        },
                        permission: {
                          URI: data.permission
                              ? `https://wwh.punjab.gov.pk/uploads/permission/${data.permission}`
                              : '',
                          Name: 'Permission',
                      },
                      idcard: { 
                        URI: data.idcard 
                          ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.idcard}` 
                          : '', 
                        Name: 'ID Card', 
                        Type: 'image' 
                      },
                      app_letter: { 
                        URI: data.app_letter 
                          ? `https://wwh.punjab.gov.pk/uploads/appointment/${data.app_letter}` 
                          : '', 
                        Name: 'Appointment Letter', 
                        Type: 'image' 
                      },
                      char_certificate: { 
                        URI: data.char_certificate 
                          ? `https://wwh.punjab.gov.pk/uploads/certificate/${data.char_certificate}` 
                          : '', 
                        Name: 'Character Certificate', 
                        Type: 'image' 
                      },
                      app_certificate: { 
                        URI: data.app_certificate 
                          ? `https://wwh.punjab.gov.pk/uploads/certificate/${data.app_certificate}` 
                          : '', 
                        Name: 'Appointment Certificate', 
                        Type: 'image' 
                      },
                      affidavit: { 
                        URI: data.affidavit 
                          ? `https://wwh.punjab.gov.pk/uploads/affidavit/${data.affidavit}` 
                          : '', 
                        Name: 'Affidavit', 
                        Type: 'image' 
                      },
                      medical: { 
                        URI: data.medical 
                          ? `https://wwh.punjab.gov.pk/uploads/medical/${data.medical}` 
                          : '', 
                        Name: 'Medical', 
                        Type: 'image' 
                      },
                      guardian_id: { 
                        URI: data.guardian_id 
                          ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.guardian_id}` 
                          : '', 
                        Name: 'Guardian ID', 
                        Type: 'image' 
                      },
                      first_id: { 
                        URI: data.first_id 
                          ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.first_id}` 
                          : '', 
                        Name: 'First ID', 
                        Type: 'image' 
                      },
                      second_id: { 
                        URI: data.second_id 
                          ? `https://wwh.punjab.gov.pk/uploads/idcard/${data.second_id}` 
                          : '', 
                        Name: 'Second ID', 
                        Type: 'image' 
                      },
                      first_guarantee: { 
                        URI: data.first_guarantee 
                          ? `https://wwh.punjab.gov.pk/uploads/guarantee/${data.first_guarantee}` 
                          : '', 
                        Name: 'First Guarantee', 
                        Type: 'image' 
                      },
                      second_guarantee: { 
                        URI: data.second_guarantee 
                          ? `https://wwh.punjab.gov.pk/uploads/guarantee/${data.second_guarantee}` 
                          : '', 
                        Name: 'Second Guarantee', 
                        Type: 'image' 
                      },
                      domicile: { 
                        URI: data.domicile 
                         ? `https://wwh.punjab.gov.pk/uploads/domicile/${data.domicile}` 
                          : '', 
                        Name: 'Domicile', 
                        Type: 'image' 
                      },
                        // Other attachments...
                    };
                    setAttachmentData(updatedState);
                } else {
                    console.error('Failed to fetch attachment data');
                }
            } catch (error) {
                console.error('Error fetching attachment data:', error);
            }
        };
    
        fetchAttachmentData();
    }, [item.id]);
    
    useEffect(() => {
        const fetchDeclarationData = async () => {
            try {
                const response = await fetch(`https://wwh.punjab.gov.pk/api/getDdetail-check/${item.id}`);
                if (response.ok) {
                    const result = await response.json();
                    const data = result.data[0];
                    const declarationImageUrl = data.declaration
                        ? `https://wwh.punjab.gov.pk/uploads/declaration/${data.declaration}`
                        : null;
                    setDeclarationImage(declarationImageUrl);
                    setDeclarationFormData({
                      name: data.em_name || '',
                  designation: data.designation || '',
                  department: data.department || '',
                  address: data.em_address || '',
                  phone: data.em_mobile || '',
                  email: data.em_email || '',
                    });
                } else {
                    console.error('Failed to fetch declaration data');
                }
            } catch (error) {
                console.error('Error fetching declaration data:', error);
            }
        };
    
        fetchDeclarationData();
    }, [item.id]);
    
    useEffect(() => {
        if (personalFormData && guardianFormData && attachmentData && declarationFormData) {
            setLoading(false); // Set loading to false once all data is fetched
        }
    }, [personalFormData, guardianFormData, attachmentData, declarationFormData]);
 // Fetch status data
 const [statusData, setStatusData] = useState(null);
 const [loading, setLoading] = useState(true);

 const [isModalVisible, setModalVisible] = useState(false);
 const [selectedStatus, setSelectedStatus] = useState('');
 const [remarks, setRemarks] = useState('');
 const translateY = useRef(new Animated.Value(height)).current;
 // Fetch status data
 useEffect(() => {
   const fetchStatus = async () => {
     try {
       console.log(`Fetching status for user_id: ${item.user_id}`);
       const response = await fetch(`https://wwh.punjab.gov.pk/api/getapprejstatus/${item.user_id}`);
       if (response.ok) {
         const result = await response.json();
         console.log("Status data received from API: ", result.data);
         setStatusData(result.data); // Save API response
       } else {
         console.error('Failed to fetch status');
       }
     } catch (error) {
       console.error('Error fetching status:', error);
     } finally {
       setLoading(false); // Stop loading spinner
     }
   };
   fetchStatus();
 }, [item.user_id]);

 // Open Modal (Animate translateY to bring modal into view)
 
 // Handle Submit for updating status
 const handleSubmit = async () => {
  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Get current date (YYYY-MM-DD)
    const payload = {
      status: selectedStatus,
      date: currentDate,
      remarks: remarks,
      personal_id: item.id,
      user_id: item.user_id,
    };
    console.log("Sending the following data to API: ", payload);

    const response = await fetch('https://wwh.punjab.gov.pk/api/registrationStatusUpdation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Status updated successfully:', result);
      if (result.data.status === 'accepted') {
        navigation.navigate('AppRejApplication', { status: 'accepted' });
      } else {
        navigation.navigate('AppRejApplication', { status: 'rejected' });
      }
      // Show toast based on the status
      const statusMessage = result.data.status === 'accepted' 
        ? 'Application Accepted Successfully!' 
        : 'Application Rejected Successfully!';
      
      ToastAndroid.show(statusMessage, ToastAndroid.SHORT); // Display toast message

      closeModal(); // Close modal on success
      fetchStatus(); // Refresh the status by calling the fetchStatus function

     
    } else {
      console.error('Failed to update status:', result.message);
      ToastAndroid.show('Failed to update status', ToastAndroid.SHORT); // Show error toast
    }
  } catch (error) {
    console.error('Error submitting status:', error);
  }
};


 
 const openModal = () => {
  setModalVisible(true);
  Animated.spring(translateY, {
    toValue: 0,
    useNativeDriver: true,
  }).start();
};

const closeModal = () => {
  Animated.timing(translateY, {
    toValue: height,
    duration: 300,
    useNativeDriver: true,
  }).start(() => {
    setModalVisible(false);
  });
};


 if (loading) {
   return <Loader loading={loading} />;
 }


 const renderStatusButton = () => {
  if (statusData) {
    if (statusData.status === 'rejected') {
      return (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.rejectedButton}>
            <Icon name="times-circle" size={20} color="maroon" />
            <Text style={styles.rejbuttonText}>Rejected</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (statusData.status === 'accepted') {
      return (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.acceptedButton}>
            <Icon name="check-circle" size={20} color="#008000" />
            <Text style={styles.accbuttonText}>Approved</Text>
          </TouchableOpacity>
        </View>
      );
    }
  } else {
    return (
      <View style={styles.footer}>
        <TouchableOpacity onPress={openModal} style={styles.actionButton}>
          <Icon name="exclamation-circle" size={20} color="#fff" />
          <Text style={styles.actionbuttonText}>Take Action</Text>
        </TouchableOpacity>
      </View>
    );
  }
};


    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={['#010048', '#020035', '#030022']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >   
            
            
            <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()}>
           <Icon name="arrow-left" size={20} color="#fff" style={styles.icon} />
           </TouchableOpacity>
                    <Text style={styles.headerText}>Profile Details</Text>
                </View>
            </LinearGradient>
            <ScrollView style={styles.content}>
                {/* Personal Information Section */}
                <View style={styles.section}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Personal Information</Text>
                    </View>
                    <View style={styles.imageContainer}>
                    <Image source={{ uri: profileImage }} style={styles.profileImage} />
              
            </View>

                    <Text style={styles.text}>Applicant's Name:</Text>
        <TextInput
          value={personalFormData.name}
          onChangeText={(value) => handleInputChange('name', value)}
 
          style={styles.input}
        />

        <Text style={styles.text}>Permanent Address:</Text>
        <TextInput
          style={styles.input}
       
          placeholderTextColor="grey"
          value={personalFormData.address}
          onChangeText={text => handleInputChange('address', text)}
        />

        <Text style={styles.text}>Phone Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter phone Number"
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={personalFormData.phone}
          onChangeText={text => handleInputChange('phone', text)}
  
        />

        <Text style={styles.text}>Mobile Number:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile Number"
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={personalFormData.mobile}
        />
     <Text style={styles.text}>Applied District</Text>
     <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={item.district_name}
        />

      <Text style={styles.text}> Institute</Text>
      <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={item.institute_name}
        />

      </View>
        <Text style={[styles.text, { marginTop: '5%' }]}>Applied Date:</Text>

  <TextInput
    style={styles.input}
    placeholder="12-02-2012"
    placeholderTextColor="grey"
    value={personalFormData.applieddate}
   
  />

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
          value={personalFormData.cnic}
        />
<Text style={[styles.text, { marginTop: '5%' }]}>Date of Expiry:</Text>

  <TextInput
    style={styles.input}
    placeholder="12-02-2012"
    placeholderTextColor="grey"
    value={personalFormData.datee}
 
  />

       
       

        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Birth:</Text>
       
  <TextInput
    style={styles.input}
    placeholder="12-02-2012"
    placeholderTextColor="grey"
    value={personalFormData.dateb}
  
  />
       

        <Text style={[styles.text, {marginTop: '5%'}]}>Date of Issue:</Text>
   
  <TextInput
    style={styles.input}
    placeholder="Enter date of issue"
    placeholderTextColor="grey"
    value={personalFormData.datei}

  />

     

        <Text style={[styles.text, {marginTop: '10%'}]}>Place of Issue:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter place where CNIC issue"
          placeholderTextColor="grey"
          value={personalFormData.placeofissue}
   
        />

        <Text style={[styles.text, {marginTop: 20}]}>
          Any Physical Disability:
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Specify disability (if any)"
          placeholderTextColor="grey"
          value={personalFormData.disability}
      
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
          value={personalFormData.jobheld}
       
        />

        <Text style={styles.text}>Since When Serving on Current Job:</Text>
    
  <TextInput
    style={styles.input}
    placeholder="Enter date"
    placeholderTextColor="grey"
    value={personalFormData.serving}
  
  />

    
        <Text style={[styles.text, {marginTop: 20}]}>Salary:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Salary"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={personalFormData.salary}
        
        />

        <Text style={styles.text}>Job Type</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile Number"
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={personalFormData.mobile}
        />

        <Text style={styles.text}>BPS</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={11}
          placeholderTextColor="grey"
          value={item.bps}
        />
    
        <Text style={[styles.sectionHead, { marginTop: 10 }]}>
    Duty Hours in Summer
  </Text>
  <View style={styles.divider} />

  <Text style={styles.textt}>Start Time:</Text>
     
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={personalFormData.starttimes}
        />


      <Text style={styles.textt}>End Time:</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={personalFormData.endtimes}
    
        />


      <Text style={[styles.sectionHead, { marginTop: 10 }]}>
        Duty Hours in Winter
      </Text>
      <View style={styles.divider} />

      <Text style={styles.textt}>Start Time:</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={personalFormData.starttimew}
        
        />


      <Text style={styles.textt}>End Time:</Text>
    
        <TextInput
          style={styles.input}
          placeholder="Enter Time"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={personalFormData.endtimew}

          editable={false} // Prevent direct typing, use time picker instead
        />


















                </View>

                {/* Guardian Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Guardian Information</Text>
                  
                </View>


                <Text style={styles.text}>Father/Husband/Guardian Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            placeholderTextColor="grey"
            value={guardianFormData.name}
       
          />
          <Text style={styles.text}>Address:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Address"
            placeholderTextColor="grey"
            value={guardianFormData.address}
          
          />
          <Text style={styles.text}>Email Address:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email Address"
            placeholderTextColor="grey"
            value={guardianFormData.email}
        
          />
          <Text style={styles.text}>Occupation:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Occupation"
            placeholderTextColor="grey"
            value={guardianFormData.occupation}
      
          />
          <Text style={styles.text}>Mobile No:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile No"
            keyboardType="numeric"
            maxLength={11}
            placeholderTextColor="grey"
            value={guardianFormData.gmobile}
     
          />
          <Text style={styles.text}>Relationship:</Text>
          <TextInput
            style={styles.input}
            placeholder="Select Relationship"
            placeholderTextColor="grey"
            value={guardianFormData.relationship}
        
          />
       

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Person to be informed in case of emergency</Text>
          <View style={styles.divider} />
          <Text style={styles.text}>Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Name"
            placeholderTextColor="grey"
            value={guardianFormData.ename}
       
          />
          <Text style={styles.text}>Address:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Address"
            placeholderTextColor="grey"
            value={guardianFormData.eaddress}
       
          />
          <Text style={styles.text}>Mobile No:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Mobile No"
            placeholderTextColor="grey"
            keyboardType="numeric"
            maxLength={11}
            value={guardianFormData.emobile}
       
          />
          <Text style={styles.text}>Relationship:</Text>
          <TextInput
            style={styles.input}
            placeholder="Select Relationship"
            placeholderTextColor="grey"
            value={guardianFormData.erelationship}
      
     
          />
        </View>



                {/* Attachments Section */}
                <View style={styles.section}>
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Attachments</Text>
                    </View>
                    {Object.keys(attachmentData).map((key) => (
                        <View key={key} style={styles.section}>
                            <Text style={styles.text}>{attachmentData[key].Name}</Text>
                            {attachmentData[key].URI ? (
                                <View style={styles.attachmentImageContainer}>
                                <Image source={{ uri: attachmentData[key].URI }} style={styles.attachmentImage} />
                                </View>
                            ) : (
                                <Text></Text>
                            )}
                        </View>
                    ))}
                </View>


              

                <View style={styles.section}>
          <Text style={styles.sectionHeader}>Employer Information</Text>
          <Text style={styles.text}>Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter applicant name"
            placeholderTextColor="grey"
            value={declarationFormData.name}
      
          />
          <Text style={styles.text}>Designation:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter applicant designation"
            placeholderTextColor="grey"
            value={declarationFormData.designation}
      
          />
          <Text style={styles.text}>Department:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter applicant department"
            placeholderTextColor="grey"
            value={declarationFormData.department}
         
          />
          <Text style={styles.text}>Address:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter applicant address"
            placeholderTextColor="grey"
            value={declarationFormData.address}
        
          />
          <Text style={styles.text}>Phone:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter applicant phone number"
            placeholderTextColor="grey"
            value={declarationFormData.phone}
       
            keyboardType="numeric"
            maxLength={11}
       
          />
          <Text style={styles.text}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter applicant email"
            placeholderTextColor="grey"
            value={declarationFormData.email}
         
         
          />


{/* <TouchableOpacity onPress={openModal} style={styles.openButton}>
        <Text style={styles.openButtonText}>Open Modal</Text>
      </TouchableOpacity> */}
        </View>
        <View style={styles.section}>
                    <Text style={styles.sectionHeader}>Declaration</Text>
                  
                </View>
                <View style={styles.attachmentImageContainer}>
                    <Image source={{ uri: declarationImage }} style={styles.attachmentImage} />
                    </View>
                    <View style={styles.dattachmentImageContainer}>
                   
                    </View>
                    </ScrollView>
                    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      {renderStatusButton()}

      <Modal transparent visible={isModalVisible} animationType="slide">
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

 
     
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY }] }]}>
            <View style={styles.swipeIndicator} />

            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>Take Action</Text>

              <View style={styles.radioButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    selectedStatus === 'accepted' && styles.radioButtonSelected,
                  ]}
                  onPress={() => setSelectedStatus('accepted')}
                >
                  <Icon name="check-circle" size={15} color="#4CAF50" style={styles.radioButtonIcon} />
                  <Text style={styles.radioButtonText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    selectedStatus === 'rejected' && styles.radioButtonSelected,
                  ]}
                  onPress={() => setSelectedStatus('rejected')}
                >
                  <Icon name="times-circle" size={15} color="maroon" style={styles.radioButtonIcon} />
                  <Text style={styles.radioButtonText}>Reject</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.remarkTitle}>Enter Remarks</Text>
              <TextInput
                value={remarks}
                onChangeText={setRemarks}
                style={styles.remarksInput}
                multiline
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
    
      </Modal>
    </GestureHandlerRootView>


        </SafeAreaView>
    );
};

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 15,
      backgroundColor: '#000',
    },
    headerText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      flex: 1,
      textAlign: 'center',
      marginRight: '15%',
      marginLeft: '3%',
    },
    icon: {
      padding: 10,
    },
    content: {
        paddingHorizontal: 15,
        paddingVertical: 50,
        paddingBottom: 80,
    },
    section: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 5,
        elevation: 1,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
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
    attachmentContainer: {
        marginVertical: 5,
        alignItems: 'center',
    },
    attachmentImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
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


    attachmentImageContainer: {
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
    
    dattachmentImageContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
      borderRadius: 10,
      width: '80%',
      height: 100,
      overflow: 'hidden',
      alignSelf: 'center',
    },
    attachmentImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
      borderRadius: 10,
    },
   
 
    footer: {
      position: 'absolute',
      bottom: '10%', // Adjust as needed to fit the design
      right: '30%',  // Adjust as needed to fit the design
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
    acceptedButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F4F4F4', // Light green background for the accepted button
      paddingVertical: 12,
      marginBottom: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    accbuttonText: {
      color: '#008000', // Dark green color for the accepted button text
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    rejectedButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F4F4F4', // Light red background for rejected button
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      marginBottom: 12,
      elevation: 5,
    },
    rejbuttonText: {
      color: 'maroon', // Red color for the rejected button text
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'gray', // Orange color for the action button
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    actionbuttonText: {
      color: '#fff', // White text for the action button
      fontSize: 14,
      fontWeight: 'bold',
      marginLeft: 10,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    swipeableContainer: {
      height: '100%',
    },
    modalContainer: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      backgroundColor: '#f0f0f0', // Light gray background for modal
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -5 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 10,
      paddingBottom: 20,
      maxHeight: height * 0.8, // Responsive modal height
    },
    swipeIndicator: {
      width: 50,
      height: 5,
      backgroundColor: '#ccc', // Light gray line to indicate swipe
      borderRadius: 2.5,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 15,
    },
    modalContent: {
      padding: 10,
    },
    modalTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#010048',
      marginBottom: 15,
      textAlign: 'center',
    },
    radioButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    radioButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 40,
      borderRadius: 20,
      backgroundColor: '#f0f0f0',
    },
    radioButtonSelected: {
      backgroundColor: '#d9d9d9',
    },
    radioButtonIcon: {
      marginRight: 10,
    },
    radioButtonText: {
      fontSize: 14,
      color: '#010048',
    },
    remarkTitle: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#010048',
      marginBottom: 2,
      marginLeft: 30,
      textAlign: 'start',
    },
    remarksInput: {
      height: 60, // Reduced size
      borderColor: '#010048',
      borderWidth: 0.1,
      borderRadius: 5,
      paddingHorizontal: 20,
     marginHorizontal: 20,
      textAlignVertical: 'top',
      marginBottom: 10,
      fontSize: 12,
    },
    modalFooter: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderColor: '#e0e0e0',
    },
    submitButton: {
      backgroundColor: '#010048',
      paddingVertical: 10,
      marginHorizontal: 70,
      borderRadius: 10,
      alignItems: 'center',
    },
    submitButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
    },
    openModalButton: {
      backgroundColor: '#6200ea',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    openModalButtonText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
    },
  };
  


export default ProfileP;
