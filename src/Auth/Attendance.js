import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    PermissionsAndroid,
    ToastAndroid,
    Platform,
    StyleSheet,
    Image,
    Dimensions,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../components/Loader';
import Icon from 'react-native-vector-icons/FontAwesome';
import syncStorage from 'react-native-sync-storage';
import VisitorIcon from '../../assets/images/location.png';
import RouteIcon from '../../assets/images/route.png';

const { width, height } = Dimensions.get('window');
const Attendance = ({ navigation }) => {
    console.log('🎯 Attendance Component - RENDER STARTED');
    console.log('📱 Screen Dimensions:', { width, height });
    
    const [loading, setLoading] = useState(false);
    const [currentDistance, setCurrentDistance] = useState(null);
    const [location, setLocation] = useState({ latitude: '', longitude: '' });
    const [fixedLocation, setFixedLocation] = useState(null);
    const [checkedIn, setCheckedIn] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const toleranceRadius = 35; // Allowable range in meters

    console.log('📊 Initial State Values:', {
        loading,
        currentDistance,
        location,
        fixedLocation,
        checkedIn,
        statusMessage,
        toleranceRadius
    });

    useEffect(() => {
        console.log('🔄 useEffect TRIGGERED - Component mounted or fixedLocation changed');
        console.log('📌 fixedLocation value:', fixedLocation);

        const init = async () => {
            console.log('🚀 INIT FUNCTION STARTED');
            setLoading(true);
            console.log('⏳ Loading set to: true');

            const user = JSON.parse(syncStorage.get('user')); // Get user info
            console.log('👤 User data from syncStorage:', user);
            const userId = user?.id;
            console.log('🆔 User ID:', userId);

            await fetchTodayAttendance(userId); // Fetch attendance status
            await fetchFixedLocation(userId); // Fetch fixed location from API

            const permissionGranted = await requestLocationPermission();
            console.log('📍 Location Permission Granted:', permissionGranted);
            
            if (!permissionGranted) {
                console.log('❌ Location permission denied, stopping initialization');
                setLoading(false);
                console.log('⏹️ Loading set to: false');
                return;
            }

            console.log('🎯 Getting current position...');
            Geolocation.getCurrentPosition(
                (position) => {
                    console.log('✅ Geolocation SUCCESS - Position:', position);
                    const { latitude, longitude } = position.coords;
                    console.log('📡 Current Coordinates:', { latitude, longitude });
                    
                    setLocation({ latitude, longitude });
                    console.log('📍 Location state updated');

                    if (fixedLocation) {
                        console.log('📐 Calculating distance with fixed location:', fixedLocation);
                        const distance = calculateDistance(
                            fixedLocation.latitude,
                            fixedLocation.longitude,
                            latitude,
                            longitude
                        );
                        console.log('📏 Calculated Distance:', distance, 'meters');
                        
                        setCurrentDistance(distance);
                        console.log('📏 Current distance state updated');

                        if (distance <= toleranceRadius) {
                            console.log('✅ Within tolerance radius');
                            setStatusMessage('You are within the hostel premises.');
                        } else {
                            console.log('❌ Outside tolerance radius');
                            setStatusMessage('You are outside the hostel premises.');
                        }
                        console.log('📝 Status message updated:', statusMessage);
                    } else {
                        console.log('⚠️ No fixed location available for distance calculation');
                    }
                    
                    setLoading(false);
                    console.log('⏹️ Loading set to: false');
                },
                (error) => {
                    console.error('❌ Geolocation ERROR:', error);
                    console.log('📋 Error details:', {
                        code: error.code,
                        message: error.message,
                        PERMISSION_DENIED: error.PERMISSION_DENIED,
                        POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
                        TIMEOUT: error.TIMEOUT
                    });
                    setStatusMessage('Unable to get location. Please enable location services.');
                    console.log('📝 Status message updated due to error');
                    setLoading(false);
                    console.log('⏹️ Loading set to: false');
                },
                { 
                    enableHighAccuracy: true, 
                    timeout: 20000, 
                    maximumAge: 1000 
                }
            );
        };

        init();
    }, [fixedLocation]); // Re-run when fixed location updates

    const fetchTodayAttendance = async (userId) => {
        console.log('📅 fetchTodayAttendance CALLED with userId:', userId);
        try {
            console.log('🌐 Making API call to:', `https://wwh.punjab.gov.pk/api/attendanceCheck/${userId}`);
            const response = await fetch(`https://wwh.punjab.gov.pk/api/attendanceCheck/${userId}`);
            console.log('📡 API Response Status:', response.status);
            console.log('📡 API Response OK:', response.ok);
            
            const data = await response.json();
            console.log('📊 Attendance API Response Data:', data);
            
            if (data && data.attendance && data.attendance.length > 0) {
                console.log('✅ Attendance data found:', data.attendance);
                const latestCheck = data.attendance[0].check;
                console.log('🔍 Latest check status:', latestCheck);
                
                setCheckedIn(latestCheck === 1);
                console.log('✅ CheckedIn state set to:', latestCheck === 1);
                
                if (latestCheck === 1) {
                    console.log('🚨 User already checked in, showing toast and redirecting...');
                    ToastAndroid.show('Already checked in. Redirecting...', ToastAndroid.LONG);
                    navigation.navigate('MarkAttendance');
                }
            } else {
                console.log('📭 No attendance data found');
                setCheckedIn(false);
                console.log('✅ CheckedIn state set to: false');
            }
        } catch (error) {
            console.error('❌ Error fetching attendance:', error);
            console.log('📋 Error details:', error.message);
        }
    };

    const fetchFixedLocation = async (userId) => {
        console.log('🗺️ fetchFixedLocation CALLED with userId:', userId);
        try {
            console.log('🌐 Making API call to:', `https://wwh.punjab.gov.pk/api/getCoordinates/${userId}`);
            const response = await fetch(`https://wwh.punjab.gov.pk/api/getCoordinates/${userId}`);
            console.log('📡 API Response Status:', response.status);
            console.log('📡 API Response OK:', response.ok);
            
            const data = await response.json();
            console.log('📊 Fixed Location API Response Data:', data);
            
            if (data.status === 'success' && data.data.length > 0) {
                console.log('✅ Fixed location data found:', data.data[0]);
                const { longitude, latitude } = data.data[0];
                const fixedLoc = { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
                console.log('📌 Parsed fixed location:', fixedLoc);
                
                setFixedLocation(fixedLoc);
                console.log('📍 FixedLocation state updated');
            } else {
                console.log('❌ No fixed location data or API returned error');
                ToastAndroid.show('Error fetching location. Check your internet connection.', ToastAndroid.LONG);
            }
        } catch (error) {
            console.error('❌ Error fetching location:', error);
            console.log('📋 Error details:', error.message);
            ToastAndroid.show('Error fetching location. Check your internet connection.', ToastAndroid.LONG);
        }
    };

    const requestLocationPermission = async () => {
        console.log('🔐 requestLocationPermission CALLED');
        if (Platform.OS === 'android') {
            console.log('🤖 Android platform detected');
            try {
                console.log('📝 Requesting ACCESS_FINE_LOCATION permission...');
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                console.log('📋 Permission request result:', granted);
                
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('❌ Location permission denied by user');
                    ToastAndroid.show(
                        'Location permission denied. Enable location services.',
                        ToastAndroid.LONG
                    );
                    return false;
                }
                console.log('✅ Location permission granted');
                return true;
            } catch (err) {
                console.warn('❌ Permission error:', err);
                console.log('📋 Error details:', err.message);
                return false;
            }
        }
        console.log('📱 Non-Android platform, permission assumed granted');
        return true;
    };

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        console.log('📐 calculateDistance CALLED with coordinates:');
        console.log('📍 Point 1:', { lat1, lon1 });
        console.log('📍 Point 2:', { lat2, lon2 });
        
        const toRad = (value) => (value * Math.PI) / 180;
        const R = 6371e3; // Earth's radius in meters
        const φ1 = toRad(lat1);
        const φ2 = toRad(lat2);
        const Δφ = toRad(lat2 - lat1);
        const Δλ = toRad(lon2 - lon1);

        console.log('📊 Calculation intermediate values:', {
            φ1, φ2, Δφ, Δλ
        });

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in meters
        
        console.log('📏 Final calculated distance:', distance, 'meters');
        return distance;
    };

    const handleNavigation = () => {
        console.log('🎯 handleNavigation CALLED');
        console.log('📊 Current state for navigation check:', {
            checkedIn,
            currentDistance,
            toleranceRadius,
            canProceed: checkedIn || (currentDistance !== null && currentDistance <= toleranceRadius)
        });

        if (checkedIn || (currentDistance !== null && currentDistance <= toleranceRadius)) {
            console.log('✅ Navigation allowed, navigating to MarkAttendance');
            navigation.navigate('MarkAttendance');
        } else {
            console.log('❌ Navigation blocked - outside allowed location');
            ToastAndroid.show(
                'You must be within the allowed location to proceed.',
                ToastAndroid.LONG
            );
        }
    };

    console.log('🎨 Component RETURN - Rendering UI');
    console.log('📊 Final State before render:', {
        loading,
        currentDistance,
        location,
        fixedLocation,
        checkedIn,
        statusMessage
    });

    return (
        <View style={styles.container}>
            <Loader loading={loading} />
            {console.log('🌀 Loader rendered with loading:', loading)}

            {/* Background Shading */}
            <LinearGradient
                colors={['#C06C84', '#6C5B7B', '#ffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                locations={[0.2, 0.6, 1]}
                style={styles.backgroundShading}
            />
            {console.log('🎨 Background Gradient rendered')}

            {/* Fixed Position Block */}
            <View style={styles.fixedTopView}>
                {console.log('⬆️ FixedTopView rendered')}
                <LinearGradient
                    colors={['#C06080', '#6C5B00', '#ff00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    locations={[0.2, 0.6, 1]}
                    style={styles.statusMessageCircle}
                >
                    <Image
                        source={require('../../assets/images/location.png')}
                        style={styles.section1Image}
                    />
                    {console.log('📍 Location Image rendered')}
                    <Text style={styles.statusMessageCircleText}>{statusMessage}</Text>
                    {console.log('📝 Status Message Text rendered:', statusMessage)}
                </LinearGradient>
            </View>

            {/* Distance Message */}
            {statusMessage === 'You are outside the hostel premises.' && currentDistance !== null && (
                <>
                    {console.log('📏 Distance Message condition met - rendering')}
                    <Text style={styles.distanceMessage}>
                        You are {currentDistance.toFixed(2)} meters away from the allowed location.
                    </Text>
                </>
            )}

            {/* Fixed Bottom Buttons */}
            <View style={styles.fixedBottomView}>
                {console.log('⬇️ FixedBottomView rendered')}
                <TouchableOpacity 
                    onPress={() => {
                        console.log('🔘 Proceed Button Pressed - Direct navigation');
                        navigation.navigate('MarkAttendance');
                    }} 
                    style={styles.bottomButton}
                >
                    {console.log('🔘 Proceed Button rendered')}
                    <LinearGradient
                        colors={['#ffff', '#C06C84']}
                        start={{ x: 0.5, y: 0.5 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.bottomButtonGradient}
                    >
                        <Text style={styles.bottomButtonText}>Proceed to Mark Attendance</Text>
                        <Icon name="arrow-right" size={20} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    onPress={() => {
                        console.log('🔘 History Button Pressed');
                        navigation.navigate('AttendanceHistory');
                    }} 
                    style={styles.bottomButton}
                >
                    {console.log('🔘 History Button rendered')}
                    <LinearGradient
                        colors={['#ffff', '#C06C84']}
                        start={{ x: 0.5, y: 0.5 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.bottomButtonGradient}
                    >
                        <Text style={styles.bottomButtonText}>View History</Text>
                        <Icon name="arrow-right" size={20} color="white" />
                    </LinearGradient>
                </TouchableOpacity>
            </View>
            {console.log('🏁 Attendance Component - RENDER COMPLETED')}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    backgroundShading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    fixedTopView: {
        position: 'absolute',
        top: height * 0.1,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    statusMessageCircle: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: (width * 0.5) / 2,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 8,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        borderWidth: 2,
        borderColor: '#6C5B7B',
        padding: 20,
    },
    section1Image: {
        width: width * 0.15,
        height: width * 0.15,
    },
    statusMessageCircleText: {
        marginTop: 15,
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        color: 'white',
    },
    distanceMessage: {
        marginTop: height * 0.4,
        fontSize: 12,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    fixedBottomView: {
        position: 'absolute',
        bottom: height * 0.05,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        marginBottom: 40,
    },
    bottomButton: {
        width: '100%',
        marginBottom: height * 0.02,
        paddingHorizontal: 20,
    },
    bottomButtonGradient: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: height * 0.02,
        borderRadius: height * 0.03,
    },
   
});

console.log('📦 Attendance Component - MODULE EXPORTED');
export default Attendance;