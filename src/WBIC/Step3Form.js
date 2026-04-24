// Step3Form.js - Complete Working Version with Beautiful UI
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

// Beautiful Color Scheme (matching Step2)
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

const Step3Form = ({ navigation, route }) => {
  // State
  const [cnic, setCnic] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [wordCount, setWordCount] = useState(0);
  const [showPicker, setShowPicker] = useState({});

  // Form State
  const [formData, setFormData] = useState({
    training_level: '',
    level1_training: '',
    level2_training: '',
    level3_training: '',
    selected_center: '',
    skill_idea_development: '',
    skill_idea_remarks: '',
    skill_marketing: '',
    skill_marketing_remarks: '',
    skill_financial_management: '',
    skill_finance_remarks: '',
    skill_negotiation: '',
    skill_negotiation_remarks: '',
    skill_digital_skills: '',
    skill_digital_remarks: '',
    main_needs: [],
    sub_challenges: {
      'business-management': [],
      'financial-literacy': [],
      'marketing-sales': [],
      'digital-technology': [],
      'product-development': [],
      'leadership-team-building': [],
      'legal-compliance': [],
      'customer-relations': [],
      'time-productivity': [],
    },
    other_need_text: '',
    days_available: '',
    weeks_available: '',
    training_mode: '',
    time_slot: '',
    commute: '',
    source: [],
    motivation: '',
    daycare: '',
  });

  // Dynamic UI States
  const [showTrainingContainer, setShowTrainingContainer] = useState(false);
  const [showOtherNeed, setShowOtherNeed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [centers, setCenters] = useState([]);

  // Training options
  const trainingOptions = {
    1: [
      { value: 'Professional grooming', label: 'Professional grooming' },
      { value: 'Digital Marketing', label: 'Digital Marketing' },
    ],
    2: [
      { value: 'Basic Startup Entrepreneurial Training', label: 'Basic Startup Entrepreneurial Training' },
    ],
    3: [
      { value: 'Advance Entrepreneurial Training', label: 'Advance Entrepreneurial Training' },
    ],
  };

  // Learning needs categories
  const learningNeedsStructure = {
    'business-management': {
      label: '1. Business Management & Strategy',
      subOptions: [
        'Business Planning',
        'Strategic Decision Making',
        'Operations Management',
        'Business Model Innovation',
      ],
    },
    'financial-literacy': {
      label: '2. Financial Literacy & Management',
      subOptions: [
        'Bookkeeping & Accounting',
        'Financial Planning',
        'Investment Management',
        'Taxation Basics',
      ],
    },
    'marketing-sales': {
      label: '3. Marketing & Sales',
      subOptions: [
        'Digital Marketing',
        'Social Media Marketing',
        'Sales Techniques',
        'Brand Development',
        'Customer Acquisition',
      ],
    },
    'digital-technology': {
      label: '4. Digital & Technology Skills',
      subOptions: [
        'E-commerce Platforms',
        'Website Development',
        'Mobile Apps',
        'Automation Tools',
        'Data Analytics',
      ],
    },
    'product-development': {
      label: '5. Product Development & Innovation',
      subOptions: [
        'Product Design',
        'Prototyping',
        'Quality Control',
        'Innovation Management',
      ],
    },
    'leadership-team-building': {
      label: '6. Leadership & Team Building',
      subOptions: [
        'Team Management',
        'Conflict Resolution',
        'Motivation Techniques',
        'Delegation Skills',
      ],
    },
    'legal-compliance': {
      label: '7. Legal & Compliance',
      subOptions: [
        'Business Registration',
        'Intellectual Property',
        'Contract Law',
        'Regulatory Compliance',
      ],
    },
    'customer-relations': {
      label: '8. Customer Relations & Service',
      subOptions: [
        'Customer Service Excellence',
        'CRM Tools',
        'Feedback Management',
        'Customer Retention',
      ],
    },
    'time-productivity': {
      label: '9. Time Management & Productivity',
      subOptions: [
        'Time Management',
        'Goal Setting',
        'Work-Life Balance',
        'Productivity Tools',
      ],
    },
  };

  // Source options
  const sourceOptions = [
    'Social Media Platforms',
    'WBIC Website',
    'Government Departments',
    'Educational Institutions',
    'Personal Network',
    'Events',
    'Media',
    'WBIC Team',
    'Referral',
    'Other',
  ];

  // Days options
  const daysOptions = [
    '5 days a week',
    '4 days a week',
    '3 days a week',
    '2 days a week',
    '1 day a week',
  ];

  // Weeks options
  const weeksOptions = ['1 week', '2 weeks', '3 weeks', '4 weeks'];

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
    console.log('========== [Step3Form] Component Mounted ==========');
    getCnicFromStorage();
    fetchCenters();
  }, []);

  useEffect(() => {
    setShowTrainingContainer(formData.training_level !== '');
  }, [formData.training_level]);

  useEffect(() => {
    setShowOtherNeed(formData.main_needs.includes('Other'));
  }, [formData.main_needs]);

  useEffect(() => {
    if (formData.motivation) {
      const words = formData.motivation.trim() === '' ? 0 : formData.motivation.trim().split(/\s+/).length;
      setWordCount(words);
    } else {
      setWordCount(0);
    }
  }, [formData.motivation]);

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

  const fetchCenters = async () => {
    try {
      const response = await api.get('/centers');
      if (response.data.success && response.data.data) {
        setCenters(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

  const handleInputChange = (field, value) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMainNeedToggle = (need) => {
    let newMainNeeds;
    if (formData.main_needs.includes(need)) {
      newMainNeeds = formData.main_needs.filter(n => n !== need);
      if (need !== 'Other') {
        const categoryKey = Object.keys(learningNeedsStructure).find(
          key => learningNeedsStructure[key].label === need
        );
        if (categoryKey) {
          setFormData(prev => ({
            ...prev,
            sub_challenges: {
              ...prev.sub_challenges,
              [categoryKey]: [],
            },
          }));
        }
      }
    } else {
      newMainNeeds = [...formData.main_needs, need];
    }
    
    handleInputChange('main_needs', newMainNeeds);
    
    if (need !== 'Other') {
      const categoryKey = Object.keys(learningNeedsStructure).find(
        key => learningNeedsStructure[key].label === need
      );
      if (categoryKey) {
        setExpandedCategories(prev => ({
          ...prev,
          [categoryKey]: !prev[categoryKey],
        }));
      }
    }
  };

  const handleSubChallengeToggle = (category, subOption) => {
    const currentSubs = formData.sub_challenges[category] || [];
    let newSubs;
    
    if (currentSubs.includes(subOption)) {
      newSubs = currentSubs.filter(s => s !== subOption);
    } else {
      newSubs = [...currentSubs, subOption];
    }
    
    setFormData(prev => ({
      ...prev,
      sub_challenges: {
        ...prev.sub_challenges,
        [category]: newSubs,
      },
    }));
  };

  const handleSourceToggle = (source) => {
    let newSources;
    if (formData.source.includes(source)) {
      newSources = formData.source.filter(s => s !== source);
    } else {
      newSources = [...formData.source, source];
    }
    handleInputChange('source', newSources);
  };

  const validateForm = () => {
    console.log('[Validation] Starting validation...');
    const newErrors = {};
    
    if (!formData.training_level) {
      newErrors.training_level = 'Please select training level';
    } else {
      const trainingField = `level${formData.training_level}_training`;
      if (!formData[trainingField]) {
        newErrors[trainingField] = 'Please select training';
      }
    }
    
    if (!formData.selected_center) {
      newErrors.selected_center = 'Please select preferred center';
    }
    
    if (!formData.skill_idea_development) newErrors.skill_idea_development = 'Please rate Idea Development';
    if (!formData.skill_marketing) newErrors.skill_marketing = 'Please rate Marketing';
    if (!formData.skill_financial_management) newErrors.skill_financial_management = 'Please rate Financial Management';
    if (!formData.skill_negotiation) newErrors.skill_negotiation = 'Please rate Negotiation';
    if (!formData.skill_digital_skills) newErrors.skill_digital_skills = 'Please rate Digital Skills';
    
    if (formData.main_needs.length === 0) {
      newErrors.main_needs = 'Please select at least one learning need';
    }
    
    if (formData.main_needs.includes('Other') && !formData.other_need_text) {
      newErrors.other_need_text = 'Please specify your challenge';
    }
    
    if (!formData.days_available) newErrors.days_available = 'Please select days availability';
    if (!formData.weeks_available) newErrors.weeks_available = 'Please select weeks availability';
    if (!formData.training_mode) newErrors.training_mode = 'Please select training mode';
    if (!formData.time_slot) newErrors.time_slot = 'Please select time slot';
    if (!formData.commute) newErrors.commute = 'Please select commute arrangement';
    
    if (formData.source.length === 0) newErrors.source = 'Please select how you came to know about WBIC';
    if (!formData.motivation) {
      newErrors.motivation = 'Motivation statement is required';
    } else if (wordCount > 100) {
      newErrors.motivation = 'Motivation statement must be 100 words or less';
    }
    if (!formData.daycare) newErrors.daycare = 'Please select if you require daycare facility';
    
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
    // Prepare submission data - send EXACTLY what backend expects
    const submitData = {
      cnic: cnic,
      training_level: formData.training_level,
      selected_center: formData.selected_center,
      skill_idea_development: parseInt(formData.skill_idea_development),
      skill_idea_remarks: formData.skill_idea_remarks || null,
      skill_marketing: parseInt(formData.skill_marketing),
      skill_marketing_remarks: formData.skill_marketing_remarks || null,
      skill_financial_management: parseInt(formData.skill_financial_management),
      skill_finance_remarks: formData.skill_finance_remarks || null,
      skill_negotiation: parseInt(formData.skill_negotiation),
      skill_negotiation_remarks: formData.skill_negotiation_remarks || null,
      skill_digital_skills: parseInt(formData.skill_digital_skills),
      skill_digital_remarks: formData.skill_digital_remarks || null,
      days_available: formData.days_available,
      weeks_available: formData.weeks_available,
      training_mode: formData.training_mode,
      time_slot: formData.time_slot,
      commute: formData.commute,
      source: formData.source, // Send as array
      motivation: formData.motivation,
      daycare: formData.daycare,
    };
    
    // Add training level specific field
    if (formData.training_level === '1') {
      submitData.level1_training = formData.level1_training;
    } else if (formData.training_level === '2') {
      submitData.level2_training = formData.level2_training;
    } else if (formData.training_level === '3') {
      submitData.level3_training = formData.level3_training;
    }
    
    // Build main_needs array (just the labels, not the structure)
    submitData.main_needs = [...formData.main_needs];
    
    // Build sub_challenges as an object with arrays
    submitData.sub_challenges = {};
    Object.keys(formData.sub_challenges).forEach(category => {
      if (formData.sub_challenges[category] && formData.sub_challenges[category].length > 0) {
        // Map category key to the label that backend expects
        const categoryMapping = {
          'business-management': '1. Business Management & Strategy',
          'financial-literacy': '2. Financial Literacy & Management',
          'marketing-sales': '3. Marketing & Sales',
          'digital-technology': '4. Digital & Technology Skills',
          'product-development': '5. Product Development & Innovation',
          'leadership-team-building': '6. Leadership & Team Building',
          'legal-compliance': '7. Legal & Compliance',
          'customer-relations': '8. Customer Relations & Service',
          'time-productivity': '9. Time Management & Productivity',
        };
        const categoryLabel = categoryMapping[category];
        if (categoryLabel) {
          submitData.sub_challenges[categoryLabel] = formData.sub_challenges[category];
        }
      }
    });
    
    // Add other need text if present
    if (formData.main_needs.includes('Other') && formData.other_need_text) {
      submitData.other_need_text = formData.other_need_text;
    }
    
    // Clean up any null/undefined values
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === undefined || submitData[key] === null) {
        delete submitData[key];
      }
    });
    
    console.log('[Submit] Submitting data with CNIC:', cnic);
    console.log('[Submit] Data:', JSON.stringify(submitData, null, 2));
    
    const response = await api.post('/register/step3', submitData);
    
    if (response.data.success) {
      console.log('[Submit] ✅ Success! Application completed!');
      Alert.alert(
        'Congratulations! 🎉',
        'Your application has been submitted successfully! Thank you for applying to WBIC.',
        [{ text: 'View Profile', onPress: () => navigation.navigate('WBICProfile') }]
          [{ text: 'Cancel', onPress: () => navigation.navigate('DashboardWDD') }]
      );
    } else {
      Alert.alert('Error', response.data.message || 'Failed to submit application');
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
      Alert.alert('Error', 'Failed to submit application. Please try again.');
    }
  } finally {
    setLoading(false);
  }
};

  // Render Functions
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
        <Text style={styles.label}>
          {label}
          <Text style={styles.required}> *</Text>
        </Text>
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

  const renderTrainingSelect = () => {
    const trainingField = `level${formData.training_level}_training`;
    const selectedValue = formData[trainingField];
    const options = trainingOptions[formData.training_level] || [];
    
    const normalizedOptions = options.map(opt => 
      typeof opt === 'object' ? opt : { label: opt, value: opt }
    );
    
    const getDisplayText = () => {
      if (!selectedValue) return 'Select Training';
      const option = normalizedOptions.find(opt => opt.value === selectedValue);
      return option ? option.label : selectedValue;
    };
    
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          Select Training
          <Text style={styles.required}> *</Text>
        </Text>
        <TouchableOpacity
          style={[styles.selectButton, errors[trainingField] && styles.inputError]}
          onPress={() => setShowPicker(prev => ({ ...prev, training_select: true }))}
        >
          <Text style={selectedValue ? styles.selectText : styles.selectPlaceholder}>
            {getDisplayText()}
          </Text>
          <Icon name="arrow-drop-down" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        {errors[trainingField] && <Text style={styles.errorText}>{errors[trainingField]}</Text>}
        
        <CustomPicker
          visible={showPicker.training_select || false}
          options={normalizedOptions}
          selectedValue={selectedValue}
          onSelect={(value) => handleInputChange(trainingField, value)}
          onClose={() => setShowPicker(prev => ({ ...prev, training_select: false }))}
          title="Select Training"
        />
      </View>
    );
  };

  const renderRadioGroup = (label, field, options) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label}
        <Text style={styles.required}> *</Text>
      </Text>
      <RadioButton.Group
        onValueChange={(value) => handleInputChange(field, value)}
        value={formData[field]}
      >
        <View style={styles.radioGroup}>
          {options.map(option => (
            <View key={option.value} style={styles.radioOption}>
              <RadioButton value={option.value} color={COLORS.primary} />
              <Text style={styles.radioLabel}>{option.label}</Text>
            </View>
          ))}
        </View>
      </RadioButton.Group>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderSkillRating = (field, label) => {
    const remarksField = field === 'skill_idea_development' ? 'skill_idea_remarks' :
                        field === 'skill_marketing' ? 'skill_marketing_remarks' :
                        field === 'skill_financial_management' ? 'skill_finance_remarks' :
                        field === 'skill_negotiation' ? 'skill_negotiation_remarks' :
                        'skill_digital_remarks';
    
    return (
      <View style={styles.skillRow}>
        <Text style={styles.skillLabel}>{label}</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map(rate => (
            <TouchableOpacity
              key={rate}
              style={[
                styles.ratingCircle,
                formData[field] === rate.toString() && styles.ratingCircleSelected,
              ]}
              onPress={() => handleInputChange(field, rate.toString())}
            >
              <Text style={[
                styles.ratingText,
                formData[field] === rate.toString() && styles.ratingTextSelected,
              ]}>
                {rate}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.remarksInput}
          value={formData[remarksField]}
          onChangeText={(text) => handleInputChange(remarksField, text)}
          placeholder="Remarks (Optional)"
          placeholderTextColor={COLORS.textLighter}
        />
        {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
      </View>
    );
  };

  const renderLearningCategory = (category, data) => {
    const isExpanded = expandedCategories[category];
    const isChecked = formData.main_needs.includes(data.label);
    
    return (
      <View key={category} style={styles.categoryCard}>
        <TouchableOpacity
          style={styles.categoryHeader}
          onPress={() => handleMainNeedToggle(data.label)}
        >
          <Checkbox
            status={isChecked ? 'checked' : 'unchecked'}
            onPress={() => handleMainNeedToggle(data.label)}
            color={COLORS.primary}
          />
          <Text style={styles.categoryLabel}>{data.label}</Text>
          {isChecked && (
            <TouchableOpacity onPress={() => setExpandedCategories(prev => ({ ...prev, [category]: !prev[category] }))}>
              <Icon name={isExpanded ? 'expand-less' : 'expand-more'} size={24} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        
        {isExpanded && isChecked && (
          <View style={styles.subOptionsContainer}>
            {data.subOptions.map(subOption => (
              <View key={subOption} style={styles.subOptionRow}>
                <Checkbox
                  status={formData.sub_challenges[category]?.includes(subOption) ? 'checked' : 'unchecked'}
                  onPress={() => handleSubChallengeToggle(category, subOption)}
                  color={COLORS.primary}
                />
                <Text style={styles.subOptionLabel}>{subOption}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

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
        <LinearGradient colors={COLORS.primaryGradient} style={[styles.stepCircle, styles.stepCompleted]} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          <Icon name="check" size={20} color={COLORS.white} />
        </LinearGradient>
        <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Business</Text>
      </View>
      <View style={[styles.stepLine, { backgroundColor: COLORS.primary }]} />
      <View style={styles.stepWrapper}>
        <LinearGradient colors={COLORS.primaryGradient} style={[styles.stepCircle, styles.stepActive]} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
          <Text style={styles.stepCircleText}>3</Text>
        </LinearGradient>
        <Text style={[styles.stepLabel, styles.stepLabelActive]}>Learning</Text>
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
            <Icon name="school" size={24} color={COLORS.white} />
          </LinearGradient>
          <View style={styles.userBannerText}>
            <Text style={styles.userBannerName}>{userName || 'Applicant'}</Text>
            <Text style={styles.userBannerInfo}>
              <Icon name="credit-card" size={10} color={COLORS.textLight} /> CNIC: {cnic}
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
              <Icon name="school" size={32} color={COLORS.white} />
              <Text style={styles.headerTitle}>Learning & Training Needs</Text>
              <Text style={styles.headerSubtitle}>Help us understand your requirements</Text>
            </View>
          </LinearGradient>

          <ProgressSteps />
          <UserInfoBanner />

          <View style={styles.content}>
            {/* Type of Trainings */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="workspace-premium" size={16} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>TYPE OF TRAININGS</Text>
            </LinearGradient>

            <View style={styles.trainingBox}>
              {renderSelect('Select Training Level', 'training_level', [
                { value: '1', label: 'Level 1' },
                { value: '2', label: 'Level 2' },
                { value: '3', label: 'Level 3' },
              ], 'Select Level')}
              
              {showTrainingContainer && renderTrainingSelect()}
            </View>

            {/* Center Selection */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="location-on" size={16} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>SELECT CENTER</Text>
            </LinearGradient>

            {renderSelect('Preferred Center', 'selected_center',
              centers.map(c => ({ value: c.id.toString(), label: c.name })), 'Select Preferred Center')}

            {/* Entrepreneurial Skills */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="trending-up" size={16} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>ENTREPRENEURIAL SKILLS (Rate 1-5)</Text>
            </LinearGradient>

            <View style={styles.skillsTable}>
              <View style={styles.skillsHeader}>
                <Text style={[styles.skillsHeaderText, styles.skillCol1]}>Skill Level</Text>
                <Text style={[styles.skillsHeaderText, styles.skillCol2]}>Rating (1=Low, 5=High)</Text>
                <Text style={[styles.skillsHeaderText, styles.skillCol3]}>Remarks (Optional)</Text>
              </View>
              
              {renderSkillRating('skill_idea_development', 'Idea Development')}
              {renderSkillRating('skill_marketing', 'Marketing')}
              {renderSkillRating('skill_financial_management', 'Financial Management')}
              {renderSkillRating('skill_negotiation', 'Negotiation')}
              {renderSkillRating('skill_digital_skills', 'Digital Skills')}
            </View>

            {/* Learning Needs */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="psychology" size={16} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>LEARNING NEEDS & CHALLENGES</Text>
            </LinearGradient>

            <Text style={styles.helperText}>Select the main areas you want to improve (Select at least one):</Text>
            
            <View style={styles.learningNeedsContainer}>
              {Object.entries(learningNeedsStructure).map(([category, data]) => 
                renderLearningCategory(category, data)
              )}
              
              <View style={styles.categoryCard}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => handleMainNeedToggle('Other')}
                >
                  <Checkbox
                    status={formData.main_needs.includes('Other') ? 'checked' : 'unchecked'}
                    onPress={() => handleMainNeedToggle('Other')}
                    color={COLORS.primary}
                  />
                  <Text style={styles.categoryLabel}>10. Other (Please specify)</Text>
                </TouchableOpacity>
                
                {showOtherNeed && (
                  <View style={styles.otherNeedContainer}>
                    <TextInput
                      style={[styles.input, errors.other_need_text && styles.inputError]}
                      value={formData.other_need_text}
                      onChangeText={(text) => handleInputChange('other_need_text', text)}
                      placeholder="Type your specific challenge here..."
                      placeholderTextColor={COLORS.textLighter}
                      multiline
                    />
                    {errors.other_need_text && <Text style={styles.errorText}>{errors.other_need_text}</Text>}
                  </View>
                )}
              </View>
              
              {errors.main_needs && <Text style={styles.errorText}>{errors.main_needs}</Text>}
            </View>

            {/* Logistics */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="event-available" size={16} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>LOGISTICS & AVAILABILITY</Text>
            </LinearGradient>

            <View style={styles.logisticsBox}>
              <View style={styles.row}>
                <View style={[styles.col, styles.col6]}>
                  {renderSelect('Availability (Days)', 'days_available', daysOptions, 'Select Days')}
                </View>
                <View style={[styles.col, styles.col6]}>
                  {renderSelect('Duration (Weeks)', 'weeks_available', weeksOptions, 'Select Weeks')}
                </View>
              </View>
              
              {renderRadioGroup('Preferred Mode', 'training_mode', [
                { value: 'In person', label: 'In person' },
              ])}
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Preferred Time
                  <Text style={styles.required}> *</Text>
                </Text>
                <RadioButton.Group
                  onValueChange={(value) => handleInputChange('time_slot', value)}
                  value={formData.time_slot}
                >
                  <View style={styles.timeSlotGroup}>
                    <View style={styles.radioOption}>
                      <RadioButton value="Morning" color={COLORS.primary} />
                      <Text style={styles.radioLabel}>Morning: 9-1</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="Afternoon" color={COLORS.primary} />
                      <Text style={styles.radioLabel}>Afternoon: 1-5</Text>
                    </View>
                  </View>
                </RadioButton.Group>
                {errors.time_slot && <Text style={styles.errorText}>{errors.time_slot}</Text>}
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Commute Arrangement
                  <Text style={styles.required}> *</Text>
                </Text>
                <RadioButton.Group
                  onValueChange={(value) => handleInputChange('commute', value)}
                  value={formData.commute}
                >
                  <View style={styles.commuteGroup}>
                    <View style={styles.radioOption}>
                      <RadioButton value="Personal" color={COLORS.primary} />
                      <Text style={styles.radioLabel}>Have personal conveyance</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="Rented" color={COLORS.primary} />
                      <Text style={styles.radioLabel}>By rented conveyance</Text>
                    </View>
                    <View style={styles.radioOption}>
                      <RadioButton value="None" color={COLORS.primary} />
                      <Text style={styles.radioLabel}>Don't have any conveyance</Text>
                    </View>
                  </View>
                </RadioButton.Group>
                {errors.commute && <Text style={styles.errorText}>{errors.commute}</Text>}
              </View>
            </View>

            {/* Additional Information */}
            <LinearGradient colors={[COLORS.primarySoft, COLORS.white]} style={styles.sectionHeader} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              <Icon name="info" size={16} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>ADDITIONAL INFORMATION</Text>
            </LinearGradient>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                How did you come to know about WBIC?
                <Text style={styles.required}> *</Text>
              </Text>
              <View style={styles.sourceContainer}>
                {sourceOptions.map(source => (
                  <View key={source} style={styles.sourceOption}>
                    <Checkbox
                      status={formData.source.includes(source) ? 'checked' : 'unchecked'}
                      onPress={() => handleSourceToggle(source)}
                      color={COLORS.primary}
                    />
                    <Text style={styles.sourceLabel}>{source}</Text>
                  </View>
                ))}
              </View>
              {errors.source && <Text style={styles.errorText}>{errors.source}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Motivation Statement (Max 100 words)
                <Text style={styles.required}> *</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea, errors.motivation && styles.inputError]}
                value={formData.motivation}
                onChangeText={(text) => handleInputChange('motivation', text)}
                placeholder="Why do you want to join WBIC?"
                placeholderTextColor={COLORS.textLighter}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={[styles.charCount, wordCount > 100 && styles.errorText]}>
                {wordCount} / 100 words
              </Text>
              {errors.motivation && <Text style={styles.errorText}>{errors.motivation}</Text>}
            </View>

            {renderRadioGroup('Do you require day care facility?', 'daycare', [
              { value: 'Yes', label: 'Yes' },
              { value: 'No', label: 'No' },
            ])}

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
            
              
              <TouchableOpacity
                style={[styles.button, styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient colors={loading ? ['#9E9E9E', '#757575'] : COLORS.primaryGradient} style={styles.buttonGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Submit Application</Text>
                      <Icon name="check-circle" size={20} color={COLORS.white} />
                    </>
                  )}
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
  label: { fontSize: 10, fontWeight: '500', color: COLORS.text, marginBottom: 6, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  required: { color: COLORS.error },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 10, backgroundColor: COLORS.white, color: COLORS.text, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  inputError: { borderColor: COLORS.error, borderWidth: 2 },
  errorText: { color: COLORS.error, fontSize: 11, marginTop: 4, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  charCount: { fontSize: 11, color: COLORS.textLight, marginTop: 4, textAlign: 'right' },
  selectButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: COLORS.white },
  selectText: { fontSize: 10, color: COLORS.text, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  selectPlaceholder: { fontSize: 14, color: COLORS.textLighter, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  radioGroup: { flexDirection: 'row', alignItems: 'center', marginTop: 5, flexWrap: 'wrap' },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  radioLabel: { fontSize: 10, color: COLORS.text, marginLeft: 4, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  row: { flexDirection: 'row', marginHorizontal: -4 },
  col: { paddingHorizontal: 4 },
  col6: { flex: 0.5 },
  trainingBox: { backgroundColor: COLORS.successLight, padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: COLORS.success },
  skillsTable: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
  skillsHeader: { flexDirection: 'row', backgroundColor: COLORS.primarySoft, paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  skillsHeaderText: { fontSize: 12, fontWeight: 'bold', color: COLORS.text, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  skillCol1: { flex: 0.35 },
  skillCol2: { flex: 0.35, textAlign: 'center' },
  skillCol3: { flex: 0.3, textAlign: 'center' },
  skillRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border, flexWrap: 'wrap' },
  skillLabel: { flex: 0.35, fontSize: 10, fontWeight: '500', color: COLORS.text, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  ratingContainer: { flex: 0.35, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  ratingCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.primarySoft, justifyContent: 'center', alignItems: 'center', marginHorizontal: 1 },
  ratingCircleSelected: { backgroundColor: COLORS.primary },
  ratingText: { fontSize: 10, fontWeight: 'bold', color: COLORS.textLight },
  ratingTextSelected: { color: COLORS.white },
  remarksInput: { flex: 0.3, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 12, backgroundColor: COLORS.white, color: COLORS.text, marginLeft: 8 },
  helperText: { fontSize: 10, color: COLORS.textLight, marginBottom: 15, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  learningNeedsContainer: { marginBottom: 20 },
  categoryCard: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginBottom: 10, backgroundColor: COLORS.white, overflow: 'hidden' },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: COLORS.primarySoft },
  categoryLabel: { flex: 1, fontSize: 12, fontWeight: '500', color: COLORS.text, marginLeft: 8, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  subOptionsContainer: { padding: 12, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.border },
  subOptionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  subOptionLabel: { fontSize: 10, color: COLORS.textLight, marginLeft: 8, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  otherNeedContainer: { padding: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  logisticsBox: { backgroundColor: COLORS.warningLight, padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: COLORS.warning },
  timeSlotGroup: { flexDirection: 'row', alignItems: 'center', marginTop: 5, flexWrap: 'wrap' },
  commuteGroup: { marginTop: 5 },
  sourceContainer: { backgroundColor: COLORS.primarySoft, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', flexWrap: 'wrap' },
  sourceOption: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 8 },
  sourceLabel: { fontSize: 10, color: COLORS.text, marginLeft: 4, fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30, marginBottom: 40, gap: 12 },
  button: { flex: 1, borderRadius: 12, overflow: 'hidden', shadowColor: COLORS.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  buttonGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  backButton: { shadowColor: '#6c757d' },
  submitButton: { shadowColor: COLORS.primary },
  disabledButton: { opacity: 0.6 },
  backButtonText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
  submitButtonText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto' },
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

export default Step3Form;