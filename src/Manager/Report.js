import React, { useState, useEffect } from 'react';
import { View, Dimensions, Text, Button, Image, ScrollView, FlatList, RefreshControl, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Collapsible from 'react-native-collapsible';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import syncStorage from 'react-native-sync-storage';
import { useNavigation } from '@react-navigation/native';

// images
import Application from '../../assets/images/Applicationb.png';
import Registration from '../../assets/images/RegistrationM.png';
import Attendance from '../../assets/images/Attendanceb.png';
import Bedroom from '../../assets/images/bedroom.png';
import complaints from '../../assets/images/complaint.png';
import DuePayments from '../../assets/images/DuePayment.png';

const Report = () => {
    const [fromDate, setFromDate] = useState({ year: '2024', month: 'January', day: '01' });
    const [toDate, setToDate] = useState({ year: '2024', month: 'January', day: '01' });
    const [items, setItems] = useState([]);
    const [collapsedStates, setCollapsedStates] = useState([]);
    const [applicationCount, setApplicationCount] = useState(0);
    const [registrationCount, setRegistrationCount] = useState(0);
    const [activeAttendanceCount, setActiveAttendanceCount] = useState(0);
    const [notActiveAttendanceCount, setNotActiveAttendanceCount] = useState(0);
    const [complaintCount, setComplaintCount] = useState(0);
    const [visitorCount, setVisitorCount] = useState(0);
    const [roomCount, setRoomCount] = useState(0);
    const [roomRequestCount, setRoomRequestCount] = useState(0);
    const [jobTypeData, setJobTypeData] = useState([]);
    const [roomOccupancyData, setRoomOccupancyData] = useState([]);
    const [jobTypeData1, setJobTypeData1] = useState(false);
     const [loginCounts, setLoginCounts] = useState({ app_login_count: 0, web_login_count: 0 });
    const screenWidth = Dimensions.get('window').width;
    const colorArray = ['#49a8d2', '#4b5695', '#2ecc71', '#dc7633', '#f0ec03', '#df7ddf'];
    const user = JSON.parse(syncStorage.get('user'));
    const userDistrict = user?.district;
    const userInstitute = user?.institute;
    const navigation = useNavigation();
    useEffect(() => {
        fetchJobTypeData();
        fetchRoomOccupancy();
        const data = [
            { id: 1, title: 'Job Types of Residents' },
            { id: 2, title: 'Room Occupied Overview' },
        ];
        setItems(data);
        setCollapsedStates(new Array(data.length).fill(true));
        fetchApplicationCount();
        fetchRegistrationCount();
        fetchAttendanceCount();
        fetchComplaintCount();
        fetchVisitorCount();
        fetchRoomCount();
        fetchRoomRequestCount();
        // fetchFilteredData();
    }, []);

    const fetchApplicationCount = async () => {
        fetch(`https://wwh.punjab.gov.pk/api/application-count`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    district: userDistrict,
                    institute: userInstitute
                })
            },
        )
            .then(resp => resp.json())
            .then(responseRegister => {
                setApplicationCount(responseRegister.application_count);
            })
            .catch(err => {
                console.log("Error occurred: " + err);
            })
            .finally(() => {
                setLoading(false);
            })
    };

    const fetchRegistrationCount = async () => {
        fetch(`https://wwh.punjab.gov.pk/api/registration-count`, // Replace with your API endpoint
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    district: userDistrict,
                    institute: userInstitute
                })
            },
        )
            .then(resp => resp.json())
            .then(responseRegister => {
                // console.log('registrationCount check ',responseRegister);
                setRegistrationCount(responseRegister.registration_count);
            })
            .catch(err => {
                // console.log('registrationCount check error ');
                console.log("Error occurred: " + err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const fetchAttendanceCount = async () => {
        try {
            const response = await fetch('https://wwh.punjab.gov.pk/api/attendance-count', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    district: userDistrict,
                    institute: userInstitute
                }),
            });

            const data = await response.json();
            setActiveAttendanceCount(data.active_count);
            setNotActiveAttendanceCount(data.not_active_count);
        } catch (error) {
            console.error('Error fetching attendance count:', error);
        }
    };

    const fetchComplaintCount = async () => {
        try {
            const response = await fetch('https://wwh.punjab.gov.pk/api/complaint-count', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    district: userDistrict,
                    institute: userInstitute
                }),
            });
            const data = await response.json();
            setComplaintCount(data.complaint_count);
        } catch (error) {
            console.error("Error fetching complaint count: ", error);
        }
    };

    const fetchVisitorCount = async () => {
        try {
            const response = await fetch('https://wwh.punjab.gov.pk/api/visitor-count', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    district: userDistrict,
                    institute: userInstitute
                }),
            });
            const data = await response.json();
            setVisitorCount(data.visitor_count);
        } catch (error) {
            console.error("Error fetching visitor count: ", error);
        }
    };

    const fetchRoomCount = async () => {
        try {
            const response = await fetch('https://wwh.punjab.gov.pk/api/room-count', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    district: userDistrict,
                    institute: userInstitute
                }),
            });
            const data = await response.json();
            setRoomCount(data.room_count);
        } catch (error) {
            console.error("Error fetching room count: ", error);
        }
    };

    const fetchRoomRequestCount = async () => {
        try {
            const response = await fetch('https://wwh.punjab.gov.pk/api/roomrequest-count', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    district: userDistrict,
                    institute: userInstitute
                }),
            });
            const data = await response.json();
            setRoomRequestCount(data.roomrequest_count);
        } catch (error) {
            console.error("Error fetching room request count: ", error);
        }
    };

    const fetchJobTypeData = async () => {
        try {
            const response = await fetch('https://wwh.punjab.gov.pk/api/newgetJobTypeCounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    district: userDistrict,
                    institute: userInstitute

                }),
            });

            if (response.ok) {
                const data = await response.json();
                // Flattening the data structure
                const formattedData = data.map((item, index) => ({
                    value: item.total,
                    color: colorArray[index % colorArray.length],
                    text: item.job_type,
                }));

                setJobTypeData(formattedData);  // No need for nested arrays
                setJobTypeData1(true);
            } else {
                console.error('Error fetching job type data:', response.status);
            }
        } catch (error) {
            console.error('Error occurred:', error);
        }
    };
      const fetchLoginCounts = async () => {
        try {
          const user = JSON.parse(syncStorage.get('user'));
          const apiUrl = `https://wwh.punjab.gov.pk/api/webapplogincount/${user.district}/${user.institute}`;
          const response = await fetch(apiUrl);
          const json = await response.json();
    
          if (response.ok) {
            setLoginCounts({
              app_login_count: json.app_login_count || 0,
              web_login_count: json.web_login_count || 0,
            });
          } else {
            Alert.alert('Error', 'Failed to fetch login counts.');
          }
        } catch (error) {
          console.error('Error fetching login counts:', error);
          Alert.alert('Error', 'Unable to fetch login counts. Please try again later.');
        }
      };
    const fetchRoomOccupancy = async () => {
        try {
            const response = await fetch('https://wwh.punjab.gov.pk/api/room-occupancy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    district: userDistrict,
                    institute: userInstitute,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                // console.log('data ',data['data'][0]);
                // console.log('Formatted Data:', formattedData);
                if (data && data.data && data.data.length > 0) {
                const formattedData = [
                    { label: 'Single', occupied: data['data'][0]?.singles, available: data['data'][0]?.singular },
                    { label: 'Double', occupied: data['data'][0]?.doubles, available: data['data'][0]?.doubler },
                    { label: 'Triple', occupied: data['data'][0]?.triples, available: data['data'][0]?.three },
                    { label: 'Quad', occupied: data['data'][0]?.fourths, available: data['data'][0]?.fourfer },
                    { label: 'Quint', occupied: data['data'][0]?.fifths, available: data['data'][0]?.fifer },
                ];
                // const formattedData = [
                //     { value: data['data'][0].singles, label: 'Single' }, // single value for singles
                //     { value: data['data'][0].singular, label: 'Single' },
                //     { value: data['data'][0].doubles, label: 'Double' },
                //     { value: data['data'][0].doubler, label: 'Doubler' },
                //     { value: data['data'][0].triples, label: 'Triple' },
                //     { value: data['data'][0].fourths, label: 'Quad' },
                //     { value: data['data'][0].fifths, label: 'Quint' },
                // ];
                setRoomOccupancyData(formattedData);
            } else {
                console.error('Error fetching room occupancy data:', response.status);
            }}
        } catch (error) {
            console.error('Error occurred:', error);
        }
    };
    // console.log('registrationCount ',registrationCount);
    const toggleCollapse = (index) => {
        const newStates = [...collapsedStates];
        newStates[index] = !newStates[index];
        setCollapsedStates(newStates);
    };
    const renderItem = ({ item, index }) => (
        // console.log('jobTypeData length', jobTypeData.length),
        // console.log('Item:', items),
        <LinearGradient
            colors={['#ffff', '#020035']}
            start={{ x: 0.6, y: 0.5 }}
            end={{ x: 1, y: 0.1 }}
            style={styles.card3}
        >
            <TouchableOpacity onPress={() => toggleCollapse(index)} style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Icon
                    name={collapsedStates[index] ? 'chevron-down' : 'chevron-up'}
                    size={10}
                    color="white"
                    style={styles.dropdownIcon}
                />
            </TouchableOpacity>
            <Collapsible collapsed={collapsedStates[index]}>
                <ScrollView style={styles.collapsibleScrollView} nestedScrollEnabled={true}>
                    <View style={styles.cardBody}>
                        {/* Render the pie chart only if item.id is 1 */}

                        {item.id === 1 && Array.isArray(jobTypeData) && jobTypeData.length > 0 ? (
                            // console.log('Rendering Pie Chart with data:', jobTypeData), 
                            renderPieChart()
                        ) : null}
                        {item.id === 2 && Array.isArray(roomOccupancyData) && roomOccupancyData.length > 0 ? (
                            renderBarChart()
                        ) : null}
                    </View>
                </ScrollView>
            </Collapsible>
        </LinearGradient>
    );

    const handleRefresh = () => {
        // Logic to refresh the data
    };
    // const filteredJobTypeData = jobTypeData.filter(item => item.value > thresholdValue);
    const renderPieChart = () => {
        return (
            <View style={styles.pieChartContainer}>
                <PieChart
                    data={jobTypeData}
                    donut={false}
                    showText={false}
                    textSize={8} // Decrease text size for less overlap
                    textColor="black"
                    radius={100}
                    innerRadius={60}
                    showValuesAsLabels={false}
                    showTextBackground={false}
                    textBackgroundRadius={20} // Increase background radius for better readability
                    adjustLabelPosition={false} // Adjusts labels to reduce overlap if supported
                    legend // Optionally, add a legend instead of text on slices
                />
                <View style={styles.tableContainer}>
                    {jobTypeData.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <View style={[styles.colorBox, { backgroundColor: item.color }]} />
                            <Text style={styles.tableText}>{item.text}</Text>
                            <Text style={styles.tableText}>{item.value}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };
    const renderBarChart = () => {
        if (!Array.isArray(roomOccupancyData) || roomOccupancyData.length === 0) {
            return <Text>No data available</Text>; // Handle no data case
        }
    
        console.log('item', roomOccupancyData);
        const barData = roomOccupancyData.map((data) => {
            const occupiedValue = isFinite(data.occupied) && data.occupied !== null ? data.occupied : 0;
            const availableValue = isFinite(data.available) && data.available !== null ? data.available : 0;
    
            return [
                {
                    value: occupiedValue,
                    label: data.label,
                    spacing: 2,
                    labelWidth: 30,
                    labelTextStyle: { color: 'gray', fontSize: 10 },
                    frontColor: '#177AD5',
                },
                {
                    value: availableValue,
                    label: '',
                    spacing: 20,
                    labelWidth: 30,
                    labelTextStyle: { color: 'gray', fontSize: 10 },
                    frontColor: '#A0A0A0',
                }
            ];
        }).flat();
        // console.log('barData c ',barData);
        return (
            <View style={{overflow: 'scroll'}}>
            <BarChart
                data={barData}
                barWidth={20}
                barBorderRadius={4}
                height={200}
                yAxisThickness={0}
                xAxisThickness={0}
                stepValue={10}
                maxValue={60}
                spacing={30} // Adjust spacing between bars
                hideLegend={false}
                // disableScroll={false}

            />
            <View style={styles.tableContainer}>
                        <View style={styles.tableRow1}>
                            <View style={[styles.colorBox1, { backgroundColor: '#177AD5' }]} />
                            <Text style={styles.tableText1}>Current Residents</Text>
                            {/* <Text style={styles.tableText}>{item.occupied}</Text> */}
                            <View style={[styles.colorBox1, { backgroundColor: '#A0A0A0' }]} />
                            <Text style={styles.tableText1}>Capacity</Text>
                            {/* <Text style={styles.tableText}>{item.available}</Text> */}
                        </View>
                </View>
            </View>
        );
    };
   const formatDate = (date) => {
        return `${date.year}-${date.month}-${date.day}`;
    };
    
    // const fetchFilteredData = async () => {
    //     console.log('function of time ');
    //     try {
    //         const response = await fetch('https://wwh.punjab.gov.pk/api/filter-data', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Accept': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 // to_date: formatDate(toDate),
    //                 district: userDistrict,
    //                 institute: userInstitute,
    //                 from_date: fromDate,
    //                 to_date: toDate,
    //                 // from_date: formatDate(fromDate),
    //             }),
    //         });
    //         const data = await response.json();
    //         console.log('data of time ', data);
    //         setApplicationCount(data.application_count);
    //         setRegistrationCount(data.registration_count);
    //     } catch (error) {
    //         console.error('Error fetching filtered data:', error);
    //     }
    // };
    return (
        <LinearGradient
            colors={['#020035', '#015B7f', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0.2, 0.6, 5]}
            style={styles.outerContainer}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Dashboard</Text>
                </View>
             
                       <View style={styles.cardWrapper}>
                         <Image
                           source={require('../../assets/images/login.png')} 
                           style={styles.backgroundImage}
                         />
                         <View style={styles.overlay}>
                         
                    {/* <View style={styles.calendarContainer1}>
                        <Text style={styles.calendarLabel}>From:</Text>
                        <View style={styles.pickerContainer}>
                            <View style={styles.singlePickerContainer1}>
                                <Picker
                                    selectedValue={fromDate.day}
                                    onValueChange={(itemValue) => setFromDate((prev) => ({ ...prev, day: itemValue }))}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}>
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
                                    ))}
                                </Picker>
                            </View>
                            <View style={styles.singlePickerContainer2}>
                                <Picker
                                    selectedValue={fromDate.month}
                                    onValueChange={(itemValue) => setFromDate((prev) => ({ ...prev, month: itemValue }))}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}>
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                                        <Picker.Item key={month} label={month} value={month} />
                                    ))}
                                </Picker>
                            </View>
                            <View style={styles.singlePickerContainer3}>
                                <Picker
                                    selectedValue={fromDate.year}
                                    onValueChange={(itemValue) => setFromDate((prev) => ({ ...prev, year: itemValue }))}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}>
                                    {Array.from({ length: 10 }, (_, i) => (
                                        <Picker.Item key={2024 + i} label={`${2024 + i}`} value={`${2024 + i}`} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>
                    <View style={styles.calendarContainer}>
                        <Text style={styles.calendarLabel}>To:</Text>
                        <View style={styles.pickerContainer}>
                            <View style={styles.singlePickerContainer1}>
                                <Picker
                                    selectedValue={toDate.day}
                                    onValueChange={(itemValue) => setToDate((prev) => ({ ...prev, day: itemValue }))}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}>
                                    {Array.from({ length: 31 }, (_, i) => (
                                        <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
                                    ))}
                                </Picker>
                            </View>
                            <View style={styles.singlePickerContainer2}>
                                <Picker
                                    selectedValue={toDate.month}
                                    onValueChange={(itemValue) => setToDate((prev) => ({ ...prev, month: itemValue }))}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}>
                                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                                        <Picker.Item key={month} label={month} value={month} />
                                    ))}
                                </Picker>
                            </View>
                            <View style={styles.singlePickerContainer3}>
                                <Picker
                                    selectedValue={toDate.year}
                                    onValueChange={(itemValue) => setToDate((prev) => ({ ...prev, year: itemValue }))}
                                    style={styles.picker}
                                    itemStyle={styles.pickerItem}>
                                    {Array.from({ length: 10 }, (_, i) => (
                                        <Picker.Item key={2024 + i} label={`${2024 + i}`} value={`${2024 + i}`} />
                                    ))}
                                </Picker>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity onPress={fetchFilteredData}>
                    <LinearGradient
                        colors={['#21264e', '#303567', '#404585']}
                        start={{ x: 1, y: 1 }}
                        end={{ x: 0, y: 0 }}
                        locations={[0.2, 0.6, 1]}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>Submit</Text>
                    </LinearGradient>
                </TouchableOpacity> */}
                
                        <View style={styles.row1}>
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => navigation.navigate('ApplicationCount')}
                            >
                                {/* <View style={styles.row}>   */}
                                <Image
                                    source={Application}
                                    style={styles.cardIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardText}>Application: {applicationCount}</Text>
                                {/* </View> */}
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => navigation.navigate('RegistrationCount')}
                            >
                                <Image
                                    source={Registration}
                                    style={styles.cardIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardText}>Registrations: {registrationCount}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row1}>
                            <TouchableOpacity style={styles.card}
                               onPress={() => navigation.navigate('Attendanceperson')}>
                                {/* <View style={styles.row}>   */}
                                <Image
                                    source={Attendance}
                                    style={styles.cardIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardText}>Attendance</Text>
                                <Text style={styles.cardTextt}>Active: {activeAttendanceCount}   Not Active: {notActiveAttendanceCount}</Text>
                                {/* </View> */}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.card}>
                                <Image
                                    source={complaints}
                                    style={styles.cardIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardText}>Complaints/Request</Text>
                                <Text style={styles.cardTextt}>Complaints: {complaintCount}  Requests: {visitorCount}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.row1}>
                            <TouchableOpacity
                                style={styles.card}
                                onPress={() => navigation.navigate('RoomsM')}
                            >

                                <Image
                                    source={Bedroom}
                                    style={styles.cardIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardText}>Room Management</Text>
                                <Text style={styles.cardTextt}>Room: {roomCount}  Occupied: {roomRequestCount}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.card}
                                onPress={() => navigation.navigate('Loginperson')}
                            >
                                <Image
                                    source={DuePayments}
                                    style={styles.cardIcon}
                                    resizeMode="contain"
                                />
                                <Text style={styles.cardText}>Login Activity</Text>
                                <Text style={styles.cardTextt}>App logins (today): {loginCounts.app_login_count}  Web logins (today): {loginCounts.app_login_count}</Text>
                            </TouchableOpacity>
                        </View>
                

                    <ScrollView nestedScrollEnabled={true} style={styles.scrollViewContainer}>
                        {/* <View style={styles.flatListContainer}> */}
                        <FlatList
                            data={items}
                            renderItem={renderItem}
                            keyExtractor={(items, index) => index.toString()}
                            refreshControl={
                                <RefreshControl refreshing={false} onRefresh={handleRefresh} />
                            }
                            showsVerticalScrollIndicator={false}
                        />
                      
                        {/* </View> */}
                    </ScrollView>
                </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 70,
        paddingLeft: 10,
        backgroundColor: 'transparent',
    },
    header: {
        fontSize: 24,
        color: '#fff',
        fontWeight: 'bold',
        
    },
    cardWrapper: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flex: 1,
    paddingVertical: 20,
    overflow: 'hidden', // This ensures the background image does not overflow
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    opacity: 0.1, // Adjust the opacity to your preference
    resizeMode: 'cover', // Ensure the image covers the container
  },
  overlay: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: '7%',
  },
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingLeft: '2%',
    paddingRight: '2%',
    marginTop: '8%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingLeft: '2%',
    paddingRight: '2%',
    marginTop: '2%',
  },
  card: {
    backgroundColor: '#fff',
    width: '45%',
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
    borderColor: '#d3d3d3',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  cardIcon: {
    width: '60%',
    height: '50%',
    marginBottom: 10,
  },
  cardIconn: {
    width: '50%',
    height: '40%',
    marginBottom: 20,
  },
  cardText: {
    color: '#000000',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cardTextt: {
    color: 'gray',
    fontSize: 8,
    textAlign: 'center',
    fontWeight: 'bold',
  },
    calendarContainer: {
        marginVertical: -5,
        marginTop: -5
    },
    calendarContainer1: {
        marginVertical: -15,
        marginBottom: 20
    },
    calendarLabel: {
        fontSize: 16,
        color: 'black',
        marginBottom: 5,
    },
    pickerContainer: {
        flexDirection: 'row', // Aligns pickers in a row
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -5
    },
    singlePickerContainer1: {
        flex: 0.5, // Ensures each picker takes an equal amount of space
        color: 'black',
        backgroundColor: 'white',
        borderRadius: 20,
        height: 35,
        fontSize: 1,
        marginHorizontal: 2, // Adds space between each picker
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d3d3d3',
        justifyContent: 'center', // Center the content
        alignItems: 'center',
    },
    singlePickerContainer2: {
        flex: 0.75, // Ensures each picker takes an equal amount of space
        color: 'black',
        backgroundColor: 'white',
        borderRadius: 20,
        height: 35,
        // marginBottom: 2,  // Adds space between each TextInput
        paddingLeft: 1,
        fontSize: 1,
        marginHorizontal: 2, // Adds space between each picker
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d3d3d3',
        justifyContent: 'center', // Center the content
        alignItems: 'center',
    },
    singlePickerContainer3: {
        flex: 0.58, // Ensures each picker takes an equal amount of space
        color: 'black',
        backgroundColor: 'white',
        borderRadius: 20,
        height: 35,
        // marginBottom: 2,  // Adds space between each TextInput
        paddingLeft: 1,
        fontSize: 1,
        marginHorizontal: 2, // Adds space between each picker
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d3d3d3',
        justifyContent: 'center', // Center the content
        alignItems: 'center',
    },
    picker: {
        color: 'black', // Sets the text color for picker items
        width: '112%', // Ensures the picker takes full width of its container
        height: 30,
    },
    pickerItem: {
        textAlign: 'center', // Centers text horizontally
    },
    majorHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#a2b8e3',
        padding: 16,
        borderRadius: 10,
    },
    majorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white'
    },
    scrollViewContainer: {
        maxHeight: 700, // Adjust based on how much space you want for the scrollable area
        marginBottom: 20,
    },
    flatListContainer: {
        // height: 400
    },
    majorBody: {
        backgroundColor: '#ffffff',
        marginVertical: -5,
        borderRadius: 10,
    },
    card3: {
        // backgroundColor: '#a2b8e3', // Updated background color
        borderRadius: 8, // Reduced border radius
        marginVertical: 5, // Increased vertical margin
        padding: 5, // Added padding for content inside the card
        elevation: 5, // Shadow effect for Android
        shadowColor: '#000', // Shadow color for iOS
        shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
        shadowOpacity: 0.25, // Shadow opacity for iOS
        shadowRadius: 3.84, // Shadow radius for iOS
        marginRight: 10, // Added margin to the right for spacing between items
        backgroundColor: '#F3E5F5',
        paddingHorizontal: 10,
        marginHorizontal: 10,
    },
    cardHeader: {
        flexDirection: 'row', // Row layout for the header
        justifyContent: 'space-between', // Space between title and icon
        alignItems: 'center', // Align items vertically in the center
        paddingVertical: 10, // Vertical padding for the header
        paddingHorizontal: 10, // Horizontal padding for the header
        // backgroundColor: '#a2b8e3', // Light background color for header
        borderTopLeftRadius: 8, // Rounded corners for the top left
        borderTopRightRadius: 8, // Rounded corners for the top right
    },
    cardTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'black', // Dark text color for title
    },
    dropdownIcon: {
        marginLeft: 10, // Spacing between title and dropdown icon
        color: '#fff',

    },
    collapsibleScrollView: {
        maxHeight: 400, // Adjust this value based on how much you want the collapsible section to scroll
    },
    cardBody: {
        // padding: -50, // Increased padding inside the collapsible content
        backgroundColor: '#fff',
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    // buttonContainer: {
    //     borderRadius: 15, // Add the border radius
    //     justifyContent: 'center', // Center the content
    //     alignItems: 'center', // Center the content horizontally
    //     padding: 10, // Add padding to the button
    //     marginVertical: -5, // Adjust margin if needed
    //     marginRight: 110,
    //     marginLeft: 110,
    //     marginBottom: -20,
    //     marginTop: 10
    // },
    button: {
        borderRadius: 25,
        alignItems: 'center',
        paddingVertical: 8,
        // paddingHorizontal: 100,
        marginTop: 20,
        // marginBottom: ,
    },
    buttonText: {
        color: '#fff', // White text for contrast
        fontSize: 16,
        fontWeight: 'bold',
    },
    sessionCard: {
        borderRadius: 15,
        padding: 10,
        marginVertical: 20,
        marginTop: 25,
        marginBottom: 0
    },
    row1: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
        paddingLeft: 5,
        paddingRight: 0,
        marginTop: 2,
    },
    card1: {
        backgroundColor: '#fff',
        width: 148,
        height: 100,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'left',
        // padding: -5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
        borderColor: '#d3d3d3',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        overflow: 'hidden',
        // flexDirection: 'row',
    },
    card2: {
        backgroundColor: '#fff',
        width: 148,
        height: 80,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'left',
        // padding: -5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10,
        borderColor: '#d3d3d3',
        borderRightWidth: 1,
        borderBottomWidth: 1,
        overflow: 'hidden',
        // flexDirection: 'row',
    },
    cardIcon: {
        width: 70,                 // Icon width
        height: 40,                // Icon height
        // marginRight: 2,           // Space between icon and text
        marginLeft: -10,
        // paddingRight:-50,
        marginBottom: 10,
        marginTop: 10
    },
 
    cardCount: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000000',
        marginTop: 5,
        flexDirection: 'row',
    },
    pieChartContainer: {
        flexWrap: 'wrap', // Align pie chart and table in a row
        justifyContent: 'space-between', // Add space between pie chart and table
        alignItems: 'center', // Vertically align the items
        paddingLeft: 50
    },
    tableContainer: {
        // width: screenWidth / 2, // Allocate the other half for the table
        justifyContent: 'center', // Center the content vertically
        paddingBottom:10
    },
    tableRow: {
        flexDirection: 'row', // Align table rows horizontally
        justifyContent: 'space-between', // Space out the columns
        marginVertical: 5, // Add some spacing between rows
        alignItems: 'center',
    },
    tableRow1: {
        flexDirection: 'row', // Align table rows horizontally
        justifyContent: 'space-between', // Space out the columns
        marginVertical: 5, // Add some spacing between rows
        alignItems: 'center',
        padding:40,
        paddingBottom:-8,
        paddingTop:-5
    },
    tableText: {
        color: 'black', // Adjust text color based on your design
        fontSize: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 10,
    },
    tableText1: {
        color: 'black', // Adjust text color based on your design
        fontSize: 12,
        // justifyContent: 'space-between',
        // alignItems: 'center',
        paddingLeft: 2,
    },
    colorBox: {
        width: 20,
        height: 20,
        marginRight: 10,
        borderRadius: 10,
    },
    colorBox1: {
        width: 20,
        height: 20,
        marginRight: 5,
        borderRadius: 10,
    },
    barChartContainer: {
        marginVertical: 20,  // Adds spacing above and below the bar chart
        paddingHorizontal: 10,  // Adds horizontal padding for spacing
        alignItems: 'center',  // Centers the bar chart horizontally
        // backgroundColor: '#f5f5f5',  // Light background color for contrast
        borderRadius: 10,  // Rounded corners for the container
        paddingVertical: 15,  // Adds vertical padding inside the container
        shadowColor: '#000',  // Shadow color for depth
        shadowOffset: { width: 0, height: 2 },  // Shadow position
        shadowOpacity: 0.1,  // Shadow transparency
        shadowRadius: 5,  // Spread of the shadow
        elevation: 3,  // Shadow for Android
    },
});

export default Report;
