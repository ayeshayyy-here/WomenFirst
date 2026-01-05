import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  StatusBar,
  Image,
  RefreshControl,
  TextInput,
  SafeAreaView,
  Linking,

} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';

const { width, height } = Dimensions.get('window');

const AccountsDetailsScreen = ({ route, navigation }) => {
  const { userCnic, registrationId } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [accountDetails, setAccountDetails] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    registration_id: registrationId,
    bank_name: '',
    branch_name: '',
    branch_code: '',
    account_title: '',
    account_number_iban: '',
    account_type: '',
    mobile_banking: '',
    bank_contact: '',
    cnic_copy: null,
    student_card_copy: null,
    recent_photo: null,
    bank_proof: null,
  });

  const [formErrors, setFormErrors] = useState({});

  const API_BASE_URL = 'https://fa-wdd.punjab.gov.pk/api';

  useEffect(() => {
    console.log('[INIT] 🚀 AccountsDetailsScreen mounted');
    console.log('[INIT] 📋 Registration ID:', registrationId);
    
    if (registrationId) {
      fetchAccountDetails();
    } else {
      Alert.alert('Error', 'Registration ID not available');
      navigation.goBack();
    }
  }, [registrationId]);

  // Fetch account details
  const fetchAccountDetails = async () => {
    try {
      setLoading(true);
      
      console.log('[API] 📦 Fetching account details for registration:', registrationId);
      
      const response = await fetch(
        `${API_BASE_URL}/accounts/${registrationId}/details`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      console.log('[API] ✅ Account details received:', data);
      
      if (data.success) {
        setAccountDetails(data.data);
      } else {
        // No account details yet - this is normal
        console.log('[INFO] No account details found yet');
      }
    } catch (error) {
      console.error('[ERROR] 💥 Fetch account details failed:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchAccountDetails();
  };

  // Open form modal
  const handleOpenForm = () => {
    setFormData({
      registration_id: registrationId,
      bank_name: '',
      branch_name: '',
      branch_code: '',
      account_title: '',
      account_number_iban: '',
      account_type: '',
      mobile_banking: '',
      bank_contact: '',
      cnic_copy: null,
      student_card_copy: null,
      recent_photo: null,
      bank_proof: null,
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  // Validate form
 // Update validateForm() to match web portal validation
const validateForm = () => {
  const errors = {};
  
  // Bank details validation - match web portal
  if (!formData.bank_name.trim()) errors.bank_name = 'Bank name is required';
  if (!formData.branch_name.trim()) errors.branch_name = 'Branch name is required';
  if (!formData.account_title.trim()) errors.account_title = 'Account title is required';
  
  // Account number - max 34 characters (from web portal)
  if (!formData.account_number_iban.trim()) {
    errors.account_number_iban = 'Account number/IBAN is required';
  } else if (formData.account_number_iban.length > 34) {
    errors.account_number_iban = 'Account number/IBAN must be 34 characters or less';
  }
  
  if (!formData.account_type) errors.account_type = 'Account type is required';
  if (!formData.mobile_banking) errors.mobile_banking = 'Mobile banking status is required';
  
  // File validation - match web portal allowed types
  if (!formData.cnic_copy) errors.cnic_copy = 'CNIC copy is required (JPG, PNG, PDF)';
  if (!formData.student_card_copy) errors.student_card_copy = 'Student card copy is required (JPG, PNG, PDF)';
  if (!formData.recent_photo) errors.recent_photo = 'Recent photo is required (JPG, PNG)';
  if (!formData.bank_proof) errors.bank_proof = 'Bank proof is required (JPG, PNG, PDF)';
  
  return errors;
};

  // File picker functions
  const pickFile = async (fieldName, allowedTypes = ['image/*', 'application/pdf']) => {
    try {
      console.log('[FILE] Picking file for:', fieldName);
      
      const result = await DocumentPicker.pick({
        type: allowedTypes,
      });
      
      const file = {
        uri: result[0].uri,
        type: result[0].type,
        name: result[0].name,
        size: result[0].size,
      };
      
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
      
      if (formErrors[fieldName]) {
        setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
      }
      
      console.log('[FILE] File selected:', file.name);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('[FILE] Document picker error:', error);
        Alert.alert('Error', 'Failed to pick file');
      }
    }
  };

  // Pick image from gallery
  const pickImage = async (fieldName) => {
    try {
      console.log('[FILE] Picking image for:', fieldName);
      
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });
      
      if (result.assets && result.assets.length > 0) {
        const file = {
          uri: result.assets[0].uri,
          type: result.assets[0].type || 'image/jpeg',
          name: result.assets[0].fileName || `image_${Date.now()}.jpg`,
        };
        
        setFormData(prev => ({
          ...prev,
          [fieldName]: file
        }));
        
        if (formErrors[fieldName]) {
          setFormErrors(prev => ({ ...prev, [fieldName]: '' }));
        }
      }
    } catch (error) {
      console.error('[FILE] Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Submit account details form
 // In submitAccountForm() function:
const submitAccountForm = async () => {
  console.log('[SUBMIT] Starting account form submission...');
  
  const errors = validateForm();
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    Alert.alert('Validation Error', 'Please fill all required fields correctly');
    return;
  }

  try {
    setIsSubmitting(true);
    
    const data = new FormData();
    
    // Basic fields - EXACTLY match web portal field names
    data.append('registration_id', formData.registration_id.toString());
    data.append('bank_name', formData.bank_name);
    data.append('branch_name', formData.branch_name);
    data.append('branch_code', formData.branch_code);
    data.append('account_title', formData.account_title);
    data.append('account_number_iban', formData.account_number_iban);
    data.append('account_type', formData.account_type);
    data.append('mobile_banking', formData.mobile_banking);
    data.append('bank_contact', formData.bank_contact);
    
    // Files - EXACTLY match web portal field names
    if (formData.cnic_copy) {
      data.append('cnic_copy', {
        uri: formData.cnic_copy.uri,
        type: formData.cnic_copy.type,
        name: formData.cnic_copy.name,
      });
    }
    
    if (formData.student_card_copy) {
      data.append('student_card_copy', {
        uri: formData.student_card_copy.uri,
        type: formData.student_card_copy.type,
        name: formData.student_card_copy.name,
      });
    }
    
    if (formData.recent_photo) {
      data.append('recent_photo', {
        uri: formData.recent_photo.uri,
        type: formData.recent_photo.type,
        name: formData.recent_photo.name,
      });
    }
    
    if (formData.bank_proof) {
      data.append('bank_proof', {
        uri: formData.bank_proof.uri,
        type: formData.bank_proof.type,
        name: formData.bank_proof.name,
      });
    }

    console.log('[API] 📦 Submitting account details...');
    
    // Use the exact same endpoint as web portal
    const response = await fetch(
      `${API_BASE_URL}/accounts/submit`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: data,
      }
    );

    const result = await response.json();
    console.log('[API] ✅ Submit response:', result);
    
    if (result.success) {
      Alert.alert('Success!', result.message || 'Account details submitted successfully! Your step is now complete.', [
        { 
          text: 'OK', 
          onPress: () => {
            setShowFormModal(false);
            fetchAccountDetails(); // Refresh to show completed status
          }
        }
      ]);
    } else {
      let errorMessage = result.message || 'Failed to submit account details';
      if (result.errors) {
        errorMessage = Object.values(result.errors).flat().join('\n');
      }
      Alert.alert('Error', errorMessage);
    }
  } catch (error) {
    console.error('[ERROR] 💥 Submit failed:', error);
    Alert.alert('Error', 'Failed to submit account details. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  // View account details
  const handleViewDetails = () => {
    setShowViewModal(true);
  };

  // Render account status
  const renderAccountStatus = () => {
    if (loading && !accountDetails) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B2D5C" />
          <Text style={styles.loadingText}>Loading Account Details...</Text>
        </View>
      );
    }

    if (accountDetails) {
      return (
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Icon name="university" size={20} color="#4CAF50" />
            <Text style={styles.detailsTitle}>Account Details Submitted</Text>
            <View style={styles.completedBadge}>
              <Icon name="check-circle" size={12} color="#fff" />
              <Text style={styles.completedText}>Completed</Text>
            </View>
          </View>
          
          <View style={styles.detailsContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Bank:</Text>
              <Text style={styles.detailValue}>{accountDetails.bank_name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Branch:</Text>
              <Text style={styles.detailValue}>{accountDetails.branch_name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account:</Text>
              <Text style={styles.detailValue}>{accountDetails.account_title}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Account Type:</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>{accountDetails.account_type}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={handleViewDetails}
          >
            <Icon name="eye" size={12} color="#6B2D5C" />
            <Text style={styles.viewDetailsText}>View Full Details</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Icon name="university" size={40} color="#D2ECFF" />
        <Text style={styles.emptyStateTitle}>Account Details Required</Text>
        <Text style={styles.emptyStateText}>
          You need to submit your bank account details and documents to complete this step.
        </Text>
        
        <TouchableOpacity 
          style={styles.submitButton}
          onPress={handleOpenForm}
        >
          <Icon name="edit" size={14} color="#fff" />
          <Text style={styles.submitButtonText}>Submit Account Details</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render form modal
  const renderFormModal = () => {
    return (
      <Modal
        visible={showFormModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFormModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <ScrollView 
            style={styles.formModalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <LinearGradient
              colors={['#6B2D5C', '#3E2A5D']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <Icon name="university" size={18} color="#fff" />
                <Text style={styles.modalTitle} numberOfLines={2}>
                  Bank Account Details & Documents
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowFormModal(false)}
              >
                <Icon name="times" size={18} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <View style={styles.formContent}>
              {/* Bank Details Section */}
              <View style={styles.sectionHeader}>
                <Icon2 name="account-balance" size={16} color="#6B2D5C" />
                <Text style={styles.sectionHeaderText}>Bank Account Information</Text>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Bank Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formErrors.bank_name && styles.inputError
                  ]}
                  placeholder="e.g., HBL, UBL, MCB"
                  placeholderTextColor="#999"
                  value={formData.bank_name}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, bank_name: text }));
                    if (formErrors.bank_name) setFormErrors(prev => ({ ...prev, bank_name: '' }));
                  }}
                />
                {formErrors.bank_name && (
                  <Text style={styles.errorText}>{formErrors.bank_name}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Branch Name <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formErrors.branch_name && styles.inputError
                  ]}
                  placeholder="e.g., Main Branch, Gulberg Branch"
                  placeholderTextColor="#999"
                  value={formData.branch_name}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, branch_name: text }));
                    if (formErrors.branch_name) setFormErrors(prev => ({ ...prev, branch_name: '' }));
                  }}
                />
                {formErrors.branch_name && (
                  <Text style={styles.errorText}>{formErrors.branch_name}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Branch Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 0123"
                  placeholderTextColor="#999"
                  value={formData.branch_code}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, branch_code: text }))}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Account Title <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formErrors.account_title && styles.inputError
                  ]}
                  placeholder="Account holder name exactly as in bank"
                  placeholderTextColor="#999"
                  value={formData.account_title}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, account_title: text }));
                    if (formErrors.account_title) setFormErrors(prev => ({ ...prev, account_title: '' }));
                  }}
                />
                {formErrors.account_title && (
                  <Text style={styles.errorText}>{formErrors.account_title}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Account Number / IBAN <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    formErrors.account_number_iban && styles.inputError
                  ]}
                  placeholder="e.g., PK36SCBL0000001123456702"
                  placeholderTextColor="#999"
                  value={formData.account_number_iban}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, account_number_iban: text }));
                    if (formErrors.account_number_iban) setFormErrors(prev => ({ ...prev, account_number_iban: '' }));
                  }}
                />
                {formErrors.account_number_iban && (
                  <Text style={styles.errorText}>{formErrors.account_number_iban}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Account Type <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, account_type: 'Current' }));
                      if (formErrors.account_type) setFormErrors(prev => ({ ...prev, account_type: '' }));
                    }}
                  >
                    <View style={styles.radioCircle}>
                      {formData.account_type === 'Current' && <View style={styles.selectedRadio} />}
                    </View>
                    <Text style={styles.radioLabel}>Current Account</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, account_type: 'Savings' }));
                      if (formErrors.account_type) setFormErrors(prev => ({ ...prev, account_type: '' }));
                    }}
                  >
                    <View style={styles.radioCircle}>
                      {formData.account_type === 'Savings' && <View style={styles.selectedRadio} />}
                    </View>
                    <Text style={styles.radioLabel}>Savings Account</Text>
                  </TouchableOpacity>
                </View>
                {formErrors.account_type && (
                  <Text style={styles.errorText}>{formErrors.account_type}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Mobile Banking Registered? <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, mobile_banking: 'Yes' }));
                      if (formErrors.mobile_banking) setFormErrors(prev => ({ ...prev, mobile_banking: '' }));
                    }}
                  >
                    <View style={styles.radioCircle}>
                      {formData.mobile_banking === 'Yes' && <View style={styles.selectedRadio} />}
                    </View>
                    <Text style={styles.radioLabel}>Yes</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.radioOption}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, mobile_banking: 'No' }));
                      if (formErrors.mobile_banking) setFormErrors(prev => ({ ...prev, mobile_banking: '' }));
                    }}
                  >
                    <View style={styles.radioCircle}>
                      {formData.mobile_banking === 'No' && <View style={styles.selectedRadio} />}
                    </View>
                    <Text style={styles.radioLabel}>No</Text>
                  </TouchableOpacity>
                </View>
                {formErrors.mobile_banking && (
                  <Text style={styles.errorText}>{formErrors.mobile_banking}</Text>
                )}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Bank Contact (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 042-111-111-111"
                  placeholderTextColor="#999"
                  value={formData.bank_contact}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, bank_contact: text }))}
                  keyboardType="phone-pad"
                />
              </View>
              
              {/* Documents Section */}
              <View style={styles.sectionHeader}>
                <Icon2 name="cloud-upload" size={16} color="#6B2D5C" />
                <Text style={styles.sectionHeaderText}>Required Documents</Text>
              </View>
              
              <Text style={styles.fileNote}>
                All documents must be clear and legible. Acceptable formats: JPG, JPEG, PNG, PDF
              </Text>
              
              {/* CNIC Copy */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  CNIC Copy (Front & Back) <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.filePickerButton,
                    formErrors.cnic_copy && styles.inputError
                  ]}
                  onPress={() => pickFile('cnic_copy')}
                >
                  <Icon name="id-card" size={16} color="#6B2D5C" />
                  <Text style={styles.filePickerText}>
                    {formData.cnic_copy 
                      ? formData.cnic_copy.name 
                      : 'Choose CNIC Copy (PDF/JPG/PNG)'}
                  </Text>
                </TouchableOpacity>
                {formErrors.cnic_copy && (
                  <Text style={styles.errorText}>{formErrors.cnic_copy}</Text>
                )}
              </View>
              
              {/* Student ID Card */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Student ID Card Copy <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.filePickerButton,
                    formErrors.student_card_copy && styles.inputError
                  ]}
                  onPress={() => pickImage('student_card_copy')}
                >
                  <Icon name="address-card" size={16} color="#6B2D5C" />
                  <Text style={styles.filePickerText}>
                    {formData.student_card_copy 
                      ? formData.student_card_copy.name 
                      : 'Choose Student ID Card (JPG/PNG)'}
                  </Text>
                </TouchableOpacity>
                {formErrors.student_card_copy && (
                  <Text style={styles.errorText}>{formErrors.student_card_copy}</Text>
                )}
              </View>
              
              {/* Recent Photo */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Recent Passport Size Photo <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.filePickerButton,
                    formErrors.recent_photo && styles.inputError
                  ]}
                  onPress={() => pickImage('recent_photo')}
                >
                  <Icon name="camera" size={16} color="#6B2D5C" />
                  <Text style={styles.filePickerText}>
                    {formData.recent_photo 
                      ? formData.recent_photo.name 
                      : 'Choose Recent Photo (JPG/PNG)'}
                  </Text>
                </TouchableOpacity>
                {formErrors.recent_photo && (
                  <Text style={styles.errorText}>{formErrors.recent_photo}</Text>
                )}
              </View>
              
              {/* Bank Proof */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>
                  Bank Proof (Cheque/Letter) <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={[
                    styles.filePickerButton,
                    formErrors.bank_proof && styles.inputError
                  ]}
                  onPress={() => pickFile('bank_proof')}
                >
                  <Icon name="file" size={16} color="#6B2D5C" />
                  <Text style={styles.filePickerText}>
                    {formData.bank_proof 
                      ? formData.bank_proof.name 
                      : 'Choose Bank Proof (PDF/JPG/PNG)'}
                  </Text>
                </TouchableOpacity>
                {formErrors.bank_proof && (
                  <Text style={styles.errorText}>{formErrors.bank_proof}</Text>
                )}
              </View>
              
              {/* Submit Button */}
              <TouchableOpacity 
                style={[
                  styles.submitButton,
                  isSubmitting && styles.submitButtonDisabled
                ]}
                onPress={submitAccountForm}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Icon name="check-circle" size={14} color="#fff" />
                    <Text style={styles.submitButtonText}>
                      Submit & Complete Step
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowFormModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  // Render view details modal
  const renderViewModal = () => {
    if (!accountDetails) return null;
    
    // Function to get file URL
    const getFileUrl = (path) => {
      if (!path) return null;
      if (path.startsWith('http')) return path;
      return `https://fa-wdd.punjab.gov.pk/storage/${path.replace('public/', '')}`;
    };

    // Function to get file name
    const getFileName = (path) => {
      if (!path) return 'No file';
      return path.split('/').pop();
    };

    return (
      <Modal
        visible={showViewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowViewModal(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <LinearGradient
              colors={['#6B2D5C', '#3E2A5D']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <Icon name="university" size={18} color="#fff" />
                <Text style={styles.modalTitle} numberOfLines={2}>
                  Your Bank Account Details
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowViewModal(false)}
              >
                <Icon name="times" size={18} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Bank Information</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Bank Name:</Text>
                  <Text style={styles.detailValue}>{accountDetails.bank_name}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Branch Name:</Text>
                  <Text style={styles.detailValue}>{accountDetails.branch_name}</Text>
                </View>
                
                {accountDetails.branch_code && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Branch Code:</Text>
                    <Text style={styles.detailValue}>{accountDetails.branch_code}</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Title:</Text>
                  <Text style={styles.detailValue}>{accountDetails.account_title}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Number/IBAN:</Text>
                  <Text style={styles.detailValue}>{accountDetails.account_number_iban}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Account Type:</Text>
                  <View style={[
                    styles.typeBadge,
                    { backgroundColor: accountDetails.account_type === 'Current' ? '#2196F3' : '#4CAF50' }
                  ]}>
                    <Text style={styles.typeBadgeText}>{accountDetails.account_type}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mobile Banking:</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: accountDetails.mobile_banking === 'Yes' ? '#4CAF50' : '#FF9800' }
                  ]}>
                    <Text style={styles.statusBadgeText}>{accountDetails.mobile_banking}</Text>
                  </View>
                </View>
                
                {accountDetails.bank_contact && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bank Contact:</Text>
                    <Text style={styles.detailValue}>{accountDetails.bank_contact}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Uploaded Documents</Text>
                
                  {/* CNIC Copy */}
      <TouchableOpacity 
        style={styles.fileItem}
        onPress={() => {
          let url = accountDetails.cnic_copy;
          if (url && !url.startsWith('http')) {
            // Remove /storage/ from the beginning of the path
            const cleanPath = url.replace(/^\/storage\//, '');
            url = `https://fa-wdd.punjab.gov.pk/${cleanPath}`;
          }
          url && Linking.openURL(url);
        }}
        disabled={!accountDetails.cnic_copy}
      >
        <Icon name="id-card" size={20} color="#F44336" />
        <View style={styles.fileInfo}>
          <Text style={styles.fileText}>CNIC Copy</Text>
          <Text style={styles.fileName}>
            {getFileName(accountDetails.cnic_copy)}
          </Text>
        </View>
        <Icon name="external-link" size={16} color="#666" />
      </TouchableOpacity>
      
      {/* Student Card */}
      <TouchableOpacity 
        style={styles.fileItem}
        onPress={() => {
          let url = accountDetails.student_card_copy;
          if (url && !url.startsWith('http')) {
            // Remove /storage/ from the beginning of the path
            const cleanPath = url.replace(/^\/storage\//, '');
            url = `https://fa-wdd.punjab.gov.pk/${cleanPath}`;
          }
          url && Linking.openURL(url);
        }}
        disabled={!accountDetails.student_card_copy}
      >
        <Icon name="address-card" size={20} color="#2196F3" />
        <View style={styles.fileInfo}>
          <Text style={styles.fileText}>Student ID Card</Text>
          <Text style={styles.fileName}>
            {getFileName(accountDetails.student_card_copy)}
          </Text>
        </View>
        <Icon name="external-link" size={16} color="#666" />
      </TouchableOpacity>
      
      {/* Recent Photo */}
      <TouchableOpacity 
        style={styles.fileItem}
        onPress={() => {
          let url = accountDetails.recent_photo;
          if (url && !url.startsWith('http')) {
            // Remove /storage/ from the beginning of the path
            const cleanPath = url.replace(/^\/storage\//, '');
            url = `https://fa-wdd.punjab.gov.pk/${cleanPath}`;
          }
          url && Linking.openURL(url);
        }}
        disabled={!accountDetails.recent_photo}
      >
        <Icon name="camera" size={20} color="#4CAF50" />
        <View style={styles.fileInfo}>
          <Text style={styles.fileText}>Recent Photo</Text>
          <Text style={styles.fileName}>
            {getFileName(accountDetails.recent_photo)}
          </Text>
        </View>
        <Icon name="external-link" size={16} color="#666" />
      </TouchableOpacity>
      
      {/* Bank Proof */}
      <TouchableOpacity 
        style={styles.fileItem}
        onPress={() => {
          let url = accountDetails.bank_proof;
          if (url && !url.startsWith('http')) {
            // Remove /storage/ from the beginning of the path
            const cleanPath = url.replace(/^\/storage\//, '');
            url = `https://fa-wdd.punjab.gov.pk/${cleanPath}`;
          }
          url && Linking.openURL(url);
        }}
        disabled={!accountDetails.bank_proof}
      >
        <Icon name="file" size={20} color="#FF9800" />
        <View style={styles.fileInfo}>
          <Text style={styles.fileText}>Bank Proof</Text>
          <Text style={styles.fileName}>
            {getFileName(accountDetails.bank_proof)}
          </Text>
        </View>
        <Icon name="external-link" size={16} color="#666" />
      </TouchableOpacity>
    </View>
    
    <View style={styles.modalFooter}>
      <TouchableOpacity 
        style={styles.closeModalButton}
        onPress={() => setShowViewModal(false)}
      >
        <Icon name="check" size={14} color="#fff" />
        <Text style={styles.closeModalButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
</View>
</SafeAreaView>
</Modal>
);
};
    

  // Loading Screen
  if (loading && !accountDetails) {
    return (
      <View style={styles.fullLoadingContainer}>
        <StatusBar backgroundColor="#6B2D5C" barStyle="light-content" />
        <LinearGradient
          colors={['#6B2D5C', '#3E2A5D']}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading Account Details...</Text>
          <Text style={styles.loadingSubtext}>
            Fetching your bank account information
          </Text>
        </LinearGradient>
      </View>
    );
  }

  // Main Screen
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B2D5C" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6B2D5C', '#3E2A5D']}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={18} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Accounts Details</Text>
          <Text style={styles.headerSubtitle}>
            Submit bank account details and documents
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="refresh" size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </LinearGradient>
      
      {/* Main Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6B2D5C']}
            tintColor="#6B2D5C"
          />
        }
      >
        <View style={styles.mainContent}>
          {renderAccountStatus()}
          
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>📋 Required Information</Text>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Bank Account Details:</Text> Bank name, branch, account title, number
              </Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Account Type:</Text> Current or Savings account
              </Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Mobile Banking:</Text> Yes/No status
              </Text>
            </View>
            
            <View style={styles.instructionStep}>
              <View style={styles.stepIcon}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>
                <Text style={styles.stepBold}>Required Documents:</Text> CNIC, Student ID, Photo, Bank Proof
              </Text>
            </View>
          </View>
          
          <View style={styles.noteContainer}>
            <Icon name="exclamation-circle" size={14} color="#FFC107" />
            <Text style={styles.noteText}>
              <Text style={styles.noteBold}>Important:</Text> All documents must be clear and legible. 
              Payments will be made to the submitted bank account.
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Modals */}
      {renderFormModal()}
      {renderViewModal()}
    </View>
  );
};

// Stylesheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  fullLoadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 12,
    color: '#D2ECFF',
    textAlign: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#D2ECFF',
    marginTop: 2,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  mainContent: {
    padding: 16,
  },
  // Loading Container
  loadingContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // Details Card
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 5,
  },
  completedText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  detailsContent: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    width: 100,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },
  typeBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
    marginTop: 12,
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#6B2D5C',
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B2D5C',
    marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B2D5C',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  // Instructions
  instructionsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B2D5C',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  stepIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#6B2D5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 10,
  },
  stepText: {
    flex: 1,
    fontSize: 11,
    color: '#555',
    lineHeight: 16,
  },
  stepBold: {
    fontWeight: '700',
    color: '#333',
  },
  // Note Container
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9C4',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 11,
    color: '#5D4037',
    lineHeight: 16,
  },
  noteBold: {
    fontWeight: '700',
    color: '#E65100',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  formModalContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    margin: 12,
    marginTop: StatusBar.currentHeight + 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
    padding: 16,
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B2D5C',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#6B2D5C',
    marginBottom: 12,
  },
  detailSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  requiredStar: {
    color: '#dc3545',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#333',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 10,
    color: '#dc3545',
    marginTop: 4,
    fontWeight: '500',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#6B2D5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6B2D5C',
  },
  radioLabel: {
    fontSize: 12,
    color: '#333',
  },
  fileNote: {
    fontSize: 10,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
    lineHeight: 14,
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  filePickerText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  // View Modal Styles
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginBottom: 8,
    gap: 10,
  },
  fileInfo: {
    flex: 1,
  },
  fileText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  fileName: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  closeModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6B2D5C',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  closeModalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default AccountsDetailsScreen;