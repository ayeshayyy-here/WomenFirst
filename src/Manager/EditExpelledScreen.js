import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import DocumentPicker from 'react-native-document-picker';
import LinearGradient from 'react-native-linear-gradient';
import syncStorage from 'react-native-sync-storage';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditExpelledScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date(),
        relaxation_date: null,
        ex_reason: '',
        ex_remarks: '',
        ex_attachment: null,
        attachmentName: ''
    });
    const [recordData, setRecordData] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showRelaxationPicker, setShowRelaxationPicker] = useState(false);

    // Fetch record data
    useEffect(() => {
        fetchRecordData();
    }, []);

    const fetchRecordData = async () => {
        setLoading(true);
        try {
            const token = await syncStorage.get('token');
            
            const response = await axios.get(
                `${API_BASE_URL}/api/expelled/edit/${id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.data.success) {
                const { expelled, user, room } = response.data.data;
                setRecordData({ expelled, user, room });
                
                // Set form data
                setFormData({
                    date: new Date(expelled.app_date),
                    relaxation_date: expelled.relaxation_date ? new Date(expelled.relaxation_date) : null,
                    ex_reason: expelled.ex_reason,
                    ex_remarks: expelled.ex_remarks || '',
                    ex_attachment: null,
                    attachmentName: expelled.ex_attachment ? expelled.ex_attachment.split('/').pop() : ''
                });
            } else {
                Alert.alert('Error', 'Failed to load record data');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error fetching record:', error);
            Alert.alert('Error', 'Unable to load record data');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setFormData({ ...formData, date: selectedDate });
        }
    };

    const handleRelaxationDateChange = (event, selectedDate) => {
        setShowRelaxationPicker(false);
        if (selectedDate) {
            setFormData({ ...formData, relaxation_date: selectedDate });
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.pick({
                type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
            });

            setFormData({
                ...formData,
                ex_attachment: result[0],
                attachmentName: result[0].name
            });
        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled
            } else {
                Alert.alert('Error', 'Failed to pick document');
            }
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.ex_reason) {
            Alert.alert('Validation Error', 'Please select a reason');
            return;
        }

        setSubmitting(true);
        try {
            const token = await syncStorage.get('token');
            
            // Prepare form data
            const data = new FormData();
            data.append('date', formData.date.toISOString().split('T')[0]);
            data.append('relaxation_date', formData.relaxation_date ? 
                formData.relaxation_date.toISOString().split('T')[0] : '');
            data.append('ex_reason', formData.ex_reason);
            data.append('ex_remarks', formData.ex_remarks);
            
            if (formData.ex_attachment) {
                data.append('ex_attachment', {
                    uri: formData.ex_attachment.uri,
                    type: formData.ex_attachment.type,
                    name: formData.ex_attachment.name,
                });
            }

            const response = await axios.post(
                `${API_BASE_URL}/api/expelled/update/${id}`,
                data,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.data.success) {
                Alert.alert(
                    'Success',
                    'Expulsion request updated successfully',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('ExpelledHome')
                        }
                    ]
                );
            } else {
                Alert.alert('Error', response.data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Update error:', error);
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to update record'
            );
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'Not set';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading record data...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2563eb" />
            
            {/* Header */}
            <LinearGradient
                colors={['#2563eb', '#1d4ed8']}
                style={styles.header}
            >
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Expulsion Request</Text>
            </LinearGradient>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Student Info Card */}
                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Icon name="user" size={18} color="#2563eb" style={styles.infoIcon} />
                        <Text style={styles.infoLabel}>Student Name:</Text>
                        <Text style={styles.infoValue}>{recordData?.user?.name}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Icon name="id-card" size={18} color="#2563eb" style={styles.infoIcon} />
                        <Text style={styles.infoLabel}>CNIC:</Text>
                        <Text style={styles.infoValue}>{recordData?.personal?.cnic}</Text>
                    </View>
                    
                    {recordData?.room && (
                        <View style={styles.infoRow}>
                            <Icon name="bed" size={18} color="#2563eb" style={styles.infoIcon} />
                            <Text style={styles.infoLabel}>Room/Bed:</Text>
                            <Text style={styles.infoValue}>{recordData.room.room_info}</Text>
                        </View>
                    )}
                </View>

                {/* Form Fields */}
                <View style={styles.formCard}>
                    {/* Date Field */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Date *</Text>
                        <TouchableOpacity 
                            style={styles.datePickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Icon name="calendar" size={20} color="#666" />
                            <Text style={styles.dateText}>
                                {formatDate(formData.date)}
                            </Text>
                            <Icon name="chevron-down" size={20} color="#999" />
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={formData.date}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleDateChange}
                            />
                        )}
                    </View>

                    {/* Relaxation Date Field */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Relaxation Date</Text>
                        <TouchableOpacity 
                            style={styles.datePickerButton}
                            onPress={() => setShowRelaxationPicker(true)}
                        >
                            <Icon name="calendar-check-o" size={20} color="#666" />
                            <Text style={styles.dateText}>
                                {formData.relaxation_date ? 
                                    formatDate(formData.relaxation_date) : 'Select Date'}
                            </Text>
                            <Icon name="chevron-down" size={20} color="#999" />
                        </TouchableOpacity>
                        {showRelaxationPicker && (
                            <DateTimePicker
                                value={formData.relaxation_date || new Date()}
                                mode="date"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleRelaxationDateChange}
                            />
                        )}
                    </View>

                    {/* Reason Field */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Reason *</Text>
                        <View style={styles.pickerContainer}>
                            <Icon name="exclamation-circle" size={20} color="#666" style={styles.pickerIcon} />
                            <View style={styles.pickerWrapper}>
                                {/* React Native Picker for reason */}
                                <View style={styles.selectInput}>
                                    <Text style={styles.selectText}>
                                        {formData.ex_reason || 'Select Reason'}
                                    </Text>
                                    <Icon name="chevron-down" size={16} color="#999" />
                                </View>
                                {/* Reason options will be shown in a modal or action sheet */}
                            </View>
                        </View>
                        <View style={styles.reasonOptions}>
                            {['Misconduct / Violation', 'Voluntary Withdrawal', 'Stay Period Expired', 'Other (With Approval)'].map((reason) => (
                                <TouchableOpacity
                                    key={reason}
                                    style={[
                                        styles.reasonOption,
                                        formData.ex_reason === reason && styles.reasonOptionSelected
                                    ]}
                                    onPress={() => setFormData({...formData, ex_reason: reason})}
                                >
                                    <Text style={[
                                        styles.reasonOptionText,
                                        formData.ex_reason === reason && styles.reasonOptionTextSelected
                                    ]}>
                                        {reason}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Remarks Field */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Remarks</Text>
                        <View style={styles.textInputContainer}>
                            <Icon name="comment-o" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter remarks (optional)"
                                value={formData.ex_remarks}
                                onChangeText={(text) => setFormData({...formData, ex_remarks: text})}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Attachment Field */}
                    <View style={styles.formGroup}>
                        <Text style={styles.formLabel}>Attachment</Text>
                        <TouchableOpacity 
                            style={styles.attachmentButton}
                            onPress={pickDocument}
                        >
                            <Icon name="paperclip" size={20} color="#2563eb" />
                            <Text style={styles.attachmentButtonText}>
                                {formData.attachmentName || 'Choose File (JPG, PNG, PDF)'}
                            </Text>
                        </TouchableOpacity>
                        {recordData?.expelled?.ex_attachment && !formData.attachmentName && (
                            <Text style={styles.currentFileText}>
                                Current: {recordData.expelled.ex_attachment.split('/').pop()}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity 
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Icon name="save" size={20} color="white" />
                            <Text style={styles.submitButtonText}>
                                Update Expulsion Request
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 40,
        paddingBottom: 20,
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    infoCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    infoIcon: {
        width: 24,
        marginRight: 12,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4b5563',
        width: 100,
    },
    infoValue: {
        fontSize: 14,
        color: '#1f2937',
        flex: 1,
    },
    formCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    formGroup: {
        marginBottom: 20,
    },
    formLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#f9fafb',
    },
    dateText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    pickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#f9fafb',
        overflow: 'hidden',
    },
    pickerIcon: {
        marginLeft: 12,
    },
    pickerWrapper: {
        flex: 1,
    },
    selectInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    selectText: {
        fontSize: 16,
        color: '#1f2937',
    },
    reasonOptions: {
        marginTop: 8,
        gap: 8,
    },
    reasonOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#f9fafb',
    },
    reasonOptionSelected: {
        backgroundColor: '#dbeafe',
        borderColor: '#2563eb',
    },
    reasonOptionText: {
        fontSize: 14,
        color: '#4b5563',
    },
    reasonOptionTextSelected: {
        color: '#2563eb',
        fontWeight: '600',
    },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        backgroundColor: '#f9fafb',
    },
    inputIcon: {
        marginTop: 12,
        marginLeft: 12,
    },
    textInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1f2937',
        minHeight: 100,
    },
    attachmentButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#2563eb',
        borderStyle: 'dashed',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#eff6ff',
    },
    attachmentButtonText: {
        flex: 1,
        marginLeft: 12,
        fontSize: 14,
        color: '#2563eb',
        fontWeight: '500',
    },
    currentFileText: {
        marginTop: 8,
        fontSize: 12,
        color: '#6b7280',
        fontStyle: 'italic',
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563eb',
        paddingVertical: 16,
        borderRadius: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    submitButtonDisabled: {
        backgroundColor: '#93c5fd',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 12,
    },
});

export default EditExpelledScreen;