import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, ScrollView, ToastAndroid } from 'react-native';
import syncStorage from 'react-native-sync-storage';
import { useNavigation } from '@react-navigation/native';
import Loader from '../components/Loader';


const HostelManagerScreen = () => {
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('[DEBUG] 🚀 HostelManagerScreen mounted');

        // Get user_profile from syncStorage
        const storedProfile = syncStorage.get('user_profile');
        console.log('[DEBUG] 📦 Stored profile:', storedProfile);

        if (!storedProfile) {
          Alert.alert('Error', 'No user profile found in syncStorage.');
          setLoading(false);
          return;
        }

        const parsedProfile = JSON.parse(storedProfile);
        console.log('[DEBUG] ✅ Parsed profile:', parsedProfile);

        if (!parsedProfile.cnic) {
          Alert.alert('Error', 'CNIC not found in stored profile.');
          setLoading(false);
          return;
        }

        // API call
        console.log('[DEBUG] 🌍 Verifying CNIC:', parsedProfile.cnic);

        const response = await fetch('https://wwh.punjab.gov.pk/api/userdatathroughcnic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ cnic: parsedProfile.cnic }),
        });

        console.log('[DEBUG] 📡 API Status:', response.status);

        const result = await response.json();
        console.log('[DEBUG] 🔎 API Response JSON:', result);

        if (response.ok && result.success && result.user) {
          // Store user in syncStorage
          syncStorage.set('user', JSON.stringify(result.user));
          console.log('User synced with syncStorage.');

          // Extract role
          const userRole = result.user.roles[0];
          console.log('User role:', userRole);

          // Navigate based on role
          navigateBasedOnRole(userRole, result.user);
        } else {
          Alert.alert('Error', result.message || 'User not found.');
        }
      } catch (error) {
        console.error('[DEBUG] ❌ Error in HostelManagerScreen:', error);
        Alert.alert('Error', 'Something went wrong while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const navigateBasedOnRole = (role, user) => {
    switch (role) {
      case 1:
        navigation.navigate('DashboardA', { user });
        break;
      case 2:
        navigation.navigate('DashboardM', { user });
        break;
      case 3:
        navigation.navigate('Dashboard', { user });
        break;
      case 5:
        navigation.navigate('DashboardDeo', { user });
        break;
      default:
        ToastAndroid.show('Unknown role.', ToastAndroid.SHORT);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Loader />
        <Text className="mt-4 text-gray-700 italic">Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-lg text-gray-700">Waiting for role-based navigation...</Text>
    </ScrollView>
  );
};

export default HostelManagerScreen;
