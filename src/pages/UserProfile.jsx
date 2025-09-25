import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../components/Firebase";
import { useAtomValue } from "jotai";
import { userAtom } from "../store/AuthAtom";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const user = useAtomValue(userAtom); // get current logged in user from Jotai
   const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
   
      setLoading(true);
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setProfile(userSnap.data());
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return <div>Loading profile...</div>;
  }

  if (!profile) {
    return <div>User profile not found.</div>;
  }

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <p><strong>Name:</strong> {profile.displayName}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role}</p>
      <p>
        <strong>Admin Approved:</strong>{" "}
        {profile.isAdminApproved ? "Yes" : "No (Waiting for approval)"}
      </p>
      <button
 onClick={() => navigate("/app/profile")}
  className="mt-4 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
>
  Edit Profile
</button>
      {/* Add more fields as needed */}
    </div>
  );
}
