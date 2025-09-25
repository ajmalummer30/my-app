import { useEffect, useState } from "react";
import { auth } from "./Firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function UserInfo() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    
    return () => unsubscribe();
  }, []);

  return user ? (
    <div>
      <p>Welcome, {user.displayName}</p>
      <img src={user.photoURL} alt="Profile" width={50} />
      <br />
      <button onClick={() => signOut(auth)}>Sign Out</button>
    </div>
  ) : (
    <p>User not signed in</p>
  );
}
