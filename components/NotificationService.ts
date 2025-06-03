import PushNotification from 'react-native-push-notification';

const NOTIFICATION_ID = 777; // consistent ID to manage/remove notification

// Safely configure push notification
PushNotification.configure({
  onNotification: function (notification) {
    console.log('📬 Notification received:', notification);
  },
  popInitialNotification: true, // Optional: whether to automatically handle launch notification
  requestPermissions: true,
});

/**
 * Trigger a local notification about the nearest event
 */
export const notifyNearestEvent = (pin: {
  title: string;
  description: string;
  image?: string;
}) => {
  PushNotification.localNotification({
    id: `${NOTIFICATION_ID}`,
    title: `Nearby Event: ${pin.title}`,
    message: pin.description,
    playSound: true,
    soundName: 'default',
    bigPictureUrl: pin.image || undefined,
    importance: 'high',
    priority: 'high',
    visibility: 'public',
    ongoing: true, // Persistent banner until manually dismissed
  });
};

/**
 * Cancel any active nearest-event notification
 */
export const cancelNearestEventNotification = () => {
  PushNotification.cancelLocalNotifications({ id: `${NOTIFICATION_ID}` });
};
