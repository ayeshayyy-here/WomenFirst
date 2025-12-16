import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import syncStorage from 'react-native-sync-storage';
import LinearGradient from 'react-native-linear-gradient';
import EncryptedStorage from 'react-native-encrypted-storage';
import { useNavigation } from '@react-navigation/native';
const Sidebar = ({ isVisible, onClose }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownOpen1, setIsDropdownOpen1] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(syncStorage.get('user'));
        const userId = user?.id;
        if (userId) {
          const response = await fetch(`https://wwh.punjab.gov.pk/api/getPdetail-check/${userId}`);
          if (response.ok) {
            const result = await response.json();
            const data = result.data[0];
            const profileImageUrl = data.profile
              ? `https://wwh.punjab.gov.pk/uploads/image/${data.profile}`
              : null;
            setProfileImage(profileImageUrl);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const user = JSON.parse(syncStorage.get('user'));
  const username = user?.name;

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleDropdown1 = () => {
    setIsDropdownOpen1(!isDropdownOpen1);
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

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>

      <LinearGradient
        colors={['#f0f4ff', '#ffffff']} // Light blue to white gradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sidebarGradient}
      >
        {/* Background Image */}
        <Image
          source={require('../../assets/images/register.png')} 
          style={styles.backgroundImage}
        />

        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: profileImage || 'https://placekitten.com/100/100',
            }}
            style={styles.image}
          />
          
        </View>

        {/* Username */}
        <Text style={styles.nameText}>{username}</Text>

        {/* Collapsible Applications Section */}
        <View style={styles.items}>
          
<TouchableOpacity style={styles.collapsibleHeader}  onPress={() => navigation.navigate('DashboardM')}>
            <Icon name="dashboard" size={20} color="black" />
            <Text style={styles.text}>Dashboard</Text>
          
          </TouchableOpacity>
          <TouchableOpacity style={styles.collapsibleHeader} onPress={toggleDropdown}>
            <Icon name="tasks" size={20} color="black" />
            <Text style={styles.text}>Applications</Text>
            <Icon name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} size={10} color="black" style={styles.dropdownIcon} />
          </TouchableOpacity>
          
          {/* Dropdown Items */}
          {isDropdownOpen && (
            <View style={styles.dropdown}>
      <TouchableOpacity 
        style={styles.dropdownItem} 
        onPress={() => navigation.navigate('PendingApplication')}
      >
        <Text style={styles.textd}>Pending Applications</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.dropdownItem} 
        onPress={() => navigation.navigate('AppRejApplication', { status: 'rejected' })}
      >
        <Text style={styles.textd}>Rejected Applications</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.dropdownItem} 
        onPress={() => navigation.navigate('AppRejApplication', { status: 'accepted' })}
      >
        <Text style={styles.textd}>Accepted Applications</Text>
      </TouchableOpacity>
            </View>
          )}




<TouchableOpacity style={styles.collapsibleHeader}  onPress={() => navigation.navigate('HostelRegistration')}>
            <Icon name="home" size={20} color="black" />
            <Text style={styles.text}>Hostel Registration</Text>
          
          </TouchableOpacity>

          <TouchableOpacity style={styles.collapsibleHeader} onPress={toggleDropdown1}>
            <Icon name="tasks" size={20} color="black" />
            <Text style={styles.text}>Rooms</Text>
            <Icon name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} size={10} color="black" style={styles.dropdownIcon} />
          </TouchableOpacity>
          
          {/* Dropdown Items */}
          {isDropdownOpen1 && (
            <View style={styles.dropdown}>
      <TouchableOpacity 
        style={styles.dropdownItem} 
        onPress={() => navigation.navigate('AddRooms')}
      >
        <Text style={styles.textd}>Add Room</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.dropdownItem} 
        onPress={() => navigation.navigate('RoomsList')}
      >
        <Text style={styles.textd}>Rooms List</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.dropdownItem} 
        onPress={() => navigation.navigate('RoomsM')}
      >
        <Text style={styles.textd}>Rooms Status</Text>
      </TouchableOpacity>
            </View>
          )}





        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="sign-out" size={20} color="#fff" style={styles.logoutIcon} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sidebarGradient: {
    width: '70%',
    height: '100%',
    position: 'absolute',
    right: 0,
    top: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: -3, height: 3 },
    shadowRadius: 10,
    elevation: 10,
    justifyContent: 'space-between', // Ensure the logout button sticks at the bottom
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    borderRadius: 40,
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: '#fff',
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: '#e6f0ff', // Light background behind the image
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 50,
  },
  nameText: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 5,
    color: 'black', // Dark blue color for text
    bottom: '10%',
  },
  items: {
    marginTop: 2,
    bottom: '20%',
  },
  collapsibleHeader: {
    backgroundColor: '#d3d3d3', // Light blue background for collapsible header
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 5,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  text: {
    marginLeft: 15,
    fontSize: 14,
    color: 'black', // Dark blue color for text
    fontWeight: '600',
  },
  textd: {
    marginLeft: 25,
    fontSize: 12,
    color: 'black',
  },
  dropdownIcon: {
    marginLeft: 'auto',
  },
  dropdown: {
   
   
  },
  dropdownItem: {
    paddingVertical: 6,
    marginVertical: 4,
    backgroundColor: '#d3d3d3', // Slightly darker blue for dropdown background
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
 // Light blue divider
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: '40%',
    left:  '10%',
    opacity: 0.1, // Subtle background image
    resizeMode: 'cover',
  },
  logoutContainer: {
    marginBottom: 30, // Add some margin at the bottom of the screen
    alignItems: 'center', // Center the logout button horizontally
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:  'gray', // Light gray background for the logout button
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  logoutIcon: {
    marginRight: 10, // Add space between the icon and text
  },
});

export default Sidebar;
