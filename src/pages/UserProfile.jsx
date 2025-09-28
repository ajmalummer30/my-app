import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../components/Firebase";
import { useAtomValue } from "jotai";
import { userAtom } from "../store/AuthAtom";
import { useNavigate } from "react-router-dom";
import { PaperClipIcon } from "@heroicons/react/20/solid";

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
      <div>
        {/* Progress bar section */}

        <div className="px-4 sm:px-0">
          <h3 className="text-base/7 font-semibold text-gray-900 dark:text-white">
            User Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-500 dark:text-gray-400">
            Personal details and application.
          </p>
        </div>
        <div className="mt-6 border-t border-gray-100 dark:border-white/10">
          <dl className="divide-y divide-gray-100 dark:divide-white/10">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                Full name
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">
                {profile.displayName}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                Employee ID
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">
                {profile.employee_id ? profile.employee_id : "Empty"}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                Email address
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">
                {profile.email}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                Station
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">
                {profile.station ? profile.station : "Empty"}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
              <dt className="text-sm/6 font-medium text-gray-900 dark:text-gray-100">
                Mobile
              </dt>
              <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0 dark:text-gray-400">
                {profile.mobile ? profile.mobile : "Empty"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <button
        onClick={() => navigate("/app/editprofile")}
        className="mt-4 rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Edit Profile
      </button>
      {/* Add more fields as needed */}
    </div>
  );
}
