import React, {useEffect} from 'react';
import { StyleSheet} from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { NavigationContainer } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';

import Login from './src/Auth/Login';
import Register from './src/Auth/Register';
import Dashboard from './src/Auth/Dashboard';
import FormP from './src/Auth/FormPersonalinfo';
import FormG from './src/Auth/FormGuardian';
import FormA from './src/Auth/FormAttatchments';
import FormD from './src/Auth/FormDeclaration';
const Stack = createNativeStackNavigator();
const App = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    
    <NavigationContainer>
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}>
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
      <Stack.Screen name="FormP" component={FormP} />
      <Stack.Screen name="FormG" component={FormG} />
      <Stack.Screen name="FormA" component={FormA} />
      <Stack.Screen name="FormD" component={FormD} />
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
