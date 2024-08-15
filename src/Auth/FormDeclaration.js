import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { useNavigation } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';



const FormD = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cnic: '',
    datee: '',
    dateb: '',
    jobTitle: '',
    jobStartDate: '',
    salary: '',
  });

  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState('');
  const [isFileSelected, setIsFileSelected] = useState(false);

  const initialState = {
    URI: '',
    Type: '',
    Name: '',
  };

  const [stateFunctions, setStateFunctions] = useState({
    attachdeclaration: initialState,
  })
  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };
  const handleNextPress = () => {
    navigation.navigate('FormA');
  };
  const handlePrevPress = () => {
    navigation.navigate('FormA');
  };
  const openGallery = async () => {
    try {
      const response = await DocumentPicker.pick({
        allowMultiSelection: false,
        type: [DocumentPicker.types.allFiles],
      });

      setStateFunctions(prev => ({
        ...prev,
        [selectedAttachment]: { ...prev[selectedAttachment], Name: response[0].name, URI: response[0].uri, Type: response[0].type },
      }));
      setIsFileSelected(true);
      setModalVisible(false);
    } catch (error) {
      console.error('Document picking error:', error);
      setIsFileSelected(false);
    }
  };

  const handleUploadClick = (attachmentName) => {
    setSelectedAttachment(attachmentName);
    setModalVisible(true);
  };

  const renderAttachment = (label, attachmentName) => (
    <View style={styles.attachmentWrapper}>
      {/* <Text style={styles.text}>{label}</Text> */}
      <View style={styles.mainWrapper}>
        <TouchableOpacity onPress={() => handleUploadClick(attachmentName)} style={styles.iconWrapper}>
          <FontAwesomeIcon
            icon={faPlusCircle}
            size={30}
            color={stateFunctions[attachmentName].Name ? 'green' : 'black'}
            marginLeft={10}
          />
        </TouchableOpacity>
        {stateFunctions[attachmentName].Name ? (
          <View style={styles.fileNameWrapper}>
            {stateFunctions[attachmentName].Type === 'image' ? (
              <Image
                source={{ uri: stateFunctions[attachmentName].URI }}
                style={styles.previewImage}
              />
            ) : (
              <Text style={styles.fileNameText}>{stateFunctions[attachmentName].Name}</Text>
            )}
          </View>
        ) : null}
      </View>
      <View style={styles.divider} />
    </View>
  );
  


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Application Form</Text>
      <ProgressBar step={4} />

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Employer Information</Text>
        <Text style={styles.text}>Name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter applicant name"
          placeholderTextColor="grey"
          value={formData.name}
          onChangeText={(text) => handleInputChange('name', text)}
        />
        <Text style={styles.text}>Designation:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Designation"
          placeholderTextColor="grey"
          value={formData.address}
          onChangeText={(text) => handleInputChange('address', text)}
        />
        <Text style={styles.text}>Department/Organization:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Department/Organization"
          placeholderTextColor="grey"
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
        />
            <Text style={styles.text}>Address:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          placeholderTextColor="grey"
          value={formData.phone}
          onChangeText={(text) => handleInputChange('phone', text)}
        />
        <Text style={styles.text}>Mobile No:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter mobile no"
          keyboardType="numeric"
          placeholderTextColor="grey"
          value={formData.mobile}
          onChangeText={(text) => handleInputChange('mobile', text)}
        />
          <Text style={styles.text}>Email:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          placeholderTextColor="grey"
          value={formData.mobile} 
          onChangeText={(text) => handleInputChange('mobile', text)}
        />
      </View>
      <Text style={styles.declare}>Personal Declaration :</Text>
      <View style={styles.divider2} />
      <Text style={styles.subtext}>I Name hereby apply for admission in the Working Women Hostel and undertake to
         abide by the Rules & Regulations notified from time to time of the Hostel, which i have throughly read and also undertaken to pay all charges regularly
      </Text>
      <Text style={styles.Nametext}>Name: 
        <Text style={styles.subtext}> The Applicant Name</Text>
      </Text>
      <Text style={styles.Nametext}>Designation:
        <Text style={styles.subtext}> The Applicant Job Designation</Text>
      </Text>
      <Text style={styles.Nametext}>Date: 
       <Text style={styles.subtext}>  12-08-2024</Text>
      </Text>
     

      <Text style={styles.declare}>Guardian/Father/Husband Declaration :</Text>
      <View style={styles.divider2} />
      <Text style={styles.subtext}>I mister, Guardian of Miss/Mrs Name(the Applicant) request that she may be allow to get admission in the hostel under prescribed terms and conditions as well the reles & regulations.She may be allowed to see the following persons at the hostel premises on prescribed days of visit. </Text>
      <Text style={styles.Nametext}>Name: 
        <Text style={styles.subtext}> Mister</Text>
      </Text>
      <Text style={styles.Nametext}>RelationShip:
        <Text style={styles.subtext}> Guardian</Text>
      </Text>
      <Text style={styles.Nametext}>Address: 
       <Text style={styles.subtext}>  Lahore</Text>
      </Text>
      <Text style={styles.Nametext}>Mobile:
        <Text style={styles.subtext}> The Guardian Mobile No.</Text>
      </Text>
      <Text style={styles.Nametext}>Signature: 
       <Text style={styles.subtext}> The Guardian Signature </Text>
      </Text>
      <Text style={styles.Nametext}>Date: 
       <Text style={styles.subtext}>  12-08-2024</Text>
      </Text>
      

      <Text style={styles.declare}>Attach Declaration :</Text>
      <View style={styles.divider2} />
      <Text style={styles.Nametext}>Note: 
         <Text style={styles.subtext}>Please take a snapshot of Declaration and it will be Attached here.</Text>
      </Text>
      <View style={styles.divider} />
       {renderAttachment("Attach Declaration", "attachdeclaration")}
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
          <Text style={styles.buttonText}>Back  </Text>
        </TouchableOpacity>
      <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
     
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#010048',

    padding: 10,
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
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,  // Adjust this value to control the space between text and TextInput
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
    marginBottom: 8,  // Adds space between each TextInput
    paddingLeft: 10,
    fontSize: 12,
  },  
  declare: {
    fontSize: 17,
    fontWeight: 'bold',
    // marginBottom: 2,
    color: 'black',
  },
  subtext: {
    fontSize: 12,
    // fontWeight: 'bold',
    marginBottom: 10,
    color: 'grey',
  },
  Nametext: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  divider: {
    height: 0.4,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '100%',
  },
  divider1: {
    height: 1,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '45%',
    marginTop: 2,
  },
  divider2: {
    height: 1,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '100%',
    marginTop: 2,
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
    flexDirection: 'row',
    marginTop:10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  modalButtonText: {
    color: '#010048',
    fontSize: 16,
    // fontWeight: 'bold',
    marginLeft: 10,
    marginTop:10
  },
  mainWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentWrapper: {
    marginBottom: 20,
  },
  iconWrapper: {
    marginTop: 5,
    marginBottom: 5,
  },
  line: {
    width: 200,
    height: 2,
    alignItems: 'center',
  },
  
});

export default FormD;
