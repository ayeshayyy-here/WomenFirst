import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SyncStorage from 'react-native-sync-storage';

const BottomFPButton = ({navigation}) => {
  const userProfile = JSON.parse(SyncStorage.get('user_profile') || '{}');
  const biometricObj = userProfile?.biometric_obj;

  console.log('🔍 userProfile from SyncStorage:', userProfile);
  console.log('🔍 biometric_obj:', biometricObj);

  const isFound = biometricObj && biometricObj.length > 0;
  const fpImageURL = isFound
    ? `https://8e4c942f274e.ngrok-free.app/assets/hc/verifier/biometrics/device/${biometricObj}`
    : null;

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 14,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
        borderWidth: 1,
        borderColor: '#e6e6e6',
      }}>

      {/* STATUS BADGE */}
      {isFound && (
        <View
          style={{
            alignSelf: 'center',
            backgroundColor: '#27ae60',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 20,
            marginBottom: 0,
          }}>
          <Text style={{color: '#fff', fontSize: 12, fontWeight: '600'}}>
            ✔ Fingerprint found in storage
          </Text>
        </View>
      )}

      {/* SHOW FP IMAGE IF FOUND */}
      {isFound && (
        <Image
          source={{uri: fpImageURL}}
          style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            alignSelf: 'center',
            marginBottom: 0,
          }}
        />
      )}

      {/* ACTION BUTTON */}
      <TouchableOpacity
        onPress={() => {
          console.log('👉 Scan Fingerprint button pressed');
          console.log('👉 SyncStorage biometric_obj:', biometricObj);
          navigation.navigate('FPImageStore');
        }}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#003060',
          paddingVertical: 14,
          borderRadius: 12,
        }}>

        <Icon name="fingerprint" size={22} color="#ffffff" />

        <Text
          style={{
            color: '#ffffff',
            fontSize: 16,
            fontWeight: '700',
            marginLeft: 8,
          }}>
          Scan Fingerprint
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomFPButton;
