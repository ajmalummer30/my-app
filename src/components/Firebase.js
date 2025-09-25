// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiuBQce0rIxW4XRTlyhCvg8Oftj-STWoI",
  authDomain: "visitor-management-f46e8.firebaseapp.com",
  projectId: "visitor-management-f46e8",
  storageBucket: "visitor-management-f46e8.firebasestorage.app",
  messagingSenderId: "1073869558746",
  appId: "1:1073869558746:web:b89d35cb8982a599ffa6e3",
  measurementId: "G-WB0W4WYFY8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();


export const db = getFirestore(app);

export { auth, provider };