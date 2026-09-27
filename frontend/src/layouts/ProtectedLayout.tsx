import { useEffect, useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedLayout() {
  const authenticated = useAuthStore(
    (state) => Boolean(state.sessionEmail),
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return null;
  }

  return authenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace />
  );
}
