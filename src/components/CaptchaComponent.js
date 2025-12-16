import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const CaptchaComponent = ({ onCaptchaChange }) => {
  const [captchaCode, setCaptchaCode] = useState(generateCaptchaCode());
  const [userInput, setUserInput] = useState('');

  function generateCaptchaCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptchaCode());
    setUserInput('');
    onCaptchaChange(''); // Reset validation
  };

  const handleInputChange = (text) => {
    setUserInput(text);
    // Automatically validate as user types (or when they finish typing)
    if (text.length === 6) {
      onCaptchaChange(text.toUpperCase() === captchaCode);
    } else {
      onCaptchaChange(false);
    }
  };

  const renderCaptchaText = () => {
    return captchaCode.split('').map((char, index) => (
      <Text
        key={index}
        style={[
          styles.captchaChar,
          {
            transform: [
              { rotate: `${Math.random() * 30 - 15}deg` },
              { skewX: `${Math.random() * 20 - 10}deg` }
            ],
            left: 20 + index * 25,
            top: 10 + Math.sin(index) * 5,
            color: `rgb(${Math.floor(Math.random() * 100) + 50}, 
                    ${Math.floor(Math.random() * 100) + 50}, 
                    ${Math.floor(Math.random() * 100) + 50})`
          }
        ]}
      >
        {char}
      </Text>
    ));
  };

  return (
    <View style={styles.container}>
      <View style={styles.captchaContainer}>
        {renderCaptchaText()}
        {[...Array(8)].map((_, i) => (
          <View
            key={`line-${i}`}
            style={[
              styles.distortionLine,
              {
                top: Math.random() * 40,
                left: Math.random() * 100,
                width: Math.random() * 100 + 50,
                transform: [{ rotate: `${Math.random() * 60 - 30}deg` }],
                opacity: Math.random() * 0.5 + 0.3
              }
            ]}
          />
        ))}
      </View>
      
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Enter CAPTCHA"
          value={userInput}
          onChangeText={handleInputChange}
          autoCapitalize="characters"
          maxLength={6}
        />
        <TouchableOpacity onPress={refreshCaptcha} style={styles.refreshButton}>
          <Text>↻ Refresh</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ... keep the same styles as before ...
const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    width: '100%',
  },
  captchaContainer: {
    height: 60,
    backgroundColor: '#f5f5f5',
    marginBottom: 15,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  captchaChar: {
    position: 'absolute',
    fontSize: 28,
    fontWeight: 'bold',
  },
  distortionLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#777',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  refreshButton: {
    padding: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default CaptchaComponent;