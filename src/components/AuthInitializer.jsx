import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useSetAtom } from "jotai";
import { userAtom } from "../store/AuthAtom";

import { auth, db } from "../components/Firebase";

export default function AuthInitializer({ children }) {
  const setUser = useSetAtom(userAtom);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure persistence is set
    console.log("use effect from auth intiliser");
    (async () => {
      try {
        setUser(null);

        await setPersistence(auth, browserLocalPersistence);
      } catch (err) {
        console.error("Failed to set persistence", err);
      }
    })();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("🔥 Firebase user:", firebaseUser);
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const combined = { ...firebaseUser, ...data };
            setUser(combined);
            console.log("set user from authinitialiser");
          } else {
            setUser(firebaseUser);
          }
        } catch (err) {
          console.error("Error fetching user profile", err);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  if (loading) {
    // you can return a spinner or blank
    return null;
  }

  return children;
}
