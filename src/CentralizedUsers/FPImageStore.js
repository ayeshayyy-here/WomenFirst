import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  DeviceEventEmitter,
  ToastAndroid,
  NativeModules,
  ActivityIndicator,
} from 'react-native';
import syncStorage from 'react-native-sync-storage';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

const {ZKTecoModule} = NativeModules;

const FPImageStore = ({navigation}) => {
  const [fpImage, setFpImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState('Not Initialized');

  /* ================= READ STORAGE ================= */
  const rawProfile = syncStorage.get('user_profile');
  console.log('📦 RAW syncStorage user_profile:', rawProfile);

  const userProfile = JSON.parse(rawProfile || '{}');
  console.log('📦 PARSED user_profile:', userProfile);

  const centralized_userid =
    userProfile?.id || userProfile?.user_id || 999;

  const cnic = userProfile?.cnic || '3520212345678';
  const project_name = 'Ambassador';

  console.log('🧾 FINAL VALUES →', {
    centralized_userid,
    cnic,
    project_name,
  });

  /* ================= INITIALIZE DEVICE ================= */
  const initializeDevice = () => {
    console.log('🔌 Initializing biometric device...');

    ZKTecoModule.onBnStart()
      .then(res => {
        console.log('✅ Device initialized response:', res);
        setDeviceStatus('Device Connected');
        ToastAndroid.show('Device Connected', ToastAndroid.SHORT);
      })
      .catch(err => {
        console.log('❌ Device error:', err);
        setDeviceStatus('Device Not Connected');
        Alert.alert('Error', 'Biometric device not connected');
      });
  };

  /* ================= DEVICE EVENT LISTENER ================= */
  useEffect(() => {
    console.log('👂 Registering ImageReceivedEvent listener');

    const listener = DeviceEventEmitter.addListener(
      'ImageReceivedEvent',
      event => {
        console.log('📸 ImageReceivedEvent EVENT:', event);

        const {imageBase64} = event;
        console.log('🖼️ Base64 Image Length:', imageBase64?.length);

        setFpImage(imageBase64);

        const bioObj = {image: imageBase64};
        syncStorage.set('biometric_obj', bioObj);

        console.log('💾 biometric_obj saved to syncStorage:', bioObj);
      },
    );

    return () => {
      console.log('🧹 Removing ImageReceivedEvent listener');
      listener.remove();
    };
  }, []);

  /* ================= API SUBMIT ================= */
  const submitFPImage = async () => {
    console.log('🚀 Submit button pressed');

    if (!fpImage) {
      console.log('❌ No fingerprint image available');
      Alert.alert('Error', 'Please scan fingerprint first');
      return;
    }

    if (!cnic || !centralized_userid) {
      console.log('❌ Missing user data');
      Alert.alert('Error', 'User data missing');
      return;
    }

    const payload = {
      cnic: cnic,
      centralized_userid: centralized_userid,
      project_name: project_name,
      device_image: `data:image/png;base64,${fpImage}`,
    };

    console.log('📤 API PAYLOAD:', payload);

    setLoading(true);

    try {
      const response = await fetch(
        'https://dashboard-wdd.punjab.gov.pk/api/store-fp-image',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      console.log('📡 API STATUS:', response.status);

      const data = await response.json();
      console.log('📥 API RESPONSE:', data);

      if (response.ok) {
        Alert.alert('✅ Success', 'Fingerprint image saved successfully', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('DashboardWDD'),
          },
        ]);
      } else {
        Alert.alert('❌ Error', JSON.stringify(data));
      }
    } catch (error) {
      console.log('❌ NETWORK ERROR:', error);
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
  return (
    <LinearGradient colors={['#f3e7ff', '#ffffff']} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Fingerprint Verification</Text>

        <View style={styles.statusBox}>
          <Icon name="fingerprint" size={20} color="#003060" />
          <Text style={styles.statusText}>{deviceStatus}</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={initializeDevice}>
          <Icon name="usb" size={18} color="#fff" />
          <Text style={styles.btnText}> Initialize Device</Text>
        </TouchableOpacity>

        {fpImage && (
          <>
            <Text style={styles.previewText}>Captured Fingerprint</Text>
            <Image
              source={{uri: `data:image/png;base64,${fpImage}`}}
              style={styles.image}
            />
          </>
        )}

        <TouchableOpacity style={styles.submitBtn} onPress={submitFPImage}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="cloud-upload" size={18} color="#fff" />
              <Text style={styles.btnText}> Save Fingerprint</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default FPImageStore;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#003060',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    gap: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#003060',
  },
  btn: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#003060',
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },
  submitBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#27ae60',
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  previewText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  image: {
    height: 180,
    resizeMode: 'contain',
    marginVertical: 15,
  },
});
