import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface RoleRouteProps {
  roles: string[];
}

export default function RoleRoute({ roles }: RoleRouteProps) {
  const user = useAuthStore((state) => state.user);

  if (!user || !roles.includes(user.role ?? '')) {
    // Redirect to the user's home page based on their role
    if (user?.role === 'solicitante') return <Navigate to="/my-requisitions" replace />;
    if (user?.role === 'executor') return <Navigate to="/executor" replace />;
    if (user?.role === 'gestor') return <Navigate to="/manager" replace />;
    if (user?.role === 'admin') return <Navigate to="/" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
