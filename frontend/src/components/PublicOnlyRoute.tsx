import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => Boolean(state.sessionEmail));

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
