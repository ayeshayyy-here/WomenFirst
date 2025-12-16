import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Rendercomponent = ({ personalId }) => {
  const [selectedStatus, setSelectedStatus] = useState(null); // Current marital status
  const [loading, setLoading] = useState(true);

  // Fetch marital status from API
  useEffect(() => {
    const fetchMaritalStatus = async () => {
      try {
        const response = await fetch(
          `https://wwh.punjab.gov.pk/api/getMaritalStatus?personal_id=${personalId}`
        );
        const data = await response.json();
        if (response.ok && data.marital_status) {
          setSelectedStatus(data.marital_status); // Set the existing marital status
        }
      } catch (error) {
        console.error('Error fetching marital status:', error);
      } finally {
        setLoading(false);
      }
    };

    if (personalId) fetchMaritalStatus();
  }, [personalId]);
  const handleSelection = async (status) => {
    setSelectedStatus(status); // Update local state
    try {
      const response = await fetch('https://wwh.punjab.gov.pk/api/postMaritalStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personal_id: personalId,
          marital_status: status,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log('Marital status updated:', data.message);
      } else {
        console.error('Failed to update marital status:', data.message);
      }
    } catch (error) {
      console.error('Error posting marital status:', error);
    }
  };
  

  if (loading) {
    return <Text style={styles.loadingText}>Loading marital status...</Text>;
  }

  return (
    <View style={styles.Container}>
      <Text style={styles.radioHeader}>Marital Status</Text>
      <View style={styles.radioContainer}>
      <TouchableOpacity
        style={[
          styles.radioOption,
          selectedStatus === 'Single' ? styles.selectedOption : null,
        ]}
        onPress={() => handleSelection('Single')}
      >
        <Text style={styles.radioText}>Single</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.radioOption,
          selectedStatus === 'Married' ? styles.selectedOption : null,
        ]}
        onPress={() => handleSelection('Married')}
      >
        <Text style={styles.radioText}>Married</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.radioOption,
          selectedStatus === 'Divorced' ? styles.selectedOption : null,
        ]}
        onPress={() => handleSelection('Divorced')}
      >
        <Text style={styles.radioText}>Divorced</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
};


const styles = StyleSheet.create({
 
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  radioHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#010048',
  },
  radioOption: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
    borderWidth: 0.3,
    borderColor: '#d3d3d3',
    borderRadius: 5,
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: 'gray',
    borderColor: '#4CAF50',
  },
  radioText: {
    marginLeft: 10,
    color: '#000',
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingText: {
    textAlign: 'center',
    color: 'gray',
    fontStyle: 'italic',
    marginVertical: 20,
  },
});

export default Rendercomponent;
