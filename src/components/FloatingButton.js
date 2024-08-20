import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // or any other icon library
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient'; // Import LinearGradient

const FloatingButton = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fabContainer} onPress={onPress}>
      <LinearGradient
        colors={['#352E64', '#412E63', '#632D61', '#982B5D', '#C82A59']}
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

  const handleLogout = async () => {
    try {
      // Remove user data from encrypted storage
      await EncryptedStorage.removeItem('user');
      await EncryptedStorage.removeItem('formData'); // If you also want to clear form data

      // Navigate to the login screen
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleConfirmLogout = () => {
    handleLogout();
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
                colors={['#352E64', '#412E63', '#632D61', '#982B5D', '#C82A59']}
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
    bottom: 30, // Increased to prevent overlap with other content
    right: 30,  // Increased to position the button more prominently
    zIndex: 1000, // Ensures it appears above other components
    elevation: 8, // Adds shadow for Android
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
