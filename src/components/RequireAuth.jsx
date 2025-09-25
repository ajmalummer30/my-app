// src/components/RequireAuth.jsx
import { useAtomValue } from 'jotai';
import { isLoggedInAtom } from '../store/AuthAtom';
import { Navigate, Outlet } from 'react-router-dom';

export default function RequireAuth() {
  const isLoggedIn = useAtomValue(isLoggedInAtom);

  console.log("is logged in",isLoggedIn)

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
