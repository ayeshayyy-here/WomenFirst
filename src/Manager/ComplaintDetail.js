import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Sound from 'react-native-sound';
const ComplaintDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { complaint } = route.params;
  const [status, setStatus] = useState(complaint.status === 'resolved' ? 'resolved' : 'pending');
  const [remarks, setRemarks] = useState(complaint.remark || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const renderDetailRow = (icon, label, value) => (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <Icon name={icon} size={20} color="white" />
      </View>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || 'Not provided'}</Text>
      </View>
    </View>
  );

  const handleStatusUpdate = async () => {
    setIsSubmitting(true);
    
    try {
      if (!remarks.trim()) {
        Alert.alert('Validation Error', 'Please enter remarks');
        setIsSubmitting(false);
        return;
      }

      const requestBody = {
        complaint_id: complaint.id,
        current_status: status,
        remarks: remarks,
      };

      const response = await fetch('https://complaint-swbm-mis.punjab.gov.pk/api/hostel-resolvedstatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'secret': 'w5qOiuGbvehTk0llZAMabt2uGFmPTUFJFwa8ibI96kShKBqOMS2Pgikx0wEbvIx8'
        },
        body: JSON.stringify(requestBody)
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || Object.values(responseData)[0] || 'Failed to update status');
      }

      Alert.alert(
        'Success', 
        'Status updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ComplaintsM', { refresh: true })
          }
        ]
      );

    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenAttachment = (file) => {
    const fileUrl = `https://complaint-swbm-mis.punjab.gov.pk/pics/${file}`;
    Linking.openURL(fileUrl).catch(err => console.error("Couldn't load attachment", err));
  };
useEffect(() => {
    return () => {
      if (sound) {
        sound.release();
      }
    };
  }, [sound]);

  const toggleSound = (audioUrl) => {
    if (isPlaying) {
      sound?.stop(() => setIsPlaying(false));
    } else {
      const newSound = new Sound(audioUrl, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error('Failed to load sound', error);
          return;
        }
        setSound(newSound);
        newSound.play((success) => {
          if (!success) {
            console.error('Playback failed');
          }
          setIsPlaying(false);
        });
        setIsPlaying(true);
      });
    }
  };
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <LinearGradient
        colors={['#020035', '#015B7f', '#020035']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Complaint Details</Text>
        <Text style={styles.complaintId}>ID: {complaint.id}</Text>
      </LinearGradient>

      {/* Status Badge */}
      <View style={[
        styles.statusBadge,
        complaint.status === 'resolved' ? styles.resolvedBadge : styles.pendingBadge
      ]}>
        <Icon 
          name={complaint.status === 'resolved' ? 'check-circle' : 'schedule'} 
          size={18} 
          color="#FFF" 
        />
        <Text style={styles.statusText}>
          {complaint.status === 'resolved' ? 'RESOLVED' : 'PENDING'}
        </Text>
      </View>

      {/* Complainant Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Complainant Information</Text>
        {renderDetailRow('person', 'Name', complaint.name)}
        {renderDetailRow('credit-card', 'CNIC', complaint.cnic)}
        {renderDetailRow('phone', 'Phone', complaint.phoneno)}
      </View>

      {/* Complaint Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Complaint Information</Text>
        {renderDetailRow('category', 'Category', complaint.category_name)}
        {renderDetailRow('subdirectory-arrow-right', 'Subcategory', complaint.subcategory_name)}
        {renderDetailRow('description', 'Details', complaint.complaint_details)}
        {renderDetailRow('location-on', 'District', complaint.district_name)}
        {renderDetailRow('home', 'Hostel', `Hostel ${complaint.institute}`)}
      </View>

      {/* Dates */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dates</Text>
        {renderDetailRow('event', 'Registered', complaint.reg_date)}
        {complaint.status === 'resolved' && 
          renderDetailRow('event-available', 'Resolved', complaint.resolved_date)}
      </View>

      {/* Attachments */}
      {(complaint.complaint_file || complaint.complaint_audio || complaint.resolve_complaint_file) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          {complaint.complaint_file && (
            <TouchableOpacity 
              style={styles.attachmentButton} 
              onPress={() => handleOpenAttachment(complaint.complaint_file)}
            >
              <Icon name="image" size={20} color="#5E35B1" />
              <Text style={styles.attachmentText}>Original Complaint File</Text>
              <Icon name="open-in-new" size={20} color="#5E35B1" />
            </TouchableOpacity>
          )}
          {complaint.resolve_complaint_file && (
            <TouchableOpacity 
              style={styles.attachmentButton} 
              onPress={() => handleOpenAttachment(complaint.resolve_complaint_file)}
            >
              <Icon name="image" size={20} color="#5E35B1" />
              <Text style={styles.attachmentText}>Resolution File</Text>
              <Icon name="open-in-new" size={20} color="#5E35B1" />
            </TouchableOpacity>
          )}
          {complaint.complaint_audio && (
            <TouchableOpacity 
              style={styles.attachmentButton} 
              onPress={() =>
                toggleSound(
                  `https://complaint-swbm-mis.punjab.gov.pk/audio/${complaint.complaint_audio}`
                )
              }
            >
            
              <Icon name="audiotrack" size={20} color="#5E35B1" />
              <Text style={styles.attachmentText}>Audio Recording</Text>
              <Icon name="open-in-new" size={20} color="#5E35B1" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Status Update Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Update Status</Text>
        
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={[styles.radioButton, status === 'pending' && styles.radioButtonSelected]}
            onPress={() => setStatus('pending')}
          >
            <Text style={[styles.radioText, status === 'pending' && styles.radioTextSelected]}>
              Pending
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.radioButton, status === 'resolved' && styles.radioButtonSelected]}
            onPress={() => setStatus('resolved')}
          >
            <Text style={[styles.radioText, status === 'resolved' && styles.radioTextSelected]}>
              Resolved
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Remarks</Text>
        <TextInput
          style={styles.remarksInput}
          multiline
          numberOfLines={4}
          placeholder="Enter remarks..."
          value={remarks}
          onChangeText={setRemarks}
        />

        {isSubmitting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#020035" />
            <Text style={styles.loadingText}>Updating status...</Text>
          </View>
        ) : updateSuccess ? (
          <View style={styles.successContainer}>
            <Icon name="check-circle" size={20} color="#4CAF50" />
            <Text style={styles.successText}>Status updated successfully!</Text>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleStatusUpdate}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>Update Status</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    fontWeight: 'bold',
  },
  complaintId: {
    fontSize: 14,
    color: '#E1E1E1',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 20,
  },
  pendingBadge: {
    backgroundColor: '#FFA000',
  },
  resolvedBadge: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#020035',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#020035',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: 'black',
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 12,
    color: '#212121',
    marginTop: 2,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE7F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  attachmentText: {
    flex: 1,
    fontSize: 14,
    color: '#5E35B1',
    marginLeft: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  radioButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#020035',
  },
  radioButtonSelected: {
    backgroundColor: '#020035',
  },
  radioText: {
    color: '#020035',
    fontWeight: 'bold',
  },
  radioTextSelected: {
    color: '#FFF',
  },
  inputLabel: {
    fontSize: 12,
    color: '#020035',
    marginBottom: 8,
    fontWeight: '500',
  },
  remarksInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#020035',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    color: '#020035',
  },
  successContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    marginTop: 16,
  },
  successText: {
    marginLeft: 8,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default ComplaintDetail;