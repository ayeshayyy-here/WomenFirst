import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProgressBar = ({ step }) => {
  const icons = ['person', 'people', 'attach-file', 'assignment']; // Icons for each step

  return (
    <View style={styles.container}>
      {['Personal', 'Guardian', 'Attachments', 'Declaration'].map((label, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={[
            styles.circle, 
            step > index && styles.circleActive
          ]}>
            <Icon name={icons[index]} size={24} style={styles.icon} />
          </View>
          <Text style={[
            styles.label, 
            step > index && styles.labelActive
          ]}>{label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stepContainer: {
    alignItems: 'center',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#aaa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleActive: {
    borderColor: '#010048',
    backgroundColor: '#010048',
  },
  label: {
    marginTop: 5,
    color: '#aaa',
  },
  labelActive: {
    color: '#010048',
  },
  icon: {
    color: '#fff',
  }
});

export default ProgressBar;
