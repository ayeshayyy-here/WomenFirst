import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Replace with your actual API base URL
const API_BASE_URL = 'https://dashboard-wdd.punjab.gov.pk/api';
const API = {
  projectDates: `${API_BASE_URL}/project-dates`,
};

// Configure axios
axios.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('[API Response Error]', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default function ProjectDateScreen() {
  const [project, setProject] = useState('');
  const [startingDate, setStartingDate] = useState(new Date());
  const [endingDate, setEndingDate] = useState(new Date());
  const [extendedDate, setExtendedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(null);
  const [records, setRecords] = useState([]);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      console.log('[SCREEN] Fetching records...');
      setLoading(true);
      setError(null);
      
      const response = await axios.get(API.projectDates);
      
      if (response.data.success) {
        setRecords(response.data.data);
        console.log(`[SCREEN] Successfully fetched ${response.data.data.length} records`);
      } else {
        throw new Error(response.data.message || 'Failed to fetch records');
      }
    } catch (err) {
      console.error('[SCREEN] Error fetching records:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch records');
      showAlert('Error', err.response?.data?.message || err.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    console.log('[SCREEN] Refreshing records...');
    setRefreshing(true);
    fetchRecords();
  };

  const validateForm = () => {
    if (!project.trim()) {
      showAlert('Validation Error', 'Project name is required');
      return false;
    }

    if (startingDate > endingDate) {
      showAlert('Validation Error', 'Starting date cannot be after ending date');
      return false;
    }

    if (extendedDate < endingDate) {
      showAlert('Validation Error', 'Extended date cannot be before ending date');
      return false;
    }

    return true;
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      console.log('[SCREEN] Submitting form...', {
        editId,
        project,
        startingDate: formatDateForAPI(startingDate),
        endingDate: formatDateForAPI(endingDate),
        extendedDate: formatDateForAPI(extendedDate),
      });

      setLoading(true);
      setError(null);

      const payload = {
        project: project.trim(),
        starting_date: formatDateForAPI(startingDate),
        ending_date: formatDateForAPI(endingDate),
        extended_date: formatDateForAPI(extendedDate),
      };

      let response;
      if (editId) {
        console.log(`[SCREEN] Updating record ID: ${editId}`);
        response = await axios.post(`${API.projectDates}/${editId}`, payload);
        setSuccessMessage('Record updated successfully!');
      } else {
        console.log('[SCREEN] Creating new record');
        response = await axios.post(API.projectDates, payload);
        setSuccessMessage('Record created successfully!');
      }

      if (response.data.success) {
        fetchRecords();
        resetForm();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err) {
      console.error('[SCREEN] Error submitting form:', err);
      
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.errors?.join?.('\n') || 
                      err.message || 
                      'Failed to save record';
      
      setError(errorMsg);
      showAlert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const editRecord = (item) => {
    console.log('[SCREEN] Editing record:', item);
    setEditId(item.id);
    setProject(item.project);
    setStartingDate(new Date(item.starting_date));
    setEndingDate(new Date(item.ending_date));
    setExtendedDate(item.extended_date ? new Date(item.extended_date) : new Date());
    
    // Scroll to top
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const confirmDelete = (id, projectName) => {
    console.log('[SCREEN] Confirming delete for record:', { id, projectName });
    setRecordToDelete({ id, projectName });
    setDeleteModalVisible(true);
  };

  const deleteRecord = async () => {
    if (!recordToDelete) return;

    try {
      console.log(`[SCREEN] Deleting record ID: ${recordToDelete.id}`);
      setLoading(true);
      
      const response = await axios.delete(`${API.projectDates}/${recordToDelete.id}`);
      
      if (response.data.success) {
        console.log(`[SCREEN] Successfully deleted record ID: ${recordToDelete.id}`);
        setSuccessMessage('Record deleted successfully!');
        fetchRecords();
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err) {
      console.error('[SCREEN] Error deleting record:', err);
      showAlert('Error', err.response?.data?.message || err.message || 'Failed to delete record');
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setRecordToDelete(null);
    }
  };

  const resetForm = () => {
    console.log('[SCREEN] Resetting form');
    setEditId(null);
    setProject('');
    setStartingDate(new Date());
    setEndingDate(new Date());
    setExtendedDate(new Date());
    setError(null);
  };

  const showAlert = (title, message) => {
    Alert.alert(
      title,
      message,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (endingDate, extendedDate) => {
    const today = new Date();
    const endDate = new Date(endingDate);
    const extDate = extendedDate ? new Date(extendedDate) : null;
    
    if (extDate && today > extDate) return '#dc2626'; // Red for overdue
    if (extDate) return '#ea580c'; // Orange for extended
    if (today > endDate) return '#dc2626'; // Red for overdue
    if (today <= endDate) return '#16a34a'; // Green for on track
    return '#6b7280'; // Gray for unknown
  };

  const getStatusText = (endingDate, extendedDate) => {
    const today = new Date();
    const endDate = new Date(endingDate);
    const extDate = extendedDate ? new Date(extendedDate) : null;
    
    if (extDate && today > extDate) return 'Overdue (Extended)';
    if (extDate) return 'Extended';
    if (today > endDate) return 'Overdue';
    if (today <= endDate) return 'On Track';
    return 'Unknown';
  };

  const renderDateButton = (type, date, label) => {
    const colors = {
      starting: '#3b82f6',
      ending: '#10b981',
      extended: '#f59e0b',
    };

    return (
      <TouchableOpacity
        style={[styles.dateButton, { borderColor: colors[type] }]}
        onPress={() => setShowPicker(type)}>
        <View style={styles.dateButtonContent}>
          <Icon name="calendar-today" size={16} color={colors[type]} />
          <Text style={[styles.dateButtonLabel, { color: colors[type] }]}>
            {label}
          </Text>
        </View>
        <Text style={styles.dateButtonText}>
          {formatDateForDisplay(formatDateForAPI(date))}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRecordItem = ({ item }) => {
    const statusColor = getStatusColor(item.ending_date, item.extended_date);
    const duration = calculateDuration(item.starting_date, item.ending_date);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.projectName}>{item.project}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {getStatusText(item.ending_date, item.extended_date)}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Icon name="play-arrow" size={14} color="#3b82f6" />
          <Text style={styles.dateLabel}>Start: </Text>
          <Text style={styles.dateValue}>
            {formatDateForDisplay(item.starting_date)}
          </Text>
        </View>

        <View style={styles.dateRow}>
          <Icon name="flag" size={14} color="#10b981" />
          <Text style={styles.dateLabel}>End: </Text>
          <Text style={styles.dateValue}>
            {formatDateForDisplay(item.ending_date)}
          </Text>
          <Text style={styles.durationText}>({duration} days)</Text>
        </View>

        {item.extended_date && (
          <View style={styles.dateRow}>
            <Icon name="extension" size={14} color="#f59e0b" />
            <Text style={styles.dateLabel}>Extended: </Text>
            <Text style={styles.dateValue}>
              {formatDateForDisplay(item.extended_date)}
            </Text>
          </View>
        )}

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => editRecord(item)}>
            <Icon name="edit" size={18} color="#3b82f6" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(item.id, item.project)}>
            <Icon name="delete" size={18} color="#dc2626" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.recordId}>ID: {item.id}</Text>
      </View>
    );
  };

  const scrollViewRef = React.useRef();

  if (loading && !refreshing && records.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading records...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Success Message */}
        {successMessage && (
          <View style={styles.successMessage}>
            <Icon name="check-circle" size={20} color="#16a34a" />
            <Text style={styles.successMessageText}>{successMessage}</Text>
          </View>
        )}

        {/* Error Message */}
        {error && (
          <View style={styles.errorMessage}>
            <Icon name="error" size={20} color="#dc2626" />
            <Text style={styles.errorMessageText}>{error}</Text>
          </View>
        )}

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>
            {editId ? '✏️ Edit Project Dates' : '➕ Create New Project Dates'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter project name"
            placeholderTextColor="#9ca3af"
            value={project}
            onChangeText={setProject}
            editable={!loading}
          />

          {renderDateButton('starting', startingDate, 'Starting Date')}
          {renderDateButton('ending', endingDate, 'Ending Date')}
          {renderDateButton('extended', extendedDate, 'Extended Date')}

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.submitButton, editId ? styles.updateButton : styles.createButton]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Icon 
                    name={editId ? "save" : "add-circle"} 
                    size={20} 
                    color="#ffffff" 
                  />
                  <Text style={styles.submitButtonText}>
                    {editId ? 'UPDATE RECORD' : 'SAVE RECORD'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {editId && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={resetForm}
                disabled={loading}>
                <Icon name="cancel" size={20} color="#6b7280" />
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Records Section */}
        <View style={styles.recordsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Project Records ({records.length})</Text>
            <TouchableOpacity onPress={fetchRecords} disabled={loading}>
              <Icon name="refresh" size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>

          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="folder-open" size={50} color="#9ca3af" />
              <Text style={styles.emptyStateText}>No project records found</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the refresh button or create a new record
              </Text>
            </View>
          ) : (
            <FlatList
              data={records}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderRecordItem}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </View>
      </ScrollView>

      {/* Date Picker */}
      {showPicker && (
        <DateTimePicker
          value={
            showPicker === 'starting'
              ? startingDate
              : showPicker === 'ending'
              ? endingDate
              : extendedDate
          }
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            setShowPicker(null);
            if (selectedDate) {
              const setter = {
                starting: setStartingDate,
                ending: setEndingDate,
                extended: setExtendedDate,
              }[showPicker];
              setter(selectedDate);
            }
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="warning" size={50} color="#dc2626" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Confirm Delete</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete "{recordToDelete?.projectName}"?
            </Text>
            <Text style={styles.modalWarning}>
              This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={() => setDeleteModalVisible(false)}>
                <Text style={styles.cancelModalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteModalButton]}
                onPress={deleteRecord}>
                <Text style={styles.deleteModalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  formSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  recordsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 24,
  },
  buttonGroup: {
    marginTop: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
  },
  createButton: {
    backgroundColor: '#10b981',
  },
  updateButton: {
    backgroundColor: '#3b82f6',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
    width: 70,
  },
  dateValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
    flex: 1,
  },
  durationText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 12,
  },
  editButtonText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  recordId: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'right',
  },
  listContent: {
    paddingBottom: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6b7280',
    },
});
