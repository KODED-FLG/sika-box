import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function RoleGuard({ role }: { role: 'ADMIN' }) {
  const user = useAuthStore((s) => s.user);

  if (user?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
