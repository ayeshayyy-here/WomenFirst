import notifee, { AndroidImportance } from '@notifee/react-native';

const FAP_API = 'https://fa-wdd.punjab.gov.pk/api/fapnotification/';
const YPC_API = 'https://ypc-wdd.punjab.gov.pk/api/ypcnotification/';

// Helper: safely parse JSON
function safeJsonParse(text) {
  try {
    const parsed = JSON.parse(text);
    console.log('✅ Parsed JSON successfully:', parsed);
    return parsed;
  } catch (err) {
    console.log('⚠️ JSON parse failed. Returning as plain text:', text);
    return { message: text, header: 'Notification' };
  }
}

// Helper: show push notification in top tray
async function showNotification(header, message) {
  console.log('🔔 Showing notification:', { header, message });

  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
    importance: AndroidImportance.HIGH,
  });

  await notifee.displayNotification({
    title: header || 'Alert',
    body: message || 'No message content',
    android: {
      channelId,
      smallIcon: 'ic_launcher', // your app icon name
      pressAction: { id: 'default' },
    },
  });
}

// Main function to fetch + display
export async function fetchAndShowNotifications(cnic) {
  console.log('🚀 Fetching notifications for CNIC:', cnic);

  try {
    // -------- FAP API --------
    console.log('🌐 Fetching FAP notification from:', `${FAP_API}${cnic}`);
    const fapRes = await fetch(`${FAP_API}${cnic}`);
    const fapText = await fapRes.text();
    console.log('📦 FAP raw response:', fapText);

    const fapData = safeJsonParse(fapText);

    // -------- YPC API --------
    console.log('🌐 Fetching YPC notification from:', `${YPC_API}${cnic}`);
    const ypcRes = await fetch(`${YPC_API}${cnic}`);
    const ypcText = await ypcRes.text();
    console.log('📦 YPC raw response:', ypcText);

    const ypcData = safeJsonParse(ypcText);

    // -------- Show notifications --------
    if (fapData?.message) {
      console.log('📲 Displaying FAP notification...');
      await showNotification(fapData.header, fapData.message);
    } else {
      console.log('❌ No valid FAP notification found.');
    }

    if (ypcData?.message) {
      console.log('📲 Displaying YPC notification...');
      await showNotification(ypcData.header, ypcData.message);
    } else {
      console.log('❌ No valid YPC notification found.');
    }

    console.log('✅ Notifications handled successfully.');
    return [fapData, ypcData];

  } catch (error) {
    console.log('💥 Notification fetch error:', error);
    return [];
  }
}
