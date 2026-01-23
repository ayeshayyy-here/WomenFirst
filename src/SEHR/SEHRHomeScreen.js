import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Linking,
  Modal,
  Animated,
  Platform,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import SEHR_LOGO from '../../assets/images/SEHR_LOGO.png';

const { width, height } = Dimensions.get('window');

const SEHRHomeScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const courseData = {
  
    beautician: {
      title: 'Beautician Training',
      icon: 'face-woman-shimmer',
      gradient: ['#1f060e', '#C2185B', '#4a1029'],
      color: '#E91E63',
      description: 'Beauty & personal care',
      modalContent: {
        title: 'Beautician Training',
        subtitle: '30th March - 30th May (1st Batch)',
        description: 'Training in the beautician sector aims to equip women with employable skills, empowering them to achieve financial independence through self-employment and job opportunities.',
        duration: '2 Months',
        mode: 'In-Person Training Only (Not Online/Hybrid)',
        content: 'Beautician Services including Nail Art, Skin Care, Hair Care, and Makeup',
        eligibility: [
          'Gender: Females from across Punjab',
          'Age: 18-45 years',
          'Education: Minimum literate',
          'CNIC: Valid CNIC or Punjab domicile required',
          'Shortlisting based on eligibility criteria and test/interview'
        ],
        certification: 'Evaluate trainees through tests and provide recognized certifications upon successful completion.',
        startDate: 'March 2026'
      }
    },
    hospitality: {
      title: 'Hospitality Training',
      icon: 'silverware-variant',
      gradient: ['#041605', '#062e08', '#2E7D32'],
      color: '#4CAF50',
      description: 'Hotels & restaurants',
      modalContent: {
        title: 'Hospitality Training',
        description: 'Training in the hospitality sector aims to equip women with employable skills, empowering them to achieve financial independence through self-employment and job opportunities.',
        duration: '3 Months',
        mode: 'In-Person Training Only (Not Online/Hybrid)',
        content: 'Hospitality Sector Training',
        eligibility: [
          'Gender: Females from across Punjab',
          'Age: 18-45 years',
          'Education: Minimum Matric',
          'CNIC: Valid CNIC or Punjab domicile required',
          'Shortlisting based on eligibility criteria and test/interview'
        ],
        certification: 'Evaluate trainees through tests and provide recognized certifications upon successful completion.',
        startDate: 'March 2026'
      }
    },
      digital: {
      title: 'Digital Skills Training',
      icon: 'laptop',
      gradient: ['#0a040b', '#121213', '#6A1B9A'],
      color: '#9C27B0',
      description: 'Online marketing & e-commerce',
      modalContent: {
        title: 'Digital Skills Training',
        description: 'This component is specifically related to IT and digitalization sector and it will enable, empower, and encourage rural women of Punjab through digital training at home leading to self-sustainable economic opportunities acknowledging household nuances. This program is sponsored by WDD and executed by PSDF.',
        duration: '6 Months',
        mode: 'Online Classes Only',
        content: 'English Language, Digital Skills, Content Creation, E-Commerce, Soft Skills',
        equipment: 'Laptop + Internet Device + Internet Package + Stipend 5000/Per Month',
        eligibility: [
          'Gender: Rural women only',
          'Age: 90% (up to 30 years), 10% (30+ years)',
          'Education: Minimum 16 years of education or equivalent',
          'CNIC: Valid CNIC or Punjab domicile required',
          'Shortlisting based on eligibility criteria and test/interview'
        ],
        certification: 'Evaluate trainees through tests and provide recognized certifications upon successful completion.',
        startDate: 'March 2026'
      }
    }
    
  };

  const handleCoursePress = (course) => {
    setSelectedCourse(course);
    setModalVisible(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleRegisterNow = () => {
    setModalVisible(false);
    if (selectedCourse === 'digital') {
      navigation.navigate('DigitalSkillsRegistrationForm');
    } else if (selectedCourse === 'beautician') {
      navigation.navigate('BeauticianRegistrationForm');
    } else if (selectedCourse === 'hospitality') {
      navigation.navigate('HospitalityRegistrationForm');
    }
  };

  const handleSDGPress = (sdgNumber) => {
    console.log(`SDG ${sdgNumber} pressed`);
  };

  const openWebsite = () => {
    Linking.openURL('https://wdd.punjab.gov.pk/SEHR');
  };

  const openFacebook = () => {
    Linking.openURL('https://facebook.com');
  };

  const renderCourseButton = (courseKey) => {
    const course = courseData[courseKey];
    return (
      <Animatable.View 
        animation="fadeInUp" 
        delay={courseKey === 'digital' ? 100 : courseKey === 'beautician' ? 200 : 300}
        duration={800}
        useNativeDriver
        style={styles.courseButtonWrapper}
      >
        <TouchableOpacity 
          style={styles.courseButton}
          onPress={() => handleCoursePress(courseKey)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={course.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.courseGradient}
          >
            <View style={styles.courseButtonContent}>
              <View style={styles.courseIconContainer}>
                <Icon name={course.icon} size={25} color="white" />
              </View>
              <View style={styles.courseTextContainer}>
                <Text style={styles.courseButtonText}>{course.title}</Text>
                <Text style={styles.courseButtonSubtext}>{course.description}</Text>
              </View>
              <View style={styles.courseArrow}>
                <Icon name="chevron-right" size={28} color="white" />
              </View>
            </View>
            <View style={styles.courseRibbon}>
              <Text style={styles.courseRibbonText}>ENROLL NOW</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  const renderModal = () => {
    if (!selectedCourse) return null;
    
    const course = courseData[selectedCourse];
    const content = course.modalContent;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View 
                style={[
                  styles.modalContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={course.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalHeader}
                >
                  <View style={styles.modalHeaderContent}>
                    <View style={styles.modalIconContainer}>
                      <Icon name={course.icon} size={40} color="white" />
                    </View>
                    <View>
                      <Text style={styles.modalTitle}>{content.title}</Text>
                      {content.subtitle && (
                        <Text style={styles.modalSubtitle}>{content.subtitle}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Icon name="close" size={24} color="white" />
                  </TouchableOpacity>
                </LinearGradient>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalDescription}>{content.description}</Text>
                    
                    <View style={styles.detailsSection}>
                      <DetailCard
                        icon="clock-outline"
                        label="Duration"
                        value={content.duration}
                        color={course.color}
                      />
                      
                      <DetailCard
                        icon="monitor"
                        label="Training Mode"
                        value={content.mode}
                        color={course.color}
                      />
                      
                      <DetailCard
                        icon="book-open"
                        label="Course Content"
                        value={content.content}
                        color={course.color}
                      />
                      
                      {content.equipment && (
                        <DetailCard
                          icon="gift"
                          label="Equipment Provided"
                          value={content.equipment}
                          color={course.color}
                        />
                      )}
                    </View>

                    <View style={styles.sectionContainer}>
                      <View style={styles.sectionHeader}>
                        <Icon name="clipboard-check" size={24} color={course.color} />
                        <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
                      </View>
                      
                      <View style={styles.listContainer}>
                        {content.eligibility.map((item, index) => (
                          <View key={index} style={styles.listItem}>
                            <Icon name="check-circle" size={18} color={course.color} />
                            <Text style={styles.listItemText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    <View style={styles.sectionContainer}>
                      <View style={styles.sectionHeader}>
                        <Icon name="certificate" size={24} color={course.color} />
                        <Text style={styles.sectionTitle}>Certification</Text>
                      </View>
                      <Text style={styles.certificationText}>{content.certification}</Text>
                    </View>

                    <View style={styles.dateContainer}>
                      <LinearGradient
                        colors={[`${course.color}20`, `${course.color}10`]}
                        style={styles.dateGradient}
                      >
                        <Icon name="calendar-star" size={24} color={course.color} />
                        <Text style={styles.dateText}>
                          <Text style={styles.dateLabel}>Tentative Start Date: </Text>
                          {content.startDate}
                        </Text>
                      </LinearGradient>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity 
                    style={styles.registerButton}
                    onPress={handleRegisterNow}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={course.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.registerButtonGradient}
                    >
                      <Icon name="arrow-right-circle" size={26} color="white" />
                      <Text style={styles.registerButtonText}>Register Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const DetailCard = ({ icon, label, value, color }) => (
    <View style={styles.detailCard}>
      <View style={[styles.detailIconContainer, { backgroundColor: `${color}20` }]}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[styles.detailValue, { color }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#7C2B5E" barStyle="light-content" />
      <LinearGradient
        colors={['rgba(124, 43, 94, 0.95)', 'rgba(65, 47, 99, 0.95)']}
        style={styles.backgroundGradient}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Header Section */}
          <Animatable.View animation="fadeInDown" duration={1000} style={styles.header}>
            <LinearGradient
              colors={['#311727', '#412F63']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <View style={styles.headerContent}>
                <View style={styles.logoContainer}>
                  <Image 
                    source={SEHR_LOGO}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                  <View style={styles.logoTextContainer}>
                    <Text style={styles.logoText}>SEHR</Text>
                    <Text style={styles.logoSubtext}>Skill Enhancement Through Home Reach</Text>
                  </View>
                </View>
                <Text style={styles.headerTitle}>Skill Enhancement Through Home Reach</Text>
                <Text style={styles.headerSubtitle}>
                  Empowering Women Through Skills Development & Economic Independence
                </Text>
              </View>
              <Icon name="dots-horizontal" size={100} color="rgba(255,255,255,0.1)" style={styles.headerPattern} />
            </LinearGradient>
          </Animatable.View>

          {/* Main Course Buttons Section */}
          <Animatable.View animation="fadeInUp" duration={800} style={styles.mainSection}>
            <View style={styles.sectionHeader}>
              <Icon name="book-education" size={28} color="white" />
              <Text style={styles.mainSectionTitle}>Available Training Programs</Text>
            </View>
            <Text style={styles.mainSectionSubtitle}>Choose your path to empowerment and career development</Text>
            
            <View style={styles.courseButtonsContainer}>
              {renderCourseButton('digital')}
              {renderCourseButton('beautician')}
              {renderCourseButton('hospitality')}
            </View>
          </Animatable.View>

          {/* About Section */}
          <Animatable.View animation="fadeInUp" delay={200} style={styles.infoSection}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.98)']}
              style={styles.infoCard}
            >
              <View style={styles.infoHeader}>
                <View style={styles.infoIconContainer}>
                  <Icon name="information-variant" size={28} color="#7C2B5E" />
                </View>
                <Text style={styles.infoTitle}>About SEHR Program</Text>
              </View>
              <Text style={styles.infoText}>
                This project is designed to break barriers to access by bringing employable skill 
                training directly to women in remote, semi-urban as well as urban areas. 
                The enrollment of women for training will be achieved mainly through community 
                mobilization with local leaders, district administration and Staff of WDD etc.
              </Text>
              <View style={styles.infoStats}>
                <View style={styles.statItem}>
                  <Icon name="account-group" size={20} color="#7C2B5E" />
                  <Text style={styles.statNumber}>5,365+</Text>
                  <Text style={styles.statLabel}>Women</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="map-marker" size={20} color="#412F63" />
                  <Text style={styles.statNumber}>36</Text>
                  <Text style={styles.statLabel}>Districts</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="calendar-check" size={20} color="#2196F3" />
                  <Text style={styles.statNumber}>24</Text>
                  <Text style={styles.statLabel}>Months</Text>
                </View>
              </View>
            </LinearGradient>
          </Animatable.View>

          {/* SDGs Section */}
          <Animatable.View animation="fadeInUp" delay={300} style={styles.sdgsSection}>
            <View style={styles.sdgsHeader}>
              <View style={styles.sdgsIconContainer}>
                <Icon name="flag-variant" size={28} color="white" />
              </View>
              <Text style={styles.sdgsTitle}>Aligned with UN Sustainable Development Goals</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.sdgsScroll}
              contentContainerStyle={styles.sdgsScrollContent}
            >
              {[
                { number: '01', title: 'NO POVERTY', color: '#e5243b', icon: 'hand-heart' },
                { number: '04', title: 'QUALITY EDUCATION', color: '#c5192d', icon: 'school' },
                { number: '05', title: 'GENDER EQUALITY', color: '#ff3a21', icon: 'gender-male-female' },
                { number: '08', title: 'DECENT WORK', color: '#a21942', icon: 'briefcase' },
                { number: '10', title: 'REDUCED INEQUALITIES', color: '#dd1367', icon: 'scale-balance' },
              ].map((sdg, index) => (
                <TouchableOpacity 
                  key={index}
                  onPress={() => handleSDGPress(sdg.number)}
                  style={styles.sdgCard}
                >
                  <LinearGradient
                    colors={[sdg.color, `${sdg.color}DD`]}
                    style={styles.sdgGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Icon name={sdg.icon} size={30} color="white" />
                    <Text style={styles.sdgNumber}>{sdg.number}</Text>
                    <Text style={styles.sdgTitle}>{sdg.title}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animatable.View>

          {/* Footer */}
          <Animatable.View animation="fadeInUp" delay={400} style={styles.footer}>
            <LinearGradient
              colors={['rgba(124, 43, 94, 0.9)', 'rgba(65, 47, 99, 0.9)']}
              style={styles.footerGradient}
            >
              <TouchableOpacity onPress={openWebsite} style={styles.websiteButton}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                  style={styles.websiteGradient}
                >
                  <Icon name="web" size={20} color="white" />
                  <Text style={styles.websiteLink}>wdd.punjab.gov.pk/SEHR</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <Text style={styles.footerText}>
                Transforming Lives Through Skills Development & Economic Empowerment
              </Text>
              
              <View style={styles.socialContainer}>
                <TouchableOpacity onPress={openFacebook} style={styles.socialButton}>
                  <LinearGradient
                    colors={['#1877F2', '#0D5FD9']}
                    style={styles.socialGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <FontAwesome name="facebook" size={20} color="white" />
                    <Text style={styles.socialText}>Follow Us</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton}>
                  <LinearGradient
                    colors={['#FF9800', '#F57C00']}
                    style={styles.socialGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Icon name="email" size={20} color="white" />
                    <Text style={styles.socialText}>Contact</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.copyright}>
                © Women Development Department, Government of The Punjab
              </Text>
              <Text style={styles.poweredBy}>
                Powered by: Punjab Information Technology Board
              </Text>
            </LinearGradient>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
      
      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7C2B5E',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    marginBottom: 20,
  },
  headerGradient: {
    padding: 25,
    paddingTop: 60,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  logoTextContainer: {
    flex: 1,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    fontFamily: 'serif',
    letterSpacing: 1,
  },
  logoSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(199, 178, 178, 0.9)',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  headerSubtitle: {
    fontSize: 10,
    color: 'rgba(205, 191, 191, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
  },
  headerPattern: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    opacity: 0.3,
  },
  mainSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mainSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(250, 243, 243, 0.9)',
    marginLeft: 10,
    fontFamily: 'serif',
  },
  mainSectionSubtitle: {
    fontSize: 12,
    color: 'rgba(184, 167, 167, 0.9)',
    marginBottom: 20,
    lineHeight: 20,
  },
  courseButtonsContainer: {
    gap: 15,
  },
  courseButtonWrapper: {
    shadowColor: '#564545',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 45,
    elevation: 10,
  },
  courseButton: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 110,
  },
  courseGradient: {
    flex: 1,
    padding: 25,
    justifyContent: 'center',
  },
  courseButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  courseTextContainer: {
    flex: 1,
  },
  courseButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  courseButtonSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
  },
  courseArrow: {
    marginLeft: 10,
  },
  courseRibbon: {
    position: 'absolute',
    top: 10,
    right: -30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingVertical: 5,
    paddingHorizontal: 30,
    transform: [{ rotate: '45deg' }],
  },
  courseRibbonText: {
    fontSize: 6,
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoCard: {
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  infoIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(124, 43, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#7C2B5E',
    fontFamily: 'serif',
  },
  infoText: {
    fontSize: 12,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  infoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7C2B5E',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  sdgsSection: {
    marginBottom: 30,
  },
  sdgsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sdgsIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  sdgsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
    fontFamily: 'serif',
  },
  sdgsScroll: {
    paddingLeft: 20,
  },
  sdgsScrollContent: {
    paddingRight: 20,
  },
  sdgCard: {
    width: 100,
    height: 120,
    borderRadius: 15,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  sdgGradient: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sdgNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 8,
  },
  sdgTitle: {
    fontSize: 10,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 16,
  },
  footer: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    overflow: 'hidden',
  },
  footerGradient: {
    padding: 30,
    alignItems: 'center',
  },
  websiteButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 20,
    width: '100%',
  },
  websiteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
  },
  websiteLink: {
    fontSize: 12,
    color: 'white',
    marginLeft: 10,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
    fontFamily: 'serif',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 25,
  },
  socialButton: {
    borderRadius: 25,
    overflow: 'hidden',
    minWidth: 130,
  },
  socialGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  socialText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 10,
    fontWeight: '600',
  },
  copyright: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 5,
  },
  poweredBy: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  modalHeader: {
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    fontFamily: 'serif',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    fontStyle: 'italic',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    maxHeight: height * 0.6,
  },
  modalContent: {
    padding: 25,
  },
  modalDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    marginBottom: 25,
  },
  detailsSection: {
    marginBottom: 25,
  },
  detailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  detailIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    fontFamily: 'serif',
  },
  listContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    marginLeft: 10,
    lineHeight: 20,
  },
  certificationText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
  },
  dateContainer: {
    marginTop: 20,
  },
  dateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  dateLabel: {
    fontWeight: 'bold',
  },
  modalFooter: {
    paddingHorizontal: 25,
    paddingBottom: 30,
  },
  registerButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  registerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
});

export default SEHRHomeScreen;