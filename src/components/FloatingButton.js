import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Modal, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // or any other icon library
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient
import syncStorage from 'react-native-sync-storage';
const FloatingButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fabContainer} onPress={onPress}>
      <LinearGradient
        colors={['#8e44ad', '#9b59b6', '#8e44ad']}
        locations={[0, 0.14, 0.39, 0.73, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fab}
      >
        <Icon name="exit-to-app" size={20} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const App = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = React.useState(false);

  const handlePress = () => {
    setModalVisible(true);
  };

const logoutUser = async () => {
  try {
    console.log('[DEBUG] Starting logout process...');
    
    // Clear EncryptedStorage
    await EncryptedStorage.removeItem('user_session');
    console.log('[DEBUG] Cleared EncryptedStorage');
    
    // Clear syncStorage
    syncStorage.remove('user_profile');
    syncStorage.remove('user'); // Remove any other user-related data
    console.log('[DEBUG] Cleared syncStorage');
    
    // Verify everything is cleared
    const remainingSession = await EncryptedStorage.getItem('user_session');
    const remainingProfile = syncStorage.get('user_profile');
    
    console.log('[DEBUG] Verification - Remaining session:', remainingSession);
    console.log('[DEBUG] Verification - Remaining profile:', remainingProfile);
    
    // Navigate to login screen
    navigation.navigate('LoginC');
    
    console.log('[DEBUG] Logout completed successfully');
    Alert.alert('Success', 'You have been logged out successfully');
    
  } catch (error) {
    console.error('[DEBUG] Logout error:', error);
    Alert.alert('Error', 'Failed to logout. Please try again.');
  }
};

  const handleLogout = async () => {
    try {
      // Remove user data from encrypted storage
      await EncryptedStorage.removeItem('user');
      await EncryptedStorage.removeItem('formData'); // If you also want to clear form data

      // Navigate to the login screen
      navigation.navigate('LoginC');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleConfirmLogout = () => {
    logoutUser();
    setModalVisible(false);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <FloatingButton onPress={handlePress} />

      {/* Modal for logout confirmation */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.iconWrapper}>
              <View style={styles.iconContainer}>
                <Icon name="power-off" size={40} color="#302F65" />
              </View>
            </View>
            <Text style={styles.modalTitle}>Logout</Text>
            <Text style={styles.modalMessage}>Are you sure you want to logout?</Text>
            <View style={styles.buttonRow}>
              <LinearGradient
                colors={['#8e44ad', '#9b59b6', '#8e44ad']}
                locations={[0, 0.14, 0.39, 0.73, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.modalOption}
              >
                <TouchableOpacity onPress={handleConfirmLogout} style={styles.modalOption}>
                  <Text style={styles.modalOptionText}>Logout</Text>
                </TouchableOpacity>
              </LinearGradient>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={handleCancel}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: '100%', // Increased to prevent overlap with other content
    right: '5%',  // Increased to position the button more prominently
    zIndex: 1000, // Ensures it appears above other components
    elevation: 8, // Adds shadow for Android
    marginBottom: 90,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  iconWrapper: {
    position: 'absolute',
    top: -30,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  iconContainer: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 30,
    color: 'black',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  buttonRow: {
    width: '100%',
  },
  modalOption: {
    alignItems: 'center',
    paddingVertical: 5,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  modalOptionText: {
    fontSize: 16,
    color: 'white',
  },
  modalCancel: {
    alignItems: 'center',
    backgroundColor: 'gray',
    paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  modalCancelText: {
    color: 'white',
    fontSize: 16,
  },
});

export default App;
