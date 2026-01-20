import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";
import api from "../api";

export async function registerPushToken() {
  if (!("Notification" in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

  const token = await getToken(messaging, { vapidKey });
  if (!token) return;

  // Envoi au backend
  await api.post("/device-token", { token, platform: "web" });

  // Listener quand l’app est ouverte
  onMessage(messaging, (payload) => {
    // Option: afficher toast
    console.log("FCM foreground message:", payload);
  });
}
