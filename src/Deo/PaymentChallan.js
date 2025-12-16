import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ActivityIndicator, Modal, TouchableOpacity, ScrollView, Linking
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation, useRoute } from "@react-navigation/native";
import Loader from '../components/Loader';
const PaymentChallan = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchChallanData = async () => {
      try {
        const response = await fetch(`https://wwh.punjab.gov.pk/api/challan/${id}`);
        const result = await response.json();
        if (result.status === "success") {
          setData(result);
        } else {
          console.error("Failed to load challan");
        }
      } catch (error) {
        console.error("Error fetching challan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallanData();
  }, [id]);

  if (loading) {
    return  <Loader />;
    
  }

  if (!data) {
    return <Text style={styles.errorText}>Failed to load challan data</Text>;
  }

  const { username, district_name, remaining, institute_name, data: challan, status } = data;
  const qrValue = `https://wwh.punjab.gov.pk/challan/${challan.id}`;

  const issuedDate = new Date(challan.created_at);
  const dueDate = new Date(issuedDate);
  dueDate.setDate(issuedDate.getDate() + 4);
  const formattedDueDate = dueDate.toISOString().split("T")[0];

  return (
    <ScrollView contentContainerStyle={styles.container}>
  {challan.status === "Paid" && (
  <View style={styles.paidStampContainer}>
    <Text style={styles.paidStamp}>PAID</Text>
  </View>
)}


     
      
      <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.qrIconContainer}>
        <Icon name="qr-code" size={35} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>PAYMENT CHALLAN</Text>
      <Text style={styles.dateText}>
        Issued Date: {challan.created_at} | Due Date: {formattedDueDate}
      </Text>

      <View style={styles.infoContainer}>
        <View style={styles.infoColumn}>
          <Text style={styles.infoText}><Text style={styles.bold}>NAME:</Text> {username}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>District:</Text> {district_name}</Text>
        </View>
        <View style={styles.infoColumn}>
          <Text style={styles.infoText}><Text style={styles.bold}>Challan ID:</Text> {challan.psId}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Hostel:</Text> {institute_name}</Text>
        </View>
      </View>

      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.cellHeader}>Description</Text>
          <Text style={styles.cellHeader}>Amount (PKR)</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Room Rent</Text>
          <Text style={styles.cell}>{challan.room_rent}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Guest Charges</Text>
          <Text style={styles.cell}>{challan.guest_charges}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.cell}>Remaining</Text>
          <Text style={styles.cell}>{challan.remaining ?? '0'}</Text>

        </View>
      </View>

      <Text style={styles.totalAmount}>Total Amount: {challan.total} PKR</Text>
      <Text style={styles.note}>
        Please ensure that the total amount is paid by the due date to avoid late fees.
      </Text>

      <View style={styles.linksContainer}>
        <Text style={styles.link} onPress={() => Linking.openURL("https://wwh.punjab.gov.pk")}>Web Portal</Text>
        <Text style={styles.link} onPress={() => Linking.openURL("https://play.google.com/store/apps/details?id=com.workingwomenhostel&pcampaignid=web_share")}>Google Play Store</Text>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade">
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>
      <Text style={styles.modalTitle}>SCAN</Text>
      <QRCode value={qrValue} size={180} />
      <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
        <Icon name="close" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: "center" },
  paidLabel: { fontSize: 22, fontWeight: "bold", color: "green", marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", marginTop: 50, marginBottom: 20, color: '#010048' },
  dateText: { fontSize: 10, color: "gray", fontWeight: "bold" },
  infoContainer: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginVertical: 10 },
  infoColumn: { width: "48%" },
  infoText: { fontSize: 12, marginBottom: 5, marginTop: 10, color: '#010048' },
  bold: { fontWeight: "bold", fontSize: 12, color: '#010048' },
  qrIconContainer: { position: "absolute", top: 20, right: 20 },
  table: { width: "100%", borderWidth: 1, borderColor: "#010048", marginVertical: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderBottomWidth: 1, borderColor: "#ddd" },
  cellHeader: { fontSize: 14, fontWeight: "bold", color: '#010048' },
  cell: { fontSize: 14, color: '#010048' },
  totalAmount: { fontSize: 16, color: "maroon", fontWeight: "bold", marginVertical: 10, alignSelf: "flex-end" },
  note: { fontSize: 14, color: "#777", textAlign: "center", marginTop: 10, fontWeight: "bold" },
  linksContainer: { 
    position: "absolute", 
    bottom: 40, 
    left: 0, 
    right: 0, 
    flexDirection: "row", 
    justifyContent: "space-between", 
    paddingHorizontal: 20 
  },
  link: { 
    fontSize: 14, 
    color: "#010048", 
    textDecorationLine: "underline", 
    fontWeight: "bold" 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)", 
    justifyContent: "center",
    alignItems: "center",
  },
  
  modalBox: {
    backgroundColor: "#fff",
    width: 250,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#010048",
    marginBottom: 15,
  },
  
  closeButton: {
    marginTop: 20,
    backgroundColor: "#010048",
    borderRadius: 50,
    padding: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  paidStampContainer: {
    position: "absolute",
    top: "70%", // Adjusts position
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    backgroundColor: "rgba(0, 128, 0, 0.1)", // Light green transparent
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "#006400", // Dark Green Border
    elevation: 10, // Shadow for Android
    shadowColor: "#006400",
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    transform: [{ rotate: "-20deg" }], // Slight rotation for stamp effect
  },
  
  paidStamp: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#006400", // Dark Green
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    transform: [{ rotate: "-15deg" }], // Slight rotation for stamp effect
  },
  
  
});

export default PaymentChallan;
