import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import ProgressBar from '../components/ProgressBar';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import DocumentPicker from 'react-native-document-picker';

const FormA = () => {
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
  const [stateFunction, setStateFunction] = useState({
    URI: '',
    Type: '',
    Name: '',
  });
  const [isFileSelected, setIsFileSelected] = useState(false); // New state for icon color
  const navigation = useNavigation();

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleNextPress = () => {
    navigation.navigate('FormD');
  };

  const handlePrevPress = () => {
    navigation.navigate('FormG');
  };

  const openGallery = async () => {
    try {
      const response = await DocumentPicker.pick({
        allowMultiSelection: false,
        type: [DocumentPicker.types.allFiles],
      });

      console.log('response', JSON.stringify(response[0], null, 2));

      setStateFunction(prev => ({
        ...prev,
        Name: response[0].name,
        Type: response[0].type,
        URI: response[0].uri,
      }));
      setIsFileSelected(true); // Set the icon color to green when a file is selected
    } catch (error) {
      console.error('Document picking error:', error);
      setIsFileSelected(false); // Ensure the icon color is not green if selection fails
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Attachments</Text>
      <ProgressBar step={3} />

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Upload Attachments</Text>
        <View style={styles.divider} />
        <Text style={styles.text}>Father/Husband/Guardian Name:</Text>

        <View style={styles.mainWrapper}>
          <TouchableOpacity onPress={openGallery} style={styles.iconWrapper}>
            <FontAwesomeIcon
              icon={faFile}
              size={30}
              color={isFileSelected ? 'green' : 'black'} // Conditional icon color
            />
          </TouchableOpacity>
          {stateFunction.Name ? (
            <View style={styles.fileNameWrapper}>
              <Text style={styles.fileNameText}>{stateFunction.Name}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handlePrevPress}>
          <Text style={styles.buttonText}>Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleNextPress}>
          <Text style={styles.buttonText}>Next</Text>
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
  divider: {
    height: 0.2,
    backgroundColor: 'grey',
    marginVertical: 10,
    width: '90%', // Set the width of the divider (e.g., 80% of the container's width)
    alignSelf: 'center', // Center the divider within its container
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
  iconWrapper: {
    marginTop: '5%', // Adjust the margin if needed
  },
  fileNameWrapper: {
    marginTop: 20, // Adjust the margin top if needed
    alignItems: 'center',
  },
  fileNameText: {
    color: 'black',
    textAlign: 'center',
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
    marginBottom: 5,
    marginTop: 5,
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
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
});

export default FormA;
