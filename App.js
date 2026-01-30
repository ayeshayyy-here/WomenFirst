import React, {useEffect, useState} from 'react';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { StyleSheet} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FloatingButton from './src/components/FloatingButton'

import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import Login from './src/Auth/Login';
import Register from './src/Auth/Register';
import Dashboard from './src/Auth/Dashboard';
import DashboardWDD from './src/Auth/DashboardWDD';
import DashboardA from './src/Admin/DashboardA';
import DashboardM from './src/Manager/DashboardM';
import FormP from './src/Auth/FormPersonalinfo';
import FormG from './src/Auth/FormGuardian';
import FormA from './src/Auth/FormAttatchments';
import FormD from './src/Auth/FormDeclaration';
import CompletedFormA from './src/Auth/CompletedFormA';
import CompletedFormP from './src/Auth/CompletedFormP';
import CompletedFormG from './src/Auth/CompletedFormG';
import CompletedFormD from './src/Auth/CompletedFormD';
import ComplaintForm from './src/Auth/ComplaintForm';
import ComplaintLogs from './src/Auth/ComplaintLogs';
import ComplaintViewDetail from './src/Auth/ComplaintViewDetail';
import Attendance from './src/Auth/Attendance';
import Edit from './src/Auth/Edit';
import Discharge from './src/Auth/Discharge';
import Rooms from './src/Auth/Rooms';
import VisitorGuest from './src/Auth/VisitorGuest';
import EditRooms from './src/Auth/EditRooms';
import ConfirmationScreen from './src/Auth/ConfirmationScreen';
import WorkingWomenHostelScreen from './src/Auth/WorkingWomenHostelScreen';
import HostelManagerScreen from './src/Auth/HostelManagerScreen';
import RoomsM from './src/Manager/RoomsM';
import Report from './src/Manager/Report';
import HostelRegistration from './src/Manager/HostelRegistration';
import PendingApplication from './src/Manager/PendingApplication';
import AppRejApplication from './src/Manager/AppRejApplication';
import ApplicationCount from './src/Manager/ApplicationCount';
import RegistrationCount from './src/Manager/RegistrationCount';
import ProfileP from './src/Manager/ProfileP';
import AttendanceHistory from './src/Auth/AttendanceHistory';
import MarkAttendance from './src/Auth/MarkAttendance';
import AddRooms from './src/Manager/AddRooms';
import RequestDetails from './src/Manager/RequestDetails';
import RoomsList from './src/Manager/RoomsList';
import VisitorGuestM from './src/Manager/VisitorGuestM';
import Attendanceperson from './src/Manager/Attendanceperson';
import Loginperson from './src/Manager/Loginperson';
import LoginDetails from './src/Manager/LoginDetails';
import Attendancereport from './src/Manager/Attendancereport';
import UpdationHistory from './src/Auth/UpdationHistory';
import LoginActivity from './src/Auth/LoginActivity';
import { checkForUpdate } from './src/utils/VersionChecker';
import QrCode from './src/Auth/QrCode';
import DashboardDeo from './src/Deo/DashboardDeo';
import GenerateChalan from './src/Deo/GenerateChalan';
import PaidChalan from './src/Deo/PaidChalan';
import HistoryChalan from './src/Deo/HistoryChalan';
import GeneratePostChallan from './src/Deo/GeneratePostChallan';
import PaymentChallan from './src/Deo/PaymentChallan';
import EditPostedChallan from './src/Deo/EditPostedChallan';
import Payments from './src/Auth/Payments';
import Editgcnic from './src/Auth/Editgcnic';
import EditDis from './src/Auth/EditDis';
import EditAppointment from './src/Auth/EditAppointment';
import UpdateInformation from './src/Manager/UpdateInformation';
import UpdateAction from './src/Manager/UpdateAction';
import RoomRequests from './src/Manager/RoomRequests';
import ChangeRooms from './src/Manager/ChangeRooms';
import DischargeM from './src/Manager/DischargeM';
import ComplaintsM from './src/Manager/ComplaintsM';
import Complaintsresolved from './src/Manager/Complaintsresolved';
import Complaintspending from './src/Manager/Complaintspending';
import ComplaintDetail from './src/Manager/ComplaintDetail';
import EditExpelledScreen from './src/Manager/EditExpelledScreen';
import ExpelledHomeScreen from './src/Manager/ExpelledHomeScreen';
//Centralized Users 
import LoginC from './src/CentralizedUsers/LoginC';
import RegisterC from './src/CentralizedUsers/RegisterC';
import ProfileScreen from './src/CentralizedUsers/ProfileScreen';
import ImportCentralizedUsers from './src/CentralizedUsers/ImportCentralizedUsers';
import FPImageStore from './src/CentralizedUsers/FPImageStore';
import ProjectDateScreen from './src/CentralizedUsers/ProjectDateScreen';

// WomenExpo
import WomenEntrepreneurshipRegistrationScreen from './src/WomenExpo/WomenEntrepreneurshipRegistrationScreen';
// WomenAmbassador
import WomenAmbassadorRegistrationScreen from './src/WomenAmbassador/WomenAmbassadorRegistrationScreen';
import AmbassadorTrackingScreen from './src/WomenAmbassador/AmbassadorTrackingScreen';
import OperationExectiveTrackingScreen from './src/WomenAmbassador/OperationExectiveTrackingScreen';
import ActivityCalendarScreen from './src/WomenAmbassador/ActivityCalendarScreen';
import ActivitiesMonitoringScreen from './src/WomenAmbassador/ActivitiesMonitoringScreen';
import AccountsDetailsScreen from './src/WomenAmbassador/AccountsDetailsScreen';
import AmbassadorHomeScreen from './src/WomenAmbassador/AmbassadorHomeScreen';
// YouthPitchRegistrationScreen
import YouthPitchRegistrationScreen from './src/YouthPitch/YouthPitchRegistrationScreen';
import ProfileTrackingScreenYPC from './src/YouthPitch/ProfileTrackingScreenYPC';
import YPCHomeScreen from './src/YouthPitch/YPCHomeScreen';
// SEHR
import SEHRHomeScreen from './src/SEHR/SEHRHomeScreen';
import BeauticianRegistrationForm from './src/SEHR/BeauticianRegistrationForm';
import HospitalityRegistrationForm from './src/SEHR/HospitalityRegistrationForm';
import DigitalSkillsRegistrationForm from './src/SEHR/DigitalSkillsRegistrationForm';
import BeauticianTracking from './src/SEHR/BeauticianTracking';
import HospitalityTracking from './src/SEHR/HospitalityTracking';
import DigitalSkillsTracking from './src/SEHR/DigitalSkillsTracking';

import { fetchAndShowNotifications } from './src/utils/notificationHandler';
import NotificationsScreen from './src/components/NotificationsScreen'
import SessionChecker from './src/utils/SessionChecker';
import syncStorage from 'react-native-sync-storage';


import Personal from './src/HostelRegForm/Personal';
import Employment from './src/HostelRegForm/Employment';
import Hostel from './src/HostelRegForm/Hostel';
import Documents from './src/HostelRegForm/Documents';
import Declarations from './src/HostelRegForm/Declarations';
const Stack = createNativeStackNavigator();
const App = () => {
  useEffect(() => {
    SplashScreen.hide();
    checkForUpdate();
  }, []);
  return (
    
    <NavigationContainer>
    <Stack.Navigator
      initialRouteName="SessionChecker"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="SessionChecker" component={SessionChecker} />
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          headerShown: false,
          headerStyle: {backgroundColor: '#CD1D0C'},
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen
        name="Register"
        component={Register}
        // options={{
        //   headerShown: true,
        //   headerStyle: {backgroundColor: '#CD1D0C'},
        //   headerTintColor: 'white',
        // }}
      />

      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="DashboardWDD" component={DashboardWDD} />
      <Stack.Screen name="DashboardA" component={DashboardA} />
      <Stack.Screen name="DashboardM" component={DashboardM} />
      <Stack.Screen name="FormP" component={FormP} />
      <Stack.Screen name="FormG" component={FormG} />
      <Stack.Screen name="FormA" component={FormA} />
      <Stack.Screen name="FormD" component={FormD} />
      <Stack.Screen name="QrCode" component={QrCode} />
      <Stack.Screen name="Edit" component={Edit} />
      <Stack.Screen name="CompletedFormP" component={CompletedFormP} />
      <Stack.Screen name="CompletedFormG" component={CompletedFormG} />
      <Stack.Screen name="CompletedFormA" component={CompletedFormA} />
      <Stack.Screen name="CompletedFormD" component={CompletedFormD} />
      <Stack.Screen name="Attendance" component={Attendance} />
      <Stack.Screen name="ComplaintForm" component={ComplaintForm} />
      <Stack.Screen name="ComplaintLogs" component={ComplaintLogs} />
      <Stack.Screen name="ComplaintViewDetail" component={ComplaintViewDetail} />
      <Stack.Screen name="MarkAttendance" component={MarkAttendance} />
      <Stack.Screen name="AttendanceHistory" component={AttendanceHistory} />
      <Stack.Screen name="ConfirmationScreen" component={ConfirmationScreen} />
      <Stack.Screen name="Rooms" component={Rooms} />
      <Stack.Screen name="VisitorGuest" component={VisitorGuest} />
      <Stack.Screen name="VisitorGuestM" component={VisitorGuestM} />
      <Stack.Screen name="EditRooms" component={EditRooms} />
      <Stack.Screen name="ProfileP" component={ProfileP} />
      <Stack.Screen name="AddRooms" component={AddRooms} />
      <Stack.Screen name="RequestDetails" component={RequestDetails} />
      <Stack.Screen name="RoomsList" component={RoomsList} />
      <Stack.Screen name="RoomsM" component={RoomsM} />
      <Stack.Screen name="Report" component={Report} />
      <Stack.Screen name="HostelRegistration" component={HostelRegistration} />
      <Stack.Screen name="PendingApplication" component={PendingApplication} />
      <Stack.Screen name="AppRejApplication" component={AppRejApplication} />
      <Stack.Screen name="RegistrationCount" component={RegistrationCount} />   
      <Stack.Screen name="ApplicationCount" component={ApplicationCount} />   
      <Stack.Screen name="FloatingButton" component={FloatingButton}/>
      <Stack.Screen name="Attendanceperson" component={Attendanceperson}/>
      <Stack.Screen name="Loginperson" component={Loginperson}/>
      <Stack.Screen name="LoginDetails" component={LoginDetails}/>
      <Stack.Screen name="Attendancereport" component={Attendancereport}/>
      <Stack.Screen name="Discharge" component={Discharge}/>
      <Stack.Screen name="UpdationHistory" component={UpdationHistory}/>
      <Stack.Screen name="LoginActivity" component={LoginActivity}/>
      <Stack.Screen name="DashboardDeo" component={DashboardDeo} />
      <Stack.Screen name="GenerateChalan" component={GenerateChalan} />
      <Stack.Screen name="PaidChalan" component={PaidChalan} />
      <Stack.Screen name="HistoryChalan" component={HistoryChalan} />
      <Stack.Screen name="GeneratePostChallan" component={GeneratePostChallan} />
      <Stack.Screen name="PaymentChallan" component={PaymentChallan} />
      <Stack.Screen name="EditPostedChallan" component={EditPostedChallan} />
      <Stack.Screen name="Payments" component={Payments} />
      <Stack.Screen name="Editgcnic" component={Editgcnic} />
      <Stack.Screen name="EditDis" component={EditDis} />
      <Stack.Screen name="EditAppointment" component={EditAppointment} />
      <Stack.Screen name="UpdateInformation" component={UpdateInformation} />
      <Stack.Screen name="UpdateAction" component={UpdateAction} />
      <Stack.Screen name="RoomRequests" component={RoomRequests} />
      <Stack.Screen name="ChangeRooms" component={ChangeRooms} />
      <Stack.Screen name="DischargeM" component={DischargeM} />
      <Stack.Screen name="ComplaintsM" component={ComplaintsM} />
      <Stack.Screen name="Complaintspending" component={Complaintspending} />
      <Stack.Screen name="Complaintsresolved" component={Complaintsresolved} />
      <Stack.Screen name="ComplaintDetail" component={ComplaintDetail} />
      <Stack.Screen name="ExpelledHomeScreen" component={ExpelledHomeScreen} />
      <Stack.Screen name="EditExpelledScreen" component={EditExpelledScreen} />
      {/* //WomenExpo */}
      <Stack.Screen name="WomenEntrepreneurshipRegistrationScreen" component={WomenEntrepreneurshipRegistrationScreen} />
      {/* //WomenAmbassador */}
      <Stack.Screen name="WomenAmbassadorRegistrationScreen" component={WomenAmbassadorRegistrationScreen} />
      <Stack.Screen name="AmbassadorTrackingScreen" component={AmbassadorTrackingScreen} />
      <Stack.Screen name="OperationExectiveTrackingScreen" component={OperationExectiveTrackingScreen} />
      <Stack.Screen name="ActivityCalendarScreen" component={ActivityCalendarScreen} />
       <Stack.Screen name="ActivitiesMonitoringScreen" component={ActivitiesMonitoringScreen} />
      <Stack.Screen name="AccountsDetailsScreen" component={AccountsDetailsScreen} />
       <Stack.Screen name="AmbassadorHomeScreen" component={AmbassadorHomeScreen} />
{/* YouthPitchRegistrationScreen */}
      <Stack.Screen name="YouthPitchRegistrationScreen" component={YouthPitchRegistrationScreen} />
      <Stack.Screen name="ProfileTrackingScreenYPC" component={ProfileTrackingScreenYPC} />
      <Stack.Screen name="YPCHomeScreen" component={YPCHomeScreen} />
      {/* SEHR */}
      <Stack.Screen name="SEHRHomeScreen" component={SEHRHomeScreen} />
      <Stack.Screen name="BeauticianRegistrationForm" component={BeauticianRegistrationForm} />
      <Stack.Screen name="HospitalityRegistrationForm" component={HospitalityRegistrationForm} />
      <Stack.Screen name="DigitalSkillsRegistrationForm" component={DigitalSkillsRegistrationForm} />
      <Stack.Screen name="BeauticianTracking" component={BeauticianTracking} />
      <Stack.Screen name="HospitalityTracking" component={HospitalityTracking} />
      <Stack.Screen name="DigitalSkillsTracking" component={DigitalSkillsTracking} />



      {/* //CentralizedLogins */}
      <Stack.Screen name="LoginC" component={LoginC} />
      <Stack.Screen name="RegisterC" component={RegisterC} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="WorkingWomenHostelScreen" component={WorkingWomenHostelScreen} />
      <Stack.Screen name="HostelManagerScreen" component={HostelManagerScreen} />
      <Stack.Screen name="ImportCentralizedUsers" component={ImportCentralizedUsers} />
      <Stack.Screen name="FPImageStore" component={FPImageStore} />
      <Stack.Screen name="ProjectDateScreen" component={ProjectDateScreen} />
{/* notification screen */}
    <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />


    {/* HostelRegistrationForm */}
    <Stack.Screen name="Personal" component={Personal} />
    <Stack.Screen name="Employment" component={Employment} />
    <Stack.Screen name="Hostel" component={Hostel} />
    <Stack.Screen name="Documents" component={Documents} />
    <Stack.Screen name="Declarations" component={Declarations} />
    </Stack.Navigator>
  </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  signOutButton: {
    position: 'absolute',
    bottom: 70, // Adjust as needed to position above the tab bar
    right: 20, // Adjust as needed for your desired horizontal position
    backgroundColor: '#03A9F4',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'gray',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    position: 'relative',
  },
  iconWrapper: {
    position: 'absolute',
    top: -30,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 5,
    borderWidth: 1,
    borderColor: 'white',
  },
  iconContainer: {
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 30,
    color: 'black',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: 'black',
    textAlign: 'center',
  },
  buttonRow: {
    width: '100%',
  },
  modalOption: {
    alignItems: 'center',
    backgroundColor: 'green',
    paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  modalOptionText: {
    fontSize: 16,
    color: 'white',
  },
  modalCancel: {
    alignItems: 'center',
    backgroundColor: 'gray',
    paddingVertical: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: '100%',
  },
  modalCancelText: {
    color: 'white',
    fontSize: 16,
  },
});

export default App;
