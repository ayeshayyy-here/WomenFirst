import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    PermissionsAndroid, 
    ToastAndroid, 
    Platform, 
    ScrollView,
    Image 
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import LinearGradient from 'react-native-linear-gradient';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useFocusEffect } from '@react-navigation/native'; // To reload data on focus
import VisitorIcon from '../../assets/images/location.png';
import OnSiteIcon from '../../assets/images/offlocation.png';
import { black } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';
import { faLeftLong } from '@fortawesome/free-solid-svg-icons';

const MarkAttendance = ({ navigation }) => {
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState({ longitude: '', latitude: '' });
    const [userId, setUserId] = useState('');
    const [checkedIn, setCheckedIn] = useState(false);
    const [todayData, setTodayData] = useState([]);
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [userName, setUserName] = useState(''); // State for storing the user's name
    // Get user_id from SyncStorage and set date/time
    useEffect(() => {
        const user = JSON.parse(syncStorage.get('user'));
        const storedUserId = user?.id;
        const storedUserName = user?.name || 'Guest'; // Fallback to "Guest" if no name

        setUserId(storedUserId);
        setUserName(storedUserName); // Set user name

        // Update date and time every second
        const interval = setInterval(() => {
            const date = new Date();
            const hours = date.getHours() % 12 || 12; // 12-hour format
            const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
            const ampm = date.getHours() >= 12 ? 'PM' : 'AM'; // AM/PM format
            const formattedTime = `${hours}:${minutes} ${ampm}`; // Time in 12-hour format
            const formattedDate = date.toDateString();
            setCurrentTime(formattedTime);
            setCurrentDate(formattedDate);
        }, 1000);

        return () => clearInterval(interval); // Clean up interval on component unmount
    }, []);


    // Reload data when navigating back to this screen
    useFocusEffect(
        React.useCallback(() => {
            if (userId) {
                fetchTodayAttendance(userId);
            }
        }, [userId])
    );

    // Fetch today's attendance status
    const fetchTodayAttendance = async (userId) => {
        console.log("Fetching today's attendance for user_id:", userId);
        setLoading(true);
        try {
            const response = await fetch(`https://wwh.punjab.gov.pk/api/attendanceCheck/${userId}`);
            const data = await response.json();
            console.log('Attendance data:', data);

            if (data && data.attendance && data.attendance.length > 0) {
                // Use the first record (latest) to determine check in/out status
                const latestCheck = data.attendance[0].check; 
                setCheckedIn(latestCheck === 1); // If the latest check is 1, show "Check Out" button
                setTodayData(data.attendance); // Save attendance history for display
            } else {
                setCheckedIn(false); // No data, show "Check In" button
                setTodayData([]);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    // Request location permission on Android
    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    ToastAndroid.show('Location permission denied, Please enable you location services', ToastAndroid.LONG);
                    return false;
                }
            } catch (err) {
                console.warn('Permission error:', err);
                return false;
            }
        }
        return true;
    };

    // Get current location using Geolocation
    const getCurrentLocation = () => {
        console.log("Getting current location...");
        return new Promise((resolve, reject) => {
            Geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    console.log("Latitude:", latitude, "Longitude:", longitude);
                    setLocation({ latitude, longitude });
                    resolve({ latitude, longitude });
                },
                error => {
                    ToastAndroid.show('Error getting location', ToastAndroid.LONG);
                    console.error("Location error:", error);
                    reject(error);
                },
                { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
            );
        });
    };

    // Mark Attendance (Check In / Check Out)
    const markAttendance = async (checkType) => {
        console.log("Marking attendance:", checkType === 1 ? "Check In" : "Check Out");
        
        const permissionGranted = await requestLocationPermission();
        if (!permissionGranted) return;
    
        setLoading(true);
        
        try {
            const { latitude, longitude } = await getCurrentLocation();
            
            // Prepare the data to send to the API
            const attendanceData = {
                user_id: userId,
                check: checkType, // 1 for checkin, 0 for checkout
                longitude,
                latitude
            };
            
            // Log the data being sent to the API
            console.log("Sending data to API:", attendanceData);
    
            // API call for marking attendance
            const response = await fetch('https://wwh.punjab.gov.pk/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(attendanceData)
            });
    
            const result = await response.json();
            console.log("Attendance result:", result);
    
            // Show success toast and navigate to dashboard after successful checkin/checkout
            ToastAndroid.show(`Successfully ${checkType === 1 ? 'checked in' : 'checked out'} at ${currentTime}`, ToastAndroid.LONG);
            navigation.navigate('Dashboard'); // Navigate to dashboard after success

        } catch (error) {
            console.error('Error marking attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    // Attendance button based on current status
    const renderAttendanceButton = () => {
        return checkedIn ? (
            <TouchableOpacity 
                onPress={() => markAttendance(0)} 
            style={homeStyles.buttonContainer}
            >
              <LinearGradient
    colors={['#775FA8', '#F76C6C']} // Soft peach to coral red
    start={{x: 0, y: 0}}
    end={{x: 1, y: 1}}
    style={homeStyles.circularButton}
>
                    <Icon name={'hand-pointer-o'} size={50} color="white" />
                    <Text style={homeStyles.cardtapText}>Tap to</Text>
                    <Text style={homeStyles.cardText}>Check Out</Text>
                </LinearGradient>
            </TouchableOpacity>
        ) : (
            <TouchableOpacity 
                onPress={() => markAttendance(1)} 
                style={homeStyles.buttonContainer}
            >
                <LinearGradient
    colors={['#775FA8', '#74D3A8']} // Light teal to soft mint green
    start={{x: 0, y: 0}}
    end={{x: 1, y: 1}}
    style={homeStyles.circularButton}
>
                    <Icon name={'hand-pointer-o'} size={50} color="white" />
                    <Text style={homeStyles.cardtapText}>Tap to</Text>
                    <Text style={homeStyles.cardText}>Check In</Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    // Render attendance history list with formatted date and time
    const renderAttendanceHistory = () => {
        return (
            <View>
           
        
            <ScrollView style={homeStyles.statusContainer}>

    

                {todayData.length > 0 ? (
                    todayData.map((entry, index) => {
                        const createdAt = new Date(entry.created_at);
                        const date = createdAt.toLocaleDateString();
                         // Assuming createdAt is a Date object
const updatedTime = new Date(createdAt);
updatedTime.setHours(updatedTime.getHours() + 5);

const time = updatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        
                        return (
                            <View key={index} style={homeStyles.historyRow}>
                            <View style={homeStyles.itemContainer}>
                              <Text style={homeStyles.historyyText}>{date}</Text>
                            </View>
                            
                            <LinearGradient
                              colors={['#775FA8', '#6C5B7B', '#C06C84']}
                              start={{x: 0, y: 0}}
                              end={{x: 1, y: 1}}
                              locations={[0.2, 0.6, 1]}
                              style={homeStyles.gradientContainer}
                            >
                              <Text style={homeStyles.historyText}>
                                {entry.check === 1 ? 'Checked In' : 'Checked Out'}
                              </Text>
                            </LinearGradient>
                            
                            <View style={homeStyles.itemContainer}>
                              <Text style={homeStyles.historyyText}>{time}</Text>
                            </View>
                          </View>
                          
                        );
                    })
                ) : (
                    <Text style={homeStyles.statusEntry}></Text>
                )}
            </ScrollView>
            </View>
        );
    };

    return (
        <View style={homeStyles.mainBody}>
            <Loader loading={loading} />
            <View style={homeStyles.section1}>
    <View style={homeStyles.subView}>
        <LinearGradient
            colors={['#775FA8', '#6C5B7B', '#C06C84']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            locations={[0.2, 0.6, 1]}
            style={homeStyles.subViewText}
        >
            <Image
                source={VisitorIcon}
                style={{width: 60, height: 60, marginRight: 20}} // Align left
            />
            <View style={homeStyles.dateTimeContainer}>
                <Text style={homeStyles.dateText}>{currentDate}</Text>
                <Text style={homeStyles.timeText}>{currentTime}</Text>
            </View>
        </LinearGradient>
    </View>
</View>
<TouchableOpacity style={homeStyles.history} onPress={() => navigation.navigate('AttendanceHistory')}>
            <Text style={homeStyles.histext}>View History</Text>
          </TouchableOpacity>
<View style={homeStyles.container}>
  <Text style={homeStyles.welcomenText}>Hey, {userName}!</Text>
 
</View>

<Text style={homeStyles.welcomeText}>Mark your attendance</Text>    

            {/* Render check-in/check-out button */}
            {renderAttendanceButton()}

            {/* Render attendance history */}
            {renderAttendanceHistory()}
        </View>
    );
};

const homeStyles = {
    mainBody: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F5F5F5',
    },
    buttonContainer: {
        flex: 1,
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        marginTop: 25,
    },
    circularButton: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardtapText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginTop: 15,
    },
    cardText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
       
    },
    welcomeText: {
        fontStyle: 'italic',
        fontSize: 18,
        color: '#8F4FA0',
        textAlign: 'center', // Center the welcome message
        marginBottom: 20,
        fontWeight: 'bold',
    },
    statusContainer: {
        paddingTop: 35,
        paddingBottom: 35,
        maxHeight: 250, // Adjust the max height as per your layout
        overflow: 'hidden', // Ensure content is clipped at max height
      },
      
    statusText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    statusEntry: {
        fontSize: 16,
        color: '#333',
    },
    historyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 5, // Add vertical spacing between rows
        paddingHorizontal: 10, // Add horizontal padding
      },
      itemContainer: {
        flex: 1, // Allow the container to take up available space
        padding: 10,
        backgroundColor: '#f5f5f5', // Light background color
        borderRadius: 8, // Rounded corners
        marginHorizontal: 5, // Spacing between items
        alignItems: 'center', // Center align text
      },
      gradientContainer: {
        flex: 1, // Allow the gradient container to take up more space
        padding: 4,
        borderRadius: 8, // Rounded corners
        justifyContent: 'center',
        alignItems: 'center',
      },
      historyText: {
        color: '#fff', // Text color for contrast
        fontSize: 10,
      },
      historyyText: {
        color: 'gray', // Text color for contrast
        fontSize: 10,
        fontWeight: 'bold',
      },
    section1: {
        flexDirection: 'row',
        elevation: 4,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 15,
    },
    subView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    subViewText: {
        flex: 1,
        backgroundColor: '#19194a',
        width: '100%',
        elevation: 10,
        shadowColor: '#000',
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
        justifyContent: 'space-between', // Ensure image and text are separated
        flexDirection: 'row',
        padding: 20,
        height: '100%',
    },
    dateTimeContainer: {
        alignItems: 'flex-end', // Align the text to the right
        justifyContent: 'center',
        flexDirection: 'column', // Keep date and time stacked
    },
    dateText: {
        fontSize: 18,
        color: 'white', // Adjust color for visibility on the gradient
        fontWeight: '600',
    },
    timeText: {
        fontSize: 24, // Slightly reduced size for better fit
        color: 'white', // Adjust color for visibility
        fontWeight: '700',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10, // Optional padding
      },
      welcomenText: {
        fontStyle: 'italic',
        fontSize: 18,
        color: '#6E276C',
        fontWeight: 'bold',
      },
      history: {
        marginTop: 5,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'end',
        padding: 2, // Optional padding
        right: 10,
      },
      histext: {
        fontSize: 14,
        color: '#290132',
        fontWeight: 'bold',
        fontStyle: 'italic',
      },
  
};

export default MarkAttendance;
