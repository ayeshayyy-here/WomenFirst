import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#8b5cf6',
  primaryLight: '#a78bfa',
  primaryDark: '#7c3aed',
  primaryGradient: ['#8b5cf6', '#7c3aed', '#6d28d9'],
  primarySoft: '#f5f3ff',
  secondary: '#f8f9fa',
  background: '#f4f7fb',
  surface: '#ffffff',
  text: '#334155',
  textLight: '#64748b',
  textLighter: '#94a3b8',
  white: '#ffffff',
  black: '#1e293b',
  overlay: 'rgba(0,0,0,0.5)',
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a5',
    900: '#581c87',
  }
};

const StudioBookingScreen = ({ navigation }) => {
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Slide up animation
    Animated.spring(slideUpAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Stars animation
    Animated.loop(
      Animated.timing(starsAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [fadeAnim, scaleAnim, rotateAnim, bounceAnim, pulseAnim, slideUpAnim, starsAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bounce = bounceAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -20, 0],
  });

  const starOpacity = starsAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  const starScale = starsAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 1.2, 0.8],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.primaryDark} barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#f5f3ff', '#ede9fe', '#faf5ff']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated Stars Background */}
      <View style={styles.starsContainer}>
        {[...Array(20)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.star,
              {
                top: Math.random() * height,
                left: Math.random() * width,
                opacity: starOpacity,
                transform: [{ scale: starScale }],
              },
            ]}
          >
            <Icon name="star" size={8} color={COLORS.primaryLight} />
          </Animated.View>
        ))}
      </View>

      {/* Header */}
      <LinearGradient
        colors={COLORS.primaryGradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Creative Studio Booking
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Icon name="palette" size={22} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Main Content */}
        <Animated.View
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { translateY: slideUpAnim }],
            },
          ]}
        >
          {/* Animated Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [
                  { rotate },
                  { translateY: bounce },
                  { scale: pulseAnim },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={COLORS.primaryGradient}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Icon name="brush" size={60} color="#fff" />
            </LinearGradient>
          </Animated.View>

          {/* Coming Soon Text */}
          <Text style={styles.comingSoon}>Coming Soon</Text>

          {/* Creative Studio Title */}
          <Text style={styles.studioTitle}>Creative Studio</Text>

          {/* Description */}
          <Text style={styles.description}>
            We're crafting a magical space for your creativity to flourish
          </Text>

          {/* Features Grid */}
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <LinearGradient
                colors={[COLORS.primarySoft, '#fff']}
                style={styles.featureIcon}
              >
                <Icon name="brush" size={24} color={COLORS.primary} />
              </LinearGradient>
              <Text style={styles.featureText}>Art Studio</Text>
            </View>

            <View style={styles.featureItem}>
              <LinearGradient
                colors={[COLORS.primarySoft, '#fff']}
                style={styles.featureIcon}
              >
                <Icon name="camera" size={24} color={COLORS.primary} />
              </LinearGradient>
              <Text style={styles.featureText}>Photo Studio</Text>
            </View>

            <View style={styles.featureItem}>
              <LinearGradient
                colors={[COLORS.primarySoft, '#fff']}
                style={styles.featureIcon}
              >
                <Icon name="microphone" size={24} color={COLORS.primary} />
              </LinearGradient>
              <Text style={styles.featureText}>Recording</Text>
            </View>

            <View style={styles.featureItem}>
              <LinearGradient
                colors={[COLORS.primarySoft, '#fff']}
                style={styles.featureIcon}
              >
                <Icon name="lightbulb" size={24} color={COLORS.primary} />
              </LinearGradient>
              <Text style={styles.featureText}>Workshop Space</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={COLORS.primaryGradient}
                style={styles.progressFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            <Text style={styles.progressText}>75% Ready</Text>
          </View>

          {/* Launch Date */}
          <View style={styles.launchContainer}>
            <Icon name="calendar-clock" size={16} color={COLORS.primary} />
            <Text style={styles.launchText}>Expected Launch: soon</Text>
          </View>
        </Animated.View>

        {/* Floating Elements */}
        <Animated.View style={[styles.floatingElement1, { opacity: fadeAnim }]}>
          <Icon name="palette-swatch" size={32} color={COLORS.primaryLight} />
        </Animated.View>

        <Animated.View style={[styles.floatingElement2, { opacity: fadeAnim }]}>
          <Icon name="pencil" size={28} color={COLORS.primaryLight} />
        </Animated.View>

        <Animated.View style={[styles.floatingElement3, { opacity: fadeAnim }]}>
          <Icon name="ruler-square" size={30} color={COLORS.primaryLight} />
        </Animated.View>

        <Animated.View style={[styles.floatingElement4, { opacity: fadeAnim }]}>
          <Icon name="palette-outline" size={34} color={COLORS.primaryLight} />
        </Animated.View>

        <Animated.View style={[styles.floatingElement5, { opacity: fadeAnim }]}>
          <Icon name="drawing" size={26} color={COLORS.primaryLight} />
        </Animated.View>
      </View>

      {/* Notify Button */}
      <Animated.View style={[styles.footer, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        <TouchableOpacity
          style={styles.notifyButton}
          activeOpacity={0.8}
          onPress={() => Alert.alert('Notify Me', 'You will be notified when the Creative Studio is ready!')}
        >
          <LinearGradient
            colors={COLORS.primaryGradient}
            style={styles.notifyButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Icon name="bell-ring" size={18} color="#fff" />
            <Text style={styles.notifyButtonText}>Notify Me When Available</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 45,
    paddingBottom: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 2,
  },
  starsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  star: {
    position: 'absolute',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  comingSoon: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 8,
    textShadowColor: 'rgba(139, 92, 246, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 8,
  },
  studioTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    letterSpacing: 1,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  featureItem: {
    alignItems: 'center',
    width: '40%',
    marginBottom: 16,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    width: '75%',
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  launchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  launchText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  floatingElement1: {
    position: 'absolute',
    top: '15%',
    right: '10%',
    zIndex: 1,
    opacity: 0.6,
  },
  floatingElement2: {
    position: 'absolute',
    bottom: '20%',
    left: '8%',
    zIndex: 1,
    opacity: 0.6,
  },
  floatingElement3: {
    position: 'absolute',
    top: '30%',
    left: '12%',
    zIndex: 1,
    opacity: 0.6,
  },
  floatingElement4: {
    position: 'absolute',
    bottom: '35%',
    right: '15%',
    zIndex: 1,
    opacity: 0.6,
  },
  floatingElement5: {
    position: 'absolute',
    top: '60%',
    right: '20%',
    zIndex: 1,
    opacity: 0.6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    backgroundColor: 'transparent',
    zIndex: 3,
  },
  notifyButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  notifyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  notifyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default StudioBookingScreen;