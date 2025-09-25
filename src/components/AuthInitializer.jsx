import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../components/Firebase';  // your Firebase config
import { useSetAtom } from 'jotai';
import { userAtom } from '../store/AuthAtom';

export default function AuthInitializer({ children }) {
  const setUser = useSetAtom(userAtom);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  return children;  // no UI rendered
}
