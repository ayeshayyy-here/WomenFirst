// Step2Form.js - COMPLETE FULLY WORKING VERSION
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  Dimensions,
  Modal,
} from 'react-native';
import { RadioButton, Checkbox } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import SyncStorage from 'react-native-sync-storage';

const { width, height } = Dimensions.get('window');

// API Base URL
const API_BASE_URL = 'https://wbic-wdd.punjab.gov.pk/api/v1';

// Beautiful Color Scheme
const COLORS = {
  primary: '#c13397',
  primaryDark: '#6b075f',
  primaryLight: '#cf54cf',
  primarySoft: '#F0ECFF',
  primaryGradient: ['#bb37a1', '#c43fa9', '#c64fc6'],
  success: '#00C48C',
  successLight: '#E0F9F0',
  warning: '#FFB946',
  warningLight: '#FFF4E5',
  error: '#FF4D4F',
  errorLight: '#FFE5E5',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  textLighter: '#BDC3C7',
  border: '#E8ECF0',
  background: '#F9FAFC',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  stepActive: '#a1339d',
  stepCompleted: '#00C48C',
  stepInactive: '#E8ECF0',
  shadow: '#000000',
};

// Custom Picker Component
const CustomPicker = ({ visible, options, selectedValue, onSelect, onClose, title }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalOptions}>
            {options.map((option, index) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalOption,
                    selectedValue === optionValue && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    onSelect(optionValue);
                    onClose();
                  }}
                >
                  <Text style={[
                    styles.modalOptionText,
                    selectedValue === optionValue && styles.modalOptionTextSelected
                  ]}>
                    {optionLabel}
                  </Text>
                  {selectedValue === optionValue && (
                    <Icon name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const Step2Form = ({ navigation, route }) => {
  // State
  const [cnic, setCnic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [wordCounts, setWordCounts] = useState({
    description: 0,
    key_findings: 0,
  });

  // Form State
  const [formData, setFormData] = useState({
    social: {
      LinkedIn: { exists: false, value: '' },
      Instagram: { exists: false, value: '' },
      Facebook: { exists: false, value: '' },
      Youtube: { exists: false, value: '' },
      Tiktok: { exists: false, value: '' },
      Website: { exists: false, value: '' },
      Other: { exists: false, name: '', value: '' },
    },
    startup_status: '',
    est_year: '',
    reg_forum: '',
    other_reg_forum: '',
    proposed_name: '',
    years_active: '',
    startup_stage: '',
    other_startup_stage: '',
    industry_sector: '',
    other_industry_sector: '',
    description: '',
    market_research: '',
    key_findings: '',
    target: {
      '16–25 (Gen Z)': { check: false, desc: '' },
      '26–35 (Young Adults)': { check: false, desc: '' },
      '36–50 (Middle-aged)': { check: false, desc: '' },
      '51+ (Seniors)': { check: false, desc: '' },
    },
    geo: {
      'Village/Mohalla': { check: false, remarks: '' },
      'UC level': { check: false, remarks: '' },
      'Tehsil level': { check: false, remarks: '' },
      'District level': { check: false, remarks: '' },
      'Divisional level': { check: false, remarks: '' },
      'Province level': { check: false, remarks: '' },
      'National level': { check: false, remarks: '' },
      'International Level': { check: false, remarks: '' },
    },
    use_software: '',
    software_name_text: '',
    is_sole_founder: '',
    cofounder_name: '',
    cofounder_contact: '',
    team_size: '',
    avg_income: '',
    has_loan: '',
    loan_amount: '',
    loan_provider: '',
    loan_duration: '',
  });

  // Dynamic UI States
  const [showRegDetails, setShowRegDetails] = useState(false);
  const [showUnregDetails, setShowUnregDetails] = useState(false);
  const [showOtherRegForum, setShowOtherRegForum] = useState(false);
  const [showOtherStage, setShowOtherStage] = useState(false);
  const [showOtherIndustry, setShowOtherIndustry] = useState(false);
  const [showFindings, setShowFindings] = useState(false);
  const [showSoftwareInput, setShowSoftwareInput] = useState(false);
  const [showCofounder, setShowCofounder] = useState(false);
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [showPicker, setShowPicker] = useState({});

  // Data arrays
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1999 + 1 }, (_, i) => 
    (currentYear - i).toString()
  );
  
  const incomeRanges = [
    'Up to 15000',
    '15001 – 25000',
    '25001 – 35000',
    '35001 – 50000',
    '50001 – 75000',
    '75001 – 100000',
    '100000+',
  ];
  
  const yearsActiveOptions = [
    'Less than 1 year',
    '1-3 Years',
    '3+ Years',
  ];
  
  const loanAmountOptions = ['Up to 50,000', 'More than 50,000'];
  const loanDurationOptions = ['6 Months', '12 Months'];
  
  const regForumOptions = [
    'Association of Persons (AOP)',
    'Partnership Firm',
    'Sole Proprietor',
    'Individual Business Entity',
    'Others',
  ];
  
  const startupStageOptions = [
    'Idea Stage',
    'Prototype / Developed',
    'Early Traction/Initial Sales',
    'Growth Stage',
    'Others',
  ];
  
  const industrySectorOptions = [
    'Fashion & Textile',
    'Handicrafts & Artisan Products',
    'Beauty, Cosmetics & Personal Care',
    'Food & Beverages / Restaurants / Catering',
    'E-commerce & Online Retail',
    'Information Technology (IT) & Software',
    'Health & Wellness',
    'Education & Training Services',
    'Agri-Tech & Agribusiness',
    'Home-based Manufacturing',
    'Creative Arts',
    'Tourism & Hospitality',
    'FinTech / Financial Services',
    'Environment / Sustainability',
    'Professional Services',
    'Social Enterprise',
    'Others',
  ];

  // API client
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  });

  api.interceptors.request.use(request => {
    console.log(`\n========== [API Request] ==========`);
    console.log(`📤 ${request.method?.toUpperCase()} ${request.url}`);
    console.log(`📦 Data:`, request.data);
    return request;
  });

  api.interceptors.response.use(
    response => {
      console.log(`\n========== [API Response] ==========`);
      console.log(`📥 Status: ${response.status}`);
      console.log(`📦 Data:`, response.data);
      return response;
    },
    error => {
      console.log(`\n========== [API Error] ==========`);
      console.log(`❌ Status: ${error.response?.status}`);
      console.log(`❌ Data:`, error.response?.data);
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    console.log('========== [Step2Form] Component Mounted ==========');
    getCnicFromStorage();
  }, []);

  // Dynamic UI Effects
  useEffect(() => {
    setShowRegDetails(formData.startup_status === 'Registered');
    setShowUnregDetails(formData.startup_status === 'Unregistered');
  }, [formData.startup_status]);

  useEffect(() => {
    setShowOtherRegForum(formData.reg_forum === 'Others');
  }, [formData.reg_forum]);

  useEffect(() => {
    setShowOtherStage(formData.startup_stage === 'Others');
  }, [formData.startup_stage]);

  useEffect(() => {
    setShowOtherIndustry(formData.industry_sector === 'Others');
  }, [formData.industry_sector]);

  useEffect(() => {
    setShowFindings(formData.market_research === '1');
  }, [formData.market_research]);

  useEffect(() => {
    setShowSoftwareInput(formData.use_software === 'Yes');
  }, [formData.use_software]);

  useEffect(() => {
    setShowCofounder(formData.is_sole_founder === '0');
  }, [formData.is_sole_founder]);

  useEffect(() => {
    setShowLoanDetails(formData.has_loan === '1');
  }, [formData.has_loan]);

  const getCnicFromStorage = () => {
    try {
      setInitialLoading(true);
      console.log('[SyncStorage] Getting user_profile from SyncStorage...');
      
      const storedProfile = SyncStorage.get('user_profile');
      console.log('[SyncStorage] Raw profile:', storedProfile);
      
      if (storedProfile) {
        let profile;
        try {
          profile = typeof storedProfile === 'string' ? JSON.parse(storedProfile) : storedProfile;
          console.log('[SyncStorage] Parsed profile:', profile);
        } catch (e) {
          console.log('[SyncStorage] Parse error:', e);
          profile = storedProfile;
        }
        
        if (profile && profile.cnic) {
          const cleanCnic = profile.cnic.replace(/-/g, '');
          console.log('[SyncStorage] Cleaned CNIC:', cleanCnic);
          setCnic(cleanCnic);
        } else {
          console.log('[SyncStorage] No CNIC in profile');
          Alert.alert(
            'Information Required',
            'Please complete Step 1 first to provide your CNIC.',
            [
              { text: 'Go to Step 1', onPress: () => navigation.navigate('Step1Form') },
              { text: 'Cancel', onPress: () => navigation.goBack() }
            ]
          );
        }
      } else {
        console.log('[SyncStorage] No user_profile found');
        Alert.alert(
          'Information Required',
          'Please complete Step 1 first to provide your CNIC.',
          [
            { text: 'Go to Step 1', onPress: () => navigation.navigate('Step1Form') },
            { text: 'Cancel', onPress: () => navigation.goBack() }
          ]
        );
      }
    } catch (error) {
      console.error('[SyncStorage] Error getting CNIC:', error);
      Alert.alert('Error', 'Failed to load your information. Please try again.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform, field, value) => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [platform]: {
          ...prev.social[platform],
          [field]: value,
        },
      },
    }));
  };

  const handleTargetChange = (ageGroup, field, value) => {
    setFormData(prev => ({
      ...prev,
      target: {
        ...prev.target,
        [ageGroup]: {
          ...prev.target[ageGroup],
          [field]: value,
        },
      },
    }));
  };

  const handleGeoChange = (level, field, value) => {
    setFormData(prev => ({
      ...prev,
      geo: {
        ...prev.geo,
        [level]: {
          ...prev.geo[level],
          [field]: value,
        },
      },
    }));
  };

  const handleDescriptionChange = (text) => {
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    setWordCounts(prev => ({ ...prev, description: words }));
    handleInputChange('description', text);
  };

  const handleFindingsChange = (text) => {
    const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
    setWordCounts(prev => ({ ...prev, key_findings: words }));
    handleInputChange('key_findings', text);
  };

  const validateForm = () => {
    console.log('[Validation] Starting validation...');
    const newErrors = {};
    
    if (!formData.startup_status) {
      newErrors.startup_status = 'Please select startup status';
    } else {
      if (formData.startup_status === 'Registered') {
        if (!formData.est_year) newErrors.est_year = 'Year of establishment is required';
        if (!formData.reg_forum) newErrors.reg_forum = 'Registration forum is required';
        if (formData.reg_forum === 'Others' && !formData.other_reg_forum) {
          newErrors.other_reg_forum = 'Please specify registration forum';
        }
      } else if (formData.startup_status === 'Unregistered') {
        if (!formData.proposed_name) newErrors.proposed_name = 'Proposed name is required';
        if (!formData.years_active) newErrors.years_active = 'Years active is required';
      }
    }
    
    if (!formData.startup_stage) {
      newErrors.startup_stage = 'Startup stage is required';
    } else if (formData.startup_stage === 'Others' && !formData.other_startup_stage) {
      newErrors.other_startup_stage = 'Please specify startup stage';
    }
    
    if (!formData.industry_sector) {
      newErrors.industry_sector = 'Industry sector is required';
    } else if (formData.industry_sector === 'Others' && !formData.other_industry_sector) {
      newErrors.other_industry_sector = 'Please specify industry sector';
    }
    
    if (!formData.description) {
      newErrors.description = 'Description is required';
    } else if (wordCounts.description > 200) {
      newErrors.description = 'Description must be 200 words or less';
    }
    
    if (formData.market_research === '') {
      newErrors.market_research = 'Please specify if you have conducted market research';
    } else if (formData.market_research === '1' && !formData.key_findings) {
      newErrors.key_findings = 'Key findings are required';
    } else if (formData.market_research === '1' && wordCounts.key_findings > 100) {
      newErrors.key_findings = 'Key findings must be 100 words or less';
    }
    
    const hasTarget = Object.values(formData.target).some(t => t.check);
    if (!hasTarget) {
      newErrors.target = 'Please select at least one target customer age group';
    }
    
    const hasGeo = Object.values(formData.geo).some(g => g.check);
    if (!hasGeo) {
      newErrors.geo = 'Please select at least one geographic outreach level';
    }
    
    if (formData.is_sole_founder === '') {
      newErrors.is_sole_founder = 'Please specify if you are a sole founder';
    } else if (formData.is_sole_founder === '0') {
      if (!formData.cofounder_name) newErrors.cofounder_name = 'Co-founder name is required';
      if (!formData.cofounder_contact) newErrors.cofounder_contact = 'Co-founder contact is required';
      if (formData.cofounder_contact && !/^03\d{9}$/.test(formData.cofounder_contact)) {
        newErrors.cofounder_contact = 'Contact number must be 03XXXXXXXXX format';
      }
    }
    
    if (!formData.team_size) {
      newErrors.team_size = 'Team size is required';
    } else if (parseInt(formData.team_size) < 1) {
      newErrors.team_size = 'Team size must be at least 1';
    }
    
    if (!formData.avg_income) {
      newErrors.avg_income = 'Average monthly income is required';
    }
    
    if (formData.has_loan === '') {
      newErrors.has_loan = 'Please specify if you have availed microfinance facility';
    } else if (formData.has_loan === '1') {
      if (!formData.loan_amount) newErrors.loan_amount = 'Loan amount is required';
      if (!formData.loan_provider) newErrors.loan_provider = 'Loan provider is required';
      if (!formData.loan_duration) newErrors.loan_duration = 'Loan duration is required';
    }
    
    if (formData.use_software === 'Yes' && !formData.software_name_text) {
      newErrors.software_name_text = 'Please specify software/tools used';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log('[Validation]', isValid ? '✅ Valid' : '❌ Invalid', newErrors);
    return isValid;
  };

 const handleSubmit = async () => {
  console.log('[Submit] Starting submission...');
  
  if (!cnic) {
    console.log('[Submit] No CNIC found');
    Alert.alert('Error', 'No CNIC found. Please complete Step 1 first.');
    return;
  }
  
  if (!validateForm()) {
    Alert.alert('Validation Error', 'Please fill all required fields correctly');
    return;
  }
  
  setLoading(true);
  
  try {
    // Prepare submission data
    const submitData = {
      cnic: cnic,
      ...formData,
    };
    
    // Clean up target data - ONLY include checked items with check: '1'
    // Unchecked items should NOT be sent (or send null)
    submitData.target = {};
    Object.keys(formData.target).forEach(key => {
      if (formData.target[key].check) {
        // Only include if checked
        submitData.target[key] = {
          check: '1',  // Must be string '1' as per backend validation
          desc: formData.target[key].desc || ''
        };
      }
      // Don't send unchecked items at all
    });
    
    // Clean up geo data - ONLY include checked items with check: '1'
    submitData.geo = {};
    Object.keys(formData.geo).forEach(key => {
      if (formData.geo[key].check) {
        // Only include if checked
        submitData.geo[key] = {
          check: '1',  // Must be string '1' as per backend validation
          remarks: formData.geo[key].remarks || ''
        };
      }
      // Don't send unchecked items at all
    });
    
    // Clean up social data
    const socialLinks = {};
    Object.keys(formData.social).forEach(platform => {
      const data = formData.social[platform];
      if (data.exists && data.value) {
        if (platform === 'Other') {
          if (data.name && data.value) {
            socialLinks[platform] = {
              name: data.name,
              value: data.value,
            };
          }
        } else if (data.value) {
          socialLinks[platform] = data.value;
        }
      }
    });
    submitData.social = socialLinks;
    
    // Remove fields that shouldn't be sent
    delete submitData.social_links;
    
    // Clean up empty strings to null
    const fieldsToClean = ['other_reg_forum', 'other_startup_stage', 'other_industry_sector', 
                           'proposed_name', 'years_active', 'cofounder_name', 'cofounder_contact'];
    fieldsToClean.forEach(field => {
      if (submitData[field] === '') {
        submitData[field] = null;
      }
    });
    
    // Convert team_size to integer
    if (submitData.team_size) {
      submitData.team_size = parseInt(submitData.team_size);
    }
    
    // Ensure est_year is integer or null
    if (submitData.est_year === '') {
      submitData.est_year = null;
    } else if (submitData.est_year) {
      submitData.est_year = parseInt(submitData.est_year);
    }
    
    // Convert boolean-like fields to strings '0' or '1' as backend expects
    submitData.market_research = submitData.market_research === '1' ? '1' : '0';
    submitData.has_loan = submitData.has_loan === '1' ? '1' : '0';
    submitData.is_sole_founder = submitData.is_sole_founder === '1' ? '1' : '0';
    
    console.log('[Submit] Submitting data:', JSON.stringify(submitData, null, 2));
    
    const response = await api.post('/register/step2', submitData);
    
    if (response.data.success) {
      console.log('[Submit] ✅ Success!');
      Alert.alert(
        'Success!',
        response.data.message || 'Step 2 saved successfully!',
        [{ text: 'Continue to Step 3', onPress: () => navigation.navigate('Step3Form') }]
      );
    } else {
      Alert.alert('Error', response.data.message || 'Failed to save form');
    }
  } catch (error) {
    console.error('[Submit] Error:', error);
    
    if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat();
      Alert.alert('Validation Error', errorMessages.join('\n'));
      setErrors(error.response.data.errors);
    } else if (error.message === 'Network Error') {
      Alert.alert('Network Error', 'Please check your internet connection and try again.');
    } else {
      Alert.alert('Error', 'Failed to save form. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  // Unified renderSelect function
  const renderSelect = (label, field, options, placeholder = 'Select an option') => {
    const selectedValue = formData[field];
    
    const normalizedOptions = options.map(opt => 
      typeof opt === 'object' ? opt : { label: opt, value: opt }
    );
    
    const getDisplayText = () => {
      if (!selectedValue) return placeholder;
      const option = normalizedOptions.find(opt => opt.value === selectedValue);
      return option ? option.label : selectedValue;
    };
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.selectButton, errors[field] && styles.inputError]}
          onPress={() => setShowPicker(prev => ({ ...prev, [field]: true }))}
        >
          <Text style={selectedValue ? styles.selectText : styles.selectPlaceholder}>
            {getDisplayText()}
          </Text>
          <Icon name="arrow-drop-down" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
        
        <CustomPicker
          visible={showPicker[field] || false}
          options={normalizedOptions}
          selectedValue={selectedValue}
          onSelect={(value) => handleInputChange(field, value)}
          onClose={() => setShowPicker(prev => ({ ...prev, [field]: false }))}
          title={label}
        />
      </View>
    );
  };

  const renderInput = (label, field, placeholder, options = {}) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label}
        {options.required && <Text style={styles.required}> *</Text>}
      </Text>
      {options.multiline ? (
        <TextInput
          style={[styles.input, styles.textArea, errors[field] && styles.inputError]}
          value={formData[field]}
          onChangeText={options.onChange || ((text) => handleInputChange(field, text))}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLighter}
          multiline
          numberOfLines={options.numberOfLines || 4}
          textAlignVertical="top"
        />
      ) : (
        <TextInput
          style={[styles.input, errors[field] && styles.inputError]}
          value={formData[field]}
          onChangeText={(text) => handleInputChange(field, text)}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLighter}
          keyboardType={options.keyboardType}
          maxLength={options.maxLength}
        />
      )}
      {options.counter && (
        <Text style={[styles.charCount, wordCounts[field] > options.maxWords && styles.errorText]}>
          {wordCounts[field] || 0} / {options.maxWords} words
        </Text>
      )}
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const ProgressSteps = () => (
    <View style={styles.progressContainer}>
      <View style={styles.stepWrapper}>
        <LinearGradient colors={COLORS.primaryGradient} style={[styles.stepCircle, styles.stepCompleted]} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          <Icon name="check" size={20} color={COLORS.white} />
        </LinearGradient>
        <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Personal</Text>
      </View>
      <View style={[styles.stepLine, { backgroundColor: COLORS.primary }]} />
      <View style={styles.stepWrapper}>
        <LinearGradient colors={COLORS.primaryGradient} style={[styles.stepCircle, styles.stepActive]} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          <Text style={styles.stepCircleText}>2</Text>
        </LinearGradient>
        <Text style={[styles.stepLabel, styles.stepLabelActive]}>Business</Text>
      </View>
      <View style={[styles.stepLine, { backgroundColor: COLORS.border }]} />
      <View style={styles.stepWrapper}>
        <View style={[styles.stepCircle, styles.stepInactive]}>
          <Text style={styles.stepCircleText}>3</Text>
        </View>
        <Text style={styles.stepLabel}>Learning</Text>
      </View>
    </View>
  );

  const UserInfoBanner = () => {
    if (!cnic) return null;
    let userName = '';
    try {
      const profile = SyncStorage.get('user_profile');
      if (profile) {
        const parsed = typeof profile === 'string' ? JSON.parse(profile) : profile;
        userName = parsed.name || '';
      }
    } catch (e) {
      console.log('Error parsing profile:', e);
    }
    return (
      <LinearGradient colors={['#F0ECFF', '#FFFFFF']} style={styles.userBanner} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <View style={styles.userBannerContent}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.userBannerIcon} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <Icon name="business" size={24} color={COLORS.white} />
          </LinearGradient>
          <View style={styles.userBannerText}>
            <Text style={styles.userBannerName}>{userName || 'Applicant'}</Text>
            <Text style={styles.userBannerInfo}>
              <Icon name="credit-card" size={12} color={COLORS.textLight} /> CNIC: {cnic}
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  };

  if (initialLoading) {
    return (
      <LinearGradient colors={['#F9FAFC', '#FFFFFF']} style={styles.loadingContainer} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading your information...</Text>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <LinearGradient colors={COLORS.primaryGradient} style={styles.header} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <View style={styles.headerContent}>
              <Icon name="business-center" size={32} color={COLORS.white} />
              <Text style={styles.headerTitle}>Business Information</Text>
              <Text style={styles.headerSubtitle}>Tell us about your venture</Text>
            </View>
          </LinearGradient>

          <ProgressSteps />
          <UserInfoBanner />

          <View style={styles.content}>
            {/* Social Media Section */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="share" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>SOCIAL MEDIA PRESENCE</Text>
            </LinearGradient>
            
            <View style={styles.infoBox}>
              <Icon name="info" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>Please provide links to your business pages if available.</Text>
            </View>
            
            {['LinkedIn', 'Instagram', 'Facebook', 'Youtube', 'Tiktok', 'Website'].map(platform => (
              <View key={platform} style={styles.socialRow}>
                <View style={styles.socialCheckbox}>
                  <Checkbox 
                    status={formData.social[platform].exists ? 'checked' : 'unchecked'} 
                    onPress={() => handleSocialChange(platform, 'exists', !formData.social[platform].exists)} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.socialLabel}>{platform}</Text>
                </View>
                <TextInput 
                  style={[styles.socialInput, errors[`social_${platform}`] && styles.inputError]} 
                  value={formData.social[platform].value} 
                  onChangeText={(text) => handleSocialChange(platform, 'value', text)} 
                  placeholder={platform === 'Website' ? 'https://www.example.com' : 'Profile Link / Followers'} 
                  placeholderTextColor={COLORS.textLighter} 
                  editable={formData.social[platform].exists} 
                />
              </View>
            ))}
            
            <View style={styles.socialRow}>
              <View style={styles.socialCheckbox}>
                <Checkbox 
                  status={formData.social.Other.exists ? 'checked' : 'unchecked'} 
                  onPress={() => handleSocialChange('Other', 'exists', !formData.social.Other.exists)} 
                  color={COLORS.primary} 
                />
                <Text style={styles.socialLabel}>Any other</Text>
              </View>
              <View style={styles.otherSocialInputs}>
                <TextInput 
                  style={[styles.socialInputSmall]} 
                  value={formData.social.Other.name} 
                  onChangeText={(text) => handleSocialChange('Other', 'name', text)} 
                  placeholder="Platform Name" 
                  placeholderTextColor={COLORS.textLighter} 
                  editable={formData.social.Other.exists} 
                />
                <TextInput 
                  style={[styles.socialInputSmall]} 
                  value={formData.social.Other.value} 
                  onChangeText={(text) => handleSocialChange('Other', 'value', text)} 
                  placeholder="Link / Followers" 
                  placeholderTextColor={COLORS.textLighter} 
                  editable={formData.social.Other.exists} 
                />
              </View>
            </View>

            {/* Business Details */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="business" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>BUSINESS DETAILS</Text>
            </LinearGradient>

            {renderSelect('Do you have any Startup?', 'startup_status', ['Registered', 'Unregistered', 'No'], 'Select Status')}

            {showRegDetails && (
              <View style={styles.detailsBox}>
                <View style={styles.row}>
                  <View style={[styles.col, styles.col6]}>
                    {renderSelect('Year of Establishment', 'est_year', years, 'Select Year')}
                  </View>
                  <View style={[styles.col, styles.col6]}>
                    {renderSelect('Registration Forum', 'reg_forum', regForumOptions, 'Select Forum')}
                    {showOtherRegForum && renderInput('Specify Forum', 'other_reg_forum', 'Enter forum name', { required: true })}
                  </View>
                </View>
              </View>
            )}

            {showUnregDetails && (
              <View style={styles.detailsBox}>
                <View style={styles.row}>
                  <View style={[styles.col, styles.col6]}>
                    {renderInput('Proposed Name', 'proposed_name', 'Enter idea name', { required: true })}
                  </View>
                  <View style={[styles.col, styles.col6]}>
                    {renderSelect('Years Active', 'years_active', yearsActiveOptions, 'Select Duration')}
                  </View>
                </View>
              </View>
            )}

            <View style={styles.row}>
              <View style={[styles.col, styles.col6]}>
                {renderSelect('Current Startup Stage', 'startup_stage', startupStageOptions, 'Select Stage')}
                {showOtherStage && renderInput('Specify Stage', 'other_startup_stage', 'Enter stage name', { required: true })}
              </View>
              <View style={[styles.col, styles.col6]}>
                {renderSelect('Industry Sector', 'industry_sector', industrySectorOptions, 'Select Category')}
                {showOtherIndustry && renderInput('Specify Industry', 'other_industry_sector', 'Enter industry name', { required: true })}
              </View>
            </View>

            {renderInput('Brief Description of Product/Service', 'description', 
              'Explain what you do, who it helps, and why it\'s unique. (Max 200 Words)', 
              { required: true, multiline: true, numberOfLines: 4, onChange: handleDescriptionChange, counter: true, maxWords: 200 })}

            {/* Market Research */}
            <View style={styles.toggleBox}>
              <Text style={styles.label}>Have you conducted market research? <Text style={styles.required}>*</Text></Text>
              <RadioButton.Group onValueChange={(value) => handleInputChange('market_research', value)} value={formData.market_research}>
                <View style={styles.radioGroup}>
                  <View style={styles.radioOption}><RadioButton value="1" color={COLORS.primary} /><Text style={styles.radioLabel}>Yes</Text></View>
                  <View style={styles.radioOption}><RadioButton value="0" color={COLORS.primary} /><Text style={styles.radioLabel}>No</Text></View>
                </View>
              </RadioButton.Group>
              {errors.market_research && <Text style={styles.errorText}>{errors.market_research}</Text>}
              {showFindings && renderInput('Key Findings (Max 100 Words)', 'key_findings', 'What did you learn from your research?', 
                { required: true, multiline: true, numberOfLines: 2, onChange: handleFindingsChange, counter: true, maxWords: 100 })}
            </View>

            {/* Target Customer */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="people" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>TARGET CUSTOMER</Text>
            </LinearGradient>
            {errors.target && <Text style={styles.errorText}>{errors.target}</Text>}
            {Object.keys(formData.target).map(ageGroup => (
              <View key={ageGroup} style={styles.targetRow}>
                <View style={styles.targetCheckbox}>
                  <Checkbox 
                    status={formData.target[ageGroup].check ? 'checked' : 'unchecked'} 
                    onPress={() => handleTargetChange(ageGroup, 'check', !formData.target[ageGroup].check)} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.targetLabel}>{ageGroup}</Text>
                </View>
                <TextInput 
                  style={styles.targetInput} 
                  value={formData.target[ageGroup].desc} 
                  onChangeText={(text) => handleTargetChange(ageGroup, 'desc', text)} 
                  placeholder="e.g. Students, Professionals..." 
                  placeholderTextColor={COLORS.textLighter} 
                  editable={formData.target[ageGroup].check} 
                />
              </View>
            ))}

            {/* Geographic Outreach */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="public" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>GEOGRAPHIC OUTREACH</Text>
            </LinearGradient>
            {errors.geo && <Text style={styles.errorText}>{errors.geo}</Text>}
            {Object.keys(formData.geo).map(level => (
              <View key={level} style={styles.geoRow}>
                <View style={styles.geoCheckbox}>
                  <Checkbox 
                    status={formData.geo[level].check ? 'checked' : 'unchecked'} 
                    onPress={() => handleGeoChange(level, 'check', !formData.geo[level].check)} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.geoLabel}>{level}</Text>
                </View>
                <TextInput 
                  style={styles.geoInput} 
                  value={formData.geo[level].remarks} 
                  onChangeText={(text) => handleGeoChange(level, 'remarks', text)} 
                  placeholder="Specific area..." 
                  placeholderTextColor={COLORS.textLighter} 
                  editable={formData.geo[level].check} 
                />
              </View>
            ))}

            {/* Team Details */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="group" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>TEAM DETAILS</Text>
            </LinearGradient>

            <View style={styles.toggleBox}>
              <View style={styles.row}>
                <View style={[styles.col, styles.col4]}>
                  {renderSelect('Are you a sole founder?', 'is_sole_founder', [
                    { label: 'Yes, I am alone', value: '1' },
                    { label: 'No, I have partners', value: '0' },
                  ], 'Select')}
                </View>
                <View style={[styles.col, styles.col4]}>
                  {renderInput('Team Size (Including You)', 'team_size', 'e.g. 1, 5, 10', { required: true, keyboardType: 'numeric' })}
                </View>
                <View style={[styles.col, styles.col4]}>
                  {renderSelect('Average Monthly Income', 'avg_income', incomeRanges, 'Select Range')}
                </View>
              </View>
              {showCofounder && (
                <View style={styles.cofounderBox}>
                  <Text style={styles.subLabel}>Co-Founder Details <Text style={styles.required}>*</Text></Text>
                  {renderInput('Full Name', 'cofounder_name', 'Enter co-founder name', { required: true })}
                  {renderInput('Contact Number', 'cofounder_contact', '03XXXXXXXXX', { required: true, keyboardType: 'phone-pad', maxLength: 11 })}
                </View>
              )}
            </View>

            {/* Software Tools */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Do you use any software/tools? <Text style={styles.optionalText}>(Optional)</Text></Text>
              <RadioButton.Group onValueChange={(value) => handleInputChange('use_software', value)} value={formData.use_software}>
                <View style={styles.radioGroup}>
                  <View style={styles.radioOption}><RadioButton value="Yes" color={COLORS.primary} /><Text style={styles.radioLabel}>Yes</Text></View>
                  <View style={styles.radioOption}><RadioButton value="No" color={COLORS.primary} /><Text style={styles.radioLabel}>No</Text></View>
                </View>
              </RadioButton.Group>
              {showSoftwareInput && renderInput('Specify software name', 'software_name_text', 'e.g. Canva, Excel, Photoshop...')}
            </View>

            {/* Microfinance Loan */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="attach-money" size={20} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>MICROFINANCE FACILITY</Text>
            </LinearGradient>

            <View style={styles.toggleBox}>
              <View style={styles.loanHeader}>
                <Text style={styles.label}>Have you availed any microfinance facility? <Text style={styles.required}>*</Text></Text>
                <RadioButton.Group onValueChange={(value) => handleInputChange('has_loan', value)} value={formData.has_loan}>
                  <View style={styles.radioGroup}>
                    <View style={styles.radioOption}><RadioButton value="1" color={COLORS.primary} /><Text style={styles.radioLabel}>Yes</Text></View>
                    <View style={styles.radioOption}><RadioButton value="0" color={COLORS.primary} /><Text style={styles.radioLabel}>No</Text></View>
                  </View>
                </RadioButton.Group>
              </View>
              {errors.has_loan && <Text style={styles.errorText}>{errors.has_loan}</Text>}
              {showLoanDetails && (
                <View style={styles.loanDetails}>
                  <View style={styles.row}>
                    <View style={[styles.col, styles.col4]}>{renderSelect('Loan Amount', 'loan_amount', loanAmountOptions, 'Select Amount')}</View>
                    <View style={[styles.col, styles.col4]}>{renderInput('Loan Provider', 'loan_provider', 'Bank or Organization Name', { required: true })}</View>
                    <View style={[styles.col, styles.col4]}>{renderSelect('Loan Duration', 'loan_duration', loanDurationOptions, 'Select Duration')}</View>
                  </View>
                </View>
              )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
             
              <TouchableOpacity style={[styles.button, styles.nextButton, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
                <LinearGradient colors={loading ? ['#9E9E9E', '#757575'] : COLORS.primaryGradient} style={styles.buttonGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                  {loading ? <ActivityIndicator color="#fff" /> : <><Text style={styles.nextButtonText}>Submit</Text><Icon name="arrow-forward" size={20} color={COLORS.white} /></>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textLight, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  header: { paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 30, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  headerContent: { alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.white, textAlign: 'center', marginTop: 8, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  headerSubtitle: { fontSize: 12, color: COLORS.white, opacity: 0.9, textAlign: 'center', marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 20, backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: -15, borderRadius: 20, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  stepWrapper: { alignItems: 'center' },
  stepCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  stepActive: { shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  stepCompleted: { shadowColor: COLORS.success, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  stepInactive: { backgroundColor: COLORS.stepInactive },
  stepCircleText: { fontSize: 16, fontWeight: 'bold', color: COLORS.white },
  stepLabel: { fontSize: 11, color: COLORS.textLighter, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  stepLabelActive: { color: COLORS.primary, fontWeight: '600' },
  stepLabelCompleted: { color: COLORS.success, fontWeight: '600' },
  stepLine: { width: 50, height: 2, marginHorizontal: 8 },
  userBanner: { marginHorizontal: 16, marginTop: 12, marginBottom: 8, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: COLORS.border, shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  userBannerContent: { flexDirection: 'row', alignItems: 'center' },
  userBannerIcon: { width: 34, height: 34, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  userBannerText: { marginLeft: 12, flex: 1 },
  userBannerName: { fontSize: 10, fontWeight: '600', color: COLORS.text, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  userBannerInfo: { fontSize: 8, color: COLORS.textLight, marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  content: { padding: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 20, marginBottom: 16, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: COLORS.primary, marginLeft: 8, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  inputContainer: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '500', color: COLORS.text, marginBottom: 6, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  optionalText: { fontSize: 8, fontWeight: 'normal', color: COLORS.textLight },
  required: { color: COLORS.error },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 12, backgroundColor: COLORS.white, color: COLORS.text, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  inputError: { borderColor: COLORS.error, borderWidth: 2 },
  errorText: { color: COLORS.error, fontSize: 11, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  charCount: { fontSize: 11, color: COLORS.textLight, marginTop: 4, textAlign: 'right' },
  selectButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: COLORS.white },
  selectText: { fontSize: 14, color: COLORS.text, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  selectPlaceholder: { fontSize: 10, color: COLORS.textLighter, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  radioGroup: { flexDirection: 'row', alignItems: 'center', marginTop: 5, flexWrap: 'wrap' },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  radioLabel: { fontSize: 14, color: COLORS.text, marginLeft: 4, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  row: { flexDirection: 'row', marginHorizontal: -4 },
  col: { paddingHorizontal: 4 },
  col4: { flex: 0.33 },
  col6: { flex: 0.5 },
  infoBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primarySoft, padding: 10, borderRadius: 12, marginBottom: 15 },
  infoText: { fontSize: 12, color: COLORS.textLight, marginLeft: 8, flex: 1, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  socialRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  socialCheckbox: { flexDirection: 'row', alignItems: 'center', width: 110 },
  socialLabel: { fontSize: 13, color: COLORS.text, marginLeft: 4, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  socialInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, backgroundColor: COLORS.white, color: COLORS.text },
  socialInputSmall: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, backgroundColor: COLORS.white, color: COLORS.text, marginLeft: 5 },
  otherSocialInputs: { flex: 1, flexDirection: 'row' },
  detailsBox: { backgroundColor: COLORS.successLight, padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: COLORS.success },
  toggleBox: { backgroundColor: COLORS.warningLight, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: COLORS.warning },
  targetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  targetCheckbox: { flexDirection: 'row', alignItems: 'center', width: 140 },
  targetLabel: { fontSize: 12, color: COLORS.text, marginLeft: 4, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  targetInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, backgroundColor: COLORS.white, color: COLORS.text },
  geoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  geoCheckbox: { flexDirection: 'row', alignItems: 'center', width: 130 },
  geoLabel: { fontSize: 12, color: COLORS.text, marginLeft: 4, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  geoInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, backgroundColor: COLORS.white, color: COLORS.text },
  cofounderBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  subLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 8, marginTop: 8, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  loanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 },
  loanDetails: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 40, gap: 12 },
  button: { flex: 1, borderRadius: 12, overflow: 'hidden', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  backButton: { shadowColor: '#6c757d' },
  nextButton: { shadowColor: COLORS.primary },
  disabledButton: { opacity: 0.6 },
  backButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  nextButtonText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: height * 0.7 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  modalOptions: { maxHeight: height * 0.6 },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalOptionSelected: { backgroundColor: COLORS.primarySoft },
  modalOptionText: { fontSize: 16, color: COLORS.text, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  modalOptionTextSelected: { color: COLORS.primary, fontWeight: '600' },
});

export default Step2Form;