import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    Alert,
    SafeAreaView,
    StatusBar,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import syncStorage from 'react-native-sync-storage';
import axios from 'axios';

const API_BASE_URL = 'https://4f7f2e795675.ngrok-free.app/api';

const { width } = Dimensions.get('window');

const ExpelledHomeScreen = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('pending');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [userData, setUserData] = useState(null);

    // Status tabs configuration
    const tabs = [
        { id: 'pending', label: 'Pending', icon: 'clock-o' },
        { id: 'approved', label: 'Approved', icon: 'check-circle' },
        { id: 'rejected', label: 'Rejected', icon: 'times-circle' }
    ];

    // Load user data
    useEffect(() => {
        loadUserData();
    }, []);

    // Fetch data when tab changes
    useFocusEffect(
        React.useCallback(() => {
            fetchData();
            return () => {};
        }, [activeTab])
    );

   const loadUserData = async () => {
    try {
        const userString = syncStorage.get('user');
        if (userString) {
            const user = JSON.parse(userString);

            setUserData(user); // for header

            // optional debug
            console.log('👤 User Loaded:', {
                userId: user?.id,
                district: user?.district,
                institute: user?.institute,
            });
        }
    } catch (error) {
        console.error('Error loading user data:', error);
    }
};

  const fetchData = async () => {
    setLoading(true);

    try {
        const user = JSON.parse(syncStorage.get('user'));

        if (!user?.id) {
            Alert.alert('Error', 'User not found in storage');
            setLoading(false);
            return;
        }

        const userId = user.id;

        const response = await axios.get(
            `${API_BASE_URL}/status/${activeTab}`,
            {
                params: {
                    user_id: userId, // ✅ PASS USER ID
                },
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.data.success) {
            setData(response.data.data);
        } else {
            Alert.alert('Error', response.data.message || 'Failed to fetch data');
        }

    } catch (error) {
        console.error('API Error:', error);
        Alert.alert(
            'Network Error',
            error.response?.data?.message || 'Unable to connect to server'
        );
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
};


    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleEdit = (item) => {
        if (activeTab === 'pending') {
            navigation.navigate('EditExpelled', { id: item.id });
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.card}
            onPress={() => handleEdit(item)}
            activeOpacity={activeTab === 'pending' ? 0.7 : 1}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={[
                    styles.statusBadge,
                    item.status === 'approved' ? styles.statusApproved :
                    item.status === 'rejected' ? styles.statusRejected :
                    styles.statusPending
                ]}>
                    <Text style={styles.statusText}>
                        {item.status?.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.row}>
                    <Icon name="id-card" size={16} color="#666" style={styles.icon} />
                    <Text style={styles.label}>CNIC:</Text>
                    <Text style={styles.value}>{item.cnic}</Text>
                </View>

                <View style={styles.row}>
                    <Icon name="exclamation-triangle" size={16} color="#666" style={styles.icon} />
                    <Text style={styles.label}>Reason:</Text>
                    <Text style={styles.value} numberOfLines={2}>
                        {item.ex_reason}
                    </Text>
                </View>

                <View style={styles.row}>
                    <Icon name="calendar" size={16} color="#666" style={styles.icon} />
                    <Text style={styles.label}>Relaxation Date:</Text>
                    <Text style={styles.value}>
                        {item.relaxation_date || 'N/A'}
                    </Text>
                </View>

                {item.room_info && (
                    <View style={styles.row}>
                        <Icon name="bed" size={16} color="#666" style={styles.icon} />
                        <Text style={styles.label}>Room:</Text>
                        <Text style={styles.value}>{item.room_info}</Text>
                    </View>
                )}

                {activeTab !== 'pending' && item.approval_date && (
                    <View style={styles.row}>
                        <Icon name="calendar-check-o" size={16} color="#666" style={styles.icon} />
                        <Text style={styles.label}>
                            {activeTab === 'approved' ? 'Approved' : 'Rejected'} Date:
                        </Text>
                        <Text style={styles.value}>{item.approval_date}</Text>
                    </View>
                )}
            </View>

            {activeTab === 'pending' && (
                <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEdit(item)}
                >
                    <Icon name="edit" size={18} color="#fff" />
                    <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
            
            {/* Header */}
            <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.header}
            >
                <Text style={styles.headerTitle}>Expelled Management</Text>
                <Text style={styles.headerSubtitle}>
                    {userData?.district} • {userData?.institute}
                </Text>
            </LinearGradient>

            {/* Status Tabs */}
            <View style={styles.tabContainer}>
                {tabs.map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[
                            styles.tab,
                            activeTab === tab.id && styles.activeTab
                        ]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Icon 
                            name={tab.icon} 
                            size={20} 
                            color={activeTab === tab.id ? '#2563eb' : '#666'} 
                            style={styles.tabIcon}
                        />
                        <Text style={[
                            styles.tabText,
                            activeTab === tab.id && styles.activeTabText
                        ]}>
                            {tab.label}
                        </Text>
                        {data.length > 0 && (
                            <View style={styles.countBadge}>
                                <Text style={styles.countText}>{data.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content */}
            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2563eb" />
                        <Text style={styles.loadingText}>Loading {activeTab} records...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={data}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContainer}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Icon name="file-text-o" size={60} color="#ccc" />
                                <Text style={styles.emptyText}>
                                    No {activeTab} expelled records found
                                </Text>
                            </View>
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#2563eb']}
                                tintColor="#2563eb"
                            />
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        padding: 20,
        paddingTop: 40,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        marginTop: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginHorizontal: 15,
        marginTop: -25,
        borderRadius: 12,
        padding: 5,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        position: 'relative',
    },
    activeTab: {
        backgroundColor: '#e0e7ff',
    },
    tabIcon: {
        marginRight: 8,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeTabText: {
        color: '#2563eb',
    },
    countBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#ef4444',
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    countText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        marginTop: 15,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
        fontSize: 16,
    },
    listContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 12,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 10,
    },
    statusPending: {
        backgroundColor: '#fef3c7',
    },
    statusApproved: {
        backgroundColor: '#d1fae5',
    },
    statusRejected: {
        backgroundColor: '#fee2e2',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    cardBody: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    icon: {
        width: 20,
        marginRight: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
        width: 100,
    },
    value: {
        fontSize: 14,
        color: '#1f2937',
        flex: 1,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563eb',
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 12,
    },
    editButtonText: {
        color: 'white',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 14,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 16,
        textAlign: 'center',
    },
});

export default ExpelledHomeScreen;