import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import syncStorage from 'react-native-sync-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const loadProfileData = () => {
      try {
        const profile = syncStorage.get('user_profile');
        if (profile) {
          setUserData(JSON.parse(profile));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    loadProfileData();
  }, []);

  const handleLogout = () => {
    syncStorage.remove('user_profile');
    navigation.replace('LoginC');
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#1a0b2e', '#3d1b6e', '#6a3093']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
           <Image
  source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} // Change women/men and number// Replace with your avatar image
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editIcon}>
              <Icon name="edit" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{userData.email || 'User Profile'}</Text>
          <Text style={styles.userTitle}>Women Development Department</Text>
        </View>

        {/* Profile Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="person" size={24} color="#7d5fff" />
            <Text style={styles.cardTitle}>Personal Information</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="credit-card" size={20} color="#7d5fff" style={styles.detailIcon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>CNIC Number</Text>
              <Text style={styles.detailValue}>{userData.cnic || 'Not available'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="phone" size={20} color="#7d5fff" style={styles.detailIcon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Contact Number</Text>
              <Text style={styles.detailValue}>{userData.contact || 'Not available'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="email" size={20} color="#7d5fff" style={styles.detailIcon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Email Address</Text>
              <Text style={styles.detailValue}>{userData.email || 'Not available'}</Text>
            </View>
          </View>
        </View>

        {/* Address Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="location-on" size={24} color="#7d5fff" />
            <Text style={styles.cardTitle}>Address Information</Text>
          </View>

          <View style={styles.detailRow}>
            <Icon name="map" size={20} color="#7d5fff" style={styles.detailIcon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>District</Text>
              <Text style={styles.detailValue}>{userData.district || 'Not available'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Icon name="place" size={20} color="#7d5fff" style={styles.detailIcon} />
            <View style={styles.detailTextContainer}>
              <Text style={styles.detailLabel}>Tehsil</Text>
              <Text style={styles.detailValue}>{userData.tehsil || 'Not available'}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('EditProfile')}>
          <Text style={styles.buttonText}>Edit Profile</Text>
          <Icon name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
          <Text style={[styles.buttonText, styles.logoutButtonText]}>Logout</Text>
          <Icon name="exit-to-app" size={20} color="#ff4757" />
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Women Development Department - Punjab</Text>
      </View>
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a0b2e',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#7d5fff',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7d5fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userTitle: {
    color: '#bbb',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(125, 95, 255, 0.3)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(125, 95, 255, 0.2)',
    paddingBottom: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailIcon: {
    marginRight: 15,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    color: '#bbb',
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    backgroundColor: 'rgba(125, 95, 255, 0.2)',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(125, 95, 255, 0.5)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 71, 87, 0.1)',
    borderColor: 'rgba(255, 71, 87, 0.3)',
  },
  logoutButtonText: {
    color: '#ff4757',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
  },
  footerText: {
    color: '#bbb',
    fontSize: 12,
  },
});

export default ProfileScreen;