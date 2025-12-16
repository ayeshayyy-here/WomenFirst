import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Loader from '../components/Loader';
import Sound from 'react-native-sound';

const ComplaintViewDetail = ({ route }) => {
  const { complaintId } = route.params;
  const [loading, setLoading] = useState(true);
  const [complaintDetails, setComplaintDetails] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchComplaintDetails = async () => {
      try {
        const response = await fetch(
          `https://complaint-swbm-mis.punjab.gov.pk/api/view-complaints/${complaintId}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch complaint details');
        }
        const data = await response.json();
        setComplaintDetails(data?.complaint[0]);
      } catch (error) {
        Alert.alert('Error', 'Failed to load complaint details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchComplaintDetails();
  }, [complaintId]);

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

  const handleFileDownload = (fileUrl) => {
    Linking.openURL(fileUrl).catch((err) => console.error("Couldn't load page", err));
  };

  if (loading) {
    return <Loader loading={loading} />;
  }

  if (!complaintDetails) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No details available for this complaint.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complaint Details</Text>
      {[
        { label: 'Complaint Number', value: complaintDetails.id?.toString() || 'N/A' },
        { label: 'Reg. Date', value: complaintDetails.reg_date || 'N/A' },
        { label: 'Category', value: 'Other' },
        { label: 'Sub Category', value: 'General Inquiry' },
        { label: 'District', value: 'Lahore' },
        { label: 'Status', value: complaintDetails.status || 'Pending' },
        { label: 'Remark', value: complaintDetails.remark || 'NULL' },
        { label: 'Complaint Details', value: complaintDetails.complaint_details || 'N/A' },
      ].map((item, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.label}>{item.label}:</Text>
          <Text style={styles.value}>{item.value}</Text>
        </View>
      ))}
      <View style={styles.section}>
        <Text style={styles.label}>Complaint Audio:</Text>
        <View style={styles.buttonContainer}>
          {complaintDetails.complaint_audio ? (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() =>
                toggleSound(
                  `https://complaint-swbm-mis.punjab.gov.pk/audio/${complaintDetails.complaint_audio}`
                )
              }
            >
              <Text style={styles.buttonText}>
                {isPlaying ? 'Stop Audio' : 'Play Audio'}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noAudioText}>No resolved audio available</Text>
          )}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Complaint File:</Text>
        <View style={styles.buttonContainer}>
          {complaintDetails.complaint_file ? (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() =>
                handleFileDownload(
                  `https://complaint-swbm-mis.punjab.gov.pk/pics/${complaintDetails.complaint_file}`
                )
              }
            >
              <Text style={styles.buttonText}>View File</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noAudioText}>No file available</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#010048',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  value: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  noAudioText: {
    color: 'grey',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: 'center',
    width: '100%',
  },
  downloadButton: {
    backgroundColor: '#010048',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ComplaintViewDetail;
