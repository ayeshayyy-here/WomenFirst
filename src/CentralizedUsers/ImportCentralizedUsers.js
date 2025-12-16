import React, { useState } from "react"; 
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import axios from "axios";

const ImportCentralizedUsers = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImport = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await axios.post("https://dashboard-wdd.punjab.gov.pk/api/import-centralized-users");
   
      console.log("Backend response:", response.data); // ✅ log backend response

      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.message || "Failed to import users");
      }
    } catch (err) {
      console.log("Error fetching:", err);
      setError("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Centralized Users Import</Text>

      <TouchableOpacity style={styles.button} onPress={handleImport} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Start Import</Text>
        )}
      </TouchableOpacity>

      <ScrollView style={styles.resultBox}>
        {error && <Text style={styles.errorText}>❌ {error}</Text>}

        {result && (
          <View>
            <Text style={styles.successText}>✅ {result.message}</Text>
            <View style={styles.card}>
              <Text style={styles.detailText}>Inserted: {result.message.match(/Inserted: (\d+)/)?.[1]}</Text>
              <Text style={styles.detailText}>Skipped: {result.message.match(/Skipped \(already existed\): (\d+)/)?.[1]}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ImportCentralizedUsers;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F7FA",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2C3E50",
  },
  button: {
    backgroundColor: "#3498DB",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultBox: {
    flex: 1,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  successText: {
    color: "#27AE60",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#2C3E50",
    marginVertical: 3,
  },
});
