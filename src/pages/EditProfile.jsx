import { useAtom } from "jotai";
import { userAtom } from "../store/AuthAtom";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../components/Firebase";
import { PhotoIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { ChevronDownIcon } from "@heroicons/react/16/solid";
import { useAtomValue } from "jotai";
import { mobileAtom, mobileErrorAtom } from "../store/mobileAtom";
import { useMobileValidation } from "../validations/mobileValidation";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../components/Firebase"; // Make sure storage is exported from Firebase config
import clsx from "clsx";

// ProfileProgressBar component declared FIRST
export function ProfileProgressBar({ completeness }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
      <div
        className="bg-indigo-600 h-4 rounded-full transition-all duration-500"
        style={{ width: `${completeness}%` }}
      />
    </div>
  );
}

export default function EditProfile() {
  const requiredFields = [
    "firstName",
    "lastName",
    "email",
    "employee_id",
    //"displayName",
    "station",
    "mobile",
    //"photoURL", // <-- not "photo"
  ];

  const stations = [
    { id: "DMM", name: "Dammam" },
    { id: "RUH", name: "Riyadh" },
    { id: "JED", name: "Jeddah" },
  ];

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    employee_id: "",
    displayName: "",
    photo: "",
    // Note: station and mobile are handled via Jotai
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [station, setStation] = useState("");
  const [mobile, setMobile] = useAtom(mobileAtom);
  const mobileError = useAtomValue(mobileErrorAtom);
  const [user] = useAtom(userAtom);
  const handleMobileChange = useMobileValidation();
  const navigate = useNavigate();
  const [complete, setComplete] = useState(0);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          employee_id: data.employee_id || "",
          displayName: data.displayName || "",
          Profilepic: data.Profilepic || "",
        });
        setStation(data.station || "");
        setMobile(data.mobile || "");
        // Calculate completeness
        const filledFieldsCount = requiredFields.reduce((count, field) => {
          return data[field] && data[field] !== "" ? count + 1 : count;
        }, 0);

        const calculatedCompleteness = Math.round(
          (filledFieldsCount / requiredFields.length) * 100
        );

        // Update state
        setComplete(calculatedCompleteness);
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    try {
      let ProfilePic = formData.Profilepic;

      // ✅ Upload photo only if new one is selected
      if (selectedPhotoFile) {
        const photoRef = ref(storage, `profilePhotos/${user.uid}`);
        await uploadBytes(photoRef, selectedPhotoFile);
        ProfilePic = await getDownloadURL(photoRef);
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        employee_id: formData.employee_id,
        displayName: formData.displayName,
        Profilepic: ProfilePic, // or formData.photoURL depending on your field
        station: station,
        mobile: mobile,
        userId: user.uid,
      });

      setMessage("Profile updated successfully!");
      navigate("/app/userprofile");
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Progress bar section */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Profile Completeness: {complete}%
        </h4>
        <ProfileProgressBar completeness={complete} />
      </div>
      <form onSubmit={handleSave}>
        <div className="space-y-12 sm:space-y-16">
          <div>
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Profile
            </h2>
            <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
              This information will be displayed publicly so be careful what you
              share.
            </p>

            <div className="sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:py-6">
              <label
                htmlFor="photo"
                className="block text-sm/6 font-medium text-gray-900 dark:text-white"
              >
                Photo
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <div className="flex items-center gap-x-3">
                  {selectedPhotoFile ? (
                    <img
                      src={URL.createObjectURL(selectedPhotoFile)}
                      alt="Selected"
                      className="h-24 w-24 rounded-full object-contain"
                    />
                  ) : formData.Profilepic ? (
                    <img
                      src={formData.Profilepic}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-contain"
                    />
                  ) : (
                    <UserCircleIcon
                      aria-hidden="true"
                      className="size-24 text-gray-300 dark:text-gray-500"
                    />
                  )}

                  <div>
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs hover:bg-gray-50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      Change
                    </label>
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setSelectedPhotoFile(file); // Don't upload yet
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Personal Information
            </h2>
            <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
              Use a permanent address where you can receive mail.
            </p>

            <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:border-t-gray-900/10 sm:pb-0 dark:border-white/10 dark:sm:divide-white/10 dark:sm:border-t-white/10">
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="first-name"
                  className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                >
                  First name
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <input
                    id="first-name"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:max-w-xs sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="last-name"
                  className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                >
                  Last name
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <input
                    id="last-name"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:max-w-xs sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                >
                  Email address
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:max-w-md sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="station"
                  className="block text-sm font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                >
                  Station
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <div className="relative sm:max-w-xs">
                    <select
                      id="station"
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      className="block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    >
                      <option value="" disabled>
                        -- Select a Station --
                      </option>
                      {stations.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon
                      className="pointer-events-none absolute right-2 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="mobile"
                  className="block text-sm font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                >
                  Mobile Number
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    value={mobile}
                    onChange={handleMobileChange}
                    //pattern="[0-9]{10}"
                    placeholder="Enter 10-digit number"
                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-600 sm:max-w-xs sm:text-sm dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-gray-500 dark:focus:ring-indigo-500"
                  />
                  {mobileError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                      {mobileError}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="employee_id"
                  className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                >
                  Employee ID
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <input
                    id="employee_id"
                    name="employee_id"
                    type="text"
                    value={formData.employee_id}
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:max-w-xs sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            onClick={() => {
              console.log("Cancel clicked");
              navigate("/app/userprofile");
            }}
            type="button"
            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            Save
          </button>
        </div>
      </form>

      {message && <h2>{message}</h2>}
    </>
  );
}
