import React, { useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import syncStorage from 'react-native-sync-storage';

const SessionChecker = ({ navigation }) => {
  useEffect(() => {
    const checkSession = async () => {
      console.log('🔍 Checking session in SessionChecker...');
      try {
        const session = await EncryptedStorage.getItem('user_session');
        let profile = syncStorage.get('user_profile');

        console.log('🗝️ EncryptedStorage found:', session);
        console.log('⚡ syncStorage found:', profile);

        if (!session) {
          console.log('❌ No EncryptedStorage session found');
          return goToLogin();
        }

        const parsedSession = JSON.parse(session);
        const now = Date.now();
        const sessionAge = now - parsedSession.timestamp;
        const oneMonth = 30 * 24 * 60 * 60 * 1000;

        // Check expiry
        if (!parsedSession.token || sessionAge > oneMonth) {
          console.log('❌ Session expired or token missing');
          await EncryptedStorage.removeItem('user_session');
          syncStorage.remove('user_profile');
          return goToLogin();
        }

        // Try to recover syncStorage if missing
        if (!profile) {
          console.log('⚠️ SyncStorage empty, rebuilding from EncryptedStorage...');
          const rebuild = {
            name: parsedSession.user?.Name,
            cnic: parsedSession.user?.cnic,
            dob: parsedSession.user?.D_O_B,
            contact: parsedSession.user?.contact,
            email: parsedSession.user?.Email,
            district: parsedSession.user?.District,
            tehsil: parsedSession.user?.Tehsil,
            address: parsedSession.user?.Address,
            timestamp: now,
          };
          syncStorage.set('user_profile', JSON.stringify(rebuild));
          profile = JSON.stringify(rebuild);
          console.log('✅ SyncStorage rebuilt successfully');
        }

        const parsedProfile = JSON.parse(profile);

        // Everything OK — navigate based on role
        const userRole = parsedSession?.user?.role || 'user';
        console.log('✅ Valid session found, role:', userRole);

        let targetScreen = 'DashboardWDD';
        if (userRole === 'ManagerH') targetScreen = 'HostelManagerScreen';
        else if (userRole === 'Admin') targetScreen = 'ImportCentralizedUsers';

        navigation.reset({
          index: 0,
          routes: [{ name: targetScreen }],
        });
      } catch (error) {
        console.log('❌ Session check error:', error);
        goToLogin();
      }
    };

    const goToLogin = () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginC' }],
      });
    };

    checkSession();
  }, [navigation]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
      }}
    >
      <ActivityIndicator size="large" color="#8e44ad" />
    </View>
  );
};

export default SessionChecker;
