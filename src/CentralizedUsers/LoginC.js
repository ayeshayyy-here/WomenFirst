import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Dimensions,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  NativeModules,
  ToastAndroid,
  DeviceEventEmitter,
} from 'react-native';
import {LinearGradient} from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import EncryptedStorage from 'react-native-encrypted-storage';
import syncStorage from 'react-native-sync-storage';
import ImageView from 'react-native-image-viewing';
import notifee, {AndroidImportance} from '@notifee/react-native';

const LoginC = ({navigation}) => {
  const [cnic, setCnic] = useState('');
  const [mobile, setMobile] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [filesVisibile, setFilesVisible] = useState(false);
  const [imageBase64, setImageBase64] = React.useState(null);
  const {ZKTecoModule} = NativeModules;

  const initializeDevice = () => {
    ZKTecoModule.onBnStart()
      .then(fingerprint => {
        console.log('fingerprint', fingerprint);
        ToastAndroid.show(fingerprint, ToastAndroid.LONG);
        return;
      })
      .catch(error => {
        console.error(error);
      });
  };
  const biometricObj = syncStorage.get('biometric_obj');
  const FPImage = biometricObj && biometricObj.image ? biometricObj.image : '';
  // You can also add some initial logging when the component mounts
  useEffect(() => {
    const eventListener = DeviceEventEmitter.addListener(
      'ImageReceivedEvent',
      event => {
        const {imageBase64} = event;
        console.log('Image Base64', imageBase64);

        const img_obj = {
          image: imageBase64, //add other fields as needed to object such as Ambassador CNIC
        };

        syncStorage.set('biometric_obj', img_obj);
        setImageBase64(imageBase64);
      },
    );

    // Cleanup function: remove listener when component unmounts
    return () => {
      eventListener.remove();
    };
  }, []); // empty array = run once on mount

  // 🔔 Simple helper: show notification in tray
  const showNotification = async (title, body) => {
    try {
      console.log('Showing notification:', title, body);
      await notifee.requestPermission();

      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'General Notifications',
        importance: AndroidImportance.HIGH,
      });

      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId,
          smallIcon: 'wwh_logo',
          pressAction: {id: 'default'},
        },
      });

      console.log('✅ Notification displayed successfully!');
    } catch (error) {
      console.log('❌ Notification error:', error);
    }
  };

  // 🔔 Fetch both APIs and show notifications
  const fetchAndShowNotifications = async cnicNumber => {
    try {
      // 1️⃣ FAP notification
      const fapRes = await fetch(
        `https://fa-wdd.punjab.gov.pk/api/fapnotification/${cnicNumber}`,
      );
      const fapData = await fapRes.json();
      if (fapData.header && fapData.message) {
        await showNotification(fapData.header, fapData.message);
      }

      // 2️⃣ YPC notification
      const ypcRes = await fetch(
        `https://ypc-wdd.punjab.gov.pk/api/ypcnotification/${cnicNumber}`,
      );
      const ypcData = await ypcRes.json();
      if (ypcData.header && ypcData.message) {
        await showNotification(ypcData.header, ypcData.message);
      }
    } catch (error) {
      console.log('Notification fetch error:', error);
    }
  };
  // Check for existing session on component mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('Checking for existing session...');
        const session = await EncryptedStorage.getItem('user_session');
        const profile = syncStorage.get('user_profile');

        console.log('EncryptedStorage session:', session);
        console.log('syncStorage profile:', profile);

        if (session && profile) {
          const parsedSession = JSON.parse(session);
          const parsedProfile = JSON.parse(profile);

          console.log('Parsed session:', parsedSession);
          console.log('Parsed profile:', parsedProfile);

          // Ensure token is still valid (basic expiry check)
          const now = new Date().getTime();
          const sessionAge = now - parsedSession.timestamp;
          const oneMonth = 30 * 24 * 60 * 60 * 1000; // 30 days

          console.log('Session age:', sessionAge, 'ms');
          console.log(
            'Session valid for:',
            oneMonth - sessionAge,
            'ms remaining',
          );

          if (
            parsedSession.token &&
            parsedProfile.cnic &&
            sessionAge < oneMonth
          ) {
            console.log('Valid session found, navigating to Dashboard');
            navigation.navigate('DashboardWDD');
          } else {
            console.log('Session expired or invalid, clearing storage');
            // Clear expired session
            await EncryptedStorage.removeItem('user_session');
            syncStorage.remove('user_profile');
          }
        } else {
          console.log('No valid session found');
        }
      } catch (error) {
        console.log('Session check error:', error);
      }
    };

    checkSession();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!cnic || cnic.length !== 13 || !/^\d+$/.test(cnic)) {
      newErrors.cnic = 'CNIC must be exactly 13 digits';
    }
    if (!mobile || mobile.length < 11 || !/^\d+$/.test(mobile)) {
      newErrors.mobile = 'Contact must be at least 11 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // const handleLogin = async () => {
  //   if (!validateForm()) return;

  //   setIsLoading(true);
  //   try {
  //     console.log('Making login request with:', { CNIC: cnic, Contact: mobile });
  //      const response = await fetch('https://dashboard-wdd.punjab.gov.pk/api/login', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         CNIC: cnic,
  //         Contact: mobile
  //       })
  //     });

  //     const data = await response.json();
  //     console.log('Login response:', data);

  //     if (response.ok) {
  //       console.log('Login successful, storing user data');
  //       await storeUserData(data.user);
  //       Alert.alert('Success', 'Login successful!', [
  //         { text: 'OK', onPress: () => navigation.navigate('DashboardWDD') }
  //       ]);
  //     } else {
  //       if (response.status === 409) {
  //         Alert.alert('Error', data.message || 'CNIC/Contact mismatch');
  //       } else if (response.status === 422) {
  //         setErrors(prev => ({ ...prev, ...data.errors }));
  //         Alert.alert('Validation Error', 'Please check your inputs');
  //       } else if (response.status === 404) {
  //         Alert.alert('Error', data.message || 'No matching record found. Please register first.');
  //       } else {
  //         Alert.alert('Error', data.message || 'Login failed. Please try again.');
  //       }
  //     }
  //   } catch (error) {
  //     Alert.alert('Error', 'Network error. Please check your connection and try again.');
  //     console.error('Login error:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log('Making login request with:', {CNIC: cnic, Contact: mobile});
      const response = await fetch(
        'https://dashboard-wdd.punjab.gov.pk/api/login',
        {
          // const response = await fetch('https://b62388893531.ngrok-free.app/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            CNIC: cnic,
            Contact: mobile,
          }),
        },
      );

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        console.log('Login successful, storing user data');
        await storeUserData(data.user);
        await fetchAndShowNotifications(cnic);
        let targetScreen = 'DashboardWDD'; // default
        if (data.user.role === 'ManagerH') {
          targetScreen = 'HostelManagerScreen';
        } else if (data.user.role === 'user') {
          targetScreen = 'DashboardWDD';
        } else if (data.user.role === 'Admin') {
          targetScreen = 'ImportCentralizedUsers';
        }
        // you can extend here if you add 'admin' later

        Alert.alert('Success', 'Login successful!', [
          {text: 'OK', onPress: () => navigation.navigate(targetScreen)},
        ]);
      } else {
        if (response.status === 409) {
          Alert.alert('Error', data.message || 'CNIC/Contact mismatch');
        } else if (response.status === 422) {
          setErrors(prev => ({...prev, ...data.errors}));
          Alert.alert('Validation Error', 'Please check your inputs');
        } else if (response.status === 404) {
          Alert.alert(
            'Error',
            data.message || 'No matching record found. Please register first.',
          );
        } else {
          Alert.alert(
            'Error',
            data.message || 'Login failed. Please try again.',
          );
        }
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Network error. Please check your connection and try again.',
      );
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // updated storeUserData
  const storeUserData = async userData => {
    try {
      console.log('[DEBUG] 📦 Storing user data in both storage systems');
      console.log('[DEBUG] Original API user data:', userData);

      // Prepare data for EncryptedStorage
      const encryptedData = {
        token: userData?.token || 'auth_token_placeholder',
        user: {
          cnic: userData.CNIC,
          contact: userData.Contact,
          Name: userData.Name,
          D_O_B: userData.D_O_B,
          Email: userData.Email,
          District: userData.District,
          Tehsil: userData.Tehsil,
          Address: userData.address,
          biometric_obj:userData.biometric_obj,
        },
        timestamp: new Date().getTime(),
      };

      console.log('[DEBUG] 🔐 Data for EncryptedStorage:', encryptedData);

      // Store in EncryptedStorage (secure)
      await EncryptedStorage.setItem(
        'user_session',
        JSON.stringify(encryptedData),
      );

      // Verify EncryptedStorage
      const encryptedVerify = await EncryptedStorage.getItem('user_session');
      console.log('[DEBUG] 🔍 EncryptedStorage verification:', encryptedVerify);

      // Prepare data for syncStorage
      const syncData = {
        name: userData.Name,
        cnic: userData.CNIC,
        dob: userData.D_O_B,
        contact: userData.Contact,
        email: userData.Email,
        district: userData.District,
        tehsil: userData.Tehsil,
        address: userData.Address,
        biometric_obj:userData.biometric_obj,
        timestamp: new Date().getTime(),
      };

      console.log('[DEBUG] ⚡ Data for syncStorage:', syncData);

      // Store in syncStorage (quick access for other screens)
      syncStorage.set('user_profile', JSON.stringify(syncData));

      // Verify syncStorage
      const syncVerify = syncStorage.get('user_profile');
      console.log('[DEBUG] 🔍 syncStorage verification:', syncVerify);

      console.log(
        '[DEBUG] ✅ Data stored in both EncryptedStorage and syncStorage successfully!',
      );
    } catch (error) {
      console.error('[DEBUG] ❌ Error storing user data:', error);
      Alert.alert('Error', 'Failed to save login data. Please try again.');
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      {/* Curved Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={['#8e44ad', '#9b59b6']}
          style={styles.gradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}>
          <View style={styles.headerCurve} />
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}>
        {/* Combined Header Content */}
        <View style={styles.headerContent}>
          <Image
            source={{uri: 'https://cmp.punjab.gov.pk/img/maryam.png'}}
            style={styles.headerLogo}
            resizeMode="contain"
          />

          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>WOMEN FIRST!</Text>
            <View style={styles.taglineBox}>
              <Text style={styles.urduTagline}>ایک ایپ، آٹھ سہولتیں</Text>
              <Text style={styles.englishTagline}>
                One App, Eight Facilities
              </Text>
            </View>
          </View>

          <Image
            source={require('../../assets/images/women.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        {/* Login Form - Now with more height */}
        <View style={styles.loginCard}>
          <View style={styles.titleContainer}>
            <Text style={styles.loginTitle}>Welcome!</Text>
            <Text style={styles.loginSubtitle}>Sign in to continue</Text>
          </View>

          {/* CNIC Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>CNIC Number</Text>
            <View
              style={[styles.inputContainer, errors.cnic && styles.errorInput]}>
              <Icon
                name="credit-card"
                size={20}
                color="#8e44ad"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Enter 13-digit CNIC"
                placeholderTextColor="#aaa"
                value={cnic}
                onChangeText={setCnic}
                keyboardType="numeric"
                maxLength={13}
              />
            </View>
            {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}
          </View>

          {/* Mobile Field */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Mobile Number</Text>
            <View
              style={[
                styles.inputContainer,
                errors.mobile && styles.errorInput,
              ]}>
              <Icon
                name="phone"
                size={20}
                color="#8e44ad"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="03XXXXXXXXX"
                placeholderTextColor="#aaa"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
            {errors.mobile && (
              <Text style={styles.errorText}>{errors.mobile}</Text>
            )}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}>
            <LinearGradient
              colors={['#8e44ad', '#9b59b6']}
              style={styles.gradientButton}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}>
              <Text style={styles.loginButtonText}>
                {isLoading ? 'PLEASE WAIT...' : 'LOGIN'}
              </Text>
              <Icon
                name="arrow-forward"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={initializeDevice}
            style={{
              borderWidth: 2,
              borderRadius: 12,
              borderColor: '#003060',
              backgroundColor: '#ffffff',
              paddingVertical: 16,
              paddingHorizontal: 24,
              flex: 1,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              marginHorizontal: 8,
              marginTop: 10,
            }}
            activeOpacity={0.7}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Icon name="fingerprint" size={20} color="#003060" />

              <Text
                style={{
                  marginLeft: 12,
                  fontSize: 12,
                  fontWeight: '600',
                  color: '#003060',
                }}>
                Scan Fingerprint
              </Text>
            </View>
          </TouchableOpacity>

          {FPImage && (
            <View style={{flex: 1, marginTop: 10}}>
              <Text
                style={{
                  color: '#000',
                  fontSize: 14,
                  fontWeight: 'bold',
                }}>
                Captured Fingerprint From Biometric Device:
              </Text>
              <TouchableOpacity
                style={{
                  marginTop: 10,
                  backgroundColor: '#D3D3D3',
                  borderRadius: 10,
                  height: 150,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setFilesVisible(true);
                }}>
                <Image
                  source={{
                    uri: `data:image/png;base64,${FPImage}`,
                  }}
                  style={{
                    width: '50%',
                    alignSelf: 'center',
                    height: 140,
                  }}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Registration Prompt */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => {
            console.log(syncStorage.get('biometric_obj'));
            navigation.navigate('RegisterC');
            }}>
              <Text style={styles.registerLink}>Register Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer now perfectly positioned at the bottom */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© Women Development Department</Text>
        </View>
      </ScrollView>
      <ImageView
        images={[
          {
            uri: `data:image/png;base64,${FPImage}`,
          },
        ]}
        imageIndex={0}
        visible={filesVisibile}
        onRequestClose={() => setFilesVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBackground: {
    height: height * 0.28, // Slightly increased height
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  gradient: {
    flex: 1,
  },
  headerCurve: {
    position: 'absolute',
    bottom: -50,
    height: 60,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: height * 0.05, // Better vertical positioning
    marginBottom: 10,
  },
  headerLogo: {
    width: 100,
    height: 100,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
    marginBottom: 8,
  },
  taglineBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  urduTagline: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  englishTagline: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    minHeight: height * 0.55, // Increased height
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f1f1',
  },
  titleContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8e44ad',
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: 12,
    color: '#8e44ad',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 18,
  },
  inputLabel: {
    color: '#556b70ff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#2d3436',
    fontSize: 14,
    height: '100%',
  },
  errorInput: {
    borderColor: '#d63031',
  },
  errorText: {
    color: '#d63031',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  loginButton: {
    borderRadius: 10,
    height: 50,
    marginTop: 15,
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#636e72',
    fontSize: 12,
  },
  registerLink: {
    color: '#8e44ad',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  footer: {
    marginTop: 'auto', // Pushes footer to bottom
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  footerText: {
    color: '#636e72',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default LoginC;
