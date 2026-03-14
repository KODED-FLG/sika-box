import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Smartphone, History, Settings } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Accueil', icon: <Home className="h-5 w-5" /> },
  { to: '/vente', label: 'Vente', icon: <ShoppingBag className="h-5 w-5" /> },
  { to: '/momo', label: 'MoMo', icon: <Smartphone className="h-5 w-5" /> },
  { to: '/historique', label: 'Historique', icon: <History className="h-5 w-5" /> },
  { to: '/admin', label: 'Admin', icon: <Settings className="h-5 w-5" />, adminOnly: true },
];

export function NavigationBar() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const visibleItems = navItems.filter((item) => !item.adminOnly || user?.role === 'ADMIN');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden" role="navigation" aria-label="Navigation principale">
      <div className="flex items-center justify-around py-2">
        {visibleItems.map((item) => {
          const isActive = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors',
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground',
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
