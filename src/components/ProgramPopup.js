import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

// API Configuration
const API_BASE_URL = 'https://dashboard-wdd.punjab.gov.pk/api';
const API = {
  activePrograms: `${API_BASE_URL}/programs/active`,
  programs: `${API_BASE_URL}/programs`,
};

// Configure axios logging
axios.interceptors.request.use(
  (config) => {
    console.log(`[Program API Request] ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[Program API Request Error]', error);
    return Promise.reject(error);
  }
);

// Main Popup Component
const ProgramPopup = ({ visible, onClose }) => {
  const [currentDate, setCurrentDate] = useState('');
  const [programs, setPrograms] = useState([]);
  const [currentProgramIndex, setCurrentProgramIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProgram, setShowProgram] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchActivePrograms();
    }
  }, [visible]);

  useEffect(() => {
    // Set current date
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDate(formattedDate);
  }, []);

  const fetchActivePrograms = async () => {
    try {
      console.log('[ProgramPopup] Fetching active programs...');
      setLoading(true);
      setError(null);
      
      const response = await axios.get(API.activePrograms);
      
      if (response.data.success) {
        const activePrograms = response.data.data;
        console.log(`[ProgramPopup] Found ${activePrograms.length} active programs`);
        
        if (activePrograms.length > 0) {
          setPrograms(activePrograms);
          setCurrentProgramIndex(0);
          setShowProgram(true);
        } else {
          setShowProgram(false);
          setPrograms([]);
          // Show message for no active programs
          setTimeout(() => {
            Alert.alert(
              'No Active Programs',
              'There are currently no active programs. Please check back later for upcoming programs.',
              [
                {
                  text: 'OK',
                  onPress: onClose
                }
              ]
            );
          }, 500);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch programs');
      }
    } catch (err) {
      console.error('[ProgramPopup] Error fetching programs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch programs');
      setShowProgram(false);
    } finally {
      setLoading(false);
    }
  };

  const handleNextProgram = () => {
    if (currentProgramIndex < programs.length - 1) {
      setCurrentProgramIndex(currentProgramIndex + 1);
    }
  };

  const handlePrevProgram = () => {
    if (currentProgramIndex > 0) {
      setCurrentProgramIndex(currentProgramIndex - 1);
    }
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusMessage = (program) => {
    const { status, days_info, ending_date, extended_date } = program;
    const today = new Date();
    const endDate = new Date(ending_date);
    const extDate = extended_date ? new Date(extended_date) : null;

    switch (status) {
      case 'upcoming':
        const daysToStart = Math.ceil((new Date(program.starting_date) - today) / (1000 * 60 * 60 * 24));
        return `Program starts in ${daysToStart} days on ${formatDateDisplay(program.starting_date)}`;

      case 'ongoing':
        const daysRemaining = days_info.days_remaining;
        return `Registration open! ${daysRemaining} days remaining until ${formatDateDisplay(ending_date)}`;

      case 'extended':
        const extendedDaysRemaining = days_info.days_remaining;
        return `Deadline extended! ${extendedDaysRemaining} days remaining until ${formatDateDisplay(extended_date)}`;

      case 'closed':
        if (extDate && today > extDate) {
          const daysSinceClose = days_info.days_overdue;
          return `Registrations closed ${daysSinceClose} days ago. Wait for the next batch!`;
        } else {
          const daysSinceClose = Math.ceil((today - endDate) / (1000 * 60 * 60 * 24));
          return `Registrations closed ${daysSinceClose} days ago. Wait for the next batch!`;
        }

      default:
        return 'Program status unavailable';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return '#f59e0b'; // Orange
      case 'ongoing': return '#10b981'; // Green
      case 'extended': return '#8b5cf6'; // Purple
      case 'closed': return '#dc2626'; // Red
      default: return '#6b7280'; // Gray
    }
  };

  const renderProgramContent = (program) => {
    const { project, program_type, status, days_info } = program;
    
    if (!showProgram || status === 'closed') {
      return renderClosedProgram(program);
    }

    // Common header for active programs
    const renderHeader = () => (
      <View style={styles.programHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>
            {status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.programDateInfo}>
          {getStatusMessage(program)}
        </Text>
      </View>
    );

    // Program-specific content
    switch (program_type) {
      case 'launch':
        return (
          <View style={styles.content}>
            {renderHeader()}
            <View style={styles.iconContainer}>
              <Icon name="rocket" size={40} color="#7C2B5E" />
            </View>
            <Text style={styles.title}>{project}</Text>
            <Text style={styles.subtitle}>COMING SOON</Text>
            <Text style={styles.text}>
              You'll get an update on the website when it's live.
            </Text>
            <View style={styles.dateInfo}>
              <Icon name="calendar" size={14} color="#7C2B5E" />
              <Text style={styles.dateInfoText}>
                Launch Date: {formatDateDisplay(program.starting_date)}
              </Text>
            </View>
            <View style={styles.divider} />
            <Text style={styles.highlight}>SILVER</Text>
            <View style={styles.footer}>
              <Icon name="globe" size={16} color="#7C2B5E" />
              <Text style={styles.footerText}> www.example.com</Text>
            </View>
          </View>
        );

      case 'ambassador':
        return (
          <View style={styles.content}>
            {renderHeader()}
            <View style={styles.iconContainer}>
              <Icon name="graduation-cap" size={30} color="#7C2B5E" />
            </View>
            <Text style={styles.title}>{project}</Text>
            
            <View style={styles.reminderBox}>
              <Icon name="bell" size={16} color="#FFF" style={styles.bellIcon} />
              <Text style={styles.reminder}>
                <Text style={styles.bold}>Application Deadline: </Text>
                <Text style={styles.deadline}>
                  {formatDateDisplay(days_info.is_extended ? program.extended_date : program.ending_date)}
                </Text>
              </Text>
            </View>
            
            <Text style={styles.text}>
              {days_info.is_extended 
                ? 'Deadline has been extended! You can update your application until the new submission deadline.'
                : 'You can update your application until the submission deadline.'}
            </Text>
            
            <View style={styles.features}>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}> Skill Development Workshops</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}> Mentorship Program</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}> Networking Opportunities</Text>
              </View>
            </View>
            
           <TouchableOpacity
  style={[
    styles.applyButton,
    status === 'closed' && styles.disabledButton,
  ]}
  onPress={() => {
    if (status === 'closed') {
      onClose(); // or Alert / Toast
      return;
    }
    onClose(); // your normal Apply Now flow
  }}
  activeOpacity={status === 'closed' ? 1 : 0.7}
>
  <Text style={styles.applyButtonText}>
    {status === 'closed' ? 'Registrations Closed' : 'Apply Now'}
  </Text>
  <Icon name="arrow-right" size={16} color="#FFF" />
</TouchableOpacity>

          </View>
        );

      case 'ypc':
        return (
          <View style={styles.content}>
            {renderHeader()}
            <View style={styles.iconContainer}>
              <Icon name="trophy" size={30} color="#7C2B5E" />
            </View>
            <Text style={styles.title}>{project}</Text>
            
            <View style={styles.reminderBox}>
              <Icon name="bell" size={16} color="#FFF" style={styles.bellIcon} />
              <Text style={styles.reminder}>
                <Text style={styles.bold}>Call for Applications: </Text>
                <Text style={styles.deadline}>
                  {formatDateDisplay(program.ending_date)}
                </Text>
              </Text>
            </View>
            
            <Text style={styles.text}>
              Applicants can update their profiles until{' '}
              <Text style={styles.deadlineText}>
                {formatDateDisplay(days_info.is_extended ? program.extended_date : program.ending_date)}.
              </Text>
            </Text>
            
            <View style={styles.features}>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}> Pitch Training Sessions</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}> Funding Opportunities</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}> Investor Connections</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.applyButton} disabled={status === 'closed'}>
              <Text style={styles.applyButtonText}>
                {status === 'closed' ? 'Submissions Closed' : 'Submit Idea'}
              </Text>
              <Icon name="arrow-right" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        );

      case 'women-entrepreneurship':
        return (
          <View style={styles.content}>
            {renderHeader()}
            <View style={styles.iconContainer}>
              <Icon name="female" size={40} color="#7C2B5E" />
            </View>
            <Text style={styles.title}>{project}</Text>
            
            <Text style={styles.text}>
              Join our exclusive program designed to empower women entrepreneurs with skills, resources, and networking opportunities.
            </Text>
            
            <View style={styles.infoBox}>
              <Icon name="star" size={16} color="#7C2B5E" />
              <Text style={styles.infoText}>
                <Text style={styles.bold}>Early Registration: </Text>
                Until {formatDateDisplay(program.ending_date)}
              </Text>
            </View>
            
            <Text style={styles.text}>
              Limited seats available. Register now to secure your spot!
            </Text>
            
            <View style={styles.features}>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}> Mentorship Sessions</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}> Funding Opportunities</Text>
              </View>
              <View style={styles.feature}>
                <Icon name="check-circle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}> Networking Events</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.registerButton} disabled={status === 'closed'}>
              <Text style={styles.registerButtonText}>
                {status === 'closed' ? 'Registration Closed' : 'Register Now'}
              </Text>
              <Icon name="arrow-right" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <View style={styles.content}>
            {renderHeader()}
            <Text style={styles.title}>{project}</Text>
            <Text style={styles.text}>
              Program Dates: {formatDateDisplay(program.starting_date)} to{' '}
              {formatDateDisplay(days_info.is_extended ? program.extended_date : program.ending_date)}
            </Text>
            <Text style={styles.statusMessage}>{getStatusMessage(program)}</Text>
            <View style={styles.divider} />
            <Text style={styles.text}>
              For more information, please visit our website or contact the program coordinator.
            </Text>
          </View>
        );
    }
  };

  const renderClosedProgram = (program) => {
    return (
      <View style={styles.content}>
        <View style={[styles.statusBadge, { backgroundColor: '#dc262620' }]}>
          <Text style={[styles.statusText, { color: '#dc2626' }]}>
            CLOSED
          </Text>
        </View>
        
        <View style={styles.iconContainer}>
          <Icon name="clock-o" size={40} color="#6b7280" />
        </View>
        
        <Text style={styles.title}>{program.project}</Text>
        <Text style={styles.closedSubtitle}>Registrations Closed</Text>
        
        <View style={styles.closedMessageBox}>
          <Icon name="info-circle" size={24} color="#dc2626" />
          <Text style={styles.closedMessage}>
            This program's registration period has ended.
          </Text>
        </View>
        
        <Text style={styles.closedText}>
          <Text style={styles.bold}>Original Deadline: </Text>
          {formatDateDisplay(program.ending_date)}
          {program.extended_date && (
            <Text>
              {'\n'}<Text style={styles.bold}>Extended Deadline: </Text>
              {formatDateDisplay(program.extended_date)}
            </Text>
          )}
        </Text>
        
        <View style={styles.waitingBox}>
          <Icon name="hourglass-half" size={20} color="#f59e0b" />
          <Text style={styles.waitingText}>
            Please wait for the next batch or upcoming programs
          </Text>
        </View>
        
        <View style={styles.suggestions}>
          <Text style={styles.suggestionTitle}>What you can do:</Text>
          <View style={styles.suggestion}>
            <Icon name="check" size={14} color="#10b981" />
            <Text style={styles.suggestionText}> Check for other active programs</Text>
          </View>
          <View style={styles.suggestion}>
            <Icon name="check" size={14} color="#10b981" />
            <Text style={styles.suggestionText}> Join our mailing list for updates</Text>
          </View>
          <View style={styles.suggestion}>
            <Icon name="check" size={14} color="#10b981" />
            <Text style={styles.suggestionText}> Follow us on social media</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.notifyButton}>
          <Icon name="envelope" size={16} color="#FFF" />
          <Text style={styles.notifyButtonText}>Notify Me About Next Batch</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const currentProgram = programs[currentProgramIndex] || null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.dateContainer}>
                <Icon name="calendar" size={16} color="#7C2B5E" />
                <Text style={styles.dateText}>{currentDate}</Text>
              </View>
              {programs.length > 0 && (
                <View style={styles.counter}>
                  <Text style={styles.counterText}>
                    {currentProgramIndex + 1} of {programs.length}
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="times" size={24} color="#7C2B5E" />
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C2B5E" />
              <Text style={styles.loadingText}>Loading programs...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Icon name="exclamation-triangle" size={50} color="#dc2626" />
              <Text style={styles.errorText}>Failed to load programs</Text>
              <Text style={styles.errorSubtext}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchActivePrograms}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : programs.length === 0 ? (
            <View style={styles.noProgramsContainer}>
              <Icon name="calendar-times-o" size={50} color="#9ca3af" />
              <Text style={styles.noProgramsText}>No Active Programs</Text>
              <Text style={styles.noProgramsSubtext}>
                There are currently no active programs. Please check back later.
              </Text>
              <TouchableOpacity style={styles.closeButtonLarge} onPress={onClose}>
                <Text style={styles.closeButtonLargeText}>Close</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView 
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {currentProgram && renderProgramContent(currentProgram)}
              </ScrollView>
              
              {programs.length > 1 && (
                <View style={styles.navigation}>
                  <TouchableOpacity 
                    style={[styles.navButton, currentProgramIndex === 0 && styles.navButtonDisabled]}
                    onPress={handlePrevProgram}
                    disabled={currentProgramIndex === 0}
                  >
                    <Icon name="chevron-left" size={20} color={currentProgramIndex === 0 ? "#9ca3af" : "#7C2B5E"} />
                    <Text style={[styles.navButtonText, currentProgramIndex === 0 && styles.navButtonTextDisabled]}>
                      Previous
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.navButton, currentProgramIndex === programs.length - 1 && styles.navButtonDisabled]}
                    onPress={handleNextProgram}
                    disabled={currentProgramIndex === programs.length - 1}
                  >
                    <Text style={[styles.navButtonText, currentProgramIndex === programs.length - 1 && styles.navButtonTextDisabled]}>
                      Next
                    </Text>
                    <Icon name="chevron-right" size={20} color={currentProgramIndex === programs.length - 1 ? "#9ca3af" : "#7C2B5E"} />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// Styles
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalView: {
    width: width * 0.9,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: height * 0.8,
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3E5F5',
    backgroundColor: '#F3E5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerLeft: {
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#7C2B5E',
    marginLeft: 8,
    fontWeight: '500',
  },
  counter: {
    marginTop: 4,
  },
  counterText: {
    fontSize: 11,
    color: '#9ca3af',
  },
  closeButton: {
    padding: 5,
    borderRadius: 15,
    backgroundColor: '#E1BEE7',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  content: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: '#dc2626',
    fontWeight: '600',
  },
  errorSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#7C2B5E',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  noProgramsContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noProgramsText: {
    marginTop: 10,
    fontSize: 18,
    color: '#6b7280',
    fontWeight: '600',
  },
  noProgramsSubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButtonLarge: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#7C2B5E',
    borderRadius: 8,
  },
  closeButtonLargeText: {
    color: '#FFF',
    fontWeight: '600',
  },
  programHeader: {
    width: '100%',
    marginBottom: 15,
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  programDateInfo: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3E5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#7C2B5E',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#7C2B5E',
    letterSpacing: 2,
  },
  closedSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#dc2626',
  },
  text: {
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 20,
    color: '#616161',
    textAlign: 'center',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateInfoText: {
    fontSize: 12,
    color: '#7C2B5E',
    marginLeft: 8,
    fontWeight: '500',
  },
  reminderBox: {
    flexDirection: 'row',
    backgroundColor: '#7C2B5E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  reminder: {
    fontSize: 12,
    lineHeight: 18,
    color: '#FFF',
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3E5F5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  infoText: {
    fontSize: 12,
    color: '#7C2B5E',
    marginLeft: 8,
    flex: 1,
  },
  deadline: {
    fontWeight: 'bold',
    color: '#FFEB3B',
  },
  deadlineText: {
    fontWeight: 'bold',
    color: '#7C2B5E',
  },
  bold: {
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E1BEE7',
    marginVertical: 15,
    width: '100%',
  },
  highlight: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#C0C0C0',
    marginVertical: 10,
    letterSpacing: 2,
  },
  features: {
    width: '100%',
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingLeft: 10,
  },
  featureText: {
    fontSize: 13,
    color: '#616161',
    marginLeft: 8,
  },
  applyButton: {
    flexDirection: 'row',
    backgroundColor: '#7C2B5E',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  applyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  registerButton: {
    flexDirection: 'row',
    backgroundColor: '#7C2B5E',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: '100%',
  },
  registerButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  closedMessageBox: {
    flexDirection: 'row',
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  closedMessage: {
    fontSize: 13,
    color: '#dc2626',
    marginLeft: 10,
    flex: 1,
    fontWeight: '600',
  },
  closedText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  waitingBox: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  waitingText: {
    fontSize: 13,
    color: '#d97706',
    marginLeft: 10,
    flex: 1,
  },
  suggestions: {
    width: '100%',
    marginBottom: 20,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 13,
    color: '#4b5563',
    marginLeft: 8,
  },
  notifyButton: {
    flexDirection: 'row',
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  notifyButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  footerText: {
    fontSize: 14,
    color: '#7C2B5E',
    fontWeight: '500',
    marginLeft: 8,
  },
  bellIcon: {
    marginRight: 8,
  },
  statusMessage: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 15,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#F3E5F5',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3E5F5',
  },
  navButtonDisabled: {
    backgroundColor: '#f9fafb',
  },
  navButtonText: {
    fontSize: 14,
    color: '#7C2B5E',
    fontWeight: '500',
    marginHorizontal: 5,
  },
  navButtonTextDisabled: {
    color: '#9ca3af',
  },
});

export default ProgramPopup;