import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faUser, 
  faUsers, 
  faBed, 
  faPaperclip, 
  faFileSignature 
} from '@fortawesome/free-solid-svg-icons';
import syncStorage from 'react-native-sync-storage';

const ProgressBar = ({ step }) => {
  const [progressData, setProgressData] = useState({
    personal: false,
    employment: false,
    hostel: false,
    documents: false,
    declaration: false
  });
  const [loading, setLoading] = useState(true);

  const steps = [
    { label: 'Personal    ', icon: faUser, key: 'personal' },
    { label: 'Employment', icon: faUsers, key: 'employment' },
    { label: 'Hostel', icon: faBed, key: 'hostel' },
    { label: 'Documents', icon: faPaperclip, key: 'documents' },
    { label: 'Declaration', icon: faFileSignature, key: 'declaration' }
  ];

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        console.log('Fetching progress data...');
        setLoading(true);
        
        const user = JSON.parse(syncStorage.get('user'));
        const userId = user?.id;
        
        if (!userId) {
          console.log('No user ID found');
          return;
        }

        console.log('User ID for progress:', userId);

        // Fetch personal data
        const personalResponse = await fetch(`https://wwh.punjab.gov.pk/api/getPersonal/${userId}`);
        console.log('Personal API response status:', personalResponse.status);
        
        if (personalResponse.ok) {
          const personalData = await personalResponse.json();
          console.log('Personal data received:', personalData);
          
          if (personalData.success && personalData.data) {
            const data = personalData.data;
            
            // Check personal info (profile exists)
            const personalFilled = !!data.profile;
            console.log('Personal filled:', personalFilled, 'Profile:', data.profile);
            
            // Check employment info (job_type exists)
            const employmentFilled = !!data.job_type;
            console.log('Employment filled:', employmentFilled, 'Job type:', data.job_type);
            
            // Check hostel info (applied_district exists)
            const hostelFilled = !!data.applied_district;
            console.log('Hostel filled:', hostelFilled, 'Applied district:', data.applied_district);

            // Update first three steps
            setProgressData(prev => ({
              ...prev,
              personal: personalFilled,
              employment: employmentFilled,
              hostel: hostelFilled
            }));

            // If we have personal ID, fetch documents and declaration
            if (data.id) {
              const personalId = data.id;
              console.log('Personal ID found:', personalId);

              // Fetch documents data
              try {
                const documentsResponse = await fetch(`https://wwh.punjab.gov.pk/api/getAdetail-check/${personalId}`);
                console.log('Documents API response status:', documentsResponse.status);
                
                if (documentsResponse.ok) {
                  const documentsData = await documentsResponse.json();
                  console.log('Documents data received:', documentsData);
                  
                  if (documentsData.success && documentsData.data && documentsData.data.length > 0) {
                    const docData = documentsData.data[0];
                    
                    // Check if any document field is filled (not null)
                    const documentsFilled = Object.keys(docData).some(key => 
                      key !== 'id' && 
                      key !== 'personal_id' && 
                      key !== 'created_at' && 
                      key !== 'updated_at' && 
                      docData[key] !== null
                    );
                    console.log('Documents filled:', documentsFilled);
                    
                    setProgressData(prev => ({
                      ...prev,
                      documents: documentsFilled
                    }));
                  }
                }
              } catch (docError) {
                console.error('Error fetching documents:', docError);
              }

              // Fetch declaration data
              try {
                const declarationResponse = await fetch(`https://wwh.punjab.gov.pk/api/getDdetail-check/${personalId}`);
                console.log('Declaration API response status:', declarationResponse.status);
                
                if (declarationResponse.ok) {
                  const declarationData = await declarationResponse.json();
                  console.log('Declaration data received:', declarationData);
                  
                  if (declarationData.success && declarationData.data && declarationData.data.length > 0) {
                    const declData = declarationData.data[0];
                    
                    // Check if declaration field exists and is not null
                    const declarationFilled = !!declData.declaration;
                    console.log('Declaration filled:', declarationFilled, 'Declaration:', declData.declaration);
                    
                    setProgressData(prev => ({
                      ...prev,
                      declaration: declarationFilled
                    }));
                  }
                }
              } catch (declError) {
                console.error('Error fetching declaration:', declError);
              }
            }
          }
        } else {
          console.log('Personal API response not OK');
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
      } finally {
        setLoading(false);
        console.log('Progress data fetch completed. Final state:', progressData);
      }
    };

    fetchProgressData();
  }, []);

  // Determine the actual step to display - use API data to auto-fill completed steps
  const getActualStepStatus = (stepKey, stepIndex) => {
    const stepNumber = stepIndex + 1;
    
    // If this step is completed based on API data, show as completed
    if (progressData[stepKey]) {
      return 'completed';
    }
    
    // Otherwise use the normal step progression
    if (step > stepNumber) {
      return 'completed';
    } else if (step === stepNumber) {
      return 'active';
    } else {
      return 'upcoming';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {steps.map((item, index) => {
        const stepStatus = getActualStepStatus(item.key, index);
        const isCompleted = stepStatus === 'completed';
        const isActive = stepStatus === 'active';
        const isUpcoming = stepStatus === 'upcoming';

        return (
          <View key={index} style={styles.stepContainer}>
            {/* Step Circle with Icon */}
            <View style={[
              styles.circle,
              isCompleted && styles.circleCompleted,
              isActive && styles.circleActive,
              isUpcoming && styles.circleUpcoming
            ]}>
              <FontAwesomeIcon 
                icon={item.icon} 
                size={12} 
                style={[
                  styles.icon,
                  isCompleted && styles.iconCompleted,
                  isActive && styles.iconActive,
                  isUpcoming && styles.iconUpcoming
                ]} 
              />
            </View>
            
            {/* Step Label */}
            <Text style={[
              styles.label,
              isCompleted && styles.labelCompleted,
              isActive && styles.labelActive,
              isUpcoming && styles.labelUpcoming
            ]}>
              {item.label}
            </Text>

            {/* Debug indicator - shows API status */}
            {__DEV__ && (
              <Text style={[
                styles.debugText,
                progressData[item.key] && styles.debugTextFilled
              ]}>
                {progressData[item.key] ? '✓' : '✗'}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 25,
    backgroundColor: '#f8f9ff',
    borderRadius: 20,
    marginHorizontal: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  circleCompleted: {
    borderColor: '#010048',
    backgroundColor: '#010048',
    transform: [{ scale: 1.05 }],
  },
  circleActive: {
    borderColor: '#010048',
    backgroundColor: '#ffffff',
    transform: [{ scale: 1.1 }],
    shadowColor: '#010048',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  circleUpcoming: {
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  icon: {
    color: '#e0e0e0',
  },
  iconCompleted: {
    color: '#ffffff',
  },
  iconActive: {
    color: '#010048',
  },
  iconUpcoming: {
    color: '#e0e0e0',
  },
  label: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    color: '#e0e0e0',
    maxWidth: 80,
  },
  labelCompleted: {
    color: '#010048',
    fontWeight: '700',
  },
  labelActive: {
    color: '#010048',
    fontWeight: '800',
    fontSize: 10,
  },
  labelUpcoming: {
    color: '#e0e0e0',
    fontWeight: '500',
  },
  debugText: {
    position: 'absolute',
    top: -5,
    right: -5,
    fontSize: 8,
    color: 'red',
    backgroundColor: 'white',
    borderRadius: 8,
    width: 12,
    height: 12,
    textAlign: 'center',
    lineHeight: 12,
  },
  debugTextFilled: {
    color: 'green',
  },
});

export default ProgressBar;