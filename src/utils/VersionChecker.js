// File: src/utils/VersionChecker.js

import VersionCheck from 'react-native-version-check';
import { Alert, Linking, BackHandler } from 'react-native';

export const checkForUpdate = async () => {
  try {
    // Check if update is needed
    const updateNeeded = await VersionCheck.needUpdate();

    // Log version details
    const latestVersion = await VersionCheck.getLatestVersion();
    const currentVersion = VersionCheck.getCurrentVersion();
    console.log('Latest Version:', latestVersion, 'Current Version:', currentVersion);

    if (updateNeeded && updateNeeded.isNeeded) {
      // Alert user to update
      Alert.alert(
        'Update Required',
        'We have launched a new and improved version. Please update the app for a better experience.',
        [
          {
            text: 'Update Now',
            onPress: () => {
              // Redirect to app store and exit app
              BackHandler.exitApp();
              Linking.openURL(updateNeeded.storeUrl);
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      console.log('No update needed');
    }
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
};
