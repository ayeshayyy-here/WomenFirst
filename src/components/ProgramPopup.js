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
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

// Main Popup Component
const ProgramPopup = ({ 
  visible, 
  onClose, 
  programType, 
  customContent 
}) => {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Set current date when component mounts
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(formattedDate);
  }, []);

  // Render content based on program type
  const renderContent = () => {
    if (customContent) {
      return customContent;
    }

    switch (programType) {
      case 'launch':
        return (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon name="rocket" size={40} color="#7C2B5E" />
            </View>
            <Text style={styles.title}>Launching Soon!</Text>
            <Text style={styles.subtitle}>COMING SOON</Text>
            <Text style={styles.text}>
              You'll get an update on the website when it's live.
            </Text>
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
            <View style={styles.iconContainer}>
              <Icon name="graduation-cap" size={30} color="#7C2B5E" />
            </View>
            <Text style={styles.title}>Skills Development Through Ambassador Program</Text>
            <View style={styles.reminderBox}>
              <Icon name="bell" size={16} color="#FFF" style={styles.bellIcon} />
              <Text style={styles.reminder}>
                <Text style={styles.bold}>Reminder:</Text> Application Submission Deadline is{' '}
                <Text style={styles.deadline}>29-09-2025</Text>
              </Text>
            </View>
            <Text style={styles.text}>
              You can update your application until the submission deadline.
            </Text>
           
          </View>
        );
        case 'ypc':
        return (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon name="graduation-cap" size={30} color="#7C2B5E" />
            </View>
            <Text style={styles.title}>Entrepreneurial Female Youth Pitch Competition</Text>
            <View style={styles.reminderBox}>
              <Icon name="bell" size={16} color="#FFF" style={styles.bellIcon} />
               <Text style={styles.reminder}>
                <Text style={styles.bold}>Reminder:</Text>  Call for applications (Students submit ideas){' '}
                <Text style={styles.deadline}>3 October 2025</Text>
              </Text>
             
              
             
            </View>
            <Text style={styles.text}>
              Applicants can update their profiles until <Text style={styles.deadlinee}>3 October 2025.</Text>
            </Text>
           
          </View>
        );
      
      case 'women-entrepreneurship':
        return (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon name="female" size={40} color="#7C2B5E" />
            </View>
            <Text style={styles.title}>Women Entrepreneurship Program</Text>
            <Text style={styles.text}>
              Join our exclusive program designed to empower women entrepreneurs with skills, resources, and networking opportunities.
            </Text>
            <View style={styles.divider} />
            <View style={styles.infoBox}>
              <Icon name="star" size={16} color="#7C2B5E" />
              <Text style={styles.reminder}>
                <Text style={styles.bold}>Early Registration:</Text> Until 15-10-2025
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
            <TouchableOpacity style={styles.registerButton}>
              <Text style={styles.registerButtonText}>Register Now</Text>
              <Icon name="arrow-right" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        );
      
      default:
        return (
          <View style={styles.content}>
            <Text style={styles.title}>Program Information</Text>
            <Text style={styles.text}>
              This is a default program popup. Add custom content or specify a program type.
            </Text>
          </View>
        );
    }
  };

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
            <View style={styles.dateContainer}>
              <Icon name="calendar" size={16} color="#7C2B5E" />
              <Text style={styles.dateText}>{currentDate}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="times" size={24} color="#7C2B5E" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            {renderContent()}
          </ScrollView>
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
    shadowOffset: {
      width: 0,
      height: 2
    },
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
    marginBottom: 15,
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
  text: {
    fontSize: 12,
    marginBottom: 20,
    lineHeight: 22,
    color: '#616161',
    textAlign: 'center',
  },
  reminderBox: {
    flexDirection: 'row',
    backgroundColor: '#7C2B5E',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  reminder: {
    fontSize: 12,
    lineHeight: 20,
    color: '#FFF',
    flex: 1,
  },
  deadline: {
    fontWeight: 'bold',
    color: '#FFEB3B',
  },
   deadlinee: {
    fontWeight: 'bold',
    color: '#322f11ff',
  },
  bold: {
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E1BEE7',
    marginVertical: 20,
    width: '100%',
  },
  highlight: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#C0C0C0',
    marginTop: 10,
    letterSpacing: 2,
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A148C',
  },
  subsection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  subsectionText: {
    fontSize: 16,
    color: '#7C2B5E',
    fontWeight: '500',
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
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F3E5F5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'stretch',
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#616161',
  },
  applyButton: {
    flexDirection: 'row',
    backgroundColor: '#7C2B5E',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    alignSelf: 'stretch',
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
    alignSelf: 'stretch',
  },
  registerButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  bellIcon: {
    marginRight: 8,
  }
});

export default ProgramPopup;