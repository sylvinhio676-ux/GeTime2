importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBj3I899u7bLGdZrj6bStOJm84bkwzh2Bs",
  authDomain: "getime-24d32.firebaseapp.com",
  projectId: "getime-24d32",
  storageBucket: "getime-24d32.firebasestorage.app",
  messagingSenderId: "72737240210",
  appId: "1:72737240210:web:38a2f32c9a283b7a4a224b",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "Notification";
  const options = {
    body: payload?.notification?.body || "",
    data: payload?.data || {},
  };

  self.registration.showNotification(title, options);
});
