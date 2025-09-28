// src/helpers/authHelpers.js
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../components/Firebase";

export async function loginWithEmailPassword(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    let userData = {};
    if (userSnap.exists()) {
      userData = userSnap.data();
    }

    return { ...firebaseUser, ...userData };
  } catch (error) {
    throw error; // re-throw error for caller to handle
  }
}
