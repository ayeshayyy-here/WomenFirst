import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import syncStorage from 'react-native-sync-storage';
import LinearGradient from 'react-native-linear-gradient';
import Loader from '../components/Loader';
import { useNavigation } from '@react-navigation/native';
const ComplaintsM = () => {
    const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icons mapping for each category
  const categoryIcons = {
    'Room Complaint': 'hotel',
    'Mess Complaint': 'restaurant',
    'Payment Complaint': 'payment',
    'Complaint w.r.t Visitor': 'people',
    'Timing Complaint': 'access-time',
    'Cleanliness Complaint': 'cleaning-services',
    'Requests': 'mark-email-read',
    'HR Complaint': 'work'
  };

  const fetchData = async () => {
    try {
      // 1. Fetch categories from first API
      const categoriesResponse = await fetch(
        'https://complaint-swbm-mis.punjab.gov.pk/api/hostelcategories',
        {
          headers: {
            'secret': 'w5qOiuGbvehTk0llZAMabt2uGFmPTUFJFwa8ibI96kShKBqOMS2Pgikx0wEbvIx8'
          }
        }
      );

      if (!categoriesResponse.ok) {
        throw new Error(`HTTP error! status: ${categoriesResponse.status}`);
      }

      const categoriesData = await categoriesResponse.json();
      console.log('Categories API Response:', JSON.stringify(categoriesData, null, 2));
      setCategories(categoriesData.categories);

      const user = JSON.parse(syncStorage.get('user'));
      if (!user.institute || !user.district) {
        throw new Error('User institute or district missing');
      }

      console.log('User Data:', user);

      // 3. Fetch counts for each category
      const countsPromises = categoriesData.categories.map(async (cat) => {
        const countResponse = await fetch(
          `https://complaint-swbm-mis.punjab.gov.pk/api/catgeoriescounts/${cat.id}/${user.institute}/${user.district}`,
          {
            headers: {
              'secret': 'w5qOiuGbvehTk0llZAMabt2uGFmPTUFJFwa8ibI96kShKBqOMS2Pgikx0wEbvIx8'
            }
          }
        );

        if (!countResponse.ok) {
          console.error(`Failed to fetch counts for category ${cat.id}`);
          return {
            category: cat.name,
            id: cat.id,
            count: { resolved: 0, pending: 0, total: 0 }
          };
        }

        const countData = await countResponse.json();
        console.log(`Counts API Response for ${cat.name}:`, JSON.stringify(countData, null, 2));
        
        // Extract the first item from categories_count array
        const counts = countData.categories_count?.[0] || { resolved: 0, pending: 0, total: 0 };
        
        return {
          category: cat.name,
          id: cat.id,
          count: {
            resolved: counts.resolved || 0,
            pending: counts.pending || 0,
            total: counts.total || 0
          }
        };
      });

      const counts = await Promise.all(countsPromises);
      setCategoryCounts(counts);
      setLoading(false);

    } catch (error) {
      console.error('Error in fetchData:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <View>
        {loading && <Loader />} 
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>COMPLAINTS</Text>
      </View>

      {/* Categories List */}
      {categoryCounts.map((item, index) => (
  <View key={index} style={styles.card}>
    {/* Top colored header section */}
    <LinearGradient
      colors={['#020035', '#020035']}
      style={styles.cardHeader}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
    >
      <View style={styles.categoryTitleContainer}>
        <Text style={styles.categoryName}>{item.category.toUpperCase()}</Text>
        <Text style={styles.categorySubtitle}>COMPLAINT CATEGORY</Text>
      </View>
    </LinearGradient>

    {/* Floating centered icon */}
    <View style={styles.iconContainer}>
      <LinearGradient
        colors={['#020035', '#020035']}
        style={styles.categoryIcon}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
      >
        <Icon 
          name={categoryIcons[item.category] || 'error'} 
          size={24} 
          color="#fff" 
        />
      </LinearGradient>
    </View>

    {/* Bottom white body section */}
    <View style={styles.cardBody}>
      {/* Stats Row with divider */}
      <View style={styles.statsContainer}>
        {/* Pending Column */}
        <TouchableOpacity 
          style={({pressed}) => [
            styles.statColumn,
            pressed && styles.statColumnPressed
          ]}
          onPress={() => navigation.navigate('Complaintspending', { categoryId: item.id })}
        >
          <Text style={styles.statLabel}>PENDING</Text>
          <Text style={[styles.statValue, styles.pendingValue]}>
            {item.count.pending}
          </Text>
        </TouchableOpacity>

        {/* Resolved Column */}
        <TouchableOpacity 
          style={({pressed}) => [
            styles.statColumn,
            pressed && styles.statColumnPressed
          ]}
          onPress={() => navigation.navigate('Complaintsresolved', { categoryId: item.id })}
        >
          <Text style={styles.statLabel}>RESOLVED</Text>
          <Text style={[styles.statValue, styles.resolvedValue]}>
            {item.count.resolved}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>

))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Lighter background for better contrast
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    color: '#020035',
    fontSize: 16,
    fontWeight: '500',
  },
  errorText: {
    color: '#DC2626', // More vibrant error color
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#020035',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    elevation: 2,
  },
  retryText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  headerContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  header: {
    textAlign: 'center',
    fontSize: 18, // Slightly larger
    fontWeight: '800', // Bolder
    color: '#020035',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // More rounded corners
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeader: {
    backgroundColor: '#020035',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  cardBody: {
    padding: 20,
    paddingTop: 28, // Extra space for the centered icon
  },
  categoryTitleContainer: {
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  categorySubtitle: {
    fontSize: 8,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 1.2,
  },
  iconContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: 60, // Half outside the card
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 15,
  
    borderTopColor: '#F1F5F9',
  },
  statColumn: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: '48%',
    backgroundColor: '#F8FAFC',
  },
  statColumnPressed: {
    backgroundColor: '#EDF2F7',
    transform: [{ scale: 0.98 }],
  },
  statTouchable: {
    alignItems: 'center',
    width: '100%',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#020035',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  pendingValue: {
    color: '#DC2626', // More vibrant red
  },
  resolvedValue: {
    color: '#16A34A', // More vibrant green
  },
});

export default ComplaintsM;