import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import api from "../api";

export async function registerPushToken() {
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) return;

  await api.post("/device-token", { token, platform: "web" });

  onMessage(messaging, (payload) => {
    console.log("FCM foreground message:", payload);
  });
}
