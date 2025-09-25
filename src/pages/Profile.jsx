import { useAtom } from 'jotai';
import { userAtom } from '../store/AuthAtom';
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../components/Firebase';

export default function Profile() {
  const [user] = useAtom(userAtom);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    photoURL: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setFormData({
          displayName: data.displayName || '',
          bio: data.bio || '',
          photoURL: data.photoURL || '',
        });
      }
    };

    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        photoURL: formData.photoURL,
      });

      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>

      <label className="block mb-2">
        Display Name:
        <input
          type="text"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
      </label>

      <label className="block mb-2">
        Bio:
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
      </label>

      <label className="block mb-2">
        Photo URL:
        <input
          type="text"
          name="photoURL"
          value={formData.photoURL}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
      </label>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500"
      >
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>

      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}
