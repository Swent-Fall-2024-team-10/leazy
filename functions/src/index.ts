import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

export const sendNotificationOnTime = onDocumentCreated(
  "notifications/{notificationId}",
  async (event) => {
    const notificationData = event.data?.data();
    if (!notificationData) {
      console.log("No notification data found.");
      return null;
    }

    const { userId } = notificationData;

    // Fetch the user's FCM token from Firestore
    const userSnapshot = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    const userToken = userSnapshot.data()?.fcmToken;

    if (!userToken) {
      console.log(`No FCM token for user ${userId}`);
      return null;
    }

    const payload = {
      notification: {
        title: "Laundry Reminder",
        body: "Your laundry machine cycle will complete in 3 minutes!",
      },
    };

    await admin.messaging().sendToDevice(userToken, payload);
    console.log(`Notification sent to user ${userId}`);

    // Delete the notification document after sending
    // to prevent duplicate notifications
    await event.data?.ref.delete();
    return null;
  }
);
