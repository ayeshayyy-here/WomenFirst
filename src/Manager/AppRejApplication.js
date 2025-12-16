import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    ScrollView,
    Image,
    loading
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Collapsible from 'react-native-collapsible';
import LinearGradient from 'react-native-linear-gradient';
import Sidebar from '../components/Sidebar';
import syncStorage from 'react-native-sync-storage';
import Loader from '../components/Loader';
import HeaderTabs from '../components/Header';
const AppRejApplication = ({ navigation, route }) => {
    const [collapsedStates, setCollapsedStates] = useState([]);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const { status } = route.params;  // Get 'status' from params
    const toggleSidebar = () => {
      setIsSidebarVisible(!isSidebarVisible);
    };
    const itemsPerPage = 10;
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [items, setItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [collapsedStatess, setCollapsedStatess] = useState([]);
    const [loading, setLoading] = useState(false);
    const baseUrl = `https://wwh.punjab.gov.pk/api/ARList/${status}`;
    const user = JSON.parse(syncStorage.get('user')); // Assuming user data contains district and institute
    
    // Log district and institute from syncStorage
    console.log('User district:', user.district);
    console.log('User institute:', user.institute);
    
    useEffect(() => {
        fetchData();
    }, [currentPage]);
    
    const fetchData = async () => {
       
        setLoading(true);
        try {
            // Construct URL with district and institute query params
            const url = `${baseUrl}?page=${currentPage}&district_id=${user.district}&institute_id=${user.institute}`;
            console.log('url:', url);
            // Fetch the data from the constructed URL
            const response = await fetch(url);
            
            // Parse the JSON response
            const responseData = await response.json();
            
            // Log the API response data
            console.log('API Response Data:', responseData);
            
            // Update state with the fetched data
            setTotalPages(responseData.last_page);
            setItems(responseData.data);
            setCollapsedStatess(new Array(responseData.data.length).fill(true));
            setRefreshing(false);
        } catch (error) {
            setRefreshing(false);
            console.log('API Error:', error);
        }
        finally {
            setLoading(false);
          }
    };
    
    const handlePageClick = (page) => {
        setCurrentPage(page);
    };

    const toggleCollapse = (index) => {
        setCollapsedStatess(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    const renderItem = ({ item, index }) => {
        if (!item) return null;

        return (
            <View style={styles.content}>
      <TouchableOpacity
    onPress={() => toggleCollapse(index)}
    style={styles.collapsibleHeader}>
    <View style={styles.collapheaderItem}>

        <View style={styles.profileAndNameContainer}>
            <View style={styles.profileImageContainer}>
            
                {item.profile ? (
                    <Image
                        source={{ uri: `https://wwh.punjab.gov.pk/uploads/image/${item.profile}` }}
                        style={styles.profileImage}
                    />
                ) : (
                    <Icon
                        name="user-circle"
                        size={30}
                        color="gray"
                        style={styles.profileIcon}
                    />
                )}
            </View>
            <Text style={styles.collapheaderText}>
                {item.name || 'No Name'}
            </Text>
        </View>

        {/* Second Row: Applied District on left, Institute on right */}
        <View style={styles.detailsRow}>
            <Text style={styles.appliedDistrictText}>
                Applied District: {item.district_name}
            </Text>
            <Text style={styles.instituteText}>
                Institute: {item.institute_name}
            </Text>
        </View>

        <Icon
            name={collapsedStates[index] ? 'chevron-down' : 'chevron-up'}
            size={10}
            color="gray"
            style={styles.dropdownIcon}
        />
    </View>

    {/* Collapsible content is unchanged */}
    <Collapsible collapsed={collapsedStatess[index]}>
        <View style={styles.collapsibleContent}>
            <Text style={styles.collapsibleText}>CNIC: <Text style={{ color: 'gray',   fontSize: 10, }}>{item.cnic}</Text></Text>
            <Text style={styles.collapsibleText}>PHONE NO: <Text style={{ color: 'gray',   fontSize: 10, }}>{item.phone_no}</Text></Text>
            <Text style={styles.collapsibleText}>BPS: <Text style={{ color: 'gray',   fontSize: 10, }}>{item.bps || 'N/A'}</Text></Text>
            <Text style={styles.collapsibleText}>JOB TYPE: <Text style={{ color: 'gray',   fontSize: 10, }}>{item.job_type}</Text></Text>
            <Text style={styles.collapsibleText}>DISTRICT: <Text style={{ color: 'gray',   fontSize: 10, }}>{item.district_name}</Text></Text>
            <Text style={styles.collapsibleText}>INSTITUTE:  <Text style={{ color: 'gray',   fontSize: 10, }}>{item.institute_name}</Text></Text>
            <View style={styles.separator} />
            {/* View Profile Button */}
            <TouchableOpacity
                                style={[styles.buttonContainer, { backgroundColor: '#010048' }]}
                                onPress={() => {
                                    navigation.navigate('ProfileP', { item });
                                }}>
                                <Text style={styles.buttonText}>View Details  </Text>
                                <Icon name="info-circle" size={10} color="white" />
                            </TouchableOpacity>
        </View>
    </Collapsible>
</TouchableOpacity>


            </View>
        );
    };

    const renderPaginationButtons = () => {

        const maxButtonsToShow = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

        if (endPage - startPage + 1 < maxButtonsToShow) {
            startPage = Math.max(1, endPage - maxButtonsToShow + 1);
        }

        const buttons = [];
        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => handlePageClick(i)}
                    style={[styles.paginationButton, i === currentPage ? styles.activeButton : null]}>
                    <Text style={{ color: 'white' }}>{i}</Text>
                </TouchableOpacity>
            );
        }
        return buttons;
    };

    return (
        <SafeAreaView style={styles.container}>
           <LinearGradient
                colors={['#010048', '#020035', '#030022']}
                locations={[0, 0.5, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}>
                <View style={styles.header}>
                <TouchableOpacity      onPress={() => navigation.navigate('DashboardM')}>
                        <Icon name="arrow-left" size={20} color="#fff" style={styles.icon} />
                    </TouchableOpacity>
                    <Text style={styles.headerText}> Applications</Text>
                    
                  
                </View>
                </LinearGradient>
                <HeaderTabs />
                <Text style={styles.headerTextt}>  {status === 'accepted' ? 'Accepted Applications' : 'Rejected Applications'}</Text>
                <ScrollView>
                    <FlatList
                        data={items}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                        refreshing={refreshing}
                        onRefresh={fetchData}
                    />
                    <View style={styles.paginationContainer}>
                        {renderPaginationButtons()}
                    </View>
                </ScrollView>
                <Sidebar isVisible={isSidebarVisible} onClose={toggleSidebar} />
                <Loader loading={loading} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAF9F6',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: '#000',
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
        marginRight: 70,
    },
    headerTextt: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#010048',
     marginVertical: 20,
        textAlign: 'center',
    },
    icon: {
        padding: 10,
    },
    content: {
        paddingVertical: 2,
        paddingHorizontal: 15,
    },
    collapsibleHeader: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 5,
        marginTop: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    collapheaderItem: {
        alignItems: 'flex-start',
    },
    profileAndNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    profileImageContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#ddd',
        borderWidth: 1,
        marginRight: 10,
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    profileIcon: {
        marginRight: 10,
    },
    collapheaderText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 14,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 2,
        marginBottom: 5,
    },
    appliedDistrictText: {
        color: '#010048', // Green for district
        fontSize: 10,
      fontWeight: 'bold',
    },
    instituteText: {
        color: 'gray', // Blue for institute
        fontSize: 10,
        fontWeight: 'bold',
    },
    dropdownIcon: {
        position: 'absolute',
        right: 10,
        top: 10,
    },
    collapsibleContent: {
        paddingTop: 10,
        paddingHorizontal: 20,
        backgroundColor: '#f9f9f9',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        marginTop: 10,
        borderRadius: 10,
        padding: 10,
    },
    collapsibleText: {
        color: 'black',
        fontWeight: 'bold',
        flexWrap: 'wrap',
        fontSize: 10,
    },
    separator: {
        height: 0.5,
        backgroundColor: 'grey',
        marginVertical: 15,
        width: '100%',
    },
    buttonContainer: {
        flexDirection: 'row',
        backgroundColor: 'black',
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRadius: 5,
        alignSelf: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 8,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
    },
    paginationButton: {
        backgroundColor: 'gray',
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 5,
        marginHorizontal: 5,
    },
    activeButton: {
        backgroundColor: '#010048',
    },
});

export default AppRejApplication;
