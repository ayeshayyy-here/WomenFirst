import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import syncStorage from 'react-native-sync-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const RegistrationCount = () => {
    const [loading, setLoading] = useState(true);
    const [registration, setRegistration] = useState([]);
    const [currentPage, setCurrentPage] = useState(1); // Start from 1 instead of 0
    const itemsPerPage = 10;
    const totalPages = Math.ceil(registration.length / itemsPerPage);
    const [refreshing, setRefreshing] = useState(false);

    const user = JSON.parse(syncStorage.get('user'));
    const userDistrict = user?.district;
    const userInstitute = user?.institute;

    useEffect(() => {
        fetchRegistration();
    }, []);

    const fetchRegistration = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://wwh.punjab.gov.pk/api/registration`, {
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
    
            const responseRegister = await response.json();
            setRegistration(responseRegister?.data || []);
            console.log('registration', responseRegister?.data);
        } catch (err) {
            console.log("Error occurred: " + err);
        } finally {
            setLoading(false);
        }
    };

    const handlePageClick = (pageIndex) => {
        setCurrentPage(pageIndex);
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
                    <Text style={{ color: i === currentPage ? 'white' : 'black' }}>{i}</Text>
                </TouchableOpacity>
            );
        }
        return buttons;
    };

    const getStatusColor = (status) => {
        const normalizedStatus = status.trim().toLowerCase();
        switch (normalizedStatus) {
            case 'pending':
                return 'blue';
            case 'rejected':
                return 'red';
            default:
                return 'green';
        }
    };

    const renderItem = ({ item }) => (
        <LinearGradient
            colors={['#ffff', '#020035']}
            style={styles.card}
            start={{ x: 0.9, y: 0.2 }}
            end={{ x: 1, y: 1 }}
        >
           <View style={styles.row}>
            <View style={styles.iconTextContainer}>
                <MaterialIcons name="person" size={14} color="#333" style={styles.icon} />
                <Text style={styles.cell}>Name: {item.name}</Text>
            </View>
            <View style={styles.iconTextContainer}>
                <MaterialIcons name="info" size={14} color={getStatusColor(item.status)} style={styles.icon} />
                <Text style={[styles.cell, { color: getStatusColor(item.status) }]}>Status: {item.status}</Text>
            </View>
        </View>
        <View style={styles.row}>
            <View style={styles.iconTextContainer}>
                <MaterialIcons name="credit-card" size={14} color="#333" style={styles.icon} />
                <Text style={styles.cell}>CNIC: {item.cnic}</Text>
            </View>
            <View style={styles.iconTextContainer}>
                <MaterialIcons name="work" size={14} color="#333" style={styles.icon} />
                <Text style={styles.cell}>{item.job_type}</Text>
            </View>
        </View>
        </LinearGradient>
    );

    const dataToShow = registration.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <LinearGradient
            colors={['#020035', '#015B7f', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            locations={[0.2, 0.6, 5]}
            style={styles.container}
        >
            {loading ? (
                <View style={styles.loading}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Registration</Text>
                    </View>

                    {registration.length === 0 ? (
                        <View style={styles.noData}>
                            <Text>No registrations available.</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={dataToShow}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            refreshing={refreshing}
                            onRefresh={fetchRegistration}
                        />
                    )}

                    <View style={styles.paginationContainer}>
                        {renderPaginationButtons()}
                    </View>

                    
                </ScrollView>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 30,
        paddingLeft: 5,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: 28,
        color: '#fff',
        fontWeight: 'bold',
    },
    card: {
        marginBottom: 16,
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        marginTop: 2,
    },
    cell: {
        fontSize: 12,
        color: '#333',
        marginBottom: 4,
        fontWeight: 'bold',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noData: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 16,
    },
    paginationButton: {
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: 'white',
        borderRadius: 5,
    },
    activeButton: {
        backgroundColor: '#015B7f',
    },
    footer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10,
    },
    pageIndicator: {
        fontSize: 16,
        color: '#015B7f',
        fontWeight: 'bold',
    },
    iconTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 4,
    },
});

export default RegistrationCount;
