import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Collapsible from 'react-native-collapsible';
import syncStorage from 'react-native-sync-storage';
import Icon from 'react-native-vector-icons/FontAwesome';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);
    const navigation = useNavigation();

    const user = JSON.parse(syncStorage.get('user'));
    const userId = user?.id;

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await fetch(`https://wwh.punjab.gov.pk/api/userChalanList/${userId}`);
                const data = await response.json();
                setPayments(data);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [userId]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
            {/* Header Section */}
            <View style={{ backgroundColor: 'white', padding: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
               
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#010048' }}>Hostel Payments History</Text>
            </View>

            <FlatList
                data={payments}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 15 }}
                renderItem={({ item, index }) => (
                    <View style={{ marginBottom: 10, backgroundColor: 'white', padding: 15, borderRadius: 10, elevation: 3 }}>
                        <TouchableOpacity 
                            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                            onPress={() => setExpanded(expanded === index ? null : index)}
                        >
                            <View>
                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#010048' ,  textAlign: 'center', }}>{item.name}</Text>
                                <Text style={{ fontSize: 12, color: '#555', fontWeight: 'bold', marginTop: 5 }}>Total: {item.total}</Text>
                            </View>
                            <Icon name={expanded === index ? 'chevron-up' : 'chevron-down'} size={12} color="#010048" />
                        </TouchableOpacity>

                        <Collapsible collapsed={expanded !== index}>
                        <View style={{ marginTop: 10 }}>
                        <Text style={{ fontSize: 12,   textAlign: 'center',  borderBottomWidth: 1,padding: 10,  borderColor: "#ddd", fontWeight: 'bold', marginTop: 10 , color: item.status === 'Paid' ? 'green' : 'maroon' }}>Challan Status: {item.status}</Text>
                            <View style={{flexDirection: "row", justifyContent: "space-between", padding: 10, marginTop: 10}}>
                           
                                <Text style={{ fontSize: 12, color: '#555' }}>Paid Date: {item.paid_date}</Text>
                                <Text style={{ fontSize: 12, color: '#555' }}>Remaining: {item.remaining}            </Text>
                                </View>
                             

                                <TouchableOpacity
                                    style={{ marginTop: 10, backgroundColor: '#010048', padding: 10, borderRadius: 5, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                                    onPress={() => navigation.navigate('PaymentChallan', { id: item.id })}
                                >
                                    <Icon name="eye" size={12} color="white" style={{ marginRight: 5 }} />
                                    <Text style={{ color: 'white', fontSize: 10,  fontWeight: 'bold' }}>View</Text>
                                </TouchableOpacity>
                            </View>
                        </Collapsible>
                    </View>
                )}
            />
        </View>
    );
};

export default Payments;
