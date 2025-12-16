import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import Loader from '../components/Loader';
const EditPostedChallan = ({ route, navigation }) => {
    const { id } = route.params;
    const [formData, setFormData] = useState({
        name: '',
        roomRent: '',
        guestCharges: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChallanData = async () => {
            try {
                const response = await fetch(`https://wwh.punjab.gov.pk/api/challan/${id}`);
                const result = await response.json();
                if (result.status === "success") {
                    setFormData({
                        name: result.username || '',
                        roomRent: result.data.room_rent?.toString() || '',
                        guestCharges: result.data.guest_charges?.toString() || ''
                    });
                } else {
                    setError("Failed to load challan data.");
                }
            } catch (error) {
                setError("Error fetching challan data.");
            } finally {
                setLoading(false);
            }
        };

        fetchChallanData();
    }, [id]);

    const handleChange = (field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value
        }));
    };

    const handleEditChallan = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://wwh.punjab.gov.pk/api/editChallan/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    room_rent: parseFloat(formData.roomRent),
                    guest_charges: parseFloat(formData.guestCharges)
                })
            });
            const result = await response.json();
            if (result.status === "success") {
                Alert.alert("Success", result.message);
                navigation.goBack();
            } else {
                Alert.alert("Error", "Failed to update challan");
            }
        } catch (error) {
            Alert.alert("Error", "An error occurred while updating the challan");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return  <Loader />;
    }

    if (error) {
        return <Text style={styles.error}>{error}</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Hostel Payment</Text>

            <Text style={styles.textt}>Resident's Name</Text>
            <TextInput
                style={styles.input}
                value={formData.name}
                editable={false}
                placeholder="Name"
            />

            <Text style={styles.textt}>Room Rent</Text>
            <TextInput
                style={styles.input}
                value={formData.roomRent}
                onChangeText={(value) => handleChange('roomRent', value)}
                keyboardType="numeric"
                placeholder="Room Rent"
            />

            <Text style={styles.textt}>Guest Charges</Text>
            <TextInput
                style={styles.input}
                value={formData.guestCharges}
                onChangeText={(value) => handleChange('guestCharges', value)}
                keyboardType="numeric"
                placeholder="Guest Charges"
            />

            <TouchableOpacity style={styles.button} onPress={handleEditChallan}>
                <Text style={styles.buttonText}>Edit Challan</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f8f8f8',
        flexGrow: 1,
        alignItems: 'center'
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: '#000',
        padding: 10,
    },
    input: {
        width: '100%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 10,
        fontSize: 14,
        color: 'black',
        backgroundColor: 'white',
    },
    textt: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 5,
        color: 'black',
        textAlign: 'start',
    },
    button: {
        width: '100%',
        height: 40,
        backgroundColor: '#010048',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        marginTop: 30
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    error: {
        color: 'red',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 20
    }
});

export default EditPostedChallan;
