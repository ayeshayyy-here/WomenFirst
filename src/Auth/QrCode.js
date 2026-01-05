import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/FontAwesome';

// Get device dimensions for responsive sizing
const { width } = Dimensions.get('window');

const App = () => {
    const url = "https://play.google.com/store/apps/details?id=com.womenfirst";

  

    // const url = "  https://wwh.punjab.gov.pk/challan/5";
    return (
        <View style={styles.container}>
            {/* Title Section */}
            <Text style={styles.title}>Install the App</Text>

            {/* Subtitle Section */}
            <Text style={styles.subtitle}>Scan the QR code below to download and install the application from the Play Store.</Text>

            {/* QR Code */}
            <QRCode 
                value={url} 
                size={width * 0.6}
                color="#010048" 
                backgroundColor="#F8F9F9"
              
            />

            {/* Footer Section */}
            <Text style={styles.footer}>Women First</Text>
        </View>
    );
};

// Styling
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F3F4',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: width * 0.06,
        fontWeight: 'bold',
        color: '#010048',
        marginBottom: 10,
        position: 'absolute',
        top: 50,
    },
    subtitle: {
        fontSize: width * 0.04,
        color: '#5D6D7E',
        textAlign: 'center',
        marginBottom: 20,
        width: '80%',
        position: 'absolute',
        top: 100,
    },
    footer: {
        fontSize: width * 0.04,
        color: 'gray',
        position: 'absolute',
        bottom: 25,
        alignSelf: 'center',
        fontWeight: 'bold',
    },
});

export default App;
