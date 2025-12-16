// HeaderTabs.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// HeaderTabs Component
const HeaderTabs = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Pending');

  const handleTabPress = (tab) => {
    setActiveTab(tab); // Set the active tab state
    switch (tab) {
      case 'Pending':
        navigation.reset({
          index: 0,
          routes: [{ name: 'PendingApplication' }],
        });
        break;
      case 'Rejected':
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppRejApplication', params: { status: 'rejected' } }],
        });
        break;
      case 'Accepted':
        navigation.reset({
          index: 0,
          routes: [{ name: 'AppRejApplication', params: { status: 'accepted' } }],
        });
        break;
      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => handleTabPress('Pending')}
        style={[
          styles.tab,
          activeTab === 'Pending' ? styles.activeTab : styles.inactiveTab,
        ]}
      >
        <Text style={activeTab === 'Pending' ? styles.activeText : styles.inactiveText}>
          Pending
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleTabPress('Accepted')}
        style={[
          styles.tab,
          activeTab === 'Accepted' ? styles.activeTab : styles.inactiveTab,
        ]}
      >
        <Text style={activeTab === 'Accepted' ? styles.activeText : styles.inactiveText}>
          Accepted
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleTabPress('Rejected')}
        style={[
          styles.tab,
          activeTab === 'Rejected' ? styles.activeTab : styles.inactiveTab,
        ]}
      >
        <Text style={activeTab === 'Rejected' ? styles.activeText : styles.inactiveText}>
          Rejected
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#E0E0E0', // Active tab color
  },
  inactiveTab: {
    backgroundColor: '#E0E0E0', // Inactive tab color
  },
  activeText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default HeaderTabs;
